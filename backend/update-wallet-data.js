const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateWalletData() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'hotelran_smh_hotel_prod',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  });

  try {
    console.log('Connected to database');

    // Check current wallet state
    const [wallets] = await connection.execute('SELECT * FROM user_wallets');
    console.log('\nCurrent wallets:');
    wallets.forEach(w => {
      console.log(`User: ${w.user_id}, Balance: ${w.available_balance}, Frozen: ${w.frozen_balance}, Total Profit: ${w.total_profit}, Total Deposited: ${w.total_deposited}`);
    });

    // Update frozen_balance based on total_deposited for existing users
    const [updateResult] = await connection.execute(
      'UPDATE user_wallets SET frozen_balance = total_deposited WHERE frozen_balance = 0 AND total_deposited > 0'
    );
    console.log(`\nUpdated frozen_balance for ${updateResult.affectedRows} users`);

    // Check completed tasks and calculate total_profit
    const [completedTasks] = await connection.execute(
      `SELECT user_id, SUM(commission_amount) as total_earned 
       FROM user_tasks 
       WHERE status = 'completed' 
       GROUP BY user_id`
    );
    
    console.log('\nCompleted tasks per user:');
    for (const task of completedTasks) {
      console.log(`User: ${task.user_id}, Total Earned: ${task.total_earned}`);
      
      // Update total_profit for this user
      const [updateProfit] = await connection.execute(
        'UPDATE user_wallets SET total_profit = ? WHERE user_id = ?',
        [task.total_earned, task.user_id]
      );
      console.log(`Updated total_profit for user ${task.user_id}: ${updateProfit.affectedRows} rows affected`);
    }

    // Check updated wallets
    const [updatedWallets] = await connection.execute('SELECT * FROM user_wallets');
    console.log('\nUpdated wallets:');
    updatedWallets.forEach(w => {
      console.log(`User: ${w.user_id}, Balance: ${w.available_balance}, Frozen: ${w.frozen_balance}, Total Profit: ${w.total_profit}, Total Deposited: ${w.total_deposited}`);
    });

    console.log('\nAll data updated successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

updateWalletData();
