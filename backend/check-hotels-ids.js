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
    
    // Get all hotels
    const [hotels] = await conn.query('SELECT id, name, country, city FROM hotels LIMIT 20');
    console.log('Hotels in DB:');
    hotels.forEach(h => {
      console.log(`ID: ${h.id}, Name: ${h.name}, Country: ${h.country}, City: ${h.city}`);
    });
    
    await conn.end();
  } catch (error) {
    console.error('Error:', error);
  }
})();
