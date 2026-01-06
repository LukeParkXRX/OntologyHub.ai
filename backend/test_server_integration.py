import requests
import time
import subprocess
import sys
import os

# Start Server in background
server_process = subprocess.Popen(
    [sys.executable, "-m", "uvicorn", "server:app", "--port", "8000"],
    cwd=os.getcwd(),
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE
)

print("Starting server...")
time.sleep(5) # Wait for startup

BASE_URL = "http://localhost:8000"

def run_tests():
    try:
        # 1. Test Ingest
        print("\n--- Testing /ingest ---")
        ingest_payload = {"text": "Jinsu likes coding in Python."}
        res = requests.post(f"{BASE_URL}/ingest", json=ingest_payload)
        print(f"Status: {res.status_code}")
        print(f"Response: {res.json()}")
        
        if res.status_code != 200:
            print("❌ Ingest Failed")
            return

        # 2. Test Chat
        print("\n--- Testing /chat ---")
        chat_payload = {"message": "What does Jinsu like?"}
        res = requests.post(f"{BASE_URL}/chat", json=chat_payload)
        print(f"Status: {res.status_code}")
        print(f"Response: {res.json()}")
        
        if res.status_code != 200:
            print("❌ Chat Failed")
            return
            
        # 3. Test Graph Data
        print("\n--- Testing /graph ---")
        res = requests.get(f"{BASE_URL}/graph")
        print(f"Status: {res.status_code}")
        data = res.json()
        print(f"Nodes: {len(data['nodes'])}, Links: {len(data['links'])}")
        
        if len(data['nodes']) > 0:
            print("✅ Graph Data Retrieved Successfully")
        else:
            print("⚠️ Graph is empty (might be expected if DB was wiped)")

    except Exception as e:
        print(f"Test Error: {e}")
    finally:
        print("Terminating server...")
        server_process.terminate()

if __name__ == "__main__":
    run_tests()
