from fpdf import FPDF
import os

pdf = FPDF()
pdf.add_page()
pdf.set_font("Arial", size=12)
pdf.cell(200, 10, txt="PROJECT DOCUMENTATION", ln=1, align="C")
pdf.multi_cell(0, 10, txt="This project is a No-Code LLM Workflow Builder. It allows users to chain AI components together visually.\n\nAI & LLMs: Large Language Models are robust AI systems capable of understanding and generating human text. This project uses them to answer queries based on this very document.\n\nIMPLEMENTATION: Built using React Flow (Frontend), FastAPI (Backend), and ChromaDB (Vector Store). The system uses RAG to retrieve this text and answer your questions.")

output_path = r"C:\Users\Maya\work\KnowledgeBase\test_data.pdf"
pdf.output(output_path)
print(f"Created {output_path}")
