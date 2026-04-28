const { query } = require('./config/database');

async function checkPlans() {
  try {
    console.log('🔍 Checking reservation_plans table...\n');
    
    // Check if table exists
    const tableCheck = await query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'reservation_plans'
    `);
    
    if (tableCheck.rows[0].count === 0) {
      console.log('❌ reservation_plans table does not exist');
      return;
    }
    
    // Get all plans from database
    const plansResult = await query(`
      SELECT * FROM reservation_plans 
      WHERE is_active = true 
      ORDER BY min_amount ASC
    `);
    
    console.log(`✅ Found ${plansResult.rows.length} active plans:\n`);
    
    plansResult.rows.forEach((plan, index) => {
      console.log(`Plan ${index + 1}:`);
      console.log(`  ID: ${plan.id}`);
      console.log(`  Name: ${plan.name}`);
      console.log(`  Min Amount: $${plan.min_amount} USDT`);
      console.log(`  Max Amount: $${plan.max_amount} USDT`);
      console.log(`  Commission Rate: ${plan.commission_rate}%`);
      console.log(`  Daily Task Limit: ${plan.daily_task_limit}`);
      console.log(`  Badge: ${plan.badge || 'N/A'}`);
      console.log(`  Description: ${plan.description || 'N/A'}`);
      console.log(`  Is Active: ${plan.is_active}`);
      console.log('');
    });
    
    if (plansResult.rows.length === 0) {
      console.log('⚠️ No active plans found in database');
      console.log('Frontend is showing fallback/default plans');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkPlans();
