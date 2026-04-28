-- SMH Hotel Reservation System - MySQL Database Schema
-- Compatible with Yegara Host MySQL

-- Set charset
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS user_tasks;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS hotel_images;
DROP TABLE IF EXISTS hotels;
DROP TABLE IF EXISTS countries;
DROP TABLE IF EXISTS team_members;
DROP TABLE IF EXISTS support_tickets;
DROP TABLE IF EXISTS user_wallets;
DROP TABLE IF EXISTS reservation_plans;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User Wallets Table
CREATE TABLE user_wallets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    available_balance DECIMAL(15, 2) DEFAULT 0.00,
    total_deposited DECIMAL(15, 2) DEFAULT 0.00,
    total_withdrawn DECIMAL(15, 2) DEFAULT 0.00,
    today_orders INT DEFAULT 0,
    max_daily_orders INT DEFAULT 25,
    completed_tasks INT DEFAULT 0,
    tasks_completed BOOLEAN DEFAULT FALSE,
    pending_amount DECIMAL(15, 2) DEFAULT 0.00,
    total_approved DECIMAL(15, 2) DEFAULT 0.00,
    is_locked BOOLEAN DEFAULT FALSE,
    lock_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_id (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reservation Plans Table
CREATE TABLE reservation_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    min_amount DECIMAL(15, 2) NOT NULL,
    max_amount DECIMAL(15, 2) NOT NULL,
    commission_rate DECIMAL(5, 4) NOT NULL,
    daily_task_limit INT DEFAULT 25,
    badge VARCHAR(50) DEFAULT 'Standard',
    image_url VARCHAR(500),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User Tasks Table
CREATE TABLE user_tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    deposit_id INT,
    task_number INT NOT NULL,
    commission_amount DECIMAL(15, 2) NOT NULL,
    status ENUM('pending', 'completed', 'expired') DEFAULT 'pending',
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Hotels Table
CREATE TABLE hotels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    price_per_night DECIMAL(10, 2) NOT NULL,
    rating DECIMAL(2, 1) DEFAULT 4.0,
    location VARCHAR(255),
    amenities JSON,
    image_url VARCHAR(500),
    level INT DEFAULT 1,
    currency VARCHAR(10) DEFAULT 'USDT',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Hotel Images Table
CREATE TABLE hotel_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    caption VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bookings Table
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    hotel_id INT NOT NULL,
    booking_reference VARCHAR(20) UNIQUE,
    check_in_date DATE,
    check_out_date DATE,
    guests INT DEFAULT 1,
    total_amount DECIMAL(15, 2) NOT NULL,
    commission_amount DECIMAL(15, 2) DEFAULT 0,
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    special_requests TEXT,
    linked_booking_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    FOREIGN KEY (linked_booking_id) REFERENCES bookings(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Transactions Table (Deposits & Withdrawals)
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('deposit', 'withdrawal') NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    method VARCHAR(50),
    status ENUM('pending', 'approved', 'completed', 'rejected') DEFAULT 'pending',
    description TEXT,
    admin_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Support Tickets Table
CREATE TABLE support_tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Team Members Table
CREATE TABLE team_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    parent_id INT,
    level INT DEFAULT 1,
    commission_rate DECIMAL(5, 2) DEFAULT 0.00,
    total_earnings DECIMAL(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Countries Table (for phone codes)
CREATE TABLE countries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL,
    phone_code VARCHAR(10) NOT NULL,
    flag VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default reservation plans
INSERT INTO reservation_plans (name, min_amount, max_amount, commission_rate, daily_task_limit, badge, description) VALUES
('Plan 1', 50.00, 500.00, 0.0400, 25, 'Standard', 'Basic plan with 4% commission rate'),
('Plan 2', 501.00, 1000.00, 0.0500, 25, 'Silver', 'Silver plan with 5% commission rate'),
('Plan 3', 1001.00, 2000.00, 0.1000, 25, 'Gold', 'Gold plan with 10% commission rate'),
('Plan 4', 2001.00, 5000.00, 0.3500, 25, 'VIP', 'VIP plan with 35% commission rate');

-- Insert sample countries
INSERT INTO countries (name, code, phone_code, flag) VALUES
('Ethiopia', 'ET', '+251', '🇪🇹'),
('United States', 'US', '+1', '🇺🇸'),
('United Kingdom', 'GB', '+44', '🇬🇧'),
('Nigeria', 'NG', '+234', '🇳🇬'),
('Kenya', 'KE', '+254', '🇰🇪'),
('South Africa', 'ZA', '+27', '🇿🇦'),
('Ghana', 'GH', '+233', '🇬🇭'),
('Tanzania', 'TZ', '+255', '🇹🇿');

-- Insert sample hotels
INSERT INTO hotels (name, description, city, country, price_per_night, rating, level, amenities, image_url, currency) VALUES
('Hilton Addis Ababa', 'Luxury hotel in the heart of Addis Ababa', 'Addis Ababa', 'Ethiopia', 120.00, 4.5, 1, '["WiFi", "Pool", "Gym", "Restaurant"]', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400', 'USDT'),
('Sheraton Addis', '5-star luxury hotel with premium amenities', 'Addis Ababa', 'Ethiopia', 200.00, 4.8, 2, '["WiFi", "Pool", "Spa", "Gym", "Restaurant", "Bar"]', 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400', 'USDT'),
('Marriott Executive', 'Business hotel with conference facilities', 'Addis Ababa', 'Ethiopia', 150.00, 4.3, 2, '["WiFi", "Gym", "Restaurant", "Conference"]', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400', 'USDT'),
('Radisson Blu', 'International standard hotel', 'Addis Ababa', 'Ethiopia', 180.00, 4.6, 3, '["WiFi", "Pool", "Spa", "Gym", "Restaurant"]', 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400', 'USDT'),
('Golden Tulip', 'Modern hotel with excellent service', 'Addis Ababa', 'Ethiopia', 90.00, 4.0, 1, '["WiFi", "Pool", "Restaurant"]', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400', 'USDT');
