# Hotel Reservation System - cPanel Deployment Guide

## 📋 Prerequisites

### 1. Hosting Requirements
- **cPanel Hosting Account** with Node.js support
- **Domain Name** (e.g., yourdomain.com)
- **MySQL Database** (MySQL 5.7 or higher)
- **Node.js Version**: 16.x or higher
- **NPM**: 8.x or higher
- **SSL Certificate** (recommended for production)

### 2. Required Software/Services
- Node.js runtime
- MySQL database server
- PM2 (Process Manager for Node.js)
- Nginx or Apache web server

---

## 🔐 Environment Variables (.env)

Create a `.env` file in both `backend/` and root directories:

### Backend .env (backend/.env)
```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_database_username
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
DB_PORT=3306

# JWT Secret
JWT_SECRET=your_random_jwt_secret_key_at_least_32_characters_long

# Server Configuration
PORT=5000
NODE_ENV=production

# CORS Configuration
FRONTEND_URL=https://yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend .env (root/.env)
```env
VITE_API_URL=https://yourdomain.com/api
VITE_APP_NAME=Hotel Reservation System
```

---

## 🗄️ Database Configuration

### 1. Create MySQL Database via cPanel
1. Log in to cPanel
2. Go to **MySQL® Database Wizard**
3. Create a new database:
   - **Database Name**: `hotelreservation_db` (or your preferred name)
4. Create a new database user:
   - **Username**: `hoteluser` (or your preferred name)
   - **Password**: Generate a strong password (save this!)
5. Add user to database with **ALL PRIVILEGES**

### 2. Database Schema
Run the following SQL commands in phpMyAdmin or via cPanel SQL terminal:

```sql
-- Create tables
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_wallets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  available_balance DECIMAL(10, 2) DEFAULT 0.00,
  total_deposited DECIMAL(10, 2) DEFAULT 0.00,
  total_approved DECIMAL(10, 2) DEFAULT 0.00,
  frozen_balance DECIMAL(10, 2) DEFAULT 0.00,
  max_daily_orders INT DEFAULT 25,
  total_completed_tasks INT DEFAULT 0,
  commission_today DECIMAL(10, 2) DEFAULT 0.00,
  commission_yesterday DECIMAL(10, 2) DEFAULT 0.00,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USDT',
  method VARCHAR(50) NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  type ENUM('deposit', 'withdrawal') DEFAULT 'deposit',
  fee DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE hotels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  price_per_night DECIMAL(10, 2) NOT NULL,
  rating DECIMAL(2, 1) DEFAULT 0.0,
  level INT DEFAULT 1,
  amenities JSON,
  image_url TEXT,
  currency VARCHAR(10) DEFAULT 'USDT',
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  hotel_id INT NOT NULL,
  status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
  commission DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (hotel_id) REFERENCES hotels(id)
);

CREATE TABLE user_tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  task_number INT NOT NULL,
  plan_level INT DEFAULT 1,
  hotel_id INT,
  hotel_name VARCHAR(255),
  hotel_price DECIMAL(10, 2),
  commission_amount DECIMAL(10, 2),
  status ENUM('pending', 'completed') DEFAULT 'pending',
  deposit_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE reservation_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  min_amount DECIMAL(10, 2) NOT NULL,
  max_amount DECIMAL(10, 2) NOT NULL,
  commission_rate DECIMAL(3, 2) NOT NULL,
  daily_task_limit INT DEFAULT 25,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

-- Insert default reservation plans
INSERT INTO reservation_plans (name, min_amount, max_amount, commission_rate, daily_task_limit, description, image_url, is_active) VALUES
('Plan 1 - Starter', 20, 999, 0.04, 25, 'Perfect for beginners', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400', TRUE),
('Plan 2 - Popular', 1000, 5000, 0.06, 25, 'Best value for regular users', 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400', TRUE),
('Plan 3 - Premium', 5000, 10000, 0.08, 25, 'For power users', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400', TRUE),
('Plan 4 - Elite', 10000, 50000, 0.10, 25, 'Maximum earning potential', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400', TRUE);
```

---

## 📁 File Structure for Production

```
/public_html/
├── backend/              # Backend API
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   ├── routes/
│   ├── server.js
│   ├── package.json
│   └── .env
├── dist/                # Built frontend (Vite build output)
├── .htaccess            # Apache configuration
└── index.html           # Frontend entry point
```

---

## 🚀 Deployment Steps

### Step 1: Upload Files to cPanel

1. **Compress your project files** (exclude node_modules)
2. **Upload to cPanel File Manager**:
   - Go to `public_html` directory
   - Upload and extract the zip file
3. **File permissions**:
   ```bash
   # Set proper permissions
   chmod 755 backend/
   chmod 644 backend/*.js
   chmod 600 backend/.env
   ```

### Step 2: Install Dependencies

**Via cPanel Terminal:**
```bash
cd public_html
npm install
cd backend
npm install
```

**Or via SSH:**
```bash
ssh username@yourdomain.com
cd public_html
npm install --production
cd backend
npm install --production
```

### Step 3: Build Frontend

```bash
cd public_html
npm run build
```

This will create a `dist/` folder with optimized production files.

### Step 4: Configure Backend

1. **Update backend/.env** with your production database credentials
2. **Update backend/config/database.js** if needed for production MySQL connection

### Step 5: Start Backend with PM2

**Install PM2 globally:**
```bash
npm install -g pm2
```

**Start the backend server:**
```bash
cd public_html/backend
pm2 start server.js --name "hotel-api"
pm2 save
pm2 startup
```

**Useful PM2 commands:**
```bash
pm2 list              # List all processes
pm2 logs hotel-api     # View logs
pm2 restart hotel-api  # Restart server
pm2 stop hotel-api     # Stop server
pm2 delete hotel-api   # Remove from PM2
```

### Step 6: Configure Web Server

#### Option A: Apache (.htaccess)

Create/update `.htaccess` in `public_html/`:
```apache
# Frontend routing
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Proxy backend API to Node.js
ProxyPreserveHost On
ProxyPass /api http://localhost:5000/api
ProxyPassReverse /api http://localhost:5000/api
```

#### Option B: Nginx

If using Nginx, update your server block:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /home/username/public_html;
    index index.html;

    # Frontend
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Step 7: SSL Certificate (Recommended)

1. Go to cPanel > **SSL/TLS Status**
2. Enable **AutoSSL** for your domain
3. Or use **Let's Encrypt** via cPanel

### Step 8: Test Deployment

1. **Frontend**: Visit `https://yourdomain.com`
2. **Backend API**: Visit `https://yourdomain.com/api/health` (should return health status)
3. **Database**: Verify database connection via backend logs

---

## 🔧 Production Configuration Checklist

- [ ] Database created and credentials saved
- [ ] .env files configured with production values
- [ ] JWT_SECRET set to a strong random string
- [ ] CORS configured with production domain
- [ ] Frontend built (`npm run build`)
- [ ] Backend dependencies installed (`npm install --production`)
- [ ] PM2 installed and backend started
- [ ] Web server configured (Apache/Nginx)
- [ ] SSL certificate installed
- [ ] API endpoints tested
- [ ] Database migrations run
- [ ] Error logging configured
- [ ] Monitoring set up (optional)

---

## 📊 Important URLs & Credentials

### Save These Securely:

```
Database Name: hotelreservation_db
Database User: hoteluser
Database Password: [YOUR_PASSWORD]
Database Host: localhost

Backend URL: https://yourdomain.com/api
Frontend URL: https://yourdomain.com

JWT Secret: [YOUR_JWT_SECRET]
```

### API Endpoints:
```
Health Check: GET /api/health
User Login: POST /api/auth/login
User Register: POST /api/auth/register
Get Hotels: GET /api/reservation/hotels
Get Plans: GET /api/reservation/plans
Dashboard: GET /api/reservation/dashboard (requires auth)
Wallet Summary: GET /api/wallet/summary (requires auth)
```

---

## 🔒 Security Recommendations

1. **Change default passwords** before deployment
2. **Enable HTTPS** with SSL certificate
3. **Set strong JWT_SECRET** (minimum 32 characters)
4. **Restrict database access** to localhost only
5. **Enable rate limiting** on API endpoints
6. **Regularly update dependencies** (`npm audit fix`)
7. **Set up backups** for database and files
8. **Monitor logs** for suspicious activity
9. **Use environment variables** for all sensitive data
10. **Disable DEBUG mode** in production

---

## 🐛 Troubleshooting

### Backend won't start:
```bash
# Check PM2 logs
pm2 logs hotel-api

# Check if port 5000 is in use
netstat -an | grep 5000
```

### Database connection error:
- Verify database credentials in .env
- Check if MySQL service is running
- Ensure database user has proper privileges

### Frontend 404 errors:
- Ensure Vite build completed successfully
- Check .htaccess or Nginx configuration
- Verify dist/ folder exists and contains files

### CORS errors:
- Update FRONTEND_URL in backend/.env
- Check ALLOWED_ORIGINS includes your domain
- Restart backend after changes

---

## 📞 Support & Monitoring

### Recommended Tools:
- **PM2** for process management
- **Uptime Robot** for uptime monitoring
- **Sentry** for error tracking
- **New Relic** for performance monitoring

---

## ✅ Final Deployment Checklist

Before going live:
- [ ] All environment variables set
- [ ] Database populated with seed data
- [ ] SSL certificate active
- [ ] Frontend accessible at domain
- [ ] Backend API responding
- [ ] User registration/login working
- [ ] Payment/deposit flow tested
- [ ] Admin functionality tested
- [ ] Error handling tested
- [ ] Mobile responsiveness verified
- [ ] Performance optimized
- [ ] Backup strategy in place

---

**Deployment Date**: ___________
**Deployed By**: ___________
**Notes**: ___________
