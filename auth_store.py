"""
Simple file-based user store for Swasthya Setu.

Stores registered users in users.json (in the project root) so that
everyone running the backend shares the same set of registered users,
instead of each browser having its own separate localStorage copy.

Passwords are hashed with werkzeug's generate_password_hash — never
stored in plain text.
"""

import json
import os
import threading
from werkzeug.security import generate_password_hash, check_password_hash

USERS_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "users.json")
_lock = threading.Lock()


def _load_users():
    if not os.path.exists(USERS_FILE):
        return []
    try:
        with open(USERS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return []


def _save_users(users):
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(users, f, indent=2)


def is_valid_rnsit(usn, email):
    """Server-side check — mirrors the frontend validation, but this is
    the one that actually matters since the frontend can be bypassed."""
    usn_ok = usn.strip().upper().startswith("1RN")
    email_ok = email.strip().lower().endswith("@rnsit.ac.in")
    return usn_ok and email_ok


def register_user(name, usn, email, password, blood_group, donor):
    usn = usn.strip()
    email = email.strip()

    if not is_valid_rnsit(usn, email):
        return {"success": False, "error": 'USN must start with "1RN" and email must end with "@rnsit.ac.in".'}

    if not password or len(password) < 4:
        return {"success": False, "error": "Password must be at least 4 characters."}

    with _lock:
        users = _load_users()

        for u in users:
            if u["usn"].lower() == usn.lower() or u["email"].lower() == email.lower():
                return {"success": False, "error": "An account with this USN or email is already registered. Please log in instead."}

        users.append({
            "name": name.strip(),
            "usn": usn,
            "email": email,
            "password_hash": generate_password_hash(password),
            "blood_group": blood_group,
            "donor": bool(donor),
        })
        _save_users(users)

    return {"success": True}


def verify_login(identifier, password):
    identifier = identifier.strip().lower()

    with _lock:
        users = _load_users()

    user = next(
        (u for u in users if u["usn"].lower() == identifier or u["email"].lower() == identifier),
        None,
    )

    if not user:
        return {"success": False, "error": "No account found for this USN/email. Please register first."}

    if not check_password_hash(user["password_hash"], password):
        return {"success": False, "error": "Incorrect password. Please try again."}

    return {
        "success": True,
        "user": {
            "name": user["name"],
            "usn": user["usn"],
            "email": user["email"],
            "blood_group": user["blood_group"],
            "donor": user["donor"],
        },
    }
