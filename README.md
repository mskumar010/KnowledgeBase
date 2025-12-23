# No-Code LLM Workflow Builder

A visual, node-based workflow builder for chaining Large Language Models (LLMs), RAG (Retrieval-Augmented Generation), and input/output operations. Built with React Flow, FastAPI, and ChromaDB.
 
## Features

- **Visual Workflow Editor**: Drag-and-drop nodes to create complex AI logic chains.
- **Node Types**:
  - **User Query**: Input triggers.
  - **LLM Engine**: Execute prompts using Gemini/OpenAI (Configurable).
  - **Knowledge Base**: RAG support - Upload PDFs to provide context.
  - **Output**: Display results in a chat interface.
- **Chat Interface**: Interact with your workflow in a conversational UI.
- **Vector Search**: Integrated ChromaDB for semantic search over uploaded documents.
- **Robust Error Handling**: Real-time feedback via Toast notifications and graceful error boundaries.

## Tech Stack

- **Frontend**: React, Vite, TailwindCSS v4, React Flow, Shadcn/UI, Zustand.
- **Backend**: FastAPI, Python 3.14 compatible (HTTPX-based Vector Store), ChromaDB (Docker), PyMuPDF.
- **Infrastructure**: Docker Compose (Postgres, ChromaDB).

## Getting Started

### Prerequisites

- Node.js (v18+)
- Python (v3.10+)
- Docker & Docker Compose
- Google Gemini API Key (or OpenAI Key)

### Installation

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/yourusername/knowledge-base-builder.git
    cd knowledge-base-builder
    ```

2.  **Environment Setup**:

    - Create a `.env` file in `server/`:
      ```env
      OPENAI_API_KEY=sk-...
      GEMINI_API_KEY=AIza... (Required)
      DATABASE_URL=postgresql://user:password@localhost/dbname
      CHROMA_HOST=localhost
      CHROMA_PORT=8001
      ```

3.  **Start Infrastructure (Database & Vector Store)**:

    ```bash
    docker-compose up -d
    ```

4.  **Install Dependencies**:

    ```bash
    # Root (installs concurrently for dev scripts)
    npm install

    # Client
    cd client && npm install

    # Server (Create venv first)
    cd server
    python -m venv venv
    .\venv\Scripts\activate
    pip install -r requirements.txt
    ```

### Running the Application

To run both Frontend and Backend simultaneously:

```bash
# From the project root
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API Docs**: http://localhost:8000/docs
- **ChromaDB**: http://localhost:8001 (API)

## Usage Guide

1.  **Create a Flow**: Drag nodes from the sidebar. Connect `User Query` -> `LLM Engine` -> `Output`.
2.  **Add Knowledge**: Drag a `Knowledge Base` node. Click "Upload PDF" to index a document.
3.  **Configure**: Click a node to edit settings (e.g., System Prompt).
4.  **Run**: Click "Run Workflow" to open the chat and test your logic.

## License

MIT
