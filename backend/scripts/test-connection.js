const { pool } = require('../config/database');
require('dotenv').config();

async function testConnection() {
  console.log('Testing PostgreSQL connection...');
  console.log('Database Config:');
  console.log(`  Host: ${process.env.DB_HOST}`);
  console.log(`  Port: ${process.env.DB_PORT}`);
  console.log(`  Database: ${process.env.DB_NAME}`);
  console.log(`  User: ${process.env.DB_USER}`);
  console.log('');

  try {
    // Test connection
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Connection successful!');
    console.log(`   Server time: ${result.rows[0].current_time}`);
    console.log('');

    // Test database exists
    const dbResult = await pool.query('SELECT current_database() as database_name');
    console.log(`✅ Connected to database: ${dbResult.rows[0].database_name}`);
    console.log('');

    // Test tables exist
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log(`✅ Found ${tablesResult.rows.length} tables:`);
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    console.log('');

    // Test countries data
    const countriesResult = await pool.query('SELECT COUNT(*) as count FROM countries');
    console.log(`✅ Countries table has ${countriesResult.rows[0].count} records`);
    console.log('');

    console.log('All checks passed! Database is ready.');
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error(`   Error: ${error.message}`);
    console.error('');
    console.error('Troubleshooting:');
    console.error('1. Check if PostgreSQL service is running');
    console.error('2. Verify DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD in .env');
    console.error('3. Make sure database "smh_hotel_reservation" exists');
    console.error('4. Check if password is correct');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();
