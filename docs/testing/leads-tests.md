# Manual Test Checklist — Lead Management

All `/leads` routes require `Authorization: Bearer <token>`.

## API

- [ ] `POST /leads` without `customerName` → `400` validation error.
- [ ] `POST /leads` without `phone` → `400` validation error.
- [ ] `POST /leads` with `budget: -100` → `400` validation error.
- [ ] `POST /leads` with a valid body → `201`; `status` defaults to `New`.
- [ ] `GET /leads` as **admin** → returns all leads; as **user** → only own/assigned.
- [ ] `GET /leads?search=0901` → returns leads matching name/phone/email/company.
- [ ] `GET /leads?status=Qualified` and `?leadScore=Hot` and `?source=Referral` filter correctly.
- [ ] `GET /leads?page=2&limit=10` → paginated; response includes `pagination` totals.
- [ ] `GET /leads/:id` for a record outside your scope (as user) → `403`; non-existent id → `404`.
- [ ] `PATCH /leads/:id/status` updates only the status.
- [ ] `POST /leads/:id/notes` appends a note.
- [ ] `DELETE /leads/:id` as a non-owner regular user → `403`; as owner/admin → `200`.

## UI

- [ ] Leads page shows a loading state, then the table (or an empty state with a "create" CTA).
- [ ] Search box is debounced and resets to page 1.
- [ ] Filters and "reset" work; status/score render as colored badges.
- [ ] Creating a lead shows inline validation errors for empty required fields and a success toast on save.
- [ ] Editing status inline persists and reflects immediately.
- [ ] Delete opens a clear confirm dialog naming the lead; cancel aborts, confirm deletes with a toast.
- [ ] Table scrolls horizontally (no layout break) on a 375px viewport.
