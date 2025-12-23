import asyncio
from database import async_session
from sqlalchemy.future import select
from models.stack import Stack

async def check_stacks():
    async with async_session() as session:
        result = await session.execute(select(Stack))
        stacks = result.scalars().all()
        print(f"Total Stacks found: {len(stacks)}")
        for s in stacks:
            print(f"- {s.name}: {s.description}")

if __name__ == "__main__":
    asyncio.run(check_stacks())
