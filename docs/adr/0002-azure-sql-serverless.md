# ADR 0002: Azure SQL serverless + migrate-on-startup

- Status: Accepted
- Date: 2026-06-25

## Context
The app is hosted free on Azure (Azure for Students). It needs a cloud database with
no fixed monthly cost, and a fresh database must build its own schema.

## Decision
Use the **Azure SQL free serverless** tier (auto-pauses when idle). Apply EF Core
migrations on application startup. Configure `EnableRetryOnFailure` so the first
request after an idle period transparently retries while the database wakes up.

## Consequences
- Effectively $0/month, but the first request after idle takes ~30–60s.
- No manual migration step on deploy — the app self-heals its schema.
- Retry logic is required everywhere the DB is first touched (handled at the context).

## Alternatives considered
- Always-on Basic tier: small monthly cost, rejected to stay free.
- PostgreSQL on Render: free tier exists but would require an EF provider switch.
