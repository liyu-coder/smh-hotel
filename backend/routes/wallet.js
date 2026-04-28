const express = require('express');
const router = express.Router();
const { query, getClient } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Get wallet data for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM user_wallets WHERE user_id = ?`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      // Create wallet if it doesn't exist
      const createResult = await query(
        'INSERT INTO user_wallets (user_id) VALUES (?)',
        [req.user.userId]
      );
      return res.json({
        success: true,
        wallet: createResult.rows[0]
      });
    }

    res.json({
      success: true,
      wallet: result.rows[0]
    });
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching wallet data' 
    });
  }
});

// Create deposit
router.post('/deposit', authenticateToken, [
  body('amount').isFloat({ min: 10 }),
  body('currency').isIn(['USD', 'EUR', 'USDT', 'ETH']),
  body('method').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { amount, currency, method, address, network } = req.body;

    console.log('📝 Creating deposit:', { userId: req.user.userId, amount, currency, method });

    // Calculate fee
    let fee = 0;
    if (method.toLowerCase().includes('visa') || method.toLowerCase().includes('mastercard')) {
      fee = amount * 0.02; // 2% for cards
    } else {
      fee = amount * 0.005; // 0.5% for crypto
    }

    // Create transaction (MySQL compatible - no RETURNING)
    const transactionResult = await query(
      `INSERT INTO transactions (user_id, type, method, amount, currency, status, fee, address, network)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.userId, 'deposit', method, amount, currency, 'pending', fee, address || null, network || null]
    );

    console.log('✅ Deposit created, insertId:', transactionResult.insertId);

    res.status(201).json({
      success: true,
      message: 'Deposit request created successfully',
      transaction: { id: transactionResult.insertId }
    });
  } catch (error) {
    console.error('❌ Create deposit error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating deposit: ' + error.message
    });
  }
});

// Create withdrawal
router.post('/withdraw', authenticateToken, [
  body('amount').isFloat({ min: 10 }),
  body('currency').isIn(['USD', 'EUR', 'USDT', 'ETH']),
  body('method').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { amount, currency, method, address, network } = req.body;

    // Get wallet
    const walletResult = await query(
      'SELECT * FROM user_wallets WHERE user_id = ?',
      [req.user.userId]
    );

    if (walletResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    const wallet = walletResult.rows[0];

    // Check if wallet is locked
    if (wallet.is_locked) {
      return res.status(400).json({
        success: false,
        message: 'Wallet is locked. Contact support.'
      });
    }

    // Check sufficient balance
    if (wallet.available_balance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    // Calculate fee
    let fee = 0;
    if (method.toLowerCase().includes('visa') || method.toLowerCase().includes('mastercard')) {
      fee = amount * 0.02; // 2% for cards
    } else {
      fee = amount * 0.005; // 0.5% for crypto
    }

    // Check if address is required (for crypto methods)
    const isCryptoMethod = network !== undefined && network !== null;
    if (isCryptoMethod && !address) {
      return res.status(400).json({
        success: false,
        message: 'Address is required for crypto withdrawals'
      });
    }

    // Create transaction
    const transactionResult = await query(
      `INSERT INTO transactions (user_id, type, method, amount, currency, status, fee, address, network)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
      [req.user.userId, 'withdrawal', method, amount, currency, 'pending', fee, address || null, network || null]
    );

    // Deduct from available balance
    await query(
      'UPDATE user_wallets SET available_balance = available_balance - ?, pending_amount = pending_amount + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
      [amount, amount, req.user.userId]
    );

    res.status(201).json({
      success: true,
      message: 'Withdrawal request created successfully',
      transaction: transactionResult.rows[0]
    });
  } catch (error) {
    console.error('Create withdrawal error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating withdrawal'
    });
  }
});

// Get wallet summary
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    console.log('📊 [wallet summary] Fetching wallet for user_id:', req.user.userId);
    const walletResult = await query(
      'SELECT * FROM user_wallets WHERE user_id = ?',
      [req.user.userId]
    );

    let wallet;
    if (walletResult.rows.length === 0) {
      console.log('📝 [wallet summary] Wallet not found, creating new wallet for user_id:', req.user.userId);
      // Create wallet if it doesn't exist
      await query('INSERT INTO user_wallets (user_id) VALUES (?)', [req.user.userId]);
      // Fetch the newly created wallet
      const newWalletResult = await query(
        'SELECT * FROM user_wallets WHERE user_id = ?',
        [req.user.userId]
      );
      wallet = newWalletResult.rows[0];
      console.log('✅ [wallet summary] Wallet created successfully for user_id:', wallet.user_id, 'Balance:', wallet.available_balance);
    } else {
      wallet = walletResult.rows[0];
      console.log('📊 [wallet summary] Wallet found:', {
        user_id: wallet.user_id,
        available_balance: wallet.available_balance,
        total_deposited: wallet.total_deposited,
        max_daily_orders: wallet.max_daily_orders,
        today_orders: wallet.today_orders
      });
    }

    // Get recent transactions
    const transactionsResult = await query(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
      [req.user.userId]
    );

    // Get today's orders count
    const todayResult = await query(
      `SELECT COUNT(*) as count FROM bookings 
      WHERE user_id = ? AND DATE(created_at) = CURRENT_DATE`,
      [req.user.userId]
    );

    // Get today's commission from completed tasks
    const todayCommissionResult = await query(
      `SELECT COALESCE(SUM(commission_amount), 0) as total 
       FROM user_tasks 
       WHERE user_id = ? 
       AND status = 'completed' 
       AND DATE(completed_at) = CURRENT_DATE`,
      [req.user.userId]
    );

    // Get yesterday's commission
    const yesterdayCommissionResult = await query(
      `SELECT COALESCE(SUM(commission_amount), 0) as total 
       FROM user_tasks 
       WHERE user_id = ? 
       AND status = 'completed' 
       AND DATE(completed_at) = DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY)`,
      [req.user.userId]
    );

    // Get total completed tasks count (all time)
    const totalCompletedResult = await query(
      `SELECT COUNT(*) as count 
       FROM user_tasks 
       WHERE user_id = ? 
       AND status = 'completed'`,
      [req.user.userId]
    );
    
    const taskCount = parseInt(totalCompletedResult.rows[0].count) || 0;
    console.log('📊 Total completed tasks for user', req.user.userId, ':', taskCount);
    console.log('📊 Wallet completed_tasks column:', wallet.completed_tasks);

    res.json({
      success: true,
      wallet: {
        ...wallet,
        commission_today: parseFloat(todayCommissionResult.rows[0].total) || 0,
        commission_yesterday: parseFloat(yesterdayCommissionResult.rows[0].total) || 0,
        today_orders: parseInt(todayResult.rows[0].count),
        total_completed_tasks: parseInt(totalCompletedResult.rows[0].count) || 0
      },
      recentTransactions: transactionsResult.rows,
      todayOrders: parseInt(todayResult.rows[0].count),
      totalCompletedTasks: parseInt(totalCompletedResult.rows[0].count) || 0
    });
  } catch (error) {
    console.error('Get wallet summary error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching wallet summary' 
    });
  }
});

module.exports = router;
