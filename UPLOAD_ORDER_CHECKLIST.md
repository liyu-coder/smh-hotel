# 📋 File Upload Order - cPanel Deployment

## 🚨 **UPLOAD IN THIS EXACT ORDER**

### **PHASE 1: DATABASE FIRST** ⚠️
1. `backend/task_limit_migration.sql` → Run this in phpMyAdmin FIRST

---

### **PHASE 2: BACKEND CORE** 🗂️
2. `backend/package.json`
3. `backend/package-lock.json`
4. `backend/server.js`
5. `backend/.env.example`

### **PHASE 3: DATABASE CONFIG** 🔧
6. `backend/config/database.js`

### **PHASE 4: MIDDLEWARE** 🛡️
7. `backend/middleware/auth.js`
8. `backend/middleware/errorHandler.js`

### **PHASE 5: ROUTES - CRITICAL ORDER** 🛣️

#### Authentication & User Management
9. `backend/routes/auth.js`
10. `backend/routes/users.js`

#### Financial & Wallet System
11. `backend/routes/wallet.js`
12. `backend/routes/transactions.js`
13. `backend/routes/deposits.js`
14. `backend/routes/admin-deposits.js`

#### Booking System (Enhanced)
15. `backend/routes/bookings.js` ⭐ **UPDATED**
16. `backend/routes/booking-sessions.js` ⭐ **NEW**

#### Hotel System (Enhanced)
17. `backend/routes/hotels.js` ⭐ **UPDATED**

#### Admin System (Enhanced)
18. `backend/routes/admin.js` ⭐ **UPDATED**

#### Support & Other Routes
19. `backend/routes/support.js`
20. `backend/routes/team.js`
21. `backend/routes/countries.js`
22. `backend/routes/reservation.js`

---

### **PHASE 6: FRONTEND** 🎨

#### Main Frontend Files
23. `src/package.json`
24. `src/package-lock.json`
25. `src/index.html`
26. `src/vite.config.ts`
27. `src/postcss.config.mjs`
28. `src/pnpm-workspace.yaml`

#### Frontend Source Directory
29. `src/` (entire directory with all subfolders)

---

### **PHASE 7: ROOT CONFIGURATION** ⚙️
30. `package.json`
31. `package-lock.json`
32. `Procfile`
33. `.env.production`
34. `README.md`

---

### **PHASE 8: DOCUMENTATION** 📚
35. `IMPLEMENTATION_SUMMARY.md`
36. `DEPLOYMENT_CHECKLIST.md`
37. `CPANEL_DEPLOYMENT_GUIDE.md`

---

## 🎯 **CRITICAL UPLOAD INSTRUCTIONS**

### **BEFORE YOU START:**
1. ✅ Backup existing system
2. ✅ Download current files
3. ✅ Test database connection

### **UPLOAD METHOD:**
1. Use cPanel **File Manager**
2. Or FTP client like FileZilla
3. Maintain folder structure exactly

### **⚠️ IMPORTANT NOTES:**

#### **DO NOT OVERWRITE:**
- Existing `.env` file (update manually)
- User data in database
- Existing uploads/images

#### **DO UPDATE:**
- All backend route files
- Database schema (via SQL migration)
- Frontend build files

#### **AFTER EACH PHASE:**
1. Test basic functionality
2. Check for errors
3. Verify file permissions

---

## 🔧 **POST-UPLOAD SETUP**

### **Step 1: Database Migration**
```sql
-- Run in phpMyAdmin
-- File: backend/task_limit_migration.sql
```

### **Step 2: Environment Variables**
```bash
# Update backend/.env with:
DB_HOST=localhost
DB_NAME=your_database_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
PEXELS_API_KEY=your_pexels_key
UNSPLASH_API_KEY=your_unsplash_key
JWT_SECRET=your_jwt_secret
NODE_ENV=production
```

### **Step 3: Install Dependencies**
```bash
cd backend
npm install --production
```

### **Step 4: Restart Services**
```bash
# In cPanel Node.js setup
# Restart application
```

---

## 🧪 **VERIFICATION TESTS**

### **Test 1: Health Check**
```bash
curl https://yourdomain.com/api/health
```

### **Test 2: Authentication**
```bash
curl -X POST https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

### **Test 3: New Features**
```bash
# Random hotels
curl "https://yourdomain.com/api/hotels/random?limit=5"

# Booking sessions
curl -X POST https://yourdomain.com/api/booking-sessions/start \
  -H "Authorization: Bearer TOKEN"
```

---

## 🚨 **TROUBLESHOOTING**

### **If Upload Fails:**
1. Check file permissions (755 for folders, 644 for files)
2. Verify disk space
3. Check file size limits
4. Restart upload from failed phase

### **If Application Errors:**
1. Check Node.js version (18+)
2. Verify database connection
3. Check environment variables
4. Review application logs

### **If New Features Don't Work:**
1. Verify database migration completed
2. Check all route files uploaded
3. Verify API keys configured
4. Test individual endpoints

---

## ✅ **SUCCESS CHECKLIST**

### **When All Files Uploaded:**
- [ ] Database migration completed
- [ ] All backend files in place
- [ ] Frontend built and deployed
- [ ] Environment variables set
- [ ] Dependencies installed
- [ ] Services restarted
- [ ] Health endpoint responding
- [ ] Authentication working
- [ ] New features functional
- [ ] Admin controls accessible

---

## 🎉 **DEPLOYMENT COMPLETE**

Your enhanced hotel booking system is now live with:
- ✅ Task limit system
- ✅ Enhanced wallet features
- ✅ Deposit approval workflow
- ✅ Comprehensive transaction history
- ✅ Booking session management
- ✅ Random hotel display with images
- ✅ Extended admin controls

**🚀 Ready for production use!**
