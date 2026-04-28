const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixTransactions() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'hotelran_smh_hotel_prod',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  });

  try {
    console.log('Connected to database');

    // Update transactions without type to 'deposit'
    const [result1] = await connection.execute(
      "UPDATE transactions SET type = 'deposit' WHERE type IS NULL OR type = ''"
    );
    console.log(`Updated ${result1.affectedRows} transactions with type`);

    // Update uppercase statuses to lowercase
    const [result2] = await connection.execute(
      "UPDATE transactions SET status = 'pending' WHERE status = 'PENDING'"
    );
    console.log(`Updated ${result2.affectedRows} transactions from PENDING to pending`);

    const [result3] = await connection.execute(
      "UPDATE transactions SET status = 'approved' WHERE status = 'APPROVED'"
    );
    console.log(`Updated ${result3.affectedRows} transactions from APPROVED to approved`);

    const [result4] = await connection.execute(
      "UPDATE transactions SET status = 'rejected' WHERE status = 'REJECTED'"
    );
    console.log(`Updated ${result4.affectedRows} transactions from REJECTED to rejected`);

    const [result5] = await connection.execute(
      "UPDATE transactions SET status = 'completed' WHERE status = 'COMPLETED'"
    );
    console.log(`Updated ${result5.affectedRows} transactions from COMPLETED to completed`);

    console.log('All transactions fixed successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

fixTransactions();
