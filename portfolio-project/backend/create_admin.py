"""Create or reset admin users using environment-provided bootstrap password."""
import os
import sys
import uuid
from pathlib import Path

from passlib.context import CryptContext

sys.path.insert(0, str(Path(__file__).parent))

from app.config import get_settings  # noqa: E402
from app.database import SessionLocal  # noqa: E402
from app.models.user import User  # noqa: E402


PLACEHOLDER_HASH = "$2b$12$placeholder_hash_will_be_generated_by_backend"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
settings = get_settings()


def create_admin(reset_existing: bool = False):
    """Create admin users from ADMIN_EMAILS with secure bootstrap password."""
    bootstrap_password = os.getenv("ADMIN_BOOTSTRAP_PASSWORD")
    if not bootstrap_password:
        raise RuntimeError(
            "ADMIN_BOOTSTRAP_PASSWORD is required to create or reset admin users."
        )

    db = SessionLocal()
    try:
        admin_emails = settings.admin_email_list or ["admin@example.com"]

        for email in admin_emails:
            username = email.split("@")[0]
            existing_admin = db.query(User).filter(User.email == email).first()

            if existing_admin:
                should_reset = reset_existing or existing_admin.password_hash in (
                    None,
                    "",
                    PLACEHOLDER_HASH,
                )
                if should_reset:
                    existing_admin.password_hash = pwd_context.hash(bootstrap_password)
                    if not existing_admin.is_active:
                        existing_admin.is_active = True
                    db.commit()
                    db.refresh(existing_admin)
                    print(f"OK: Admin password reset for {email}")
                else:
                    print(f"OK: Admin user already exists for {email} (password unchanged)")
                continue

            admin = User(
                id=uuid.uuid4(),
                username=username,
                email=email,
                password_hash=pwd_context.hash(bootstrap_password),
                is_active=True,
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            print(f"OK: Admin user created for {email}")

    except Exception as exc:
        print(f"ERROR: {exc}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    reset_flag = "--reset" in sys.argv
    if reset_flag:
        sys.argv.remove("--reset")
    create_admin(reset_existing=reset_flag)
