-- SMH Hotel Reservation System Database Schema
-- PostgreSQL Database Schema

-- Drop existing tables if they exist (for development)
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS hotel_images CASCADE;
DROP TABLE IF EXISTS hotels CASCADE;
DROP TABLE IF EXISTS countries CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS user_wallets CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'user', -- 'user', 'admin', 'super_admin'
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    verification_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Wallets Table
CREATE TABLE user_wallets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    available_balance DECIMAL(10, 2) DEFAULT 0.00,
    total_deposited DECIMAL(10, 2) DEFAULT 0.00,
    total_withdrawn DECIMAL(10, 2) DEFAULT 0.00,
    today_orders INTEGER DEFAULT 0,
    max_daily_orders INTEGER DEFAULT 25,
    tasks_completed BOOLEAN DEFAULT false,
    pending_amount DECIMAL(10, 2) DEFAULT 0.00,
    total_approved DECIMAL(10, 2) DEFAULT 0.00,
    is_locked BOOLEAN DEFAULT false,
    lock_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Transactions Table (Deposits and Withdrawals)
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
    method VARCHAR(100) NOT NULL, -- 'Visa', 'Mastercard', 'Trust Wallet', etc.
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    fee DECIMAL(10, 2) DEFAULT 0.00,
    address TEXT, -- For crypto withdrawals
    network VARCHAR(50), -- For crypto (e.g., 'Tron (TRC20)')
    transaction_hash TEXT, -- Blockchain transaction hash
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Countries Table
CREATE TABLE countries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    image_url TEXT,
    hotel_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hotels Table
CREATE TABLE hotels (
    id SERIAL PRIMARY KEY,
    country_id INTEGER REFERENCES countries(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    rating DECIMAL(3, 2) DEFAULT 0.00,
    price_per_night DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    commission_rate DECIMAL(5, 4) DEFAULT 0.26, -- 26% commission
    amenities TEXT[], -- Array of amenities like ['WiFi', 'Pool', 'Spa']
    image_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    views_count INTEGER DEFAULT 0,
    bookings_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hotel Images Table
CREATE TABLE hotel_images (
    id SERIAL PRIMARY KEY,
    hotel_id INTEGER REFERENCES hotels(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings Table (Reservations)
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    hotel_id INTEGER REFERENCES hotels(id) ON DELETE CASCADE,
    booking_reference VARCHAR(50) UNIQUE NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    guests INTEGER DEFAULT 1,
    total_amount DECIMAL(10, 2) NOT NULL,
    commission_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    special_requests TEXT,
    linked_booking_id INTEGER REFERENCES bookings(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team Members Table
CREATE TABLE team_members (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    referral_code VARCHAR(50) UNIQUE NOT NULL,
    referred_by INTEGER REFERENCES team_members(id) ON DELETE SET NULL,
    level INTEGER DEFAULT 1,
    total_earnings DECIMAL(10, 2) DEFAULT 0.00,
    total_referrals INTEGER DEFAULT 0,
    active_referrals INTEGER DEFAULT 0,
    commission_rate DECIMAL(5, 4) DEFAULT 0.05, -- 5% commission
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Support Tickets Table
CREATE TABLE support_tickets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general', -- 'general', 'booking', 'payment', 'technical'
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    admin_response TEXT,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_user_wallets_user_id ON user_wallets(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_hotel_id ON bookings(hotel_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_check_in_date ON bookings(check_in_date);
CREATE INDEX idx_hotels_country_id ON hotels(country_id);
CREATE INDEX idx_hotels_is_featured ON hotels(is_featured);
CREATE INDEX idx_team_members_referral_code ON team_members(referral_code);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);

-- Create trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_wallets_updated_at BEFORE UPDATE ON user_wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hotels_updated_at BEFORE UPDATE ON hotels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for countries
INSERT INTO countries (name, image_url) VALUES
('Philippines', 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?q=80&w=1200&auto=format&fit=crop'),
('Singapore', 'https://images.unsplash.com/photo-1525625293386-3fb0ad7c1fe6?q=80&w=1200&auto=format&fit=crop'),
('India', 'https://images.unsplash.com/photo-1524492707947-503c5be14495?q=80&w=1200&auto=format&fit=crop'),
('Vietnam', 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1200&auto=format&fit=crop'),
('Uzbekistan', 'https://images.unsplash.com/photo-1528154291023-a6525fabe5b4?q=80&w=1200&auto=format&fit=crop'),
('Kazakhstan', 'https://images.unsplash.com/photo-1558588942-930faae5a389?q=80&w=1200&auto=format&fit=crop'),
('Azerbaijan', 'https://images.unsplash.com/photo-1539667547529-84c607280d20?q=80&w=1200&auto=format&fit=crop'),
('Japan', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop'),
('China', 'https://images.unsplash.com/photo-1508197149814-0cc02e8b7f74?q=80&w=1200&auto=format&fit=crop'),
('Qatar', 'https://images.unsplash.com/photo-1559586653-997635607b3b?q=80&w=1200&auto=format&fit=crop'),
('Saudi Arabia', 'https://images.unsplash.com/photo-1586724230411-471243ecd16d?q=80&w=1200&auto=format&fit=crop'),
('United Arab Emirates', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200&auto=format&fit=crop'),
('Yemen', 'https://images.unsplash.com/photo-1621509176371-558832a82069?q=80&w=1200&auto=format&fit=crop'),
('Poland', 'https://images.unsplash.com/photo-1519197924294-4ba991a11128?q=80&w=1200&auto=format&fit=crop'),
('Greece', 'https://images.unsplash.com/photo-1503152394-c571994fd383?q=80&w=1200&auto=format&fit=crop'),
('France', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1200&auto=format&fit=crop'),
('Spain', 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?q=80&w=1200&auto=format&fit=crop'),
('Germany', 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=1200&auto=format&fit=crop'),
('Italy', 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=1200&auto=format&fit=crop'),
('Canada', 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?q=80&w=1200&auto=format&fit=crop'),
('Brazil', 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=1200&auto=format&fit=crop'),
('Venezuela', 'https://images.unsplash.com/photo-1533230832481-999a37731994?q=80&w=1200&auto=format&fit=crop'),
('Somalia', 'https://images.unsplash.com/photo-1582234372722-50d7ccc30ebd?q=80&w=1200&auto=format&fit=crop');

-- Reservation Plans Table (Plan 1, 2, 3)
CREATE TABLE reservation_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    min_amount DECIMAL(10, 2) NOT NULL,
    max_amount DECIMAL(10, 2) NOT NULL,
    commission_rate DECIMAL(5, 4) NOT NULL,
    daily_task_limit INTEGER DEFAULT 25,
    description TEXT,
    image_url TEXT,
    badge VARCHAR(20) DEFAULT 'HOT',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Tasks Table (Track completed tasks per deposit)
CREATE TABLE user_tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    deposit_id INTEGER REFERENCES transactions(id) ON DELETE CASCADE,
    task_number INTEGER NOT NULL,
    commission_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, deposit_id, task_number)
);

-- Create indexes for new tables
CREATE INDEX idx_user_tasks_user_id ON user_tasks(user_id);
CREATE INDEX idx_user_tasks_deposit_id ON user_tasks(deposit_id);
CREATE INDEX idx_user_tasks_status ON user_tasks(status);
CREATE INDEX idx_reservation_plans_is_active ON reservation_plans(is_active);

-- Create trigger for user_tasks
CREATE TRIGGER update_user_tasks_updated_at BEFORE UPDATE ON user_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert Reservation Plans
INSERT INTO reservation_plans (name, min_amount, max_amount, commission_rate, daily_task_limit, description, image_url, badge) VALUES
('Plan 1', 15, 999, 0.04, 25, 'Entry level plan for beginners', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400', 'HOT'),
('Plan 2', 1000, 5000, 0.045, 25, 'Intermediate plan with higher rewards', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 'HOT'),
('Plan 3', 5000, 10000, 0.05, 25, 'Premium plan for maximum earnings', 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400', 'VIP');
