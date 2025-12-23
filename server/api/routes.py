from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import ValidationError
from models.workflow import WorkflowExecuteRequest, WorkflowResponse
from services.workflow_engine import execute_workflow
from services.document_processor import extract_text_from_pdf, chunk_text
from services.vector_store import add_documents
import uuid

router = APIRouter()

@router.post("/run_workflow", response_model=WorkflowResponse)
async def run_workflow(request: WorkflowExecuteRequest):
    try:
        response = await execute_workflow(request.workflow, request.user_query)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDFs are supported")
    
    content = await file.read()

    try:
        text = extract_text_from_pdf(content)
    except Exception as e:
         raise HTTPException(status_code=500, detail=f"PDF Processing Error: {e}")

    if not text:
        raise HTTPException(status_code=400, detail="Failed to extract text. The PDF might be a scanned image or empty. Please upload a text-based PDF.")
        
    chunks = chunk_text(text)
    
    # Store in Chroma
    ids = [str(uuid.uuid4()) for _ in chunks]
    metadatas = [{"source": file.filename} for _ in chunks]
    
    try:
        await add_documents(documents=chunks, metadatas=metadatas, ids=ids)
    except Exception as e:
         raise HTTPException(status_code=500, detail=f"Error storing embeddings: {e}")

    return {"message": "File processed and indexed successfully", "chunks": len(chunks)}
