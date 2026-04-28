const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateToken, authorize } = require('../middleware/auth');

// Get all transactions for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const type = req.query.type; // 'deposit' or 'withdrawal'
    const status = req.query.status; // 'pending', 'approved', 'rejected', 'completed'

    let queryText = 'SELECT * FROM transactions WHERE user_id = ?';
    const params = [req.user.userId];

    if (type) {
      queryText += ' AND type = ?';
      params.push(type);
    }

    if (status) {
      queryText += ' AND status = ?';
      params.push(status);
    }

    queryText += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const result = await query(queryText, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM transactions WHERE user_id = ?';
    const countParams = [req.user.userId];

    if (type) {
      countQuery += ' AND type = ?';
      countParams.push(type);
    }

    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }

    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      transactions: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching transactions' 
    });
  }
});

// Get transaction by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM transactions WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Transaction not found' 
      });
    }

    res.json({
      success: true,
      transaction: result.rows[0]
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching transaction' 
    });
  }
});

// Admin: Get all transactions (for admin approval/rejection)
router.get('/admin/all', authenticateToken, authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status;
    const type = req.query.type;

    let queryText = `
      SELECT t.*, u.name as user_name, u.email as user_email
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      queryText += ' AND t.status = ?';
      params.push(status);
    }

    if (type) {
      queryText += ' AND t.type = ?';
      params.push(type);
    }

    queryText += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const result = await query(queryText, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM transactions WHERE 1=1';
    const countParams = [];

    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }

    if (type) {
      countQuery += ' AND type = ?';
      countParams.push(type);
    }

    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      transactions: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching transactions' 
    });
  }
});

// Admin: Approve transaction with task limit
router.put('/:id/approve', authenticateToken, authorize('admin', 'super_admin'), async (req, res) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const result = await client.query(
      'SELECT * FROM transactions WHERE id = ?',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        success: false, 
        message: 'Transaction not found' 
      });
    }

    const transaction = result.rows[0];

    if (transaction.status !== 'pending') {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        message: 'Transaction cannot be approved' 
      });
    }

    // Get task limit and commission from request (for deposits)
    const { task_limit, commission_rate } = req.body;

    // Update transaction status with task limit info
    await client.query(
      `UPDATE transactions SET status = ?, processed_at = CURRENT_TIMESTAMP, 
       task_limit_given = ?, commission_rate_given = ?, admin_note = ? WHERE id = ?`,
      ['approved', task_limit || 0, commission_rate || 0.04, req.body.admin_note || null, req.params.id]
    );

    // Update wallet based on transaction type
    if (transaction.type === 'deposit') {
      // Check if wallet exists first
      console.log('📊 [transactions.js] Checking wallet for user_id:', transaction.user_id);
      const walletCheck = await client.query(
        'SELECT id, available_balance, total_deposited FROM user_wallets WHERE user_id = ?',
        [transaction.user_id]
      );
      console.log('📊 [transactions.js] Wallet check result:', walletCheck.rows);

      if (walletCheck.rows.length === 0) {
        // Create wallet if it doesn't exist (only use columns guaranteed to exist)
        console.log('📝 [transactions.js] Creating new wallet for user_id:', transaction.user_id, 'with amount:', transaction.amount);
        await client.query(
          'INSERT INTO user_wallets (user_id, available_balance, total_deposited, max_daily_orders) VALUES (?, ?, ?, ?)',
          [transaction.user_id, transaction.amount, transaction.amount, task_limit || 25]
        );
        console.log('✅ [transactions.js] Wallet created successfully');
      } else {
        // Add to available balance and total deposited (only use columns guaranteed to exist)
        const currentBalance = walletCheck.rows[0].available_balance;
        console.log('📝 [transactions.js] Updating existing wallet. Current balance:', currentBalance, 'Adding:', transaction.amount);
        await client.query(
          `UPDATE user_wallets
          SET available_balance = available_balance + ?,
              total_deposited = total_deposited + ?,
              max_daily_orders = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ?`,
          [transaction.amount, transaction.amount, task_limit || 25, transaction.user_id]
        );
        console.log('✅ [transactions.js] Wallet updated successfully');

        // Verify the update
        const verifyResult = await client.query('SELECT available_balance, total_deposited FROM user_wallets WHERE user_id = ?', [transaction.user_id]);
        console.log('📊 [transactions.js] Wallet after update:', verifyResult.rows[0]);
      }

      // Log the task limit assignment
      console.log(`✅ Deposit approved for user ${transaction.user_id}: $${transaction.amount}, Task limit: ${task_limit}, Commission: ${commission_rate}%`);
    } else if (transaction.type === 'withdrawal') {
      // Remove from pending and add to total withdrawn
      await client.query(
        `UPDATE user_wallets 
        SET pending_amount = pending_amount - ?,
            total_withdrawn = total_withdrawn + ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?`,
        [transaction.amount, transaction.amount, transaction.user_id]
      );
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Transaction approved successfully',
      data: {
        task_limit: task_limit || 0,
        commission_rate: commission_rate || 0.04
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Approve transaction error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error approving transaction' 
    });
  } finally {
    client.release();
  }
});

// Admin: Reject transaction
router.put('/:id/reject', authenticateToken, authorize('admin', 'super_admin'), async (req, res) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const result = await client.query(
      'SELECT * FROM transactions WHERE id = ?',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        success: false, 
        message: 'Transaction not found' 
      });
    }

    const transaction = result.rows[0];

    if (transaction.status !== 'pending') {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        message: 'Transaction cannot be rejected' 
      });
    }

    // Update transaction status
    await client.query(
      'UPDATE transactions SET status = ?, processed_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['rejected', req.params.id]
    );

    // For withdrawals, refund the amount back to available balance
    if (transaction.type === 'withdrawal') {
      await client.query(
        `UPDATE user_wallets 
        SET available_balance = available_balance + ?,
            pending_amount = pending_amount - ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?`,
        [transaction.amount, transaction.amount, transaction.user_id]
      );
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Transaction rejected successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Reject transaction error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error rejecting transaction' 
    });
  } finally {
    client.release();
  }
});

// Create booking transaction (called internally when booking is made)
router.post('/booking', authenticateToken, async (req, res) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const { booking_id, amount, hotel_name, user_id } = req.body;

    if (!booking_id || !amount || !user_id) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Booking ID, amount, and user ID are required'
      });
    }

    // Create booking transaction
    const transactionResult = await client.query(
      `INSERT INTO transactions (user_id, type, amount, status, description, booking_id, created_at)
       VALUES (?, 'booking', ?, 'completed', ?, ?, CURRENT_TIMESTAMP)`,
      [user_id, amount, `Booking payment for ${hotel_name}`, booking_id]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Booking transaction created successfully',
      transaction: transactionResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create booking transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating booking transaction'
    });
  } finally {
    client.release();
  }
});

// Get comprehensive transaction history with booking details
router.get('/comprehensive', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const type = req.query.type;
    const status = req.query.status;

    let queryText = `
      SELECT 
        t.*,
        b.booking_reference,
        h.name as hotel_name,
        h.image_url as hotel_image_url
      FROM transactions t
      LEFT JOIN bookings b ON t.booking_id = b.id
      LEFT JOIN hotels h ON b.hotel_id = h.id
      WHERE t.user_id = ?
    `;
    const params = [req.user.userId];

    if (type) {
      queryText += ' AND t.type = ?';
      params.push(type);
    }

    if (status) {
      queryText += ' AND t.status = ?';
      params.push(status);
    }

    queryText += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const result = await query(queryText, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM transactions t WHERE t.user_id = ?';
    const countParams = [req.user.userId];

    if (type) {
      countQuery += ' AND t.type = ?';
      countParams.push(type);
    }

    if (status) {
      countQuery += ' AND t.status = ?';
      countParams.push(status);
    }

    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    // Calculate statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN type = 'deposit' THEN amount ELSE 0 END) as total_deposits,
        SUM(CASE WHEN type = 'booking' THEN amount ELSE 0 END) as total_bookings,
        SUM(CASE WHEN type = 'withdrawal' THEN amount ELSE 0 END) as total_withdrawals,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count
      FROM transactions 
      WHERE user_id = ?
    `;
    const statsResult = await query(statsQuery, [req.user.userId]);

    res.json({
      success: true,
      transactions: result.rows,
      statistics: statsResult.rows[0],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get comprehensive transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction history'
    });
  }
});

// Admin: Get comprehensive transaction monitoring
router.get('/admin/comprehensive', authenticateToken, authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const type = req.query.type;
    const status = req.query.status;
    const userId = req.query.user_id;

    let queryText = `
      SELECT 
        t.*,
        u.name as user_name,
        u.email as user_email,
        b.booking_reference,
        h.name as hotel_name
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN bookings b ON t.booking_id = b.id
      LEFT JOIN hotels h ON b.hotel_id = h.id
      WHERE 1=1
    `;
    const params = [];

    if (type) {
      queryText += ' AND t.type = ?';
      params.push(type);
    }

    if (status) {
      queryText += ' AND t.status = ?';
      params.push(status);
    }

    if (userId) {
      queryText += ' AND t.user_id = ?';
      params.push(userId);
    }

    queryText += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const result = await query(queryText, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM transactions t WHERE 1=1';
    const countParams = [];

    if (type) {
      countQuery += ' AND t.type = ?';
      countParams.push(type);
    }

    if (status) {
      countQuery += ' AND t.status = ?';
      countParams.push(status);
    }

    if (userId) {
      countQuery += ' AND t.user_id = ?';
      countParams.push(userId);
    }

    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      transactions: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get comprehensive admin transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction monitoring data'
    });
  }
});

// Admin: Reject transaction with enhanced tracking
router.put('/:id/reject', authenticateToken, authorize('admin', 'super_admin'), async (req, res) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const result = await client.query(
      'SELECT * FROM transactions WHERE id = ?',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        success: false, 
        message: 'Transaction not found' 
      });
    }

    const transaction = result.rows[0];

    if (transaction.status !== 'pending') {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        message: 'Transaction cannot be rejected' 
      });
    }

    // Update transaction status with admin note
    await client.query(
      'UPDATE transactions SET status = ?, processed_at = CURRENT_TIMESTAMP, admin_note = ? WHERE id = ?',
      ['rejected', req.body.admin_note || null, req.params.id]
    );

    // For withdrawals, refund the amount back to available balance
    if (transaction.type === 'withdrawal') {
      await client.query(
        `UPDATE user_wallets 
        SET available_balance = available_balance + ?,
            pending_amount = pending_amount - ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?`,
        [transaction.amount, transaction.amount, transaction.user_id]
      );
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Transaction rejected successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Reject transaction error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error rejecting transaction' 
    });
  } finally {
    client.release();
  }
});

module.exports = router;
