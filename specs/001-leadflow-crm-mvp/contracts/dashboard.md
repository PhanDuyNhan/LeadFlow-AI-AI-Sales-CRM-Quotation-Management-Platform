# API Contract: Dashboard

**Base path**: `/api/dashboard`
**Auth**: Bearer token required

---

## GET /api/dashboard

Return all dashboard metrics and chart data in a single request.

**Scope**: Admin sees aggregate of all data. User sees aggregate of their
own and assigned records only.

**Response 200 — OK**:
```json
{
  "success": true,
  "message": "Dashboard data retrieved",
  "data": {
    "metrics": {
      "totalLeads": 42,
      "newLeads": 8,
      "hotLeads": 5,
      "warmLeads": 14,
      "coldLeads": 23,
      "totalQuotations": 15,
      "sentQuotations": 6,
      "acceptedQuotations": 4,
      "estimatedRevenue": 87500,
      "conversionRate": 9.5,
      "followUpToday": 3,
      "overdueFollowUps": 2
    },
    "charts": {
      "leadByStatus": [
        { "name": "New", "value": 8 },
        { "name": "Contacted", "value": 10 },
        { "name": "Qualified", "value": 7 },
        { "name": "Quoted", "value": 6 },
        { "name": "Negotiating", "value": 3 },
        { "name": "Won", "value": 4 },
        { "name": "Lost", "value": 4 }
      ],
      "leadBySource": [
        { "name": "Facebook", "value": 12 },
        { "name": "Website", "value": 10 },
        { "name": "Zalo", "value": 8 },
        { "name": "Referral", "value": 7 },
        { "name": "Walk-in", "value": 3 },
        { "name": "Event", "value": 1 },
        { "name": "Other", "value": 1 }
      ],
      "quotationByStatus": [
        { "name": "Draft", "value": 5 },
        { "name": "Sent", "value": 6 },
        { "name": "Accepted", "value": 4 },
        { "name": "Rejected", "value": 0 }
      ],
      "revenueForecast": [
        { "month": "Dec 2025", "revenue": 12000 },
        { "month": "Jan 2026", "revenue": 18500 },
        { "month": "Feb 2026", "revenue": 9000 },
        { "month": "Mar 2026", "revenue": 22000 },
        { "month": "Apr 2026", "revenue": 14000 },
        { "month": "May 2026", "revenue": 12000 }
      ]
    }
  }
}
```

**Field definitions**:
- `estimatedRevenue`: sum of `totalAmount` for all Accepted quotations in scope
- `conversionRate`: `(Won leads / total leads) × 100`, rounded to 1 decimal
- `followUpToday`: count of tasks where `dueDate` = today AND `completed: false`
- `overdueFollowUps`: count of tasks where `dueDate` < today AND `completed: false`
- `revenueForecast`: sum of `totalAmount` for `Accepted` and `Sent` quotations
  grouped by month of `createdAt`, last 6 months
