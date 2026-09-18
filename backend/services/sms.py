import os
import requests
from dotenv import load_dotenv

load_dotenv()

SMS_API_KEY = os.getenv("SMS_API_KEY")
SMS_API_SECRET = os.getenv("SMS_API_SECRET")
SMS_SENDER_ID = os.getenv("SMS_SENDER_ID", "TRACE")

def sendSMS(to: str, message: str):
    """
    Generic SMS sending function.
    Adjust the payload depending on your specific SMS provider (e.g., Fast2SMS, Twilio).
    """
    if not SMS_API_KEY:
        print(f"SIMULATED SMS to {to}: {message}")
        return {"status": "simulated"}

    print(f"Sending SMS to {to}: {message}")
    
    # Example Fast2SMS format (common in India)
    url = "https://www.fast2sms.com/dev/bulkV2"
    headers = {
        "authorization": SMS_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded"
    }
    payload = {
        "sender_id": "TXTIND", # Or your sender ID
        "message": message,
        "route": "v3",
        "numbers": to
    }
    
    try:
        response = requests.post(url, data=payload, headers=headers)
        print("SMS API Response:", response.json())
        return response.json()
    except Exception as e:
        print("Failed to send SMS:", e)
        return {"error": str(e)}

def send_otp(phone: str, otp: str):
    message = f"Your T.R.A.C.E. officer login OTP is {otp}. Do not share this with anyone."
    return sendSMS(phone, message)

def send_warning(phone: str, plate: str, reason: str, location: str, time: str, count: int):
    message = f"T.R.A.C.E. NOTICE: Your vehicle {plate} was flagged for {reason} at {location}, {time}. This is warning {count}/2. A further violation will result in an e-challan."
    return sendSMS(phone, message)

def send_challan(phone: str, plate: str, reason: str, amount: float, challan_id: int):
    message = f"T.R.A.C.E. CHALLAN: Vehicle {plate} fined Rs.{amount} for {reason}. Challan ID: {challan_id}."
    return sendSMS(phone, message)
