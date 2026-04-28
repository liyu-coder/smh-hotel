const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all hotels
router.get('/hotels', async (req, res) => {
  try {
    const result = await query('SELECT * FROM hotels ORDER BY level, name');
    // Map database field names to frontend expected names
    const hotels = result.rows.map(hotel => ({
      ...hotel,
      price: parseFloat(hotel.price_per_night),
      image: hotel.image_url,
      featured: hotel.is_active,
      amenities: typeof hotel.amenities === 'string' ? JSON.parse(hotel.amenities) : hotel.amenities
    }));
    res.json({
      success: true,
      hotels
    });
  } catch (error) {
    console.error('Get hotels error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching hotels'
    });
  }
});

// Delete Ethiopian hotels
router.delete('/hotels/ethiopian', async (req, res) => {
  try {
    await query("DELETE FROM hotels WHERE country = 'Ethiopia'");
    res.json({
      success: true,
      message: 'Ethiopian hotels deleted'
    });
  } catch (error) {
    console.error('Delete Ethiopian hotels error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting Ethiopian hotels'
    });
  }
});

// Helper to build IN clause placeholders for MySQL
function buildInClause(array) {
  if (!array || array.length === 0) return 'IN (NULL)';
  const placeholders = array.map(() => '?').join(',');
  return `IN (${placeholders})`;
}

// Helper to get all user IDs that are linked via reservations
async function getLinkedUserIds(userId) {
  try {
    const linkedResult = await query(
      `SELECT DISTINCT user_id FROM bookings 
       WHERE linked_booking_id IN (SELECT id FROM bookings WHERE user_id = ?)
       OR id IN (SELECT linked_booking_id FROM bookings WHERE user_id = ?)
       OR user_id = ?`,
      [userId, userId, userId]
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
      'SELECT total_approved FROM user_wallets WHERE user_id = ?',
      [userId]
    );

    const totalApproved = parseFloat(walletResult.rows[0]?.total_approved || 0);

    // Find the appropriate plan
    const planResult = await query(
      `SELECT * FROM reservation_plans 
       WHERE is_active = true 
       AND min_amount <= ? 
       AND max_amount >= ?
       ORDER BY min_amount DESC 
       LIMIT 1`,
      [totalApproved, totalApproved]
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
       WHERE ut.user_id ${buildInClause(userIds)}
       ORDER BY ut.created_at DESC`,
      [...userIds]
    );

    // Get summary stats for all linked users
    const statsResult = await query(
      `SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_tasks,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN commission_amount ELSE 0 END), 0) as total_earned
       FROM user_tasks
       WHERE user_id ${buildInClause(userIds)}`,
      [...userIds]
    );

    // Get today's completed tasks count for all linked users
    const todayResult = await query(
      `SELECT COUNT(*) as today_completed
       FROM user_tasks
       WHERE user_id ${buildInClause(userIds)} 
       AND status = 'completed'
       AND DATE(completed_at) = CURRENT_DATE`,
      [...userIds]
    );

    // Get current user's daily task limit (or max if linked?)
    const walletResult = await query(
      `SELECT max_daily_orders FROM user_wallets WHERE user_id ${buildInClause(userIds)} ORDER BY max_daily_orders DESC LIMIT 1`,
      [...userIds]
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
       WHERE user_id ${buildInClause(userIds)} 
       AND status = 'completed'
       AND DATE(completed_at) = CURRENT_DATE`,
      [...userIds]
    );

    const walletResult = await query(
      'SELECT max_daily_orders, available_balance FROM user_wallets WHERE user_id = ?',
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
      `SELECT * FROM user_tasks WHERE id = ? AND user_id ${buildInClause(userIds)}`,
      [taskId, ...userIds]
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
    // Update task status
    await query(
      `UPDATE user_tasks 
       SET status = 'completed', completed_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [taskId]
    );

    // Add commission to the owner of the task (the user who was linked)
    await query(
      `UPDATE user_wallets 
       SET available_balance = available_balance + ?,
           today_orders = today_orders + 1,
           total_profit = total_profit + ?,
           frozen_balance = frozen_balance - ?
       WHERE user_id = ?`,
      [task.commission_amount, task.commission_amount, task.commission_amount, task.user_id]
    );

    res.json({
      success: true,
      message: 'Task completed successfully',
      earned: task.commission_amount,
      remaining_tasks: dailyLimit - todayCompleted - 1,
      is_consolidated: userIds.length > 1
    });
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
      'SELECT * FROM user_wallets WHERE user_id = ?',
      [userId]
    );

    const wallet = walletResult.rows[0] || {
      available_balance: 0,
      total_approved: 0,
      today_orders: 0,
      max_daily_orders: 25,
      frozen_balance: 0,
      total_profit: 0
    };

    // Get today's stats for all linked users
    const todayTasksResult = await query(
      `SELECT COUNT(*) as completed, COALESCE(SUM(commission_amount), 0) as earned
       FROM user_tasks
       WHERE user_id ${buildInClause(userIds)} 
       AND status = 'completed'
       AND DATE(completed_at) = CURRENT_DATE`,
      [...userIds]
    );

    // Get pending tasks count for all linked users
    const pendingResult = await query(
      `SELECT COUNT(*) as pending
       FROM user_tasks
       WHERE user_id ${buildInClause(userIds)} AND status = 'pending'`,
      [...userIds]
    );

    const yesterdayResult = await query(
      `SELECT COALESCE(SUM(commission_amount), 0) as earned
       FROM user_tasks
       WHERE user_id ${buildInClause(userIds)} AND status = 'completed' AND DATE(completed_at) = CURRENT_DATE - 1`,
      [...userIds]
    );

    // Get current plan based on current user's total approved
    const planResult = await query(
      `SELECT * FROM reservation_plans 
       WHERE is_active = true 
       AND min_amount <= ? 
       AND max_amount >= ?
       ORDER BY min_amount DESC 
       LIMIT 1`,
      [wallet.total_approved || 0, wallet.total_approved || 0]
    );

    const totalApproved = parseFloat(wallet.total_approved || 0);
    const availableBalance = parseFloat(wallet.available_balance || 0);
    const frozenBalance = parseFloat(wallet.frozen_balance || 0);
    const totalProfit = parseFloat(wallet.total_profit || 0);

    // Get all plans for sequential tracking
    const allPlansResult = await query(
      `SELECT * FROM reservation_plans WHERE is_active = true ORDER BY min_amount ASC`
    );
    const allPlans = allPlansResult.rows;

    const planCapResult = await query(
      `SELECT CAST(COALESCE(MAX(max_amount), 0) AS DECIMAL(10,2)) AS cap FROM reservation_plans WHERE is_active = true`
    );
    const planCap = parseFloat(planCapResult.rows[0]?.cap || 0);
    const planCeilingReached = planCap > 0 && totalApproved >= planCap - 0.01;
    
    // Cash gap: difference between total approved deposits and available balance (frozen/locked funds)
    const cashGap = Math.max(0, totalApproved - availableBalance);
    const pendingTasks = parseInt(pendingResult.rows[0]?.pending || 0, 10);
    const todayDone = parseInt(todayTasksResult.rows[0]?.completed || 0, 10);
    const dailyCap = parseInt(String(wallet.max_daily_orders ?? 25), 10) || 25;

    // Check if task limit is reached - block reservations until deposit is approved
    const totalCompletedTasks = parseInt(String(wallet.total_completed_tasks || 0), 10);
    const taskLimit = parseInt(String(wallet.max_daily_orders || 0), 10);
    const taskLimitReached = taskLimit > 0 && totalCompletedTasks >= taskLimit;

    console.log('📊 Task limit check:', { totalCompletedTasks, taskLimit, taskLimitReached });
    console.log('💰 Cash gap analysis:', { totalApproved, availableBalance, cashGap, frozenBalance });

    // Calculate recharge amount based on cash gap and task limit requirements
    let rechargeAmount = 0;
    let requiresRecharge = false;

    // Calculate remaining tasks in current task limit
    const remainingTasks = Math.max(0, taskLimit - totalCompletedTasks);
    const tasksRemainingInDaily = Math.max(0, dailyCap - todayDone);

    console.log('📊 Task status:', { totalCompletedTasks, taskLimit, remainingTasks, todayDone, tasksRemainingInDaily });

    if (taskLimitReached) {
      console.log('⚠️ Task limit reached, calculating recharge amount...');

      // Get the next plan's minimum amount
      const nextPlanResult = await query(
        `SELECT min_amount FROM reservation_plans
         WHERE is_active = true
         AND min_amount > ?
         ORDER BY min_amount ASC
         LIMIT 1`,
        [totalApproved]
      );
      const nextPlanMin = parseFloat(nextPlanResult.rows[0]?.min_amount || 0);
      let additionalNeeded = nextPlanMin - totalApproved;

      console.log('📊 Plan calculation:', { totalApproved, nextPlanMin, additionalNeeded });

      // If no next plan exists (user at highest tier), use cash gap based calculation
      if (nextPlanMin === 0 || additionalNeeded <= 0) {
        // Use cash gap + minimum buffer for additional bookings
        additionalNeeded = Math.max(cashGap, 100);
        console.log('📊 Using cash gap + buffer:', additionalNeeded);
      }

      // Calculate amount needed to finish remaining tasks
      // Formula: remainingTasks × $20 (minimum per task buffer)
      const amountToFinishTasks = Math.max(remainingTasks * 20, 50);
      
      // Use the HIGHER of: next plan minimum OR amount needed to finish tasks
      const finalRechargeAmount = Math.max(additionalNeeded, amountToFinishTasks);
      
      // Ensure recharge amount is never zero when task limit is reached
      rechargeAmount = Math.round(Math.max(finalRechargeAmount, 50) * 100) / 100; // Minimum $50
      requiresRecharge = true;
      console.log('✅ Recharge amount set:', rechargeAmount, '(remaining tasks:', remainingTasks, ')');
    } else if (planCeilingReached && pendingTasks > 0) {
      // If plan ceiling reached with pending tasks, use cash gap based calculation
      rechargeAmount = Math.round(Math.max(cashGap, 100) * 100) / 100;
      requiresRecharge = true;
      console.log('📊 Plan ceiling reached, recharge amount based on cash gap:', rechargeAmount);
    } else if (frozenBalance > 0 || cashGap > 0) {
      // If there are frozen funds or cash gap, recommend recharge to unlock more liquidity
      rechargeAmount = Math.round(Math.max(cashGap, frozenBalance) * 100) / 100;
      requiresRecharge = true;
      console.log('📊 Frozen funds detected, recharge amount based on cash gap:', rechargeAmount);
    } else if (remainingTasks <= 5 && taskLimit > 0) {
      // If user has 5 or fewer tasks remaining, show recharge amount to complete task limit
      // Calculate amount needed to reach next plan or minimum $100
      const nextPlanResult = await query(
        `SELECT min_amount FROM reservation_plans
         WHERE is_active = true
         AND min_amount > ?
         ORDER BY min_amount ASC
         LIMIT 1`,
        [totalApproved]
      );
      const nextPlanMin = parseFloat(nextPlanResult.rows[0]?.min_amount || 0);
      
      if (nextPlanMin > 0) {
        rechargeAmount = Math.round(Math.max(nextPlanMin - totalApproved, 50) * 100) / 100;
      } else {
        rechargeAmount = Math.round(Math.max(100, 50) * 100) / 100; // Default to $100 if no next plan
      }
      requiresRecharge = true;
      console.log('📊 Low tasks remaining, recharge amount:', rechargeAmount);
    } else {
      // No recharge needed
      rechargeAmount = 0;
      requiresRecharge = false;
      console.log('📊 No recharge needed');
    }

    // requiresRecharge is true if task limit is reached OR if there are pending tasks with recharge amount OR significant cash gap
    requiresRecharge = taskLimitReached || (pendingTasks > 0 && rechargeAmount > 0.01) || (cashGap > 10);

    // Ensure recharge amount is NEVER zero when task limit is reached or recharge is required
    if ((requiresRecharge || taskLimitReached) && rechargeAmount <= 0.01) {
      // Calculate based on next plan minimum OR use default minimum
      const nextPlanResult = await query(
        `SELECT min_amount FROM reservation_plans
         WHERE is_active = true
         AND min_amount > ?
         ORDER BY min_amount ASC
         LIMIT 1`,
        [totalApproved]
      );
      const nextPlanMin = parseFloat(nextPlanResult.rows[0]?.min_amount || 0);
      
      if (nextPlanMin > 0) {
        rechargeAmount = Math.round(Math.max(nextPlanMin - totalApproved, 50) * 100) / 100;
      } else {
        // Default recharge amount if no next plan (user at highest tier)
        rechargeAmount = Math.max(100, Math.round(cashGap * 100) / 100, 50);
      }
      
      // Ensure minimum $50 recharge amount
      rechargeAmount = Math.max(rechargeAmount, 50);
      requiresRecharge = true;
      console.log('📊 Setting minimum recharge amount (final fallback):', rechargeAmount);
    }

    // Final safety check - ensure recharge amount is never 0 when requiresRecharge is true
    if (requiresRecharge && rechargeAmount <= 0) {
      rechargeAmount = 100; // Absolute minimum default
      console.log('📊 Absolute minimum recharge amount set:', rechargeAmount);
    }

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
       WHERE user_id ${buildInClause(userIds)} AND status = 'completed'`,
      [...userIds]
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
        frozen_balance: frozenBalance,
        total_profit: totalProfit,
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

// Upgrade to next plan
router.post('/upgrade-plan', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    // Get current wallet data
    const walletResult = await query(
      'SELECT * FROM user_wallets WHERE user_id = ?',
      [userId]
    );

    if (walletResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    const wallet = walletResult.rows[0];
    const currentPlan = parseInt(wallet.current_plan || 1);
    const planTasksCompleted = parseInt(wallet.plan_tasks_completed || 0);

    // Check if user has completed current plan (25 tasks)
    if (planTasksCompleted < 25) {
      return res.status(400).json({
        success: false,
        message: 'You must complete 25 tasks in your current plan before upgrading'
      });
    }

    // Upgrade to next plan
    let updateFields = [];
    let nextPlan = currentPlan;

    if (currentPlan === 1 && !wallet.plan_1_completed) {
      updateFields.push('current_plan = 2', 'plan_1_completed = TRUE', 'plan_tasks_completed = 0', 'today_orders = 0');
      nextPlan = 2;
    } else if (currentPlan === 2 && !wallet.plan_2_completed) {
      updateFields.push('current_plan = 3', 'plan_2_completed = TRUE', 'plan_tasks_completed = 0', 'today_orders = 0');
      nextPlan = 3;
    } else if (currentPlan === 3 && !wallet.plan_3_completed) {
      updateFields.push('current_plan = 4', 'plan_3_completed = TRUE', 'plan_tasks_completed = 0', 'today_orders = 0');
      nextPlan = 4;
    } else if (currentPlan === 4 && !wallet.plan_4_completed) {
      updateFields.push('plan_4_completed = TRUE', 'today_orders = 0');
    } else {
      return res.status(400).json({
        success: false,
        message: 'No further plan upgrade available'
      });
    }

    await query(
      `UPDATE user_wallets SET ${updateFields.join(', ')} WHERE user_id = ?`,
      [userId]
    );

    res.json({
      success: true,
      message: `Successfully upgraded to Plan ${nextPlan}`,
      currentPlan: nextPlan
    });
  } catch (error) {
    console.error('Plan upgrade error:', error);
    res.status(500).json({
      success: false,
      message: 'Error upgrading plan'
    });
  }
});

// Complete a booking
router.post('/booking', authenticateToken, async (req, res) => {
  const client = await require('../config/database').pool.getConnection();
  
  try {
    const userId = req.user.userId || req.user.id;
    const { hotelPrice, hotelId, commission } = req.body;

    if (!hotelPrice || !hotelId) {
      return res.status(400).json({
        success: false,
        message: 'Hotel price and ID are required'
      });
    }

    await client.query('START TRANSACTION');

    // Get wallet with lock
    const walletResult = await client.query(
      'SELECT * FROM user_wallets WHERE user_id = ? FOR UPDATE',
      [userId]
    );

    console.log('📊 Wallet result:', walletResult);

    // MySQL client returns [rows, metadata] in transaction mode
    const walletRows = Array.isArray(walletResult) ? walletResult[0] : walletResult.rows;
    
    if (!walletRows || walletRows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    const wallet = walletRows[0];

    // Check sufficient balance
    if (parseFloat(wallet.available_balance) < parseFloat(hotelPrice)) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    // Check if task limit is reached
    const totalCompletedTasks = parseInt(String(wallet.total_completed_tasks || 0), 10);
    const taskLimit = parseInt(String(wallet.max_daily_orders || 0), 10);
    const taskLimitReached = taskLimit > 0 && totalCompletedTasks >= taskLimit;

    if (taskLimitReached) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Task limit reached. Please make an additional deposit to continue booking.',
        requiresRecharge: true
      });
    }

    // Get current completed tasks count for task_number
    const taskCountResult = await client.query(
      `SELECT COUNT(*) as count FROM user_tasks 
       WHERE user_id = ? AND status = 'completed'`,
      [userId]
    );
    const taskCountRows = Array.isArray(taskCountResult) ? taskCountResult[0] : taskCountResult.rows;
    const currentTaskCount = parseInt(taskCountRows?.[0]?.count) || 0;
    const newTaskNumber = currentTaskCount + 1;
    console.log('📊 Current task count:', currentTaskCount, 'New task number:', newTaskNumber);

    // Update wallet (deduct hotel price, add commission back, update plan data)
    const newPlanTasksCompleted = parseInt(wallet.plan_tasks_completed || 0) + 1;

    // Update wallet without automatic plan upgrade
    await client.query(
      `UPDATE user_wallets
       SET available_balance = available_balance - ? + ?,
           frozen_balance = frozen_balance - ?,
           today_orders = today_orders + 1,
           completed_tasks = completed_tasks + 1,
           total_profit = total_profit + ?,
           plan_tasks_completed = plan_tasks_completed + 1
       WHERE user_id = ?`,
      [hotelPrice, commission || 0, hotelPrice, commission || 0, userId]
    );

    // Create booking record
    const bookingResult = await client.query(
      `INSERT INTO bookings (user_id, hotel_id, status, total_amount, commission_amount)
       VALUES (?, ?, 'confirmed', ?, ?)`,
      [userId, hotelId, hotelPrice, commission || 0]
    );
    
    // Get the inserted booking
    const bookingId = bookingResult.insertId || (Array.isArray(bookingResult) ? bookingResult[0]?.insertId : null);
    const insertedBooking = await client.query(
      'SELECT * FROM bookings WHERE id = ?',
      [bookingId]
    );
    const bookingRows = Array.isArray(insertedBooking) ? insertedBooking[0] : insertedBooking.rows;

    // Auto-create and complete user_task for this booking (NO approval needed)
    console.log('📝 Creating user_task for user', userId, 'with task number:', newTaskNumber);
    await client.query(
      `INSERT INTO user_tasks (user_id, deposit_id, task_number, commission_amount, status, completed_at, created_at)
       VALUES (?, NULL, ?, ?, 'completed', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [userId, newTaskNumber, commission || 0]
    );
    console.log('✅ user_task created successfully');

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Booking completed successfully',
      booking: bookingRows?.[0] || null,
      newBalance: parseFloat(wallet.available_balance) - parseFloat(hotelPrice),
      newFrozenBalance: parseFloat(wallet.frozen_balance) - parseFloat(hotelPrice),
      newTotalProfit: parseFloat(wallet.total_profit) + (commission || 0),
      taskNumber: newTaskNumber
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Complete booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing booking: ' + error.message
    });
  } finally {
    client.release();
  }
});

module.exports = router;
