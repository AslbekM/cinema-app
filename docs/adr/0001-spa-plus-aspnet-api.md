# ADR 0001: React SPA + ASP.NET Core API

- Status: Accepted
- Date: 2026-06-25

## Context
The assignment required an ASP.NET MVC backend and a React frontend. We needed a
structure that serves both a modern SPA and keeps the API testable and deployable.

## Decision
Use ASP.NET Core for a JSON API under `/api/*` and serve a Vite-built React SPA at
`/app`. Cookie-based auth (ASP.NET Identity) is shared between MVC and the SPA; API
routes return 401/403 instead of redirecting to a login page.

## Consequences
- One deployable unit (the API hosts the SPA's static build) — simple to deploy.
- Frontend and backend can evolve independently in dev (Vite proxy to the API).
- SPA routing requires a fallback to `index.html` and a client catch-all route.
