const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function seedUsers() {
  try {
    // Create test users
    const users = [
      {
        username: 'testuser1',
        email: 'test1@example.com',
        password: await bcrypt.hash('password123', 10)
      },
      {
        username: 'testuser2',
        email: 'test2@example.com',
        password: await bcrypt.hash('password123', 10)
      }
    ];

    console.log('Starting to seed users...');

    for (const userData of users) {
      await User.create(userData);
      console.log(`Created user: ${userData.email}`);
    }

    console.log('Users seeded successfully!');
  } catch (error) {
    console.error('Error seeding users:', error);
  }
}

// Run the seeder
seedUsers().then(() => {
  console.log('Seeding completed');
}).catch(err => {
  console.error('Seeding failed:', err);
}); 