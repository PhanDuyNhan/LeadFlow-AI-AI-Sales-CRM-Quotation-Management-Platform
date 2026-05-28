# LeadFlow AI — Sales CRM & Quotation Management Platform

LeadFlow AI is a full-stack CRM and sales-automation web app for small
businesses and sales teams. It covers the everyday sales workflow end to end:
capture leads, score them with a rule-based "AI" engine, generate follow-up
messages, build quotations with auto-calculated totals, track follow-up tasks,
and watch the whole pipeline on a real-time dashboard.

> **Portfolio MVP.** The "AI" is a deterministic, rule-based engine (no external
> API calls). There is no real email / SMS / Zalo / WhatsApp / payment
> integration and the app is single-tenant by design.

---

## Features

- **Authentication & roles** — JWT auth with register / login / logout. Two
  roles: `admin` (sees all data) and `user` (sees only what they created or are
  assigned). Passwords are bcrypt-hashed and never returned by the API.
- **Lead management** — Full CRUD with search, status / score / source filters,
  date range, sorting, and pagination. Inline status updates and per-lead notes.
- **AI lead intelligence** — "Analyze Lead" returns a Hot / Warm / Cold score
  with a human-readable reason and suggested next action. "Generate Follow-up
  Message" produces an editable, copyable, regeneratable message per purpose,
  with a safe fallback if generation fails.
- **Quotation management** — Quotations linked to leads with dynamic line items;
  subtotal / discount / tax / total auto-calculate. Lifecycle
  `Draft → Sent → Accepted / Rejected / Expired`. Accepted quotations lock item
  editing; only `Draft` quotations are deletable. Accepting can mark the linked
  lead as `Won`.
- **Follow-up tasks** — Today / Overdue / All tabs, priorities, due dates, and
  optional links to leads. Overdue sweep happens automatically on list. Complete
  / edit / delete with confirmation.
- **Dashboard analytics** — 12 metric cards and 4 charts (leads by status, leads
  by source, quotations by status, 6-month revenue forecast), plus today's and
  overdue follow-ups and a top-hot-leads table. All values are role-scoped.
- **Consistent UI/UX** — Reusable buttons, badges, tables, modals, and forms;
  loading, empty, and error states everywhere; inline form validation; toast
  notifications; clear delete-confirm dialogs; responsive from mobile to desktop.

---

## Tech Stack

| Layer        | Technology                                                                 |
| ------------ | -------------------------------------------------------------------------- |
| Frontend     | React 19, Vite, Tailwind CSS, React Router, Axios, React Hook Form + Zod, Recharts, React Hot Toast |
| Backend      | Node.js, Express, Mongoose                                                  |
| Database     | MongoDB (local in dev, MongoDB Atlas in production)                         |
| Auth         | JSON Web Tokens (`jsonwebtoken`) + bcrypt (`bcryptjs`)                       |
| Security     | `helmet`, `cors`, `express-validator`                                       |
| Deployment   | Vercel (frontend) · Render or Railway (backend) · MongoDB Atlas (database)  |
| Testing      | Manual API testing via Postman / Thunder Client (checklists in `docs/testing/`) |

---

## Folder Structure

```text
LeadFlow-AI.../
├── client/                     # React + Vite SPA (frontend)
│   ├── src/
│   │   ├── components/         # common/ leads/ quotations/ tasks/ dashboard/
│   │   ├── pages/              # Login, Register, Dashboard, Leads, Quotations, Tasks, 404
│   │   ├── layouts/            # AppLayout (header + nav shell)
│   │   ├── routes/             # AppRoutes, PrivateRoute, PublicOnlyRoute
│   │   ├── services/           # Axios API clients (auth, lead, quotation, task, ai, dashboard)
│   │   ├── context/            # AuthContext (token + user state)
│   │   ├── hooks/              # useAuth, useLeads
│   │   └── utils/              # formatters, constants
│   ├── .env.example
│   └── vercel.json             # SPA rewrite for client-side routing on Vercel
│
├── server/                     # Express + Mongoose REST API (backend)
│   ├── src/
│   │   ├── config/             # db.js (Mongo connection)
│   │   ├── models/             # User, Lead, Quotation, Task
│   │   ├── routes/             # auth, lead, ai, quotation, task, dashboard, health
│   │   ├── controllers/        # request handlers
│   │   ├── services/           # business logic (incl. aiService.js)
│   │   ├── middleware/         # auth, role, error handling
│   │   ├── validators/         # express-validator chains
│   │   ├── utils/              # response + pagination helpers
│   │   └── scripts/seed.js     # demo data seeder
│   ├── .env.example
│   └── server.js               # Express entry point
│
├── docs/testing/               # Manual test checklists per module
├── specs/                      # Spec-Kit specification, plan, contracts, tasks
└── README.md
```

---

## Getting Started (Local Development)

### Prerequisites

- Node.js 18+ and npm 9+
- MongoDB — a local `mongod` instance **or** a free MongoDB Atlas cluster

### 1. Clone

```bash
git clone <repo-url>
cd LeadFlow-AI-AI-Sales-CRM-Quotation-Management-Platform
```

### 2. Backend

```bash
cd server
cp .env.example .env          # then edit .env (see Environment Variables below)
npm install
npm run dev                   # API on http://localhost:5000
```

### 3. Frontend (second terminal)

```bash
cd client
cp .env.example .env          # defaults to http://localhost:5000/api
npm install
npm run dev                   # app on http://localhost:5173
```

Open **http://localhost:5173** and register an account, or seed demo data
(below) and log in with a demo account.

> On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp`.

---

## Environment Variables

### `server/.env`

| Variable         | Required | Example                                  | Notes |
| ---------------- | -------- | ---------------------------------------- | ----- |
| `NODE_ENV`       | no       | `development`                            | `production` when deployed |
| `PORT`           | no       | `5000`                                   | Render/Railway inject their own — read from env |
| `MONGO_URI`      | **yes**  | `mongodb://localhost:27017/leadflow`     | Atlas SRV string in production |
| `JWT_SECRET`     | **yes**  | a long random string                     | `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `JWT_EXPIRES_IN` | no       | `7d`                                     | Token lifetime |
| `CLIENT_URL`     | **yes**  | `http://localhost:5173`                  | CORS allow-list; set to the deployed frontend URL in production (exact match, no trailing slash) |

### `client/.env`

| Variable        | Required | Example                       | Notes |
| --------------- | -------- | ----------------------------- | ----- |
| `VITE_API_URL`  | **yes**  | `http://localhost:5000/api`   | Backend API base URL (note the `/api` suffix). In production, point it at the deployed backend, e.g. `https://leadflow-api.onrender.com/api`. This is the project's frontend API base URL variable. |

Both `.env` files are git-ignored. Never commit real secrets; commit only the
`.env.example` templates.

---

## API Overview

Base URL: `http://localhost:5000/api`. All responses use a consistent envelope:

```jsonc
// success
{ "success": true, "message": "...", "data": { } }
// error
{ "success": false, "message": "...", "errors": [ ] }
```

Every route except `register`, `login`, and `health` requires
`Authorization: Bearer <token>`.

| Method | Endpoint                         | Description                              |
| ------ | -------------------------------- | ---------------------------------------- |
| GET    | `/health`                        | Liveness check                           |
| POST   | `/auth/register`                 | Create account, returns JWT + user       |
| POST   | `/auth/login`                    | Log in, returns JWT + user               |
| GET    | `/auth/me`                       | Current user profile                     |
| GET    | `/leads`                         | List leads (search / filter / paginate)  |
| POST   | `/leads`                         | Create lead                              |
| GET    | `/leads/minimal`                 | Minimal lead list (for dropdowns)        |
| GET    | `/leads/:id`                     | Lead detail                              |
| PUT    | `/leads/:id`                     | Update lead                              |
| PATCH  | `/leads/:id/status`              | Update lead status only                  |
| POST   | `/leads/:id/notes`               | Add a note                               |
| POST   | `/leads/:id/analyze`             | Run AI lead scoring                      |
| DELETE | `/leads/:id`                     | Delete lead (owner/admin)                |
| POST   | `/ai/follow-up-message`          | Generate a follow-up message             |
| GET    | `/ai/follow-up-purposes`         | List message purposes                    |
| GET    | `/quotations`                    | List quotations                          |
| GET    | `/quotations/generate-code`      | Suggest a unique quotation code          |
| GET    | `/quotations/by-lead/:leadId`    | Quotations for a lead                    |
| POST   | `/quotations`                    | Create quotation                         |
| GET    | `/quotations/:id`                | Quotation detail                         |
| PUT    | `/quotations/:id`                | Update quotation (locked when Accepted)  |
| PATCH  | `/quotations/:id/status`         | Send / Accept / Reject (+ lead status)   |
| DELETE | `/quotations/:id`                | Delete quotation (Draft only)            |
| GET    | `/tasks`                         | List tasks (filter / search)             |
| GET    | `/tasks/today`                   | Today's tasks + leads to follow up       |
| GET    | `/tasks/overdue`                 | Overdue tasks                            |
| POST   | `/tasks`                         | Create task                              |
| GET    | `/tasks/:id`                     | Task detail                              |
| PUT    | `/tasks/:id`                     | Update task                              |
| PATCH  | `/tasks/:id/complete`            | Mark task complete                       |
| DELETE | `/tasks/:id`                     | Delete task                              |
| GET    | `/dashboard`                     | Full dashboard payload (metrics + charts)|

Per-section dashboard routes also exist (`/dashboard/summary`,
`/dashboard/lead-by-status`, `/dashboard/revenue-forecast`, etc.). Full
request/response examples live in `specs/001-leadflow-crm-mvp/contracts/`.

---

## Demo Accounts (Seed Script)

The seed script creates two demo accounts plus sample leads, quotations, and
tasks. It is **idempotent** (safe to re-run) and **non-destructive** by default.

```bash
cd server
npm run seed              # create demo accounts + sample data if not present
npm run seed -- --reset   # wipe ONLY the demo accounts' data and rebuild it
```

Demo logins (throwaway portfolio credentials — not real secrets):

| Role  | Email               | Password      |
| ----- | ------------------- | ------------- |
| Admin | `admin@leadflow.ai` | `admin123456` |
| User  | `user@leadflow.ai`  | `user123456`  |

The `--reset` flag only ever touches the two demo accounts and the data they
own; any other users' data is left intact.

---

## Manual Testing Checklist

Detailed, copy-pasteable checklists live in [`docs/testing/`](docs/testing):

- [`auth-tests.md`](docs/testing/auth-tests.md) — register, login, tokens, role scoping
- [`leads-tests.md`](docs/testing/leads-tests.md) — CRUD, validation, search/filter, scoping
- [`ai-tests.md`](docs/testing/ai-tests.md) — Hot/Warm/Cold scoring, follow-up messages, fallback
- [`quotations-tests.md`](docs/testing/quotations-tests.md) — totals, lifecycle, locking, delete rules
- [`tasks-tests.md`](docs/testing/tasks-tests.md) — today/overdue, complete, scoping
- [`dashboard-tests.md`](docs/testing/dashboard-tests.md) — metrics, charts, scoping, empty state

**Quick smoke test (golden path):** register → create a lead → Analyze Lead →
create a quotation → Send → Accept (mark lead Won) → create a task due today →
open the Dashboard and confirm the metrics reflect what you just did.

---

## Deployment

The frontend and backend deploy independently.

### Database — MongoDB Atlas

1. Create a free **M0** cluster at <https://www.mongodb.com/atlas>.
2. Create a database user (username + password).
3. Network Access → add `0.0.0.0/0` (or your host's egress IPs) so the backend
   host can connect.
4. Copy the **SRV connection string** and append the database name, e.g.
   `mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/leadflow?retryWrites=true&w=majority`.
   This is your production `MONGO_URI`.

### Backend — Render (or Railway)

1. New **Web Service** from your repo, **Root Directory** = `server`.
2. Build command: `npm install` · Start command: `npm start`.
3. Environment variables: `NODE_ENV=production`, `MONGO_URI` (Atlas string),
   `JWT_SECRET` (long random), `JWT_EXPIRES_IN=7d`, and `CLIENT_URL` (your
   Vercel URL — see note below). Leave `PORT` unset; the platform provides it.
4. Deploy, then note the public API URL (e.g. `https://leadflow-api.onrender.com`).
   Optionally run the seed once from the service shell: `npm run seed`.

> Railway is equivalent: set the same env vars and a `npm start` start command
> with the service rooted at `server`.

### Frontend — Vercel

1. New Project from your repo, **Root Directory** = `client` (framework: Vite).
2. Environment variable: `VITE_API_URL = https://<your-backend>/api`
   (set for Production and Preview), then redeploy so the build picks it up.
3. `client/vercel.json` already adds the SPA rewrite so deep links / refreshes
   resolve to `index.html` instead of 404ing.

### Production environment checklist

- [ ] **Backend** `MONGO_URI` points at the Atlas cluster
- [ ] **Backend** `JWT_SECRET` is a fresh long random string (not the example)
- [ ] **Backend** `NODE_ENV=production`
- [ ] **Backend** `CLIENT_URL` exactly matches the deployed frontend origin
      (no trailing slash) — **CORS will block the app otherwise**
- [ ] **Frontend** `VITE_API_URL` points at the deployed backend and ends with `/api`
- [ ] Atlas Network Access allows the backend host to connect
- [ ] No real secrets committed; only `.env.example` files are in git
- [ ] After both are live, hard-refresh a deep link (e.g. `/leads`) to confirm
      the SPA rewrite works

---

## Future Improvements

- Swap the rule-based AI for a real LLM (OpenAI / Claude) behind the existing
  `aiService` interface.
- Real email / SMS / Zalo / WhatsApp follow-up delivery.
- Settings & profile page (update name/email, change password).
- Multi-tenant / multi-organization support with team management.
- Automated test suite (Vitest + Supertest) and CI.
- CSV / PDF export for quotations and lead lists.
- Activity timeline and audit log per lead.

---

## License

ISC — portfolio / educational project.
