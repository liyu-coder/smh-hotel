const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Helper to get all user IDs that are linked via reservations
async function getLinkedUserIds(userId) {
  try {
    const linkedResult = await query(
      `SELECT DISTINCT user_id FROM bookings 
       WHERE linked_booking_id IN (SELECT id FROM bookings WHERE user_id = $1)
       OR id IN (SELECT linked_booking_id FROM bookings WHERE user_id = $1)
       OR user_id = $1`,
      [userId]
    );
    
    if (linkedResult.rows.length === 0) return [userId];
    return linkedResult.rows.map(r => r.user_id);
  } catch (error) {
    console.error('Error getting linked user IDs:', error);
    return [userId];
  }
}

// Get all active reservation plans
router.get('/plans', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM reservation_plans WHERE is_active = true ORDER BY min_amount ASC'
    );

    res.json({
      success: true,
      plans: result.rows
    });
  } catch (error) {
    console.error('Get reservation plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reservation plans'
    });
  }
});

// Get user's current plan based on their total approved deposits
router.get('/my-plan', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    // Get user's total approved deposit amount
    const walletResult = await query(
      'SELECT total_approved FROM user_wallets WHERE user_id = $1',
      [userId]
    );

    const totalApproved = parseFloat(walletResult.rows[0]?.total_approved || 0);

    // Find the appropriate plan
    const planResult = await query(
      `SELECT * FROM reservation_plans 
       WHERE is_active = true 
       AND min_amount <= $1 
       AND max_amount >= $1
       ORDER BY min_amount DESC 
       LIMIT 1`,
      [totalApproved]
    );

    // Get all plans for comparison
    const allPlansResult = await query(
      'SELECT * FROM reservation_plans WHERE is_active = true ORDER BY min_amount ASC'
    );

    res.json({
      success: true,
      currentPlan: planResult.rows[0] || null,
      totalApproved,
      allPlans: allPlansResult.rows,
      canUpgrade: allPlansResult.rows.some(p => p.min_amount > totalApproved)
    });
  } catch (error) {
    console.error('Get my plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching plan information'
    });
  }
});

// Get user's task status
router.get('/tasks', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const userIds = await getLinkedUserIds(userId);

    // Get all pending and completed tasks for all linked users
    const tasksResult = await query(
      `SELECT ut.*, t.amount as deposit_amount, t.created_at as deposit_date, u.name as user_name
       FROM user_tasks ut
       JOIN transactions t ON ut.deposit_id = t.id
       JOIN users u ON ut.user_id = u.id
       WHERE ut.user_id = ANY($1)
       ORDER BY ut.created_at DESC`,
      [userIds]
    );

    // Get summary stats for all linked users
    const statsResult = await query(
      `SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_tasks,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN commission_amount ELSE 0 END), 0) as total_earned
       FROM user_tasks
       WHERE user_id = ANY($1)`,
      [userIds]
    );

    // Get today's completed tasks count for all linked users
    const todayResult = await query(
      `SELECT COUNT(*) as today_completed
       FROM user_tasks
       WHERE user_id = ANY($1) 
       AND status = 'completed'
       AND DATE(completed_at) = CURRENT_DATE`,
      [userIds]
    );

    // Get current user's daily task limit (or max if linked?)
    const walletResult = await query(
      'SELECT max_daily_orders FROM user_wallets WHERE user_id = ANY($1) ORDER BY max_daily_orders DESC LIMIT 1',
      [userIds]
    );

    const dailyLimit = parseInt(String(walletResult.rows[0]?.max_daily_orders ?? 25), 10) || 25;
    const todayCompleted = parseInt(todayResult.rows[0]?.today_completed || 0);

    res.json({
      success: true,
      tasks: tasksResult.rows,
      is_consolidated: userIds.length > 1,
      linked_users_count: userIds.length,
      stats: {
        ...statsResult.rows[0],
        today_completed: todayCompleted,
        daily_limit: dailyLimit,
        remaining_today: Math.max(0, dailyLimit - todayCompleted)
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks'
    });
  }
});

// Complete a task
router.post('/tasks/:id/complete', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const taskId = req.params.id;
    const userIds = await getLinkedUserIds(userId);

    // Check if combined users have reached daily limit
    const todayResult = await query(
      `SELECT COUNT(*) as today_completed
       FROM user_tasks
       WHERE user_id = ANY($1) 
       AND status = 'completed'
       AND DATE(completed_at) = CURRENT_DATE`,
      [userIds]
    );

    const walletResult = await query(
      'SELECT max_daily_orders, available_balance FROM user_wallets WHERE user_id = $1',
      [userId]
    );

    const dailyLimit = parseInt(String(walletResult.rows[0]?.max_daily_orders ?? 25), 10) || 25;
    const todayCompleted = parseInt(todayResult.rows[0]?.today_completed || 0);

    if (todayCompleted >= dailyLimit) {
      return res.status(400).json({
        success: false,
        message: `Consolidated daily task limit reached (${dailyLimit} tasks). Please come back tomorrow.`
      });
    }

    // Get task details (can be any linked user's task)
    const taskResult = await query(
      'SELECT * FROM user_tasks WHERE id = $1 AND user_id = ANY($2)',
      [taskId, userIds]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const task = taskResult.rows[0];

    if (task.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Task already completed or expired'
      });
    }

    // Complete the task and add commission to the task owner's wallet
    await query('BEGIN');

    try {
      // Update task status
      await query(
        `UPDATE user_tasks 
         SET status = 'completed', completed_at = CURRENT_TIMESTAMP 
         WHERE id = $1`,
        [taskId]
      );

      // Add commission to the owner of the task (the user who was linked)
      await query(
        `UPDATE user_wallets 
         SET available_balance = available_balance + $1,
             today_orders = today_orders + 1
         WHERE user_id = $2`,
        [task.commission_amount, task.user_id]
      );

      await query('COMMIT');

      res.json({
        success: true,
        message: 'Task completed successfully',
        earned: task.commission_amount,
        remaining_tasks: dailyLimit - todayCompleted - 1,
        is_consolidated: userIds.length > 1
      });
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing task'
    });
  }
});

// Get user dashboard data (for cash gap and task overview)
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const userIds = await getLinkedUserIds(userId);

    // Get wallet info for current user
    const walletResult = await query(
      'SELECT * FROM user_wallets WHERE user_id = $1',
      [userId]
    );

    const wallet = walletResult.rows[0] || {
      available_balance: 0,
      total_approved: 0,
      today_orders: 0,
      max_daily_orders: 25
    };

    // Get today's stats for all linked users
    const todayTasksResult = await query(
      `SELECT COUNT(*) as completed, COALESCE(SUM(commission_amount), 0) as earned
       FROM user_tasks
       WHERE user_id = ANY($1) 
       AND status = 'completed'
       AND DATE(completed_at) = CURRENT_DATE`,
      [userIds]
    );

    // Get pending tasks count for all linked users
    const pendingResult = await query(
      `SELECT COUNT(*) as pending
       FROM user_tasks
       WHERE user_id = ANY($1) AND status = 'pending'`,
      [userIds]
    );

    const yesterdayResult = await query(
      `SELECT COALESCE(SUM(commission_amount), 0) as earned
       FROM user_tasks
       WHERE user_id = ANY($1) AND status = 'completed' AND DATE(completed_at) = CURRENT_DATE - 1`,
      [userIds]
    );

    // Get current plan based on current user's total approved
    const planResult = await query(
      `SELECT * FROM reservation_plans 
       WHERE is_active = true 
       AND min_amount <= $1 
       AND max_amount >= $1
       ORDER BY min_amount DESC 
       LIMIT 1`,
      [wallet.total_approved || 0]
    );

    const totalApproved = parseFloat(wallet.total_approved || 0);
    const availableBalance = parseFloat(wallet.available_balance || 0);

    // Get all plans for sequential tracking
    const allPlansResult = await query(
      `SELECT * FROM reservation_plans WHERE is_active = true ORDER BY min_amount ASC`
    );
    const allPlans = allPlansResult.rows;

    const planCapResult = await query(
      `SELECT COALESCE(MAX(max_amount), 0)::numeric AS cap FROM reservation_plans WHERE is_active = true`
    );
    const planCap = parseFloat(planCapResult.rows[0]?.cap || 0);
    const planCeilingReached = planCap > 0 && totalApproved >= planCap - 0.01;
    const cashGap = totalApproved - availableBalance;
    const pendingTasks = parseInt(pendingResult.rows[0]?.pending || 0, 10);
    const todayDone = parseInt(todayTasksResult.rows[0]?.completed || 0, 10);
    const dailyCap = parseInt(String(wallet.max_daily_orders ?? 25), 10) || 25;
    let rechargeAmount = Math.round(Math.max(0, totalApproved - availableBalance) * 100) / 100;
    if (planCeilingReached && pendingTasks > 0) {
      rechargeAmount = Math.max(rechargeAmount, 100);
    }
    const requiresRecharge = pendingTasks > 0 && rechargeAmount > 0.01;

    // Calculate plan progress for sequential unlocking
    const currentPlan = planResult.rows[0] || null;
    const currentPlanNumber = currentPlan ? parseInt(currentPlan.name.replace('Plan ', '')) || 1 : 1;
    
    // Get completed tasks count per plan level
    const planTasksResult = await query(
      `SELECT 
        COUNT(CASE WHEN commission_amount >= 0 AND commission_amount < 2 THEN 1 END) as plan1_tasks,
        COUNT(CASE WHEN commission_amount >= 2 AND commission_amount < 5 THEN 1 END) as plan2_tasks,
        COUNT(CASE WHEN commission_amount >= 5 AND commission_amount < 10 THEN 1 END) as plan3_tasks,
        COUNT(CASE WHEN commission_amount >= 10 THEN 1 END) as plan4_tasks
       FROM user_tasks
       WHERE user_id = ANY($1) AND status = 'completed'`,
      [userIds]
    );
    
    const planTasks = planTasksResult.rows[0] || {};
    const plan1Completed = parseInt(planTasks.plan1_tasks || 0) >= 25;
    const plan2Completed = parseInt(planTasks.plan2_tasks || 0) >= 25;
    const plan3Completed = parseInt(planTasks.plan3_tasks || 0) >= 25;
    const plan4Completed = parseInt(planTasks.plan4_tasks || 0) >= 25;

    // Check if previous plan is completed for sequential unlocking
    let prevPlanCompleted = true;
    if (currentPlanNumber > 1) {
      if (currentPlanNumber === 2) prevPlanCompleted = plan1Completed;
      else if (currentPlanNumber === 3) prevPlanCompleted = plan1Completed && plan2Completed;
      else if (currentPlanNumber === 4) prevPlanCompleted = plan1Completed && plan2Completed && plan3Completed;
    }

    res.json({
      success: true,
      dashboard: {
        balance: availableBalance,
        total_approved: totalApproved,
        cash_gap: cashGap,
        today_completed: todayDone,
        today_earned: parseFloat(todayTasksResult.rows[0]?.earned || 0),
        yesterday_commission: parseFloat(yesterdayResult.rows[0]?.earned || 0),
        pending_tasks: pendingTasks,
        daily_limit: dailyCap,
        remaining_today: Math.max(0, dailyCap - todayDone),
        current_plan: currentPlan,
        all_plans: allPlans,
        requires_recharge: requiresRecharge,
        recharge_amount: rechargeAmount,
        commission_multiplier: 1.8,
        plan_ceiling_reached: planCeilingReached,
        highest_plan_cap: planCap,
        is_consolidated: userIds.length > 1,
        linked_users_count: userIds.length,
        prev_plan_completed: prevPlanCompleted,
        plan_progress: {
          plan1_completed: plan1Completed,
          plan2_completed: plan2Completed,
          plan3_completed: plan3Completed,
          plan4_completed: plan4Completed
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data'
    });
  }
});

module.exports = router;
