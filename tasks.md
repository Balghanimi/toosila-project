# MVP Build Plan — React + Express + Postgres

> **Rule of thumb:** Each task should be shippable on its own, with a tiny manual test.

---

1. **[Dev] Create server env files**
   - **Affected:** `server/.env.example`, `server/.env`
   - **Start:** Create `.env.example` with keys.
   - **End:** Copy to `.env` and fill local values.
   - **Acceptance:** `server/.env` contains working values (no secrets in git).
   - **Manual test:** N/A (file presence).

2. **[Dev] Create client env files**
   - **Affected:** `client/.env.example`, `client/.env`
   - **Start:** Create `.env.example` with `VITE_API_BASE_URL`.
   - **End:** Copy to `.env` and set `http://localhost:5000/api`.
   - **Acceptance:** `import.meta.env.VITE_API_BASE_URL` resolves at runtime.
   - **Manual test:** `console.log(import.meta.env.VITE_API_BASE_URL)` once in `client/src/main.jsx`; see correct URL in dev console.

3. **[Dev] Add health check route**
   - **Affected:** `server/app.js`, `server/routes/health.routes.js`
   - **Start:** New GET `/api/health` route returning `{ ok: true, time }`.
   - **End:** Mount in `app.js`.
   - **Acceptance:** `200 OK` JSON with current timestamp.
   - **Manual test:** Open `http://localhost:5000/api/health` in browser.

...

60. **[Docs] Update README with run commands**
    - **Affected:** `README.md`
    - **Start:** Add sections: env setup, start scripts, health check URL.
    - **End:** Include “Known issues” and “MVP scope”.
    - **Acceptance:** A new dev can get running in <10 min.
    - **Manual test:** Follow README from scratch on a clean machine.
