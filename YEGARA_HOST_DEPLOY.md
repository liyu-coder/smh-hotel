# Yegara Host Deployment Guide

## Prerequisites
1. Yegara Host cPanel access
2. Domain or subdomain configured
3. GitHub repository ready: https://github.com/liyu-coder/smh-hotel

## Step 1: Prepare Your Local Environment

### Update Environment Variables
Create `backend/.env` file:
```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration (Yegara Host MySQL)
DB_HOST=localhost  # Or your specific Yegara MySQL host
DB_PORT=3306
DB_NAME=your_yegara_database_name
DB_USER=your_yegara_mysql_user
DB_PASSWORD=your_yegara_mysql_password

# JWT Configuration (Generate a secure random string)
JWT_SECRET=your_secure_random_string_here
JWT_EXPIRE=7d

# CORS Configuration (Update with your domain)
CORS_ORIGIN=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Step 2: Set Up MySQL Database at Yegara Host

1. **Log in to Yegara Host cPanel**
2. **Go to "MySQL Databases"**
3. **Create Database:**
   - Database name: `smh_hotel_prod` (or your preferred name)
   - Click "Create Database"
4. **Create MySQL User:**
   - Username: `smh_admin` (or your preferred name)
   - Password: Generate a strong password
   - Click "Create User"
5. **Add User to Database:**
   - Select the user and database
   - Give ALL PRIVILEGES
   - Click "Make Changes"

### Import Database Schema
1. Go to **phpMyAdmin** in cPanel
2. Select your database
3. Click **Import** tab
4. Choose file: `backend/schema-mysql.sql`
5. Click **Go**

## Step 3: Deploy Backend to Yegara Host

### Option A: Using Git (Recommended)

1. **In Yegara cPanel, go to "Git Version Control"**
2. **Create Repository:**
   - Repository Path: `~/backend`
   - Clone URL: `https://github.com/liyu-coder/smh-hotel.git`
   - Branch: `main`
   - Click "Create"
3. **Deploy:**
   - Click "Manage" on your repository
   - Click "Deploy HEAD Commit"

### Option B: Manual File Upload

1. **Zip your backend folder locally:**
   ```bash
   cd d:\Hotel Reservation\backend
   zip -r backend.zip . -x "node_modules/*" ".env"
   ```
2. **Upload via cPanel File Manager:**
   - Go to File Manager in cPanel
   - Navigate to public_html or your desired folder
   - Upload `backend.zip`
   - Extract the zip
3. **Install dependencies:**
   - In cPanel, go to "Terminal" or use SSH
   ```bash
   cd ~/backend
   npm install --production
   ```

## Step 4: Configure Node.js App in cPanel

1. **Go to "Setup Node.js App" in cPanel**
2. **Create Application:**
   - Node.js version: 18.x or 20.x
   - Application mode: Production
   - Application root: `backend`
   - Application URL: your domain or subdomain
   - Application startup file: `server.js`
3. **Environment Variables:**
   - Add all variables from your `.env` file
   - PORT will be automatically set by cPanel
4. **Click "Create"**

## Step 5: Start the Application

1. **In "Setup Node.js App", click "Restart"**
2. **Check logs for any errors**
3. **Test API endpoints:**
   ```bash
   curl https://yourdomain.com/api/health
   ```

## Step 6: Deploy Frontend

### Build Frontend Locally
```bash
cd d:\Hotel Reservation
npm run build
```

### Upload to Yegara Host
1. **Upload `dist` folder contents:**
   - Via cPanel File Manager
   - Or use FTP client
   - Upload to `public_html` or subdomain folder

### Configure Frontend
Update API base URL in `src/app/lib/api.ts`:
```typescript
const API_BASE_URL = 'https://yourdomain.com/api';
```

## Step 7: SSL Certificate (HTTPS)

1. **In cPanel, go to "SSL/TLS"**
2. **Click "Manage SSL Sites"**
3. **Install free Let's Encrypt certificate**
4. **AutoSSL** will automatically renew

## Common Issues & Solutions

### Issue: "Cannot connect to database"
**Solution:**
- Check DB_HOST (use 'localhost' or specific server from Yegara)
- Verify database name, username, password
- Ensure user has ALL PRIVILEGES on database

### Issue: "Port already in use"
**Solution:**
- Use the PORT provided by cPanel Node.js setup
- Don't hardcode PORT 5000 in production

### Issue: "CORS error"
**Solution:**
- Update CORS_ORIGIN in .env to match your frontend domain
- Include `https://` in the domain

### Issue: "Module not found"
**Solution:**
- Run `npm install` again
- Check that `node_modules` is not in .gitignore for deployment

### Issue: JWT errors
**Solution:**
- Generate a secure random JWT_SECRET
- Minimum 32 characters recommended

## Post-Deployment Checklist

- [ ] Backend API responding at `https://yourdomain.com/api`
- [ ] Frontend loading correctly
- [ ] Database connected and tables created
- [ ] Admin user created and can log in
- [ ] Registration working
- [ ] Deposits and withdrawals functional
- [ ] SSL certificate active (HTTPS)

## Support

- Yegara Host Support: support@yegara.com
- Check logs in cPanel "Error Logs" section
- Node.js logs in "Setup Node.js App"
