const { pool } = require('./config/database');

async function updatePlanImages() {
  try {
    console.log('🎨 Starting plan image update...');
    
    const planImages = [
      { id: 1, image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400' },
      { id: 2, image_url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400' },
      { id: 3, image_url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400' },
      { id: 4, image_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400' },
    ];

    for (const plan of planImages) {
      const result = await pool.query(
        `UPDATE reservation_plans SET image_url = ? WHERE id = ?`,
        [plan.image_url, plan.id]
      );
      console.log(`✅ Updated Plan ${plan.id} with image: ${plan.image_url}`);
    }

    console.log('🎉 Plan images updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating plan images:', error);
    process.exit(1);
  }
}

updatePlanImages();
