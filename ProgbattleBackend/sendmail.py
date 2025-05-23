import smtplib
from email.message import EmailMessage
from itsdangerous import URLSafeTimedSerializer
import os
from dotenv import load_dotenv
load_dotenv()
FRONTEND_URL = os.environ.get("FRONTEND_URL")
SMTP_USER = os.environ.get("SMTP_USER")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD")
SECRET_KEY = os.environ.get("SECRET_KEY")
SMTP_SERVER = os.environ.get("SMTP_SERVER")
print(f"SMTP_USER: {SECRET_KEY}")
serializer = URLSafeTimedSerializer(os.environ.get("SECRET_KEY"))

def generate_verification_token(email: str) -> str:
    return serializer.dumps(email, salt="email-confirm")

def confirm_verification_token(token, expiration=3600):
    try:
        email = serializer.loads(token, salt="email-confirm", max_age=expiration)
    except Exception:
        return None
    return email
