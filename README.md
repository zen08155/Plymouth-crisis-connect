# Plymouth Homepage

A simple React homepage built with Vite.

## Project structure

```text
app/
  controllers/  Python route/API handlers
  models/       Python data models
  views/        React UI
    App.tsx
    main.tsx
    styles.css
    assets/
      images/
      icons/
    components/

database/
  database.sql  MySQL database schema
```

This keeps the project close to a simple MVC layout:

- `controllers/` is for backend request handling.
- `models/` is for backend data objects.
- `views/` is for the React frontend.
- `database/database.sql` is for the MySQL database schema.

## Run locally

```bash 
npm install
npm run dev
```

## Run with Docker

```bash
docker compose up --build
```

The website will be available at `http://localhost:5000`.
