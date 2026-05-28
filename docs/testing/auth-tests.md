# Manual Test Checklist — Authentication & Access Control

Base URL: `http://localhost:5000/api`. Use Postman / Thunder Client for API
checks and a browser for UI checks. Run the seed first (`npm run seed`) if you
want ready-made admin/user accounts.

## API

- [ ] `POST /auth/register` with a valid body (`name`, `email`, unique, `password` ≥ 8)
      → `201`, returns a `token` and a `user` object **without** a `password` field.
- [ ] `POST /auth/register` with a name < 2 chars or password < 8 → `400` validation error.
- [ ] `POST /auth/register` with an email that already exists → `400`/`409` duplicate error.
- [ ] `POST /auth/login` with correct credentials → `200`, returns `token` + `user`.
- [ ] `POST /auth/login` with a wrong password → `401` unauthorized.
- [ ] `GET /auth/me` with a valid `Authorization: Bearer <token>` → `200` + current user.
- [ ] `GET /auth/me` with no token / a malformed token → `401`.
- [ ] Confirm no endpoint ever returns the `password` field.

## Role scoping

- [ ] Log in as the **admin** demo account → can see leads/quotations/tasks created by other users.
- [ ] Log in as the **user** demo account → sees only records they created or are assigned.

## UI

- [ ] Visiting a protected route (e.g. `/dashboard`) while logged out redirects to `/login`.
- [ ] Registering, then logging in, lands on `/dashboard`.
- [ ] Submitting the login form empty shows inline Zod validation errors (not just a toast).
- [ ] A failed login shows an error toast with a readable message.
- [ ] "Log out" clears the session and returns to `/login`; the back button does not restore the app.
- [ ] Logged-in users hitting `/login` or `/register` are redirected away (PublicOnlyRoute).
