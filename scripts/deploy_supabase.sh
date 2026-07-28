#!/usr/bin/env bash
set -euo pipefail

# Script to apply SQL migrations and deploy Supabase Edge Functions.
# Requires env vars set in CI or locally: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ACCESS_TOKEN (for supabase CLI), and SUPABASE_DB_URL (optional for psql fallback).

echo "Starting Supabase deploy script"

if [ -z "${SUPABASE_URL:-}" ] || [ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]; then
  echo "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set. Aborting."
  exit 1
fi

# Prefer supabase CLI if available
if command -v supabase >/dev/null 2>&1; then
  echo "Using supabase CLI to deploy migrations and functions"
  # login using access token if provided
  if [ -n "${SUPABASE_ACCESS_TOKEN:-}" ]; then
    echo "$SUPABASE_ACCESS_TOKEN" | supabase login --service-role
  fi

  # Run SQL migrations files (apply in order)
  for f in supabase/migrations/*.sql; do
    echo "Applying $f"
    supabase db query --file "$f"
  done

  # Deploy functions folder if present
  if [ -d "supabase/functions" ]; then
    echo "Deploying Edge Functions"
    supabase functions deploy create_order_webhook --project-ref "$SUPABASE_URL" --no-verify
  fi

else
  echo "supabase CLI not found. Please install supabase CLI or run migrations via Supabase Console."
  exit 1
fi

echo "Supabase deploy script completed"