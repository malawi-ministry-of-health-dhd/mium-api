#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <dump-file.sql>"
  exit 1
fi

DUMP_FILE="$1"

if [[ ! -f "$DUMP_FILE" ]]; then
  echo "Error: dump file not found: $DUMP_FILE"
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Error: .env file not found at $ENV_FILE"
  exit 1
fi

DATABASE_URL=$(grep -E '^DATABASE_URL=' "$ENV_FILE" | cut -d '=' -f2- | tr -d '"')

if [[ -z "$DATABASE_URL" ]]; then
  echo "Error: DATABASE_URL not found in .env"
  exit 1
fi

rest="${DATABASE_URL#mysql://}"
userinfo="${rest%%@*}"
DB_USER="${userinfo%%:*}"
DB_PASS="${userinfo#*:}"
hostinfo="${rest#*@}"
DB_HOST="${hostinfo%%:*}"
portdb="${hostinfo#*:}"
DB_PORT="${portdb%%/*}"
DB_NAME="${portdb#*/}"
DB_NAME="${DB_NAME%%\?*}"

echo "Loading dump into: $DB_NAME @ $DB_HOST:$DB_PORT"
echo "From file: $DUMP_FILE"

MYSQL_PWD="$DB_PASS" mysql \
  -u "$DB_USER" \
  -h "$DB_HOST" \
  -P "$DB_PORT" \
  "$DB_NAME" < "$DUMP_FILE"

echo "Done."
