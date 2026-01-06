
import os
from fastapi import UploadFile
from io import BytesIO
from pypdf import PdfReader
from docx import Document

async def load_file_content(file: UploadFile) -> str:
    """
    Extracts text text from an UploadFile (PDF, DOCX, TXT, MD).
    """
    content = ""
    filename = file.filename.lower()
    file_bytes = await file.read()
    
    try:
        if filename.endswith(".pdf"):
            reader = PdfReader(BytesIO(file_bytes))
            text_list = []
            for page in reader.pages:
                text_list.append(page.extract_text())
            content = "\n".join(text_list)
            
        elif filename.endswith(".docx"):
            doc = Document(BytesIO(file_bytes))
            text_list = []
            for para in doc.paragraphs:
                text_list.append(para.text)
            content = "\n".join(text_list)
            
        elif filename.endswith(".txt") or filename.endswith(".md"):
            content = file_bytes.decode("utf-8", errors="ignore")
            
        else:
            # Fallback for other text-based files
            try:
                content = file_bytes.decode("utf-8", errors="ignore")
            except:
                content = ""
                
    except Exception as e:
        print(f"Error parsing file {filename}: {e}")
        return ""
        
    return content
