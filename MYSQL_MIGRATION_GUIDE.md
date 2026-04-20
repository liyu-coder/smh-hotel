# PostgreSQL to MySQL Migration Guide

## Overview
This guide helps you migrate from PostgreSQL to MySQL for hosting at Yegara Host.

## Changes Made

### 1. Updated Dependencies
- Replaced `pg` with `mysql2` in `backend/package.json`
- Auto-converts PostgreSQL `$1, $2` parameters to MySQL `?` placeholders
- Handles `RETURNING *` syntax by fetching last inserted ID
- Removes PostgreSQL casting (`::numeric`, `::integer`)

### 2. Database Configuration (`backend/config/database.js`)
- Uses `mysql2/promise` for async/await support
- Converts PostgreSQL syntax to MySQL automatically
- Maintains same query interface for minimal code changes

## Steps to Complete Migration

### Step 1: Install MySQL Package
```bash
cd backend
npm install
```

### Step 2: Update Environment Variables
Edit `backend/.env`:

**OLD (PostgreSQL):**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smh_hotel_reservation
DB_USER=postgres
DB_PASSWORD=your_password
```

**NEW (MySQL):**
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=smh_hotel_reservation
DB_USER=root
DB_PASSWORD=your_mysql_password
```

For Yegara Host, use the credentials they provide:
```env
DB_HOST=your_yegara_mysql_host
DB_PORT=3306
DB_NAME=your_yegara_database_name
DB_USER=your_yegara_username
DB_PASSWORD=your_yegara_password
```

### Step 3: Create MySQL Database Schema
Run this SQL in your MySQL database to create tables:

```sql
-- Users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role ENUM('user', 'admin', 'super_admin') DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User wallets
CREATE TABLE user_wallets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  available_balance DECIMAL(15,2) DEFAULT 0,
  total_approved DECIMAL(15,2) DEFAULT 0,
  today_orders INT DEFAULT 0,
  max_daily_orders INT DEFAULT 25,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Reservation plans
CREATE TABLE reservation_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  min_amount DECIMAL(15,2) NOT NULL,
  max_amount DECIMAL(15,2) NOT NULL,
  commission_rate DECIMAL(5,4) NOT NULL,
  daily_task_limit INT DEFAULT 25,
  badge VARCHAR(50) DEFAULT 'Standard',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User tasks
CREATE TABLE user_tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  deposit_id INT,
  task_number INT NOT NULL,
  commission_amount DECIMAL(15,2) NOT NULL,
  status ENUM('pending', 'completed', 'expired') DEFAULT 'pending',
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Transactions (deposits/withdrawals)
CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('deposit', 'withdrawal') NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  method VARCHAR(50),
  status ENUM('pending', 'approved', 'completed', 'rejected') DEFAULT 'pending',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Hotels
CREATE TABLE hotels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  price_per_night DECIMAL(10,2) NOT NULL,
  rating DECIMAL(2,1) DEFAULT 4.0,
  amenities JSON,
  image_url VARCHAR(500),
  level INT DEFAULT 1,
  currency VARCHAR(10) DEFAULT 'USDT',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings/Reservations
CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  hotel_id INT NOT NULL,
  check_in DATE,
  check_out DATE,
  guests INT DEFAULT 1,
  total_amount DECIMAL(15,2) NOT NULL,
  status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
);

-- Support tickets
CREATE TABLE support_tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default plans
INSERT INTO reservation_plans (name, min_amount, max_amount, commission_rate, daily_task_limit, badge) VALUES
('Plan 1', 50, 500, 0.0400, 25, 'Standard'),
('Plan 2', 501, 1000, 0.0500, 25, 'Silver'),
('Plan 3', 1001, 2000, 0.1000, 25, 'Gold'),
('Plan 4', 2001, 5000, 0.3500, 25, 'VIP');
```

### Step 4: Test the Connection
```bash
cd backend
node -e "const db = require('./config/database'); db.query('SELECT 1+1 as test').then(r => console.log('Connected!', r.rows[0])).catch(e => console.error(e))"
```

### Step 5: Start the Server
```bash
npm run dev
```

## Known Differences & Limitations

1. **Auto-increment**: MySQL uses `AUTO_INCREMENT`, PostgreSQL uses `SERIAL` - both work with current setup
2. **JSON fields**: `amenities JSON` works in both (MySQL 5.7+ and PostgreSQL)
3. **Timestamps**: Both support `CURRENT_TIMESTAMP` and `NOW()`
4. **Foreign keys**: Syntax is compatible
5. **Transactions**: BEGIN/COMMIT/ROLLBACK work the same

## Troubleshooting

### Error: "Cannot find module 'mysql2'"
Run: `npm install` in the backend folder

### Error: "Access denied for user"
Check your DB_USER and DB_PASSWORD in .env file match your MySQL credentials

### Error: "Unknown database"
Create the database first:
```sql
CREATE DATABASE smh_hotel_reservation CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Error: "Table doesn't exist"
Run the schema SQL above to create all tables

## Yegara Host Specific

1. Log in to your Yegara Host cPanel
2. Go to "MySQL Databases" and create a database
3. Create a MySQL user and add to database with all privileges
4. Use the provided hostname (usually `localhost` or a specific server)
5. Update your `.env` file with Yegara credentials
6. Import the SQL schema above using phpMyAdmin

## Push to GitHub After Changes

```bash
git add -A
git commit -m "feat: migrate from PostgreSQL to MySQL for Yegara Host"
git push origin main
```
