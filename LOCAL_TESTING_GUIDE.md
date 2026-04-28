# 🧪 Local Testing Guide - All Features Including Admin Panel

## 🎯 **YES - You Can Test Everything Locally!**

### **📋 What You Can Test Locally:**
- ✅ All user features (registration, login, booking)
- ✅ Admin panel and all admin controls
- ✅ Task limit system
- ✅ Wallet and balance system
- ✅ Deposit approval workflow
- ✅ Transaction history
- ✅ Booking sessions (continue/stop)
- ✅ Random hotels with images
- ✅ All new features

---

## 🚀 **Step 1: Setup Local Environment**

### **Database Setup:**
```bash
# Install MySQL if not already installed
# Or use existing MySQL/MariaDB

# Create database
mysql -u root -p
CREATE DATABASE hotelran_smh_hotel_prod;
```

### **Run Migration:**
```bash
# Navigate to backend directory
cd backend

# Run the migration
mysql -u root -p hotelran_smh_hotel_prod < task_limit_migration.sql
```

### **Environment Setup:**
```bash
# Copy environment file
cp .env.example .env

# Edit .env file
DB_HOST=localhost
DB_PORT=3306
DB_NAME=hotelran_smh_hotel_prod
DB_USER=root
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
PEXELS_API_KEY=your_pexels_key (optional for testing)
UNSPLASH_API_KEY=your_unsplash_key (optional for testing)
```

---

## 🔧 **Step 2: Start Backend Server**

### **Install Dependencies:**
```bash
cd backend
npm install
```

### **Start Server:**
```bash
npm run dev
# or
nodemon server.js
```

**Server will run on:** `http://localhost:5000`

---

## 🎨 **Step 3: Start Frontend**

### **Install Dependencies:**
```bash
cd src
npm install
```

### **Start Frontend:**
```bash
npm run dev
```

**Frontend will run on:** `http://localhost:5173`

---

## 👤 **Step 4: Test User Features**

### **4.1 User Registration:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "+1234567890"
  }'
```

### **4.2 User Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Save the JWT token from response for later tests**

### **4.3 Get Wallet:**
```bash
curl http://localhost:5000/api/wallet \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **4.4 Test Random Hotels:**
```bash
curl "http://localhost:5000/api/hotels/random?limit=5"
```

### **4.5 Test Booking Sessions:**
```bash
# Start session
curl -X POST http://localhost:5000/api/booking-sessions/start \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get current session
curl http://localhost:5000/api/booking-sessions/current \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Pause session
curl -X POST http://localhost:5000/api/booking-sessions/pause \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 👨‍💼 **Step 5: Test Admin Panel**

### **5.1 Create Admin User:**
```bash
# First, register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "admin123",
    "role": "admin"
  }'

# Then manually update role in database
mysql -u root -p hotelran_smh_hotel_prod
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

### **5.2 Admin Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

**Save admin JWT token for admin tests**

### **5.3 Test Admin Controls:**

#### **System Overview:**
```bash
curl http://localhost:5000/api/admin/system/overview \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

#### **Get All Users:**
```bash
curl http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

#### **Set Task Limit for User:**
```bash
# First get user ID from users list
curl -X PATCH http://localhost:5000/api/admin/users/1/task-limit \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "task_limit": 25,
    "commission_rate": 0.04
  }'
```

#### **Get User Task Statistics:**
```bash
curl http://localhost:5000/api/admin/users/1/task-stats \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

#### **Monitor Bookings:**
```bash
curl http://localhost:5000/api/admin/monitoring/bookings \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

#### **Get Users Requiring Recharge:**
```bash
curl http://localhost:5000/api/admin/users/requiring-recharge \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

---

## 💰 **Step 6: Test Deposit & Transaction System**

### **6.1 Create Deposit (User):**
```bash
curl -X POST http://localhost:5000/api/wallet/deposit \
  -H "Authorization: Bearer USER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.00,
    "currency": "USDT",
    "method": "Bank Transfer"
  }'
```

### **6.2 Get All Transactions (Admin):**
```bash
curl http://localhost:5000/api/transactions/admin/all \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### **6.3 Approve Deposit (Admin):**
```bash
# Get transaction ID from admin transactions list
curl -X PUT http://localhost:5000/api/transactions/1/approve \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "task_limit": 25,
    "commission_rate": 0.04,
    "admin_note": "Initial deposit approved"
  }'
```

### **6.4 Check Updated Wallet (User):**
```bash
curl http://localhost:5000/api/wallet \
  -H "Authorization: Bearer USER_JWT_TOKEN"
```

---

## 🏨 **Step 7: Test Booking System**

### **7.1 Get Available Hotels:**
```bash
curl "http://localhost:5000/api/hotels/random?limit=5"
```

### **7.2 Create Booking (User):**
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Authorization: Bearer USER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "hotel_id": 1,
    "check_in_date": "2024-06-01",
    "check_out_date": "2024-06-02",
    "guests": 1
  }'
```

### **7.3 Test Task Limit:**
```bash
# Make multiple bookings until task limit reached
# Repeat booking request multiple times

# Should get: "Task limit reached. Please deposit to continue."
```

### **7.4 Get User Bookings:**
```bash
curl http://localhost:5000/api/bookings \
  -H "Authorization: Bearer USER_JWT_TOKEN"
```

---

## 📊 **Step 8: Test Transaction History**

### **8.1 Get Comprehensive Transaction History (User):**
```bash
curl http://localhost:5000/api/transactions/comprehensive \
  -H "Authorization: Bearer USER_JWT_TOKEN"
```

### **8.2 Get Transaction Monitoring (Admin):**
```bash
curl http://localhost:5000/api/transactions/admin/comprehensive \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

---

## 🧪 **Step 9: Test All Features Together**

### **Complete Workflow Test:**

#### **1. User Registration & Login**
#### **2. Admin Sets Task Limit**
#### **3. User Makes Deposit**
#### **4. Admin Approves Deposit**
#### **5. User Starts Booking Session**
#### **6. User Makes Bookings**
#### **7. Task Limit Enforcement**
#### **8. Transaction History Tracking**
#### **9. Admin Monitoring**

---

## 🌐 **Step 10: Test Frontend**

### **Access Frontend:**
```
http://localhost:5173
```

### **Test Frontend Features:**
- User registration/login forms
- Hotel listing with random display
- Booking interface
- Wallet dashboard
- Transaction history
- Admin panel (if built)

---

## 🔍 **Step 11: Debugging & Troubleshooting**

### **Common Issues & Solutions:**

#### **Database Connection Error:**
```bash
# Check MySQL is running
mysql -u root -p

# Check database exists
SHOW DATABASES;

# Check .env settings
```

#### **JWT Token Issues:**
```bash
# Verify token format
# Check JWT_SECRET in .env
# Token should start with "eyJ"
```

#### **Port Conflicts:**
```bash
# Check if port 5000 is free
netstat -an | grep 5000

# Kill process if needed
kill -9 PROCESS_ID
```

#### **Missing Dependencies:**
```bash
# Reinstall dependencies
cd backend
npm install

cd src
npm install
```

---

## ✅ **Step 12: Verification Checklist**

### **User Features:**
- [ ] User registration works
- [ ] User login works
- [ ] Wallet accessible
- [ ] Random hotels display
- [ ] Booking sessions work
- [ ] Bookings can be made
- [ ] Task limits enforced
- [ ] Transaction history visible

### **Admin Features:**
- [ ] Admin login works
- [ ] System overview accessible
- [ ] User management works
- [ ] Task limit setting works
- [ ] Deposit approval works
- [ ] Transaction monitoring works
- [ ] Booking monitoring works

### **System Features:**
- [ ] No error logs
- [ ] Database operations work
- [ ] API responses correct
- [ ] Frontend loads properly
- [ ] Images load (with API keys)

---

## 🎉 **Local Testing Complete!**

### **What You've Tested:**
- ✅ Complete user workflow
- ✅ Full admin panel functionality
- ✅ All new features working
- ✅ Database operations
- ✅ API endpoints
- ✅ Frontend integration

### **Ready for Production:**
- All features tested locally
- Issues identified and fixed
- System working as expected
- Ready for cPanel deployment

---

**🚀 You can now confidently deploy to production knowing everything works!**
