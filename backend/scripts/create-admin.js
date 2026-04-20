const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  try {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin123', salt);

    // Insert admin user
    const result = await query(
      'INSERT INTO users (email, password_hash, name, role, is_active, is_verified) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, name, role',
      ['admin@smhhotel.com', passwordHash, 'Admin User', 'super_admin', true, true]
    );

    // Create admin wallet
    await query(
      'INSERT INTO user_wallets (user_id) VALUES ($1)',
      [result.rows[0].id]
    );

    console.log('Admin user created successfully:');
    console.log('Email: admin@smhhotel.com');
    console.log('Password: admin123');
    console.log('Role: super_admin');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error.message);
    process.exit(1);
  }
}

createAdmin();
