const express = require('express');
const router = express.Router();
const { query, getClient } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Get team member data for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT tm.*, u.name, u.email, u.avatar_url,
        (SELECT name FROM users WHERE id = tm.referred_by) as referred_by_name
      FROM team_members tm
      JOIN users u ON tm.user_id = u.id
      WHERE tm.user_id = $1`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      // Create team member if doesn't exist
      const referralCode = 'SMH' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
      const createResult = await query(
        'INSERT INTO team_members (user_id, referral_code) VALUES ($1, $2) RETURNING *',
        [req.user.userId, referralCode]
      );
      return res.json({
        success: true,
        teamMember: createResult.rows[0]
      });
    }

    res.json({
      success: true,
      teamMember: result.rows[0]
    });
  } catch (error) {
    console.error('Get team member error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching team member data' 
    });
  }
});

// Get team referrals list
router.get('/referrals', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT tm.*, u.name, u.email, u.avatar_url, u.created_at as joined_date
      FROM team_members tm
      JOIN users u ON tm.user_id = u.id
      WHERE tm.referred_by = (SELECT id FROM team_members WHERE user_id = $1)
      ORDER BY tm.created_at DESC
      LIMIT $2 OFFSET $3`,
      [req.user.userId, limit, offset]
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as count
      FROM team_members tm
      WHERE tm.referred_by = (SELECT id FROM team_members WHERE user_id = $1)`,
      [req.user.userId]
    );

    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      referrals: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get referrals error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching referrals' 
    });
  }
});

// Join team using referral code
router.post('/join', authenticateToken, [
  body('referral_code').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { referral_code } = req.body;

    // Find referrer
    const referrerResult = await query(
      'SELECT id, user_id FROM team_members WHERE referral_code = $1',
      [referral_code]
    );

    if (referrerResult.rows.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid referral code' 
      });
    }

    const referrer = referrerResult.rows[0];

    // Check if user is already in team
    const existingMember = await query(
      'SELECT id FROM team_members WHERE user_id = $1',
      [req.user.userId]
    );

    if (existingMember.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'You are already a team member' 
      });
    }

    // Create team member with referrer
    const newReferralCode = 'SMH' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
    const result = await query(
      'INSERT INTO team_members (user_id, referral_code, referred_by) VALUES ($1, $2, $3) RETURNING *',
      [req.user.userId, newReferralCode, referrer.id]
    );

    // Update referrer's referral count
    await query(
      'UPDATE team_members SET total_referrals = total_referrals + 1, active_referrals = active_referrals + 1 WHERE id = $1',
      [referrer.id]
    );

    res.status(201).json({
      success: true,
      message: 'Successfully joined team',
      teamMember: result.rows[0]
    });
  } catch (error) {
    console.error('Join team error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error joining team' 
    });
  }
});

// Get team statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const teamResult = await query(
      'SELECT * FROM team_members WHERE user_id = $1',
      [req.user.userId]
    );

    if (teamResult.rows.length === 0) {
      return res.json({
        success: true,
        stats: {
          totalReferrals: 0,
          activeReferrals: 0,
          totalEarnings: 0,
          referralCode: null
        }
      });
    }

    const teamMember = teamResult.rows[0];

    res.json({
      success: true,
      stats: {
        totalReferrals: teamMember.total_referrals,
        activeReferrals: teamMember.active_referrals,
        totalEarnings: teamMember.total_earnings,
        referralCode: teamMember.referral_code,
        level: teamMember.level,
        commissionRate: teamMember.commission_rate
      }
    });
  } catch (error) {
    console.error('Get team stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching team statistics' 
    });
  }
});

module.exports = router;
