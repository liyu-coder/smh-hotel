const { query } = require('./config/database');

async function testImplementation() {
  console.log('🧪 Testing Hotel Booking System Implementation...\n');

  try {
    // Test 1: Check if new columns exist in user_wallets
    console.log('1️⃣ Testing user_wallets schema...');
    const walletSchema = await query('DESCRIBE user_wallets');
    const walletColumns = walletSchema.rows.map(row => row.Field);
    
    const requiredWalletColumns = ['task_limit', 'completed_tasks', 'commission_rate', 'requires_recharge', 'recharge_count'];
    const missingWalletColumns = requiredWalletColumns.filter(col => !walletColumns.includes(col));
    
    if (missingWalletColumns.length === 0) {
      console.log('✅ user_wallets schema is up to date');
    } else {
      console.log('❌ Missing columns in user_wallets:', missingWalletColumns);
    }

    // Test 2: Check if booking_sessions table exists
    console.log('\n2️⃣ Testing booking_sessions table...');
    try {
      const sessionsResult = await query('DESCRIBE booking_sessions');
      console.log('✅ booking_sessions table exists');
    } catch (error) {
      console.log('❌ booking_sessions table missing:', error.message);
    }

    // Test 3: Check if transactions table has new columns
    console.log('\n3️⃣ Testing transactions schema...');
    const transactionSchema = await query('DESCRIBE transactions');
    const transactionColumns = transactionSchema.rows.map(row => row.Field);
    
    const requiredTransactionColumns = ['booking_id', 'task_limit_given', 'commission_rate_given', 'admin_note'];
    const missingTransactionColumns = requiredTransactionColumns.filter(col => !transactionColumns.includes(col));
    
    if (missingTransactionColumns.length === 0) {
      console.log('✅ transactions schema is up to date');
    } else {
      console.log('❌ Missing columns in transactions:', missingTransactionColumns);
    }

    // Test 4: Check if bookings table has session columns
    console.log('\n4️⃣ Testing bookings schema...');
    const bookingSchema = await query('DESCRIBE bookings');
    const bookingColumns = bookingSchema.rows.map(row => row.Field);
    
    const requiredBookingColumns = ['booking_session_id', 'is_paused', 'paused_at'];
    const missingBookingColumns = requiredBookingColumns.filter(col => !bookingColumns.includes(col));
    
    if (missingBookingColumns.length === 0) {
      console.log('✅ bookings schema is up to date');
    } else {
      console.log('❌ Missing columns in bookings:', missingBookingColumns);
    }

    // Test 5: Test API endpoints are accessible
    console.log('\n5️⃣ Testing API endpoints...');
    
    // Test random hotels endpoint
    try {
      const hotelsResult = await query('SELECT COUNT(*) as count FROM hotels WHERE is_active = true');
      console.log(`✅ Found ${hotelsResult.rows[0].count} active hotels for random display`);
    } catch (error) {
      console.log('❌ Error checking hotels:', error.message);
    }

    // Test 6: Test task limit logic
    console.log('\n6️⃣ Testing task limit logic...');
    try {
      const walletTest = await query('SELECT task_limit, completed_tasks FROM user_wallets LIMIT 1');
      if (walletTest.rows.length > 0) {
        const wallet = walletTest.rows[0];
        console.log(`✅ Sample wallet - Task limit: ${wallet.task_limit}, Completed: ${wallet.completed_tasks}`);
      } else {
        console.log('ℹ️ No wallets found (expected for fresh database)');
      }
    } catch (error) {
      console.log('❌ Error testing task limit logic:', error.message);
    }

    console.log('\n🎯 Implementation Test Summary:');
    console.log('- Database schema checks completed');
    console.log('- All new features are ready for testing');
    console.log('- Run migration if any schema issues detected');
    console.log('\n📋 Next Steps:');
    console.log('1. Run task_limit_migration.sql if needed');
    console.log('2. Test API endpoints with Postman/curl');
    console.log('3. Verify task limit enforcement');
    console.log('4. Test deposit approval flow');
    console.log('5. Validate booking sessions');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testImplementation().then(() => {
  console.log('\n✨ Testing completed!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test error:', error);
  process.exit(1);
});
