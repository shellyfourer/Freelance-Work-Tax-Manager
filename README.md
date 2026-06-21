# Freelance Tax Manager

A web application that helps freelancers calculate, manage, and understand their taxes. Currently supporting Lithuanian tax rules, with multi-country support planned.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4, shadcn/ui |
| Backend | Spring Boot 4, Java 21, Spring Security, JPA |
| Database | PostgreSQL (production), H2 (tests) |
| Auth | Google OAuth 2.0 |
| CI/CD | GitLab CI |
| Code Quality | SonarQube, JaCoCo |
| Testing | Vitest, Playwright, JUnit 5 |

## Features

- **Tax Calculator** — calculates Lithuanian freelance taxes in real time via WebSocket (debounced as the user types)
- **Income Tracking** — log income records and associate them with income sources
- **Client Management** — manage income sources (clients)
- **User Onboarding** — profile setup after first login
- **Google Login** — OAuth 2.0 authentication

## Repository Structure

```
Freelance-Tax-Manager/
├── frontend/          # Next.js app (port 3000)
└── backend/           # Spring Boot API (port 8080)
```

## Prerequisites

- Java 21
- Node.js + pnpm
- Docker & Docker Compose
- PostgreSQL (production only — local dev uses H2 in-memory)

## Getting Started

### Run with Docker Compose

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8080

### Run locally

**Backend**

```bash
cd backend
./gradlew bootRun
```

**Frontend**

```bash
cd frontend
pnpm install
pnpm dev
```

## Environment Variables

**Backend** (`backend/.env`):

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

> **Note:** `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are required — without them the backend will fail to start, as Spring Boot cannot configure the OAuth2 client (`ClientRegistrationRepository` is a required dependency). Set these up in the [Google Cloud Console](https://console.cloud.google.com/) under APIs & Services → Credentials, and add `http://localhost:8080/login/oauth2/code/google` as an authorized redirect URI.

> `DB_USERNAME` and `DB_PASSWORD` are **not** needed for local development — the dev profile uses an H2 in-memory database with hardcoded credentials. They are only required when running with the production profile.

**Frontend** (build arg / `.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Commands

### Frontend

```bash
cd frontend
pnpm dev           # Start dev server
pnpm build         # Production build
pnpm test          # Unit tests (Vitest)
pnpm test:e2e      # E2E tests (Playwright)
pnpm check         # ESLint + Prettier check
pnpm fix           # ESLint fix + Prettier write
pnpm test --coverage && sonar-scanner -Dsonar.host.url=<your-sonar-url> -Dsonar.token=<your-token>   # Run SonarQube analysis (coverage must be generated first)
```

### Backend

```bash
cd backend
./gradlew bootRun                    # Start dev server
./gradlew test                       # Run all tests
./gradlew assemble                   # Build
./gradlew test sonar -Dsonar.host.url=<your-sonar-url> -Dsonar.token=<your-token>   # Run SonarQube analysis (runs tests + JaCoCo first)
```

## Architecture

### Frontend

Layered structure with strict separation of concerns:

```
src/
  app/              # Next.js App Router pages
  components/       # UI components (no data fetching)
  lib/
    api/            # All backend communication
    types/          # Shared TypeScript types
    utils/          # Pure utility functions
  context/          # React context (auth state)
```

- Components never fetch data directly — all API calls go through `src/lib/api/`
- UI layer only interacts with the API layer, never with mock data directly

### Backend

```
src/main/java/com/shelly/freelancetaxmanager/
  calculator/       # Tax calculation logic (Lithuanian rules)
  config/           # Security, WebSocket config
  controller/       # HTTP endpoints only
  dto/              # Request/Response DTOs
  entity/           # JPA entities
  mapper/           # Entity ↔ DTO mapping
  repository/       # Data access
  websocket/        # WebSocket handler for tax calculations
```

**API endpoints:**

| Method | Path | Description |
|---|---|---|
| WS | `/ws/tax-calculator` | Real-time tax calculation (WebSocket) |
| POST | `/api/tax/calculate` | Calculate taxes (REST) |
| GET | `/api/income-records` | List all income records |
| POST | `/api/income-records` | Create income record |
| GET | `/api/income-records/{id}` | Get income record by ID |
| PUT | `/api/income-records/{id}` | Update income record |
| DELETE | `/api/income-records/{id}` | Delete income record |
| GET | `/api/clients` | List all clients (income sources) |
| POST | `/api/clients` | Create client |
| GET | `/api/clients/{id}` | Get client by ID |
| PUT | `/api/clients/{id}` | Update client |
| DELETE | `/api/clients/{id}` | Delete client |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/setup` | Complete user onboarding |

## CI/CD Pipeline

GitLab CI runs the following stages on every push:

1. **build** — compile backend, build frontend
2. **test** — backend unit tests + JaCoCo coverage; frontend unit tests + linting
3. **e2e-test** — Playwright tests against full Docker stack
4. **sonarqube-check** — static analysis for both frontend and backend
5. **push** — build and push Docker images to Docker Hub (main branch only)
6. **deploy** — pull latest images and restart containers on production server (main branch only)

## Production Deployment

The production stack runs via Docker Compose using pre-built images:

```bash
docker compose -f docker-compose.prod.yml up -d
```

Required environment variables on the server: `DB_USERNAME`, `DB_PASSWORD`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXT_PUBLIC_API_URL`.
