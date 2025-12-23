import asyncio
from dotenv import load_dotenv
import os

# Load env before imports that might check env
load_dotenv("server/.env")

from services.workflow_engine import execute_workflow
from models.workflow import WorkflowDefinition, Node, Edge

async def test_perplexity_workflow():
    print("Testing Perplexity Workflow...")

    # Define Nodes
    nodes = [
        Node(id="1", type="userQuery", data={"label": "User Query"}, position={"x": 0, "y": 0}),
        Node(id="2", type="llmEngine", data={
            "label": "Perplexity Engine", 
            "config": {
                "model": "perplexity-sonar-small-online",
                "system_prompt": "You are a helpful assistant. Answer briefly."
            }
        }, position={"x": 200, "y": 0}),
         # Note: No Output Node needed logically as per new design, 
         # but backend execution still returns the last output.
    ]

    # Define Edges
    edges = [
        Edge(id="e1-2", source="1", target="2")
    ]

    workflow = WorkflowDefinition(nodes=nodes, edges=edges)
    user_query = "Who won the super bowl in 2024?" 

    print(f"Query: {user_query}")
    try:
        response = await execute_workflow(workflow, user_query)
        print("\n--- Workflow Result ---")
        print(f"Answer: {response.answer}")
        print("\n--- Logs ---")
        for log in response.logs:
            print(log)
        
        if "Chiefs" in response.answer or "49ers" in response.answer or "Kansas City" in response.answer:
            print("\nSUCCESS: Perplexity returned a relevant answer.")
        else:
             print("\nWARNING: Answer might not be correct, check API response.")

    except Exception as e:
        print(f"\nERROR: Workflow failed - {e}")

if __name__ == "__main__":
    # Test valid key
    asyncio.run(test_perplexity_workflow())
