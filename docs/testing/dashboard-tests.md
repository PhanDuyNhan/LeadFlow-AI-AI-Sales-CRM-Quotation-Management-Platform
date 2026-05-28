# Manual Test Checklist — Dashboard Analytics

`GET /dashboard` requires `Authorization: Bearer <token>` and returns
`{ summary, charts, topHotLeads, todayFollowUps, overdueFollowUps }`. All values
are role-scoped. Seed sample data (`npm run seed`) for a populated dashboard.

## API

- [ ] `GET /dashboard` returns all 12 summary metrics: `totalLeads`, `newLeads`,
      `hotLeads`, `warmLeads`, `coldLeads`, `totalQuotations`, `sentQuotations`,
      `acceptedQuotations`, `estimatedRevenue`, `conversionRate`, `followUpsToday`,
      `overdueFollowUps`.
- [ ] `charts` includes `leadByStatus`, `leadBySource`, `quotationByStatus`, `revenueForecast`.
- [ ] `estimatedRevenue` = sum of `totalAmount` for quotations with status `Sent` or `Accepted`.
- [ ] `conversionRate` = `wonLeads / totalLeads × 100` (1 decimal, `0` when no leads — no divide-by-zero).
- [ ] As **admin** → metrics reflect all users' data.
- [ ] As **user** → metrics reflect only own / assigned data.
- [ ] With an empty database → all counts are `0` and no errors are thrown.

## UI

- [ ] Dashboard shows a loading spinner, then cards + charts (or a global empty state with CTAs).
- [ ] All 12 metric cards render with correct values matching the underlying records.
- [ ] All 4 charts render via Recharts `ResponsiveContainer` (no fixed-width overflow).
- [ ] Today's follow-ups and overdue widgets list the right items; "View all" links to `/tasks`.
- [ ] Top hot leads table links to each lead detail.
- [ ] Metric grid collapses 4 → 3 → 2 columns as the viewport narrows to 375px without overflow.
- [ ] "Refresh" re-fetches; the error state offers a working "Try again".
