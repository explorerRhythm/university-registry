# University Student Registry

A full-stack web app for managing university student records. Add, edit, delete and filter students by name, ID, faculty, course and admission year. It comes pre-loaded with 84 sample students across 6 faculties and 16 courses.

**Live demo:** https://university-registry.vercel.app/
*(The backend runs on a free host that sleeps when idle, so the first load after a quiet period can take about a minute.)*

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38BDF8?logo=tailwindcss&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)

<!-- Add a screenshot: save it as docs/screenshot.png, then uncomment the next line -->
<!-- ![Student registry screenshot](docs/screenshot.png) -->

## Features

- **Add, edit and delete students** with validation on both the form and the server
- **Search** by student name or ID
- **Filter** by faculty, course and admission year (the course list narrows to the chosen faculty)
- **Sortable columns** and **pagination** (10 students per page)
- **Automatic student IDs**: pick a course and year and the next free ID is suggested, such as `2024-CSE-003`
- **Duplicate protection**: student IDs are unique, and a course must belong to the chosen faculty
- **Pre-loaded data**: 84 students, 6 faculties and 16 courses so the registry looks established from the start
- Responsive layout with keyboard-friendly dialogs

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React 18, Tailwind CSS |
| Backend | Node.js, Express, `mysql2` |
| Database | MySQL (MariaDB via XAMPP also works) |
| Hosting | Vercel (frontend), Render (backend), Aiven (database) |

## How it fits together

```
Browser  ->  Next.js site (Vercel)  ->  Express API (Render)  ->  MySQL (Aiven)
```

## Project structure

```
university-registry/
├── database/
│   ├── schema.sql        # tables: faculties, courses, students
│   └── seed.sql          # sample data
├── backend/
│   ├── src/
│   │   ├── server.js     # Express app
│   │   ├── db.js         # MySQL connection pool
│   │   ├── routes/       # students.js, meta.js
│   │   └── scripts/setup-db.js
│   └── .env.example
└── frontend/
    ├── app/              # pages and layout
    ├── components/       # table, filters, modal, pagination
    └── lib/api.js        # API address and request helper
```

## Run it locally

**You need:** Node.js 18 or newer, and MySQL (for example XAMPP with MySQL started).

### 1. Backend and database

```bash
cd backend
npm install
```

Create `backend/.env` (copy `.env.example`) and fill in your database login:

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=university_registry
```

Then create the database, load the sample data, and start the API:

```bash
npm run db:setup
npm run dev
```

Check it works: open http://localhost:5000/api/health, which should show `{"ok":true}`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000.

> The API address is set in `frontend/lib/api.js`. For local development, point it at `http://localhost:5000/api`.

## Environment variables (backend)

| Variable | Purpose | Example |
|---|---|---|
| `PORT` | Port the API listens on (hosts like Render set this for you) | `5000` |
| `CLIENT_ORIGIN` | The frontend address allowed to call the API (CORS), with no trailing slash | `http://localhost:3000` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `3306` |
| `DB_USER` | Database user | `root` |
| `DB_PASSWORD` | Database password | *(your password)* |
| `DB_NAME` | Database name | `university_registry` |
| `DB_SSL` | Set to `true` for hosted databases that require SSL | `true` |

Never commit `.env` files. They are listed in `.gitignore`.

## API reference

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/health` | Check the server and database connection |
| GET | `/api/students` | List students. Query: `search`, `faculty`, `course`, `year`, `sort`, `dir`, `page`, `limit` |
| GET | `/api/students/next-id` | Suggest the next free ID. Query: `courseId`, `year` |
| POST | `/api/students` | Add a student |
| PUT | `/api/students/:id` | Update a student |
| DELETE | `/api/students/:id` | Delete a student |
| GET | `/api/meta` | Faculties with their courses, and admission years |
| GET | `/api/stats` | Totals shown on the page |

Student IDs follow the pattern `YEAR-COURSECODE-NNN`, for example `2022-CSE-014`, and must be unique.

## Deployment

1. **Database (Aiven):** create a free MySQL service. Put its connection details in `backend/.env` with `DB_SSL=true` and run `npm run db:setup` once to create the tables and load the sample data. Then restore your local `.env`.
2. **Backend (Render):** create a Web Service from this repo with Root Directory `backend`, Build Command `npm install`, Start Command `npm start`. Add the `DB_*` variables and set `CLIENT_ORIGIN` to your Vercel address.
3. **Frontend (Vercel):** import this repo with Root Directory `frontend`, and make sure `frontend/lib/api.js` uses your Render address followed by `/api`.

Both Vercel and Render redeploy automatically when you push to `main`.

## Troubleshooting

| Problem | Likely cause and fix |
|---|---|
| "Can't reach the server" on the site | The backend is asleep (open `/api/health` and wait for `{"ok":true}`), the API address in `frontend/lib/api.js` is wrong, or `CLIENT_ORIGIN` doesn't match the site address |
| `Table ... doesn't exist` | The data was loaded into a different database. Check that `DB_NAME` matches the database where you ran `npm run db:setup` |
| `Unknown database` | `DB_NAME` names a database that doesn't exist on that server |
| `ER_ACCESS_DENIED_ERROR` | Wrong `DB_USER` or `DB_PASSWORD`, or a stray space in the value |
| `.env` values seem ignored (`undefined` host) | `.env` must be inside the `backend` folder and named exactly `.env` |
| `ECONNREFUSED` locally | MySQL isn't running. Start it in XAMPP |

## Resetting the data

`npm run db:setup` drops and recreates the tables, then reloads the sample data. Running it wipes any students you added yourself.

## Author

Built by [explorerRhythm](https://github.com/explorerRhythm).
