from app.database import SessionLocal
from sqlalchemy import text

db = SessionLocal()
try:
    # Check project_technologies
    result = db.execute(text("SELECT COUNT(*) FROM project_technologies"))
    pt_count = result.scalar()
    print(f"Project-Technology relations: {pt_count}")
    
    # Check technologies
    result = db.execute(text("SELECT COUNT(*) FROM technologies"))
    tech_count = result.scalar()
    print(f"Technologies: {tech_count}")
    
    # Check skills
    result = db.execute(text("SELECT COUNT(*) FROM skills"))
    skill_count = result.scalar()
    print(f"Skills: {skill_count}")
    
    # Check experiences
    result = db.execute(text("SELECT COUNT(*) FROM experiences"))
    exp_count = result.scalar()
    print(f"Experiences: {exp_count}")
    
    # Check users
    result = db.execute(text("SELECT COUNT(*) FROM users"))
    user_count = result.scalar()
    print(f"Users: {user_count}")
    
    # Check site_config
    result = db.execute(text("SELECT COUNT(*) FROM site_config"))
    config_count = result.scalar()
    print(f"Site Config: {config_count}")
    
    db.commit()
finally:
    db.close()
