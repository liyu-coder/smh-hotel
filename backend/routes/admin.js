const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateToken, authorize } = require('../middleware/auth');

// Get all users (admin only)
router.get('/users', authenticateToken, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    let queryText = `
      SELECT u.id, u.email, u.name, u.phone, u.role, u.is_active, u.is_verified, u.created_at,
        uw.available_balance, uw.pending_amount, uw.total_approved, uw.max_daily_orders, uw.today_orders,
        uw.tasks_completed, uw.is_locked
      FROM users u
      LEFT JOIN user_wallets uw ON u.id = uw.user_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (search) {
      queryText += ` AND (u.name ILIKE $${paramCount++} OR u.email ILIKE $${paramCount++})`;
      params.push(`%${search}%`, `%${search}%`);
    }

    queryText += ` ORDER BY u.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM users WHERE 1=1';
    const countParams = [];
    let countParamCount = 1;

    if (search) {
      countQuery += ` AND (name ILIKE $${countParamCount++} OR email ILIKE $${countParamCount++})`;
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      users: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

// Update user status (admin only)
router.patch('/users/:id/status', authenticateToken, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active, is_verified } = req.body;

    const updates = [];
    const params = [];
    let paramCount = 1;

    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      params.push(is_active);
    }

    if (is_verified !== undefined) {
      updates.push(`is_verified = $${paramCount++}`);
      params.push(is_verified);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No updates provided'
      });
    }

    params.push(id);
    const queryText = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount++}`;

    await query(queryText, params);

    res.json({
      success: true,
      message: 'User status updated successfully'
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user status: ' + error.message
    });
  }
});

// Valid roles hierarchy (super_admin can assign any, admin can assign user/moderator/support)
const VALID_ROLES = ['user', 'moderator', 'support', 'admin', 'super_admin'];
const ROLE_HIERARCHY = {
  'super_admin': 5,
  'admin': 4,
  'support': 3,
  'moderator': 2,
  'user': 1
};

// Helper: Check if current user can assign target role
function canAssignRole(currentRole, targetRole) {
  const currentLevel = ROLE_HIERARCHY[currentRole] || 0;
  const targetLevel = ROLE_HIERARCHY[targetRole] || 0;
  // Can only assign roles BELOW your own level
  return currentLevel > targetLevel;
}

// Update user role (admin can update lower roles, super_admin can update any)
router.patch('/users/:id/role', authenticateToken, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const currentUserRole = req.user.role;

    // Validate role
    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Valid roles: ${VALID_ROLES.join(', ')}`
      });
    }

    // Check permissions based on hierarchy
    if (!canAssignRole(currentUserRole, role)) {
      return res.status(403).json({
        success: false,
        message: `You cannot assign ${role} role. You can only assign roles below your level.`
      });
    }

    // Prevent changing own role (safety measure)
    const targetUser = await query('SELECT role FROM users WHERE id = $1', [id]);
    if (targetUser.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent demoting a higher/equal role user
    const targetCurrentRole = targetUser.rows[0].role;
    if (ROLE_HIERARCHY[targetCurrentRole] >= ROLE_HIERARCHY[currentUserRole]) {
      return res.status(403).json({
        success: false,
        message: 'Cannot modify role of user with equal or higher privileges'
      });
    }

    await query('UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [role, id]);

    res.json({
      success: true,
      message: `User role updated to ${role} successfully`
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user role'
    });
  }
});

// Create new admin user (super_admin only)
router.post('/create-admin', authenticateToken, authorize(['super_admin']), async (req, res) => {
  try {
    const { email, password, name, phone, role = 'admin' } = req.body;

    // Validate required fields
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and name are required'
      });
    }

    // Validate role (super_admin can create admin, moderator, support)
    if (!['admin', 'moderator', 'support'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Can only create admin, moderator, or support roles'
      });
    }

    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user with is_verified = true (since admin created them)
    const result = await query(
      'INSERT INTO users (email, password_hash, name, phone, role, is_verified, is_active) VALUES ($1, $2, $3, $4, $5, true, true) RETURNING id, email, name, role, created_at',
      [email, passwordHash, name, phone || null, role]
    );

    const user = result.rows[0];

    // Create user wallet
    await query('INSERT INTO user_wallets (user_id) VALUES ($1)', [user.id]);

    res.status(201).json({
      success: true,
      message: `${role} account created successfully`,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating admin user'
    });
  }
});

// Get role statistics (super_admin only)
router.get('/role-stats', authenticateToken, authorize(['super_admin']), async (req, res) => {
  try {
    const result = await query(
      'SELECT role, COUNT(*) as count FROM users GROUP BY role ORDER BY count DESC'
    );

    const stats = {};
    VALID_ROLES.forEach(r => stats[r] = 0);
    result.rows.forEach(row => {
      stats[row.role] = parseInt(row.count);
    });

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get role stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching role statistics'
    });
  }
});

// Get all transactions (admin only)
router.get('/transactions', authenticateToken, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const type = req.query.type; // 'deposit' or 'withdrawal'
    const status = req.query.status; // 'pending', 'approved', 'rejected', 'completed'

    let queryText = `
      SELECT t.*, u.name as user_name, u.email as user_email
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (type) {
      queryText += ` AND t.type = $${paramCount++}`;
      params.push(type);
    }

    if (status) {
      queryText += ` AND t.status = $${paramCount++}`;
      params.push(status);
    }

    queryText += ` ORDER BY t.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(limit, offset);

    console.log('Admin query:', queryText.replace(/\s+/g, ' ').trim());
    console.log('Params:', params);
    
    const result = await query(queryText, params);
    
    console.log('Results:', result.rows.length);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM transactions WHERE 1=1';
    const countParams = [];
    let countParamCount = 1;

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

// Approve/Reject transaction (admin only)
router.patch('/transactions/:id/status', authenticateToken, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, task_limit, percent } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Get transaction details
    const transactionResult = await query('SELECT * FROM transactions WHERE id = $1', [id]);
    
    if (transactionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    const transaction = transactionResult.rows[0];

    // If transaction is already processed, return error
    if (transaction.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Transaction has already been processed'
      });
    }

    let effectivePercent = percent;
    if (status === 'approved' && transaction.type === 'deposit') {
      if (!task_limit || Number(task_limit) < 1) {
        return res.status(400).json({
          success: false,
          message: 'Task limit is required for deposit approval'
        });
      }
      if (Number(task_limit) < 1 || Number(task_limit) > 100) {
        return res.status(400).json({
          success: false,
          message: 'Task limit must be between 1 and 100'
        });
      }
      const pct =
        percent !== undefined && percent !== null && String(percent).trim() !== ''
          ? parseFloat(percent)
          : 4;
      if (Number.isNaN(pct) || pct <= 0 || pct > 100) {
        return res.status(400).json({
          success: false,
          message: 'Percent must be between 0.01 and 100'
        });
      }
      effectivePercent = pct;
    }

    await query('BEGIN');

    try {
      // Update transaction status
      await query('UPDATE transactions SET status = $1, processed_at = CURRENT_TIMESTAMP WHERE id = $2', [status, id]);

      if (status === 'approved') {
        // Update wallet balance
        if (transaction.type === 'deposit') {
          // Ensure wallet exists first
          const walletCheck = await query('SELECT id FROM user_wallets WHERE user_id = $1', [transaction.user_id]);
          if (walletCheck.rows.length === 0) {
            await query('INSERT INTO user_wallets (user_id, available_balance, total_approved) VALUES ($1, $2, $2)', 
              [transaction.user_id, transaction.amount]);
          } else {
            await query(
              'UPDATE user_wallets SET available_balance = available_balance + $1, total_approved = total_approved + $1 WHERE user_id = $2',
              [transaction.amount, transaction.user_id]
            );
          }

          // Create user tasks for this deposit
          const commissionPerTask = (transaction.amount * (effectivePercent / 100)).toFixed(2);
          for (let i = 1; i <= task_limit; i++) {
            await query(
              'INSERT INTO user_tasks (user_id, deposit_id, task_number, commission_amount, status) VALUES ($1, $2, $3, $4, $5)',
              [transaction.user_id, id, i, commissionPerTask, 'pending']
            );
          }
        } else if (transaction.type === 'withdrawal') {
          await query(
            'UPDATE user_wallets SET available_balance = available_balance - $1, total_withdrawn = total_withdrawn + $1, pending_amount = pending_amount - $1 WHERE user_id = $2',
            [transaction.amount, transaction.user_id]
          );
        }
      } else {
        // If rejected, remove from pending
        if (transaction.type === 'withdrawal') {
          await query(
            'UPDATE user_wallets SET pending_amount = pending_amount - $1 WHERE user_id = $2',
            [transaction.amount, transaction.user_id]
          );
        }
        // If deposit rejected, delete any created tasks
        if (transaction.type === 'deposit') {
          await query('DELETE FROM user_tasks WHERE deposit_id = $1', [id]);
        }
      }

      await query('COMMIT');

      res.json({
        success: true,
        message: `Transaction ${status} successfully${status === 'approved' && transaction.type === 'deposit' ? ` with ${task_limit} tasks at ${effectivePercent}% commission` : ''}`
      });
    } catch (error) {
      await query('ROLLBACK');
      console.error('Transaction error:', error.message);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      throw error;
    }
  } catch (error) {
    console.error('Update transaction status error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error updating transaction status: ' + (error.message || 'Unknown error'),
      error: error.message
    });
  }
});

// Get dashboard statistics (admin only)
router.get('/stats', authenticateToken, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    // Get user stats
    const userCountResult = await query('SELECT COUNT(*) FROM users');
    const activeUserCountResult = await query('SELECT COUNT(*) FROM users WHERE is_active = true');
    const verifiedUserCountResult = await query('SELECT COUNT(*) FROM users WHERE is_verified = true');

    // Get transaction stats
    const totalBalanceResult = await query('SELECT SUM(available_balance) FROM user_wallets');
    const pendingTransactionsResult = await query('SELECT COUNT(*) FROM transactions WHERE status = $1', ['pending']);
    const todayDepositsResult = await query(`
      SELECT COALESCE(SUM(amount), 0) FROM transactions 
      WHERE type = 'deposit' AND status = 'approved' 
      AND DATE(created_at) = CURRENT_DATE
    `);

    // Get cash gap stats (total deposited vs total withdrawn)
    const totalDepositedResult = await query(`
      SELECT COALESCE(SUM(amount), 0) FROM transactions 
      WHERE type = 'deposit' AND status = 'approved'
    `);
    const totalWithdrawnResult = await query(`
      SELECT COALESCE(SUM(amount), 0) FROM transactions 
      WHERE type = 'withdrawal' AND status = 'approved'
    `);

    res.json({
      success: true,
      stats: {
        totalUsers: parseInt(userCountResult.rows[0].count),
        activeUsers: parseInt(activeUserCountResult.rows[0].count),
        verifiedUsers: parseInt(verifiedUserCountResult.rows[0].count),
        totalBalance: parseFloat(totalBalanceResult.rows[0].sum || 0),
        pendingTransactions: parseInt(pendingTransactionsResult.rows[0].count),
        todayDeposits: parseFloat(todayDepositsResult.rows[0].sum || 0),
        totalDeposited: parseFloat(totalDepositedResult.rows[0].sum || 0),
        totalWithdrawn: parseFloat(totalWithdrawnResult.rows[0].sum || 0)
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
});

// Get team members (referral commissions report)
router.get('/team-members', authenticateToken, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT tm.*, u.name as user_name, u.email as user_email
       FROM team_members tm
       JOIN users u ON tm.user_id = u.id
       ORDER BY tm.total_earnings DESC, tm.total_referrals DESC, tm.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await query('SELECT COUNT(*) FROM team_members');
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      teamMembers: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching team members'
    });
  }
});

// Hotel Management Routes (admin only)
router.post('/hotels', authenticateToken, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { name, description, city, country, price_per_night, rating, location, amenities, image_url } = req.body;

    // Get country_id from country name
    const countryResult = await query(
      'SELECT id FROM countries WHERE name ILIKE $1',
      [`%${country}%`]
    );

    if (countryResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Country not found'
      });
    }

    const country_id = countryResult.rows[0].id;

    const result = await query(
      `INSERT INTO hotels (name, description, city, country_id, price_per_night, rating, location, amenities, image_url, is_active, is_featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, false)
       RETURNING *`,
      [name, description, city, country_id, price_per_night, rating, location, amenities, image_url]
    );

    res.json({
      success: true,
      hotel: result.rows[0]
    });
  } catch (error) {
    console.error('Create hotel error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating hotel'
    });
  }
});

router.put('/hotels/:id', authenticateToken, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, city, country, price_per_night, rating, location, amenities, image_url } = req.body;

    // Get country_id from country name
    const countryResult = await query(
      'SELECT id FROM countries WHERE name ILIKE $1',
      [`%${country}%`]
    );

    if (countryResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Country not found'
      });
    }

    const country_id = countryResult.rows[0].id;

    const result = await query(
      `UPDATE hotels
       SET name = $1, description = $2, city = $3, country_id = $4, price_per_night = $5, rating = $6, location = $7, amenities = $8, image_url = $9
       WHERE id = $10
       RETURNING *`,
      [name, description, city, country_id, price_per_night, rating, location, amenities, image_url, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    res.json({
      success: true,
      hotel: result.rows[0]
    });
  } catch (error) {
    console.error('Update hotel error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating hotel'
    });
  }
});

router.delete('/hotels/:id', authenticateToken, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM hotels WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    res.json({
      success: true,
      message: 'Hotel deleted successfully'
    });
  } catch (error) {
    console.error('Delete hotel error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting hotel'
    });
  }
});

module.exports = router;
