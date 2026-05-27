# Research: LeadFlow AI CRM — Full MVP

**Feature**: `specs/001-leadflow-crm-mvp/`
**Date**: 2026-05-26
**Status**: Complete — no NEEDS CLARIFICATION items remained

## Decision Log

### 1. Auth State Management: Context API vs Zustand

**Decision**: Context API (React built-in)

**Rationale**: Zustand adds a dependency for a problem that Context API solves
adequately at MVP scale. Auth state is global, infrequently updated (login/
logout/token refresh), and read by many components — the ideal case for a
single context value. Zustand's advantages (fine-grained subscriptions,
middleware, devtools) are not needed here.

**Alternatives considered**:
- Zustand: Better for complex shared state with frequent updates; overkill for
  auth-only global state in a portfolio project.
- Redux Toolkit: Significantly more boilerplate; not justified for MVP scale.

---

### 2. Backend Validation: express-validator vs server-side Zod

**Decision**: express-validator

**Rationale**: express-validator integrates naturally with Express middleware
chains, producing array-structured errors that map directly to the API error
response format `{ success: false, message, errors }`. Zod on the backend
requires a separate parsing step and manual error shaping.

**Alternatives considered**:
- Server-side Zod: Excellent schema inference but requires an adapter layer
  for Express. Better suited for full-stack type-sharing (e.g., tRPC, Remix)
  which is out of scope.
- Joi: Mature, but express-validator has better Express-specific ergonomics.

---

### 3. JWT Storage: localStorage vs httpOnly Cookies

**Decision**: localStorage (with documented trade-off)

**Rationale**: localStorage is simpler to implement in a portfolio project and
requires no CSRF protection complexity. The security trade-off (XSS
vulnerability) is acceptable for a portfolio/demo application and is explicitly
called out in the README. Production hardening to httpOnly cookies is noted as
a post-MVP improvement.

**Alternatives considered**:
- httpOnly cookies: More secure (immune to XSS token theft) but requires
  CORS credentials mode, cookie domain configuration, and CSRF mitigation —
  all adding complexity not justified for MVP.

---

### 4. Pagination: Offset vs Cursor

**Decision**: Offset pagination (`?page=1&limit=10`)

**Rationale**: Offset pagination is simpler to implement and understand. At
MVP scale (≤1,000 leads), the performance gap between offset and cursor
pagination is negligible. Cursor-based pagination is a post-MVP optimization.

**Alternatives considered**:
- Cursor pagination: Better for large datasets and real-time data, but adds
  implementation complexity without benefit at MVP scale.

---

### 5. AI Scoring Logic: Rule-Based Scoring Criteria

**Decision**: Deterministic rule-based scoring from lead field values

**Rules**:
```
HOT:
  - status is 'Negotiating' or 'Quoted', AND budget >= 10000
  - OR status is 'Qualified', AND budget >= 50000

COLD:
  - status is 'New' AND (budget = 0 or undefined)
  - OR status is 'Lost'

WARM:
  - All other cases (defaults)
```

**Output fields**:
- `score`: 'Hot' | 'Warm' | 'Cold'
- `reason`: plain-text explanation derived from the matching rule
- `suggestedAction`: next-step recommendation based on score

**Rationale**: Deterministic rules produce consistent, explainable results.
Random mock scoring would confuse portfolio reviewers. Rules are simple enough
to test manually.

**Alternatives considered**:
- Random mock: Simpler but produces inconsistent results across re-runs,
  which looks like a bug in a demo.
- OpenAI API: Out of scope for MVP per constitution Principle VI.

---

### 6. Follow-up Message Generation: Template-Based Mock

**Decision**: Parameterised message templates per lead status

**Templates** (randomly selected from a pool of 2–3 per status category):

```
Status: New/Contacted
  "Hi [customerName], I noticed you recently expressed interest in our
  services. I'd love to schedule a quick call to learn more about your
  needs and how we can help. Are you available this week?"

Status: Qualified/Quoted
  "Hi [customerName], I wanted to follow up on the proposal we discussed.
  I'm here to answer any questions and help you move forward. Would you
  like to schedule a brief review call?"

Status: Negotiating
  "Hi [customerName], thank you for your continued interest. I've reviewed
  your feedback and I'm confident we can find a solution that works for both
  of us. Let's connect and finalise the details."

Status: Won
  "Hi [customerName], congratulations on moving forward! I'm excited to
  begin working with you. Our team will be in touch shortly to get started."

Status: Lost (fallback)
  "Hi [customerName], I wanted to reach out and thank you for considering
  us. If circumstances change or you have questions in the future, we'd love
  to reconnect."
```

**Rationale**: Status-aware templates produce contextually appropriate messages
that look realistic in a portfolio demo. A single generic template would be
unconvincing.

---

### 7. Quotation Code Generation

**Decision**: Auto-generated default with user override

**Format**: `QT-YYYY-NNN` where YYYY is the current year and NNN is a
zero-padded sequential count of quotations in the current year.

**Example**: `QT-2026-001`, `QT-2026-002`

**Rationale**: Predictable, human-readable codes that convey year context.
The user may override the suggested code to any unique value.

---

### 8. Dashboard Revenue Calculation

**Decision**: Estimated revenue = sum of `totalAmount` for all Accepted
quotations within the current user's scope.

**Conversion rate** = (count of Won leads / count of all leads) × 100,
rounded to one decimal place.

**Revenue Forecast chart** = monthly sum of `totalAmount` for Sent and
Accepted quotations, grouped by `createdAt` month, for the last 6 months.

---

### 9. Settings Page Scope

**Decision**: Profile update (name + email) and password change

**Endpoints used**:
- `PUT /api/users/me` — update name/email
- `PUT /api/users/me/password` — change password (requires currentPassword)

---

### 10. Task Visibility Default

**Decision**: Tasks page shows active (not completed) tasks only by default.
Completed tasks are not surfaced in the UI (no "completed" tab in MVP).

---

## Open Questions (Deferred to Post-MVP)

- Should task completion be reversible (un-complete)?
- Should admin be able to re-assign existing leads to other users?
- Should quotation code generation prevent collisions on concurrent creation
  (requires DB transaction or unique index retry)?
- Post-MVP: migrate JWT from localStorage to httpOnly cookies.
