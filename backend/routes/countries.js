const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { optionalAuth } = require('../middleware/auth');

// Get all countries
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 24;
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT c.* 
      FROM countries c
      WHERE c.is_active = true
      ORDER BY c.name ASC
      LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    // Get hotel count for each country
    const countriesWithCount = await Promise.all(
      result.rows.map(async (country) => {
        const hotelCountResult = await query(
          'SELECT COUNT(*) as count FROM hotels WHERE country = ? AND is_active = true',
          [country.name]
        );
        return {
          ...country,
          hotel_count: parseInt(hotelCountResult.rows[0]?.count || 0)
        };
      })
    );

    // Get total count
    const countResult = await query(
      'SELECT COUNT(*) FROM countries WHERE is_active = true'
    );
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      countries: countriesWithCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get countries error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching countries' 
    });
  }
});

// Get country by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const result = await query(
      `SELECT c.*, 
        (SELECT COUNT(*) FROM hotels WHERE country_id = c.id AND is_active = true) as hotel_count
      FROM countries c
      WHERE c.id = ? AND c.is_active = true`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Country not found' 
      });
    }

    const country = result.rows[0];

    // Get hotels for this country
    const hotelsResult = await query(
      `SELECT h.* FROM hotels h
      WHERE h.country_id = ? AND h.is_active = true
      ORDER BY h.rating DESC, h.created_at DESC
      LIMIT 20`,
      [req.params.id]
    );

    res.json({
      success: true,
      country,
      hotels: hotelsResult.rows
    });
  } catch (error) {
    console.error('Get country error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching country' 
    });
  }
});

// Get country by name
router.get('/name/:name', optionalAuth, async (req, res) => {
  try {
    const result = await query(
      `SELECT c.*, 
        (SELECT COUNT(*) FROM hotels WHERE country_id = c.id AND is_active = true) as hotel_count
      FROM countries c
      WHERE c.name LIKE ? AND c.is_active = true`,
      [`%${req.params.name}%`]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Country not found' 
      });
    }

    res.json({
      success: true,
      countries: result.rows
    });
  } catch (error) {
    console.error('Get country by name error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching country' 
    });
  }
});

// Get featured countries
router.get('/featured/list', async (req, res) => {
  try {
    const result = await query(
      `SELECT c.*, 
        (SELECT COUNT(*) FROM hotels WHERE country_id = c.id AND is_active = true) as hotel_count
      FROM countries c
      WHERE c.is_active = true
      ORDER BY c.hotel_count DESC
      LIMIT 12`
    );

    res.json({
      success: true,
      countries: result.rows
    });
  } catch (error) {
    console.error('Get featured countries error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching featured countries' 
    });
  }
});

module.exports = router;
