---
description: "Implementation tasks for LeadFlow AI CRM — Full MVP"
---

# Tasks: LeadFlow AI CRM — Full MVP

**Input**: Design documents from `specs/001-leadflow-crm-mvp/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | data-model.md ✅ | contracts/ ✅ | research.md ✅

**Tests**: Manual API tests via Postman/Thunder Client per Constitution Principle VII.
Included as checkpoints within each user story phase.

**Organization**: Tasks are grouped first by shared infrastructure (Setup +
Foundational), then by user story to enable independent implementation and
verification of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: Which user story this task belongs to (US1–US6)
- File paths are relative to the repository root

---

## Phase 1: Setup — Project Initialization

**Purpose**: Initialize both npm projects, install all dependencies, create
directory scaffolding, and configure build tooling. Nothing is buildable
until this phase is complete.

- [X] T001 Initialize `server/` as a Node.js project: `cd server && npm init -y`
- [X] T002 [P] Initialize `client/` as a Vite + React project: `npm create vite@latest client -- --template react`
- [X] T003 Install all server dependencies: `cd server && npm install express mongoose jsonwebtoken bcryptjs dotenv cors helmet express-validator` and devDeps: `npm install -D nodemon`
- [X] T004 [P] Install all client dependencies: `cd client && npm install axios react-router-dom react-hook-form zod @hookform/resolvers recharts react-hot-toast`
- [X] T005 Create backend directory structure inside `server/src/`: `config/ models/ routes/ controllers/ services/ middleware/ validators/ utils/`
- [X] T006 [P] Configure Tailwind CSS in `client/`: install `tailwindcss postcss autoprefixer`, run `npx tailwindcss init -p`, update `client/tailwind.config.js` with content paths, add `@tailwind` directives to `client/src/index.css`
- [X] T007 [P] Create `server/.env` with actual development values AND create skeleton `server/.env.example` with all variable names but empty/placeholder values (e.g. `JWT_SECRET=replace_with_long_random_string`): `NODE_ENV`, `PORT`, `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL` (T152 will add descriptive comments to `.env.example` in Phase 9)
- [X] T008 [P] Create `client/.env` and `client/.env.example` with `VITE_API_URL=http://localhost:5000/api`
- [X] T009 Create root `.gitignore` covering `node_modules/`, `.env`, `dist/`, `.DS_Store` for both `server/` and `client/`

**Checkpoint**: Both projects initialize with `npm run dev` without errors

---

## Phase 2: Foundational — Shared Infrastructure (BLOCKING)

**Purpose**: All shared backend infrastructure, database models, and frontend
scaffolding that every user story depends on. No user story work begins until
this phase is complete.

**⚠️ CRITICAL**: US1–US6 all depend on Phase 2 completion.

### Backend Foundation

- [X] T010 Create `server/src/config/db.js` — Mongoose connect function using `MONGO_URI` from env, log success/error
- [X] T011 Create `server/server.js` — Express app: import `cors`, `helmet`, `express.json()`, mount route prefix `/api`, import db config, import error middleware, `app.listen(PORT)`
- [X] T012 [P] Create `server/src/utils/response.js` — export `successResponse(res, statusCode, message, data)` and `errorResponse(res, statusCode, message, errors)` using `{ success, message, data/errors }` shape
- [X] T013 [P] Create `server/src/utils/pagination.js` — export `paginate(query, page, limit)` helper returning `{ data, pagination: { total, page, limit, totalPages } }`
- [X] T014 Create `server/src/middleware/error.middleware.js` — Express 4-arg error handler catching all thrown errors, returning `errorResponse` with appropriate status code

### Database Models

- [X] T015 [P] Create `server/src/models/User.js` — Mongoose schema: `name` (String, required, trim, min 2), `email` (String, required, unique, lowercase), `password` (String, required, min 8, select: false), `role` (String, enum ['admin','user'], default 'user'), timestamps; unique index on `email`
- [X] T016 [P] Create `server/src/models/Lead.js` — Mongoose schema: `customerName` (required), `phone` (required), `email`, `company`, `status` (enum 7 values, default 'New'), `score` (enum 3 values), `source` (enum 7 values), `budget` (Number, min 0, default 0), `notes`, `createdBy` (ref User, required), `assignedTo` (ref User), timestamps; indexes on `{createdBy,status}`, `{assignedTo}`, text index on `{customerName,phone}`
- [ ] T017 [P] Create `server/src/models/Quotation.js` — Mongoose schema: `quotationCode` (String, required, unique), `lead` (ref Lead, required), `status` (enum ['Draft','Sent','Accepted','Rejected'], default 'Draft'), `items` (array of `{description, quantity: {Number,min:0}, unitPrice: {Number,min:0}, total: Number}`), `totalAmount` (Number, computed), `notes`, `createdBy` (ref User), timestamps; pre-save hook to compute `item.total = quantity * unitPrice` and `totalAmount = sum(items.total)`; indexes on `quotationCode`, `{lead}`, `{createdBy,status}`
- [ ] T018 [P] Create `server/src/models/Task.js` — Mongoose schema: `title` (required), `description`, `dueDate` (Date, required), `completed` (Boolean, default false), `completedAt` (Date), `lead` (ref Lead, optional), `createdBy` (ref User, required), `assignedTo` (ref User), timestamps; indexes on `{createdBy,completed,dueDate}`, `{assignedTo,completed}`

### Frontend Foundation

- [X] T019 Create `client/src/services/api.js` — Axios instance with `baseURL: import.meta.env.VITE_API_URL`; request interceptor to attach `Authorization: Bearer <token>` from localStorage; response interceptor to redirect to `/login` on 401
- [X] T020 [P] Create `client/src/utils/constants.js` — export `LEAD_STATUSES`, `LEAD_SCORES`, `LEAD_SOURCES`, `QUOTATION_STATUSES` as string arrays matching backend enums
- [X] T021 [P] Create `client/src/utils/formatters.js` — export `formatCurrency(n)` (VND/USD), `formatDate(d)` (DD/MM/YYYY), `formatPercent(n)` (1 decimal)
- [X] T022 Create `client/src/context/AuthContext.jsx` — React context providing `user`, `token`, `login(data)`, `logout()`, `isAuthenticated`; persists token to localStorage; provides `useAuth` hook
- [X] T023 Create `client/src/routes/PrivateRoute.jsx` — renders `<Outlet />` if authenticated, otherwise `<Navigate to="/login" />`
- [X] T024 [P] Create `client/src/routes/AppRoutes.jsx` — define all routes: public (`/login`, `/register`) and protected routes wrapped in `PrivateRoute` and `AppLayout`; placeholder pages are acceptable at this stage
- [X] T025 Create `client/src/layouts/AppLayout.jsx` — wraps `<Sidebar />` + `<Header />` + `<Outlet />`; responsive flex layout *(minimal header-only layout for Phase 2; Sidebar deferred until Phase 4 leads)*
- [ ] T026 [P] Create `client/src/layouts/Sidebar.jsx` — navigation links to `/dashboard`, `/leads`, `/quotations`, `/tasks`, `/settings`; active-link highlight; logo/brand at top; collapse toggle for mobile
- [ ] T027 [P] Create `client/src/layouts/Header.jsx` — displays current page title, logged-in user name, logout button; calls `logout()` from AuthContext *(folded inline into AppLayout for Phase 2)*
- [X] T028 [P] Update `client/src/main.jsx` — wrap `<App />` in `<AuthContextProvider>` and `<BrowserRouter>`, add `<Toaster />` from react-hot-toast
- [ ] T028B [P] Create `client/src/components/common/Modal.jsx` — headless modal wrapper: backdrop overlay, close button (×), `children` slot, `isOpen` + `onClose` props; closes on ESC key; traps focus while open (required by Phase 6 QuotationDetailPage and Phase 7 TaskForm before Phase 9)

**Checkpoint**: `npm run dev` in both `server/` and `client/` starts without error; browser shows login redirect for protected routes; MongoDB connects successfully

---

## Phase 3: User Story 1 — Authentication & Access Control (Priority: P1) 🎯 MVP

**Goal**: Users can register, log in, log out, and access protected pages.
Admin and user roles are enforced.

**Independent Test**: Register a new account, log in, reach the dashboard,
log out, verify protected page redirects to `/login`.

### Implementation

- [X] T029 [P] [US1] Create `client/src/components/common/Button.jsx` — reusable button with `variant` (primary/secondary/danger), `loading` prop showing spinner, `disabled` state
- [X] T030 [P] [US1] Create `client/src/components/common/LoadingSpinner.jsx` — centered spinner component for page and button loading states
- [X] T031 [US1] Create `server/src/validators/auth.validator.js` — express-validator chains for `register` (name, email, password minLength 8) and `login` (email, password required)
- [X] T032 [US1] Create `server/src/services/auth.service.js` — `register(name, email, password)`: hash password with bcrypt, create User, return JWT + user object (no password); `login(email, password)`: find user with `+password`, compare hash, return JWT + user; `getMe(userId)`: return user by ID
- [X] T033 [US1] Create `server/src/controllers/auth.controller.js` — `register`, `login`, `getMe` controller functions calling auth.service; use `successResponse`/`errorResponse`; catch all errors
- [X] T034 [US1] Create `server/src/middleware/auth.middleware.js` — `protect`: verify JWT from `Authorization: Bearer` header, attach `req.user`; reject with 401 if missing or invalid
- [X] T035 [P] [US1] Create `server/src/middleware/role.middleware.js` — `requireAdmin`: check `req.user.role === 'admin'`, reject with 403 if not
- [X] T036 [US1] Create `server/src/routes/auth.routes.js` — `POST /register`, `POST /login` (public); `GET /me` (protected with `auth.middleware`)
- [X] T037 [US1] Mount auth routes in `server/server.js`: `app.use('/api/auth', authRoutes)`
- [X] T038 [US1] Create `client/src/services/auth.service.js` — `register(data)`, `login(data)`, `getMe()` calling `api.js` Axios instance
- [X] T039 [P] [US1] Create `client/src/hooks/useAuth.js` — convenience hook re-exporting from AuthContext
- [X] T040 [US1] Create `client/src/pages/LoginPage.jsx` — React Hook Form + Zod schema (email, password); calls `auth.service.login`; on success calls `login()` from context, navigates to `/dashboard`; shows toast on error
- [X] T041 [US1] Create `client/src/pages/RegisterPage.jsx` — React Hook Form + Zod schema (name, email, password, confirmPassword); calls `auth.service.register`; on success calls `login()` from context, navigates to `/dashboard`
- [X] T042 [US1] Add `/login` and `/register` routes (public) to `client/src/routes/AppRoutes.jsx`

### API Tests (Postman / Thunder Client)

- [ ] T043 [US1] Test: `POST /api/auth/register` with valid body → 201 + token + user (no password field)
- [ ] T044 [US1] Test: `POST /api/auth/register` with duplicate email → 400 validation error
- [ ] T045 [US1] Test: `POST /api/auth/login` with correct credentials → 200 + token
- [ ] T046 [US1] Test: `POST /api/auth/login` with wrong password → 401 unauthorized
- [ ] T047 [US1] Test: `GET /api/auth/me` with valid token → 200 + user; without token → 401

**Checkpoint**: Authentication flow complete end-to-end in browser; role middleware blocks non-admin from admin-only routes

---

## Phase 4: User Story 2 — Lead Management (Priority: P2)

**Goal**: Users can create, view, update, delete, search, and filter leads.
Role-based visibility enforced. Admin sees all; user sees own/assigned.

**Independent Test**: Create a lead (customerName + phone), update status,
search by phone, apply status filter, delete with confirmation. Log in as
second user — cannot see first user's lead.

### Implementation

- [X] T048 [P] [US2] Create `client/src/components/common/Badge.jsx` — colored badge for status/score labels; accepts `value` and `type` props; color-coded per enum value
- [X] T049 [P] [US2] Create `client/src/components/common/ConfirmDialog.jsx` — modal dialog with message, Cancel, and Confirm (danger) buttons; accepts `onConfirm`, `onCancel`, `message` props
- [X] T050 [P] [US2] Create `client/src/components/common/EmptyState.jsx` — centered illustration/icon + message + optional action button
- [X] T051 [P] [US2] Create `client/src/components/common/SearchInput.jsx` — debounced text input (300ms) emitting `onSearch(value)` callback
- [X] T052 [P] [US2] Create `client/src/components/common/Pagination.jsx` — prev/next + page number buttons; accepts `page`, `totalPages`, `onPageChange`
- [X] T053 [US2] Create `server/src/validators/lead.validator.js` — express-validator chains for `createLead` and `updateLead`: `customerName` required, `phone` required, `budget` optional min 0, `status` optional enum, `score` optional enum, `source` optional enum
- [X] T054 [US2] Create `server/src/services/lead.service.js` — `getLeads(userId, role, {page, limit, search, status, score, source, sortBy, sortOrder})`: scope query by role; text search on customerName/phone; return paginated results; `createLead(data, userId)`: if `assignedTo` is provided by a regular user it MUST equal `userId` (self-assign only; admin can assign to anyone); `getLeadById(id, userId, role)`: 404 if not found, 403 if out of scope; `updateLead(id, data, userId, role)`: same `assignedTo` rule as create; `deleteLead(id, userId, role)`: only owner or admin. *(`getLeadsMinimal` deferred to the quotation/task phases when dropdown selectors are added.)*
- [X] T055 [US2] Create `server/src/controllers/lead.controller.js` — one controller function per route delegating to lead.service; handle 400/403/404 responses
- [X] T056 [US2] Create `server/src/routes/lead.routes.js` — all routes protected with `auth.middleware`; `GET /`, `POST /`, `GET /:id`, `PUT /:id`, `DELETE /:id` (plus `PATCH /:id/status` for the status-only update and `POST /:id/notes` for adding notes — required by user-input scope)
- [X] T057 [US2] Mount lead routes in `server/server.js`: `app.use('/api/leads', leadRoutes)`
- [X] T058 [US2] Create `client/src/services/lead.service.js` — `getLeads(params)`, `getLead(id)`, `createLead(data)`, `updateLead(id, data)`, `deleteLead(id)` calling Axios api instance (plus `updateLeadStatus` and `addLeadNote`)
- [X] T059 [P] [US2] Create `client/src/hooks/useLeads.js` — state + loading + error management for lead list with `fetchLeads(params)`, `createLead`, `updateLead`, `deleteLead`
- [X] T060 [P] [US2] Create `client/src/components/leads/LeadFilters.jsx` — select dropdowns for status, score, source; emits `onFilterChange(filters)` callback
- [X] T061 [P] [US2] Create `client/src/components/leads/LeadTable.jsx` — table with columns: customerName, phone, status (Badge), score (Badge), source, budget, createdAt, Actions (edit/delete); shows EmptyState when empty; shows LoadingSpinner while loading
- [X] T062 [US2] Create `client/src/components/leads/LeadForm.jsx` — React Hook Form + Zod for customerName (required), phone (required), email, company, status, score (manual entry allowed; AI scoring via Analyze Lead will overwrite), source, budget (min 0), notes; submit handler prop
- [X] T063 [US2] Create `client/src/pages/LeadsPage.jsx` — SearchInput + LeadFilters + Pagination + LeadTable; fetch leads on mount and on filter/search/page change; delete with ConfirmDialog; navigate to `/leads/create` and `/leads/:id`
- [X] T064 [US2] Create `client/src/pages/LeadCreatePage.jsx` — renders LeadForm; on submit calls `createLead`, shows success toast, redirects to `/leads`
- [X] T065 [US2] Create `client/src/pages/LeadDetailPage.jsx` — fetch lead by ID; display all fields with Badge components; inline edit status; Edit and Delete buttons; ConfirmDialog for delete; placeholder for AI panel (Phase 5)
- [X] T066 [US2] Add lead routes to `client/src/routes/AppRoutes.jsx`: `/leads`, `/leads/create`, `/leads/:id`

### API Tests (Postman / Thunder Client)

- [ ] T067 [US2] Test: `POST /api/leads` without `customerName` → 400 validation error
- [ ] T068 [US2] Test: `POST /api/leads` with `budget: -100` → 400 validation error
- [ ] T069 [US2] Test: `POST /api/leads` valid body → 201, status defaults to `New`
- [ ] T070 [US2] Test: `GET /api/leads` as admin → all leads; as regular user → own/assigned only
- [ ] T071 [US2] Test: `GET /api/leads?search=0901` → returns matching leads
- [ ] T072 [US2] Test: `DELETE /api/leads/:id` as non-owner regular user → 403 forbidden

**Checkpoint**: Full lead CRUD working in browser; search, filter, pagination functional; role scoping verified

---

## Phase 5: User Story 3 — AI Lead Intelligence (Priority: P3)

**Goal**: "Analyze Lead" returns Hot/Warm/Cold score with reason and
suggestedAction. "Generate Follow-up Message" returns an editable, copyable,
regeneratable message. AI failures show a fallback.

**Independent Test**: Open a lead detail page, click "Analyze Lead" — verify
deterministic score matches the lead's data per the scoring rules. Click
"Generate Follow-up Message" — verify contextual message appears and can be
copied.

### Implementation

- [X] T073 [US3] Create `server/src/services/aiService.js` — `scoreLead(lead)`: deterministic rule engine using budget / status / timeline / needDescription / source / notes. Returns `{ score, reason, suggestedAction, points }` with human-readable Vietnamese strings.
- [X] T074 [US3] Add `generateFollowUpMessage({ followUpPurpose, customerName, leadStatus, needDescription, budget, lastNote, quotationStatus })` to `server/src/services/aiService.js` — Vietnamese template pool per purpose (First contact / After quotation / Payment reminder / Meeting reminder / Re-engagement / Thank you message); interpolates customer fields; returns `{ message, purpose, fallback }`; built-in fallback message on any template error.
- [X] T075 [US3] Create `server/src/controllers/ai.controller.js` — `followUpMessage` controller delegates to `aiService.generateFollowUpMessage`; `purposes` returns the canonical purpose list. Lead-scoped analyze is exposed via `leadController.analyzeLead`.
- [X] T076 [US3] Routes — `POST /api/leads/:id/analyze` (in `server/src/routes/lead.routes.js`) updates the lead with `leadScore` / `scoreReason` / `suggestedAction`; `POST /api/ai/follow-up-message` and `GET /api/ai/follow-up-purposes` (in new `server/src/routes/ai.routes.js`). Both protected by `auth.middleware`.
- [X] T077 [US3] Mount AI routes in `server/server.js`: `app.use('/api/ai', aiRoutes)`
- [X] T078 [US3] Create `client/src/services/ai.service.js` — `analyzeLead(leadId)`, `generateFollowUpMessage(payload)`, `getFollowUpPurposes()` calling Axios api instance; also exports `FOLLOW_UP_PURPOSES`.
- [X] T079 [US3] Create `client/src/components/leads/AILeadPanel.jsx` — (1) Analyze Lead button → calls `analyzeLead` → renders score Badge + reason + suggestedAction; loading spinner + error fallback; (2) Follow-up generator with purpose dropdown, Generate / Regenerate / Copy buttons, editable textarea, fallback banner, toast notifications.
- [X] T080 [US3] Integrate `AILeadPanel` into `client/src/pages/LeadDetailPage.jsx` — replaces the placeholder "AI insight" section.

### API Tests (Postman / Thunder Client)

- [ ] T081 [US3] Test: `POST /api/ai/score-lead/:id` for a lead with `status: Negotiating, budget: 15000` → score `Hot`
- [ ] T082 [US3] Test: `POST /api/ai/score-lead/:id` for a lead with `status: New, budget: 0` → score `Cold`
- [ ] T083 [US3] Test: `POST /api/ai/follow-up-message/:id` → returns non-empty `message` string containing `customerName`

**Checkpoint**: AI panel visible on lead detail page; scoring consistent with rules; fallback message shown when API returns error

---

## Phase 6: User Story 4 — Quotation Management (Priority: P4)

**Goal**: Create quotations linked to leads with line items; totalAmount
auto-calculates. Lifecycle Draft→Sent→Accepted/Rejected enforced. Accepted
quotations lock item editing. Only Draft quotations are deletable. Accepting
a quotation enables marking the lead Won.

**Independent Test**: Create a quotation linked to a lead, add two line items,
verify total. Transition to Sent then Accepted. Verify items are locked.
Verify non-Draft cannot be deleted. Mark lead Won via Accept flow.

### Implementation

- [ ] T084 [US4] Create `server/src/validators/quotation.validator.js` — express-validator: `quotationCode` required, `lead` required valid ObjectId, `items` required array minLength 1, each item `description` required, `quantity` min 0, `unitPrice` min 0
- [ ] T085 [US4] Create `server/src/services/quotation.service.js` — `getQuotations(userId, role, params)`: scoped list with pagination/filter; `createQuotation(data, userId)`: auto-compute totalAmount; check `quotationCode` uniqueness; `getQuotationById(id, userId, role)`; `updateQuotation(id, data, userId, role)`: block item edits if status is Accepted; recompute totalAmount on item changes; `deleteQuotation(id, userId, role)`: block if status !== Draft; `acceptQuotation(id, markLeadAsWon, userId, role)`: set status Accepted; optionally update linked lead status to Won
- [ ] T086 [US4] Create `server/src/controllers/quotation.controller.js` — one function per endpoint; delegate to quotation.service; handle all business rule errors as 400
- [ ] T087 [US4] Create `server/src/routes/quotation.routes.js` — `GET /`, `POST /`, `GET /generate-code`, `GET /:id`, `PUT /:id`, `DELETE /:id`, `PUT /:id/accept`; all protected
- [ ] T088 [US4] Mount quotation routes in `server/server.js`: `app.use('/api/quotations', quotationRoutes)`
- [ ] T089 [US4] Create `client/src/services/quotation.service.js` — `getQuotations(params)`, `getQuotation(id)`, `createQuotation(data)`, `updateQuotation(id, data)`, `deleteQuotation(id)`, `acceptQuotation(id, markLeadAsWon)`, `generateCode()` calling Axios api
- [ ] T090 [P] [US4] Create `client/src/hooks/useQuotations.js` — state + async helpers for quotation list
- [ ] T091 [US4] Create `client/src/components/quotations/LineItemEditor.jsx` — dynamic list of line item rows (description, quantity, unitPrice inputs); auto-computes row total and grand total using `watch` from React Hook Form; add/remove row buttons; disables all inputs when `isLocked` prop is true
- [ ] T092 [US4] Create `client/src/components/quotations/QuotationForm.jsx` — React Hook Form + Zod: `quotationCode` (auto-suggests via `generateCode()` API), lead selector (dropdown fetched from `getLeadsMinimal()` — unpaginated `{_id, customerName}` list), status, notes, LineItemEditor; submit handler prop
- [ ] T093 [P] [US4] Create `client/src/components/quotations/QuotationTable.jsx` — table: quotationCode, lead name, status (Badge), totalAmount (formatted), createdAt, Actions
- [ ] T094 [US4] Create `client/src/pages/QuotationsPage.jsx` — filter by status + pagination + QuotationTable; navigate to create/detail
- [ ] T095 [US4] Create `client/src/pages/QuotationCreatePage.jsx` — renders QuotationForm; on submit calls `createQuotation`, success toast, redirect to `/quotations`
- [ ] T096 [US4] Create `client/src/pages/QuotationDetailPage.jsx` — display all quotation fields; line items (locked if Accepted); status transition buttons (Send, Accept, Reject); Send and Reject each trigger a `ConfirmDialog` before executing (per FR-045: status changes are destructive); Accept button opens a `Modal` with "Mark lead as Won?" checkbox and a Confirm button; Delete button with `ConfirmDialog` (hidden/disabled if not Draft)
- [ ] T097 [US4] Add quotation routes to `client/src/routes/AppRoutes.jsx`: `/quotations`, `/quotations/create`, `/quotations/:id`

### API Tests (Postman / Thunder Client)

- [ ] T098 [US4] Test: `POST /api/quotations` with duplicate `quotationCode` → 400 unique error
- [ ] T099 [US4] Test: `POST /api/quotations` with `unitPrice: -1` → 400 validation error
- [ ] T100 [US4] Test: `PUT /api/quotations/:id` to update items on an Accepted quotation → 400 locked error
- [ ] T101 [US4] Test: `DELETE /api/quotations/:id` on a Sent quotation → 400 cannot delete
- [ ] T102 [US4] Test: `PUT /api/quotations/:id/accept` with `markLeadAsWon: true` → quotation Accepted + lead status Won
- [ ] T103 [US4] Test: `GET /api/quotations/generate-code` → returns unique `QT-YYYY-NNN` string
- [ ] T103B [US4] Test: `GET /api/quotations` as regular user → returns only quotations where `createdBy` equals the requesting user (role scoping equivalent of T070 for leads)

**Checkpoint**: Full quotation lifecycle works in browser; totalAmount auto-calculates; line item lock enforced; lead Won flow tested

---

## Phase 7: User Story 5 — Follow-up Task Tracking (Priority: P5)

**Goal**: Tasks page shows "Today" and "Overdue" sections with active tasks.
Users create manual tasks, mark them complete (removing from active view).
Role scoping enforced.

**Independent Test**: Create task with today's date → appears in Today section.
Mark complete → removed from view. Create task dated yesterday → appears in
Overdue section.

### Implementation

- [ ] T104 [US5] Create `server/src/validators/task.validator.js` — express-validator: `title` required, `dueDate` required valid ISO date string, `lead` optional valid ObjectId, `assignedTo` optional valid ObjectId
- [ ] T105 [US5] Create `server/src/services/task.service.js` — `getTasks(userId, role, {filter, page, limit})`: scope by role; `filter=today`: dueDate date equals today AND completed false; `filter=overdue`: dueDate < today AND completed false; `filter=active`: completed false; `filter=all`: no completed filter; `createTask(data, userId)`; `getTaskById(id, userId, role)`; `updateTask(id, data, userId, role)`; `completeTask(id, userId, role)`: set `completed:true`, `completedAt: new Date()`; `deleteTask(id, userId, role)`: admin or creator only
- [ ] T106 [US5] Create `server/src/controllers/task.controller.js` — delegates to task.service; handles 403/404
- [ ] T107 [US5] Create `server/src/routes/task.routes.js` — `GET /`, `POST /`, `GET /:id`, `PUT /:id`, `PUT /:id/complete`, `DELETE /:id`; all protected
- [ ] T108 [US5] Mount task routes in `server/server.js`: `app.use('/api/tasks', taskRoutes)`
- [ ] T109 [US5] Create `client/src/services/task.service.js` — `getTasks(params)`, `getTask(id)`, `createTask(data)`, `updateTask(id, data)`, `completeTask(id)`, `deleteTask(id)` calling Axios api
- [ ] T110 [P] [US5] Create `client/src/hooks/useTasks.js` — state + async helpers for tasks list and actions
- [ ] T111 [US5] Create `client/src/components/tasks/TaskForm.jsx` — React Hook Form + Zod: `title` (required), `description`, `dueDate` (required, date picker input), `lead` (optional lead selector dropdown using `getLeadsMinimal()` — same unpaginated list as in QuotationForm); submit handler prop; renders inside `Modal.jsx` (created in Phase 2 T028B)
- [ ] T112 [US5] Create `client/src/components/tasks/TaskList.jsx` — renders two sections "Due Today" and "Overdue"; each task row shows title, dueDate, linked lead name (if any), "Mark Complete" button; shows EmptyState when no tasks in section
- [ ] T113 [US5] Create `client/src/pages/TasksPage.jsx` — fetches `filter=today` and `filter=overdue` tasks on mount; "Add Task" button opens TaskForm inside `Modal`; pass tasks to TaskList; on complete: call `completeTask`, refresh list, show success toast; **no "un-complete" button** — task completion is permanent in MVP
- [ ] T114 [US5] Add `/tasks` route to `client/src/routes/AppRoutes.jsx`

### API Tests (Postman / Thunder Client)

- [ ] T115 [US5] Test: `POST /api/tasks` without `title` → 400 validation error
- [ ] T116 [US5] Test: `GET /api/tasks?filter=today` → returns only tasks due today with `completed:false`
- [ ] T117 [US5] Test: `GET /api/tasks?filter=overdue` → returns only past-due tasks with `completed:false`
- [ ] T118 [US5] Test: `PUT /api/tasks/:id/complete` → task `completed:true`, `completedAt` populated
- [ ] T119 [US5] Test: `GET /api/tasks` as user → cannot see tasks created by another user

**Checkpoint**: Tasks page shows today and overdue sections; create and complete task flows work in browser

---

## Phase 8: User Story 6 — Dashboard Analytics (Priority: P6)

**Goal**: Dashboard displays 12 metric cards and renders 4 charts. All values
are role-scoped (admin: all data; user: own + assigned).

**Independent Test**: With ≥5 leads across different statuses and ≥3
quotations across different statuses, load the dashboard and verify all metric
cards show correct counts. Verify all 4 charts render.

### Implementation

- [ ] T120 [US6] Create `server/src/services/dashboard.service.js` — single `getDashboardData(userId, role)` function computing: `totalLeads`, `newLeads`, `hotLeads`, `warmLeads`, `coldLeads` (Lead.countDocuments with scoped queries); `totalQuotations`, `sentQuotations`, `acceptedQuotations` (Quotation.countDocuments); `estimatedRevenue` (Quotation.aggregate sum totalAmount where status=Accepted); `conversionRate` ((Won leads / total leads) × 100, 1 decimal, handle division by zero); `followUpToday` and `overdueFollowUps` (Task.countDocuments with date logic); chart datasets for `leadByStatus`, `leadBySource`, `quotationByStatus` (Quotation.aggregate group by status); `revenueForecast` (Quotation.aggregate group by month of createdAt, last 6 months, Sent+Accepted only)
- [ ] T121 [US6] Create `server/src/controllers/dashboard.controller.js` — single `getDashboard` function calling service, returning full metrics + charts in one response
- [ ] T122 [US6] Create `server/src/routes/dashboard.routes.js` — `GET /` protected
- [ ] T123 [US6] Mount dashboard routes in `server/server.js`: `app.use('/api/dashboard', dashboardRoutes)`
- [ ] T124 [US6] Create `client/src/services/dashboard.service.js` — `getDashboardData()` calling Axios api
- [ ] T125 [US6] Create `client/src/components/dashboard/MetricCard.jsx` — card with icon slot, label, value, optional sub-label; accepts `title`, `value`, `icon`, `colorClass` props
- [ ] T126 [P] [US6] Create `client/src/components/dashboard/charts/LeadByStatusChart.jsx` — Recharts `PieChart` or `BarChart` with `leadByStatus` data array; color per status; legend; responsive container
- [ ] T127 [P] [US6] Create `client/src/components/dashboard/charts/LeadBySourceChart.jsx` — Recharts `PieChart` with `leadBySource` data; color per source; responsive container
- [ ] T128 [P] [US6] Create `client/src/components/dashboard/charts/QuotationStatusChart.jsx` — Recharts `BarChart` with `quotationByStatus` data; color per status; responsive container
- [ ] T129 [P] [US6] Create `client/src/components/dashboard/charts/RevenueForecastChart.jsx` — Recharts `LineChart` or `AreaChart` with `revenueForecast` data (month on x-axis, revenue on y-axis); formatted y-axis with currency; responsive container
- [ ] T130 [US6] Create `client/src/pages/DashboardPage.jsx` — calls `getDashboardData()` on mount; renders 12 MetricCards in a responsive grid; renders 4 chart components; shows LoadingSpinner while fetching; shows error state on failure
- [ ] T131 [US6] Set `/dashboard` as the default redirect after login in `client/src/routes/AppRoutes.jsx`

### API Tests (Postman / Thunder Client)

- [ ] T132 [US6] Test: `GET /api/dashboard` returns all 12 metrics and 4 chart datasets
- [ ] T133 [US6] Test: `GET /api/dashboard` as regular user → metrics reflect only own data
- [ ] T134 [US6] Test: `GET /api/dashboard` as admin → metrics reflect all users' data
- [ ] T135 [US6] Test: `GET /api/dashboard` with no data → all counts 0, no errors thrown

**Checkpoint**: Dashboard fully renders in browser with all charts and metric cards; data matches underlying records

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Settings page, shared Modal component, API response consistency
review, mobile responsiveness audit, documentation, and manual test checklists.

### Settings & Profile (Task Group 16)

- [ ] T136 Create `server/src/services/user.service.js` — `updateProfile(userId, {name, email})`: check email uniqueness if changed, update User; `changePassword(userId, {currentPassword, newPassword})`: fetch user with `+password`, compare currentPassword hash, hash newPassword, save
- [ ] T137 [P] Create `server/src/controllers/user.controller.js` — `getProfile`, `updateProfile`, `changePassword` delegates to user.service
- [ ] T138 Create `server/src/routes/user.routes.js` — `GET /me`, `PUT /me`, `PUT /me/password`; all protected
- [ ] T139 Mount user routes in `server/server.js`: `app.use('/api/users', userRoutes)`
- [ ] T140 Create `client/src/services/user.service.js` — `getProfile()` calling `GET /api/auth/me`; `updateProfile(data)` calling `PUT /api/users/me`; `changePassword(data)` calling `PUT /api/users/me/password` (maintains service layer per Constitution Principle IV; do NOT make raw Axios calls from SettingsPage directly)
- [ ] T141 Create `client/src/pages/SettingsPage.jsx` — two sections: "Profile" (name + email form using React Hook Form + Zod, calls `user.service.updateProfile`); "Change Password" (currentPassword + newPassword + confirmPassword form, calls `user.service.changePassword`); success/error toasts
- [ ] T142 Add `/settings` route to `client/src/routes/AppRoutes.jsx`

### Validation & Error Handling Audit (Task Group 17)

- [ ] T143 [P] Verify every backend route passes through express-validator and calls `validationResult(req)` before proceeding; fix any missing validator chains in `server/src/routes/`
- [ ] T144 [P] Verify `server/src/middleware/error.middleware.js` is the last middleware in `server/server.js` and catches all unhandled errors
- [ ] T145 [P] Verify all Axios errors in frontend services extract `error.response.data.message` and surface it via react-hot-toast; update any bare `catch(e) { console.error(e) }` blocks in `client/src/services/`
- [ ] T146 [P] Verify frontend forms show inline validation errors from Zod (not just toast) for all required fields; test in browser: submit empty forms on `/leads/create`, `/quotations/create`, `/login`, `/register`

### Responsive Polish (Task Group 18)

- [ ] T147 Add mobile sidebar toggle: hamburger button in `client/src/layouts/Header.jsx`; sidebar hides on mobile by default and slides in on toggle; overlay closes it on `client/src/layouts/Sidebar.jsx`
- [ ] T148 [P] Audit `client/src/pages/LeadsPage.jsx` on 375px viewport: wrap table in `overflow-x-auto` container or switch to card view; verify search + filter controls stack vertically
- [ ] T149 [P] Audit `client/src/pages/QuotationsPage.jsx` on 375px: table overflow; line item editor wraps correctly
- [ ] T150 [P] Audit `client/src/pages/DashboardPage.jsx` on 375px: MetricCards grid switches to 2-column then 1-column; charts use `ResponsiveContainer` width `100%`
- [ ] T151 [P] Test all pages at 375px (iPhone SE), 768px (tablet), 1024px (laptop), 1440px (desktop) and fix any overflow or layout breaks

### README & Deployment (Task Group 19)

- [ ] T152 Update `server/.env.example` with all final required variable names and comments
- [ ] T153 [P] Update `client/.env.example` with `VITE_API_URL` comment
- [ ] T154 Write root `README.md` covering: project overview, tech stack, folder structure, prerequisites, local setup steps (matching `quickstart.md`), available scripts, environment variables reference, deployment guide (Vercel frontend + Render backend + MongoDB Atlas)
- [ ] T155 [P] Add `client/vercel.json` with SPA rewrite rule: `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }` for React Router compatibility on Vercel
- [ ] T156 [P] Add `start` script to `server/package.json`: `"start": "node server.js"` for Render/Railway production deployment
- [ ] T157 [P] Verify full local setup from scratch: follow `quickstart.md` steps verbatim, confirm app runs at `http://localhost:5173`, register account, reach dashboard
- [ ] T157B [P] *(Optional)* Create `server/src/scripts/seed.js` — connects to MongoDB, creates default admin (`admin@leadflow.ai` / `admin123456`) and test user (`user@leadflow.ai` / `user123456`) if they don't already exist; add `"seed": "node src/scripts/seed.js"` to `server/package.json` scripts (referenced in `quickstart.md` step 7)

### Manual Testing Checklists (Task Group 20)

- [ ] T158 [P] Write `docs/testing/auth-tests.md` — manual test steps for: register valid, register duplicate email, login correct, login wrong password, access protected route without token, role scoping (admin vs user)
- [ ] T159 [P] Write `docs/testing/leads-tests.md` — test steps for: create missing fields, negative budget, create valid, list with search/filter/pagination, edit status, delete with/without confirmation, role scoping
- [ ] T160 [P] Write `docs/testing/ai-tests.md` — test steps for: score Hot/Warm/Cold leads per rule criteria, generate follow-up message (copy/regenerate), AI failure fallback
- [ ] T161 [P] Write `docs/testing/quotations-tests.md` — test steps for: create with duplicate code, negative unitPrice, auto total calculation, edit Accepted (expect blocked), delete non-Draft (expect blocked), accept + mark lead Won
- [ ] T162 [P] Write `docs/testing/tasks-tests.md` — test steps for: create task today/yesterday, today section, overdue section, mark complete (removed from view), role scoping
- [ ] T163 [P] Write `docs/testing/dashboard-tests.md` — test steps for: all 12 metric cards correct values, all 4 charts render, role-scoped metrics, empty state (zero values)
- [ ] T164 Final end-to-end test: complete the full sales flow — register → create lead → analyze (AI score) → create quotation → accept quotation → lead marked Won → verify dashboard metrics update

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — **BLOCKS all user stories**
- **Phase 3 (US1 Auth)**: Depends on Phase 2 — BLOCKS Phase 4–8
- **Phase 4 (US2 Leads)**: Depends on Phase 3 (auth middleware required)
- **Phase 5 (US3 AI)**: Depends on Phase 4 (AI reads Lead documents)
- **Phase 6 (US4 Quotations)**: Depends on Phase 4 (quotations link to leads)
- **Phase 7 (US5 Tasks)**: Depends on Phase 3 (auth), optionally Phase 4 (task→lead link)
- **Phase 8 (US6 Dashboard)**: Depends on Phase 4–7 (aggregates all data)
- **Phase 9 (Polish)**: Depends on Phase 3–8 completion

### User Story Dependencies

- **US1 (Auth — P1)**: Can start after Foundational (Phase 2). No story dependencies.
- **US2 (Leads — P2)**: Depends on US1 (needs auth middleware + user context).
- **US3 (AI — P3)**: Depends on US2 (reads Lead model and documents).
- **US4 (Quotations — P4)**: Depends on US2 (quotations reference leads).
- **US5 (Tasks — P5)**: Depends on US1 (needs auth); US2 dependency optional (task→lead link).
- **US6 (Dashboard — P6)**: Depends on US1–US5 having data to aggregate.

### Within Each Story

- Backend validator → Backend service → Backend controller → Backend routes → Mount in server.js
- Frontend service → Hook → Components → Page → Add route to AppRoutes
- API tests after backend is complete; UI tests after frontend is complete

### Parallel Opportunities

- All Phase 2 backend model tasks (T015–T018) can run in parallel
- All Phase 2 frontend foundation tasks (T020–T028) can run in parallel
- Within each US phase, all tasks marked [P] can run in parallel
- US5 (Tasks) can run in parallel with US4 (Quotations) after US2 is done
- All Phase 9 tasks marked [P] can run in parallel

---

## Parallel Example: Phase 2 Foundational

```bash
# Run in parallel:
Task T015: Create server/src/models/User.js
Task T016: Create server/src/models/Lead.js
Task T017: Create server/src/models/Quotation.js
Task T018: Create server/src/models/Task.js

# Run in parallel:
Task T020: Create client/src/utils/constants.js
Task T021: Create client/src/utils/formatters.js
Task T026: Create client/src/layouts/Sidebar.jsx
Task T027: Create client/src/layouts/Header.jsx
```

## Parallel Example: US2 Lead Management

```bash
# Run in parallel (frontend components):
Task T048: Create client/src/components/common/Badge.jsx
Task T049: Create client/src/components/common/ConfirmDialog.jsx
Task T050: Create client/src/components/common/EmptyState.jsx
Task T051: Create client/src/components/common/SearchInput.jsx
Task T052: Create client/src/components/common/Pagination.jsx
Task T060: Create client/src/components/leads/LeadFilters.jsx
Task T061: Create client/src/components/leads/LeadTable.jsx
```

---

## Implementation Strategy

### MVP First (US1 Only — Minimum Shippable)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (**CRITICAL**)
3. Complete Phase 3: US1 Authentication
4. **STOP and VALIDATE**: Can register, login, logout; protected pages redirect correctly
5. Demo-able: skeleton app with working auth

### Incremental Delivery

1. Setup + Foundational → skeleton running
2. + US1 Auth → working login/register system
3. + US2 Leads → core CRM functionality (already portfolio-worthy)
4. + US3 AI → differentiator features added
5. + US4 Quotations → sales flow complete
6. + US5 Tasks → daily workflow supported
7. + US6 Dashboard → full analytics view
8. + Phase 9 Polish → production-ready

### Parallel Team Strategy

With multiple developers after Phase 2:
- Dev A: US1 → US2 → US3 (auth + leads + AI chain)
- Dev B: US4 → US5 (quotations + tasks, both depend on US1 only)
- Dev C: US6 + Phase 9 (dashboard + polish, starts after US1–US5 have data)

---

## Notes

- [P] tasks = different files, no unresolved dependencies — safe to parallelize
- [Story] labels map each task to its user story for traceability
- Every user story phase is independently completable and testable
- Backend tasks always precede their corresponding frontend tasks within a story
- API tests come after the backend for each story — use Postman/Thunder Client
- Commit after each phase checkpoint or logical group
- Stop at any user story checkpoint to validate independently before moving to the next priority
- Avoid: same-file conflicts when parallelizing, cross-story dependencies that break independence
