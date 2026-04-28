const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDeposits() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'hotelran_smh_hotel_prod',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  });

  try {
    console.log('Connected to database');

    // Check all transactions
    const [transactions] = await connection.execute('SELECT * FROM transactions ORDER BY created_at DESC LIMIT 10');
    console.log('\nAll transactions:');
    transactions.forEach(t => {
      console.log(`ID: ${t.id}, Type: ${t.type}, Status: ${t.status}, Amount: ${t.amount}, User: ${t.user_id}`);
    });

    // Check transactions with type='deposit'
    const [deposits] = await connection.execute("SELECT * FROM transactions WHERE type = 'deposit'");
    console.log(`\nTransactions with type='deposit': ${deposits.length}`);
    deposits.forEach(t => {
      console.log(`ID: ${t.id}, Status: ${t.status}, Amount: ${t.amount}, User: ${t.user_id}`);
    });

    // Check transactions without type
    const [noType] = await connection.execute("SELECT * FROM transactions WHERE type IS NULL OR type = ''");
    console.log(`\nTransactions without type: ${noType.length}`);
    noType.forEach(t => {
      console.log(`ID: ${t.id}, Status: ${t.status}, Amount: ${t.amount}, User: ${t.user_id}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

checkDeposits();
