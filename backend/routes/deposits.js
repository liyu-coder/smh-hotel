const express = require('express');
const multer = require('multer');
const path = require('path');
const { query } = require('../config/database');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'deposit-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Create deposit transaction
router.post('/create', upload.single('screenshot'), async (req, res) => {
  try {
    const { userId, amount, currency } = req.body;
    const screenshotUrl = req.file ? req.file.filename : null;

    if (!userId || !amount) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const sql = `
      INSERT INTO transactions (user_id, type, amount, currency, status, screenshot_url, task_limit, commission_rate)
      VALUES (?, 'deposit', ?, ?, 'pending', ?, 25, 0.04)
    `;
    
    const result = await query(sql, [userId, amount, currency || 'USDT', screenshotUrl]);

    res.json({ 
      success: true, 
      message: 'Deposit submitted successfully. Waiting for admin approval.',
      transactionId: result.insertId 
    });
  } catch (error) {
    console.error('Deposit creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to create deposit' });
  }
});

// Get pending transactions for admin
router.get('/pending', async (req, res) => {
  try {
    const sql = `
      SELECT t.*, u.name as user_name, u.email as user_email
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      WHERE t.status = 'pending'
      ORDER BY t.created_at DESC
    `;
    
    const transactions = await query(sql);
    res.json({ success: true, transactions });
  } catch (error) {
    console.error('Get pending transactions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch transactions' });
  }
});

// Get user's transactions
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const sql = `
      SELECT * FROM transactions
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;
    
    const transactions = await query(sql, [userId]);
    res.json({ success: true, transactions });
  } catch (error) {
    console.error('Get user transactions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch transactions' });
  }
});

module.exports = router;
