from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
from database import get_db
from models.stack import Stack
from models.workflow import StackCreate, StackUpdate, StackResponse
from typing import List

router = APIRouter()

@router.get("/", response_model=List[StackResponse])
async def get_stacks(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Stack).order_by(Stack.updated_at.desc()))
    stacks = result.scalars().all()
    return stacks

@router.post("/", response_model=StackResponse)
async def create_stack(stack: StackCreate, db: AsyncSession = Depends(get_db)):
    
    nodes = []
    edges = []
    
    # Pre-configure Demo Stack
    if stack.name.lower() == "demo stack":
        nodes = [
            {"id": "1", "type": "userQuery", "position": {"x": 50, "y": 100}, "data": {"label": "User Query"}},
            {"id": "4", "type": "knowledgeBase", "position": {"x": 450, "y": 100}, "data": {"label": "Knowledge Base", "config": {"fileName": "test.pdf"}}},
            {"id": "2", "type": "llmEngine", "position": {"x": 850, "y": 100}, "data": {"label": "LLM Engine", "config": {"model": "gpt-4o"}}},
            {"id": "3", "type": "output", "position": {"x": 1250, "y": 100}, "data": {"label": "Output"}}
        ]
        edges = [
            {"id": "e1-4", "source": "1", "target": "4", "type": "default", "markerEnd": {"type": "arrowclosed"}},
            {"id": "e4-2", "source": "4", "target": "2", "type": "default", "markerEnd": {"type": "arrowclosed"}},
            {"id": "e2-3", "source": "2", "target": "3", "type": "default", "markerEnd": {"type": "arrowclosed"}}
        ]

    new_stack = Stack(
        name=stack.name,
        description=stack.description,
        nodes=nodes,
        edges=edges
    )
    db.add(new_stack)
    await db.commit()
    await db.refresh(new_stack)
    return new_stack

@router.get("/{stack_id}", response_model=StackResponse)
async def get_stack(stack_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Stack).where(Stack.id == stack_id))
    stack = result.scalar_one_or_none()
    if not stack:
        raise HTTPException(status_code=404, detail="Stack not found")
    return stack

@router.put("/{stack_id}", response_model=StackResponse)
async def update_stack(stack_id: str, stack_update: StackUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Stack).where(Stack.id == stack_id))
    stack = result.scalar_one_or_none()
    if not stack:
        raise HTTPException(status_code=404, detail="Stack not found")
    
    if stack_update.name is not None:
        stack.name = stack_update.name
    if stack_update.description is not None:
        stack.description = stack_update.description
    if stack_update.nodes is not None:
        stack.nodes = stack_update.nodes
    if stack_update.edges is not None:
        stack.edges = stack_update.edges
        
    await db.commit()
    await db.refresh(stack)
    return stack

@router.delete("/{stack_id}")
async def delete_stack(stack_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Stack).where(Stack.id == stack_id))
    stack = result.scalar_one_or_none()
    if not stack:
        raise HTTPException(status_code=404, detail="Stack not found")
        
    await db.delete(stack)
    await db.commit()
    return {"message": "Stack deleted successfully"}
