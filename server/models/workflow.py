from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class NodeData(BaseModel):
    label: str = "Node"
    # Dynamic configuration for the node (e.g., prompt, file_id)
    config: Dict[str, Any] = Field(default_factory=dict)

class Node(BaseModel):
    id: str
    type: str # 'userQuery', 'llmEngine', 'knowledgeBase', 'output'
    position: Dict[str, float]
    data: NodeData

class Edge(BaseModel):
    id: str
    source: str
    target: str

class WorkflowDefinition(BaseModel):
    nodes: List[Node]
    edges: List[Edge]

class WorkflowExecuteRequest(BaseModel):
    workflow: WorkflowDefinition
    user_query: str

class WorkflowResponse(BaseModel):
    answer: str
    logs: List[str] = []

class StackBase(BaseModel):
    name: str
    description: Optional[str] = None

class StackCreate(StackBase):
    pass

class StackUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    nodes: Optional[List[Dict[str, Any]]] = None
    edges: Optional[List[Dict[str, Any]]] = None

class StackResponse(StackBase):
    id: str
    nodes: List[Dict[str, Any]] = []
    edges: List[Dict[str, Any]] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

