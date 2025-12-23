import requests
import io

def create_dummy_pdf():
    # minimalist PDF header/body/trailer to valid PDF? 
    # Or just use fpdf/reportlab? 
    # Or strict binary content that PyMuPDF accepts?
    # PyMuPDF is robust, but expects PDF structure.
    # Let's try sending a simple text file renamed as pdf? No, routes check content-type but PyMuPDF needs valid PDF.
    
    # Let's simple binary string for a valid empty PDF 1.4
    pdf_content = (
        b"%PDF-1.4\n"
        b"1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
        b"2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n"
        b"3 0 obj<</Type/Page/MediaBox[0 0 595 842]/Parent 2 0 R/Resources<<>>>>endobj\n"
        b"xref\n"
        b"0 4\n"
        b"0000000000 65535 f\n"
        b"0000000010 00000 n\n"
        b"0000000053 00000 n\n"
        b"0000000102 00000 n\n"
        b"trailer<</Size 4/Root 1 0 R>>\n"
        b"startxref\n"
        b"178\n"
        b"%%EOF\n"
    )
    return pdf_content

def test_api_upload():
    url = "http://localhost:8000/api/upload"
    
    # Create valid dummy PDF
    pdf_bytes = create_dummy_pdf()
    
    files = {
        'file': ('test.pdf', pdf_bytes, 'application/pdf')
    }
    
    print(f"Sending POST to {url}...")
    try:
        resp = requests.post(url, files=files)
        print(f"Status Code: {resp.status_code}")
        print(f"Response Body: {resp.text}")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_api_upload()
