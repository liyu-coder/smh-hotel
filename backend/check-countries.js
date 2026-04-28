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
    
    // Check if countries table exists
    const [tables] = await conn.query("SHOW TABLES LIKE 'countries'");
    console.log('Countries table exists:', tables.length > 0);
    
    if (tables.length > 0) {
      // Get countries
      const [countries] = await conn.query('SELECT * FROM countries LIMIT 10');
      console.log('Countries in DB:', countries.length);
      console.log('Sample:', JSON.stringify(countries, null, 2));
    } else {
      console.log('Countries table does not exist');
    }
    
    await conn.end();
  } catch (error) {
    console.error('Error:', error);
  }
})();
