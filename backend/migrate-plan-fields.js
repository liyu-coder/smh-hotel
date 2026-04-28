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

    // Add plan-related fields to user_wallets table
    const columns = [
      'ADD COLUMN commission_rate DECIMAL(5, 4) DEFAULT 0.04',
      'ADD COLUMN current_plan INT DEFAULT 1',
      'ADD COLUMN plan_tasks_completed INT DEFAULT 0',
      'ADD COLUMN plan_1_completed BOOLEAN DEFAULT FALSE',
      'ADD COLUMN plan_2_completed BOOLEAN DEFAULT FALSE',
      'ADD COLUMN plan_3_completed BOOLEAN DEFAULT FALSE',
      'ADD COLUMN plan_4_completed BOOLEAN DEFAULT FALSE'
    ];

    for (const column of columns) {
      try {
        await conn.execute(`ALTER TABLE user_wallets ${column}`);
        console.log(`✅ Added: ${column}`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`⚠️ Column already exists: ${column}`);
        } else {
          console.error(`❌ Error adding column: ${column}`, error.message);
        }
      }
    }

    console.log('✅ Migration completed successfully');
    await conn.end();
  } catch (error) {
    console.error('❌ Error:', error);
  }
})();
