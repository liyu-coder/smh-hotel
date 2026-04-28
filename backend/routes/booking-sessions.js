const express = require('express');
const router = express.Router();
const { query, getClient } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Start or continue booking session
router.post('/start', authenticateToken, async (req, res) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Check if user has an active session
    const existingSessionResult = await client.query(
      'SELECT * FROM booking_sessions WHERE user_id = ? AND status IN ("active", "paused") ORDER BY created_at DESC LIMIT 1',
      [req.user.userId]
    );

    let session;
    if (existingSessionResult.rows.length > 0) {
      // Resume existing session
      session = existingSessionResult.rows[0];
      await client.query(
        'UPDATE booking_sessions SET status = "active", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [session.id]
      );
    } else {
      // Create new session
      const sessionId = `session_${req.user.userId}_${Date.now()}`;
      await client.query(
        'INSERT INTO booking_sessions (user_id, session_id, status) VALUES (?, ?, "active")',
        [req.user.userId, sessionId]
      );
      const sessionResult = await client.query(
        'SELECT * FROM booking_sessions WHERE id = LAST_INSERT_ID()'
      );
      session = sessionResult.rows[0];
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: existingSessionResult.rows.length > 0 ? 'Booking session resumed' : 'New booking session started',
      session
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Start session error:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting booking session'
    });
  } finally {
    client.release();
  }
});

// Pause booking session
router.post('/pause', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'UPDATE booking_sessions SET status = "paused", paused_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND status = "active"',
      [req.user.userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active booking session found'
      });
    }

    res.json({
      success: true,
      message: 'Booking session paused'
    });
  } catch (error) {
    console.error('Pause session error:', error);
    res.status(500).json({
      success: false,
      message: 'Error pausing booking session'
    });
  }
});

// Stop booking session
router.post('/stop', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'UPDATE booking_sessions SET status = "stopped", updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND status IN ("active", "paused")',
      [req.user.userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active booking session found'
      });
    }

    res.json({
      success: true,
      message: 'Booking session stopped'
    });
  } catch (error) {
    console.error('Stop session error:', error);
    res.status(500).json({
      success: false,
      message: 'Error stopping booking session'
    });
  }
});

// Get current session status
router.get('/current', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM booking_sessions WHERE user_id = ? AND status IN ("active", "paused") ORDER BY created_at DESC LIMIT 1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        session: null,
        message: 'No active session'
      });
    }

    res.json({
      success: true,
      session: result.rows[0]
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting session status'
    });
  }
});

// Get session history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const result = await query(
      'SELECT * FROM booking_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [req.user.userId, limit, offset]
    );

    const countResult = await query(
      'SELECT COUNT(*) as total FROM booking_sessions WHERE user_id = ?',
      [req.user.userId]
    );

    const total = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      sessions: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get session history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting session history'
    });
  }
});

module.exports = router;
