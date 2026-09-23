# Internal Engineering Productivity Dashboard

## Problem statement

Engineering teams often work across multiple disconnected systems for deployments, incidents, environments, and developer activity. That fragmentation slows down status reporting, leads to manual spreadsheets and inconsistent metrics, and makes it difficult to answer operational questions quickly.

## Project objective

This project creates a secure, internal-facing engineering productivity dashboard that consolidates delivery health, ticket workload, environment status, and contributor activity into a single interface. The goal is to provide engineering leaders with a clear operational picture while keeping the architecture ready for future integration with real CI/CD, ticketing, and monitoring platforms.

## Features

- Secure login flow with NextAuth credentials
- Executive dashboard with KPI cards and operational summaries
- Deployment and release tracking across environments
- Ticket backlog and status monitoring
- Environment health visibility with charts and health badges
- Engineering activity metrics by contributor and team
- Team delivery health with contributor and workload rollups
- Live incident queue combining critical tickets and environment alerts
- Backend-powered workspace settings and integration status
- CSV report export for stakeholder updates
- Desktop and mobile responsive layout
- Loading, empty, and retry states for API-backed views
- Automatic polling and manual refresh controls across operational pages
- Mock API layer designed for easy real-service replacement

## Tech stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Recharts
- Lucide React
- Prisma
- PostgreSQL
- NextAuth
- ESLint

## System architecture

```text
Browser / User
    ↓
Next.js App Router frontend
    ↓
Protected route + auth layer
    ↓
API route handlers (dashboard, deployments, tickets, environments, activity, reports, teams, incidents, settings)
    ↓
Mock data services / future production service adapters
    ↓
PostgreSQL + Prisma data layer
```

## Frontend and backend architecture

### Frontend

- App Router pages under src/app
- Reusable UI components under src/components
- Light enterprise design system with white/gray surfaces and blue accents
- Client-side fetches against internal API routes

### Backend

- Route handlers under src/app/api
- Authentication with NextAuth in src/lib/auth/auth.ts
- Service layer abstraction in src/lib/services
- Database access through Prisma client in src/lib/db

## PostgreSQL + Prisma setup

This project is designed to work with PostgreSQL and Prisma for persistent data storage and future model expansion.

```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

The Prisma schema includes models for:

- User
- Deployment
- Ticket
- Environment
- EngineeringActivity

## Authentication

Authentication is handled with NextAuth using credential-based sign-in. The demo fallback account is configured from environment variables so the app stays easy to run locally without committing secrets.

Example values:

```env
DEMO_USER_EMAIL="demo@engineering.internal"
DEMO_USER_PASSWORD="replace-with-a-demo-password"
```

## API endpoints

The app exposes these route handlers:

- GET /api/dashboard
- GET /api/deployments
- GET /api/tickets
- GET /api/environments
- GET /api/activity
- GET /api/reports
- GET /api/teams
- GET /api/incidents
- GET /api/settings

Each route validates the session and returns normalized JSON payloads for the client views.

## Live refresh behavior

Operational pages use authenticated `fetch` calls with `cache: "no-store"` and poll their backend routes while open:

- Dashboard and deployments: every 30 seconds
- Tickets, activity, and teams: every 30 seconds
- Environments and incidents: every 15 seconds
- Reports and settings: every 60 seconds

Every polling page also exposes a manual refresh control in the shared header. The current implementation uses resilient mock services behind the API boundary, so replacing those services with vendor integrations does not require changing the page contracts.

## Mock API explanation

The current project uses mock data services in src/lib/services to simulate engineering telemetry from multiple internal systems. This makes the product feel realistic and allows the frontend to interact with backend routes as it would in a production environment, while remaining easy to swap for real APIs such as Jira, GitHub, GitLab, Datadog, or a CI/CD platform.

## Environment variables

Copy .env.example to .env.local and fill in the values:

```bash
cp .env.example .env.local
```

Required variables:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/engineering_dashboard"
AUTH_SECRET="replace-with-a-secure-secret"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
DEMO_USER_EMAIL="demo@engineering.internal"
DEMO_USER_PASSWORD="replace-with-a-demo-password"
NEXT_PUBLIC_DEMO_EMAIL="demo@engineering.internal"
NEXT_PUBLIC_DEMO_PASSWORD="replace-with-a-demo-password"
```

## Local setup instructions

1. Clone the repository.
2. Install dependencies:

```bash
npm install
```

3. Configure the local environment file:

```bash
cp .env.example .env.local
```

4. Update the placeholder values in .env.local.
5. Generate Prisma client:

```bash
npx prisma generate
```

6. Start the app:

```bash
npm run dev
```

## Database migration instructions

```bash
npx prisma migrate dev --name init
```

If you want to reset and reseed the local database:

```bash
npx prisma migrate reset
npx prisma db seed
```

## Seed instructions

```bash
npx prisma db seed
```

The seed script creates demo users and sample engineering data for deployments, tickets, environments, and activity records.

## How to run the project

```bash
npm install
npm run dev
```

Open http://localhost:3000 to view the dashboard.

## Build instructions

```bash
npm run lint
npm run build
```

## Deployment instructions

1. Set environment variables in the target hosting environment.
2. Ensure PostgreSQL is available and reachable.
3. Run Prisma migration during deployment:

```bash
npx prisma migrate deploy
```

4. Build the app:

```bash
npm run build
```

5. Start the production server:

```bash
npm run start
```

For hosting options such as Vercel, Railway, Render, or a containerized deployment, add the same environment variables in the platform configuration.

## Future enhancements

- Real integration with Jira, GitHub, GitLab, and CI/CD systems
- Alerting and service health thresholds
- Role-based access controls and RBAC
- Advanced filtering, saved views, and exports
- Query optimization and caching for large-scale telemetry
- Support for multi-environment and multi-team analytics

## Notes

This project intentionally uses a light professional UI and avoids dark-mode-only styling. The current data layer is mock-backed for local demo and validation purposes, while preserving a structure that can evolve into live data integrations without redesigning the app.
