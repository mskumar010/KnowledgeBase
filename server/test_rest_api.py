import requests
import os
import json
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

def test_generate():
    print("Testing gemini-2.0-flash generation...")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
    headers = {'Content-Type': 'application/json'}
    data = {
        "contents": [{
            "parts": [{"text": "Hello, simply say 'API WORKS'."}]
        }]
    }
    
    try:
        resp = requests.post(url, headers=headers, json=data)
        print(f"Status: {resp.status_code}")
        print(f"Body: {resp.text}")
        if resp.status_code == 200:
            print("SUCCESS")
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    test_generate()
