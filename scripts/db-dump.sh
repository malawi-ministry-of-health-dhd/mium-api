#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Error: .env file not found at $ENV_FILE"
  exit 1
fi

# Read DATABASE_URL from .env
DATABASE_URL=$(grep -E '^DATABASE_URL=' "$ENV_FILE" | cut -d '=' -f2- | tr -d '"')

if [[ -z "$DATABASE_URL" ]]; then
  echo "Error: DATABASE_URL not found in .env"
  exit 1
fi

# Parse mysql://user:password@host:port/dbname
# Strip scheme
rest="${DATABASE_URL#mysql://}"
# user:password
userinfo="${rest%%@*}"
DB_USER="${userinfo%%:*}"
DB_PASS="${userinfo#*:}"
# host:port/dbname
hostinfo="${rest#*@}"
DB_HOST="${hostinfo%%:*}"
portdb="${hostinfo#*:}"
DB_PORT="${portdb%%/*}"
DB_NAME="${portdb#*/}"
# Strip query params if any
DB_NAME="${DB_NAME%%\?*}"

DUMP_DIR="$SCRIPT_DIR/../dumps"
mkdir -p "$DUMP_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DUMP_FILE="$DUMP_DIR/${DB_NAME}_${TIMESTAMP}.sql"

echo "Dumping database: $DB_NAME @ $DB_HOST:$DB_PORT"

MYSQL_PWD="$DB_PASS" mysqldump \
  -u "$DB_USER" \
  -h "$DB_HOST" \
  -P "$DB_PORT" \
  --single-transaction \
  --routines \
  --triggers \
  "$DB_NAME" > "$DUMP_FILE"

echo "Dump saved to: $DUMP_FILE"
