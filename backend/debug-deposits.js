require('dotenv').config();
const { query } = require('./config/database');

async function debugDeposits() {
  try {
    console.log('=== Deposit Debug ===\n');
    
    // Check all deposits
    const allDeposits = await query(`
      SELECT t.id, t.user_id, t.type, t.amount, t.status, t.method, t.created_at, u.email, u.name
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      WHERE t.type = 'deposit'
      ORDER BY t.created_at DESC
      LIMIT 10
    `);
    
    console.log(`Found ${allDeposits.rows.length} deposits:\n`);
    allDeposits.rows.forEach(d => {
      console.log(`  ID: ${d.id} | User: ${d.name || d.email} | Amount: $${d.amount} | Status: ${d.status} | Method: ${d.method} | Date: ${d.created_at}`);
    });
    
    if (allDeposits.rows.length === 0) {
      console.log('\n⚠️  No deposits found!');
      console.log('\nChecking all transactions...');
      
      const allTrans = await query(`
        SELECT id, type, amount, status, created_at 
        FROM transactions 
        ORDER BY created_at DESC 
        LIMIT 10
      `);
      
      console.log(`\nTotal transactions: ${allTrans.rows.length}`);
      allTrans.rows.forEach(t => {
        console.log(`  ID: ${t.id} | Type: ${t.type} | Amount: $${t.amount} | Status: ${t.status}`);
      });
    }
    
    console.log('\n=== End Debug ===');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

debugDeposits();
