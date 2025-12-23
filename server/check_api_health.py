import asyncio
import os
import httpx
from openai import AsyncOpenAI
from dotenv import load_dotenv

# Load env variables
load_dotenv()

async def check_gemini():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key: return "Not Configured", "N/A"
    
    # Simple handshake with a cheap/free model
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, json={"contents": [{"parts": [{"text": "hi"}]}]}, timeout=10.0)
            if resp.status_code == 200:
                return "Active", "Quota Managed by Google"
            elif resp.status_code == 403 or resp.status_code == 401:
                return "Auth Failed", "Invalid Key"
            return f"Error ({resp.status_code})", "Check Dashboard"
    except Exception as e:
        return f"Connection Error", "N/A"

async def check_openai():
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key: return "Not Configured", "N/A"
    
    client = AsyncOpenAI(api_key=api_key)
    try:
        # Minimal token request
        await client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": "hi"}],
            max_tokens=1
        )
        return "Active", "See OpenAI Dashboard"
    except Exception as e:
        err_str = str(e)
        if "401" in err_str: return "Auth Failed", "Invalid Key"
        if "429" in err_str: return "Rate Limited", "Quota Exceeded"
        return f"Error: {err_str[:20]}...", "N/A"

async def check_perplexity():
    api_key = os.getenv("PERPLEXITY_API_KEY")
    if not api_key: return "Not Configured", "N/A"
    
    client = AsyncOpenAI(api_key=api_key, base_url="https://api.perplexity.ai")
    try:
        await client.chat.completions.create(
            model="perplexity-sonar-small-online",
            messages=[{"role": "user", "content": "hi"}],
            max_tokens=1
        )
        return "Active", "See Perplexity Dashboard"
    except Exception as e:
        err_str = str(e)
        if "401" in err_str: return "Auth Failed", "Invalid Key"
        return f"Error: {err_str[:20]}...", "N/A"

async def check_groq():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key: return "Not Configured", "N/A"
    
    from groq import AsyncGroq
    client = AsyncGroq(api_key=api_key)
    try:
        await client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": "hi"}],
            max_tokens=1
        )
        return "Active", "Free Tier Valid"
    except Exception as e:
        err_str = str(e)
        if "401" in err_str: return "Auth Failed", "Invalid Key"
        return f"Error: {err_str}", "N/A"

async def main():
    print(f"\n{'PROVIDER':<15} | {'STATUS':<20} | {'NOTES'}")
    print("-" * 60)
    
    g_status, g_note = await check_gemini()
    print(f"{'Gemini':<15} | {g_status:<20} | {g_note}")

    o_status, o_note = await check_openai()
    print(f"{'OpenAI':<15} | {o_status:<20} | {o_note}")
    
    p_status, p_note = await check_perplexity()
    print(f"{'Perplexity':<15} | {p_status:<20} | {p_note}")

    gr_status, gr_note = await check_groq()
    print(f"{'Groq':<15} | {gr_status:<20} | {gr_note}")
    
    print("-" * 60)
    print("Note: Exact remaining dollar credits are not accessible via standard APIs.\n")

if __name__ == "__main__":
    asyncio.run(main())
