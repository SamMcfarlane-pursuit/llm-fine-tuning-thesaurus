import requests
import json

def test_ask_api():
    url = "http://localhost:5002/api/ask"
    headers = {"Content-Type": "application/json"}
    data = {"question": "What is LoRA?"}
    
    try:
        response = requests.post(url, headers=headers, json=data)
        print(f"Status code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_ask_api()
