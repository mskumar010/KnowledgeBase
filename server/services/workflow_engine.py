from typing import Dict, Any, List
from models.workflow import WorkflowDefinition, Node, Edge, WorkflowResponse
from services.vector_store import query_documents
from services.vector_store import query_documents
# import google.generativeai as genai     # Deprecated/Broken for 1.5/2.0
import asyncio
import os
import logging
import httpx
import json


from services.vector_store import query_documents
import asyncio
import os
import logging
import httpx
import json
from openai import AsyncOpenAI
from groq import AsyncGroq

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

aclient = AsyncOpenAI(api_key=OPENAI_API_KEY)
pclient = AsyncOpenAI(api_key=PERPLEXITY_API_KEY, base_url="https://api.perplexity.ai")
gclient = AsyncGroq(api_key=GROQ_API_KEY)

async def generate_content_rest(prompt: str, model: str = "gemini-2.0-flash"):
    if not GEMINI_API_KEY:
        return "Error: No API Key configured."
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={GEMINI_API_KEY}"
    headers = {'Content-Type': 'application/json'}
    data = {
        "contents": [{
            "parts": [{"text": prompt}]
        }]
    }
    

    async with httpx.AsyncClient() as client:
        for attempt in range(5):
            try:
                resp = await client.post(url, json=data, timeout=30.0)
                
                if resp.status_code == 200:
                    result = resp.json()
                    try:
                        text = result['candidates'][0]['content']['parts'][0]['text']
                        return text
                    except (KeyError, IndexError):
                        logging.error(f"Unexpected Format: {result}")
                        return "Error: Unexpected API response format."
                elif resp.status_code == 429:
                    wait_time = min(60, 2 * (2 ** attempt))
                    print(f"Gemini Chat 429. Retrying in {wait_time}s...")
                    await asyncio.sleep(wait_time)
                    continue
                else:
                     return f"Error ({resp.status_code}): {resp.text}"
            except Exception as e:
                logging.error(f"REST Gen Error: {e}", exc_info=True)
                if attempt == 4: return f"Error calling API after retries: {str(e)}"
        return "Error: Max retries exceeded."




async def execute_workflow(workflow: WorkflowDefinition, user_query: str) -> WorkflowResponse:
    # 1. Build Adjacency List for Graph Traversal
    adj_list = {node.id: [] for node in workflow.nodes}
    node_map = {node.id: node for node in workflow.nodes}
    in_degree = {node.id: 0 for node in workflow.nodes}
    
    for edge in workflow.edges:
        if edge.source in adj_list and edge.target in in_degree:
            adj_list[edge.source].append(edge.target)
            in_degree[edge.target] += 1

    # 2. Find Start Node (UserQuery)
    start_nodes = [node for node in workflow.nodes if node.type == 'userQuery']
    if not start_nodes:
        return WorkflowResponse(answer="Error: No User Query node found.", logs=["Validation Failed"])
    
    # 3. Topological Search / Execution Queue
    queue = [n.id for n in start_nodes]
    execution_context: Dict[str, Any] = {"query": user_query, "history": []}
    logs = []
    final_output = ""

    while queue:
        current_id = queue.pop(0)
        current_node = node_map[current_id]
        logs.append(f"Executing Node: {current_node.data.label} ({current_node.type})")
        
        # PROCESS NODE
        try:
            output = await process_node(current_node, execution_context, node_map)
            execution_context[current_id] = output # Store output by node ID
            if current_node.type == 'output':
                final_output = str(output)
        except Exception as e:
            logs.append(f"Error in node {current_id}: {str(e)}")
            return WorkflowResponse(answer="Error executing workflow.", logs=logs)

        # Propagate to neighbors
        for neighbor_id in adj_list[current_id]:
            in_degree[neighbor_id] -= 1
            if in_degree[neighbor_id] == 0:
                queue.append(neighbor_id)

    return WorkflowResponse(answer=final_output, logs=logs)

async def process_node(node: Node, context: Dict[str, Any], node_map: Dict[str, Node]):
    node_type = node.type
    
    if node_type == 'userQuery':
        return context.get('query', '')
    
    elif node_type == 'knowledgeBase':
        # Retrieve context from vector store based on query
        # Assuming the input to this node is the query from a previous node
        # For simplicity, we grab the global query or latest input
        query = context.get('query', '')
        docs = await query_documents(query)
        context['kb_context'] = docs # Store for LLM (Global Context)
        return docs
    
    elif node_type == 'llmEngine':
        query = context.get('query', '')
        kb_context = context.get('kb_context', [])

        # Real LLM Call (REST)
        prompt = f"System: {node.data.config.get('system_prompt', 'You are a helpful assistant.')}\n"
        if kb_context:
            prompt += f"Context: {kb_context}\n"
        prompt += f"User: {query}"
        

        # Determine Model Provider based on config
        model_name = node.data.config.get('model', 'gemini-2.0-flash')
        
        if model_name.startswith("gpt"):
             # OpenAI Path
             if not OPENAI_API_KEY:
                 return "Error: OpenAI API Key missing."
             try:
                response = await aclient.chat.completions.create(
                    model=model_name,
                    messages=[
                        {"role": "system", "content": node.data.config.get('system_prompt', 'You are a helpful assistant.')},
                        {"role": "user", "content": f"Context: {kb_context}\n\nQuestion: {query}"}
                    ]
                )
                return response.choices[0].message.content
             except Exception as e:
                 logging.error(f"OpenAI Error: {e}", exc_info=True)
                 return f"Error (OpenAI): {str(e)}"
        
        elif model_name.startswith("perplexity"):
             # Perplexity Path
             if not PERPLEXITY_API_KEY:
                 return "Error: Perplexity API Key missing."
             try:
                response = await pclient.chat.completions.create(
                    model=model_name,
                    messages=[
                        {"role": "system", "content": node.data.config.get('system_prompt', 'You are a helpful assistant.')},
                        {"role": "user", "content": f"Context: {kb_context}\n\nQuestion: {query}"}
                    ]
                )
                return response.choices[0].message.content
             except Exception as e:
                 logging.error(f"Perplexity Error: {e}", exc_info=True)
                 return f"Error (Perplexity): {str(e)}"

             except Exception as e:
                 logging.error(f"Perplexity Error: {e}", exc_info=True)
                 return f"Error (Perplexity): {str(e)}"
        
        elif model_name.startswith("llama") or model_name.startswith("mixtral"):
             # Groq Path
             if not GROQ_API_KEY:
                 return "Error: Groq API Key missing."
             try:
                response = await gclient.chat.completions.create(
                    model=model_name,
                    messages=[
                        {"role": "system", "content": node.data.config.get('system_prompt', 'You are a helpful assistant.')},
                        {"role": "user", "content": f"Context: {kb_context}\n\nQuestion: {query}"}
                    ]
                )
                return response.choices[0].message.content
             except Exception as e:
                 logging.error(f"Groq Error: {e}", exc_info=True)
                 return f"Error (Groq): {str(e)}"

        else:
             # Default / Gemini Path
             response_text = await generate_content_rest(prompt, model_name)
             return response_text

    elif node_type == 'output':
        # Retrieve the result from the LLM engine or the last significant operation
        # In this linear flow: Query -> (KB) -> LLM -> Output
        # We check execution_context for 'llmEngine' output first, then 'knowledgeBase', then 'query'
        
        # Helper to find upstream data
        # In a real graph, we traverse edges backwards.
        # For this prototype, we iterate context values.
        
        # Check if any LLM node has run
        for nid, val in context.items():
            if nid in node_map and node_map[nid].type == 'llmEngine':
                 return val
        
        # Fallback to KB
        if 'kb_context' in context and context['kb_context']:
            return f"Retrieved Context: {context['kb_context']}"

        return "Output Node Reached (No Upstream Data)"

    return None
