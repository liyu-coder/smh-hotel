const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

// Approve deposit transaction
router.post('/approve-transaction', async (req, res) => {
  try {
    const { transactionId, taskLimit, commissionRate, adminNotes } = req.body;

    if (!transactionId) {
      return res.status(400).json({ success: false, message: 'Transaction ID required' });
    }

    // Get transaction details
    const transactionSql = 'SELECT * FROM transactions WHERE id = ?';
    const transactionResult = await query(transactionSql, [transactionId]);
    const transaction = transactionResult.rows[0];

    if (!transaction || transaction.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Invalid transaction' });
    }

    // Update transaction status
    const updateTransactionSql = `
      UPDATE transactions 
      SET status = 'approved', 
          task_limit = ?, 
          commission_rate = ?, 
          admin_notes = ?,
          approved_at = NOW()
      WHERE id = ?
    `;
    await query(updateTransactionSql, [taskLimit || 25, commissionRate || 0.04, adminNotes || '', transactionId]);

    // Update user wallet balance and task limit
    // Check if wallet exists first
    console.log('📊 Checking wallet for user_id:', transaction.user_id);
    const walletCheck = await query('SELECT id, available_balance, total_deposited FROM user_wallets WHERE user_id = ?', [transaction.user_id]);
    console.log('📊 Wallet check result:', walletCheck.rows);

    if (walletCheck.rows.length === 0) {
      // Create wallet if it doesn't exist (only use columns guaranteed to exist)
      console.log('📝 Creating new wallet for user_id:', transaction.user_id, 'with amount:', transaction.amount);
      await query(
        'INSERT INTO user_wallets (user_id, available_balance, total_deposited, max_daily_orders) VALUES (?, ?, ?, ?)',
        [transaction.user_id, transaction.amount, transaction.amount, taskLimit || 25]
      );
      console.log('✅ Wallet created successfully');
    } else {
      // Update existing wallet (only use columns guaranteed to exist)
      const currentBalance = walletCheck.rows[0].available_balance;
      console.log('📝 Updating existing wallet. Current balance:', currentBalance, 'Adding:', transaction.amount);
      const updateUserWalletSql = `
        UPDATE user_wallets
        SET available_balance = available_balance + ?,
            total_deposited = total_deposited + ?,
            max_daily_orders = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `;
      await query(updateUserWalletSql, [transaction.amount, transaction.amount, taskLimit || 25, transaction.user_id]);
      console.log('✅ Wallet updated successfully');

      // Verify the update
      const verifyResult = await query('SELECT available_balance, total_deposited FROM user_wallets WHERE user_id = ?', [transaction.user_id]);
      console.log('📊 Wallet after update:', verifyResult.rows[0]);
    }

    res.json({ 
      success: true, 
      message: 'Transaction approved successfully. Wallet balance and task limit updated.' 
    });
  } catch (error) {
    console.error('Approve transaction error:', error);
    res.status(500).json({ success: false, message: 'Failed to approve transaction' });
  }
});

// Reject deposit transaction
router.post('/reject-transaction', async (req, res) => {
  try {
    const { transactionId, adminNotes } = req.body;

    if (!transactionId) {
      return res.status(400).json({ success: false, message: 'Transaction ID required' });
    }

    const sql = `
      UPDATE transactions 
      SET status = 'rejected', 
          admin_notes = ?
      WHERE id = ?
    `;
    await query(sql, [adminNotes || '', transactionId]);

    res.json({ 
      success: true, 
      message: 'Transaction rejected successfully' 
    });
  } catch (error) {
    console.error('Reject transaction error:', error);
    res.status(500).json({ success: false, message: 'Failed to reject transaction' });
  }
});

module.exports = router;
