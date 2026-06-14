# Deploy ChartFlow to Railway.app

## Prerequisites

1. **Git** — Download from https://git-scm.com/downloads
2. **GitHub account** — https://github.com/signup
3. **Railway account** — https://railway.app/login (sign in with GitHub)

## Step 1: Push code to GitHub

```bash
# After installing Git, open a terminal in this folder and run:
git add .
git commit -m "Initial commit"
# Create repo at https://github.com/new (name: chartflow, public/private: your choice)
git remote add origin https://github.com/YOUR_USERNAME/chartflow.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy on Railway

1. Go to https://railway.app/dashboard
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your `chartflow` repository
4. Railway auto-detects Node.js and uses the root `package.json`

### Add MySQL database

1. In your Railway project dashboard, click **New** → **Database** → **Add MySQL**
2. Wait for it to provision (takes ~1 minute)
3. Click the MySQL service → **Variables** tab
4. Railway auto-injects `MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER`, `MYSQLPASSWORD`

### Set environment variables

In your backend service → **Variables**, add:

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | Enables frontend serving |
| `JWT_SECRET` | `your-random-secret-here` | Generate a random string |
| `JWT_REFRESH_SECRET` | `your-another-random-secret` | Generate another random string |
| `FRONTEND_URL` | `https://your-app.railway.app` | Your Railway domain (shown in dashboard) |

### Run database migration

1. In the Railway dashboard, open your backend service
2. Go to the **Shell** tab
3. Run:
```bash
cd backend
npm run migrate
```

## Step 3: Access your site

Your URL will be: `https://your-app-name.up.railway.app`

To set a custom domain:
1. Go to your backend service → **Settings** → **Domains**
2. Add your custom domain (e.g., `chartflow.com`)
3. Configure DNS at your domain provider

## Step 4: Create admin account

1. Visit your ChartFlow URL
2. Register a new account
3. To make it admin, in Railway Shell:
```bash
cd backend
node -e "
const pool = require('mysql2/promise').createPool({
  host: process.env.MYSQLHOST,
  port: process.env.MYSQLPORT,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE
});
pool.query(\"UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com'\");
pool.end();
"
```

Replace `your-email@example.com` with the email you registered with.

## Optional: SMTP for email verification

Add these variables in Railway:

| Variable | Value |
|----------|-------|
| `SMTP_HOST` | `smtp.gmail.com` (or your provider) |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | `your@email.com` |
| `SMTP_PASS` | `your-app-password` |
| `EMAIL_FROM` | `noreply@yourdomain.com` |

For Gmail, use an App Password (https://myaccount.google.com/apppasswords).

## Troubleshooting

**App shows "Cannot GET /"** — Ensure `NODE_ENV=production` is set in Railway variables.

**Database connection refused** — Verify MySQL service is running and linked to the backend service in Railway.

**502 Bad Gateway** — Run the database migration first (`npm run migrate` in Railway Shell from the backend directory).
