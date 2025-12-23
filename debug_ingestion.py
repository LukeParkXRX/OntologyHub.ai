
import os
import sys
import json
# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from backend.parser.extractor import extract_graph_elements
from dotenv import load_dotenv

load_dotenv(os.path.join(os.getcwd(), 'backend/.env'))

print("Starting extraction test...")
try:
    text = "나는 어제 한강에서 자전거를 탔어. 너무 상쾌했어."
    result = extract_graph_elements(text)
    print("Extraction Result:")
    print(json.dumps(result, indent=2, ensure_ascii=False))
except Exception as e:
    print(f"Extraction failed: {e}")
