require('dotenv').config();
const { query } = require('./config/database');

const migrationSQL = `
-- Create user_tasks table
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

-- Create reservation_plans table
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

-- Add columns to user_wallets
ALTER TABLE user_wallets ADD COLUMN IF NOT EXISTS total_approved DECIMAL(12, 2) DEFAULT 0;
ALTER TABLE user_wallets ADD COLUMN IF NOT EXISTS total_withdrawn DECIMAL(12, 2) DEFAULT 0;
ALTER TABLE user_wallets ADD COLUMN IF NOT EXISTS pending_amount DECIMAL(12, 2) DEFAULT 0;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_tasks_user_id ON user_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tasks_deposit_id ON user_tasks(deposit_id);
CREATE INDEX IF NOT EXISTS idx_user_tasks_status ON user_tasks(status);
CREATE INDEX IF NOT EXISTS idx_reservation_plans_is_active ON reservation_plans(is_active);

-- Insert plans
INSERT INTO reservation_plans (name, min_amount, max_amount, commission_rate, daily_task_limit, description, image_url, badge) 
VALUES
('Plan 1', 15, 999, 0.04, 25, 'Entry level plan for beginners', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400', 'HOT'),
('Plan 2', 1000, 5000, 0.045, 25, 'Intermediate plan with higher rewards', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 'HOT'),
('Plan 3', 5000, 10000, 0.05, 25, 'Premium plan for maximum earnings', 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400', 'VIP')
ON CONFLICT DO NOTHING;
`;

async function runMigration() {
  console.log('Running migration...\n');
  const statements = migrationSQL.split(';').filter(s => s.trim());
  
  for (const stmt of statements) {
    if (!stmt.trim()) continue;
    try {
      await query(stmt + ';');
      console.log('✓', stmt.substring(0, 50).replace(/\n/g, ' ') + '...');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('✓ Already exists:', stmt.substring(0, 40) + '...');
      } else {
        console.error('✗', err.message);
      }
    }
  }
  
  console.log('\n✅ Migration complete!');
  console.log('Tables created: user_tasks, reservation_plans');
  process.exit(0);
}

runMigration().catch(err => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
