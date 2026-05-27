# Quickstart: LeadFlow AI — Local Development

**Prerequisites**:
- Node.js 18 or higher (`node -v`)
- npm 9 or higher (`npm -v`)
- MongoDB: either a local installation OR a MongoDB Atlas free-tier cluster

---

## 1. Clone the Repository

```bash
git clone <repo-url>
cd LeadFlow-AI-AI-Sales-CRM-Quotation-Management-Platform
```

---

## 2. Configure the Backend

```bash
cd server
cp .env.example .env
```

Edit `server/.env` and fill in your values:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/leadflow
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

For MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string:
```
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/leadflow
```

---

## 3. Configure the Frontend

```bash
cd ../client
cp .env.example .env
```

Edit `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 4. Install Dependencies

In two separate terminals (or sequentially):

```bash
# Terminal 1 — Backend
cd server
npm install

# Terminal 2 — Frontend
cd client
npm install
```

---

## 5. Start Development Servers

```bash
# Terminal 1 — Backend (runs on http://localhost:5000)
cd server
npm run dev

# Terminal 2 — Frontend (runs on http://localhost:5173)
cd client
npm run dev
```

---

## 6. Access the Application

Open your browser at: **http://localhost:5173**

You will see the Login page. Register a new account to get started.

---

## 7. Default Admin Account (Optional Seed)

If the project includes a seed script:

```bash
cd server
npm run seed
```

This creates a default admin account:
- **Email**: `admin@leadflow.ai`
- **Password**: `admin123456`

And a test user account:
- **Email**: `user@leadflow.ai`
- **Password**: `user123456`

---

## 8. Test the API

Import the Postman/Thunder Client collection from `docs/api-collection.json`
(if present), or test endpoints manually using the contracts in
`specs/001-leadflow-crm-mvp/contracts/`.

Base URL for API calls: `http://localhost:5000/api`

Example: Register a user
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

---

## 9. Verify Validation

- Try to create a lead without `customerName` → expect 400 validation error
- Try to log in with wrong password → expect 401 unauthorized
- Try to access `/api/leads` without a token → expect 401 unauthorized
- Log in as user, try to access another user's lead → expect 403 forbidden

---

## Common Issues

| Issue | Fix |
|-------|-----|
| `ECONNREFUSED` on backend | MongoDB is not running. Start `mongod` or check Atlas URI |
| `401 Unauthorized` on all requests | Token not set in Authorization header; check Axios interceptor |
| CORS error in browser | Check `CLIENT_URL` in `server/.env` matches the Vite dev port |
| Port conflict on 5000 | Change `PORT` in `server/.env` and update `VITE_API_URL` in `client/.env` |
