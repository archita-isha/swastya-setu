import pandas as pd
import smtplib
import imaplib
import email
from email.mime.text import MIMEText
import time
import re
import os
import requests
from datetime import datetime
from dotenv import load_dotenv

# =========================================================
# 🔧 CONFIG
# =========================================================
load_dotenv()  # reads values from a local .env file (never committed to git)

EXCEL_FILE = os.environ.get("EXCEL_FILE", "blood_donors_50.xlsx")

COL_NAME = "Name"
COL_BLOOD = "Blood Group"
COL_DAYS = "Last Donation (Days)"
COL_EMAIL = "Email"

GMAIL = os.environ.get("GMAIL_USER")
APP_PASSWORD = os.environ.get("GMAIL_APP_PASSWORD")

if not GMAIL or not APP_PASSWORD:
    raise RuntimeError(
        "Missing GMAIL_USER / GMAIL_APP_PASSWORD.\n"
        "Create a .env file in the project root (copy .env.example) and fill in "
        "a fresh Gmail App Password: https://myaccount.google.com/apppasswords"
    )

IMAP_SERVER = os.environ.get("IMAP_SERVER", "imap.gmail.com")
SMTP_SERVER = os.environ.get("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "465"))

HOSPITAL = os.environ.get("HOSPITAL_NAME", "City Blood Bank, Mysore")
CONTACT = os.environ.get("CONTACT_NUMBER", "+91XXXXXXXXXX")

BATCH_SIZE = int(os.environ.get("BATCH_SIZE", "20"))        # ✅ (Q: Gmail limit → batching)
SEND_DELAY = int(os.environ.get("SEND_DELAY", "5"))         # ✅ (Q: Gmail limit → delay)
CHECK_INTERVAL = int(os.environ.get("CHECK_INTERVAL", "30"))    # ✅ (Q: IMAP limit → safe polling)
REQUIRED_DONORS = int(os.environ.get("REQUIRED_DONORS", "2"))

RESP_FILE = "responses.csv"

SENT_EMAILS = set()
REQUEST_ID = str(int(time.time()))

# =========================================================
# 🧠 Q1: Extract Blood Group
# =========================================================
def extract_blood_group(text):
    match = re.search(r"(A|B|AB|O)[+-]", text.upper())
    return match.group() if match else None


# =========================================================
# 🧠 Q2: Filter Eligible Donors (>90 days)
# =========================================================
def get_eligible_donors(blood_group):
    df = pd.read_excel(EXCEL_FILE)
    df.columns = df.columns.str.strip()

    df[COL_BLOOD] = df[COL_BLOOD].astype(str).str.upper().str.strip()

    filtered = df[df[COL_BLOOD] == blood_group]
    eligible = filtered[filtered[COL_DAYS] > 90]

    return eligible.sort_values(by=COL_DAYS, ascending=False)


# =========================================================
# 🧠 Q3: Catchy Email + Address + Reimbursement
# =========================================================
def create_message(blood_group):
    return f"""Hello,

🩸 URGENT: {blood_group} blood required!

🚗 Travel charges will be FULLY reimbursed by the patient.

If you are willing to donate, please reply:

YES + your CURRENT ADDRESS

If unavailable, reply NO.

Contact: {CONTACT}
{HOSPITAL}
"""


# =========================================================
# 🧠 Q4: Send Email (with safe headers)
# =========================================================
def send_email(to_email, subject, body):
    try:
        msg = MIMEText(body)
        msg["Subject"] = subject
        msg["From"] = GMAIL
        msg["To"] = to_email
        msg["Reply-To"] = GMAIL  # ✅ ensures replies come back correctly

        server = smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT)
        server.login(GMAIL, APP_PASSWORD)
        server.sendmail(GMAIL, to_email, msg.as_string())
        server.quit()

        try:
            print(f"📧 Sent → {to_email}")
        except Exception:
            print(f"[MAIL] Sent -> {to_email}")
        return True

    except Exception as e:
        try:
            print(f"❌ Failed → {to_email}: {e}")
        except Exception:
            print(f"[MAIL] Failed -> {to_email}: {e}")
        return False


# =========================================================
# 🧠 Send SMS (via Textbee REST API or Local Console)
# =========================================================
def send_sms(to_phone, message):
    textbee_api_key = os.environ.get("TEXTBEE_API_KEY", "")
    if not textbee_api_key:
        # Fallback to simulated console log
        cleaned_phone = to_phone.strip()
        if not cleaned_phone.startswith("+"):
            if len(cleaned_phone) == 10:
                cleaned_phone = "+91" + cleaned_phone
            else:
                cleaned_phone = "+" + cleaned_phone
        print(f"\n[SMS GATEWAY SIMULATION] Message sent successfully to {cleaned_phone} | Message: {message}\n")
        return True
        
    try:
        url = "https://api.textbee.dev/api/v1/gateway/send-sms"
        headers = {
            "x-api-key": textbee_api_key,
            "Content-Type": "application/json"
        }
        
        # Ensure phone includes country code (e.g. +91)
        cleaned_phone = to_phone.strip()
        if not cleaned_phone.startswith("+"):
            if len(cleaned_phone) == 10:
                cleaned_phone = "+91" + cleaned_phone
            else:
                cleaned_phone = "+" + cleaned_phone
                
        payload = {
            "recipients": [cleaned_phone],
            "message": message
        }
        
        device_id = os.environ.get("TEXTBEE_DEVICE_ID", "")
        if device_id:
            payload["deviceId"] = device_id

        response = requests.post(url, json=payload, headers=headers)
        if response.status_code in [200, 201]:
            print(f"📱 [SMS GATEWAY] Message sent successfully to {cleaned_phone}")
            return True
        else:
            print(f"❌ Failed to send SMS via Textbee: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error sending SMS via Textbee: {e}")
        return False


# =========================================================
# 🧠 Send WhatsApp (Twilio / Meta Cloud API / Generic Gateway / Simulation)
# =========================================================
def send_whatsapp(to_phone, message):
    cleaned_phone = str(to_phone).strip()
    digits = "".join(filter(str.isdigit, cleaned_phone))
    if len(digits) == 10:
        intl_phone = "+91" + digits
    elif cleaned_phone.startswith("+"):
        intl_phone = cleaned_phone
    else:
        intl_phone = "+" + digits

    # 1. Twilio WhatsApp API
    twilio_sid = os.environ.get("TWILIO_ACCOUNT_SID", "").strip()
    twilio_auth = os.environ.get("TWILIO_AUTH_TOKEN", "").strip()
    twilio_from_raw = os.environ.get("TWILIO_WHATSAPP_NUMBER", "").strip()

    if twilio_sid and twilio_auth:
        from_digits = "".join(filter(str.isdigit, twilio_from_raw))
        if not from_digits:
            twilio_from = "whatsapp:+14155238886"  # Twilio Sandbox default
        else:
            twilio_from = f"whatsapp:+{from_digits}"

        whatsapp_to = f"whatsapp:{intl_phone}"
        url = f"https://api.twilio.com/2010-04-01/Accounts/{twilio_sid}/Messages.json"

        try:
            res = requests.post(
                url,
                data={
                    "From": twilio_from,
                    "To": whatsapp_to,
                    "Body": message
                },
                auth=(twilio_sid, twilio_auth)
            )
            if res.status_code in [200, 201]:
                print(f"[WHATSAPP TWILIO] Message sent successfully to {whatsapp_to}")
                return True
            else:
                print(f"[ERROR] Failed to send WhatsApp via Twilio: {res.status_code} - {res.text}")
                return False
        except Exception as e:
            print(f"[ERROR] Exception sending WhatsApp via Twilio: {e}")
            return False

    # 2. Meta WhatsApp Cloud API
    meta_token = os.environ.get("WHATSAPP_CLOUD_TOKEN", "").strip()
    meta_phone_id = os.environ.get("WHATSAPP_PHONE_NUMBER_ID", "").strip()

    if meta_token and meta_phone_id:
        url = f"https://graph.facebook.com/v18.0/{meta_phone_id}/messages"
        headers = {
            "Authorization": f"Bearer {meta_token}",
            "Content-Type": "application/json"
        }
        recipient_digits = digits if len(digits) > 10 else f"91{digits}"
        payload = {
            "messaging_product": "whatsapp",
            "to": recipient_digits,
            "type": "text",
            "text": {"body": message}
        }
        try:
            res = requests.post(url, json=payload, headers=headers)
            if res.status_code in [200, 201]:
                print(f"[WHATSAPP META] Message sent successfully to {recipient_digits}")
                return True
            else:
                print(f"[ERROR] Failed to send WhatsApp via Meta: {res.status_code} - {res.text}")
                return False
        except Exception as e:
            print(f"[ERROR] Exception sending WhatsApp via Meta: {e}")
            return False

    # 3. Generic / Custom WhatsApp Gateway (UltraMsg, Green-API, CallMeBot, etc.)
    generic_url = os.environ.get("WHATSAPP_API_URL", "").strip()
    generic_key = os.environ.get("WHATSAPP_API_KEY", "").strip()

    if generic_url:
        headers = {"Content-Type": "application/json"}
        if generic_key:
            headers["Authorization"] = f"Bearer {generic_key}"
            headers["x-api-key"] = generic_key
        payload = {
            "to": intl_phone,
            "phone": intl_phone,
            "message": message,
            "body": message
        }
        try:
            res = requests.post(generic_url, json=payload, headers=headers)
            if res.status_code in [200, 201]:
                print(f"[WHATSAPP GATEWAY] Message sent successfully to {intl_phone}")
                return True
            else:
                print(f"[ERROR] Failed to send WhatsApp via Gateway: {res.status_code} - {res.text}")
                return False
        except Exception as e:
            print(f"[ERROR] Exception sending WhatsApp via Gateway: {e}")
            return False

    # 4. Fallback: Console Simulation
    print(f"\n[WHATSAPP GATEWAY SIMULATION] Message sent successfully to whatsapp:{intl_phone} | Message: {message}\n")
    return True


# =========================================================
# 🧠 Q5: Gmail Limit Handling (Batch + Delay)
# =========================================================
def send_bulk_emails(donors, subject, message):
    for i in range(0, len(donors), BATCH_SIZE):
        batch = donors[i:i+BATCH_SIZE]

        for _, row in batch.iterrows():
            email_id = row[COL_EMAIL].lower().strip()
            send_email(email_id, subject, message)
            SENT_EMAILS.add(email_id)
            time.sleep(SEND_DELAY)  # ✅ avoid spam

        print("⏸ Waiting before next batch...")
        time.sleep(6)


# =========================================================
# 🧠 Send Bulk SMS to Eligible Donors
# =========================================================
def send_bulk_sms(donors, blood_group):
    print(f"📱 Sending bulk SMS requests for {blood_group}...")
    for _, row in donors.iterrows():
        phone = str(row.get("Phone", "")).strip()
        if phone:
            message = f"swasthya setu: urgent {blood_group} blood needed at {HOSPITAL}. Reply YES or NO."
            send_sms(phone, message)


# =========================================================
# 🧠 Send Bulk WhatsApp to Eligible Donors
# =========================================================
def send_bulk_whatsapp(donors, blood_group):
    print(f"💬 Sending bulk WhatsApp requests for {blood_group}...")
    for _, row in donors.iterrows():
        phone = str(row.get("Phone", "")).strip()
        if phone:
            message = f"swasthya setu: urgent {blood_group} blood needed at {HOSPITAL}. Reply YES or NO."
            send_whatsapp(phone, message)


# =========================================================
# ✅ GLOBAL: Track processed emails (avoid duplicates)
# =========================================================
PROCESSED_IDS = set()
PROCESSED_SMS_IDS = set()


# =========================================================
# 🧠 Q6: Read Emails (Robust Version)
# =========================================================
def read_emails():
    print("🔍 Checking inbox...")

    try:
        mail = imaplib.IMAP4_SSL(IMAP_SERVER)
        mail.login(GMAIL, APP_PASSWORD)
        mail.select("inbox")

        # ✅ Use ALL instead of UNSEEN (more reliable)
        status, messages = mail.search(None, "ALL")

        if status != "OK":
            print("❌ Failed to fetch emails")
            return []

        email_ids = messages[0].split()
        print(f"📨 Total emails in inbox: {len(email_ids)}")

        responses = []

        for eid in email_ids[-20:]:  # ✅ Only last 20 emails (efficient)
            
            if eid in PROCESSED_IDS:
                continue

            _, msg_data = mail.fetch(eid, "(RFC822)")
            raw = msg_data[0][1]

            msg = email.message_from_bytes(raw)
            subject=msg.get("Subject","")
            if  f"BLOOD-REQ-{REQUEST_ID}" not in subject:
                continue
            sender = msg.get("From", "")

            print(f"📩 Processing: {sender}")

            # ✅ Extract body safely
            body = ""

            if msg.is_multipart():
                for part in msg.walk():
                    if part.get_content_type() == "text/plain":
                        try:
                            body = part.get_payload(decode=True).decode(errors="ignore")
                            break
                        except:
                            continue
            else:
                try:
                    body = msg.get_payload(decode=True).decode(errors="ignore")
                except:
                    body = ""

            responses.append((sender, body))
            PROCESSED_IDS.add(eid)

        mail.logout()
        return responses

    except Exception as e:
        print(f"❌ IMAP Error: {e}")
        return []


# =========================================================
# 🧠 Q7: Handle Messy Replies (Smart Parsing)
# =========================================================
YES_WORDS = ["YES", "YEAH", "OK", "SURE", "READY", "I CAN"]
NO_WORDS = ["NO", "NOT", "BUSY", "CANNOT"]

def parse_response(body):
    if not body or not str(body).strip():
        return "UNKNOWN", None

    # Take first line or text before common quote markers (">", "On ... wrote:", "---")
    lines = str(body).strip().splitlines()
    first_meaningful_line = ""
    for line in lines:
        l = line.strip()
        if l and not l.startswith(">") and not l.startswith("On ") and not l.startswith("---") and not l.startswith("From:"):
            first_meaningful_line = l
            break
            
    if not first_meaningful_line:
        first_meaningful_line = lines[0].strip()

    text = first_meaningful_line.upper()

    # Remove the system prompt phrases if they were echoed back in quoted replies
    text = re.sub(r"REPLY\s+(YES|NO)\s+OR\s+(YES|NO)", " ", text)
    text = re.sub(r"YES\s+OR\s+NO", " ", text)
    text = re.sub(r"URGENT\s+[A-Z0-9\+\-]+\s+BLOOD", " ", text)

    # Clean text
    text = re.sub(r"[^A-Z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()

    # 1. Check YES first (positive willingness)
    if re.search(r"\b(YES|YEAH|SURE|READY|YESS|I CAN|WILLING)\b", text):
        # Extract address if provided after YES
        address = re.sub(r"\b(YES|YEAH|SURE|READY|YESS|I CAN|WILLING)\b", "", text).strip()
        return "YES", address if address else "NOT PROVIDED"

    # 2. Check NO (declining)
    if re.search(r"\b(NO|NOT|BUSY|CANNOT|CAN T|CANT|UNAVAILABLE)\b", text):
        return "NO", None

    return "UNKNOWN", None


# =========================================================
# 🧠 Q8: Handle Duplicate Responses & Store Donor Details (FCFS Rule)
# =========================================================
def get_donor_info(sender_id):
    """
    Looks up a donor by either email or phone number in Excel registry.
    Returns a dict: {"name": ..., "email": ..., "phone": ..., "bloodGroup": ...} or None.
    If multiple rows match, prioritizes rows that are currently in SENT_EMAILS.
    """
    if not sender_id:
        return None
        
    sender_clean = str(sender_id).lower().strip()
    digits = "".join(filter(str.isdigit, sender_clean))[-10:]
    
    try:
        df_donors = pd.read_excel(EXCEL_FILE)
        df_donors.columns = df_donors.columns.str.strip()
        
        matches = []
        for _, row in df_donors.iterrows():
            donor_email = str(row.get("Email", "")).lower().strip()
            donor_phone = "".join(filter(str.isdigit, str(row.get("Phone", ""))))[-10:]
            donor_name = str(row.get("Name", "Unknown Donor")).strip()
            donor_blood = str(row.get("Blood Group", "Unknown")).strip()
            
            # Match by email or 10-digit phone
            if (sender_clean == donor_email) or (digits and donor_phone == digits):
                info = {
                    "name": donor_name,
                    "email": donor_email,
                    "phone": str(row.get("Phone", "")).strip(),
                    "bloodGroup": donor_blood
                }
                matches.append(info)
                
        if not matches:
            return None
            
        # Priority: match in SENT_EMAILS (the currently contacted donors)
        for m in matches:
            if m["email"] in SENT_EMAILS:
                return m
                
        return matches[0]
        
    except Exception as e:
        print(f"❌ Error looking up donor for '{sender_id}': {e}")
        return None


def get_donor_by_phone(phone_str):
    info = get_donor_info(phone_str)
    return info["email"] if info else None


def save_response(email_id, response, address, donor_name=None, donor_phone=None, donor_blood=None):
    # Lookup donor details if not directly passed
    if not donor_name or not donor_phone:
        info = get_donor_info(email_id)
        if info:
            donor_name = donor_name or info.get("name")
            donor_phone = donor_phone or info.get("phone")
            donor_blood = donor_blood or info.get("bloodGroup")

    new = pd.DataFrame([{
        "Name": donor_name or "Unknown Donor",
        "Blood Group": donor_blood or "Unknown",
        "Phone": donor_phone or "N/A",
        "Email": email_id,
        "Response": response,
        "Address": address,
        "Time": datetime.now()
    }])

    if os.path.exists(RESP_FILE):
        df = pd.read_csv(RESP_FILE)

        # ✅ Only FIRST response kept (FCFS)
        if email_id in df["Email"].values:
            print(f"⚠️ Duplicate ignored: {email_id}")
            return

        df = pd.concat([df, new], ignore_index=True)
    else:
        df = new

    df.to_csv(RESP_FILE, index=False)


# =========================================================
# 🧠 Q9: Process Incoming Emails (Improved)
# =========================================================
def extract_email(sender):
    match = re.search(r"<(.+?)>", sender)
    return match.group(1).lower().strip() if match else sender.lower().strip()


def process_incoming_sms():
    textbee_api_key = os.environ.get("TEXTBEE_API_KEY", "")
    device_id = os.environ.get("TEXTBEE_DEVICE_ID", "")
    if not textbee_api_key:
        return
        
    # Poll received messages from device history
    url = "https://api.textbee.dev/api/v1/gateway/messages?direction=received"
    if device_id:
        url = f"https://api.textbee.dev/api/v1/gateway/devices/{device_id}/messages?direction=received"
        
    headers = {"x-api-key": textbee_api_key}
    
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            raw_json = response.json()
            messages = []
            if isinstance(raw_json, list):
                messages = raw_json
            elif isinstance(raw_json, dict):
                messages = raw_json.get("data", [])
                
            for m in messages:
                msg_id = m.get("_id")
                if not msg_id or msg_id in PROCESSED_SMS_IDS:
                    continue
                    
                sender = m.get("sender", "")
                body = m.get("message", "")
                
                # Check if sender is a valid donor in Excel
                donor_info = get_donor_info(sender)
                if not donor_info:
                    PROCESSED_SMS_IDS.add(msg_id)
                    continue
                    
                donor_email = donor_info["email"]
                # Ignore messages from numbers that were not contacted in the active request
                if donor_email not in SENT_EMAILS:
                    PROCESSED_SMS_IDS.add(msg_id)
                    continue
                    
                response_val, address = parse_response(body)
                print(f"📨 VALID SMS REPLY → {response_val} | {sender} ({donor_info['name']})")
                
                if response_val != "UNKNOWN":
                    save_response(
                        donor_email,
                        response_val,
                        address,
                        donor_name=donor_info["name"],
                        donor_phone=donor_info["phone"],
                        donor_blood=donor_info["bloodGroup"]
                    )
                    
                PROCESSED_SMS_IDS.add(msg_id)
                
    except Exception as e:
        print(f"❌ Error checking incoming SMS: {e}")


def process_incoming():
    # 1. Process email replies
    try:
        emails = read_emails()
        if emails:
            for sender, body in emails:
                sender_email = extract_email(sender)
                if any(x in sender_email for x in ["noreply", "no-reply", "mailer-daemon"]):
                    continue
                if sender_email not in SENT_EMAILS:
                    continue
                response, address = parse_response(body)
                donor_info = get_donor_info(sender_email)
                donor_name = donor_info["name"] if donor_info else None
                donor_phone = donor_info["phone"] if donor_info else None
                donor_blood = donor_info["bloodGroup"] if donor_info else None

                print(f"📨 VALID EMAIL REPLY → {response} | {sender_email} ({donor_name or 'Donor'})")
                if response != "UNKNOWN":
                    save_response(
                        sender_email,
                        response,
                        address,
                        donor_name=donor_name,
                        donor_phone=donor_phone,
                        donor_blood=donor_blood
                    )
        else:
            print("📭 No new email responses")
    except Exception as e:
        print(f"❌ Error processing incoming emails: {e}")

    # 2. Process SMS replies
    try:
        process_incoming_sms()
    except Exception as e:
        print(f"❌ Error processing incoming SMS: {e}")


# =========================================================
# 🧠 Process Incoming WhatsApp Message (Webhook Handler)
# =========================================================
def process_whatsapp_incoming(sender_phone, body):
    """
    Handles incoming WhatsApp messages from Twilio / Meta Webhooks.
    Maps sender phone to donor email, parses YES/NO response, and saves deduplicated response.
    """
    if not sender_phone or not body:
        return {"status": "ignored", "reason": "empty_payload"}

    # Extract clean donor info
    donor_info = get_donor_info(sender_phone)
    if not donor_info:
        print(f"⚠️ WhatsApp reply from unregistered donor phone: {sender_phone}")
        return {"status": "ignored", "reason": "unregistered_donor"}

    donor_email = donor_info["email"]
    if donor_email not in SENT_EMAILS:
        print(f"⚠️ WhatsApp reply from donor not in active request: {donor_email}")
        return {"status": "ignored", "reason": "not_in_active_request"}

    response_val, address = parse_response(body)
    print(f"📨 VALID WHATSAPP REPLY → {response_val} | {sender_phone} ({donor_info['name']})")

    if response_val != "UNKNOWN":
        save_response(
            donor_email,
            response_val,
            address,
            donor_name=donor_info["name"],
            donor_phone=donor_info["phone"],
            donor_blood=donor_info["bloodGroup"]
        )
        return {"status": "success", "donor": donor_info["name"], "email": donor_email, "response": response_val, "address": address}

    return {"status": "ignored", "reason": "unknown_response_text"}


# =========================================================
# 🧠 Q10: FCFS Selection Logic
# =========================================================
def get_selected_donors():
    df = pd.read_csv(RESP_FILE)

    df["Time"] = pd.to_datetime(df["Time"])

    # ✅ Only YES responses
    df = df[df["Response"] == "YES"]

    # ✅ IMPORTANT: Only valid donors
    df = df[df["Email"].isin(SENT_EMAILS)]

    df = df.drop_duplicates(subset="Email", keep="first")
    df = df.sort_values(by="Time", ascending=True)

    return df.head(REQUIRED_DONORS), df


# =========================================================
# 🧠 Q11: Send Selection + Rejection Messages
# =========================================================
def notify_all():
    selected, all_yes = get_selected_donors()

    selected_emails = set(selected["Email"])

    for _, row in all_yes.iterrows():
        email_id = row["Email"]

        if email_id in selected_emails:
            msg = f"""Hello,

✅ You are selected to donate blood.

📍 {HOSPITAL}

Please come as soon as possible.
🚗 Travel cost will be reimbursed.

Contact: {CONTACT}
"""
            send_email(email_id, "Selected for Blood Donation", msg)

        else:
            msg = """Hello,

🙏 Thank you for your willingness to donate.

The blood requirement has been fulfilled.

We truly appreciate your support ❤️
"""
            send_email(email_id, "Blood Requirement Fulfilled", msg)


# =========================================================
# 🚀 MAIN AGENT
# =========================================================
if os.path.exists(RESP_FILE):
    os.remove(RESP_FILE)

def run_agent():
    print("🚀 BLOOD DONOR AGENT STARTED")

    text = input("Enter request: ")
    blood_group = extract_blood_group(text)

    if not blood_group:
        print("❌ Invalid blood group")
        return

    donors = get_eligible_donors(blood_group)

    if donors.empty:
        print("❌ No eligible donors found")
        return

    subject = f"[BLOOD-REQ-{REQUEST_ID}] {blood_group} Blood Needed"
    message = create_message(blood_group)

    send_bulk_emails(donors, subject, message)

    print("📡 Listening for responses...\n")

    # ✅ Debug-safe loop
    while True:
        print("⏳ Waiting for replies...")
        
        process_incoming()

        if os.path.exists(RESP_FILE):
            df = pd.read_csv(RESP_FILE)

            yes_count = len(df[df["Response"] == "YES"])
            print(f"✅ YES responses: {yes_count}")

            if yes_count >= REQUIRED_DONORS:
                print("🎯 Enough donors found!")
                notify_all()
                break

        time.sleep(CHECK_INTERVAL)

if __name__ == "__main__":
    run_agent()