# 🚀 cPanel Deployment Guide - Hotel Booking System

## 📋 Step-by-Step Deployment Process

### 🔍 Pre-Deployment Checklist
- [ ] Backup your existing system
- [ ] Have cPanel login credentials ready
- [ ] Have database access ready
- [ ] Prepare API keys for Pexels/Unsplash

---

## 📁 Files to Upload (In Correct Order)

### 🗂️ **Phase 1: Backend Files** (Upload first)

#### 1. Database Migration
```
backend/task_limit_migration.sql
```

#### 2. Core Backend Files
```
backend/server.js
backend/package.json
backend/package-lock.json
```

#### 3. Database Configuration
```
backend/config/database.js
backend/.env.example
```

#### 4. Middleware
```
backend/middleware/auth.js
backend/middleware/errorHandler.js
```

#### 5. Routes (Upload in this order)
```
backend/routes/auth.js
backend/routes/users.js
backend/routes/wallet.js
backend/routes/transactions.js
backend/routes/bookings.js
backend/routes/booking-sessions.js (NEW)
backend/routes/hotels.js
backend/routes/admin.js
backend/routes/deposits.js
backend/routes/admin-deposits.js
backend/routes/support.js
backend/routes/team.js
backend/routes/countries.js
backend/routes/reservation.js
```

### 🗂️ **Phase 2: Frontend Files**

#### 1. Main Frontend Files
```
src/index.html
src/package.json
src/vite.config.ts
src/postcss.config.mjs
src/pnpm-workspace.yaml
```

#### 2. Frontend Source Code
```
src/ (entire directory)
```

### 🗂️ **Phase 3: Configuration Files**

#### 1. Root Configuration
```
package.json
package-lock.json
Procfile
.env.production
README.md
```

---

## 🗄️ Database Migration Steps

### Step 1: Access cPanel Database
1. Login to cPanel
2. Go to **"Databases"** → **"phpMyAdmin"**
3. Select your hotel booking database

### Step 2: Run Migration SQL
1. Click on **"SQL"** tab
2. Copy and paste the contents of `task_limit_migration.sql`
3. Click **"Go"** to execute

### Step 3: Verify Migration
```sql
-- Check if new columns exist
DESCRIBE user_wallets;
DESCRIBE transactions;
DESCRIBE bookings;

-- Check if new table exists
SHOW TABLES LIKE 'booking_sessions';
```

---

## ⚙️ Environment Setup

### Step 1: Update .env File
Create/update `.env` file in backend directory:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password

# API Keys for Images
PEXELS_API_KEY=your_pexels_api_key
UNSPLASH_API_KEY=your_unsplash_api_key

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Server Configuration
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Step 2: Install Dependencies
Via cPanel **Terminal** or **SSH**:

```bash
cd backend
npm install --production
```

### Step 3: Start Backend Service
```bash
npm start
```

---

## 🌐 Frontend Deployment

### Step 1: Build Frontend
```bash
cd src
npm install
npm run build
```

### Step 2: Configure Web Server
In cPanel **"File Manager"**, ensure `dist/` folder is web-accessible.

---

## 🔧 cPanel Setup Steps

### Step 1: Setup Node.js Application
1. Go to **"Setup Node.js App"**
2. Click **"Create Application"**
3. Configure:
   - **Node.js version**: 18.x or higher
   - **Application mode**: Production
   - **Application root**: `/backend`
   - **Application URL**: `yourdomain.com/api`
   - **Application startup file**: `server.js`
   - **Environment variables**: Add from .env file

### Step 2: Setup Domain/Subdomain
1. Go to **"Domains"**
2. Point domain/subdomain to the application
3. Configure SSL certificate

### Step 3: Setup Cron Jobs (if needed)
For automated tasks:
```bash
# Restart application daily
0 2 * * * /usr/bin/curl -s https://yourdomain.com/health

# Clean old sessions (weekly)
0 3 * * 0 /usr/bin/mysql -u user -p'password' database -e "DELETE FROM booking_sessions WHERE updated_at < DATE_SUB(NOW(), INTERVAL 30 DAY);"
```

---

## 🧪 Testing & Verification

### Phase 1: Basic Connectivity Tests
```bash
# Test health endpoint
curl https://yourdomain.com/api/health

# Expected: {"status":"OK","message":"SMH Hotel Reservation API is running"}
```

### Phase 2: Authentication Tests
```bash
# Test user registration
curl -X POST https://yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Test user login
curl -X POST https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Phase 3: New Feature Tests
```bash
# Test random hotels
curl "https://yourdomain.com/api/hotels/random?limit=5"

# Test booking session
curl -X POST https://yourdomain.com/api/booking-sessions/start \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test task limit enforcement (should work after first booking)
```

---

## 🚨 Troubleshooting Common Issues

### Issue 1: Database Connection Error
**Solution**: Check .env database credentials in cPanel

### Issue 2: Node.js Application Not Starting
**Solution**: 
1. Check Node.js version compatibility
2. Verify package.json dependencies
3. Check application logs in cPanel

### Issue 3: API Endpoints Not Accessible
**Solution**: 
1. Check .htaccess file for URL rewriting
2. Verify CORS settings
3. Check firewall rules

### Issue 4: Images Not Loading
**Solution**: 
1. Add API keys to environment
2. Check external API rate limits
3. Verify fallback images work

---

## 📊 Post-Deployment Monitoring

### Check These Daily:
1. **Health endpoint**: `/health`
2. **Database connectivity**: Check logs
3. **API response times**: Monitor performance
4. **Error rates**: Check application logs
5. **User registrations**: Monitor new signups

### Monitor These Weekly:
1. **Database size**: Growth trends
2. **Transaction volumes**: Business metrics
3. **API usage patterns**: Performance optimization
4. **Security logs**: Suspicious activities

---

## 🔄 Rollback Plan

### If Something Goes Wrong:

#### Quick Rollback (5 minutes):
1. Restore previous backend files from backup
2. Restart Node.js application in cPanel
3. Verify basic functionality

#### Full Rollback (30 minutes):
1. Restore database from backup
2. Restore all application files
3. Reinstall previous dependencies
4. Test all features

---

## ✅ Final Verification Checklist

### Before Going Live:
- [ ] All files uploaded successfully
- [ ] Database migration completed
- [ ] Environment variables set
- [ ] Node.js application running
- [ ] Health endpoint responding
- [ ] Basic authentication working
- [ ] New features tested
- [ ] Error handling verified
- [ ] Performance acceptable
- [ ] Security measures in place

### After Going Live:
- [ ] Monitor system for 24 hours
- [ ] Check user feedback
- [ ] Verify all transactions
- [ ] Validate business logic
- [ ] Document any issues

---

## 🎯 Success Indicators

### ✅ Deployment Successful When:
- Health endpoint returns OK
- Users can register and login
- Booking system works with task limits
- Deposit approval flow functions
- Random hotels display with images
- Admin controls are accessible
- Transaction history is accurate
- No error logs in system

---

## 📞 Support & Maintenance

### Regular Maintenance Tasks:
- **Daily**: Check system health
- **Weekly**: Review logs and performance
- **Monthly**: Update dependencies
- **Quarterly**: Security audit
- **Yearly**: Full system review

### Emergency Contacts:
- **cPanel Support**: Hosting provider
- **Database Admin**: For database issues
- **Development Team**: For application issues

---

**🎉 Your enhanced hotel booking system is now ready for production deployment!**

Follow these steps carefully and test each phase before proceeding to the next.
