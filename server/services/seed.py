from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.stack import Stack
import uuid
import logging
from services.vector_store import add_documents, query_documents
from services.document_processor import chunk_text

async def seed_vectors():
    """Seeds the vector database with test data if it doesn't exist."""
    print("Checking vector store for seed data...")
    try:
        # Check if test.pdf data exists
        # query_documents returns a list of strings if found, or empty list
        results = await query_documents(query_text="test", n_results=1, where={"source": "test.pdf"})
        if results:
            print("Vector store already seeded with test.pdf.")
            return

        print("Seeding vector store with test.pdf data...")
        
        # Dummy content for test.pdf
        text = """
        PROJECT OVERVIEW:
        This project is a No-Code/Low-Code LLM Workflow Builder designed to allow users to visually create intelligent AI pipelines.
        It integrates advanced technologies including React Flow for the visual interface, FastAPI for the backend orchestration, and ChromaDB for vector storage.
        
        ABOUT AI & LLMs:
        Artificial Intelligence (AI) refers to the simulation of human intelligence in machines.
        Large Language Models (LLMs) like GPT-4, Gemini, and Llama 3 are deep learning algorithms that can recognize, summarize, translate, predict, and generate text based on knowledge gained from massive datasets.
        
        HOW THIS PROJECT WAS BUILT:
        1. Frontend: Built with React.js and TypeScript, utilizing React Flow for the drag-and-drop canvas.
        2. Backend: Powered by Python's FastAPI, managing the execution logic of the node graph.
        3. RAG Pipeline: Implements Retrieval-Augmented Generation. Documents are uploaded, chunked, and embedded into a vector database (ChromaDB).
        4. Integration: The system connects to external APIs like OpenAI, Google Gemini, and Groq to provide intelligence.
        """
        
        chunks = chunk_text(text)
        ids = [str(uuid.uuid4()) for _ in chunks]
        metadatas = [{"source": "test.pdf"} for _ in chunks]
        
        await add_documents(documents=chunks, metadatas=metadatas, ids=ids)
        print("Vector store seeded successfully.")
        
    except Exception as e:
        print(f"Failed to seed vector store: {e}")

async def seed_db(db: AsyncSession):
    # Seed Vectors first
    await seed_vectors()

    logging.info("Checking if database needs seeding...")
    result = await db.execute(select(Stack))
    existing_stacks = result.scalars().all()
    
    if existing_stacks:
        logging.info("Stacks exist. Skipping stack seeding.")
        return

    logging.info("No stacks found. Seeding default stacks...")
    
    default_stacks = [
        Stack(
            id=str(uuid.uuid4()),
            name="Demo Stack",
            description="A pre-built workflow to chat with your PDF.",
            nodes=[
                {"id": "1", "type": "userQuery", "position": {"x": 50, "y": 100}, "data": {"label": "User Query"}},
                {"id": "4", "type": "knowledgeBase", "position": {"x": 450, "y": 100}, "data": {"label": "Knowledge Base", "config": {"fileName": "test.pdf"}}},
                {"id": "2", "type": "llmEngine", "position": {"x": 850, "y": 100}, "data": {"label": "LLM Engine", "config": {"model": "gpt-4o"}}},
                {"id": "3", "type": "output", "position": {"x": 1250, "y": 100}, "data": {"label": "Output"}}
            ],
            edges=[
                {"id": "e1-4", "source": "1", "target": "4", "type": "default", "markerEnd": {"type": "arrowclosed"}},
                {"id": "e4-2", "source": "4", "target": "2", "type": "default", "markerEnd": {"type": "arrowclosed"}},
                {"id": "e2-3", "source": "2", "target": "3", "type": "default", "markerEnd": {"type": "arrowclosed"}}
            ]
        ),
        Stack(
            id=str(uuid.uuid4()),
            name="Chat With AI",
            description="Chat with a smart AI using OpenAI or Gemini",
            nodes=[
                {"id": "1", "type": "userQuery", "position": {"x": 100, "y": 100}, "data": {"label": "User Input"}},
                {"id": "2", "type": "llmEngine", "position": {"x": 500, "y": 100}, "data": {"label": "LLM Engine", "config": {"model": "gpt-4o"}}},
                {"id": "3", "type": "output", "position": {"x": 900, "y": 100}, "data": {"label": "Output"}}
            ],
            edges=[
                {"id": "e1-2", "source": "1", "target": "2"},
                {"id": "e2-3", "source": "2", "target": "3"}
            ]
        ),
        Stack(
            id=str(uuid.uuid4()),
            name="Content Writer",
            description="Helps you write content from keywords",
             nodes=[
                {"id": "1", "type": "userQuery", "position": {"x": 100, "y": 100}, "data": {"label": "Topic Input"}},
                {"id": "2", "type": "llmEngine", "position": {"x": 500, "y": 100}, "data": {"label": "Writer Engine", "config": {"model": "gemini-2.0-flash", "system_prompt": "You are a professional blog post writer."}}},
                {"id": "3", "type": "output", "position": {"x": 900, "y": 100}, "data": {"label": "Draft Output"}}
            ],
            edges=[
                {"id": "e1-2", "source": "1", "target": "2"},
                {"id": "e2-3", "source": "2", "target": "3"}
            ]
        ),
        # Removed RAG System to avoid confusion with Demo Stack or just keep it
    ]
    
    db.add_all(default_stacks)
    await db.commit()
    logging.info("Seeding complete.")
