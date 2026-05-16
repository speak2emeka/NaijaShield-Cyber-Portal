# NaijaShield Cyber Portal

Production-oriented full-stack cybersecurity SaaS scaffold for NaijaShield Technologies.

GitHub repository: https://github.com/speak2emeka/NaijaShield-Cyber-Portal

## What Is Included

- Public marketing pages for services, pricing, resources, and contact
- Client portal for dashboards, reports, tickets, requests, and account settings
- Admin portal for clients, tickets, requests, audit logs, and platform metrics
- Expanded portal modules for report/ticket detail pages, company profile, team management, subscription, notifications, audit logs, knowledge base, report upload, and staff management
- Enterprise hardening for Sentry, Prometheus metrics, Grafana dashboards, Redis/BullMQ queues, request correlation IDs, CI/CD, MFA, SSO readiness, email verification, password reset, object storage, billing, audit export, and permission matrices
- Advanced security platform modules for zero-trust session risk, tenant key metadata, security events, security posture, attack surface assets, compliance readiness, and a safe simulated Attack Lab
- Express API with JWT auth, refresh tokens, Prisma, PostgreSQL, Swagger UI, and security middleware
- Frontend offline demo fallback so the portal can be inspected even when the backend database is not running

## Tech Stack

- Backend: Node.js, TypeScript, Express
- Frontend: React, TypeScript, Vite
- Styling: TailwindCSS
- Database: PostgreSQL
- ORM: Prisma
- Auth: JWT access tokens and HTTP-only refresh cookies
- Validation: Zod
- Logging: Pino
- Security: Helmet, CORS, rate limiting, password hashing with Argon2
- API docs: Swagger UI
- Deployment: Docker Compose

## Demo Login

These credentials work with the seeded backend. They also work in frontend demo mode when the API at `http://localhost:5000/api` is offline.

Admin:

```text
admin@naijashield.ng
admin123
```

Client:

```text
client@example.com
client123
```

## Quick Frontend Launch

Use this when you want to inspect the UI immediately.

```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1
```

Frontend URL:

```text
http://127.0.0.1:5173
```

If the backend is not running, the frontend uses demo responses for login and dashboard data. When a real backend is reachable, normal API responses take over.

## Full Local Development

1. Install backend dependencies:

```bash
cd backend
npm install
copy .env.example .env
```

2. Start PostgreSQL locally or with Docker:

```bash
docker compose up postgres -d
```

3. Run Prisma setup and seed demo accounts:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

4. Start backend:

```bash
npm run dev
```

Backend URL:

```text
http://localhost:5000
```

Swagger docs:

```text
http://localhost:5000/api/docs
```

5. Start frontend:

```bash
cd ../frontend
npm install
copy .env.example .env
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## Docker

From the project root:

```bash
docker compose up --build
```

Then seed the backend container if needed:

```bash
docker compose exec backend npx prisma db seed
```

## Build Checks

Frontend:

```bash
cd frontend
npm run build
```

## Enterprise Operations

- Metrics: `GET /metrics` exposes Prometheus metrics for latency, errors, and queue job duration.
- Observability: set `SENTRY_DSN` and `VITE_SENTRY_DSN` to enable backend and frontend Sentry reporting.
- Background jobs: Redis is configured through `REDIS_URL`; Docker Compose includes a Redis service.
- Reports storage: set `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, and optional `S3_ENDPOINT` for S3-compatible object storage such as AWS S3, Cloudflare R2, or DigitalOcean Spaces.
- Billing: Stripe and Paystack keys are represented by `STRIPE_SECRET_KEY` and `PAYSTACK_SECRET_KEY`; hosted checkout endpoints are scaffolded under `/api/enterprise/billing`.
- MFA and SSO: TOTP MFA endpoints are available under `/api/enterprise/mfa`; SSO provider readiness is exposed under `/api/enterprise/sso/config`.
- Audit export: `GET /api/enterprise/audit-logs/export.csv` exports recent audit logs with correlation IDs, IP addresses, and user agents.
- CI/CD: GitHub Actions workflows build frontend/backend, validate Prisma, run migrations, and publish Docker images on version tags.
- Dashboards: Docker Compose includes Prometheus on `:9090` and Grafana on `:3001`.

Backend:

```bash
cd backend
npm run build
```

## Advanced Security Architecture

- Zero-trust access layer tracks session risk metadata such as device fingerprint, IP, country, user agent, abnormal signals, and step-up requirements for sensitive actions.
- Tenant-scoped key metadata stores a `tenantKeyId` per client company and exposes service-layer stubs for encryption, decryption, and key rotation. The code is ready for a real KMS provider without coupling business logic to a vendor.
- Security events act as a mini-SIEM layer for auth, admin, client, reporting, and Attack Lab activity. Client users see their own events; admins can filter global security events.
- Security posture summarizes incidents, response, coverage, and reporting into a current score with historical score tracking.
- Attack surface assets model domains, IPs, apps, and cloud assets with risk tags so discovery tooling can be plugged in later.
- Compliance readiness tracks ISO27001, SOC2, and NDPR status with checklist items and evidence links.

## Safe Attack Lab

The Attack Lab is intentionally non-weaponizable. It does not run network scans, generate exploit payloads, send phishing emails, or provide step-by-step attack instructions. All runs are synthetic playback events and tabletop narratives designed for education, readiness scoring, and defensive planning.

Client Attack Lab features:

- Scenario catalog for credential stuffing, phishing, web app probing, and insider access simulations
- Synthetic run creation through `POST /api/security-platform/client/attack-lab/runs`
- Run history and detail views with timelines, phases, attacker narrative, and defender narrative
- Interactive incident response drill with multiple-choice decision points and readiness recommendations

Admin Attack Lab features:

- Global overview of scenario usage
- Common security event type summaries
- Visibility into client adoption of simulated exercises

## Architecture

```text
NaijaShield-Cyber-Portal/
+-- backend/
|   +-- prisma/
|   |   +-- schema.prisma
|   |   +-- seed.ts
|   +-- src/
|   |   +-- config/
|   |   +-- controllers/
|   |   +-- middleware/
|   |   +-- routes/
|   |   +-- services/
|   |   +-- utils/
|   +-- Dockerfile
|   +-- package.json
+-- frontend/
|   +-- src/
|   |   +-- components/
|   |   +-- context/
|   |   +-- layouts/
|   |   +-- pages/
|   |   +-- routes/
|   |   +-- services/
|   +-- Dockerfile
|   +-- package.json
+-- docker-compose.yml
```

## API Summary

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Public:

- `POST /api/public/contact`
- `GET /api/public/blog`
- `GET /api/public/pricing`

Client:

- `GET /api/client/dashboard`
- `GET /api/client/reports`
- `GET /api/client/reports/:id`
- `GET /api/client/tickets`
- `POST /api/client/tickets`
- `PATCH /api/client/tickets/:id`
- `POST /api/client/tickets/:id/comment`
- `GET /api/client/requests`
- `POST /api/client/requests`
- `GET /api/client/security-score/history`
- `GET /api/client/subscription`
- `GET /api/client/notifications`
- `GET /api/client/audit-logs`
- `GET /api/client/knowledge-base`
- `GET /api/client/company`
- `GET /api/security-platform/client/security-posture`
- `POST /api/security-platform/client/security-posture/recalculate`
- `GET /api/security-platform/client/security-events`
- `GET /api/security-platform/client/assets`
- `GET /api/security-platform/client/compliance`
- `POST /api/security-platform/client/compliance/:id/evidence`
- `GET /api/security-platform/client/tenant-key`
- `GET /api/security-platform/client/attack-lab/scenarios`
- `GET /api/security-platform/client/attack-lab/runs`
- `POST /api/security-platform/client/attack-lab/runs`
- `GET /api/security-platform/client/attack-lab/runs/:id`
- `GET /api/security-platform/client/attack-lab/drill`
- `POST /api/security-platform/client/attack-lab/drill/score`

Admin:

- `GET /api/admin/dashboard`
- `GET /api/admin/clients`
- `GET /api/admin/clients/:id`
- `GET /api/admin/clients/:id/reports`
- `POST /api/admin/clients/:id/reports`
- `GET /api/admin/tickets`
- `PATCH /api/admin/tickets/:id`
- `GET /api/admin/requests`
- `PATCH /api/admin/requests/:id`
- `GET /api/admin/audit-logs`
- `GET /api/security-platform/admin/security-events`
- `GET /api/security-platform/admin/attack-lab/overview`
- `POST /api/security-platform/admin/clients/:clientCompanyId/rotate-key`
- `POST /api/security-platform/admin/session-risk/evaluate`

## Production Notes

- Replace all JWT secrets with long random values.
- Disable or remove frontend demo fallback before production deployment.
- Set `COOKIE_SECURE=true` behind HTTPS.
- Set a real `FRONTEND_ORIGIN`.
- Use managed PostgreSQL or a hardened database host.
- Add object storage for uploaded reports.
- Add email verification and password reset before public launch.
- Add automated tests and CI before production deployment.
