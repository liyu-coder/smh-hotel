# 📋 Step-by-Step Deployment - Hotel Booking System

## **STEP 1: BACKUP YOUR EXISTING SYSTEM** 🔒
- Download all current files from cPanel
- Export database from phpMyAdmin
- Save current .env file
- Document current working features

---

## **STEP 2: DATABASE MIGRATION** 🗄️
1. Login to cPanel
2. Go to **Databases** → **phpMyAdmin**
3. Select your hotel booking database
4. Click **SQL** tab
5. Copy contents of `backend/task_limit_migration.sql`
6. Paste and click **Go**
7. Verify no errors occurred

---

## **STEP 3: UPLOAD BACKEND CORE FILES** 📁
Upload in this order:
1. `backend/package.json`
2. `backend/package-lock.json`
3. `backend/server.js`
4. `backend/.env.example`

---

## **STEP 4: UPLOAD DATABASE CONFIG** ⚙️
5. `backend/config/database.js`

---

## **STEP 5: UPLOAD MIDDLEWARE** 🛡️
6. `backend/middleware/auth.js`
7. `backend/middleware/errorHandler.js`

---

## **STEP 6: UPLOAD ROUTES** 🛣️
**Authentication Routes:**
8. `backend/routes/auth.js`
9. `backend/routes/users.js`

**Financial Routes:**
10. `backend/routes/wallet.js`
11. `backend/routes/transactions.js`
12. `backend/routes/deposits.js`
13. `backend/routes/admin-deposits.js`

**Booking Routes:**
14. `backend/routes/bookings.js` ⭐ (Updated)
15. `backend/routes/booking-sessions.js` ⭐ (New)

**Hotel Routes:**
16. `backend/routes/hotels.js` ⭐ (Updated)

**Admin Routes:**
17. `backend/routes/admin.js` ⭐ (Updated)

**Other Routes:**
18. `backend/routes/support.js`
19. `backend/routes/team.js`
20. `backend/routes/countries.js`
21. `backend/routes/reservation.js`

---

## **STEP 7: UPLOAD FRONTEND FILES** 🎨
22. `src/package.json`
23. `src/package-lock.json`
24. `src/index.html`
25. `src/vite.config.ts`
26. `src/postcss.config.mjs`
27. `src/pnpm-workspace.yaml`
28. Entire `src/` directory with all subfolders

---

## **STEP 8: UPLOAD ROOT CONFIGURATION** 📋
29. `package.json`
30. `package-lock.json`
31. `Procfile`
32. `.env.production`
33. `README.md`

---

## **STEP 9: CONFIGURE ENVIRONMENT VARIABLES** 🔧
1. In cPanel File Manager, edit `backend/.env`
2. Add/update these settings:
```bash
DB_HOST=localhost
DB_PORT=3306
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
PEXELS_API_KEY=your_pexels_api_key
UNSPLASH_API_KEY=your_unsplash_api_key
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## **STEP 10: INSTALL NODE.JS DEPENDENCIES** 📦
1. In cPanel, go to **Terminal**
2. Navigate to backend directory: `cd backend`
3. Run: `npm install --production`

---

## **STEP 11: SETUP NODE.JS APPLICATION** 🚀
1. In cPanel, go to **Setup Node.js App**
2. Click **Create Application**
3. Configure:
   - **Node.js version**: 18.x or higher
   - **Application mode**: Production
   - **Application root**: `/backend`
   - **Application URL**: `yourdomain.com/api`
   - **Application startup file**: `server.js`
4. Add all environment variables from Step 9
5. Click **Create**

---

## **STEP 12: BUILD FRONTEND** 🔨
1. In Terminal, navigate to src directory: `cd src`
2. Run: `npm install`
3. Run: `npm run build`
4. Verify `dist/` folder is created

---

## **STEP 13: CONFIGURE DOMAIN** 🌐
1. In cPanel, go to **Domains**
2. Point your domain to the application
3. Setup SSL certificate
4. Test domain access

---

## **STEP 14: START APPLICATION** ▶️
1. In Node.js setup, click **Restart**
2. Wait for application to start
3. Check application status

---

## **STEP 15: BASIC TESTING** 🧪
1. Test health endpoint:
```bash
curl https://yourdomain.com/api/health
```
2. Expected response:
```json
{"status":"OK","message":"SMH Hotel Reservation API is running"}
```

---

## **STEP 16: AUTHENTICATION TESTING** 🔐
1. Test user registration:
```bash
curl -X POST https://yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

2. Test user login:
```bash
curl -X POST https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## **STEP 17: NEW FEATURES TESTING** ✨
1. Test random hotels:
```bash
curl "https://yourdomain.com/api/hotels/random?limit=5"
```

2. Test booking sessions (use JWT token from login):
```bash
curl -X POST https://yourdomain.com/api/booking-sessions/start \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

3. Test enhanced admin controls (with admin token):
```bash
curl https://yourdomain.com/api/admin/system/overview \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

---

## **STEP 18: DEPOSIT APPROVAL TESTING** 💰
1. Create a test deposit via existing deposit endpoint
2. Approve it with task limit:
```bash
curl -X PUT https://yourdomain.com/api/transactions/1/approve \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{"task_limit": 25, "commission_rate": 0.04}'
```

---

## **STEP 19: TASK LIMIT TESTING** 🎯
1. Make a booking to increment completed tasks
2. Try to book beyond task limit
3. Expected message: "Task limit reached. Please deposit to continue."

---

## **STEP 20: FINAL VERIFICATION** ✅
Check all these work:
- [ ] Health endpoint responding
- [ ] User registration/login working
- [ ] Hotel listing with random display
- [ ] Booking system with task limits
- [ ] Deposit approval workflow
- [ ] Transaction history tracking
- [ ] Booking session management
- [ ] Admin controls accessible
- [ ] Images loading from APIs
- [ ] No error logs in system

---

## **STEP 21: MONITORING SETUP** 📊
1. Set up daily health checks
2. Monitor error logs
3. Track user registrations
4. Watch database performance
5. Monitor API response times

---

## **STEP 22: DOCUMENTATION** 📚
1. Save deployment guides
2. Document any custom changes
3. Create user manual for new features
4. Setup support procedures

---

## **🎉 DEPLOYMENT COMPLETE!**

Your enhanced hotel booking system is now live with:
- ✅ Task limit system
- ✅ Enhanced wallet features  
- ✅ Deposit approval workflow
- ✅ Comprehensive transaction history
- ✅ Booking session management
- ✅ Random hotels with images
- ✅ Extended admin controls

**Monitor for 24 hours to ensure stability!** 🚀
