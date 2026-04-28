const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkTransactionStatus() {
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
    const [transactions] = await connection.execute('SELECT id, user_id, type, status, amount, created_at FROM transactions ORDER BY created_at DESC LIMIT 10');
    console.log('\nRecent transactions:');
    transactions.forEach(t => {
      console.log(`ID: ${t.id}, User: ${t.user_id}, Type: ${t.type}, Status: ${t.status}, Amount: ${t.amount}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

checkTransactionStatus();
