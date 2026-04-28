const mysql = require('mysql2/promise');
require('dotenv').config();

async function addWalletColumns() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'hotelran_smh_hotel_prod',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  });

  try {
    console.log('Connected to database');

    // Add missing columns
    const columns = [
      'frozen_balance DECIMAL(15, 2) DEFAULT 0.00',
      'total_profit DECIMAL(15, 2) DEFAULT 0.00'
    ];

    for (const column of columns) {
      try {
        const [result] = await connection.execute(`ALTER TABLE user_wallets ADD COLUMN ${column}`);
        console.log(`Added column: ${column}`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`Column already exists: ${column.split(' ')[0]}`);
        } else {
          console.error(`Error adding column ${column}:`, error.message);
        }
      }
    }

    console.log('All columns added successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

addWalletColumns();
