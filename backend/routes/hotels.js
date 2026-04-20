const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { query: queryValidator, validationResult } = require('express-validator');

// Get all hotels with pagination and filters
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const country = req.query.country;
    const featured = req.query.featured;
    const search = req.query.search;

    let queryText = `
      SELECT h.*, c.name as country_name, c.image_url as country_image_url,
        (SELECT COUNT(*) FROM bookings WHERE hotel_id = h.id) as bookings_count
      FROM hotels h
      LEFT JOIN countries c ON h.country_id = c.id
      WHERE h.is_active = true
    `;
    const params = [];
    let paramCount = 1;

    if (country) {
      queryText += ` AND c.name ILIKE $${paramCount++}`;
      params.push(`%${country}%`);
    }

    if (featured === 'true') {
      queryText += ` AND h.is_featured = true`;
    }

    if (search) {
      queryText += ` AND (h.name ILIKE $${paramCount++} OR h.location ILIKE $${paramCount++})`;
      params.push(`%${search}%`, `%${search}%`);
    }

    queryText += ` ORDER BY h.is_featured DESC, h.rating DESC, h.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM hotels h LEFT JOIN countries c ON h.country_id = c.id WHERE h.is_active = true';
    const countParams = [];
    let countParamCount = 1;

    if (country) {
      countQuery += ` AND c.name ILIKE $${countParamCount++}`;
      countParams.push(`%${country}%`);
    }

    if (featured === 'true') {
      countQuery += ` AND h.is_featured = true`;
    }

    if (search) {
      countQuery += ` AND (h.name ILIKE $${countParamCount++} OR h.location ILIKE $${countParamCount++})`;
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      hotels: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get hotels error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching hotels' 
    });
  }
});

// Get hotel by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const result = await query(
      `SELECT h.*, c.name as country_name, c.image_url as country_image_url,
        (SELECT COUNT(*) FROM bookings WHERE hotel_id = h.id) as bookings_count
      FROM hotels h
      LEFT JOIN countries c ON h.country_id = c.id
      WHERE h.id = $1 AND h.is_active = true`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Hotel not found' 
      });
    }

    // Increment view count
    await query(
      'UPDATE hotels SET views_count = views_count + 1 WHERE id = $1',
      [req.params.id]
    );

    // Get hotel images
    const imagesResult = await query(
      'SELECT * FROM hotel_images WHERE hotel_id = $1 ORDER BY is_primary DESC, display_order ASC',
      [req.params.id]
    );

    res.json({
      success: true,
      hotel: result.rows[0],
      images: imagesResult.rows
    });
  } catch (error) {
    console.error('Get hotel error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching hotel' 
    });
  }
});

// Get featured hotels
router.get('/featured/list', async (req, res) => {
  try {
    const result = await query(
      `SELECT h.*, c.name as country_name,
        (SELECT COUNT(*) FROM bookings WHERE hotel_id = h.id) as bookings_count
      FROM hotels h
      LEFT JOIN countries c ON h.country_id = c.id
      WHERE h.is_featured = true AND h.is_active = true
      ORDER BY h.rating DESC
      LIMIT 8`
    );

    res.json({
      success: true,
      hotels: result.rows
    });
  } catch (error) {
    console.error('Get featured hotels error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching featured hotels' 
    });
  }
});

module.exports = router;
