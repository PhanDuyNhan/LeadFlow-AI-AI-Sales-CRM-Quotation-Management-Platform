# Feature Specification: LeadFlow AI CRM — Full MVP

**Feature Branch**: `001-leadflow-crm-mvp`

**Created**: 2026-05-26

**Status**: Draft

**Input**: User description: "Build LeadFlow AI, an AI-powered CRM and sales automation
platform for small businesses and sales teams."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Authentication & Access Control (Priority: P1)

A new sales user registers an account, logs in, and accesses the protected CRM
dashboard. Sessions expire automatically. Admin accounts see all data across all
users; regular users see only records they created or were assigned to.

**Why this priority**: Without working authentication and role enforcement, no
other feature can be protected or correctly scoped. All other user stories
depend on this foundation.

**Independent Test**: Register a new user, log in, verify access to the
dashboard, then log out. Confirm that accessing a protected page while logged
out redirects to `/login`. Log in as an admin and verify visibility of another
user's lead.

**Acceptance Scenarios**:

1. **Given** an unregistered email, **When** a user submits a valid name, email,
   and password, **Then** an account is created and the user is redirected to
   the dashboard.
2. **Given** an email already in use, **When** registration is submitted with
   that email, **Then** an error is shown and the account is not created.
3. **Given** a registered user, **When** they submit correct credentials,
   **Then** they receive an authenticated session and are redirected to the
   dashboard.
4. **Given** incorrect credentials, **When** login is submitted, **Then** an
   error message is shown and no session is created.
5. **Given** an authenticated user, **When** they log out, **Then** their
   session is cleared and subsequent access to protected pages redirects to
   `/login`.
6. **Given** an expired or missing session, **When** the user accesses any
   protected route, **Then** they are redirected to `/login`.
7. **Given** an admin user, **When** they view leads, quotations, or tasks,
   **Then** all records from all users are visible.
8. **Given** a regular user, **When** they view leads, quotations, or tasks,
   **Then** only records they created or were assigned to are visible.

---

### User Story 2 - Lead Management (Priority: P2)

A sales user creates, views, updates, and deletes leads. They search by customer
name or phone, filter by status, score, and source, and browse paginated results.
Lead statuses progress from New through to Won or Lost.

**Why this priority**: Lead management is the core entity of the CRM. All other
features — quotations, tasks, AI intelligence, and dashboard metrics — are
anchored to leads.

**Independent Test**: Create a new lead (customerName and phone required), update
its status to Contacted, search for it by phone number, apply a status filter,
then delete it with a confirmation dialog. Log in as a second user and confirm
the deleted lead is not visible.

**Acceptance Scenarios**:

1. **Given** a user on the lead creation form, **When** they submit with
   customerName and phone provided, **Then** a lead is created with status "New"
   and the user is taken to the lead detail page.
2. **Given** a missing customerName or phone, **When** the form is submitted,
   **Then** inline validation errors are shown and the lead is not created.
3. **Given** a negative budget value, **When** the form is submitted, **Then**
   a validation error is shown and the lead is not saved.
4. **Given** a list of leads, **When** the user types in the search field,
   **Then** results are filtered to leads matching by customer name or phone.
5. **Given** a list of leads, **When** the user selects a status, score, or
   source filter, **Then** only leads matching that filter are shown.
6. **Given** an empty filter result, **When** no leads match, **Then** an empty
   state is shown with a clear message.
7. **Given** a user clicks "Delete" on a lead, **When** the confirmation dialog
   is accepted, **Then** the lead is permanently removed.
8. **Given** a user clicks "Delete" on a lead, **When** the confirmation dialog
   is cancelled, **Then** the lead is not deleted.
9. **Given** an admin viewing leads, **When** the list loads, **Then** leads
   from all users are shown.
10. **Given** a regular user viewing leads, **When** the list loads, **Then**
    only their own or assigned leads are shown.

---

### User Story 3 - AI Lead Intelligence (Priority: P3)

A sales user clicks "Analyze Lead" on a lead detail page to receive a Hot, Warm,
or Cold classification with a reason and suggested action. They can also generate
a professional follow-up message from the lead's context, then copy, regenerate,
or edit it.

**Why this priority**: AI features are a key differentiator in the portfolio.
They extend lead management with intelligent guidance without blocking core CRM
functionality.

**Independent Test**: Open a lead detail page, click "Analyze Lead", verify a
score with reason and suggestedAction is shown. Click "Generate Follow-up
Message", verify a message appears, copy it, then click Regenerate to see a new
variation.

**Acceptance Scenarios**:

1. **Given** a user on a lead detail page, **When** they click "Analyze Lead",
   **Then** a score (Hot, Warm, or Cold), a reason, and a suggestedAction are
   displayed.
2. **Given** a lead with a high budget and active status, **When** scoring runs,
   **Then** the score reflects the lead's data through deterministic rule-based
   logic (not random output).
3. **Given** a user on a lead detail page, **When** they click "Generate
   Follow-up Message", **Then** a contextually relevant professional message
   appears in an editable text area.
4. **Given** a generated message, **When** the user clicks "Copy", **Then** the
   message content is placed on the clipboard.
5. **Given** a generated message, **When** the user clicks "Regenerate", **Then**
   a new message variation is shown in the same area.
6. **Given** any AI action fails, **When** the error occurs, **Then** a
   user-friendly fallback message is displayed and the user is not left with a
   blank or broken state.

---

### User Story 4 - Quotation Management (Priority: P4)

A sales user creates quotations linked to leads, adds line items, and manages the
quotation lifecycle: Draft → Sent → Accepted or Rejected. Accepting a quotation
enables marking the linked lead as Won.

**Why this priority**: Quotations close the sales loop by capturing the financial
commitment. They depend on leads (US2) and feed revenue data into the dashboard
(US6).

**Independent Test**: Create a quotation linked to an existing lead, add two
line items, verify total auto-calculates, transition it to Sent, then to
Accepted, and confirm the lead can be marked Won. Verify a non-Draft quotation
cannot be deleted.

**Acceptance Scenarios**:

1. **Given** a user on the quotation creation form, **When** they submit with a
   linked lead and at least one valid line item, **Then** a quotation is created
   with status "Draft" and a unique quotation code.
2. **Given** an existing quotation code, **When** a new quotation with the same
   code is submitted, **Then** a uniqueness error is shown and the second is not
   saved.
3. **Given** a line item with quantity and unitPrice values, **When** either
   value changes, **Then** the totalAmount updates automatically without a page
   reload.
4. **Given** a negative quantity or unitPrice, **When** the form is submitted,
   **Then** a validation error is shown.
5. **Given** a quotation with status "Accepted", **When** a user attempts to
   edit a line item, **Then** the edit controls are disabled and a reason is
   displayed.
6. **Given** a quotation with status other than "Draft", **When** a user
   attempts to delete it, **Then** the delete action is disabled or absent.
7. **Given** an accepted quotation, **When** the user clicks "Mark Lead as Won",
   **Then** the linked lead's status changes to "Won".

---

### User Story 5 - Follow-up Task Tracking (Priority: P5)

A sales user views all tasks due today and all overdue tasks in distinct sections.
They create manual tasks linked to leads, and mark tasks as completed to remove
them from the active view.

**Why this priority**: Task tracking drives daily sales actions. It surfaces
follow-up metrics on the dashboard and keeps sales reps accountable without
requiring an external tool.

**Independent Test**: Create a task with today's date, verify it appears in the
"Today" section. Mark it complete and confirm it leaves the active view. Create
a task dated yesterday and verify it appears under "Overdue".

**Acceptance Scenarios**:

1. **Given** a user on the tasks page, **When** the page loads, **Then** tasks
   due today appear in a "Today" section and tasks past their due date appear
   in an "Overdue" section.
2. **Given** no tasks exist, **When** the page loads, **Then** an empty state
   is shown with a prompt to create a task.
3. **Given** a user creates a task with a title, due date, and linked lead,
   **When** it is saved, **Then** it appears in the correct section.
4. **Given** an active task, **When** the user marks it as completed, **Then**
   it is removed from the active view and its completion is persisted.
5. **Given** a regular user on the tasks page, **When** the list loads, **Then**
   only tasks they created or were assigned to are visible.

---

### User Story 6 - Dashboard Analytics (Priority: P6)

A sales user or admin views a real-time summary dashboard showing lead counts
by category, quotation counts by status, estimated revenue, conversion rate, and
follow-up health — plus four visual charts.

**Why this priority**: The dashboard provides an at-a-glance view of sales health.
It aggregates output from all other stories and is the first page a user sees
after logging in.

**Independent Test**: With at least 5 leads across different statuses and 3
quotations across different states, load the dashboard and verify all 12 metric
cards display correct aggregated values and all four charts render with data.

**Acceptance Scenarios**:

1. **Given** a user on the dashboard, **When** the page loads, **Then** the
   following metrics are displayed: total leads, new leads, hot leads, warm
   leads, cold leads, total quotations, sent quotations, accepted quotations,
   estimated revenue, conversion rate, follow-ups today, and overdue follow-ups.
2. **Given** a dashboard with data, **When** charts render, **Then** all four
   charts are shown: Lead by Status, Lead by Source, Quotation Status, and
   Revenue Forecast.
3. **Given** a regular user, **When** they view the dashboard, **Then** all
   metrics reflect only their own and assigned records.
4. **Given** an admin, **When** they view the dashboard, **Then** all metrics
   reflect the full dataset across all users.
5. **Given** no data exists, **When** the dashboard loads, **Then** metric cards
   show zero values and charts show empty states gracefully.

---

### Edge Cases

- What happens when a user tries to create a quotation with no leads in the
  system?
- How does estimated revenue handle leads with a null or zero budget?
- What happens when the AI service is unavailable for scoring or message
  generation?
- Can a task be re-opened after being marked complete?
- What if a filter combination returns zero leads — is an empty state shown?
- What happens if a user is deleted — who owns their leads and quotations?

## Requirements *(mandatory)*

### Functional Requirements

**Authentication & Access Control**

- **FR-001**: System MUST allow new users to register with name, email, and
  password.
- **FR-002**: System MUST reject registration if the email is already in use.
- **FR-003**: System MUST authenticate users via email and password.
- **FR-004**: System MUST issue a secure, expiring session credential upon
  successful login.
- **FR-005**: System MUST protect all routes except `/login` and `/register`
  from unauthenticated access, redirecting to `/login` when unauthenticated.
- **FR-006**: System MUST enforce two roles: admin and user.
- **FR-007**: Admin users MUST have read and write access to all records.
  Regular users MUST only access records they created or were assigned to.
- **FR-008**: Passwords MUST be stored in an irreversibly hashed form. Raw
  or hashed passwords MUST NEVER appear in any API response.

**Lead Management**

- **FR-009**: System MUST allow users to create, read, update, and delete leads
  within their access scope.
- **FR-010**: Lead creation MUST require customerName and phone; both fields are
  mandatory.
- **FR-011**: New leads MUST default to status "New" if no status is provided.
- **FR-012**: Lead budget MUST be non-negative; negative values MUST be rejected
  with a validation error.
- **FR-013**: System MUST support lead statuses: New, Contacted, Qualified,
  Quoted, Negotiating, Won, Lost.
- **FR-014**: System MUST support lead scores: Hot, Warm, Cold.
- **FR-015**: System MUST support lead sources: Website, Facebook, Zalo,
  Referral, Walk-in, Event, Other.
- **FR-016**: Lead list MUST support text search by customer name and phone.
- **FR-017**: Lead list MUST support filtering by status, score, and source.
- **FR-018**: Lead list MUST be paginated with a configurable page size.
- **FR-019**: Lead deletion MUST require explicit user confirmation via a dialog
  before executing.

**AI Lead Intelligence**

- **FR-020**: System MUST allow users to trigger a lead scoring analysis from
  the lead detail page.
- **FR-021**: Lead scoring output MUST include: score (Hot/Warm/Cold), reason
  (plain text explanation), and suggestedAction (next step recommendation).
- **FR-022**: For MVP, lead scoring logic MUST be rule-based or mock; no live
  external AI service is required.
- **FR-023**: System MUST allow users to generate a follow-up message from a
  lead's context via a dedicated button on the lead detail page.
- **FR-024**: Generated messages MUST be editable in place, copyable to
  clipboard, and regeneratable on demand.
- **FR-025**: If the AI feature fails or is unavailable, the system MUST display
  a user-friendly fallback message and NOT show an empty or broken state.

**Quotation Management**

- **FR-026**: Every quotation MUST be linked to an existing lead at creation.
- **FR-027**: Each quotation MUST have a unique quotation code across the system.
- **FR-028**: totalAmount MUST be calculated automatically as the sum of
  (quantity × unitPrice) across all line items.
- **FR-029**: Line item quantity and unitPrice MUST be non-negative; negative
  values MUST be rejected.
- **FR-030**: Line items on Accepted quotations MUST NOT be editable.
- **FR-031**: Only quotations with status "Draft" MUST be deletable.
- **FR-032**: When a quotation is Accepted, the system MUST allow the user to
  mark the linked lead as Won.
- **FR-033**: System MUST support quotation statuses: Draft, Sent, Accepted,
  Rejected.

**Follow-up Task Tracking**

- **FR-034**: Tasks page MUST display active tasks in two sections: due today
  and overdue (past due date, not completed).
- **FR-035**: Users MUST be able to create manual tasks with a title, due date,
  and optional link to a lead.
- **FR-036**: Users MUST be able to mark individual tasks as completed.
- **FR-037**: Completed tasks MUST be removed from the active task view
  immediately upon completion.

**Dashboard Analytics**

- **FR-038**: Dashboard MUST display the following metric cards: total leads,
  new leads, hot leads, warm leads, cold leads, total quotations, sent
  quotations, accepted quotations, estimated revenue (sum of accepted quotation
  totals), conversion rate (Won leads / total leads × 100), follow-ups today,
  and overdue follow-ups.
- **FR-039**: Dashboard MUST render four charts: Lead by Status (breakdown),
  Lead by Source (breakdown), Quotation Status (breakdown), and Revenue Forecast
  (accepted + sent quotation amounts grouped by month).
- **FR-040**: All dashboard metrics and charts MUST be scoped by role: admin
  sees all data; regular users see only their own and assigned data.

**UI & Navigation**

- **FR-041**: Public routes: `/login`, `/register`.
- **FR-042**: Protected routes: `/dashboard`, `/leads`, `/leads/create`,
  `/leads/:id`, `/quotations`, `/quotations/create`, `/quotations/:id`,
  `/tasks`, `/settings`.
- **FR-043**: All protected pages MUST include a persistent sidebar and header.
- **FR-044**: All list pages MUST include loading states and empty states.
- **FR-045**: Destructive actions (delete, status changes) MUST use confirmation
  dialogs before executing.
- **FR-046**: System MUST display toast notifications for all significant user
  actions (create, update, delete, error).
- **FR-047**: All pages MUST be responsive and functional on screens from 375px
  (mobile) to 1440px (desktop) wide.

### Key Entities

- **User**: An authenticated account with name, email, hashed password, and role
  (admin or user). Acts as the ownership anchor for all other entities.
- **Lead**: A potential customer record containing customer details, contact
  info, budget, status, score, source, and assigned user. Central entity of
  the CRM.
- **Quotation**: A sales proposal linked to a Lead, containing a lifecycle
  status, a unique code, and one or more line items with an auto-calculated
  total.
- **QuotationItem**: A single product or service line within a Quotation, with
  description, quantity, and unit price.
- **Task**: A follow-up action item with a title, due date, completion status,
  and optional association to a Lead.
- **AIScoreResult**: A transient analysis output for a Lead containing score,
  reason, and suggestedAction. Not persisted between sessions.
- **AIMessage**: A transient generated text output for a Lead containing a
  draft follow-up message. Not persisted between sessions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new user can complete registration and reach the dashboard in
  under 2 minutes from first visiting the app.
- **SC-002**: A sales user can create a lead, link a quotation, and mark the
  quotation accepted in under 5 minutes on their first attempt.
- **SC-003**: Lead list search and filter results appear without a perceptible
  delay for datasets up to 1,000 records.
- **SC-004**: AI lead scoring and follow-up message generation complete within
  3 seconds under normal operating conditions.
- **SC-005**: All dashboard metrics are accurate — verified by manual
  cross-check against the underlying lead, quotation, and task data.
- **SC-006**: Role enforcement is verifiable — a regular user cannot view,
  edit, or delete any record outside their scope, confirmed by manual test.
- **SC-007**: All 9 protected pages redirect to `/login` when accessed
  without an active session.
- **SC-008**: The application is fully usable on screens as narrow as 375px
  (mobile) and as wide as 1440px (desktop) without horizontal scroll or
  broken layouts.
- **SC-009**: Quotation totals auto-calculate correctly across all tested
  combinations of line item quantity and unit price.
- **SC-010**: An employer unfamiliar with the codebase can run the application
  locally within 15 minutes using only the README.

## Assumptions

- The `/settings` page provides profile management (name, email update) and
  password change functionality.
- Estimated revenue is the sum of `totalAmount` for all Accepted quotations.
- Conversion rate is calculated as: (count of Won leads / total leads) × 100.
- Revenue Forecast chart groups Accepted and Sent quotation totals by month.
- Lead assignment to another user is an admin-only action.
- Regular users may self-assign unassigned leads.
- Quotation codes can be manually entered; the system may suggest a default
  (e.g., QT-0001) that the user can override.
- The follow-up tasks view defaults to showing active (not completed) tasks
  only; completed tasks are not shown in the default view. Task completion is
  not reversible in MVP — there is no "un-complete" action.
- The lead `score` field is manually editable in the lead form (manual override
  is permitted); triggering "Analyze Lead" will overwrite the score with the
  AI-derived value.
- Pagination defaults to 10 records per page across all list views.
- The application requires an internet connection; offline mode is out of
  scope for MVP.
- A deleted user's leads and quotations remain in the system under their user
  ID (orphaned data handling is out of scope for MVP).
