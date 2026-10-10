# Meridian University – Student Registry

Add, edit, delete and filter university students.
Stack: **Next.js 14 (App Router) · React · Tailwind CSS · Express · MySQL**

```
university-registry/
├── database/   schema.sql + seed.sql (84 pre-loaded students, 6 faculties, 16 courses)
├── backend/    Express REST API  (port 5000)
└── frontend/   Next.js app       (port 3000)
```

## Requirements
- Node.js 18+
- MySQL 8 (or MariaDB 10.5+) running locally

## 1. Database + backend
```bash
cd backend
npm install
cp .env.example .env        # Windows: copy .env.example .env
# edit .env and put your MySQL password in DB_PASSWORD
npm run db:setup            # creates the database, tables and sample records
npm run dev                 # API on http://localhost:5000
```
Prefer the MySQL CLI/Workbench? Run `database/schema.sql` then `database/seed.sql` instead of `npm run db:setup`.
Check it works: open http://localhost:5000/api/health

## 2. Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev                 # http://localhost:3000
```

## API
| Method | Route | Purpose |
|---|---|---|
| GET | `/api/students?search=&faculty=&course=&year=&sort=&dir=&page=&limit=` | List with filters, sorting, pagination |
| GET | `/api/students/next-id?courseId=&year=` | Suggest the next free student ID |
| POST | `/api/students` | Add a student |
| PUT | `/api/students/:id` | Update a student |
| DELETE | `/api/students/:id` | Delete a student |
| GET | `/api/meta` | Faculties with their courses, admission years |
| GET | `/api/stats` | Totals shown on the page |

Student IDs follow `YEAR-COURSECODE-NNN`, e.g. `2022-CSE-014`, and must be unique.

## Troubleshooting
- **"Can't reach the server"** – backend isn't running, or `NEXT_PUBLIC_API_URL` is wrong.
- **`ER_ACCESS_DENIED_ERROR`** – wrong `DB_USER` / `DB_PASSWORD` in `backend/.env`.
- **CORS error** – `CLIENT_ORIGIN` in `backend/.env` must match the URL of the frontend.
- Re-run `npm run db:setup` any time to reset the data (it drops and recreates the tables).
# university-registry
