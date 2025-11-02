"""Create admin user"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from app.database import SessionLocal
from app.models.user import User
from app.config import get_settings
from passlib.context import CryptContext
import uuid


PLACEHOLDER_HASH = "$2b$12$placeholder_hash_will_be_generated_by_backend"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
settings = get_settings()

def create_admin(reset_existing: bool = False):
    """Create admin user"""
    db = SessionLocal()
    try:
        admin_emails = settings.admin_email_list or ["admin@example.com"]

        for email in admin_emails:
            username = email.split("@")[0]

            existing_admin = db.query(User).filter(User.email == email).first()
            if existing_admin:
                should_reset = reset_existing or existing_admin.password_hash in (None, "", PLACEHOLDER_HASH)

                if should_reset:
                    existing_admin.password_hash = pwd_context.hash("admin123")
                    if not existing_admin.is_active:
                        existing_admin.is_active = True
                    db.commit()
                    db.refresh(existing_admin)
                    print(f"✓ Admin password reset for {email}!")
                    print("  Yeni geçici şifre: admin123")
                    print("  ⚠️  İlk girişten sonra lütfen değiştirin!")
                else:
                    print(f"✓ Admin user already exists for {email}! (şifre değiştirilmedi)")
                continue

            admin = User(
                id=uuid.uuid4(),
                username=username,
                email=email,
                password_hash=pwd_context.hash("admin123"),  # Change this password!
                is_active=True
            )

            db.add(admin)
            db.commit()

            print(f"✓ Admin user created successfully for {email}!")
            print(f"  Username: {username}")
            print("  Password: admin123")
            print("  ⚠️  Please change this password after first login!")
            db.refresh(admin)
        
    except Exception as e:
        print(f"✗ Error creating admin: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    reset_flag = "--reset" in sys.argv
    if reset_flag:
        sys.argv.remove("--reset")

    create_admin(reset_existing=reset_flag)
