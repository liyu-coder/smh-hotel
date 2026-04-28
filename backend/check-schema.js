const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('Connected to database');

    // Check user_wallets columns
    const [walletColumns] = await conn.execute('DESCRIBE user_wallets');
    console.log('\nuser_wallets columns:');
    walletColumns.forEach(row => console.log('  -', row.Field));

    // Check a sample wallet
    const [wallets] = await conn.execute('SELECT * FROM user_wallets LIMIT 5');
    console.log('\nSample wallets:');
    wallets.forEach(w => {
      console.log(`  user_id: ${w.user_id}, available_balance: ${w.available_balance}, total_deposited: ${w.total_deposited}`);
    });

    // Check recent transactions
    const [transactions] = await conn.execute('SELECT id, user_id, type, amount, status FROM transactions ORDER BY created_at DESC LIMIT 5');
    console.log('\nRecent transactions:');
    transactions.forEach(t => {
      console.log(`  id: ${t.id}, user_id: ${t.user_id}, type: ${t.type}, amount: ${t.amount}, status: ${t.status}`);
    });

    await conn.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
