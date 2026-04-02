# Agentica 2.0 - Team 24

## AI-Powered Automatic Test Case Generator

TestGen AI is a full-stack platform that generates automated test cases from:

- Source code
- API endpoint descriptions
- User stories / requirements

It also provides:

- Quality scoring for generated tests
- Self-healing for failing tests
- CI workflow export (GitHub Actions)
- Login and signup support
- Provider toggle between API-based LLM and local custom model

## Why This Project

Manual test writing is often repetitive, slow, and inconsistent. This project reduces manual effort and helps teams improve coverage and quality by producing structured tests quickly in multiple frameworks.

## Core Features

- Multi-input generation: code, API contract, or user story
- Test modes: black-box and white-box
- Test levels: unit, integration, acceptance, system
- Output formats: Pytest, JUnit, Jest
- Built-in quality scoring: coverage, edge cases, security, readability, overall
- Self-heal panel to fix failing tests from test + error message
- One-click CI export for generated tests

## Tech Stack

### Backend

- Node.js 20+
- Express.js REST API
- PostgreSQL for persistent storage
- Redis for caching generated results
- JWT authentication
- LLM providers:
  - Groq/OpenAI-compatible API mode
  - Mock/local fallback mode for offline development

### Frontend

- React 19
- Vite
- Tailwind CSS
- Axios
- Monaco Editor

### DevOps

- Docker + Docker Compose
- Deployment targets: AWS or Vercel
- Optional GitHub Actions workflow export

## High-Level Architecture

`Frontend (React)` -> `Express REST API` -> `Redis Cache + PostgreSQL` -> `LLM Provider` -> `Generated Tests + Scores`

### Main API endpoints

- `POST /api/generate/`
- `POST /api/heal/`
- `POST /api/ci-export/`
- `GET /api/sessions/`
- `POST /api/auth/signup/`
- `POST /api/auth/login/`

## Project Structure

```text
team24/
  backend/
    src/
    package.json
  frontend/
    src/
    package.json
  docker-compose.yml
  demo_samples.md
  README.md
```

## Prerequisites

Install the following before setup:

- Docker Desktop (for containerized run)
- Node.js 20+ and npm (for local backend run)
- Node.js 20+ and npm (for local frontend run)

## Option 1: Run End-to-End with Docker (Recommended)

From the `team24` directory:

```bash
docker compose up --build
```

Services started:

- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- Express backend: `http://localhost:8000`
- React frontend: `http://localhost:5173`

Stop all services:

```bash
docker compose down
```

## Option 2: Run Locally Without Docker

### 1) Backend setup

```bash
cd backend
npm install
npm run dev
```

The backend expects PostgreSQL and Redis to be running locally, or available through the environment variables below.

### 2) Frontend setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

Frontend default API base is `http://localhost:8000/api`.

## Environment Variables

### Backend

You can use a `.env` file with these keys:

```env
PORT=8000
CLIENT_URL=http://localhost:5173
JWT_SECRET=dev-jwt-secret

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=testgen
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/testgen

REDIS_URL=redis://localhost:6379

# valid values: mock, api, openai, groq, local
LLM_PROVIDER=mock

OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
OPENAI_TEMPERATURE=0.2

GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_TEMPERATURE=0.2
```

### Frontend

Optional `.env` in `frontend/`:

```env
VITE_API_BASE=http://localhost:8000/api
```

## End-to-End User Flow

1. Start backend and frontend.
2. Open frontend at `http://localhost:5173`.
3. Sign up, then log in.
4. In Generate view:
   - Choose input type (`code`, `api`, or `story`)
   - Choose mode (`black_box` or `white_box`)
   - Choose test level
   - Select provider (`API` or `Custom Trained Model`)
   - Generate tests
5. Review generated outputs in Pytest/JUnit/Jest tabs.
6. Open Quality view to inspect score and suggestions.
7. Open Self-Heal view to repair a failing test.
8. Open CI Export view to generate GitHub Actions workflow YAML.

## Demo Inputs

Use the sample scenarios in `demo_samples.md` for quick validation of:

- Generation across levels and languages
- Provider toggle testing
- Self-heal behavior
- CI export behavior

## Deployment Notes

- Frontend can be deployed to Vercel.
- Backend can be containerized with Docker and deployed to AWS services such as ECS, App Runner, or EC2.
- PostgreSQL and Redis can be hosted with managed cloud services.

## Troubleshooting

- Backend fails to connect to PostgreSQL:
  - Verify `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, or `DATABASE_URL`.
- Backend fails to connect to Redis:
  - Verify `REDIS_URL`.
- API calls fail from frontend:
  - Confirm backend is running at `http://localhost:8000`.
  - Verify `VITE_API_BASE`.
- LLM provider errors:
  - Check API key presence for selected provider.
  - `local` currently behaves as a safe fallback mode inside the Node backend.

## Team

- Leader: Alok Kumar Das
- Deependra Kumar Singh
- Dharmendra Gora
- Jyotinder Yadav




