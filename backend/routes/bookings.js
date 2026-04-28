const express = require('express');
const router = express.Router();
const { query, getClient } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Get all bookings for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status;

    let queryText = `
      SELECT b.*, h.name as hotel_name, h.image_url as hotel_image_url, h.location as hotel_location,
        c.name as country_name
      FROM bookings b
      JOIN hotels h ON b.hotel_id = h.id
      LEFT JOIN countries c ON h.country_id = c.id
      WHERE b.user_id = ?
    `;
    const params = [req.user.userId];

    if (status) {
      queryText += ' AND b.status = ?';
      params.push(status);
    }

    queryText += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const result = await query(queryText, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM bookings WHERE user_id = ?';
    const countParams = [req.user.userId];

    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
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
    console.error('Get bookings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching bookings' 
    });
  }
});

// Get booking by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT b.*, h.name as hotel_name, h.image_url as hotel_image_url, h.location as hotel_location,
        h.description as hotel_description, h.amenities as hotel_amenities,
        c.name as country_name
      FROM bookings b
      JOIN hotels h ON b.hotel_id = h.id
      LEFT JOIN countries c ON h.country_id = c.id
      WHERE b.id = ? AND b.user_id = ?`,
      [req.params.id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    res.json({
      success: true,
      booking: result.rows[0]
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching booking' 
    });
  }
});

// Create new booking
router.post('/', authenticateToken, [
  body('hotel_id').isInt(),
  body('check_in_date').isISO8601().toDate(),
  body('check_out_date').isISO8601().toDate(),
  body('guests').isInt({ min: 1 }),
], async (req, res) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { hotel_id, check_in_date, check_out_date, guests, special_requests, linked_booking_reference } = req.body;

    // Get hotel details
    const hotelResult = await client.query(
      'SELECT * FROM hotels WHERE id = ? AND is_active = true',
      [hotel_id]
    );

    if (hotelResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        success: false, 
        message: 'Hotel not found' 
      });
    }

    const hotel = hotelResult.rows[0];

    // Find linked booking if reference provided
    let linked_booking_id = null;
    if (linked_booking_reference) {
      const linkedResult = await client.query(
        'SELECT id FROM bookings WHERE booking_reference = ?',
        [linked_booking_reference]
      );
      if (linkedResult.rows.length > 0) {
        linked_booking_id = linkedResult.rows[0].id;
      }
    }

    // Check if user has reached daily order limit AND task limit
    const walletResult = await client.query(
      'SELECT * FROM user_wallets WHERE user_id = ?',
      [req.user.userId]
    );

    if (walletResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        message: 'Wallet not found' 
      });
    }

    const wallet = walletResult.rows[0];

    // Check if user requires recharge (task limit reached)
    if (wallet.requires_recharge) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        message: 'Task limit reached. Please deposit to continue.' 
      });
    }

    // Check if user has reached their task limit
    if (wallet.completed_tasks >= wallet.task_limit) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        message: 'Task limit reached. Please deposit to continue.' 
      });
    }

    // Check consolidated daily limit if linked
    let todayOrdersCount = wallet.today_orders;
    if (linked_booking_id) {
      const consolidatedResult = await client.query(
        `SELECT SUM(today_orders) as total FROM user_wallets 
         WHERE user_id IN (
           SELECT user_id FROM bookings WHERE id = ? OR linked_booking_id = ?
           UNION
           SELECT ?
         )`,
        [linked_booking_id, req.user.userId]
      );
      todayOrdersCount = parseInt(consolidatedResult.rows[0].total || 0);
    }

    if (todayOrdersCount >= wallet.max_daily_orders) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        message: `Consolidated daily limit reached (${wallet.max_daily_orders} reservations).` 
      });
    }

    // Calculate nights
    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        message: 'Check-out date must be after check-in date' 
      });
    }

    // Calculate total amount
    const totalAmount = hotel.price_per_night * nights;
    
    // Check sufficient balance for this booking
    if (wallet.available_balance < totalAmount) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        message: 'Insufficient balance for this booking' 
      });
    }
    const commissionAmount = totalAmount * hotel.commission_rate;

    // Generate booking reference
    const bookingReference = 'SMH' + Date.now() + Math.random().toString(36).substring(2, 8).toUpperCase();

    // Create booking
    const bookingResult = await client.query(
      `INSERT INTO bookings (user_id, hotel_id, booking_reference, check_in_date, check_out_date, guests, total_amount, commission_amount, special_requests, linked_booking_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.userId, hotel_id, bookingReference, check_in_date, check_out_date, guests, totalAmount, commissionAmount, special_requests || null, linked_booking_id]
    );

    // Update wallet: deduct balance, increment daily orders and completed tasks
    await client.query(
      `UPDATE user_wallets 
       SET available_balance = available_balance - ?,
           today_orders = today_orders + 1,
           completed_tasks = completed_tasks + 1,
           total_spent = COALESCE(total_spent, 0) + ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ?`,
      [totalAmount, totalAmount, req.user.userId]
    );

    // Check if task limit reached after this booking
    const updatedWalletResult = await client.query(
      'SELECT completed_tasks, task_limit FROM user_wallets WHERE user_id = ?',
      [req.user.userId]
    );
    
    const updatedWallet = updatedWalletResult.rows[0];
    if (updatedWallet.completed_tasks >= updatedWallet.task_limit) {
      // Mark wallet as requiring recharge
      await client.query(
        'UPDATE user_wallets SET requires_recharge = TRUE WHERE user_id = ?',
        [req.user.userId]
      );
    }

    // Update hotel bookings count
    await client.query(
      'UPDATE hotels SET bookings_count = bookings_count + 1 WHERE id = ?',
      [hotel_id]
    );

    // Create booking transaction record
    await client.query(
      `INSERT INTO transactions (user_id, type, amount, status, description, booking_id, created_at)
       VALUES (?, 'booking', ?, 'completed', ?, ?, CURRENT_TIMESTAMP)`,
      [req.user.userId, totalAmount, `Booking payment for ${hotel.name}`, bookingResult.rows[0].id]
    );

    // Auto-create and complete user_task for this booking (NO approval needed)
    await client.query(
      `INSERT INTO user_tasks (user_id, deposit_id, task_number, commission_amount, status, completed_at, created_at)
       VALUES (?, NULL, ?, ?, 'completed', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [req.user.userId, wallet.completed_tasks + 1, commissionAmount]
    );

    // Add commission to user's available balance immediately
    await client.query(
      `UPDATE user_wallets 
       SET available_balance = available_balance + ?,
           total_profit = COALESCE(total_profit, 0) + ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ?`,
      [commissionAmount, commissionAmount, req.user.userId]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: bookingResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating booking' 
    });
  } finally {
    client.release();
  }
});

// Cancel booking
router.put('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    const booking = result.rows[0];

    if (booking.status !== 'pending' && booking.status !== 'confirmed') {
      return res.status(400).json({ 
        success: false, 
        message: 'Booking cannot be cancelled' 
      });
    }

    await query(
      'UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['cancelled', req.params.id]
    );

    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error cancelling booking' 
    });
  }
});

module.exports = router;
