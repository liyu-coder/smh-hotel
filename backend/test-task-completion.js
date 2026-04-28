const mysql = require('mysql2/promise');
require('dotenv').config();

async function testTaskCompletion() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'hotelran_smh_hotel_prod',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  });

  try {
    console.log('Connected to database');

    // Get a pending task
    const [tasks] = await connection.execute(
      'SELECT * FROM user_tasks WHERE status = "pending" LIMIT 1'
    );

    if (tasks.length === 0) {
      console.log('No pending tasks found');
      return;
    }

    const task = tasks[0];
    console.log(`\nFound task: ID ${task.id}, User: ${task.user_id}, Commission: ${task.commission_amount}`);

    // Update task status
    await connection.execute(
      'UPDATE user_tasks SET status = "completed", completed_at = CURRENT_TIMESTAMP WHERE id = ?',
      [task.id]
    );
    console.log('Updated task status to completed');

    // Update wallet
    const [updateResult] = await connection.execute(
      `UPDATE user_wallets 
       SET available_balance = available_balance + ?,
           today_orders = today_orders + 1,
           total_profit = total_profit + ?,
           frozen_balance = frozen_balance - ?
       WHERE user_id = ?`,
      [task.commission_amount, task.commission_amount, task.commission_amount, task.user_id]
    );
    console.log(`Updated wallet for user ${task.user_id}: ${updateResult.affectedRows} rows affected`);

    // Check updated wallet
    const [wallets] = await connection.execute('SELECT * FROM user_wallets WHERE user_id = ?', [task.user_id]);
    const wallet = wallets[0];
    console.log(`\nUpdated wallet:`);
    console.log(`Balance: ${wallet.available_balance}`);
    console.log(`Frozen: ${wallet.frozen_balance}`);
    console.log(`Total Profit: ${wallet.total_profit}`);
    console.log(`Today Orders: ${wallet.today_orders}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

testTaskCompletion();
