const fs = require('fs');
const path = require('path');
const { query } = require('./config/database');

async function applyMigration() {
  try {
    console.log('Applying Cash Gap migration...\n');
    
    // Read the migration SQL file
    const sqlFile = path.join(__dirname, 'migrate-cash-gap.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Split into individual statements
    const statements = sql.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (!statement.trim()) continue;
      try {
        await query(statement + ';');
        console.log('✓ Executed:', statement.substring(0, 60).replace(/\n/g, ' ') + '...');
      } catch (err) {
        // Ignore "already exists" errors
        if (err.message.includes('already exists') || 
            err.message.includes('duplicate') ||
            err.message.includes('multiple triggers')) {
          console.log('⚠ Skipped (already exists):', statement.substring(0, 40) + '...');
        } else {
          console.error('✗ Error:', err.message);
        }
      }
    }
    
    console.log('\n✅ Migration completed!');
    console.log('\nTables created:');
    
    // Verify tables
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('user_tasks', 'reservation_plans')
    `);
    
    tables.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });
    
    // Check reservation plans
    const plans = await query('SELECT COUNT(*) FROM reservation_plans');
    console.log(`\n  ✓ ${plans.rows[0].count} reservation plans inserted`);
    
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

applyMigration();
