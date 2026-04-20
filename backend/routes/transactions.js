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

    let queryText = 'SELECT * FROM transactions WHERE user_id = $1';
    const params = [req.user.userId];
    let paramCount = 2;

    if (type) {
      queryText += ` AND type = $${paramCount++}`;
      params.push(type);
    }

    if (status) {
      queryText += ` AND status = $${paramCount++}`;
      params.push(status);
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM transactions WHERE user_id = $1';
    const countParams = [req.user.userId];
    let countParamCount = 2;

    if (type) {
      countQuery += ` AND type = $${countParamCount++}`;
      countParams.push(type);
    }

    if (status) {
      countQuery += ` AND status = $${countParamCount++}`;
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
      'SELECT * FROM transactions WHERE id = $1 AND user_id = $2',
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
    let paramCount = 1;

    if (status) {
      queryText += ` AND t.status = $${paramCount++}`;
      params.push(status);
    }

    if (type) {
      queryText += ` AND t.type = $${paramCount++}`;
      params.push(type);
    }

    queryText += ` ORDER BY t.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM transactions WHERE 1=1';
    const countParams = [];
    let countParamCount = 1;

    if (status) {
      countQuery += ` AND status = $${countParamCount++}`;
      countParams.push(status);
    }

    if (type) {
      countQuery += ` AND type = $${countParamCount++}`;
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

// Admin: Approve transaction
router.put('/:id/approve', authenticateToken, authorize('admin', 'super_admin'), async (req, res) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const result = await client.query(
      'SELECT * FROM transactions WHERE id = $1',
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

    // Update transaction status
    await client.query(
      'UPDATE transactions SET status = $1, processed_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['approved', req.params.id]
    );

    // Update wallet based on transaction type
    if (transaction.type === 'deposit') {
      // Add to available balance and total deposited
      await client.query(
        `UPDATE user_wallets 
        SET available_balance = available_balance + $1,
            total_deposited = total_deposited + $1,
            total_approved = total_approved + $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $2`,
        [transaction.amount, transaction.user_id]
      );
    } else if (transaction.type === 'withdrawal') {
      // Remove from pending and add to total withdrawn
      await client.query(
        `UPDATE user_wallets 
        SET pending = pending - $1,
            total_withdrawn = total_withdrawn + $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $2`,
        [transaction.amount, transaction.user_id]
      );
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Transaction approved successfully'
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
      'SELECT * FROM transactions WHERE id = $1',
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
      'UPDATE transactions SET status = $1, processed_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['rejected', req.params.id]
    );

    // For withdrawals, refund the amount back to available balance
    if (transaction.type === 'withdrawal') {
      await client.query(
        `UPDATE user_wallets 
        SET available_balance = available_balance + $1,
            pending = pending - $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $2`,
        [transaction.amount, transaction.user_id]
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
