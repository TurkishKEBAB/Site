"""refresh the NETAŞ experience with the current GitGraph-backed copy

Revision ID: 20260807_0008
Revises: 20260805_0007
Create Date: 2026-08-07
"""

import uuid
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "20260807_0008"
down_revision: Union[str, None] = "20260805_0007"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


EXPERIENCE_COPY = {
    "title": "Software Engineering Intern",
    "organization": "NETAŞ",
    "location": "Istanbul, Türkiye",
    "description": (
        "Within a six-person team, I contributed production-quality code and tests to the "
        "KKTC e-Nüfus enterprise digitalization project.\n\n"
        "I identified a critical UTC vs UTC+3 mismatch in the YAML structure and proved the "
        "silent date-boundary defect with 600+ lines of tests.\n\n"
        "I worked with Spring Cloud Config, Zuul Gateway, REST/SOAP, Redis, RabbitMQ, "
        "PostgreSQL, ElasticSearch, and Kibana.\n\n"
        "I optimized JSF/PrimeFaces queries and developed date-aware resolution, Vue formatting, "
        "Turkish collation, i18n, and null-safety checks."
    ),
}

TURKISH_COPY = {
    "title": "Yazılım Mühendisliği Stajyeri",
    "organization": "NETAŞ",
    "location": "İstanbul, Türkiye",
    "description": (
        "Altı kişilik ekip içinde KKTC e-Nüfus kurumsal dijitalleştirme projesine üretim kalitesinde "
        "kod ve test katkısı sağladım.\n\n"
        "YAML yapısındaki kritik UTC ve UTC+3 uyumsuzluğunu tespit ederek sessiz tarih-sınırı "
        "hatasını 600+ satır test ile kanıtladım.\n\n"
        "Spring Cloud Config, Zuul Gateway, REST/SOAP, Redis, RabbitMQ, PostgreSQL, ElasticSearch "
        "ve Kibana ile çalıştım.\n\n"
        "JSF/PrimeFaces sorgularını optimize ettim; tarih duyarlı çözümleme, Vue biçimlendirmesi, "
        "Türkçe sıralama, i18n ve null güvenliği kontrolleri geliştirdim."
    ),
}


def _neta_experience_ids(connection) -> list[str]:
    result = connection.execute(
        sa.text(
            """
            SELECT id
            FROM experiences
            WHERE LOWER(COALESCE(organization, '')) LIKE '%neta%'
               OR LOWER(COALESCE(title, '')) LIKE '%software engineering intern%'
               OR LOWER(COALESCE(title, '')) LIKE '%yazılım mühendisliği stajyeri%'
               OR LOWER(COALESCE(title, '')) LIKE '%yazilim muhendisligi stajyeri%'
            """
        )
    )
    return [str(row[0]) for row in result]


def _update_base_experience(connection, experience_id: str) -> None:
    connection.execute(
        sa.text(
            """
            UPDATE experiences
            SET title = :title,
                organization = :organization,
                location = :location,
                description = :description
            WHERE id = :experience_id
            """
        ),
        {**EXPERIENCE_COPY, "experience_id": experience_id},
    )


def _upsert_translation(
    connection, experience_id: str, language: str, values: dict
) -> None:
    existing = connection.execute(
        sa.text(
            """
            SELECT id
            FROM experience_translations
            WHERE experience_id = :experience_id AND language = :language
            """
        ),
        {"experience_id": experience_id, "language": language},
    ).first()
    parameters = {
        **values,
        "experience_id": experience_id,
        "language": language,
    }

    if existing:
        connection.execute(
            sa.text(
                """
                UPDATE experience_translations
                SET title = :title,
                    organization = :organization,
                    location = :location,
                    description = :description
                WHERE experience_id = :experience_id AND language = :language
                """
            ),
            parameters,
        )
        return

    connection.execute(
        sa.text(
            """
            INSERT INTO experience_translations
                (id, experience_id, language, title, organization, location, description)
            VALUES
                (:id, :experience_id, :language, :title, :organization, :location, :description)
            """
        ),
        {**parameters, "id": str(uuid.uuid4())},
    )


def upgrade() -> None:
    """Update the NETAŞ record and ensure both language translations exist."""
    connection = op.get_bind()
    for experience_id in _neta_experience_ids(connection):
        _update_base_experience(connection, experience_id)
        _upsert_translation(connection, experience_id, "en", EXPERIENCE_COPY)
        _upsert_translation(connection, experience_id, "tr", TURKISH_COPY)


def downgrade() -> None:
    """Keep the corrected copy on downgrade; this is a data-only forward fix."""
