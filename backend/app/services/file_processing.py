import io
import pandas as pd
from pypdf import PdfReader
from docx import Document as DocxDocument
from fastapi import UploadFile, HTTPException
from typing import Optional
from .ingestion import ingestion_service
# Image handling imports
import base64
from langchain_core.messages import HumanMessage
from ..config import settings

class FileProcessingService:
    async def process_file(self, file: UploadFile):
        """
        Determines file type and extracts text, then sends to ingestion service.
        """
        filename = file.filename.lower()
        content = await file.read()
        file_obj = io.BytesIO(content)
        
        text = ""
        
        try:
            if filename.endswith(".pdf"):
                text = self._extract_pdf(file_obj)
            elif filename.endswith(".xlsx") or filename.endswith(".xls"):
                text = self._extract_excel(file_obj)
            elif filename.endswith(".docx"):
                text = self._extract_docx(file_obj)
            elif filename.endswith(".txt") or filename.endswith(".md"):
                text = content.decode("utf-8")
            elif filename.endswith((".png", ".jpg", ".jpeg")):
                text = await self._extract_image(content, file.content_type)
            else:
                raise HTTPException(status_code=400, detail=f"Unsupported file type: {filename}")
                
            if not text.strip():
                raise HTTPException(status_code=400, detail="Could not extract text from file.")
                
            # Pass metadata about the file
            metadata = {"source": filename, "type": "file_upload"}
            
            # Use existing ingestion service to process the extracted text
            return await ingestion_service.process_text_to_graph(text, metadata)
            
        except Exception as e:
            print(f"❌ File processing failed: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    def _extract_pdf(self, file_obj) -> str:
        reader = PdfReader(file_obj)
        text = ""
        for page in reader.pages:
            extract = page.extract_text()
            if extract:
                text += extract + "\n"
        return text

    def _extract_excel(self, file_obj) -> str:
        # Read all sheets
        xls = pd.ExcelFile(file_obj)
        text = ""
        for sheet_name in xls.sheet_names:
            df = pd.read_excel(xls, sheet_name=sheet_name)
            text += f"Sheet: {sheet_name}\n"
            # Convert to distinct strings per row to keep context
            text += df.to_string(index=False) + "\n\n"
        return text

    def _extract_docx(self, file_obj) -> str:
        doc = DocxDocument(file_obj)
        text = "\n".join([para.text for para in doc.paragraphs])
        return text

    async def _extract_image(self, content: bytes, content_type: str) -> str:
        # Use GPT-4o-mini Vision if key is available
        if not settings.OPENAI_API_KEY:
            return "[Error: Image processing requires OPENAI_API_KEY]"
        
        try:
            encoded_image = base64.b64encode(content).decode('utf-8')
            
            # We need a temporary LLM instance for vision just here
            from langchain_openai import ChatOpenAI
            vision_llm = ChatOpenAI(model="gpt-4o-mini", api_key=settings.OPENAI_API_KEY)
            
            message = HumanMessage(
                content=[
                    {"type": "text", "text": "Extract all text and meaningful details from this image to creating a knowledge graph."},
                    {"type": "image_url", "image_url": {"url": f"data:{content_type};base64,{encoded_image}"}}
                ]
            )
            
            response = await vision_llm.ainvoke([message])
            return response.content
        except Exception as e:
            return f"[Error processing image: {str(e)}]"

file_processing_service = FileProcessingService()
