import sys
import asyncio
from app.database import SessionLocal
from app.api.v1.projects import get_projects as endpoint_get_projects

async def test():
    db = SessionLocal()
    try:
        result = await endpoint_get_projects(
            skip=0,
            limit=20,
            language="en",
            featured_only=False,
            technology_slug=None,
            db=db
        )
        print("Success!")
        print(f"Total projects: {result['total']}")
        print(f"Items count: {len(result['items'])}")
        
        if result['items']:
            proj = result['items'][0]
            print(f"\nFirst project: {proj.slug}")
            print(f"Has technologies attr: {hasattr(proj, 'technologies')}")
            if hasattr(proj, 'technologies'):
                print(f"Technologies count: {len(proj.technologies)}")
                
    except Exception as e:
        print(f"ERROR: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(test())
