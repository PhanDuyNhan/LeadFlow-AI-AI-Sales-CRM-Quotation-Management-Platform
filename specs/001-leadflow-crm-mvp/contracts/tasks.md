# API Contract: Tasks

**Base path**: `/api/tasks`
**Auth**: Bearer token required for all endpoints

---

## GET /api/tasks

List tasks. Defaults to active (not completed) tasks only.

**Query Parameters**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `filter` | string | `active` | `active` \| `today` \| `overdue` \| `all` |
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Records per page |

**Filter behaviour**:
- `active`: `completed: false` (all non-completed tasks)
- `today`: `dueDate` date equals today AND `completed: false`
- `overdue`: `dueDate` date is before today AND `completed: false`
- `all`: no filter on `completed`

**Scope**: Admin sees all; user sees tasks where `createdBy == self` OR
`assignedTo == self`.

**Response 200 — OK**:
```json
{
  "success": true,
  "message": "Tasks retrieved",
  "data": {
    "tasks": [
      {
        "_id": "64task001...",
        "title": "Follow up on proposal",
        "description": "Call the client about the quotation",
        "dueDate": "2026-05-26T00:00:00.000Z",
        "completed": false,
        "completedAt": null,
        "lead": { "_id": "64abc001...", "customerName": "Nguyen Van A" },
        "createdBy": { "_id": "...", "name": "Jane Smith" },
        "assignedTo": null,
        "createdAt": "2026-05-25T09:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 8,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

---

## POST /api/tasks

Create a new task.

**Request Body**:
```json
{
  "title": "Follow up on proposal",
  "description": "Call the client about the quotation",
  "dueDate": "2026-05-26",
  "lead": "64abc001...",
  "assignedTo": "64user002..."
}
```

**Validation**:
- `title`: required, string, non-empty
- `dueDate`: required, valid ISO date string
- `lead`: optional, valid lead ObjectId if provided
- `assignedTo`: optional, valid user ObjectId if provided

**Response 201 — Created**:
```json
{
  "success": true,
  "message": "Task created",
  "data": {
    "_id": "64task001...",
    "title": "Follow up on proposal",
    "dueDate": "2026-05-26T00:00:00.000Z",
    "completed": false,
    "createdAt": "2026-05-26T00:00:00.000Z"
  }
}
```

---

## GET /api/tasks/:id

Get a single task.

**Response 200 — OK**:
```json
{
  "success": true,
  "message": "Task retrieved",
  "data": {
    "_id": "64task001...",
    "title": "Follow up on proposal",
    "description": "Call the client about the quotation",
    "dueDate": "2026-05-26T00:00:00.000Z",
    "completed": false,
    "completedAt": null,
    "lead": { "_id": "64abc001...", "customerName": "Nguyen Van A" },
    "createdBy": { "_id": "...", "name": "Jane Smith" },
    "assignedTo": null
  }
}
```

---

## PUT /api/tasks/:id

Update a task (title, description, dueDate, assignedTo, lead).

**Request Body** (partial update):
```json
{
  "title": "Updated title",
  "dueDate": "2026-05-28"
}
```

**Response 200 — OK**:
```json
{
  "success": true,
  "message": "Task updated",
  "data": { }
}
```

---

## PUT /api/tasks/:id/complete

Mark a task as completed.

**Request Body**: none required

**Response 200 — OK**:
```json
{
  "success": true,
  "message": "Task marked as completed",
  "data": {
    "_id": "64task001...",
    "completed": true,
    "completedAt": "2026-05-26T14:30:00.000Z"
  }
}
```

---

## DELETE /api/tasks/:id

Delete a task.

**Scope**: Admin or task creator only.

**Response 200 — OK**:
```json
{
  "success": true,
  "message": "Task deleted",
  "data": null
}
```
