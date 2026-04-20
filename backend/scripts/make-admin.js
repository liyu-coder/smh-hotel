const { query } = require('../config/database');

async function makeAdmin() {
  const email = process.argv[2];

  if (!email) {
    console.log('Usage: node scripts/make-admin.js <email>');
    console.log('Example: node scripts/make-admin.js user@example.com');
    process.exit(1);
  }

  try {
    // Update user role to admin
    const result = await query(
      'UPDATE users SET role = $1, is_active = true, is_verified = true WHERE email = $2 RETURNING id, email, name, role',
      ['super_admin', email]
    );

    if (result.rows.length === 0) {
      console.log('User not found with email:', email);
      process.exit(1);
    }

    console.log('User updated to super_admin:');
    console.log('ID:', result.rows[0].id);
    console.log('Email:', result.rows[0].email);
    console.log('Name:', result.rows[0].name);
    console.log('Role:', result.rows[0].role);
    console.log('Active:', result.rows[0].is_active);
    console.log('Verified:', result.rows[0].is_verified);
    console.log('\nPlease logout and login again to get a new token with the updated role.');
    process.exit(0);
  } catch (error) {
    console.error('Error updating user role:', error.message);
    process.exit(1);
  }
}

makeAdmin();
