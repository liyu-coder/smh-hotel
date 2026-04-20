const { pool } = require('../config/database');

async function seedHotels() {
  try {
    console.log('Seeding hotels into database...');

    // Get country IDs
    const countryResult = await pool.query('SELECT id, name FROM countries');
    const countries = countryResult.rows;
    const countryMap = new Map(countries.map(c => [c.name, c.id]));

    const hotels = [
      {
        country_id: countryMap.get('Philippines'),
        name: 'Manila Bay Resort',
        description: 'Luxury waterfront resort with stunning views of Manila Bay',
        location: 'Manila, Philippines',
        rating: 4.8,
        price_per_night: 250.00,
        original_price: 300.00,
        amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym'],
        image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600',
        is_featured: true
      },
      {
        country_id: countryMap.get('Singapore'),
        name: 'Marina Bay Sands Hotel',
        description: 'Iconic luxury hotel with rooftop infinity pool',
        location: 'Singapore',
        rating: 4.9,
        price_per_night: 450.00,
        original_price: 550.00,
        amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Casino', 'Gym'],
        image_url: 'https://images.unsplash.com/photo-1525625293386-3fb0ad7c1fe6?auto=format&fit=crop&q=80&w=600',
        is_featured: true
      },
      {
        country_id: countryMap.get('India'),
        name: 'Taj Palace New Delhi',
        description: 'Luxury heritage hotel in the heart of New Delhi',
        location: 'New Delhi, India',
        rating: 4.7,
        price_per_night: 200.00,
        original_price: 250.00,
        amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Concierge'],
        image_url: 'https://images.unsplash.com/photo-1524492707947-503c5be14495?auto=format&fit=crop&q=80&w=600',
        is_featured: true
      },
      {
        country_id: countryMap.get('Vietnam'),
        name: 'Sheraton Saigon Hotel',
        description: 'Modern luxury hotel in downtown Ho Chi Minh City',
        location: 'Ho Chi Minh City, Vietnam',
        rating: 4.6,
        price_per_night: 150.00,
        original_price: 180.00,
        amenities: ['WiFi', 'Pool', 'Restaurant', 'Business Center'],
        image_url: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=600',
        is_featured: true
      },
      {
        country_id: countryMap.get('Uzbekistan'),
        name: 'Hyatt Regency Tashkent',
        description: 'Premium hotel with traditional Uzbek hospitality',
        location: 'Tashkent, Uzbekistan',
        rating: 4.5,
        price_per_night: 120.00,
        original_price: 150.00,
        amenities: ['WiFi', 'Pool', 'Restaurant', 'Spa'],
        image_url: 'https://images.unsplash.com/photo-1528154291023-a6525fabe5b4?auto=format&fit=crop&q=80&w=600',
        is_featured: false
      },
      {
        country_id: countryMap.get('Japan'),
        name: 'Imperial Hotel Tokyo',
        description: 'Legendary luxury hotel in Tokyo',
        location: 'Tokyo, Japan',
        rating: 4.9,
        price_per_night: 400.00,
        original_price: 500.00,
        amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym', 'Tea Ceremony'],
        image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=600',
        is_featured: true
      },
      {
        country_id: countryMap.get('China'),
        name: 'The Peninsula Shanghai',
        description: 'Art Deco luxury hotel on the Bund',
        location: 'Shanghai, China',
        rating: 4.8,
        price_per_night: 380.00,
        original_price: 450.00,
        amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Rooftop Bar'],
        image_url: 'https://images.unsplash.com/photo-1508197149814-0cc02e8b7f74?auto=format&fit=crop&q=80&w=600',
        is_featured: true
      },
      {
        country_id: countryMap.get('Qatar'),
        name: 'Ritz-Carlton Doha',
        description: 'Luxury waterfront hotel with Persian Gulf views',
        location: 'Doha, Qatar',
        rating: 4.7,
        price_per_night: 350.00,
        original_price: 420.00,
        amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Private Beach'],
        image_url: 'https://images.unsplash.com/photo-1559586653-997635607b3b?auto=format&fit=crop&q=80&w=600',
        is_featured: true
      },
      {
        country_id: countryMap.get('United Arab Emirates'),
        name: 'Burj Al Arab',
        description: 'World-famous 7-star luxury hotel',
        location: 'Dubai, UAE',
        rating: 5.0,
        price_per_night: 1000.00,
        original_price: 1200.00,
        amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Helipad', 'Butler Service'],
        image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=600',
        is_featured: true
      },
      {
        country_id: countryMap.get('France'),
        name: 'Le Meurice Paris',
        description: 'Palace hotel near the Louvre Museum',
        location: 'Paris, France',
        rating: 4.9,
        price_per_night: 550.00,
        original_price: 650.00,
        amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Michelin Dining'],
        image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=600',
        is_featured: true
      },
      {
        country_id: countryMap.get('Spain'),
        name: 'Hotel Ritz Madrid',
        description: 'Historic luxury hotel in the heart of Madrid',
        location: 'Madrid, Spain',
        rating: 4.8,
        price_per_night: 320.00,
        original_price: 380.00,
        amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Garden'],
        image_url: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&q=80&w=600',
        is_featured: true
      },
      {
        country_id: countryMap.get('Germany'),
        name: 'Hotel Adlon Berlin',
        description: 'Legendary luxury hotel near Brandenburg Gate',
        location: 'Berlin, Germany',
        rating: 4.7,
        price_per_night: 280.00,
        original_price: 340.00,
        amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Historic Bar'],
        image_url: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&q=80&w=600',
        is_featured: true
      },
      {
        country_id: countryMap.get('Italy'),
        name: 'Hotel Danieli Venice',
        description: 'Historic palace hotel on the Grand Canal',
        location: 'Venice, Italy',
        rating: 4.8,
        price_per_night: 480.00,
        original_price: 580.00,
        amenities: ['WiFi', 'Restaurant', 'Bar', 'Concierge', 'Canal Views'],
        image_url: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&q=80&w=600',
        is_featured: true
      },
      {
        country_id: countryMap.get('Canada'),
        name: 'Fairmont Royal York Toronto',
        description: 'Historic landmark hotel in downtown Toronto',
        location: 'Toronto, Canada',
        rating: 4.6,
        price_per_night: 220.00,
        original_price: 270.00,
        amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Health Club'],
        image_url: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&q=80&w=600',
        is_featured: true
      },
      {
        country_id: countryMap.get('Brazil'),
        name: 'Copacabana Palace Rio',
        description: 'Iconic beachfront luxury hotel',
        location: 'Rio de Janeiro, Brazil',
        rating: 4.7,
        price_per_night: 380.00,
        original_price: 450.00,
        amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Beach Access'],
        image_url: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&q=80&w=600',
        is_featured: true
      },
      {
        country_id: countryMap.get('Greece'),
        name: 'Grand Resort Lagonissi Athens',
        description: 'Luxury beach resort with private beaches',
        location: 'Athens, Greece',
        rating: 4.8,
        price_per_night: 420.00,
        original_price: 500.00,
        amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Private Beach', 'Marina'],
        image_url: 'https://images.unsplash.com/photo-1503152394-c571994fd383?auto=format&fit=crop&q=80&w=600',
        is_featured: true
      },
      {
        country_id: countryMap.get('Poland'),
        name: 'Hotel Bristol Warsaw',
        description: 'Historic luxury hotel in Warsaw',
        location: 'Warsaw, Poland',
        rating: 4.5,
        price_per_night: 180.00,
        original_price: 220.00,
        amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Historic Architecture'],
        image_url: 'https://images.unsplash.com/photo-1519197924294-4ba991a11128?auto=format&fit=crop&q=80&w=600',
        is_featured: false
      },
      {
        country_id: countryMap.get('Saudi Arabia'),
        name: 'Ritz-Carlton Riyadh',
        description: 'Luxury palace hotel in the diplomatic quarter',
        location: 'Riyadh, Saudi Arabia',
        rating: 4.8,
        price_per_night: 400.00,
        original_price: 480.00,
        amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Garden', 'Prayer Rooms'],
        image_url: 'https://images.unsplash.com/photo-1586724230411-471243ecd16d?auto=format&fit=crop&q=80&w=600',
        is_featured: true
      },
      {
        country_id: countryMap.get('Yemen'),
        name: 'Movenpick Hotel Sana\'a',
        description: 'Modern hotel in Old Sana\'a',
        location: 'Sana\'a, Yemen',
        rating: 4.3,
        price_per_night: 100.00,
        original_price: 130.00,
        amenities: ['WiFi', 'Restaurant', 'Room Service', 'Parking'],
        image_url: 'https://images.unsplash.com/photo-1621509176371-558832a82069?auto=format&fit=crop&q=80&w=600',
        is_featured: false
      },
      {
        country_id: countryMap.get('Kazakhstan'),
        name: 'The Ritz-Carlton Almaty',
        description: 'Luxury hotel in the heart of Almaty',
        location: 'Almaty, Kazakhstan',
        rating: 4.6,
        price_per_night: 200.00,
        original_price: 250.00,
        amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Mountain Views'],
        image_url: 'https://images.unsplash.com/photo-1558588942-930faae5a389?auto=format&fit=crop&q=80&w=600',
        is_featured: true
      },
      {
        country_id: countryMap.get('Azerbaijan'),
        name: 'Fairmont Baku Flame Towers',
        description: 'Iconic hotel in Flame Towers complex',
        location: 'Baku, Azerbaijan',
        rating: 4.7,
        price_per_night: 280.00,
        original_price: 340.00,
        amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Casino', 'City Views'],
        image_url: 'https://images.unsplash.com/photo-1539667547529-84c607280d20?auto=format&fit=crop&q=80&w=600',
        is_featured: true
      },
      {
        country_id: countryMap.get('Venezuela'),
        name: 'Eurobuilding Hotel Caracas',
        description: 'Business hotel in Caracas',
        location: 'Caracas, Venezuela',
        rating: 4.2,
        price_per_night: 90.00,
        original_price: 120.00,
        amenities: ['WiFi', 'Pool', 'Restaurant', 'Business Center', 'Gym'],
        image_url: 'https://images.unsplash.com/photo-1533230832481-999a37731994?auto=format&fit=crop&q=80&w=600',
        is_featured: false
      },
      {
        country_id: countryMap.get('Somalia'),
        name: 'Mogadishu Hotel',
        description: 'Modern hotel in Mogadishu',
        location: 'Mogadishu, Somalia',
        rating: 4.0,
        price_per_night: 80.00,
        original_price: 100.00,
        amenities: ['WiFi', 'Restaurant', 'Room Service', 'Security'],
        image_url: 'https://images.unsplash.com/photo-1582234372722-50d7ccc30ebd?auto=format&fit=crop&q=80&w=600',
        is_featured: false
      }
    ];

    for (const hotel of hotels) {
      if (!hotel.country_id) {
        console.log(`Skipping ${hotel.name} - country not found`);
        continue;
      }

      const result = await pool.query(
        `INSERT INTO hotels (country_id, name, description, location, rating, price_per_night, original_price, commission_rate, amenities, image_url, is_featured)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id`,
        [
          hotel.country_id,
          hotel.name,
          hotel.description,
          hotel.location,
          hotel.rating,
          hotel.price_per_night,
          hotel.original_price,
          0.26, // 26% commission
          hotel.amenities,
          hotel.image_url,
          hotel.is_featured
        ]
      );
      console.log(`✅ Inserted hotel: ${hotel.name} (ID: ${result.rows[0].id})`);
    }

    console.log(`\n✅ Successfully seeded ${hotels.length} hotels into database`);
  } catch (error) {
    console.error('❌ Error seeding hotels:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedHotels();
