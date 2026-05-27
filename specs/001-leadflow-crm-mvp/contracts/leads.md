# API Contract: Leads

**Base path**: `/api/leads`
**Auth**: Bearer token required for all endpoints

---

## GET /api/leads

List leads with pagination, search, and filtering.

**Query Parameters**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Records per page |
| `search` | string | — | Search by customerName or phone |
| `status` | string | — | Filter by status enum value |
| `score` | string | — | Filter by score enum value |
| `source` | string | — | Filter by source enum value |
| `sortBy` | string | `createdAt` | Field to sort by |
| `sortOrder` | string | `desc` | `asc` or `desc` |

**Scope**: Admin sees all leads. User sees only leads where `createdBy` or
`assignedTo` equals their user ID.

**Response 200 — OK**:
```json
{
  "success": true,
  "message": "Leads retrieved",
  "data": {
    "leads": [
      {
        "_id": "64abc001...",
        "customerName": "Nguyen Van A",
        "phone": "0901234567",
        "email": "vana@example.com",
        "company": "ABC Corp",
        "status": "Qualified",
        "score": "Hot",
        "source": "Facebook",
        "budget": 25000,
        "notes": "Interested in premium package",
        "createdBy": { "_id": "...", "name": "Jane Smith" },
        "assignedTo": { "_id": "...", "name": "Jane Smith" },
        "createdAt": "2026-05-20T08:00:00.000Z",
        "updatedAt": "2026-05-22T10:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 42,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

---

## POST /api/leads

Create a new lead.

**Request Body**:
```json
{
  "customerName": "Nguyen Van A",
  "phone": "0901234567",
  "email": "vana@example.com",
  "company": "ABC Corp",
  "source": "Facebook",
  "budget": 25000,
  "notes": "Interested in premium package",
  "assignedTo": "64user002..."
}
```

**Validation**:
- `customerName`: required, string, non-empty
- `phone`: required, string, non-empty
- `budget`: optional, number, min 0
- `status`: always defaults to `New` on creation (ignored if provided)
- `assignedTo`: optional, must be a valid user ObjectId

**Response 201 — Created**:
```json
{
  "success": true,
  "message": "Lead created",
  "data": {
    "_id": "64abc001...",
    "customerName": "Nguyen Van A",
    "phone": "0901234567",
    "status": "New",
    "score": null,
    "createdBy": "64user001...",
    "createdAt": "2026-05-26T00:00:00.000Z"
  }
}
```

**Response 400 — Validation Error**:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "customerName", "message": "Customer name is required" },
    { "field": "budget", "message": "Budget must be a non-negative number" }
  ]
}
```

---

## GET /api/leads/:id

Get a single lead by ID.

**Scope**: Admin or lead owner/assignee only.

**Response 200 — OK**:
```json
{
  "success": true,
  "message": "Lead retrieved",
  "data": {
    "_id": "64abc001...",
    "customerName": "Nguyen Van A",
    "phone": "0901234567",
    "email": "vana@example.com",
    "company": "ABC Corp",
    "status": "Qualified",
    "score": "Hot",
    "source": "Facebook",
    "budget": 25000,
    "notes": "Interested in premium package",
    "createdBy": { "_id": "...", "name": "Jane Smith" },
    "assignedTo": { "_id": "...", "name": "Jane Smith" },
    "createdAt": "2026-05-20T08:00:00.000Z",
    "updatedAt": "2026-05-22T10:00:00.000Z"
  }
}
```

**Response 404 — Not Found**:
```json
{
  "success": false,
  "message": "Lead not found",
  "errors": []
}
```

---

## PUT /api/leads/:id

Update a lead.

**Scope**: Admin or lead owner/assignee only.

**Request Body** (all fields optional — partial update):
```json
{
  "customerName": "Nguyen Van A",
  "phone": "0901234567",
  "status": "Contacted",
  "score": "Warm",
  "budget": 30000,
  "notes": "Follow-up scheduled for Friday"
}
```

**Validation**: Same rules as POST; `budget` must be >= 0.

**Response 200 — OK**:
```json
{
  "success": true,
  "message": "Lead updated",
  "data": { }
}
```

---

## DELETE /api/leads/:id

Delete a lead permanently.

**Scope**: Admin or lead owner only (assignee cannot delete).

**Response 200 — OK**:
```json
{
  "success": true,
  "message": "Lead deleted",
  "data": null
}
```

**Response 403 — Forbidden**:
```json
{
  "success": false,
  "message": "You do not have permission to delete this lead",
  "errors": []
}
```
