# Architecture

adafcinema is a full-stack cinema booking system: an ASP.NET Core (.NET 10) backend
serving a React SPA, backed by Azure SQL, deployed to Azure App Service via GitHub Actions.

## System diagram

```mermaid
flowchart TD
    User([User / Browser])
    subgraph Azure[Azure App Service - France Central]
        SPA[React SPA - served at /app]
        API[ASP.NET Core API - /api/*]
        MVC[Razor MVC - legacy /]
    end
    DB[(Azure SQL - serverless, auto-pause)]
    GH[GitHub repo]
    CI[GitHub Actions - test, scan, deploy]

    User -->|HTTPS| SPA
    SPA -->|fetch /api, cookie auth| API
    API -->|EF Core, retry-on-failure| DB
    User -->|HTTPS| MVC
    GH --> CI
    CI -->|publish profile| Azure
```

## Request flow (booking)

```mermaid
sequenceDiagram
    participant U as User
    participant S as React SPA
    participant A as Reservations API
    participant D as Azure SQL
    U->>S: Select seats, Checkout, Pay (mock)
    S->>A: POST /api/reservations (per seat)
    A->>D: Validate screening + seat, INSERT (unique index)
    D-->>A: OK / unique-violation
    A->>D: Write AuditLog
    A-->>S: 200 / 409 (seat taken)
    S-->>U: Confirmation + QR e-ticket
```

## Key components

| Layer | Tech | Notes |
|-------|------|-------|
| Frontend | React 18 + TS, Vite, Bootstrap, custom CSS | Bundled locally (offline-safe); i18n EN/PL/RU |
| API | ASP.NET Core controllers under `Controllers/Api/` | Cookie auth, `[Authorize]`, rate limiting, output cache |
| Auth | ASP.NET Identity | Roles: Admin / User; lockout after 5 failed attempts |
| Data | EF Core 10 + Azure SQL | Migrations applied on startup; `EnableRetryOnFailure` |
| Audit | `AuditLog` table + `IAuditService` | Append-only record of security-relevant actions |
| CI/CD | GitHub Actions | Test + dependency scan gate, then publish-profile deploy |

## Cross-cutting

- **Concurrency:** unique index on `(ScreeningId, SeatId)` prevents double-booking;
  `RowVersion` optimistic concurrency on users.
- **Caching:** output cache on the public screenings list, evicted by tag on changes.
- **Resilience:** EF transient-retry handles Azure SQL serverless wake-ups.
- **Secrets:** connection string in Azure App Service config, never in source.
