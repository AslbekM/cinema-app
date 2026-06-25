# Security Policy

## Reporting a vulnerability
Please report security issues privately to **security@adafcinema.app** (do not open a
public issue). We aim to acknowledge within 72 hours.

## Controls in place
- **Transport:** HTTPS-only (Azure-managed certs, auto-rotated), HSTS in production.
- **Auth:** ASP.NET Identity, cookie auth (HttpOnly), Admin/User roles, `[Authorize]`
  on all API endpoints; admin endpoints role-gated.
- **Passwords:** salted PBKDF2 hashes; never logged, returned, or displayed.
- **Brute-force:** account lockout after 5 failed logins; rate limiting on auth endpoints.
- **Injection:** EF Core parameterizes all queries; React escapes output (XSS).
- **Concurrency:** unique seat index + optimistic concurrency (RowVersion).
- **Secrets:** connection string in Azure config, never in source control.
- **Audit:** append-only audit log of bookings, cancellations, and admin actions.
- **Dependencies:** Dependabot + CI scans (`dotnet list --vulnerable`, `npm audit`)
  gate deployment.
- **Privacy (GDPR):** users can permanently delete their own account and reservations.

## Known limitations
- Mock payment only — no real card data is processed or stored.
- The test project uses a SQLite library with a known advisory; it is a **test-only**
  dependency and never ships to production.
