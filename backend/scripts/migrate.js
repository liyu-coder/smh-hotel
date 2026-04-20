const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');
require('dotenv').config();

async function runSchema() {
  console.log('Running database schema migration...');
  console.log('');

  try {
    // Read the schema.sql file
    const schemaPath = path.join(__dirname, '../schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute the entire schema as one query
    await pool.query(schema);

    console.log('✅ Schema migration completed successfully!');
    console.log('');

    // Verify tables were created
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log(`✅ Created ${tablesResult.rows.length} tables:`);
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

  } catch (error) {
    console.error('❌ Schema migration failed:');
    console.error(`   Error: ${error.message}`);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runSchema();
