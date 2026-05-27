# Data Model: LeadFlow AI CRM — Full MVP

**Feature**: `specs/001-leadflow-crm-mvp/`
**Date**: 2026-05-26

## Entity Overview

```
User ──┬── createdBy ──► Lead ──── createdBy ──► User
       │                  │
       └── assignedTo     ├── createdBy ──► Quotation
                          │
                          └── lead (optional) ──► Task
```

- A **User** creates and is assigned Leads, Quotations, and Tasks.
- A **Lead** is the central entity; Quotations and Tasks reference it.
- A **Quotation** belongs to one Lead and contains multiple QuotationItems.
- A **Task** optionally references one Lead.

---

## Entity: User

**Collection**: `users`

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| `_id` | ObjectId | auto | — | MongoDB auto-generated |
| `name` | String | ✅ | trim, minLength: 2 | Display name |
| `email` | String | ✅ | unique, lowercase, trim | Login identifier |
| `password` | String | ✅ | minLength: 8, `select: false` | bcrypt hash; excluded from queries by default |
| `role` | String | — | enum: ['admin','user'], default: 'user' | Access scope |
| `createdAt` | Date | auto | — | Mongoose timestamps |
| `updatedAt` | Date | auto | — | Mongoose timestamps |

**Validation rules**:
- `email` must be a valid email format.
- `password` is stored as bcrypt hash; never returned in any response.
- `role` can only be set by an admin (not at public registration).

**Indexes**:
- `email`: unique index

---

## Entity: Lead

**Collection**: `leads`

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| `_id` | ObjectId | auto | — | |
| `customerName` | String | ✅ | trim, minLength: 1 | |
| `phone` | String | ✅ | trim | |
| `email` | String | — | lowercase, trim | Customer email |
| `company` | String | — | trim | Optional company name |
| `status` | String | — | enum below, default: 'New' | Lead lifecycle stage |
| `score` | String | — | enum: ['Hot','Warm','Cold'] | Set by AI or manually |
| `source` | String | — | enum below | Where lead came from |
| `budget` | Number | — | min: 0, default: 0 | Expected deal value |
| `notes` | String | — | — | Free-text notes |
| `createdBy` | ObjectId | ✅ | ref: 'User' | Owner |
| `assignedTo` | ObjectId | — | ref: 'User' | Assigned sales rep |
| `createdAt` | Date | auto | — | |
| `updatedAt` | Date | auto | — | |

**Status enum**: `New` | `Contacted` | `Qualified` | `Quoted` | `Negotiating`
| `Won` | `Lost`

**Source enum**: `Website` | `Facebook` | `Zalo` | `Referral` | `Walk-in`
| `Event` | `Other`

**Business rules**:
- Default status on creation: `New`.
- `budget` must be `>= 0`; negative values rejected.
- `customerName` and `phone` are mandatory.
- Visibility: admin sees all; user sees where `createdBy == self` OR
  `assignedTo == self`.

**Indexes**:
- `{ createdBy: 1, status: 1 }` — scoped list queries
- `{ assignedTo: 1 }` — assigned lead lookups
- `{ customerName: 'text', phone: 'text' }` — text search

---

## Entity: Quotation

**Collection**: `quotations`

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| `_id` | ObjectId | auto | — | |
| `quotationCode` | String | ✅ | unique, uppercase, trim | e.g. QT-2026-001 |
| `lead` | ObjectId | ✅ | ref: 'Lead' | Must link to existing lead |
| `status` | String | — | enum below, default: 'Draft' | |
| `items` | Array | ✅ | minLength: 1 | Line items (see below) |
| `totalAmount` | Number | auto | computed | Sum of all item totals |
| `notes` | String | — | — | |
| `createdBy` | ObjectId | ✅ | ref: 'User' | |
| `createdAt` | Date | auto | — | |
| `updatedAt` | Date | auto | — | |

**Status enum**: `Draft` | `Sent` | `Accepted` | `Rejected`

**QuotationItem sub-document**:

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `description` | String | ✅ | trim |
| `quantity` | Number | ✅ | min: 0 |
| `unitPrice` | Number | ✅ | min: 0 |
| `total` | Number | auto | `quantity * unitPrice` (computed before save) |

**Business rules**:
- `quotationCode` must be unique across all quotations.
- `totalAmount` is recomputed on every save: `sum(items[i].quantity * items[i].unitPrice)`.
- `items` array must contain at least 1 item.
- Line items MUST NOT be editable when status is `Accepted`.
- Deletion is only permitted when status is `Draft`.
- When status transitions to `Accepted`, the linked lead may be marked `Won`.

**State transitions**:
```
Draft ──► Sent ──► Accepted
                └──► Rejected
```
(Transitions are not strictly enforced in DB; enforced in service layer.)

**Indexes**:
- `quotationCode`: unique index
- `{ lead: 1 }` — quotations by lead
- `{ createdBy: 1, status: 1 }` — scoped list queries

---

## Entity: Task

**Collection**: `tasks`

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| `_id` | ObjectId | auto | — | |
| `title` | String | ✅ | trim, minLength: 1 | |
| `description` | String | — | — | |
| `dueDate` | Date | ✅ | — | Used to determine today/overdue |
| `completed` | Boolean | — | default: false | |
| `completedAt` | Date | — | set on completion | Null until completed |
| `lead` | ObjectId | — | ref: 'Lead' | Optional link to a lead |
| `createdBy` | ObjectId | ✅ | ref: 'User' | |
| `assignedTo` | ObjectId | — | ref: 'User' | |
| `createdAt` | Date | auto | — | |
| `updatedAt` | Date | auto | — | |

**Business rules**:
- **Today**: `dueDate` date portion equals today's date AND `completed: false`.
- **Overdue**: `dueDate` date portion is before today AND `completed: false`.
- Default view shows only `completed: false` tasks.
- On mark-complete: set `completed: true`, set `completedAt: now`.
- Visibility: admin sees all; user sees where `createdBy == self` OR
  `assignedTo == self`.

**Indexes**:
- `{ createdBy: 1, completed: 1, dueDate: 1 }` — today/overdue queries
- `{ assignedTo: 1, completed: 1 }` — assigned task lookups

---

## Transient / Non-Persisted Types

### AIScoreResult

Returned by `POST /api/ai/score-lead/:leadId`. Not stored in the database.

```json
{
  "score": "Hot",
  "reason": "Lead is in Negotiating stage with a budget of $25,000.",
  "suggestedAction": "Send a finalised proposal and request a decision meeting."
}
```

### AIMessage

Returned by `POST /api/ai/follow-up-message/:leadId`. Not stored.

```json
{
  "message": "Hi John, I wanted to follow up on the proposal we discussed..."
}
```

---

## API Response Shapes

All endpoints use these two standard response envelopes (per Constitution
Principle IV):

**Success**:
```json
{
  "success": true,
  "message": "Human-readable success description",
  "data": { }
}
```

**Error**:
```json
{
  "success": false,
  "message": "Human-readable error description",
  "errors": [ ]
}
```

---

## Environment Variables

**`server/.env`**:
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/leadflow
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

**`client/.env`**:
```
VITE_API_URL=http://localhost:5000/api
```
