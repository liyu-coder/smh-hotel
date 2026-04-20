# Deployment Guide: GitHub + Yegara Host

## Step 1: Prepare for Deployment

### 1.1 Create .gitignore file
Create `.gitignore` in the root folder:

```
# Dependencies
node_modules/
backend/node_modules/

# Environment variables
.env
backend/.env
.env.local
.env.*.local

# Build outputs
dist/
build/
.vite/

# Database
*.sql
!schema.sql
!migrate-cash-gap.sql

# Debug logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
*.log

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Temporary files
temp/
tmp/
*.tmp
```

### 1.2 Create package.json for root (if not exists)
Create `package.json` in root:

```json
{
  "name": "smh-hotel-reservation",
  "version": "1.0.0",
  "description": "Hotel Reservation System",
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd backend && npm start",
    "dev:frontend": "npm run dev",
    "build": "npm run build",
    "start": "cd backend && npm start"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

## Step 2: Push to GitHub

### 2.1 Initialize Git (if not done)
```bash
git init
git add .
git commit -m "Initial commit - Hotel Reservation System"
```

### 2.2 Create GitHub Repository
1. Go to https://github.com
2. Click "New Repository"
3. Name: `smh-hotel-reservation`
4. Make it Public or Private
5. DON'T initialize with README (we have one)
6. Click "Create repository"

### 2.3 Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/smh-hotel-reservation.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy to Yegara Host

### 3.1 Login to Yegara Host
1. Go to https://yegara.com or your hosting panel
2. Login with your credentials

### 3.2 Create Node.js Application
1. Go to "Applications" or "Node.js Apps"
2. Click "Create Application"
3. Fill details:
   - **App Name**: `smh-hotel`
   - **Runtime**: Node.js 18.x or 20.x
   - **Domain**: `yourdomain.com` or subdomain

### 3.3 Connect GitHub Repository
1. Select "Deploy from Git"
2. Connect your GitHub account
3. Select repository: `smh-hotel-reservation`
4. Branch: `main`

### 3.4 Environment Variables
Add these in Yegara Host environment settings:

```
NODE_ENV=production
PORT=3000

# Database (use Yegara's PostgreSQL or external)
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=hotel_reservation
DB_USER=your-db-user
DB_PASSWORD=your-db-password

# JWT
JWT_SECRET=your-secret-key-here-min-32-chars
JWT_EXPIRE=7d

# CORS (your frontend domain)
CORS_ORIGIN=https://yourdomain.com
```

### 3.5 Build & Deploy
1. Click "Deploy" or "Build"
2. Wait for build to complete
3. Check logs for any errors

---

## Step 4: Database Setup on Yegara

### Option A: Yegara PostgreSQL
```bash
# In Yegara terminal or SSH:
cd backend
node run-migration.js
```

### Option B: External Database (Railway/Neon)
1. Create DB at https://railway.app or https://neon.tech
2. Get connection string
3. Update DB_HOST in environment variables

---

## Step 5: Frontend Deployment (Vercel/Netlify)

### Deploy Frontend Separately:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Or use Netlify:
1. Go to https://netlify.com
2. Connect GitHub repo
3. Build command: `npm run build`
4. Publish directory: `dist`

---

## Common Issues & Fixes

### Issue 1: "Cannot find module"
**Fix**: Ensure `node_modules` not in .gitignore for serverless, or use `npm ci` in build

### Issue 2: Database connection failed
**Fix**: Check DB_HOST uses internal IP if same server, or allow external connections

### Issue 3: CORS errors
**Fix**: Update CORS_ORIGIN to match your frontend domain exactly

### Issue 4: PORT already in use
**Fix**: Use `process.env.PORT` in server.js (already done ✓)

---

## Quick Checklist

- [ ] .gitignore created and working
- [ ] Environment variables secured (not in git)
- [ ] Database migrations ready
- [ ] GitHub repo created and pushed
- [ ] Yegara app created
- [ ] Environment variables added
- [ ] Database connected
- [ ] Migrations run
- [ ] Frontend deployed
- [ ] CORS configured
- [ ] Test login works
- [ ] Test deposit → approve → task flow

---

## Your Commands to Run Now:

```bash
# 1. Go to project folder
cd "d:\Hotel Reservation"

# 2. Check if git exists
git status

# 3. If not initialized:
git init

# 4. Create .gitignore (copy from above)
# 5. Add all files
git add .

# 6. Commit
git commit -m "Hotel Reservation System v1.0"

# 7. Add remote (replace with your GitHub URL)
git remote add origin https://github.com/YOUR_USERNAME/smh-hotel-reservation.git

# 8. Push
git push -u origin main
```

Done! Now go to Yegara Host and deploy from GitHub.
