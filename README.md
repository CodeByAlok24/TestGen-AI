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

- Python 3.11+
- Django + Django REST Framework
- MySQL (Docker mode) or SQLite (local fallback)
- `python-dotenv`, `django-cors-headers`
- LLM providers:
  - Groq/OpenAI-compatible API mode
  - Local model mode via exported model engine (`TCG_Model_Export`)

### Frontend

- React 19
- Vite
- Tailwind CSS
- Axios
- Monaco Editor

### DevOps

- Docker + Docker Compose
- Optional GitHub Actions workflow export

## High-Level Architecture

`Frontend (React)` -> `Django REST API` -> `LLM Provider (API or Local Model)` -> `Generated Tests + Scores`

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
    api/
    testgen/
    TCG_Model_Export/
    manage.py
    requirements.txt
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
- Python 3.11+ and pip (for local backend run)
- Node.js 20+ and npm (for local frontend run)

## Option 1: Run End-to-End with Docker (Recommended)

From the `team24` directory:

```bash
docker compose up --build
```

Services started:

- MySQL: `localhost:3306`
- Django backend: `http://localhost:8000`
- React frontend: `http://localhost:5173`

Stop all services:

```bash
docker compose down
```

## Option 2: Run Locally Without Docker

### 1) Backend setup

```bash
cd backend
python -m venv .venv
```

Activate venv:

- Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

- macOS/Linux:

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run migrations and start server:

```bash
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

Note: if `DB_HOST` is not set, backend automatically uses SQLite.

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
DJANGO_SECRET_KEY=dev-secret-key
DJANGO_DEBUG=1
DJANGO_ALLOWED_HOSTS=*

# Optional DB settings (if omitted, SQLite is used)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=testgen
DB_USER=root
DB_PASSWORD=root

# LLM provider defaults
# valid values: mock, api, openai, groq, local
LLM_PROVIDER=mock

# If using OpenAI
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
OPENAI_TEMPERATURE=0.2

# If using Groq
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

## Local Custom Model Notes

- Local model integration is loaded from `backend/TCG_Model_Export/`.
- Model runtime requires `mlx-lm`.
- If local provider initialization fails, backend returns a descriptive error.

## Troubleshooting

- Backend fails to connect to MySQL:
  - Verify `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
  - If running locally without MySQL, remove `DB_HOST` to use SQLite fallback.
- API calls fail from frontend:
  - Confirm backend is running at `http://localhost:8000`.
  - Verify `VITE_API_BASE`.
- LLM provider errors:
  - Check API key presence for selected provider.
  - For `local`, ensure `TCG_Model_Export` exists and dependencies are installed.

## Team

- Leader: Alok Kumar Das
- Deependra Kumar Singh
- Dharmendra Gora
- Jyotinder Yadav




