"""realign tech radar rings with current areas of strength

Revision ID: 20260805_0007
Revises: 20260801_0006
Create Date: 2026-08-05
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "20260805_0007"
down_revision: Union[str, None] = "20260801_0006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# Keep the radar focused on the technologies used most confidently in day-to-day
# development. DevOps and infrastructure tools remain useful, but are still in
# the trial/assessment stage.
CURRENT_RINGS = {
    "Docker": "trial",
    "Kubernetes": "assess",
    "GitHub Actions (CI/CD)": "assess",
    "AWS (EC2, S3)": "assess",
    "Spring Cloud Config": "trial",
    "Zuul Gateway": "assess",
    "SonarQube": "assess",
    "ElasticSearch": "assess",
    "Kibana": "assess",
    "Redis": "assess",
    "RabbitMQ": "assess",
    "PostgreSQL": "trial",
    "Celery": "assess",
    "Vagrant": "assess",
    "Java/Spring Boot": "adopt",
    "Python/FastAPI": "adopt",
    "REST APIs": "adopt",
    "Hibernate/JPA": "trial",
    "JSF/PrimeFaces": "assess",
    "Microservices": "trial",
    "Clean Architecture": "trial",
    "JWT/RBAC": "trial",
    "Constraint Optimization": "trial",
    "JUnit": "trial",
    "Pytest": "adopt",
    "CI/CD Pipelines": "trial",
    "Defect Tracking (Jira, GitLab)": "trial",
    "Test Automation": "trial",
    "Vue.js": "assess",
    "React": "trial",
    "Next.js": "trial",
    "JavaScript/TypeScript": "trial",
    "Tailwind CSS": "trial",
    "Electron": "assess",
    "Java": "adopt",
    "Python": "adopt",
    "TypeScript/JavaScript": "trial",
    "SQL": "trial",
    "C#": "assess",
    "LLMs": "assess",
    "Retrieval-Augmented Generation (RAG)": "assess",
    "Git/GitLab/GitHub": "trial",
    "Maven/Gradle": "adopt",
    "Linux (Ubuntu)": "trial",
    "Azure DevOps": "assess",
}


LEGACY_RINGS = {
    "Docker": "adopt",
    "GitHub Actions (CI/CD)": "trial",
    "AWS (EC2, S3)": "trial",
    "Zuul Gateway": "trial",
    "SonarQube": "trial",
    "ElasticSearch": "trial",
    "Kibana": "trial",
    "Redis": "trial",
    "PostgreSQL": "adopt",
    "Microservices": "adopt",
    "Clean Architecture": "adopt",
    "Constraint Optimization": "adopt",
    "Vue.js": "trial",
    "JavaScript/TypeScript": "adopt",
    "C#": "trial",
    "Git/GitLab/GitHub": "adopt",
    "Maven/Gradle": "trial",
    "Linux (Ubuntu)": "adopt",
}


def _set_rings(rings: dict[str, str]) -> None:
    statement = sa.text("UPDATE skills SET ring = :ring WHERE name = :name")
    for name, ring in rings.items():
        op.execute(statement.bindparams(name=name, ring=ring))


def upgrade() -> None:
    """Move the current skill records into their intended radar rings."""
    _set_rings(CURRENT_RINGS)


def downgrade() -> None:
    """Restore the previous ring for records whose ring changed."""
    _set_rings(LEGACY_RINGS)
