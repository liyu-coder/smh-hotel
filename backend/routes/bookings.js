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
      WHERE b.user_id = $1
    `;
    const params = [req.user.userId];
    let paramCount = 2;

    if (status) {
      queryText += ` AND b.status = $${paramCount++}`;
      params.push(status);
    }

    queryText += ` ORDER BY b.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM bookings WHERE user_id = $1';
    const countParams = [req.user.userId];
    let countParamCount = 2;

    if (status) {
      countQuery += ` AND status = $${countParamCount++}`;
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
      WHERE b.id = $1 AND b.user_id = $2`,
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
      'SELECT * FROM hotels WHERE id = $1 AND is_active = true',
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
        'SELECT id FROM bookings WHERE booking_reference = $1',
        [linked_booking_reference]
      );
      if (linkedResult.rows.length > 0) {
        linked_booking_id = linkedResult.rows[0].id;
      }
    }

    // Check if user has reached daily order limit
    const walletResult = await client.query(
      'SELECT * FROM user_wallets WHERE user_id = $1',
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

    // Check consolidated daily limit if linked
    let todayOrdersCount = wallet.today_orders;
    if (linked_booking_id) {
      const consolidatedResult = await client.query(
        `SELECT SUM(today_orders) as total FROM user_wallets 
         WHERE user_id IN (
           SELECT user_id FROM bookings WHERE id = $1 OR linked_booking_id = $1
           UNION
           SELECT $2
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
    const commissionAmount = totalAmount * hotel.commission_rate;

    // Generate booking reference
    const bookingReference = 'SMH' + Date.now() + Math.random().toString(36).substring(2, 8).toUpperCase();

    // Create booking
    const bookingResult = await client.query(
      `INSERT INTO bookings (user_id, hotel_id, booking_reference, check_in_date, check_out_date, guests, total_amount, commission_amount, special_requests, linked_booking_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [req.user.userId, hotel_id, bookingReference, check_in_date, check_out_date, guests, totalAmount, commissionAmount, special_requests || null, linked_booking_id]
    );

    // Update wallet daily orders
    await client.query(
      'UPDATE user_wallets SET today_orders = today_orders + 1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1',
      [req.user.userId]
    );

    // Update hotel bookings count
    await client.query(
      'UPDATE hotels SET bookings_count = bookings_count + 1 WHERE id = $1',
      [hotel_id]
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
      'UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
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
