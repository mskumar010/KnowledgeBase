import asyncio
from database import async_session
from sqlalchemy.future import select
from models.stack import Stack
import uuid
import logging

# Configure logging to suppress verbose SQLAlchmey output for this script
logging.basicConfig(level=logging.INFO)
logging.getLogger('sqlalchemy.engine').setLevel(logging.WARNING)

async def force_seed():
    async with async_session() as session:
        result = await session.execute(select(Stack))
        existing_stacks = result.scalars().all()
        print(f"Current Stacks: {len(existing_stacks)}")
        
        # Check against stack names
        existing_names = [s.name for s in existing_stacks]
        defaults = [
            ("Chat With AI", "Chat with a smart AI using OpenAI or Gemini", "gpt-4o"),
            ("Content Writer", "Helps you write content from keywords", "gemini-2.0-flash"),
            ("RAG System", "Search documents and answer questions", "gpt-4o")
        ]
        
        added_count = 0
        for name, desc, model in defaults:
            if name not in existing_names:
                print(f"Seeding '{name}'...")
                nodes = []
                # Simple logic to generate nodes based on type
                if name == "RAG System":
                     nodes = [
                        {"id": "1", "type": "userQuery", "position": {"x": 50, "y": 200}, "data": {"label": "Question"}},
                        {"id": "2", "type": "knowledgeBase", "position": {"x": 400, "y": 50}, "data": {"label": "Company Docs"}},
                        {"id": "3", "type": "llmEngine", "position": {"x": 800, "y": 200}, "data": {"label": "RAG Engine", "config": {"model": model}}},
                        {"id": "4", "type": "output", "position": {"x": 1200, "y": 200}, "data": {"label": "Answer"}}
                    ]
                     edges = [
                        {"id": "e1-3", "source": "1", "target": "3"},
                        {"id": "e2-3", "source": "2", "target": "3"},
                        {"id": "e3-4", "source": "3", "target": "4"}
                    ]
                else:
                    nodes = [
                        {"id": "1", "type": "userQuery", "position": {"x": 100, "y": 100}, "data": {"label": "Input"}},
                        {"id": "2", "type": "llmEngine", "position": {"x": 500, "y": 100}, "data": {"label": "LLM", "config": {"model": model}}},
                        {"id": "3", "type": "output", "position": {"x": 900, "y": 100}, "data": {"label": "Output"}}
                    ]
                    edges = [
                        {"id": "e1-2", "source": "1", "target": "2"},
                        {"id": "e2-3", "source": "2", "target": "3"}
                    ]

                new_stack = Stack(
                    id=str(uuid.uuid4()),
                    name=name,
                    description=desc,
                    nodes=nodes,
                    edges=edges
                )
                session.add(new_stack)
                added_count += 1
        
        if added_count > 0:
            await session.commit()
            print(f"Successfully added {added_count} stacks.")
        else:
            print("All default stacks already exist.")

if __name__ == "__main__":
    asyncio.run(force_seed())
