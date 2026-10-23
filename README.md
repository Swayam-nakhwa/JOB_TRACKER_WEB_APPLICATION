# Job Application Tracker (Full-Stack Multi-User SaaS)

A full-stack, accessible Job Application Tracker built with **React 19**, **Vite 8**, **Tailwind CSS v4**, **Node.js/Express**, **Mongoose / MongoDB**, **bcrypt.js** password hashing, and **JWT** session authentication.

---

## 🚀 Quick Start

### 1. Run Full-Stack (Frontend + Backend Concurrently)
```bash
npm run dev:all
```
* **Frontend**: [http://localhost:5173](http://localhost:5173)
* **Backend API**: [http://localhost:5000](http://localhost:5000)

Or run them in separate terminals:
```bash
# Terminal 1: Backend Server
npm run server

# Terminal 2: Frontend Client
npm run dev
```

---

## 🔐 Security & Architecture

1. **Bcrypt Password Hashing**: Passwords are salted and hashed using `bcryptjs` with 10 salt rounds before being stored. Plaintext passwords are never saved.
2. **JWT Authentication**: Users receive a signed JSON Web Token upon registration/login, which is verified via `authMiddleware` for all protected `/api/jobs` routes.
3. **Multi-User Data Isolation**: Every job application in MongoDB is indexed and tied to the authenticated user's ID (`userId`). Users can only access, modify, or delete their own applications.
4. **Resilient MongoDB + Fallback**:
   - If `MONGODB_URI` is supplied in `.env`, the server automatically connects to MongoDB Atlas or local MongoDB.
   - If no MongoDB URI is supplied, the server seamlessly runs in local fallback mode with full bcrypt hashing and JWT auth active.

---

## ⚙️ Environment Configuration (`.env`)

Create or edit `.env` in the root folder:

```env
# Server Port
PORT=5000

# MongoDB Connection String (Atlas or Local)
# Example for Atlas: mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/jobtracker?retryWrites=true&w=majority
# Example for Local: mongodb://localhost:27017/jobtracker
MONGODB_URI=

# JWT Secret for Signing User Authentication Tokens
JWT_SECRET=job-tracker-production-secret-key-2026

# Optional: Real Gmail SMTP for Password Reset OTP Emails
GMAIL_USER=
GMAIL_APP_PASSWORD=
```

---

## 📦 API Endpoints

### Authentication (`/api/auth`)
* `POST /api/auth/register` — Hash password and create user
* `POST /api/auth/login` — Verify bcrypt password hash and return JWT
* `GET /api/auth/me` — Return current authenticated user profile
* `POST /api/auth/forgot-password` — Generate & dispatch 6-digit OTP
* `POST /api/auth/verify-otp` — Verify OTP code
* `POST /api/auth/reset-password` — Hash new password and update user

### Jobs (`/api/jobs`) [Protected by JWT]
* `GET /api/jobs` — Retrieve only the logged-in user's applications
* `POST /api/jobs` — Create a new application
* `PUT /api/jobs/:id` — Update application details or status
* `DELETE /api/jobs/:id` — Remove an application
* `POST /api/jobs/sync` — Bulk import existing local applications
