const { pool } = require('./config/database');

async function seedHotels() {
  try {
    console.log('🏨 Starting hotel seeding...');
    
    // Delete existing hotels
    await pool.query('DELETE FROM hotels');
    console.log('🗑️ Cleared existing hotels');
    
    // Insert 5 hotels with different images and prices
    const hotels = [
      {
        name: 'Hilton Addis Ababa',
        description: 'Luxury hotel in the heart of Addis Ababa',
        city: 'Addis Ababa',
        country: 'Ethiopia',
        price_per_night: 120.00,
        rating: 4.5,
        level: 1,
        amenities: JSON.stringify(['WiFi', 'Pool', 'Gym', 'Restaurant']),
        image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
        currency: 'USDT',
        is_active: true
      },
      {
        name: 'Sheraton Addis',
        description: '5-star luxury hotel with premium amenities',
        city: 'Addis Ababa',
        country: 'Ethiopia',
        price_per_night: 200.00,
        rating: 4.8,
        level: 2,
        amenities: JSON.stringify(['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Bar']),
        image_url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400',
        currency: 'USDT',
        is_active: true
      },
      {
        name: 'Marriott Executive',
        description: 'Business hotel with conference facilities',
        city: 'Addis Ababa',
        country: 'Ethiopia',
        price_per_night: 150.00,
        rating: 4.3,
        level: 2,
        amenities: JSON.stringify(['WiFi', 'Gym', 'Restaurant', 'Conference']),
        image_url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400',
        currency: 'USDT',
        is_active: true
      },
      {
        name: 'Radisson Blu',
        description: 'International standard hotel',
        city: 'Addis Ababa',
        country: 'Ethiopia',
        price_per_night: 180.00,
        rating: 4.6,
        level: 3,
        amenities: JSON.stringify(['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant']),
        image_url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400',
        currency: 'USDT',
        is_active: true
      },
      {
        name: 'Golden Tulip',
        description: 'Modern hotel with excellent service',
        city: 'Addis Ababa',
        country: 'Ethiopia',
        price_per_night: 90.00,
        rating: 4.0,
        level: 1,
        amenities: JSON.stringify(['WiFi', 'Pool', 'Restaurant']),
        image_url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400',
        currency: 'USDT',
        is_active: true
      }
    ];

    for (const hotel of hotels) {
      const result = await pool.query(
        `INSERT INTO hotels (name, description, city, country, price_per_night, rating, level, amenities, image_url, currency, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          hotel.name,
          hotel.description,
          hotel.city,
          hotel.country,
          hotel.price_per_night,
          hotel.rating,
          hotel.level,
          hotel.amenities,
          hotel.image_url,
          hotel.currency,
          hotel.is_active
        ]
      );
      console.log(`✅ Inserted: ${hotel.name}`);
    }

    console.log('🎉 Hotel seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding hotels:', error);
    process.exit(1);
  }
}

seedHotels();
