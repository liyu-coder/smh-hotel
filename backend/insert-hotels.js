const mysql = require('mysql2/promise');
require('dotenv').config();

// Hotels from frontend data
const hotels = [
  {
    id: 1,
    name: 'Baku Four Seasons',
    country: 'Azerbaijan',
    city: 'Baku',
    level: 4,
    price: 350,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&auto=format&fit=crop',
    description: 'Iconic luxury hotel with panoramic Caspian Sea views',
    amenities: 'WiFi, Spa, Gym, Restaurant, Pool',
    rating: 4.8,
    featured: 1,
    commission: 0.26
  },
  {
    id: 2,
    name: 'Fairmont Baku',
    country: 'Azerbaijan',
    city: 'Baku',
    level: 4,
    price: 400,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1200&auto=format&fit=crop',
    description: 'Five-star luxury in the heart of Baku',
    amenities: 'WiFi, Spa, Gym, Restaurant, Pool, Bar',
    rating: 4.9,
    featured: 1,
    commission: 0.26
  },
  {
    id: 3,
    name: 'Intourist Palace Hotel',
    country: 'Azerbaijan',
    city: 'Baku',
    level: 3,
    price: 180,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200&auto=format&fit=crop',
    description: 'Historic elegance meets modern comfort',
    amenities: 'WiFi, Restaurant, Bar, Meeting Rooms',
    rating: 4.5,
    featured: 0,
    commission: 0.26
  },
  {
    id: 4,
    name: 'Shahdag Hotel',
    country: 'Azerbaijan',
    city: 'Qusar',
    level: 2,
    price: 120,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1200&auto=format&fit=crop',
    description: 'Mountain resort with ski access',
    amenities: 'WiFi, Restaurant, Ski Access, Spa',
    rating: 4.3,
    featured: 0,
    commission: 0.26
  },
  {
    id: 5,
    name: 'Caspian Business Hotel',
    country: 'Azerbaijan',
    city: 'Baku',
    level: 2,
    price: 95,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1200&auto=format&fit=crop',
    description: 'Business-focused accommodation in city center',
    amenities: 'WiFi, Business Center, Restaurant',
    rating: 4.2,
    featured: 0,
    commission: 0.26
  },
  {
    id: 6,
    name: 'Hyatt Regency Tashkent',
    country: 'Uzbekistan',
    city: 'Tashkent',
    level: 4,
    price: 280,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=1200&auto=format&fit=crop',
    description: 'Luxury hotel in the heart of Tashkent',
    amenities: 'WiFi, Spa, Gym, Restaurant, Pool, Bar',
    rating: 4.7,
    featured: 1,
    commission: 0.26
  },
  {
    id: 7,
    name: 'Lotus City Hotel',
    country: 'Uzbekistan',
    city: 'Tashkent',
    level: 3,
    price: 150,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1558588942-930faae5a389?q=80&w=1200&auto=format&fit=crop',
    description: 'Modern comfort in historic city',
    amenities: 'WiFi, Restaurant, Gym, Business Center',
    rating: 4.4,
    featured: 0,
    commission: 0.26
  },
  {
    id: 8,
    name: 'Samarqand Hotel',
    country: 'Uzbekistan',
    city: 'Samarkand',
    level: 3,
    price: 130,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1539667547529-84c607280d20?q=80&w=1200&auto=format&fit=crop',
    description: 'Historic city center location',
    amenities: 'WiFi, Restaurant, Tour Desk, Garden',
    rating: 4.5,
    featured: 1,
    commission: 0.26
  },
  {
    id: 9,
    name: 'Bukhara Plaza',
    country: 'Uzbekistan',
    city: 'Bukhara',
    level: 2,
    price: 85,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=1200&auto=format&fit=crop',
    description: 'Traditional architecture meets modern comfort',
    amenities: 'WiFi, Restaurant, Courtyard',
    rating: 4.1,
    featured: 0,
    commission: 0.26
  },
  {
    id: 10,
    name: 'Khiva Hotel Asia',
    country: 'Uzbekistan',
    city: 'Khiva',
    level: 1,
    price: 65,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=1200&auto=format&fit=crop',
    description: 'Budget-friendly in ancient walled city',
    amenities: 'WiFi, Restaurant',
    rating: 3.9,
    featured: 0,
    commission: 0.26
  },
  {
    id: 11,
    name: 'Ritz-Carlton Almaty',
    country: 'Kazakhstan',
    city: 'Almaty',
    level: 4,
    price: 450,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1200&auto=format&fit=crop',
    description: 'Ultimate luxury with mountain views',
    amenities: 'WiFi, Spa, Gym, Restaurant, Pool, Bar, Concierge',
    rating: 4.9,
    featured: 1,
    commission: 0.26
  },
  {
    id: 12,
    name: 'InterContinental Almaty',
    country: 'Kazakhstan',
    city: 'Almaty',
    level: 4,
    price: 380,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200&auto=format&fit=crop',
    description: 'Five-star international standards',
    amenities: 'WiFi, Spa, Gym, Restaurant, Pool, Business Center',
    rating: 4.8,
    featured: 1,
    commission: 0.26
  },
  {
    id: 13,
    name: 'Kazakhstan Hotel',
    country: 'Kazakhstan',
    city: 'Almaty',
    level: 3,
    price: 160,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200&auto=format&fit=crop',
    description: 'Iconic landmark hotel',
    amenities: 'WiFi, Restaurant, Bar, Meeting Rooms',
    rating: 4.3,
    featured: 0,
    commission: 0.26
  },
  {
    id: 14,
    name: 'Nur Astana',
    country: 'Kazakhstan',
    city: 'Nur-Sultan',
    level: 3,
    price: 140,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop',
    description: 'Modern capital city accommodation',
    amenities: 'WiFi, Restaurant, Gym, Business Center',
    rating: 4.4,
    featured: 0,
    commission: 0.26
  },
  {
    id: 15,
    name: 'Shymkent Plaza',
    country: 'Kazakhstan',
    city: 'Shymkent',
    level: 2,
    price: 90,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200&auto=format&fit=crop',
    description: 'Southern comfort and hospitality',
    amenities: 'WiFi, Restaurant, Parking',
    rating: 4.0,
    featured: 0,
    commission: 0.26
  },
  {
    id: 16,
    name: 'Hotel Bristol Warsaw',
    country: 'Poland',
    city: 'Warsaw',
    level: 4,
    price: 320,
    currency: 'EUR',
    image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=1200&auto=format&fit=crop',
    description: 'Historic luxury on Royal Route',
    amenities: 'WiFi, Spa, Gym, Restaurant, Pool, Bar',
    rating: 4.8,
    featured: 1,
    commission: 0.26
  },
  {
    id: 17,
    name: 'Raffles Europejski Warsaw',
    country: 'Poland',
    city: 'Warsaw',
    level: 4,
    price: 380,
    currency: 'EUR',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200&auto=format&fit=crop',
    description: 'European elegance meets Asian hospitality',
    amenities: 'WiFi, Spa, Gym, Restaurant, Pool, Bar, Butler Service',
    rating: 4.9,
    featured: 1,
    commission: 0.26
  },
  {
    id: 18,
    name: 'Wroc Hilton',
    country: 'Poland',
    city: 'Wroc',
    level: 3,
    price: 180,
    currency: 'EUR',
    image: 'https://images.unsplash.com/photo-1590490320-4d9b4e4d3d5b?q=80&w=1200&auto=format&fit=crop',
    description: 'Modern comfort on Oder River',
    amenities: 'WiFi, Restaurant, Gym, Business Center, Pool',
    rating: 4.5,
    featured: 0,
    commission: 0.26
  },
  {
    id: 19,
    name: 'Krakow Grand Hotel',
    country: 'Poland',
    city: 'Krakow',
    level: 3,
    price: 150,
    currency: 'EUR',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200&auto=format&fit=crop',
    description: 'Historic charm near Old Town',
    amenities: 'WiFi, Restaurant, Bar, Tour Desk',
    rating: 4.4,
    featured: 0,
    commission: 0.26
  },
  {
    id: 20,
    name: 'Gdansk Marina Hotel',
    country: 'Poland',
    city: 'Gdansk',
    level: 2,
    price: 110,
    currency: 'EUR',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop',
    description: 'Marina views and Baltic Sea access',
    amenities: 'WiFi, Restaurant, Marina Access',
    rating: 4.2,
    featured: 0,
    commission: 0.26
  }
];

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    console.log('Connected to database');
    
    for (const hotel of hotels) {
      try {
        const amenitiesArray = hotel.amenities.split(', ');
        await conn.query(
          `INSERT INTO hotels (id, name, country, city, level, price_per_night, currency, image_url, description, amenities, rating, is_active, commission) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [hotel.id, hotel.name, hotel.country, hotel.city, hotel.level, hotel.price, hotel.currency, hotel.image, hotel.description, JSON.stringify(amenitiesArray), hotel.rating, hotel.featured, hotel.commission]
        );
        console.log(`✅ Inserted: ${hotel.name}`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️ Skipped (duplicate): ${hotel.name}`);
        } else {
          console.error(`❌ Error inserting ${hotel.name}:`, error.message);
        }
      }
    }
    
    console.log('✅ All hotels processed');
    await conn.end();
  } catch (error) {
    console.error('Error:', error);
  }
})();
