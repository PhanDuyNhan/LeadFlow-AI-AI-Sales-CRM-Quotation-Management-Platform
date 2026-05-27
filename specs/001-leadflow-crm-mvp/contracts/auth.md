# API Contract: Authentication

**Base path**: `/api/auth`
**Auth**: None required for these endpoints

---

## POST /api/auth/register

Register a new user account.

**Request Body**:
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "securepass123"
}
```

**Validation**:
- `name`: required, string, minLength 2
- `email`: required, valid email format, must be unique
- `password`: required, minLength 8

**Response 201 — Created**:
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "_id": "64abc123...",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "user"
    }
  }
}
```

**Response 400 — Validation Error**:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Email already in use" }
  ]
}
```

---

## POST /api/auth/login

Authenticate with email and password.

**Request Body**:
```json
{
  "email": "jane@example.com",
  "password": "securepass123"
}
```

**Validation**:
- `email`: required, valid email format
- `password`: required

**Response 200 — OK**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "_id": "64abc123...",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "user"
    }
  }
}
```

**Response 401 — Unauthorized**:
```json
{
  "success": false,
  "message": "Invalid email or password",
  "errors": []
}
```

---

## GET /api/auth/me

Return the currently authenticated user's profile.

**Auth**: Bearer token required

**Response 200 — OK**:
```json
{
  "success": true,
  "message": "User profile retrieved",
  "data": {
    "_id": "64abc123...",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "user",
    "createdAt": "2026-05-26T00:00:00.000Z"
  }
}
```

**Response 401 — Unauthorized** (missing or invalid token):
```json
{
  "success": false,
  "message": "Unauthorized — no valid token",
  "errors": []
}
```
