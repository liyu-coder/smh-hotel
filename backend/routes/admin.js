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

    if (search) {
      queryText += ' AND (u.name LIKE ? OR u.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    queryText += ' ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const result = await query(queryText, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM users WHERE 1=1';
    const countParams = [];

    if (search) {
      countQuery += ' AND (name LIKE ? OR email LIKE ?)';
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

    if (is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(is_active);
    }

    if (is_verified !== undefined) {
      updates.push('is_verified = ?');
      params.push(is_verified);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No updates provided'
      });
    }

    params.push(id);
    const queryText = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;

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
    const targetUser = await query('SELECT role FROM users WHERE id = ?', [id]);
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

    await query('UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [role, id]);

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
    const existingUser = await query('SELECT id FROM users WHERE email = ?', [email]);
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
    await query(
      'INSERT INTO users (email, password_hash, name, phone, role, is_verified, is_active) VALUES (?, ?, ?, ?, ?, true, true)',
      [email, passwordHash, name, phone || null, role]
    );

    const userResult = await query('SELECT id, email, name, role, created_at FROM users WHERE email = ?', [email]);
    const user = userResult.rows[0];

    // Create user wallet
    await query('INSERT INTO user_wallets (user_id) VALUES (?)', [user.id]);

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

    console.log('Admin query:', queryText.replace(/\s+/g, ' ').trim());
    console.log('Params:', params);
    
    const result = await query(queryText, params);
    
    console.log('Results:', result.rows.length);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM transactions WHERE 1=1';
    const countParams = [];

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
    const transactionResult = await query('SELECT * FROM transactions WHERE id = ?', [id]);
    
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
    let effectiveTaskLimit = task_limit;
    if (status === 'approved' && transaction.type === 'deposit') {
      // Auto-calculate task limit based on deposit amount if not provided
      let calculatedTaskLimit = task_limit;
      if (!task_limit || Number(task_limit) < 1) {
        const depositAmount = parseFloat(transaction.amount);
        // Classification: $100 = 10 tasks, $200 = 15 tasks, $500 = 20 tasks, $1000+ = 25 tasks
        if (depositAmount < 100) {
          calculatedTaskLimit = 5;
        } else if (depositAmount < 200) {
          calculatedTaskLimit = 10;
        } else if (depositAmount < 500) {
          calculatedTaskLimit = 15;
        } else if (depositAmount < 1000) {
          calculatedTaskLimit = 20;
        } else {
          calculatedTaskLimit = 25;
        }
      }
      
      if (Number(calculatedTaskLimit) < 1 || Number(calculatedTaskLimit) > 25) {
        return res.status(400).json({
          success: false,
          message: 'Task limit must be between 1 and 25'
        });
      }
      effectiveTaskLimit = calculatedTaskLimit;
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

    try {
      // Update transaction status
      const updateFields = ['status = ?', 'processed_at = CURRENT_TIMESTAMP'];
      const updateParams = [status];

      if (status === 'approved' && transaction.type === 'deposit') {
        updateFields.push('task_limit = ?', 'commission_rate = ?', 'approved_at = CURRENT_TIMESTAMP');
        updateParams.push(effectiveTaskLimit, effectivePercent / 100);
      }

      await query(`UPDATE transactions SET ${updateFields.join(', ')} WHERE id = ?`, [...updateParams, id]);

      if (status === 'approved') {
        // Update wallet balance
        if (transaction.type === 'deposit') {
          // Ensure wallet exists first
          console.log('📊 [admin.js] Checking wallet for user_id:', transaction.user_id);
          const walletCheck = await query('SELECT id, available_balance, total_deposited FROM user_wallets WHERE user_id = ?', [transaction.user_id]);
          console.log('📊 [admin.js] Wallet check result:', walletCheck.rows);

          if (walletCheck.rows.length === 0) {
            console.log('📝 [admin.js] Creating new wallet for user_id:', transaction.user_id, 'with amount:', transaction.amount);
            await query('INSERT INTO user_wallets (user_id, available_balance, total_deposited, max_daily_orders) VALUES (?, ?, ?, ?)',
              [parseInt(transaction.user_id), parseFloat(transaction.amount), parseFloat(transaction.amount), effectiveTaskLimit]);
            console.log('✅ [admin.js] Wallet created successfully');
          } else {
            const currentBalance = walletCheck.rows[0].available_balance;
            console.log('📝 [admin.js] Updating existing wallet. Current balance:', currentBalance, 'Adding:', transaction.amount);
            await query(
              'UPDATE user_wallets SET available_balance = available_balance + ?, total_deposited = total_deposited + ?, max_daily_orders = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
              [parseFloat(transaction.amount), parseFloat(transaction.amount), effectiveTaskLimit, parseInt(transaction.user_id)]
            );
            console.log('✅ [admin.js] Wallet updated successfully');

            // Verify the update
            const verifyResult = await query('SELECT available_balance, total_deposited FROM user_wallets WHERE user_id = ?', [transaction.user_id]);
            console.log('📊 [admin.js] Wallet after update:', verifyResult.rows[0]);
          }

          // Create user tasks for this deposit
          const commissionPerTask = (transaction.amount * (effectivePercent / 100)).toFixed(2);
          for (let i = 1; i <= effectiveTaskLimit; i++) {
            await query(
              'INSERT INTO user_tasks (user_id, deposit_id, task_number, commission_amount, status) VALUES (?, ?, ?, ?, ?)',
              [transaction.user_id, id, i, commissionPerTask, 'pending']
            );
          }
        } else if (transaction.type === 'withdrawal') {
          await query(
            'UPDATE user_wallets SET available_balance = available_balance - ?, total_withdrawn = total_withdrawn + ?, pending_amount = pending_amount - ? WHERE user_id = ?',
            [parseFloat(transaction.amount), parseFloat(transaction.amount), parseFloat(transaction.amount), parseInt(transaction.user_id)]
          );
        }
      } else {
        // If rejected, remove from pending
        if (transaction.type === 'withdrawal') {
          await query(
            'UPDATE user_wallets SET pending_amount = pending_amount - ? WHERE user_id = ?',
            [parseFloat(transaction.amount), parseInt(transaction.user_id)]
          );
        }
        // If deposit rejected, delete any created tasks
        if (transaction.type === 'deposit') {
          await query('DELETE FROM user_tasks WHERE deposit_id = ?', [id]);
        }
      }

      res.json({
        success: true,
        message: `Transaction ${status} successfully${status === 'approved' && transaction.type === 'deposit' ? ` with ${effectiveTaskLimit} tasks at ${effectivePercent}% commission` : ''}`
      });
    } catch (error) {
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
    const pendingTransactionsResult = await query('SELECT COUNT(*) FROM transactions WHERE status = ?', ['pending']);
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
       LIMIT ? OFFSET ?`,
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
      'SELECT id FROM countries WHERE name LIKE ?',
      [`%${country}%`]
    );

    if (countryResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Country not found'
      });
    }

    const country_id = countryResult.rows[0].id;

    await query(
      `INSERT INTO hotels (name, description, city, country_id, price_per_night, rating, location, amenities, image_url, is_active, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, true, false)`,
      [name, description, city, country_id, price_per_night, rating, location, amenities, image_url]
    );

    const result = await query('SELECT * FROM hotels WHERE id = LAST_INSERT_ID()');

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
      'SELECT id FROM countries WHERE name LIKE ?',
      [`%${country}%`]
    );

    if (countryResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Country not found'
      });
    }

    const country_id = countryResult.rows[0].id;

    await query(
      `UPDATE hotels
       SET name = ?, description = ?, city = ?, country_id = ?, price_per_night = ?, rating = ?, location = ?, amenities = ?, image_url = ?
       WHERE id = ?`,
      [name, description, city, country_id, price_per_night, rating, location, amenities, image_url, id]
    );

    const result = await query('SELECT * FROM hotels WHERE id = ?', [id]);

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
      'SELECT * FROM hotels WHERE id = ?',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    await query('DELETE FROM hotels WHERE id = ?', [id]);

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

// Set task limit for user
router.patch('/users/:id/task-limit', authenticateToken, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { task_limit, commission_rate } = req.body;

    if (!task_limit || task_limit < 1) {
      return res.status(400).json({
        success: false,
        message: 'Valid task limit is required'
      });
    }

    const result = await query(
      `UPDATE user_wallets 
       SET task_limit = ?, commission_rate = ?, requires_recharge = FALSE, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ?`,
      [task_limit, commission_rate || 0.04, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User wallet not found'
      });
    }

    res.json({
      success: true,
      message: 'Task limit updated successfully',
      data: { task_limit, commission_rate: commission_rate || 0.04 }
    });
  } catch (error) {
    console.error('Set task limit error:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting task limit'
    });
  }
});

// Get user task statistics
router.get('/users/:id/task-stats', authenticateToken, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT 
        u.id, u.name, u.email,
        uw.task_limit, uw.completed_tasks, uw.today_orders, uw.max_daily_orders,
        uw.available_balance, uw.total_deposited, uw.total_spent, uw.requires_recharge,
        uw.commission_rate, uw.recharge_count,
        COUNT(b.id) as total_bookings,
        SUM(b.total_amount) as total_booking_amount
      FROM users u
      LEFT JOIN user_wallets uw ON u.id = uw.user_id
      LEFT JOIN bookings b ON u.id = b.user_id
      WHERE u.id = ?
      GROUP BY u.id, uw.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Get user task stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting user task statistics'
    });
  }
});

// Get system overview statistics
router.get('/system/overview', authenticateToken, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const [
      usersResult,
      bookingsResult,
      transactionsResult,
      walletsResult
    ] = await Promise.all([
      query('SELECT COUNT(*) as total_users, SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active_users FROM users'),
      query('SELECT COUNT(*) as total_bookings, SUM(total_amount) as total_revenue, COUNT(CASE WHEN status = "confirmed" THEN 1 END) as confirmed_bookings FROM bookings'),
      query('SELECT COUNT(*) as total_transactions, SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) as pending_transactions FROM transactions'),
      query(`
        SELECT 
          SUM(available_balance) as total_available_balance,
          SUM(total_deposited) as total_deposited,
          SUM(total_spent) as total_spent,
          SUM(completed_tasks) as total_completed_tasks,
          SUM(task_limit) as total_task_limits,
          COUNT(CASE WHEN requires_recharge = true THEN 1 END) as users_needing_recharge
        FROM user_wallets
      `)
    ]);

    res.json({
      success: true,
      overview: {
        users: usersResult.rows[0],
        bookings: bookingsResult.rows[0],
        transactions: transactionsResult.rows[0],
        wallets: walletsResult.rows[0]
      }
    });
  } catch (error) {
    console.error('Get system overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting system overview'
    });
  }
});

// Get booking activity monitoring
router.get('/monitoring/bookings', authenticateToken, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const status = req.query.status;
    const userId = req.query.user_id;

    let queryText = `
      SELECT 
        b.*, h.name as hotel_name, h.price_per_night,
        u.name as user_name, u.email as user_email,
        uw.task_limit, uw.completed_tasks, uw.requires_recharge
      FROM bookings b
      JOIN hotels h ON b.hotel_id = h.id
      JOIN users u ON b.user_id = u.id
      LEFT JOIN user_wallets uw ON u.id = uw.user_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      queryText += ' AND b.status = ?';
      params.push(status);
    }

    if (userId) {
      queryText += ' AND b.user_id = ?';
      params.push(userId);
    }

    queryText += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const result = await query(queryText, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM bookings b WHERE 1=1';
    const countParams = [];

    if (status) {
      countQuery += ' AND b.status = ?';
      countParams.push(status);
    }

    if (userId) {
      countQuery += ' AND b.user_id = ?';
      countParams.push(userId);
    }

    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      bookings: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get booking monitoring error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting booking monitoring data'
    });
  }
});

// Stop/resume user booking access
router.patch('/users/:id/booking-access', authenticateToken, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'stop' or 'resume'

    if (!['stop', 'resume'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action must be either "stop" or "resume"'
      });
    }

    const updates = action === 'stop' 
      ? { is_locked: true, lock_reason: 'Admin blocked booking access' }
      : { is_locked: false, lock_reason: null, requires_recharge: false };

    const result = await query(
      `UPDATE user_wallets 
       SET is_locked = ?, lock_reason = ?, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ?`,
      [updates.is_locked, updates.lock_reason, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User wallet not found'
      });
    }

    res.json({
      success: true,
      message: `User booking access ${action}d successfully`
    });
  } catch (error) {
    console.error('Update booking access error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating booking access'
    });
  }
});

// Get users requiring recharge
router.get('/users/requiring-recharge', authenticateToken, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        u.id, u.name, u.email, u.created_at,
        uw.task_limit, uw.completed_tasks, uw.available_balance, uw.total_deposited,
        uw.recharge_count, uw.requires_recharge
      FROM users u
      JOIN user_wallets uw ON u.id = uw.user_id
      WHERE uw.requires_recharge = true OR uw.completed_tasks >= uw.task_limit
      ORDER BY uw.updated_at DESC`
    );

    res.json({
      success: true,
      users: result.rows
    });
  } catch (error) {
    console.error('Get users requiring recharge error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting users requiring recharge'
    });
  }
});

module.exports = router;
