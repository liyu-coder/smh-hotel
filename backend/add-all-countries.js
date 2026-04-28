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
    
    // All countries from frontend with images
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
        name: 'Greece',
        code: 'GR',
        phone_code: '+30',
        flag: '🇬🇷',
        image_url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1200&auto=format&fit=crop'
      },
      {
        name: 'United Arab Emirates',
        code: 'AE',
        phone_code: '+971',
        flag: '🇦🇪',
        image_url: 'https://images.unsplash.com/photo-1512453979798-5ea904ac66de?q=80&w=1200&auto=format&fit=crop'
      },
      {
        name: 'Saudi Arabia',
        code: 'SA',
        phone_code: '+966',
        flag: '🇸🇦',
        image_url: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=1200&auto=format&fit=crop'
      },
      {
        name: 'Qatar',
        code: 'QA',
        phone_code: '+974',
        flag: '🇶🇦',
        image_url: 'https://images.unsplash.com/photo-1548017095-54ac1b9f5d3a?q=80&w=1200&auto=format&fit=crop'
      },
      {
        name: 'Kuwait',
        code: 'KW',
        phone_code: '+965',
        flag: '🇰🇼',
        image_url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=1200&auto=format&fit=crop'
      },
      {
        name: 'Bahrain',
        code: 'BH',
        phone_code: '+973',
        flag: '🇧🇭',
        image_url: 'https://images.unsplash.com/photo-1549144511-f099e773c147?q=80&w=1200&auto=format&fit=crop'
      },
      {
        name: 'Oman',
        code: 'OM',
        phone_code: '+968',
        flag: '🇴🇲',
        image_url: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=1200&auto=format&fit=crop'
      },
      {
        name: 'Jordan',
        code: 'JO',
        phone_code: '+962',
        flag: '🇯🇴',
        image_url: 'https://images.unsplash.com/photo-1579631545680-5a3a0835b46e?q=80&w=1200&auto=format&fit=crop'
      },
      {
        name: 'Lebanon',
        code: 'LB',
        phone_code: '+961',
        flag: '🇱🇧',
        image_url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=1200&auto=format&fit=crop'
      },
      {
        name: 'Egypt',
        code: 'EG',
        phone_code: '+20',
        flag: '🇪🇬',
        image_url: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?q=80&w=1200&auto=format&fit=crop'
      },
      {
        name: 'Turkey',
        code: 'TR',
        phone_code: '+90',
        flag: '🇹🇷',
        image_url: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=1200&auto=format&fit=crop'
      },
      {
        name: 'Iran',
        code: 'IR',
        phone_code: '+98',
        flag: '🇮🇷',
        image_url: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?q=80&w=1200&auto=format&fit=crop'
      },
      {
        name: 'Iraq',
        code: 'IQ',
        phone_code: '+964',
        flag: '🇮🇶',
        image_url: 'https://images.unsplash.com/photo-1548017095-54ac1b9f5d3a?q=80&w=1200&auto=format&fit=crop'
      },
      {
        name: 'Syria',
        code: 'SY',
        phone_code: '+963',
        flag: '🇸🇾',
        image_url: 'https://images.unsplash.com/photo-1548017095-54ac1b9f5d3a?q=80&w=1200&auto=format&fit=crop'
      },
      {
        name: 'Israel',
        code: 'IL',
        phone_code: '+972',
        flag: '🇮🇱',
        image_url: 'https://images.unsplash.com/photo-1476900543704-4312b78632f8?q=80&w=1200&auto=format&fit=crop'
      },
      {
        name: 'Brazil',
        code: 'BR',
        phone_code: '+55',
        flag: '🇧🇷',
        image_url: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=1200&auto=format&fit=crop'
      },
      {
        name: 'South Korea',
        code: 'KR',
        phone_code: '+82',
        flag: '🇰🇷',
        image_url: 'https://images.unsplash.com/photo-1538485399081-7191377e8a9a?q=80&w=1200&auto=format&fit=crop'
      },
      {
        name: 'Singapore',
        code: 'SG',
        phone_code: '+65',
        flag: '🇸🇬',
        image_url: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=1200&auto=format&fit=crop'
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
        name: 'Nigeria',
        code: 'NG',
        phone_code: '+234',
        flag: '🇳🇬',
        image_url: 'https://images.unsplash.com/photo-1555449372-6c7a88c3a6f1?q=80&w=1200&auto=format&fit=crop'
      },
      {
        name: 'Kenya',
        code: 'KE',
        phone_code: '+254',
        flag: '🇰🇪',
        image_url: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=1200&auto=format&fit=crop'
      },
      {
        name: 'South Africa',
        code: 'ZA',
        phone_code: '+27',
        flag: '🇿🇦',
        image_url: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=1200&auto=format&fit=crop'
      },
      {
        name: 'Ghana',
        code: 'GH',
        phone_code: '+233',
        flag: '🇬🇭',
        image_url: 'https://images.unsplash.com/photo-1530893609608-32a9af3aa95c?q=80&w=1200&auto=format&fit=crop'
      },
      {
        name: 'Tanzania',
        code: 'TZ',
        phone_code: '+255',
        flag: '🇹🇿',
        image_url: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=1200&auto=format&fit=crop'
      },
      {
        name: 'Ethiopia',
        code: 'ET',
        phone_code: '+251',
        flag: '🇪🇹',
        image_url: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=1200&auto=format&fit=crop'
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
