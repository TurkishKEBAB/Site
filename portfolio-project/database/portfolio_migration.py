"""
Database migration runner for portfolio schema SQL files.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
import logging
import os
import time

import psycopg


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent


@dataclass(frozen=True)
class Migration:
    version: str
    description: str
    file_name: str
    optional: bool = False


MIGRATIONS = [
    Migration("001", "Initial schema creation", "migrations/01_portfolio_db_schema.sql"),
    Migration("002", "Seed initial data", "migrations/02_portfolio_seed_data.sql", optional=True),
]


class DatabaseMigration:
    def __init__(self, database_url: str):
        self.database_url = database_url
        self.conn: psycopg.Connection | None = None

    def connect(self) -> bool:
        try:
            self.conn = psycopg.connect(self.database_url, autocommit=True)
            logger.info("OK: Database connection established")
            return True
        except Exception as exc:
            logger.error("ERROR: Database connection failed: %s", exc)
            return False

    def disconnect(self):
        if self.conn:
            self.conn.close()
            logger.info("OK: Database connection closed")

    def _execute_sql(self, sql_text: str):
        assert self.conn is not None
        with self.conn.cursor() as cur:
            cur.execute(sql_text)

    def _resolve_migration_file(self, migration: Migration) -> Path | None:
        file_path = BASE_DIR / migration.file_name
        if file_path.exists():
            return file_path

        backup_path = Path(f"{file_path}.backup")
        if backup_path.exists():
            return backup_path

        if migration.optional:
            return None
        raise FileNotFoundError(f"Required migration file not found: {file_path}")

    def create_migration_table(self):
        sql_query = """
        CREATE TABLE IF NOT EXISTS schema_migrations (
            id SERIAL PRIMARY KEY,
            version VARCHAR(50) UNIQUE NOT NULL,
            description TEXT,
            executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            execution_time_ms INTEGER
        );
        """
        self._execute_sql(sql_query)
        logger.info("OK: Migration tracking table ready")

    def check_migration_exists(self, version: str) -> bool:
        assert self.conn is not None
        with self.conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM schema_migrations WHERE version = %s", (version,))
            return cur.fetchone()[0] > 0

    def record_migration(self, version: str, description: str, execution_time_ms: int):
        assert self.conn is not None
        with self.conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO schema_migrations (version, description, execution_time_ms)
                VALUES (%s, %s, %s)
                """,
                (version, description, execution_time_ms),
            )

    def execute_sql_file(self, file_path: Path):
        sql_text = file_path.read_text(encoding="utf-8")
        self._execute_sql(sql_text)
        logger.info("OK: Executed SQL file: %s", file_path)

    def run_migration(self, migration: Migration) -> bool:
        if self.check_migration_exists(migration.version):
            logger.info("SKIP: Migration %s already applied", migration.version)
            return True

        try:
            resolved_file = self._resolve_migration_file(migration)
            if resolved_file is None:
                logger.info("SKIP: Optional migration %s file not found", migration.version)
                return True

            logger.info("RUN: Migration %s - %s", migration.version, migration.description)
            start = time.perf_counter()
            self.execute_sql_file(resolved_file)
            elapsed_ms = int((time.perf_counter() - start) * 1000)
            self.record_migration(migration.version, migration.description, elapsed_ms)
            logger.info("OK: Migration %s completed in %sms", migration.version, elapsed_ms)
            return True
        except Exception as exc:
            logger.error("ERROR: Migration %s failed: %s", migration.version, exc)
            return False

    def run_all_migrations(self) -> bool:
        logger.info("=" * 50)
        logger.info("Starting database migrations")
        logger.info("=" * 50)

        for migration in MIGRATIONS:
            if not self.run_migration(migration):
                return False

        logger.info("=" * 50)
        logger.info("All migrations completed successfully")
        logger.info("=" * 50)
        return True

    def get_migration_status(self):
        assert self.conn is not None
        with self.conn.cursor() as cur:
            cur.execute(
                """
                SELECT version, description, executed_at, execution_time_ms
                FROM schema_migrations
                ORDER BY executed_at DESC
                """
            )
            rows = cur.fetchall()

        if rows:
            logger.info("Applied migrations:")
            for version, description, executed_at, execution_time_ms in rows:
                logger.info("  %s | %s | %s | %sms", version, description, executed_at, execution_time_ms)
        else:
            logger.info("No migrations applied yet")


def build_database_url() -> str:
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        return database_url

    host = os.getenv("DB_HOST", "localhost")
    port = os.getenv("DB_PORT", "5432")
    database = os.getenv("DB_NAME", "portfolio")
    user = os.getenv("DB_USER", "postgres")
    password = os.getenv("DB_PASSWORD", "postgres")
    return f"postgresql://{user}:{password}@{host}:{port}/{database}"


def main():
    migration = DatabaseMigration(build_database_url())
    if not migration.connect():
        raise SystemExit(1)

    try:
        migration.create_migration_table()
        migration.get_migration_status()
        success = migration.run_all_migrations()
        if not success:
            raise SystemExit(1)
    finally:
        migration.disconnect()


if __name__ == "__main__":
    main()
