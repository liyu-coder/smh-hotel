const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkUserTasks() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'hotelran_smh_hotel_prod',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  });

  try {
    console.log('Connected to database');

    // Check user_tasks
    const [tasks] = await connection.execute('SELECT * FROM user_tasks ORDER BY created_at DESC LIMIT 10');
    console.log('\nUser tasks:', tasks.length);
    tasks.forEach(t => {
      console.log(`ID: ${t.id}, User: ${t.user_id}, Status: ${t.status}, Commission: ${t.commission_amount}, Deposit: ${t.deposit_id}`);
    });

    // Check user_wallets columns
    const [columns] = await connection.execute('DESCRIBE user_wallets');
    console.log('\nUser wallets columns:');
    columns.forEach(c => {
      console.log(`- ${c.Field}: ${c.Type}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

checkUserTasks();
