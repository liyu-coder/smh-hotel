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
    
    await conn.query("DELETE FROM hotels WHERE country = 'Ethiopia'");
    console.log('✅ Ethiopian hotels deleted');
    
    await conn.end();
  } catch (error) {
    console.error('Error:', error);
  }
})();
