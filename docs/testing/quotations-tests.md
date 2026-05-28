# Manual Test Checklist — Quotation Management

All `/quotations` routes require `Authorization: Bearer <token>`. A quotation
must be linked to a lead and contain at least one line item. Totals are computed
server-side: `subtotal = Σ(quantity × unitPrice)`, `total = subtotal − discount + tax`
(never below 0).

## API

- [ ] `GET /quotations/generate-code` → returns a unique code string.
- [ ] `POST /quotations` with a duplicate `quotationCode` → `400` unique error.
- [ ] `POST /quotations` with an item `unitPrice: -1` (or `quantity: -1`) → `400` validation error.
- [ ] `POST /quotations` with no items → `400` ("at least one item").
- [ ] `POST /quotations` valid → `201`; `status` defaults to `Draft`; `subtotal`/`totalAmount` computed.
- [ ] Verify totals: 2 items (e.g. 25 × 400 and 1 × 1500) with `discount: 500` →
      `subtotal: 11500`, `totalAmount: 11000`.
- [ ] `PATCH /quotations/:id/status` Draft → Sent → Accepted transitions succeed.
- [ ] Accepting with `leadStatus: "Won"` marks the linked lead as `Won`.
- [ ] `PUT /quotations/:id` editing items on an **Accepted** quotation → `400` locked error.
- [ ] `DELETE /quotations/:id` on a **Sent** (non-Draft) quotation → `400` cannot delete.
- [ ] `DELETE /quotations/:id` on a **Draft** quotation as owner/admin → `200`.
- [ ] `GET /quotations` as a regular user → only quotations they created / linked to visible leads.

## UI

- [ ] Create page: lead selector populates; code is auto-suggested; customer name auto-fills.
- [ ] Line item editor updates row totals, subtotal, and grand total live as you type.
- [ ] Detail page: Send / Accept / Reject buttons appear per the current status.
- [ ] Accept dialog offers a "mark lead as Won" checkbox; Reject offers Negotiating/Lost.
- [ ] Item inputs are locked (read-only) once the quotation is Accepted.
- [ ] Delete button is disabled for non-Draft quotations; confirm dialog is clear.
- [ ] Line item editor and totals wrap without overflow on a 375px viewport.
