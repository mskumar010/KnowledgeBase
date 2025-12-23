import fitz  # PyMuPDF
import io

def extract_text_from_pdf(file_content: bytes) -> str:
    """Extracts text from a PDF file content."""
    text = ""
    try:
        with fitz.open(stream=file_content, filetype="pdf") as doc:
            for page in doc:
                text += page.get_text()
    except Exception as e:
        print(f"Error extracting PDF: {e}")
        return ""
    
    if not text.strip():
        # Scanned PDF or Image-only
        print("Warning: PDF extracted text is empty (possibly scanned)")
        return ""

    return text

def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 100) -> list[str]:
    """Splits text into chunks with overlap."""
    if not text:
        return []
    
    chunks = []
    start = 0
    text_len = len(text)
    
    while start < text_len:
        end = min(start + chunk_size, text_len)
        chunks.append(text[start:end])
        start += (chunk_size - overlap)
        
    return chunks
