# No-Code LLM Workflow Builder - Design & Implementation

## 1. High-Level Design (HLD)

### 1.1 Overview

The No-Code LLM Workflow Builder is a web-based platform that allows users to create, manage, and execute complex LLM (Large Language Model) workflows using a visual drag-and-drop interface. It supports features like RAG (Retrieval Augmented Generation), prompt chaining, and real-time chat interactions.

### 1.2 System Architecture

The system follows a typical client-server architecture, containerized using Docker for ease of deployment.

```mermaid
graph TD
    User[User] --> Client[React Frontend]
    Client -- HTTP/REST --> Server[FastAPI Backend]
    Server --> DB[(PostgreSQL)]
    Server --> VectorDB[(ChromaDB)]
    Server -- API --> LLM[External LLMs (Groq, OpenAI, Gemini)]
    Server -- Internal --> Services[Workflow Engine / RAG Service]
```

### 1.3 Tech Stack

**Frontend:**

- **Framework:** React 19 (Vite)
- **Language:** TypeScript
- **State Management:** Zustand
- **Styling:** Tailwind CSS V4
- **Routing:** React Router DOM
- **Visual Editor:** React Flow (@xyflow/react)
- **UI Components:** Lucide React, Sonner (Toasts)

**Backend:**

- **Framework:** FastAPI (Python 3.9+)
- **ORM:** SQLAlchemy (Async)
- **Database:** PostgreSQL
- **Vector Store:** ChromaDB
- **PDF Processing:** PyMuPDF
- **AI Integration:** Groq, OpenAI, Google Generative AI

**Infrastructure:**

- **Containerization:** Docker & Docker Compose
- **Reverse Proxy:** (Optional via Nginx in prod, direct access for dev)

---

## 2. Low-Level Design (LLD)

### 2.1 Database Schema (PostgreSQL)

The relational database stores the definition of stacks (workflows) and their metadata.

- **Table `stacks`:**
  - `id` (UUID, PK): Unique identifier.
  - `name` (String): Name of the stack.
  - `description` (String): Optional description.
  - `nodes` (JSON): The React Flow nodes configuration (positions, types, data).
  - `edges` (JSON): The React Flow edges configuration (connections).
  - `created_at` (DateTime)
  - `updated_at` (DateTime)

### 2.2 API Endpoints

Key REST endpoints provided by the FastAPI backend:

- **Stacks (`/api/stacks`)**

  - `GET /`: List all stacks.
  - `POST /`: Create a new stack.
  - `GET /{stack_id}`: Get details of a specific stack.
  - `PUT /{stack_id}`: Update a stack's nodes/edges.
  - `DELETE /{stack_id}`: Delete a stack.

- **Execution & Chat (`/api/routes`)** (or specific modules)
  - `POST /chat`: Send a message to a specific stack/workflow. This triggers the `WorkflowEngine`.
  - `POST /upload`: Upload documents (PDFs) for the Knowledge Base.

### 2.3 Core Components

#### 2.3.1 Workflow Engine (`server/services/workflow_engine.py`)

This is the heart of the backend. It traverses the JSON graph (nodes and edges):

1.  **Topological Sort:** Determines the execution order of nodes.
2.  **Node Execution:** Processes each node based on its type (e.g., `LLMNode`, `InputNode`, `KnowledgeBaseNode`).
3.  **Context Passing:** Passes outputs from previous nodes as inputs to subsequent nodes.

#### 2.3.2 Vector Store Service (`server/services/vector_store.py`)

Handles interactions with ChromaDB:

- **Ingestion:** Chunks text from PDFs and generates embeddings.
- **Retrieval:** Performs semantic search to find relevant context for RAG.

#### 2.3.3 Frontend Store (`client/src/store/`)

Uses Zustand to manage global state:

- `useStackStore`: Manages the currently open stack, nodes, and edges. Allows for real-time updates and synchronization with the backend.

---

## 3. Implementation Details ("How We Did It")

### 3.1 Development Workflow

We adopted an iterative development process:

1.  **Foundation:** Set up the Monorepo structure (Client + Server) and Docker environment.
2.  **Backend Core:** Implemented the `Stack` model and basic CRUD API.
3.  **Frontend Editor:** Integrated React Flow to allow drag-and-drop creation of nodes.
4.  **Workflow Logic:** Built the Python-based execution engine to parse and run the graph.
5.  **RAG Integration:** Added ChromaDB and PDF parsing to support "Knowledge Base" nodes.
6.  **Chat UI:** built a chat interface that communicates with the backend execution engine.

### 3.2 Key Challenges & Solutions

**Challenge 1: Synchronizing Visual Graph with Execution Logic**

- _Problem:_ The frontend represents flows visually (positions, UI handles), while the backend needs a logical execution graph.
- _Solution:_ We store the raw React Flow JSON (`nodes` and `edges`) in the database. The Backend `WorkflowEngine` parses this JSON at runtime, converting UI edges into logical data dependencies.

**Challenge 2: Handling Asynchronous AI Responses**

- _Problem:_ LLM calls can be slow, blocking the main thread.
- _Solution:_ FastAPI's `async/await` capabilities were used extensively. The entire database and AI interaction layer is asynchronous, allowing the server to handle multiple concurrent requests efficiently.

**Challenge 3: Flexible Node Configuration**

- _Problem:_ Different nodes (LLM, Input, Output) need different configuration data.
- _Solution:_ We used a generic `data` field in the Node schema on both frontend and backend. The frontend components dynamically render inputs based on node type, and the backend engine has a dispatcher to handle logic based on `node.type`.

### 3.3 Future Improvements

- **Streaming Responses:** Currently, the chat waits for the full response. Implementing Server-Sent Events (SSE) would allow token-by-token streaming.
- **More Node Types:** Adding "API Request" nodes or "Conditional Logic" nodes would make the builder more powerful.
- **User Authentication:** Adding Auth0 or automated JWT handling for multi-user support.
