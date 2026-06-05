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
  firebase/     Firestore rules and indexes
```

This keeps the project close to a simple MVC layout:

- `controllers/` is for backend request handling.
- `models/` is for backend data objects.
- `views/` is for the React frontend.
- `database/firebase/` is for Firebase database configuration.

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
