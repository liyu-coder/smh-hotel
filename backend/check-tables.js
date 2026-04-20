require('dotenv').config();
const { query } = require('./config/database');

async function checkTables() {
  try {
    // Check if user_tasks table exists
    const result = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_tasks'
      );
    `);
    console.log('user_tasks table exists:', result.rows[0].exists);
    
    // Check if reservation_plans table exists
    const result2 = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'reservation_plans'
      );
    `);
    console.log('reservation_plans table exists:', result2.rows[0].exists);
    
    // List all tables
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.log('\nAll tables:');
    tables.rows.forEach(row => console.log(' -', row.table_name));
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkTables();
