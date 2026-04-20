const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'hotel_reservation',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
});

async function addPlan4() {
  const client = await pool.connect();
  
  try {
    console.log('Checking for Plan 4...');
    
    // Check if Plan 4 already exists
    const checkResult = await client.query(
      "SELECT * FROM reservation_plans WHERE name = 'Plan 4'"
    );
    
    if (checkResult.rows.length > 0) {
      console.log('Plan 4 already exists:', checkResult.rows[0]);
      return;
    }
    
    // Get the highest plan to determine Plan 4 amounts
    const maxPlanResult = await client.query(
      "SELECT MAX(max_amount) as max_amount FROM reservation_plans WHERE is_active = true"
    );
    
    const currentMax = parseFloat(maxPlanResult.rows[0]?.max_amount || 500);
    const plan4Min = currentMax + 1;
    const plan4Max = currentMax + 500;
    
    // Insert Plan 4
    const insertResult = await client.query(
      `INSERT INTO reservation_plans 
       (name, min_amount, max_amount, commission_rate, daily_task_limit, description, badge, is_active, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        'Plan 4',
        plan4Min,
        plan4Max,
        0.35, // 35% commission (higher for elite plan)
        25,   // 25 tasks per day
        'Elite exclusive tier with premium benefits and highest commission rates',
        'VIP',
        true,
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400'
      ]
    );
    
    console.log('✅ Plan 4 added successfully:', insertResult.rows[0]);
    
    // Show all plans
    const allPlans = await client.query(
      "SELECT * FROM reservation_plans WHERE is_active = true ORDER BY min_amount ASC"
    );
    
    console.log('\n📋 All Active Plans:');
    allPlans.rows.forEach(plan => {
      console.log(`  ${plan.name}: $${plan.min_amount} - $${plan.max_amount} (${plan.commission_rate * 100}% commission)`);
    });
    
  } catch (error) {
    console.error('❌ Error adding Plan 4:', error);
  } finally {
    client.release();
    pool.end();
  }
}

addPlan4();
