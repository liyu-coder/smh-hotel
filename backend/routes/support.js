const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateToken, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Get all support tickets for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status;
    const category = req.query.category;

    let queryText = 'SELECT * FROM support_tickets WHERE user_id = $1';
    const params = [req.user.userId];
    let paramCount = 2;

    if (status) {
      queryText += ` AND status = $${paramCount++}`;
      params.push(status);
    }

    if (category) {
      queryText += ` AND category = $${paramCount++}`;
      params.push(category);
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM support_tickets WHERE user_id = $1';
    const countParams = [req.user.userId];
    let countParamCount = 2;

    if (status) {
      countQuery += ` AND status = $${countParamCount++}`;
      countParams.push(status);
    }

    if (category) {
      countQuery += ` AND category = $${countParamCount++}`;
      countParams.push(category);
    }

    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      tickets: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get support tickets error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching support tickets' 
    });
  }
});

// Get support ticket by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT st.*, u.name as user_name, u.email as user_email
      FROM support_tickets st
      JOIN users u ON st.user_id = u.id
      WHERE st.id = $1 AND st.user_id = $2`,
      [req.params.id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Support ticket not found' 
      });
    }

    res.json({
      success: true,
      ticket: result.rows[0]
    });
  } catch (error) {
    console.error('Get support ticket error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching support ticket' 
    });
  }
});

// Create support ticket
router.post('/', authenticateToken, [
  body('subject').trim().notEmpty(),
  body('message').trim().notEmpty(),
  body('category').optional().isIn(['general', 'booking', 'payment', 'technical'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { subject, message, category, priority } = req.body;

    const result = await query(
      `INSERT INTO support_tickets (user_id, subject, message, category, priority)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [req.user.userId, subject, message, category || 'general', priority || 'normal']
    );

    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully',
      ticket: result.rows[0]
    });
  } catch (error) {
    console.error('Create support ticket error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating support ticket' 
    });
  }
});

// Admin: Get all support tickets
router.get('/admin/all', authenticateToken, authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status;
    const category = req.query.category;
    const priority = req.query.priority;

    let queryText = `
      SELECT st.*, u.name as user_name, u.email as user_email
      FROM support_tickets st
      JOIN users u ON st.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (status) {
      queryText += ` AND st.status = $${paramCount++}`;
      params.push(status);
    }

    if (category) {
      queryText += ` AND st.category = $${paramCount++}`;
      params.push(category);
    }

    if (priority) {
      queryText += ` AND st.priority = $${paramCount++}`;
      params.push(priority);
    }

    queryText += ` ORDER BY st.priority DESC, st.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM support_tickets WHERE 1=1';
    const countParams = [];
    let countParamCount = 1;

    if (status) {
      countQuery += ` AND status = $${countParamCount++}`;
      countParams.push(status);
    }

    if (category) {
      countQuery += ` AND category = $${countParamCount++}`;
      countParams.push(category);
    }

    if (priority) {
      countQuery += ` AND priority = $${countParamCount++}`;
      countParams.push(priority);
    }

    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      tickets: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all support tickets error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching support tickets' 
    });
  }
});

// Admin: Update support ticket status
router.put('/:id/status', authenticateToken, authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const { status, admin_response } = req.body;

    if (!['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status' 
      });
    }

    const updates = ['status = $1', 'updated_at = CURRENT_TIMESTAMP'];
    const values = [status];
    let paramCount = 2;

    if (admin_response) {
      updates.push(`admin_response = $${paramCount++}`);
      values.push(admin_response);
    }

    if (status === 'resolved' || status === 'closed') {
      updates.push(`resolved_at = $${paramCount++}`);
      values.push(new Date());
    }

    values.push(req.params.id);

    const result = await query(
      `UPDATE support_tickets SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Support ticket not found' 
      });
    }

    res.json({
      success: true,
      message: 'Support ticket updated successfully',
      ticket: result.rows[0]
    });
  } catch (error) {
    console.error('Update support ticket error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating support ticket' 
    });
  }
});

module.exports = router;
