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
      SELECT h.*, c.name as country_name,
        (SELECT COUNT(*) FROM bookings WHERE hotel_id = h.id) as bookings_count
      FROM hotels h
      LEFT JOIN countries c ON h.country = c.name
      WHERE h.is_active = true
    `;
    const params = [];

    if (country) {
      queryText += ' AND c.name LIKE ?';
      params.push(`%${country}%`);
    }

    if (search) {
      queryText += ' AND (h.name LIKE ? OR h.location LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    queryText += ' ORDER BY h.rating DESC, h.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const result = await query(queryText, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM hotels h LEFT JOIN countries c ON h.country = c.name WHERE h.is_active = true';
    const countParams = [];

    if (country) {
      countQuery += ' AND c.name LIKE ?';
      countParams.push(`%${country}%`);
    }

    if (search) {
      countQuery += ' AND (h.name LIKE ? OR h.location LIKE ?)';
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
      `SELECT h.*, c.name as country_name,
        (SELECT COUNT(*) FROM bookings WHERE hotel_id = h.id) as bookings_count
      FROM hotels h
      LEFT JOIN countries c ON h.country = c.name
      WHERE h.id = ? AND h.is_active = true`,
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
      'UPDATE hotels SET views_count = views_count + 1 WHERE id = ?',
      [req.params.id]
    );

    // Get hotel images
    const imagesResult = await query(
      'SELECT * FROM hotel_images WHERE hotel_id = ? ORDER BY is_primary DESC, display_order ASC',
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
      LEFT JOIN countries c ON h.country = c.name
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

// Get random hotels with dynamic images
router.get('/random', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const country = req.query.country;

    let queryText = `
      SELECT h.*, c.name as country_name, c.flag as country_flag,
        (SELECT COUNT(*) FROM bookings WHERE hotel_id = h.id) as bookings_count
      FROM hotels h
      LEFT JOIN countries c ON h.country = c.name
      WHERE h.is_active = true
    `;
    const params = [];

    if (country) {
      queryText += ' AND h.country = ?';
      params.push(country);
    }

    // Get random hotels using RAND() for MySQL
    queryText += ' ORDER BY RAND() LIMIT ?';
    params.push(limit);

    const result = await query(queryText, params);

    // Enhance hotels with dynamic images from Pexels API
    const hotelsWithImages = await Promise.all(
      result.rows.map(async (hotel) => {
        let imageUrl = hotel.image_url;
        
        // If no image or need fresh image, fetch from Pexels
        if (!imageUrl || req.query.refresh === 'true') {
          try {
            const pexelsResponse = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(hotel.name + ' hotel')}&per_page=1`, {
              headers: {
                'Authorization': process.env.PEXELS_API_KEY || 'YOUR_PEXELS_API_KEY'
              }
            });
            
            if (pexelsResponse.ok) {
              const pexelsData = await pexelsResponse.json();
              if (pexelsData.photos && pexelsData.photos.length > 0) {
                imageUrl = pexelsData.photos[0].src.large;
              }
            }
          } catch (error) {
            console.warn('Failed to fetch image from Pexels:', error.message);
            // Fallback to Unsplash
            try {
              const unsplashResponse = await fetch(`https://api.unsplash.com/photos/random?query=${encodeURIComponent(hotel.name + ' hotel')}&client_id=${process.env.UNSPLASH_API_KEY || 'YOUR_UNSPLASH_API_KEY'}`);
              
              if (unsplashResponse.ok) {
                const unsplashData = await unsplashResponse.json();
                imageUrl = unsplashData.urls.regular;
              }
            } catch (unsplashError) {
              console.warn('Failed to fetch image from Unsplash:', unsplashError.message);
              // Use placeholder if both fail
              imageUrl = `https://picsum.photos/seed/${hotel.name}/800/600.jpg`;
            }
          }
        }

        return {
          ...hotel,
          image_url: imageUrl,
          display_price: `${hotel.price_per_night} ${hotel.currency || 'USDT'}`,
          rating: parseFloat(hotel.rating) || 4.0,
          amenities: hotel.amenities ? JSON.parse(hotel.amenities) : []
        };
      })
    );

    res.json({
      success: true,
      hotels: hotelsWithImages,
      meta: {
        count: hotelsWithImages.length,
        refresh: req.query.refresh === 'true'
      }
    });
  } catch (error) {
    console.error('Get random hotels error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching random hotels' 
    });
  }
});

// Get hotels with enhanced image support
router.get('/enhanced', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const country = req.query.country;
    const search = req.query.search;
    const minPrice = req.query.min_price;
    const maxPrice = req.query.max_price;

    let queryText = `
      SELECT h.*, c.name as country_name, c.flag as country_flag,
        (SELECT COUNT(*) FROM bookings WHERE hotel_id = h.id) as bookings_count
      FROM hotels h
      LEFT JOIN countries c ON h.country = c.name
      WHERE h.is_active = true
    `;
    const params = [];
    let paramCount = 1;

    if (country) {
      queryText += ' AND h.country = ?';
      params.push(country);
    }

    if (search) {
      queryText += ' AND (h.name LIKE ? OR h.location LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (minPrice) {
      queryText += ' AND h.price_per_night >= ?';
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      queryText += ' AND h.price_per_night <= ?';
      params.push(parseFloat(maxPrice));
    }

    queryText += ' ORDER BY h.rating DESC, h.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const result = await query(queryText, params);

    // Enhance with dynamic images like random endpoint
    const hotelsWithImages = await Promise.all(
      result.rows.map(async (hotel) => {
        let imageUrl = hotel.image_url;
        
        if (!imageUrl || req.query.refresh === 'true') {
          try {
            const pexelsResponse = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(hotel.name + ' hotel')}&per_page=1`, {
              headers: {
                'Authorization': process.env.PEXELS_API_KEY || 'YOUR_PEXELS_API_KEY'
              }
            });
            
            if (pexelsResponse.ok) {
              const pexelsData = await pexelsResponse.json();
              if (pexelsData.photos && pexelsData.photos.length > 0) {
                imageUrl = pexelsData.photos[0].src.large;
              }
            }
          } catch (error) {
            imageUrl = `https://picsum.photos/seed/${hotel.name}/800/600.jpg`;
          }
        }

        return {
          ...hotel,
          image_url: imageUrl,
          display_price: `${hotel.price_per_night} ${hotel.currency || 'USDT'}`,
          rating: parseFloat(hotel.rating) || 4.0,
          amenities: hotel.amenities ? JSON.parse(hotel.amenities) : []
        };
      })
    );

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM hotels h LEFT JOIN countries c ON h.country = c.name WHERE h.is_active = true';
    const countParams = [];
    
    if (country) {
      countQuery += ' AND h.country = ?';
      countParams.push(country);
    }
    
    if (search) {
      countQuery += ' AND (h.name LIKE ? OR h.location LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }
    
    if (minPrice) {
      countQuery += ' AND h.price_per_night >= ?';
      countParams.push(parseFloat(minPrice));
    }
    
    if (maxPrice) {
      countQuery += ' AND h.price_per_night <= ?';
      countParams.push(parseFloat(maxPrice));
    }

    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      hotels: hotelsWithImages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get enhanced hotels error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching enhanced hotels' 
    });
  }
});

module.exports = router;
