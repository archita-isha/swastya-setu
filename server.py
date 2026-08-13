from flask import Flask, request, jsonify
from flask_cors import CORS
import threading
import time
import os
import sys
import pandas as pd
import random
import auth_store
from dotenv import load_dotenv

load_dotenv()

# Force UTF-8 encoding for Windows console to prevent emoji crashes
if sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Import functions from main.py
import main as agent

app = Flask(__name__)
CORS(app)

# Global state to track if the agent is currently running
agent_running = False
current_request_group = None

# In-memory store for OTP registrations
# Key: email (lowercase, stripped)
# Value: { "email_otp": str, "phone_otp": str, "expires_at": float, "user_data": dict }
otp_store = {}

def background_agent_loop(blood_group):
    global agent_running
    print(f"[API] Started background agent for {blood_group}")
    
    # 1. Get Donors
    donors = agent.get_eligible_donors(blood_group)
    if donors.empty:
        print("[API] No eligible donors found")
        agent_running = False
        return

    # 2. Send initial bulk emails
    subject = f"[BLOOD-REQ-{agent.REQUEST_ID}] {blood_group} Blood Needed"
    message = agent.create_message(blood_group)
    agent.send_bulk_emails(donors, subject, message)
    
    print("[API] Listening for responses in background...")
    
    # 3. Polling Loop
    while agent_running:
        agent.process_incoming()
        
        if os.path.exists(agent.RESP_FILE):
            df = pd.read_csv(agent.RESP_FILE)
            yes_count = len(df[df["Response"] == "YES"])
            
            if yes_count >= agent.REQUIRED_DONORS:
                print("[API] Enough donors found! Notifying all.")
                agent.notify_all()
                break
                
        time.sleep(10) # Poll every 10 seconds for the API demo
        
    agent_running = False
    print("[API] Background agent loop finished.")


@app.route('/api/request', methods=['POST'])
def create_request():
    global agent_running, current_request_group
    
    data = request.json
    blood_group = data.get('bloodGroup')
    
    if not blood_group:
        return jsonify({"error": "Blood group is required"}), 400
        
    if agent_running:
        return jsonify({"error": "An agent is already processing a request"}), 400
        
    # Reset old responses
    if os.path.exists(agent.RESP_FILE):
        os.remove(agent.RESP_FILE)
        
    agent_running = True
    current_request_group = blood_group
    
    # Start the agent loop in a background thread so the HTTP request returns immediately
    thread = threading.Thread(target=background_agent_loop, args=(blood_group,))
    thread.daemon = True
    thread.start()
    
    return jsonify({"message": f"Agent started searching for {blood_group}", "status": "processing"}), 200


@app.route('/api/status', methods=['GET'])
def get_status():
    global agent_running
    
    # Check current responses
    contacted = len(agent.SENT_EMAILS)
    accepted = 0
    declined = 0
    
    if os.path.exists(agent.RESP_FILE):
        try:
            df = pd.read_csv(agent.RESP_FILE)
            accepted = len(df[df["Response"] == "YES"])
            declined = len(df[df["Response"] == "NO"])
        except Exception as e:
            pass
            
    return jsonify({
        "contacted": contacted,
        "accepted": accepted,
        "declined": declined,
        "is_running": agent_running,
        "target": agent.REQUIRED_DONORS
    }), 200


@app.route('/api/selected', methods=['GET'])
def get_selected():
    if not os.path.exists(agent.RESP_FILE):
        return jsonify([]), 200
        
    try:
        selected, _ = agent.get_selected_donors()
        if selected.empty:
            return jsonify([]), 200
            
        df_db = pd.read_excel(agent.EXCEL_FILE)
        df_db.columns = df_db.columns.str.strip()
        df_db["Email"] = df_db["Email"].astype(str).str.lower().str.strip()
        
        results = []
        for _, row in selected.iterrows():
            email_id = row["Email"].lower().strip()
            match = df_db[df_db["Email"] == email_id]
            if not match.empty:
                name = match.iloc[0]["Name"]
                blood_group = match.iloc[0]["Blood Group"]
                phone = match.iloc[0]["Phone"]
            else:
                name = "Unknown Donor"
                blood_group = "Unknown"
                phone = "N/A"
                
            results.append({
                "name": name,
                "bloodGroup": blood_group,
                "email": email_id,
                "contact": str(phone),
                "address": row["Address"] if (pd.notna(row["Address"]) and str(row["Address"]).strip() != "" and str(row["Address"]).strip().upper() != "NOT PROVIDED") else "RNSIT Campus, Bengaluru",
                "time": str(row["Time"])
            })
            
        return jsonify(results), 200
    except Exception as e:
        print(f"[API] Error fetching selected donors: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/register/send-otp', methods=['POST'])
def send_otp():
    data = request.json or {}
    name = data.get('name')
    usn = data.get('usn')
    blood_group = data.get('bloodGroup')
    email = data.get('email', '').lower().strip()
    password = data.get('password')
    phone = data.get('phone')
    is_donor = data.get('isDonor', True)

    if not name or not usn or not blood_group or not email or not password or not phone:
        return jsonify({"error": "All fields are required"}), 400

    # Server-side validation of RNSIT USN/email
    if not auth_store.is_valid_rnsit(usn, email):
        return jsonify({"error": 'Registration is open only to RNSIT students. USN must start with "1RN" and email must end with "@rnsit.ac.in".'}), 400

    if not password or len(password) < 4:
        return jsonify({"error": "Password must be at least 4 characters."}), 400

    # Check if user already exists
    users = auth_store._load_users()
    for u in users:
        if u["usn"].lower() == usn.strip().lower() or u["email"].lower() == email:
            return jsonify({"error": "An account with this USN or email is already registered. Please log in instead."}), 400

    # Generate two random 6-digit numeric OTPs
    email_otp = f"{random.randint(100000, 999999)}"
    phone_otp = f"{random.randint(100000, 999999)}"

    # Store registration data and codes with a 10-minute expiry (600s)
    otp_store[email] = {
        "email_otp": email_otp,
        "phone_otp": phone_otp,
        "expires_at": time.time() + 600,
        "user_data": {
            "name": name,
            "usn": usn,
            "bloodGroup": blood_group,
            "phone": phone,
            "password": password,
            "isDonor": is_donor
        }
    }

    # Print Phone OTP to Flask server stdout for demo
    print(f"\n[SMS GATEWAY SIMULATION] To: {phone} | Code: {phone_otp} | Message: Your Swastya Setu verification code is {phone_otp}. Valid for 10 minutes.\n")

    # Send Email OTP using agent.send_email
    subject = "[Swastya Setu] Email Verification OTP"
    body = f"""Hello {name},

Thank you for joining Swastya Setu!

Your Email Verification Code is: {email_otp}

This code is valid for 10 minutes. Please enter this code and the SMS code in the registration form to verify your account.

Regards,
Swastya Setu Team
"""
    email_sent = agent.send_email(email, subject, body)

    if not email_sent:
        return jsonify({"error": "Failed to send verification email. Please check your credentials."}), 500

    return jsonify({"message": "Verification codes sent successfully!"}), 200


@app.route('/api/register/verify-otp', methods=['POST'])
def verify_otp():
    data = request.json or {}
    email = data.get('email', '').lower().strip()
    email_otp = data.get('emailOtp', '').strip()
    phone_otp = data.get('phoneOtp', '').strip()

    if not email or not email_otp or not phone_otp:
        return jsonify({"error": "Email and both OTP codes are required"}), 400

    record = otp_store.get(email)
    if not record:
        return jsonify({"error": "No verification session found for this email. Please request a new OTP."}), 400

    # Verify expiration (10 minutes)
    if time.time() > record["expires_at"]:
        # Clean up expired record
        otp_store.pop(email, None)
        return jsonify({"error": "OTP has expired. Please request a new one."}), 400

    # Verify codes
    if record["email_otp"] != email_otp or record["phone_otp"] != phone_otp:
        return jsonify({"error": "Invalid verification codes. Please try again."}), 400

    # Save to auth_store (users.json)
    user_data = record["user_data"]
    result = auth_store.register_user(
        name=user_data["name"],
        usn=user_data["usn"],
        email=email,
        password=user_data["password"],
        blood_group=user_data["bloodGroup"],
        donor=user_data["isDonor"]
    )

    if not result['success']:
        return jsonify({"error": result['error']}), 400

    # Verification successful! Create user (append to Excel if registering as donor)
    if user_data["isDonor"]:
        try:
            excel_path = agent.EXCEL_FILE
            
            # Read existing
            if os.path.exists(excel_path):
                df = pd.read_excel(excel_path)
            else:
                df = pd.DataFrame(columns=["Name", "Blood Group", "Last Donation (Days)", "Phone", "Email"])

            # Clean columns
            df.columns = df.columns.str.strip()

            # Check if email already exists in donor registry
            df["Email_Clean"] = df["Email"].astype(str).str.lower().str.strip()
            if email in df["Email_Clean"].values:
                df = df.drop(columns=["Email_Clean"])
                # Just succeed if already a donor
            else:
                df = df.drop(columns=["Email_Clean"])
                # Append new row
                new_row = pd.DataFrame([{
                    "Name": user_data["name"],
                    "Blood Group": user_data["bloodGroup"],
                    "Last Donation (Days)": 95, # Eligible default (>90)
                    "Phone": user_data["phone"],
                    "Email": email
                }])
                df = pd.concat([df, new_row], ignore_index=True)
                df.to_excel(excel_path, index=False)
                print(f"[SERVER] Registered new donor: {user_data['name']} ({email})")
                
        except Exception as e:
            print(f"[SERVER] Error appending donor to Excel: {e}")
            return jsonify({"error": f"Failed to save donor record: {e}"}), 500

    # Clean up verification session
    otp_store.pop(email, None)

    return jsonify({"message": "Registration successful!", "status": "verified"}), 200


@app.route('/api/login', methods=['POST'])
def login():
    data = request.json or {}
    identifier = data.get('identifier', '')
    password = data.get('password', '')

    if not identifier or not password:
        return jsonify({"error": "USN/email and password are required"}), 400

    result = auth_store.verify_login(identifier, password)

    if not result['success']:
        return jsonify({"error": result['error']}), 401

    return jsonify({"message": "Login successful", "user": result['user']}), 200


if __name__ == '__main__':
    PORT = int(os.environ.get("PORT", 5000))
    print(f"[SERVER] SWASTYA SETU API SERVER STARTED ON PORT {PORT}")
    app.run(port=PORT, debug=True, use_reloader=False)
