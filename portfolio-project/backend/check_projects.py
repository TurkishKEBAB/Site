from app.database import SessionLocal
from app.models.project import Project

db = SessionLocal()
try:
    projects = db.query(Project).all()
    print(f'Total projects in database: {len(projects)}')
    for p in projects:
        print(f'  - {p.slug} ({p.id})')
finally:
    db.close()
