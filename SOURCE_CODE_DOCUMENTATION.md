# Source Code Documentation

This document provides a comprehensive overview of the **No-Code LLM Workflow Builder** codebase. It details the project structure, key components, and their interactions to help developers understand the system's architecture and flow.

## 1. Project Structure Overview

The project is organized as a monorepo containing both the frontend and backend.

```
KnowledgeBase/
├── client/                 # React Frontend (Vite)
│   ├── src/
│   │   ├── features/       # Feature-based modules (Chat, Workflow, Dashboard)
│   │   ├── store/          # Global State Management (Zustand)
│   │   ├── api/            # Axios API client setup
│   │   └── ...
├── server/                 # FastAPI Backend (Python)
│   ├── api/                # API Routes (Endpoints)
│   ├── services/           # Core Logic (Workflow Engine, RAG, Seeding)
│   ├── models/             # Database Models (SQLAlchemy)
│   ├── database.py         # DB Connection & Session Management
│   └── main.py             # Application Entry Point
└── docker-compose.yml      # Container Orchestration
```

---

## 2. Server Architecture (`server/`)

The backend is built with **FastAPI**, designed to be asynchronous and scalable.

### 2.1 API Layer (`api/`)

This layer handles incoming HTTP requests, validates input using Pydantic models, and calls the appropriate services.

- **`routes.py`**: Handles general functional endpoints like Chat (`/chat`) and File Upload (`/upload`). It acts as the bridge between the frontend chat interface and the `WorkflowEngine`.
- **`stacks.py`**: Manages CRUD operations for "Stacks" (workflows). It interfaces with the PostgreSQL database to save and retrieve stack configurations (`nodes`, `edges`, etc.).

### 2.2 Service Layer (`services/`)

This layer contains the business logic and heavy lifting.

- **`workflow_engine.py`**: The core execution engine.
  - _Role_: Parses the JSON graph of a stack, determines the execution order (topological sort), and executes nodes.
  - _Key Function_: `run_workflow(stack, initial_inputs)`. It iterates through nodes, managing context and data flow between them.
- **`vector_store.py`**: Manages the RAG (Retrieval Augmented Generation) pipeline.
  - _Role_: Interfaces with **ChromaDB**. It handles adding documents (chunking + embedding) and querying them for relevant context during chat.
- **`document_processor.py`**: Utilities for processing uploaded files.
  - _Role_: Extracts text from PDFs using `pymupdf` to prepare it for the vector store.
- **`seed.py`**: Automated data seeding.
  - _Role_: Runs on startup to ensure default data (like the "Demo Stack" and "test.pdf") exists in the database and vector store, making the app ready-to-use immediately.

### 2.3 Data Layer (`models/` & `database.py`)

- **`database.py`**: Configures the **SQLAlchemy** asynchronous engine and session maker for PostgreSQL.
- **`models/stack.py`**: Defines the `Stack` database schema. It stores the visual graph structure (`nodes`, `edges`) as JSON fields, decoupling the visual representation from the relational schema.

---

## 3. Client Architecture (`client/`)

The frontend is a **React** single-page application (SPA) focused on interactivity.

### 3.1 Feature Modules (`src/features/`)

The codebase is organized by feature domain rather than technical layers.

- **`workflow/`**: Contains the Visual Editor logic.
  - _Components_: Custom Node types (e.g., `LLMNode`, `InputNode`) compatible with React Flow.
  - _Role_: Handles the drag-and-drop mechanics, node configuration forms, and connecting edges.
- **`chat/`**: The Chat Interface.
  - _Components_: Chat window, message bubbles, input area.
  - _Role_: Sends user messages to the backend `/chat` endpoint and displays the streaming or final response.
- **`dashboard/`**: The Home/Landing view.
  - _Role_: Lists available stacks and allows creating new ones.

### 3.2 State Management (`src/store/`)

- **`useFlowStore.ts`**: The central **Zustand** store.
  - _Role_: Manages the application state, including the list of nodes, edges, and the current stack's metadata. It syncs changes between the UI and the backend (e.g., auto-saving graph changes).

---

## 4. Key Interactions & Data Flow

### 4.1 Workflow Execution Flow

1.  **User Interaction**: User types a message in the Chat UI.
2.  **API Call**: Frontend sends `POST /api/chat` with `message` and `stack_id`.
3.  **Backend Processing**:
    - `routes.py` receives the request.
    - It fetches the Stack configuration (nodes/edges) from the DB.
    - It initializes the `WorkflowEngine` with this graph.
4.  **Graph Traversal**:
    - The Engine finds the `InputNode` and injects the user's message.
    - It follows the edges to the next node (e.g., `KnowledgeBaseNode`).
    - **RAG Step**: If a Knowledge Base node is hit, `vector_store.py` is called to query ChromaDB for context.
    - **LLM Step**: The context + prompt is sent to the `LLMNode`, which calls an external provider (Groq/OpenAI).
5.  **Response**: The final output is returned to the frontend and displayed to the user.

### 4.2 Knowledge Base Ingestion Flow

1.  **Upload**: User uploads a PDF via the UI.
2.  **Processing**: `document_processor.py` extracts text.
3.  **Embedding**: `services/vector_store.py` chunks the text and creates embeddings.
4.  **Storage**: Embeddings are saved in ChromaDB, ready for retrieval.

---

## 5. Development Principles

- **Separation of Concerns**: Visuals (React Flow) are decoupled from Execution (Python Engine). The DB acts as the shared state.
- **Asynchronous First**: The backend uses `async/await` for all I/O operations (DB, Vector Store, LLM APIs) to ensure high concurrency.
- **Component-Based**: The frontend uses small, reusable components (mostly functional) with hooks for logic.
