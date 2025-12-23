from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="No-Code LLM Workflow Builder")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from api.routes import router as api_router
from api.stacks import router as stacks_router
from database import init_db, async_session
from services.seed import seed_db

@app.on_event("startup")
async def on_startup():
    try:
        await init_db()
        async with async_session() as session:
            pass
            # await seed_db(session)
    except Exception as e:
        print(f"Startup Error: {e}")
        import traceback
        traceback.print_exc()

app.include_router(api_router, prefix="/api")
app.include_router(stacks_router, prefix="/api/stacks", tags=["Stacks"])


@app.get("/")
async def root():
    return {"message": "Workflow Engine API is running"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
