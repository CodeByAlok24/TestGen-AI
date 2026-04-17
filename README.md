# TestGen AI
TestGen AI is a full-stack test automation platform that generates unit, integration, acceptance, and system test cases from code, API descriptions, and user stories. It also includes quality scoring, self-healing support, CI workflow export, gamification, user-linked history, and DevSecOps-focused security and CI checks.

This project is especially useful for demos and academic presentations because it shows how AI-assisted testing, application security, and CI/CD practices can be combined in one product.

## Demo Summary

You can describe this project in one line as:

> An AI-powered test generation platform with built-in security controls, MongoDB-backed history, gamification, and GitHub Actions-based DevSecOps checks.

## ScreenShots 
<img width="1486" height="644" alt="Screenshot 2026-04-10 125048" src="https://github.com/user-attachments/assets/f3faa21c-88d9-452a-a05f-d3ebd0dd1dcb" />

<img width="1410" height="841" alt="Screenshot 2026-04-10 124351" src="https://github.com/user-attachments/assets/bd4c13e5-5099-4915-97a3-2c8b56fe7425" />

<img width="983" height="834" alt="Screenshot 2026-04-10 124929" src="https://github.com/user-attachments/assets/86990dcf-e40f-4e52-8735-5fef0a96f1d1" />


## Core Features

- Generate tests from:
  - source code
  - API input
  - user stories
- Support multiple test levels:
  - unit
  - integration
  - acceptance
  - system
- Export output in:
  - Pytest
  - JUnit
  - Jest
- Quality scoring for generated tests
- Self-heal failing tests
- Export GitHub Actions CI workflow YAML
- Login, signup, and OTP-based auth flow
- Gamified dashboard with XP, streaks, trophies, and history
- MongoDB-backed test session history with generated-by user information

## Tech Stack

### Frontend

- React 19
- Vite
- Axios
- Framer Motion
- Recharts
- Monaco Editor
- Three.js / React Three Fiber packages available

### Backend

- Node.js
- Express
- MongoDB
- JWT authentication
- bcrypt password hashing
- Optional runtime cache layer

### DevSecOps

- GitHub Actions CI workflow
- CodeQL security analysis
- npm audit in CI
- Security headers
- Rate limiting
- CORS restrictions
- Input validation and normalization

## Real Architecture

```text
React Frontend
   -> Express REST API
   -> MongoDB for users, sessions, gamification, contributions
   -> Optional cache/runtime stores
   -> LLM provider or mock/local provider
```

## Project Structure

```text
TestGen_AI/
  .github/
    workflows/
      ci.yml
      codeql.yml
  backend/
    src/
  frontend/
    src/
  diagrams/
  docker-compose.yml
  README.md
```

## Authentication and Security

This project already includes visible security controls that you can talk about during your demo.

### Application Security Implemented

- Password hashing with `bcryptjs`
- JWT-based authentication with signed session IDs
- Session validation for protected routes
- Rate limiting on auth endpoints
- Secure HTTP headers via middleware
- Content Security Policy
- Restricted CORS origin handling
- Username and email normalization before storage/comparison
- Validation for signup input
- Duplicate user prevention
- Protected history and gamification APIs

### Files Where Security Was Added

- [app.js](D:/Hackathon/TestGenAI-1/TestGen_AI/backend/src/app.js)
- [middleware.js](D:/Hackathon/TestGenAI-1/TestGen_AI/backend/src/middleware.js)
- [utils.js](D:/Hackathon/TestGenAI-1/TestGen_AI/backend/src/utils.js)
- [store.js](D:/Hackathon/TestGenAI-1/TestGen_AI/backend/src/store.js)

### Security Headers Added

The backend sends headers like:

- `Content-Security-Policy`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: no-referrer`
- `Permissions-Policy`
- `Cross-Origin-Opener-Policy`
- `Cross-Origin-Resource-Policy`

## CI/CD and GitHub Actions

This repository already contains GitHub Actions workflows.

### Workflow Files

- [ci.yml](D:/Hackathon/TestGenAI-1/TestGen_AI/.github/workflows/ci.yml)
- [codeql.yml](D:/Hackathon/TestGenAI-1/TestGen_AI/.github/workflows/codeql.yml)

### What CI Does

The CI workflow runs:

- frontend `npm ci`
- frontend `npm audit --omit=dev --audit-level=high`
- frontend `npm run lint`
- frontend `npm run build`
- backend `npm ci`
- backend `npm audit --omit=dev --audit-level=high`
- backend syntax validation using `node --check`

### What CodeQL Does

CodeQL performs static security analysis for JavaScript and runs on:

- push
- pull request
- weekly schedule

### Is CI/CD Working?

Locally, the validation steps are working.

Verified checks:

- frontend lint passes
- frontend build passes
- backend syntax checks pass

Important note for demo:

- The workflows are correctly configured in the repository
- GitHub Actions only runs on GitHub after the project is pushed to a GitHub repository
- So the pipeline is ready, but GitHub-hosted execution requires the repo to exist online

## Environment Variables

Create a root `.env` file.

Example:

```env
PORT=8000
CLIENT_URL=http://localhost:5173
JWT_SECRET=change-this-secret
OTP_TTL_SECONDS=300
AUTH_SESSION_TTL_SECONDS=604800

LLM_PROVIDER=mock
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
OPENAI_TEMPERATURE=0.2
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_TEMPERATURE=0.2
MONGO_URL=mongodb://localhost:27017
MONGO_DB=testgen
```

Frontend optional env:

```env
VITE_API_BASE=http://localhost:8000/api
```

## Local Run Instructions

### Option 1: Run with Docker Compose

```bash
docker compose up --build
```

This starts:

- MongoDB
- Backend on `http://localhost:8000`
- Frontend on `http://localhost:5173`

### Option 2: Run Backend and Frontend Separately

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Main API Endpoints

- `POST /api/auth/signup/`
- `POST /api/auth/login/`
- `POST /api/auth/request-otp/`
- `POST /api/auth/verify-otp/`
- `GET /health`
- `POST /api/generate/`
- `POST /api/heal/`
- `POST /api/ci-export/`
- `GET /api/testcases/history/`
- `GET /api/gamification/user/:userId`
- `GET /api/challenges/daily`
- `GET /api/challenges/weekly`

## Database Usage

MongoDB stores:

- users
- generated test sessions
- gamification progress
- contribution data
- leaderboard-related records

Test session history also stores who generated the session, which is useful for demo traceability.

## Important Security Note

Do not commit real secrets from `.env` to GitHub. If any real keys or database URLs were exposed earlier, rotate them before publishing the repository.
