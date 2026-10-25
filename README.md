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
   - If no MongoDB URI is supplied during local development, the server uses a local JSON fallback. Production requires MongoDB to avoid losing data when the hosting instance restarts.

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
JWT_SECRET=replace-with-a-long-random-secret

# Optional: Real Gmail SMTP for Password Reset OTP Emails
GMAIL_USER=
GMAIL_APP_PASSWORD=
```

---

## 🚂 Deploying to Railway

The repository includes a `railway.json` configuration. Railway will run `npm run build`, start the Express server with `npm start`, and check `/api/health`. The server also serves the built React app.

1. Push this repository to GitHub, then in Railway choose **New Project → Deploy from GitHub repo** and select the repository.
2. Add a MongoDB database to the Railway project (or use MongoDB Atlas). In the application service's **Variables**, set `MONGODB_URI` to the database connection URL.
3. Set `JWT_SECRET` to a unique, long random value. Do not use the example value from `.env.example` or commit production secrets.
4. Set `NODE_ENV` to `production`. Optionally set `GMAIL_USER` and `GMAIL_APP_PASSWORD` to enable password-reset emails.
5. Wait for the deployment to pass its `/api/health` check. In the service's **Settings → Networking**, generate a public domain and open it to verify the app.

`PORT` is assigned by Railway automatically; do not set it manually. The service will not start in production if `MONGODB_URI` or `JWT_SECRET` is missing or MongoDB is unreachable. Once the domain is generated, test account registration/login and refresh the page to confirm the SPA route works.

For a local production-mode smoke test, configure `.env` with MongoDB and a JWT secret, then run:

```bash
npm run build
npm start
```

Open `http://localhost:5000` and `http://localhost:5000/api/health`.

## ▲ Deploying to Vercel

The repository includes a `vercel.json` configuration. Vercel builds and serves the Vite frontend as static files and runs the Express API as a serverless function.

1. Sign up or log in to [Vercel](https://vercel.com/signup), then choose **Add New → Project** and import this GitHub repository.
2. Keep the project root directory as the repository root. Vercel uses the included build configuration; Node.js 22.12 or later is required.
3. Create a MongoDB database using MongoDB Atlas or another hosted MongoDB provider. In the Vercel project **Settings → Environment Variables**, add `MONGODB_URI` and `JWT_SECRET`.
4. Add `NODE_ENV` with value `production`. Optionally add `GMAIL_USER` and `GMAIL_APP_PASSWORD` to enable password-reset emails.
5. Deploy, then open the assigned domain and check `/api/health`. Register a test account and refresh a nested app route to verify the frontend and API.

Do not set `PORT` on Vercel or use the local JSON database for production: serverless instances are temporary. Production API requests require a reachable MongoDB database and a unique `JWT_SECRET`; without either, the API will return an error rather than silently use temporary storage.

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
