# Disaster Recovery & Business Continuity

## Objectives

| Metric | Target | Basis |
|--------|--------|-------|
| **RPO** (max data loss) | ≤ 24h (effectively minutes) | Azure SQL automated backups + point-in-time restore |
| **RTO** (max downtime) | ≤ 1h | Redeploy from GitHub + restore DB |

## What is backed up

| Asset | Backup mechanism | Retention |
|-------|------------------|-----------|
| Source code | GitHub (`main`) + tagged releases (`backup-*`) | Indefinite |
| Database | Azure SQL automated backups (point-in-time restore) | ~7 days (free tier) |
| App configuration | Documented in README + this repo | n/a |
| Secrets (DB connection) | Azure App Service config (not in source) | Re-enterable |

## Recovery procedures

### App is down / corrupted deploy
1. In GitHub Actions, re-run the last good deploy, **or** revert the offending commit
   and push — CI redeploys automatically.
2. If needed, deploy a tagged backup: check out `backup-*` and push to `main`.

### Database loss / corruption
1. Azure Portal → SQL database → **Restore** → choose a point in time.
2. Update the App Service `DefaultConnection` if restoring to a new database name.
3. On first start, EF migrations reconcile the schema; seed data is idempotent.

### Total resource-group loss
1. Recreate the resource group, Azure SQL (free tier), and App Service (F1) per the README.
2. Set the `DefaultConnection` connection string and `AZURE_WEBAPP_PUBLISH_PROFILE` secret.
3. Push to `main` — CI rebuilds and deploys; migrations rebuild the schema.

## Testing
DR steps should be rehearsed at least once per release by restoring the database to a
scratch instance and confirming the app boots against it.
