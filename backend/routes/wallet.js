const express = require('express');
const router = express.Router();
const { query, getClient } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Get wallet data for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM user_wallets WHERE user_id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      // Create wallet if it doesn't exist
      const createResult = await query(
        'INSERT INTO user_wallets (user_id) VALUES ($1) RETURNING *',
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
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { amount, currency, method, address, network } = req.body;

    // Calculate fee
    let fee = 0;
    if (method.toLowerCase().includes('visa') || method.toLowerCase().includes('mastercard')) {
      fee = amount * 0.02; // 2% for cards
    } else {
      fee = amount * 0.005; // 0.5% for crypto
    }

    // Create transaction
    const transactionResult = await client.query(
      `INSERT INTO transactions (user_id, type, method, amount, currency, status, fee, address, network)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [req.user.userId, 'deposit', method, amount, currency, 'pending', fee, address || null, network || null]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Deposit request created successfully',
      transaction: transactionResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create deposit error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating deposit' 
    });
  } finally {
    client.release();
  }
});

// Create withdrawal
router.post('/withdraw', authenticateToken, [
  body('amount').isFloat({ min: 10 }),
  body('currency').isIn(['USD', 'EUR', 'USDT', 'ETH']),
  body('method').notEmpty()
], async (req, res) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { amount, currency, method, address, network } = req.body;

    // Get wallet
    const walletResult = await client.query(
      'SELECT * FROM user_wallets WHERE user_id = $1',
      [req.user.userId]
    );

    if (walletResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        message: 'Wallet not found' 
      });
    }

    const wallet = walletResult.rows[0];

    // Check if wallet is locked
    if (wallet.is_locked) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        message: 'Wallet is locked. Contact support.' 
      });
    }

    // Check sufficient balance
    if (wallet.available_balance < amount) {
      await client.query('ROLLBACK');
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
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        message: 'Address is required for crypto withdrawals' 
      });
    }

    // Create transaction
    const transactionResult = await client.query(
      `INSERT INTO transactions (user_id, type, method, amount, currency, status, fee, address, network)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [req.user.userId, 'withdrawal', method, amount, currency, 'pending', fee, address || null, network || null]
    );

    // Deduct from available balance
    await client.query(
      'UPDATE user_wallets SET available_balance = available_balance - $1, pending = pending + $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
      [amount, req.user.userId]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Withdrawal request created successfully',
      transaction: transactionResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create withdrawal error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating withdrawal' 
    });
  } finally {
    client.release();
  }
});

// Get wallet summary
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const walletResult = await query(
      'SELECT * FROM user_wallets WHERE user_id = $1',
      [req.user.userId]
    );

    if (walletResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Wallet not found' 
      });
    }

    const wallet = walletResult.rows[0];

    // Get recent transactions
    const transactionsResult = await query(
      'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
      [req.user.userId]
    );

    // Get today's orders count
    const todayResult = await query(
      `SELECT COUNT(*) as count FROM bookings 
      WHERE user_id = $1 AND DATE(created_at) = CURRENT_DATE`,
      [req.user.userId]
    );

    res.json({
      success: true,
      wallet,
      recentTransactions: transactionsResult.rows,
      todayOrders: parseInt(todayResult.rows[0].count)
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
