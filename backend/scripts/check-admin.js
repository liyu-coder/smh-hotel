const { query } = require('../config/database');

async function checkAdmin() {
  try {
    const result = await query('SELECT id, email, name, role, is_active, is_verified FROM users WHERE email = $1', ['admin@smhhotel.com']);
    
    if (result.rows.length === 0) {
      console.log('Admin user not found in database');
    } else {
      console.log('Admin user found:');
      console.log('ID:', result.rows[0].id);
      console.log('Email:', result.rows[0].email);
      console.log('Name:', result.rows[0].name);
      console.log('Role:', result.rows[0].role);
      console.log('Active:', result.rows[0].is_active);
      console.log('Verified:', result.rows[0].is_verified);
    }
    process.exit(0);
  } catch (error) {
    console.error('Error checking admin user:', error.message);
    process.exit(1);
  }
}

checkAdmin();
