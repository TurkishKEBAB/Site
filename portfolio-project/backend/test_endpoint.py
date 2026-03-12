import sys
import asyncio
from app.database import SessionLocal
from app.api.v1.projects import get_projects

async def test_endpoint():
    db = SessionLocal()
    try:
        result = await get_projects(
            skip=0,
            limit=20,
            language="en",
            featured_only=False,
            technology_slug=None,
            db=db
        )
        print("API Response:")
        print(result)
    except Exception as e:
        print(f"ERROR: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(test_endpoint())
