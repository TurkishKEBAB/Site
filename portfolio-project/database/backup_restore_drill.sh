#!/usr/bin/env bash
set -euo pipefail

PGHOST="${PGHOST:-127.0.0.1}"
PGPORT="${PGPORT:-5432}"
PGUSER="${PGUSER:-postgres}"
PGPASSWORD="${PGPASSWORD:-postgres}"
PGDATABASE="${PGDATABASE:-portfolio_drill}"
SCHEMA_FILE="${SCHEMA_FILE:-migrations/01_portfolio_db_schema.sql}"
BACKUP_FILE="${BACKUP_FILE:-./portfolio_drill.dump}"
RESTORE_DB="${RESTORE_DB:-portfolio_drill_restore}"

export PGPASSWORD

echo "[1/5] Applying schema: $SCHEMA_FILE"
psql -v ON_ERROR_STOP=1 -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -f "$SCHEMA_FILE"

echo "[2/5] Seeding drill marker row"
psql -v ON_ERROR_STOP=1 -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" <<'SQL'
INSERT INTO users (username, email, password_hash, is_active)
VALUES ('drill-admin', 'drill@example.com', 'hashed-password', TRUE)
ON CONFLICT (email) DO NOTHING;
SQL

echo "[3/5] Taking backup: $BACKUP_FILE"
pg_dump --format=custom --file="$BACKUP_FILE" -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" "$PGDATABASE"

echo "[4/5] Restoring into: $RESTORE_DB"
dropdb --if-exists -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" "$RESTORE_DB"
createdb -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" "$RESTORE_DB"
pg_restore --no-owner --no-privileges -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$RESTORE_DB" "$BACKUP_FILE"

echo "[5/5] Validating restored counts"
ORIGINAL_USERS=$(psql -t -A -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -c "SELECT COUNT(*) FROM users;")
RESTORED_USERS=$(psql -t -A -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$RESTORE_DB" -c "SELECT COUNT(*) FROM users;")

echo "original_users=$ORIGINAL_USERS"
echo "restored_users=$RESTORED_USERS"

if [[ "$ORIGINAL_USERS" != "$RESTORED_USERS" ]]; then
  echo "ERROR: restore validation failed"
  exit 1
fi

echo "Backup/restore drill passed."
