from app.database import SessionLocal
from app.crud import project as project_crud

db = SessionLocal()
try:
    projects = project_crud.get_projects(db, language="en", limit=1)
    if projects:
        p = projects[0]
        print(f"Project: {p.slug}")
        print(f"Has translations: {hasattr(p, 'translations')} - Count: {len(p.translations) if hasattr(p, 'translations') else 0}")
        print(f"Has project_technologies: {hasattr(p, 'project_technologies')} - Count: {len(p.project_technologies) if hasattr(p, 'project_technologies') else 0}")
        print(f"Has images: {hasattr(p, 'images')} - Count: {len(p.images) if hasattr(p, 'images') else 0}")
        print(f"Has technologies: {hasattr(p, 'technologies')}")
        
        if hasattr(p, 'project_technologies') and p.project_technologies:
            for pt in p.project_technologies:
                print(f"  - Technology: {pt.technology.name if hasattr(pt, 'technology') and pt.technology else 'N/A'}")
finally:
    db.close()
