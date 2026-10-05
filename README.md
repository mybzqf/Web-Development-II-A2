Saltmarsh Community Chest

PROG2002 Assessment 2. Public listings for charity nights in Newcastle.

- `backend` — Express + MySQL, GET only
- `front` — static pages

## Setup

Import `backend/sql/charityevents_db.sql` in MySQL Workbench.

Edit `backend/event_db.js` so the user and password match your MySQL login.

```bash
cd backend
npm install
npm start
```

API: http://localhost:3010

```bash
cd front
npm install
npm start
```

Website: http://localhost:3011

## Endpoints

- `GET /public/meets` — current and upcoming public events
- `GET /public/meets/query?date=&location=&category=` — optional filters; past events allowed
- `GET /public/meets/:id` — one event; paused rows return 404
- `GET /kinds` — filter options
