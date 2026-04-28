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
    
    // Check countries table structure
    const [columns] = await conn.query('DESCRIBE countries');
    console.log('Countries table columns:', columns.map(c => c.Field));
    
    // Check if is_active column exists
    const hasIsActive = columns.some(c => c.Field === 'is_active');
    console.log('has is_active:', hasIsActive);
    
    if (!hasIsActive) {
      console.log('Adding is_active column...');
      await conn.query('ALTER TABLE countries ADD COLUMN is_active BOOLEAN DEFAULT TRUE');
      console.log('✅ Added is_active column');
    }
    
    // Check countries count
    const [countResult] = await conn.query('SELECT COUNT(*) as count FROM countries');
    console.log('Countries count:', countResult[0].count);
    
    // Check active countries
    const [activeResult] = await conn.query('SELECT COUNT(*) as count FROM countries WHERE is_active = TRUE');
    console.log('Active countries count:', activeResult[0].count);
    
    // Get sample countries
    const [countries] = await conn.query('SELECT * FROM countries LIMIT 5');
    console.log('Sample countries:', JSON.stringify(countries, null, 2));
    
    await conn.end();
  } catch (error) {
    console.error('Error:', error);
  }
})();
