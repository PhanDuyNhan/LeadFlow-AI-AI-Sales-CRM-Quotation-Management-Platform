# Implementation Plan: LeadFlow AI CRM — Full MVP

**Branch**: `main` | **Date**: 2026-05-26 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-leadflow-crm-mvp/spec.md`

## Summary

LeadFlow AI is a full-stack CRM and sales automation web application for small
businesses and sales teams. The MVP delivers: JWT-based authentication with
admin/user role separation; lead lifecycle management with search, filter, and
pagination; rule-based AI lead scoring and follow-up message generation;
quotation management with auto-calculated totals and a Draft→Sent→Accepted/
Rejected lifecycle; follow-up task tracking; and a real-time dashboard with
12 metric cards and 4 charts.

Frontend: React 18 + Vite + Tailwind CSS SPA, deployed to Vercel.
Backend: Node.js + Express.js REST API + MongoDB Atlas, deployed to Render or
Railway.

## Technical Context

**Language/Version**: JavaScript — Node.js 18+ (backend), React 18 (frontend)

**Primary Dependencies**:
- Frontend: React 18, Vite 5, Tailwind CSS 3, React Router v6, Axios,
  React Hook Form, Zod, Recharts, React Hot Toast, Context API (auth state)
- Backend: Express.js 4, Mongoose 8, jsonwebtoken, bcryptjs, dotenv, cors,
  helmet, express-validator

**Storage**: MongoDB (Atlas in production; local connection string in
development)

**Testing**: Manual testing with Postman / Thunder Client per Constitution
Principle VII. Each module has documented request/response examples.

**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge);
Vercel (frontend), Render or Railway (backend)

**Project Type**: Full-stack web application — SPA frontend + REST API backend

**Performance Goals**:
- Lead list search/filter: perceptibly instant for ≤1,000 records
- AI scoring and message generation: ≤3 seconds
- Dashboard metrics load: ≤2 seconds on a standard internet connection

**Constraints**:
- No offline support
- No live external AI API calls in MVP
- No email, SMS, or payment integrations in MVP
- Single-tenant only (no multi-org)
- Password hashes must never appear in any API response

**Scale/Scope**: Portfolio MVP — 10 frontend pages, 7 backend modules,
4 database models, ~40 REST endpoints

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Gate | Status |
|-----------|------|--------|
| I. MVP-First Scope | Only MVP features planned: Auth, Leads, Quotations, Tasks, Dashboard, Mock AI. No email/SMS/payment/mobile/multi-tenant. | ✅ PASS |
| II. Technology Stack | Exact stack matches constitution. `client/` + `server/` structure. Context API chosen for auth state (simpler than Zustand for portfolio). express-validator chosen for backend validation. | ✅ PASS |
| III. Security | bcrypt password hashing; JWT on all protected routes; password hash excluded from all responses; all secrets in `.env`; admin/user role middleware enforced. | ✅ PASS |
| IV. Code Quality | Full layered architecture: controllers/services/models/routes/middleware/validators; business logic only in services; reusable React components; `{ success: true, message, data }` / `{ success: false, message, errors }` response format enforced. | ✅ PASS |
| V. UI/UX | Sidebar layout, header, cards, tables, forms, badges, modals, loading/empty states, confirm dialogs, toast notifications, responsive 375px–1440px. | ✅ PASS |
| VI. AI Strategy | Rule-based/mock only; all logic isolated in `server/src/services/aiService.js`; no live external calls; interface designed for future swap to OpenAI/Claude. | ✅ PASS |
| VII. Testing | Manual test steps per feature; all endpoints documented for Postman/Thunder Client in `contracts/`. | ✅ PASS |
| VIII. Deployment | Frontend → Vercel; Backend → Render or Railway; DB → MongoDB Atlas; `.env.example` and `README.md` required. | ✅ PASS |

**All gates pass. No complexity violations.**

## Project Structure

### Documentation (this feature)

```text
specs/001-leadflow-crm-mvp/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── auth.md
│   ├── leads.md
│   ├── quotations.md
│   ├── tasks.md
│   ├── dashboard.md
│   ├── ai.md
│   └── users.md
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT by /speckit-plan)
```

### Source Code (repository root)

```text
server/
├── src/
│   ├── config/
│   │   └── db.js                        # MongoDB connection
│   ├── models/
│   │   ├── User.js
│   │   ├── Lead.js
│   │   ├── Quotation.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── lead.routes.js
│   │   ├── quotation.routes.js
│   │   ├── task.routes.js
│   │   ├── dashboard.routes.js
│   │   └── ai.routes.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── lead.controller.js
│   │   ├── quotation.controller.js
│   │   ├── task.controller.js
│   │   ├── dashboard.controller.js
│   │   └── ai.controller.js
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   ├── lead.service.js
│   │   ├── quotation.service.js
│   │   ├── task.service.js
│   │   ├── dashboard.service.js
│   │   └── aiService.js                 # Isolated AI logic (rule-based MVP)
│   ├── middleware/
│   │   ├── auth.middleware.js           # JWT verification
│   │   ├── role.middleware.js           # Admin/user enforcement
│   │   └── error.middleware.js          # Centralised error handler
│   ├── validators/
│   │   ├── auth.validator.js
│   │   ├── lead.validator.js
│   │   ├── quotation.validator.js
│   │   └── task.validator.js
│   └── utils/
│       ├── response.js                  # Success/error response helpers
│       └── pagination.js               # Offset pagination helper
├── .env
├── .env.example
├── package.json
└── server.js                           # Express entry point

client/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── ConfirmDialog.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── Pagination.jsx
│   │   │   └── SearchInput.jsx
│   │   ├── leads/
│   │   │   ├── LeadTable.jsx
│   │   │   ├── LeadFilters.jsx
│   │   │   ├── LeadForm.jsx
│   │   │   └── AILeadPanel.jsx
│   │   ├── quotations/
│   │   │   ├── QuotationTable.jsx
│   │   │   ├── QuotationForm.jsx
│   │   │   └── LineItemEditor.jsx
│   │   ├── tasks/
│   │   │   ├── TaskList.jsx
│   │   │   └── TaskForm.jsx
│   │   └── dashboard/
│   │       ├── MetricCard.jsx
│   │       └── charts/
│   │           ├── LeadByStatusChart.jsx
│   │           ├── LeadBySourceChart.jsx
│   │           ├── QuotationStatusChart.jsx
│   │           └── RevenueForecastChart.jsx
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── LeadsPage.jsx
│   │   ├── LeadCreatePage.jsx
│   │   ├── LeadDetailPage.jsx
│   │   ├── QuotationsPage.jsx
│   │   ├── QuotationCreatePage.jsx
│   │   ├── QuotationDetailPage.jsx
│   │   ├── TasksPage.jsx
│   │   └── SettingsPage.jsx
│   ├── layouts/
│   │   ├── AppLayout.jsx               # Sidebar + Header wrapper
│   │   ├── Sidebar.jsx
│   │   └── Header.jsx
│   ├── services/
│   │   ├── api.js                      # Axios instance with JWT interceptor
│   │   ├── auth.service.js
│   │   ├── user.service.js             # Profile update + password change calls
│   │   ├── lead.service.js
│   │   ├── quotation.service.js
│   │   ├── task.service.js
│   │   ├── dashboard.service.js
│   │   └── ai.service.js
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useLeads.js
│   │   ├── useQuotations.js
│   │   └── useTasks.js
│   ├── context/
│   │   └── AuthContext.jsx             # Global auth state + token storage
│   ├── utils/
│   │   ├── formatters.js               # Currency, date, percentage helpers
│   │   └── constants.js               # Enum lists (statuses, sources, etc.)
│   └── routes/
│       ├── PrivateRoute.jsx            # Redirect to /login if unauthenticated
│       └── AppRoutes.jsx              # All route definitions
├── .env
├── .env.example
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

**Structure Decision**: Web application structure (`server/` + `client/`). Both are
independent npm projects started separately in development. No monorepo tooling
is required for this MVP.

## Complexity Tracking

> No constitution violations. This table is not required.
