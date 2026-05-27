# API Contract: Users (Settings)

**Base path**: `/api/users`
**Auth**: Bearer token required for all endpoints

---

## GET /api/users/me

Get the current user's profile. (Alias for `GET /api/auth/me`.)

**Response 200 — OK**:
```json
{
  "success": true,
  "message": "Profile retrieved",
  "data": {
    "_id": "64user001...",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "user",
    "createdAt": "2026-05-01T00:00:00.000Z"
  }
}
```

---

## PUT /api/users/me

Update the current user's name and/or email.

**Request Body**:
```json
{
  "name": "Jane Brown",
  "email": "jane.brown@example.com"
}
```

**Validation**:
- `name`: optional, string, minLength 2
- `email`: optional, valid email format, must be unique if changed

**Response 200 — OK**:
```json
{
  "success": true,
  "message": "Profile updated",
  "data": {
    "_id": "64user001...",
    "name": "Jane Brown",
    "email": "jane.brown@example.com",
    "role": "user"
  }
}
```

**Response 400 — Email In Use**:
```json
{
  "success": false,
  "message": "Email already in use by another account",
  "errors": [{ "field": "email", "message": "Email must be unique" }]
}
```

---

## PUT /api/users/me/password

Change the current user's password.

**Request Body**:
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newstrongpass456"
}
```

**Validation**:
- `currentPassword`: required — must match stored hash
- `newPassword`: required, minLength 8

**Response 200 — OK**:
```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": null
}
```

**Response 400 — Wrong Current Password**:
```json
{
  "success": false,
  "message": "Current password is incorrect",
  "errors": [{ "field": "currentPassword", "message": "Does not match" }]
}
```
