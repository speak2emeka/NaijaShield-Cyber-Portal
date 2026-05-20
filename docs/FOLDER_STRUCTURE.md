# Unified Folder Structure

```text
NaijaShield-Cyber-Portal/
+-- backend/
|   +-- prisma/
|   |   +-- migrations/
|   |   +-- schema.prisma
|   |   +-- seed.ts
|   +-- src/
|   |   +-- config/          # env, logger, Prisma, Swagger, Sentry
|   |   +-- controllers/     # HTTP orchestration per module
|   |   +-- middleware/      # auth, RBAC, audit, metrics, upload, validation
|   |   +-- routes/          # public, auth, client, admin, billing, internal
|   |   +-- services/        # business logic and module boundaries
|   |   +-- types/           # Express/user and service contracts
|   |   +-- utils/           # pagination, tokens, validation, HTTP errors
|   |   +-- app.ts
|   |   +-- server.ts
|   +-- Dockerfile
+-- frontend/
|   +-- src/
|   |   +-- components/      # reusable cards, tables, alerts, modals, charts
|   |   +-- config/          # frontend observability
|   |   +-- context/         # auth and session state
|   |   +-- layouts/         # public and dashboard shells
|   |   +-- pages/
|   |   |   +-- admin/       # admin dashboard, SIEM, attack lab, billing
|   |   |   +-- auth/
|   |   |   +-- client/
|   |   |   +-- public/
|   |   +-- routes/
|   |   +-- services/        # Axios client, offline demo mode
|   |   +-- styles.css
|   +-- Dockerfile
+-- docs/
|   +-- ERD.md
|   +-- ADMIN_WIREFRAMES.md
|   +-- FOLDER_STRUCTURE.md
|   +-- openapi-3.1.yaml
+-- infra/
+-- docker-compose.yml
+-- README.md
```

## Module Boundaries

- `auth`: login, refresh tokens, MFA, sessions, zero-trust risk events.
- `client`: client dashboards, reports, tickets, requests, compliance, billing.
- `admin`: executive dashboard, client operations, Mini-SIEM, Attack Lab admin, billing.
- `reporting`: report metadata, storage, signed URLs, audit events.
- `billing`: plans, checkout, subscription lifecycle, invoices, webhooks.
- `attack-lab`: live-ready scenarios, run playback, timelines, readiness scoring.
- `security-events`: internal event ingestion, filtering, correlation, export.
