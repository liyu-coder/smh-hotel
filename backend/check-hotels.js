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
    
    // Check hotels table structure
    const [columns] = await conn.query('DESCRIBE hotels');
    console.log('Hotels table columns:', columns.map(c => c.Field));
    
    // Check if country_id column exists
    const hasCountryId = columns.some(c => c.Field === 'country_id');
    console.log('has country_id:', hasCountryId);
    
    await conn.end();
  } catch (error) {
    console.error('Error:', error);
  }
})();
