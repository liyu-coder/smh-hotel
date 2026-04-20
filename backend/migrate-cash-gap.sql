-- Cash Gap & Task System Migration
-- Run this in PostgreSQL to add missing tables

-- 1. User Tasks Table (Track completed tasks per deposit)
CREATE TABLE IF NOT EXISTS user_tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    deposit_id INTEGER REFERENCES transactions(id) ON DELETE CASCADE,
    task_number INTEGER NOT NULL,
    commission_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, deposit_id, task_number)
);

-- 2. Reservation Plans Table
CREATE TABLE IF NOT EXISTS reservation_plans (
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

-- 3. Add missing columns to user_wallets if not exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_wallets' AND column_name='total_approved') THEN
        ALTER TABLE user_wallets ADD COLUMN total_approved DECIMAL(12, 2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_wallets' AND column_name='total_withdrawn') THEN
        ALTER TABLE user_wallets ADD COLUMN total_withdrawn DECIMAL(12, 2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_wallets' AND column_name='pending_amount') THEN
        ALTER TABLE user_wallets ADD COLUMN pending_amount DECIMAL(12, 2) DEFAULT 0;
    END IF;
END $$;

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS idx_user_tasks_user_id ON user_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tasks_deposit_id ON user_tasks(deposit_id);
CREATE INDEX IF NOT EXISTS idx_user_tasks_status ON user_tasks(status);
CREATE INDEX IF NOT EXISTS idx_reservation_plans_is_active ON reservation_plans(is_active);

-- 5. Create trigger for user_tasks updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_tasks_updated_at ON user_tasks;
CREATE TRIGGER update_user_tasks_updated_at 
    BEFORE UPDATE ON user_tasks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Insert default reservation plans
INSERT INTO reservation_plans (name, min_amount, max_amount, commission_rate, daily_task_limit, description, image_url, badge) 
VALUES
('Plan 1', 15, 999, 0.04, 25, 'Entry level plan for beginners', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400', 'HOT'),
('Plan 2', 1000, 5000, 0.045, 25, 'Intermediate plan with higher rewards', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 'HOT'),
('Plan 3', 5000, 10000, 0.05, 25, 'Premium plan for maximum earnings', 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400', 'VIP')
ON CONFLICT DO NOTHING;

-- Verify tables were created
SELECT 'user_tasks table created' AS status WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_tasks');
SELECT 'reservation_plans table created' AS status WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reservation_plans');
