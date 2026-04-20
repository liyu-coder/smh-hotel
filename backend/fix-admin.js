require('dotenv').config();
const bcrypt = require('bcrypt');
const { query } = require('./config/database');

async function fixAdmin() {
  try {
    console.log('Checking admin user...\n');
    
    // Check if admin exists
    const adminResult = await query(
      "SELECT id, email, name, role, is_active, password_hash FROM users WHERE role IN ('admin', 'super_admin') LIMIT 1"
    );
    
    if (adminResult.rows.length === 0) {
      console.log('❌ No admin user found!');
      console.log('\nCreating default admin user...');
      
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const newAdmin = await query(
        `INSERT INTO users (email, password_hash, name, role, is_active) 
         VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, role`,
        ['admin@hotel.com', hashedPassword, 'Administrator', 'super_admin', true]
      );
      
      console.log('✅ Admin created!');
      console.log('   Email: admin@hotel.com');
      console.log('   Password: admin123');
      console.log('   Role:', newAdmin.rows[0].role);
    } else {
      const admin = adminResult.rows[0];
      console.log('✅ Admin found:');
      console.log('   Email:', admin.email);
      console.log('   Name:', admin.name);
      console.log('   Role:', admin.role);
      console.log('   Active:', admin.is_active);
      
      if (!admin.is_active) {
        console.log('\n⚠️  Admin is INACTIVE! Activating...');
        await query('UPDATE users SET is_active = true WHERE id = $1', [admin.id]);
        console.log('✅ Admin activated!');
      }
      
      // Reset password for testing
      console.log('\n🔄 Resetting admin password to: admin123');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, admin.id]);
      console.log('✅ Password reset!');
    }
    
    // List all users
    console.log('\n📋 All users:');
    const users = await query('SELECT id, email, name, role, is_active FROM users');
    users.rows.forEach(u => {
      console.log(`   ${u.email} | ${u.role} | Active: ${u.is_active}`);
    });
    
    console.log('\n✅ Admin login fixed!');
    console.log('\nLogin with:');
    console.log('   Email: admin@hotel.com');
    console.log('   Password: admin123');
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

fixAdmin();
