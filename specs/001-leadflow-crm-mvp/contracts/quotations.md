# API Contract: Quotations

**Base path**: `/api/quotations`
**Auth**: Bearer token required for all endpoints

---

## GET /api/quotations

List quotations with pagination and filtering.

**Query Parameters**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Records per page |
| `status` | string | — | Filter by status enum |
| `leadId` | string | — | Filter by linked lead |
| `sortBy` | string | `createdAt` | Sort field |
| `sortOrder` | string | `desc` | `asc` or `desc` |

**Response 200 — OK**:
```json
{
  "success": true,
  "message": "Quotations retrieved",
  "data": {
    "quotations": [
      {
        "_id": "64qt001...",
        "quotationCode": "QT-2026-001",
        "lead": { "_id": "...", "customerName": "Nguyen Van A" },
        "status": "Draft",
        "totalAmount": 15000,
        "createdBy": { "_id": "...", "name": "Jane Smith" },
        "createdAt": "2026-05-26T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 12,
      "page": 1,
      "limit": 10,
      "totalPages": 2
    }
  }
}
```

---

## POST /api/quotations

Create a new quotation.

**Request Body**:
```json
{
  "quotationCode": "QT-2026-001",
  "lead": "64abc001...",
  "status": "Draft",
  "items": [
    {
      "description": "Web Development Package",
      "quantity": 1,
      "unitPrice": 12000
    },
    {
      "description": "Support Plan (monthly)",
      "quantity": 3,
      "unitPrice": 1000
    }
  ],
  "notes": "Includes 3 months of support"
}
```

**Validation**:
- `quotationCode`: required, must be unique
- `lead`: required, must be a valid existing lead ID
- `items`: required, array with at least 1 item
- Each item: `description` required; `quantity` and `unitPrice` >= 0
- `totalAmount` is computed server-side; client value is ignored

**Response 201 — Created**:
```json
{
  "success": true,
  "message": "Quotation created",
  "data": {
    "_id": "64qt001...",
    "quotationCode": "QT-2026-001",
    "lead": "64abc001...",
    "status": "Draft",
    "items": [
      { "description": "Web Development Package", "quantity": 1, "unitPrice": 12000, "total": 12000 },
      { "description": "Support Plan (monthly)", "quantity": 3, "unitPrice": 1000, "total": 3000 }
    ],
    "totalAmount": 15000,
    "createdAt": "2026-05-26T00:00:00.000Z"
  }
}
```

**Response 400 — Duplicate Code**:
```json
{
  "success": false,
  "message": "Quotation code already exists",
  "errors": [{ "field": "quotationCode", "message": "Must be unique" }]
}
```

---

## GET /api/quotations/:id

Get a single quotation with full item detail.

**Response 200 — OK**:
```json
{
  "success": true,
  "message": "Quotation retrieved",
  "data": {
    "_id": "64qt001...",
    "quotationCode": "QT-2026-001",
    "lead": {
      "_id": "64abc001...",
      "customerName": "Nguyen Van A",
      "phone": "0901234567",
      "status": "Quoted"
    },
    "status": "Draft",
    "items": [
      { "description": "Web Development Package", "quantity": 1, "unitPrice": 12000, "total": 12000 },
      { "description": "Support Plan (monthly)", "quantity": 3, "unitPrice": 1000, "total": 3000 }
    ],
    "totalAmount": 15000,
    "notes": "Includes 3 months of support",
    "createdBy": { "_id": "...", "name": "Jane Smith" },
    "createdAt": "2026-05-26T00:00:00.000Z",
    "updatedAt": "2026-05-26T00:00:00.000Z"
  }
}
```

---

## PUT /api/quotations/:id

Update a quotation (status, items, notes).

**Restrictions**:
- Items CANNOT be edited if status is `Accepted`.
- If body includes `items` and status is `Accepted`, respond 400.

**Request Body** (partial update):
```json
{
  "status": "Sent",
  "notes": "Sent to client via email"
}
```

**Response 200 — OK**:
```json
{
  "success": true,
  "message": "Quotation updated",
  "data": { }
}
```

**Response 400 — Edit Locked**:
```json
{
  "success": false,
  "message": "Cannot edit line items on an Accepted quotation",
  "errors": []
}
```

---

## DELETE /api/quotations/:id

Delete a quotation. Only permitted when status is `Draft`.

**Response 200 — OK**:
```json
{
  "success": true,
  "message": "Quotation deleted",
  "data": null
}
```

**Response 400 — Cannot Delete**:
```json
{
  "success": false,
  "message": "Only Draft quotations can be deleted",
  "errors": []
}
```

---

## PUT /api/quotations/:id/accept

Accept a quotation and optionally mark the linked lead as Won.

**Request Body**:
```json
{
  "markLeadAsWon": true
}
```

**Response 200 — OK**:
```json
{
  "success": true,
  "message": "Quotation accepted. Lead marked as Won.",
  "data": {
    "quotation": { "_id": "64qt001...", "status": "Accepted" },
    "lead": { "_id": "64abc001...", "status": "Won" }
  }
}
```

---

## GET /api/quotations/generate-code

Suggest the next available quotation code for the current year.

**Response 200 — OK**:
```json
{
  "success": true,
  "message": "Code generated",
  "data": {
    "code": "QT-2026-003"
  }
}
```
