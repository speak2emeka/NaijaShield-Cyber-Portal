# NaijaShield Cyber Portal

Production-oriented full-stack cybersecurity SaaS scaffold for NaijaShield Technologies.

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

## Demo Accounts

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

## Local Development

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

3. Run migrations and seed:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

4. Start backend:

```bash
npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

Swagger docs:

```text
http://localhost:5000/api/docs
```

5. Install and start frontend:

```bash
cd ../frontend
npm install
copy .env.example .env
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

## Docker

From the project root:

```bash
docker compose up --build
```

Then run seed inside the backend container if needed:

```bash
docker compose exec backend npx prisma db seed
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
- `GET /api/client/requests`
- `POST /api/client/requests`
- `GET /api/client/security-score/history`
- `GET /api/client/subscription`

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

## Production Notes

- Replace all JWT secrets with long random values.
- Set `COOKIE_SECURE=true` behind HTTPS.
- Set a real `FRONTEND_ORIGIN`.
- Use managed PostgreSQL or a hardened database host.
- Add object storage for uploaded reports.
- Add email verification and password reset before public launch.
- Add automated tests and CI before production deployment.
