const mysql = require('mysql2/promise');
require('dotenv').config();

async function addTransactionColumns() {
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
      'currency VARCHAR(10) DEFAULT "USDT"',
      'fee DECIMAL(15, 2) DEFAULT 0',
      'address TEXT',
      'network VARCHAR(50)',
      'screenshot_url VARCHAR(255)',
      'task_limit INT DEFAULT 25',
      'commission_rate DECIMAL(5, 4) DEFAULT 0.0400',
      'admin_notes TEXT',
      'approved_at TIMESTAMP NULL',
      'processed_at TIMESTAMP NULL'
    ];

    for (const column of columns) {
      try {
        const [result] = await connection.execute(`ALTER TABLE transactions ADD COLUMN ${column}`);
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

addTransactionColumns();
