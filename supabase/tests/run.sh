#!/usr/bin/env bash
# Runs the migration on a throwaway local Postgres and checks the row-level security rules.
set -euo pipefail
BIN=$(ls -d /usr/lib/postgresql/*/bin | tail -1)
DIR=$(mktemp -d)
chown postgres "$DIR" 2>/dev/null || true
ROOT=$(cd "$(dirname "$0")/../.." && pwd)
as_pg() { if [ "$(id -u)" = 0 ]; then su postgres -s /bin/bash -c "$*"; else bash -c "$*"; fi; }
as_pg "$BIN/initdb -D $DIR/data -A trust >/dev/null && $BIN/pg_ctl -D $DIR/data -o '-p 54329 -k $DIR' -l $DIR/log start >/dev/null"
trap 'as_pg "$BIN/pg_ctl -D $DIR/data stop >/dev/null"; rm -rf "$DIR"' EXIT
PSQL="$BIN/psql -h $DIR -p 54329 -U postgres -q -v ON_ERROR_STOP=1"
as_pg "$PSQL -c 'create database t'"
for f in "$ROOT/supabase/tests/rls_stub.sql" "$ROOT/supabase/migrations/0001_init.sql" "$ROOT/supabase/tests/rls_test.sql"; do
  as_pg "$PSQL -d t -f $f"
done
