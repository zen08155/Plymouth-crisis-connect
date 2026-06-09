# Plymouth Crisis Connect

React/Vite frontend with a FastAPI backend and PostgreSQL.

## Project structure

```text
app/
  controllers/  FastAPI route handlers
  core/         Authentication and shared infrastructure
  database/     SQLAlchemy engine, sessions and legacy development data
  models/       Domain models, business rules and SQLAlchemy models
  repositories/ Data access and dashboard queries
  schemas/      API request/response schemas
  views/        React UI
    App.tsx
    main.tsx
    styles.css
    assets/
      images/
      icons/
    components/

alembic/        SQL database migrations
```

The backend follows a layered MVC-style structure:

- `controllers/` handles HTTP requests.
- `models/` contains domain behavior.
- `repositories/` isolates data access.
- `views/` is for the React frontend.

The SQL foundation is available, but the existing repositories still use
`fake_database.py` until the next migration phase.

## Run locally

```bash 
npm install
npm run dev
```

In a second terminal:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
docker compose up -d database
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

Frontend: `http://localhost:5000`

Backend documentation: `http://localhost:8000/docs`

## Run with Docker

```bash
docker compose up --build
```

PostgreSQL listens on `localhost:5432`. Copy `.env.example` to `.env` before
using non-development credentials.

## Database migrations

```bash
alembic upgrade head
alembic downgrade -1
```

Create a migration after changing SQLAlchemy models:

```bash
alembic revision --autogenerate -m "describe the change"
```

## Development login

```text
Email: manager@example.com
Password: manager123
```
