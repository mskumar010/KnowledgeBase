import requests
import json
import uuid

def test_workflow():
    url = "http://localhost:8000/api/run_workflow"
    
    # Construct a simple valid workflow payload: Query -> Output
    # This avoids Chroma/LLM complexity first to test basic graph engine
    workflow_simple = {
        "nodes": [
            {"id": "node-1", "type": "userQuery", "data": {"label": "Query"}, "position": {"x": 0, "y": 0}},
            {"id": "node-2", "type": "output", "data": {"label": "Output"}, "position": {"x": 200, "y": 0}}
        ],
        "edges": [
            {"id": "edge-1", "source": "node-1", "target": "node-2"}
        ]
    }

    # Construct RAG Workflow: Query -> KB -> LLM -> Output
    workflow_rag = {
        "nodes": [
            {"id": "node-1", "type": "userQuery", "data": {"label": "Query"}, "position": {"x": 0, "y": 0}},
            {"id": "node-2", "type": "knowledgeBase", "data": {"label": "KB"}, "position": {"x": 100, "y": 0}},
            {"id": "node-3", "type": "llmEngine", "data": {"label": "LLM", "config": {"model": "gemini-2.0-flash"}}, "position": {"x": 200, "y": 0}},
            {"id": "node-4", "type": "output", "data": {"label": "Output"}, "position": {"x": 300, "y": 0}}
        ],
        "edges": [
            {"id": "e1", "source": "node-1", "target": "node-2"},
            {"id": "e2", "source": "node-2", "target": "node-3"},
            {"id": "e3", "source": "node-3", "target": "node-4"}
        ]
    }

    print("Testing Simple Workflow...")
    try:
        resp = requests.post(url, json={"workflow": workflow_simple, "user_query": "Hello"})
        print(f"Simple Status: {resp.status_code}")
        try:
            print(f"Simple Body: {json.dumps(resp.json(), indent=2)}")
        except:
            print(f"Simple Body: {resp.text}")
    except Exception as e:
        print(f"Simple Failed: {e}")

    print("\nTesting RAG Workflow (Gemini)...")
    try:
        workflow_rag_gemini = workflow_rag.copy()
        # Ensure correct config
        workflow_rag_gemini['nodes'][2]['data']['config']['model'] = "gemini-2.0-flash"
        
        resp = requests.post(url, json={"workflow": workflow_rag_gemini, "user_query": "What is the secret code?"})
        print(f"RAG Gemini Status: {resp.status_code}")
        try:
             print(f"RAG Gemini Body: {json.dumps(resp.json(), indent=2)}")
        except:
             print(f"RAG Gemini Body: {resp.text}")
    except Exception as e:
        print(f"RAG Gemini Failed: {e}")

    print("\nTesting RAG Workflow (OpenAI)...")
    try:
        workflow_rag_openai = workflow_rag.copy()
        # Change model to GPT
        workflow_rag_openai['nodes'][2]['data']['config']['model'] = "gpt-4o"
        
        resp = requests.post(url, json={"workflow": workflow_rag_openai, "user_query": "What is the secret code?"})
        print(f"RAG OpenAI Status: {resp.status_code}")
        try:
             print(f"RAG OpenAI Body: {json.dumps(resp.json(), indent=2)}")
        except:
             print(f"RAG OpenAI Body: {resp.text}")
    except Exception as e:
        print(f"RAG OpenAI Failed: {e}")

if __name__ == "__main__":
    test_workflow()
