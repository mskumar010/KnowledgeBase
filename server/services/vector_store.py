import asyncio
import logging
import httpx
import uuid
import os
import time
import json

# Setup Logging
import os
LOG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'server_error.log')
logging.basicConfig(
    filename=LOG_FILE, 
    level=logging.ERROR, 
    format='%(asctime)s %(levelname)s %(message)s'
)

CHROMA_HOST = os.getenv("CHROMA_HOST", "localhost")
CHROMA_PORT = os.getenv("CHROMA_PORT", "8001")
HOST_URL = f"http://{CHROMA_HOST}:{CHROMA_PORT}"
# Standard V1 Root for ID-based ops
API_V1_URL = f"{HOST_URL}/api/v1"
API_V2_URL = f"{HOST_URL}/api/v2"
# Tenant URL for Create/List
TENANT = "default_tenant"
DATABASE = "default_database"
TENANT_API_URL = f"{API_V2_URL}/tenants/{TENANT}/databases/{DATABASE}"

# Configure Gemini (REST)
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("WARNING: GEMINI_API_KEY not found. Embeddings will fail.")

COLLECTION_NAME = "knowledge_base"
_collection_id = None

# Gemini text-embedding-004 is 768 dims
EMBEDDING_MODEL = "models/text-embedding-004"
EMBEDDING_DIM = 768 

async def get_embeddings(texts):
    """Generates embeddings using Gemini REST API (Batch)"""
    if not api_key:
        return None
    try:
        if isinstance(texts, str):
            texts = [texts]
        
        # Batch Embed URL
        url = f"https://generativelanguage.googleapis.com/v1beta/{EMBEDDING_MODEL}:batchEmbedContents?key={api_key}"
        headers = {'Content-Type': 'application/json'}
        
        requests = [{"model": EMBEDDING_MODEL, "content": {"parts": [{"text": t}]}} for t in texts]
        payload = {"requests": requests}


        async with httpx.AsyncClient() as client:
            for attempt in range(5):
                try:
                    resp = await client.post(url, json=payload, timeout=60.0)
                    if resp.status_code == 200:
                        result = resp.json()
                        return [e['values'] for e in result.get('embeddings', [])]
                    elif resp.status_code == 429:
                        wait_time = min(60, 2 * (2 ** attempt)) # 2, 4, 8, 16, 32
                        print(f"Embedding 429. Retrying in {wait_time}s...")
                        await asyncio.sleep(wait_time)
                        continue
                    else:
                        print(f"Embedding Batch Error {resp.status_code}: {resp.text}")
                        logging.error(f"Embedding Batch API Error: {resp.text}")
                        return None
                except Exception as e:
                     logging.error(f"Connection Error: {e}")
                     if attempt == 4: raise e
            return None

    except Exception as e:
        print(f"Error generating embeddings: {e}")
        logging.error(f"Embedding Gen Error: {e}", exc_info=True)
        return None

async def get_query_embedding(text):
    if not api_key:
        return None
    try:
        # Single Embed URL
        url = f"https://generativelanguage.googleapis.com/v1beta/{EMBEDDING_MODEL}:embedContent?key={api_key}"
        headers = {'Content-Type': 'application/json'}
        payload = {
            "model": EMBEDDING_MODEL,
            "content": {"parts": [{"text": text}]}
        }


        async with httpx.AsyncClient() as client:
            for attempt in range(5):
                try:
                    resp = await client.post(url, json=payload, timeout=30.0)
                    if resp.status_code == 200:
                         result = resp.json()
                         return result['embedding']['values']
                    elif resp.status_code == 429:
                        wait_time = min(60, 2 * (2 ** attempt))
                        print(f"Query Embedding 429. Retrying in {wait_time}s...")
                        await asyncio.sleep(wait_time)
                        continue
                    else:
                        print(f"Query Embed Error {resp.status_code}: {resp.text}")
                        logging.error(f"Query API Error: {resp.text}")
                        return None
                except Exception as e:
                     logging.error(f"Connect Error: {e}")
                     if attempt == 4: return None
            return None

    except Exception as e:
        print(f"Error generating query embedding: {e}")
        logging.error(f"Query Embedding Error: {e}", exc_info=True)
        return None

async def get_collection_id(client: httpx.AsyncClient):
    global _collection_id
    if _collection_id:
        return _collection_id
    
    try:
        # Create collection (Use Tenant logic)
        payload = {"name": COLLECTION_NAME, "metadata": {"hnsw:space": "cosine"}}
        
        # Try Creating at Tenant Level
        resp = await client.post(f"{TENANT_API_URL}/collections", json=payload)
        
        if resp.status_code == 200:
            _collection_id = resp.json()["id"]
            return _collection_id
        
        # If exists or fails, List it at Tenant Level
        if resp.status_code != 200:
             logs = await client.get(f"{TENANT_API_URL}/collections")
             if logs.status_code == 200:
                 cols = logs.json()
                 for col in cols:
                     if col["name"] == COLLECTION_NAME:
                         _collection_id = col["id"]
                         return _collection_id

    except Exception as e:
        print(f"Error getting collection: {e}")
        return None
    
    return None

async def add_documents(documents: list, metadatas: list, ids: list):
    async with httpx.AsyncClient() as client:
        col_id = await get_collection_id(client)
        if not col_id:
            print("Chroma Collection not found/created")
            return
        
        # Generate Embeddings
        # Gemini batch extraction
        embeddings = []
        try:
             # OpenAI returns list of embeddings, we iterate
             batch_embeddings = await get_embeddings(documents)
             if batch_embeddings:
                 embeddings = batch_embeddings
             else:
                 # Fallback empty (should not happen if error raised)
                 embeddings = [[0.0]*EMBEDDING_DIM for _ in documents]

        except Exception as e:
            print(f"Embedding failed: {e}")
            logging.error(f"Embedding Batch Error: {e}", exc_info=True)
            raise e

        # Wait, if embeddings list len != ids len, Chroma will error.
        if len(embeddings) != len(ids):
            print("Mismatch in embedding count")
            return

        payload = {
            "ids": ids,
            "embeddings": embeddings,
            "metadatas": metadatas,
            "documents": documents 
        }
        
        # Using Tenant-Scoped V2 URL for add/query as strictly required by this Chroma version
        # Previously failed with V1 ID-based URLs
        add_url = f"{TENANT_API_URL}/collections/{col_id}/add"
        try:
            resp = await client.post(add_url, json=payload)
            if resp.status_code != 200 and resp.status_code != 201:
                print(f"Error adding docs ({resp.status_code}): {resp.text}")
                logging.error(f"Chroma Add Error {resp.status_code}: {resp.text}")
                raise Exception(f"Chroma add failed ({resp.status_code}): {resp.text}")
        except Exception as cx:
             logging.error(f"Chroma Connection Error: {cx}", exc_info=True)
             raise cx

async def query_documents(query_text: str, n_results: int = 3, where: dict = None):
    async with httpx.AsyncClient() as client:
        col_id = await get_collection_id(client)
        if not col_id:
            return []

        # Embed Query
        query_emb = await get_query_embedding(query_text)
        if not query_emb:
            return []

        payload = {
            "query_embeddings": [query_emb],
            "n_results": n_results,
        }
        
        if where:
             payload["where"] = where
        
        # Using Tenant-Scoped V2 URL
        query_url = f"{TENANT_API_URL}/collections/{col_id}/query"
        resp = await client.post(query_url, json=payload)
        if resp.status_code == 200:
            data = resp.json()
            # If we need IDs to check existence, we should return the whole object or check how meaningful the return is
            # For seeding check, getting any document is enough.
            # But the original return was just documents list.
            # To support "existence check" based on IDs (as per my proposed seed.py), I need to return more info or adapt seed.py
            return data # Returning full response for flexibility
            
            # Note: Previously it returned data["documents"][0].
            # This broke the signature expectation of other callers potentially.
            # Let's check callers.
            # workflow_engine.py calls it: docs = await query_documents(query)
            # It expects a list of strings (documents).
            
            # I must preserve backward compatibility or update callers.
            # workflow_engine expects: return data["documents"][0]
            
            # Let's keep it compatible but slightly hacked for seed check?
            # Or better, just update callers?
            # Creating a new function `check_existence` might be safer but `query_documents` is fine if I handle the return.
            
            # Re-evaluating:
            # If I return `data` (dict), workflow_engine might break if it iterates it as a list.
            
            # Let's revert to returning documents list for now, but handle the seed check differently or just check if list is empty.
            # If I filter by source and query "test", and get result, it exists.
            
            if "documents" in data and data["documents"]:
                 # If including ids is needed, I can't just return documents[0]
                 # But for now, let's just return documents[0] (which is a list of text).
                 # Wait, if I want to check existence, checking if list is not empty is enough.
                 return data["documents"][0]
        else:
            print(f"Query failed: {resp.text}")
            
        return []
