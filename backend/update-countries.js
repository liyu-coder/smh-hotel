const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    console.log('Connected to database');
    
    // Add image_url column if it doesn't exist
    try {
      await conn.query('ALTER TABLE countries ADD COLUMN image_url VARCHAR(500)');
      console.log('✅ Added image_url column');
    } catch (error) {
      if (error.code !== 'ER_DUP_FIELDNAME') {
        console.log('image_url column already exists or error:', error.message);
      }
    }
    
    // Add is_active column if it doesn't exist
    try {
      await conn.query('ALTER TABLE countries ADD COLUMN is_active BOOLEAN DEFAULT TRUE');
      console.log('✅ Added is_active column');
    } catch (error) {
      if (error.code !== 'ER_DUP_FIELDNAME') {
        console.log('is_active column already exists or error:', error.message);
      }
    }
    
    // Countries with images matching our hotels
    const countries = [
      {
        name: 'Azerbaijan',
        code: 'AZ',
        phone_code: '+994',
        flag: '🇦🇿',
        image_url: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?q=80&w=1200&auto=format&fit=crop'
      },
      {
        name: 'Uzbekistan',
        code: 'UZ',
        phone_code: '+998',
        flag: '🇺🇿',
        image_url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&auto=format&fit=crop'
      },
      {
        name: 'Kazakhstan',
        code: 'KZ',
        phone_code: '+7',
        flag: '🇰🇿',
        image_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200&auto=format&fit=crop'
      },
      {
        name: 'Poland',
        code: 'PL',
        phone_code: '+48',
        flag: '🇵🇱',
        image_url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=1200&auto=format&fit=crop'
      },
      {
        name: 'United States',
        code: 'US',
        phone_code: '+1',
        flag: '🇺🇸',
        image_url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200&auto=format&fit=crop'
      },
      {
        name: 'United Kingdom',
        code: 'GB',
        phone_code: '+44',
        flag: '🇬🇧',
        image_url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1200&auto=format&fit=crop'
      },
      {
        name: 'Turkey',
        code: 'TR',
        phone_code: '+90',
        flag: '🇹🇷',
        image_url: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=1200&auto=format&fit=crop'
      },
      {
        name: 'United Arab Emirates',
        code: 'AE',
        phone_code: '+971',
        flag: '🇦🇪',
        image_url: 'https://images.unsplash.com/photo-1512453979798-5ea904ac66de?q=80&w=1200&auto=format&fit=crop'
      }
    ];
    
    for (const country of countries) {
      try {
        // Check if country exists
        const [existing] = await conn.query('SELECT id FROM countries WHERE name = ?', [country.name]);
        
        if (existing.length > 0) {
          // Update existing country
          await conn.query(
            'UPDATE countries SET image_url = ?, is_active = TRUE WHERE name = ?',
            [country.image_url, country.name]
          );
          console.log(`✅ Updated: ${country.name}`);
        } else {
          // Insert new country
          await conn.query(
            'INSERT INTO countries (name, code, phone_code, flag, image_url, is_active) VALUES (?, ?, ?, ?, ?, TRUE)',
            [country.name, country.code, country.phone_code, country.flag, country.image_url]
          );
          console.log(`✅ Inserted: ${country.name}`);
        }
      } catch (error) {
        console.error(`❌ Error with ${country.name}:`, error.message);
      }
    }
    
    console.log('✅ All countries processed');
    await conn.end();
  } catch (error) {
    console.error('Error:', error);
  }
})();
