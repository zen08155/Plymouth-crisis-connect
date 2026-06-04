# Plymouth Homepage

A simple React homepage built with Vite.

## Project structure

```text
src/
  App.tsx       Main page component
  main.tsx      React entry point
  styles.css    Global styles
  api/          Frontend API/helper functions
  assets/
    images/     Photos and image files
    icons/      Icon files
  components/  Shared React components

backend/        Backend code
firebase/       Firebase setup and configuration
```

Keep the frontend structure small. Add a new folder only when there are several
related files that are easier to understand together.

Suggested rule:

- Put one-off page code in `App.tsx`.
- Put shared reusable UI in `src/components/` only after you have real components
  to share.
- Put API calls in `src/api/` only when the frontend starts talking to the
  backend.
- Avoid `features/` unless the app grows into larger independent areas.

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
