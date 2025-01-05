const { Pool } = require('pg');
require('dotenv').config();

const config = {
  user: 'tastebuddy_user',
  password: 'password123',
  host: 'localhost',
  port: 5432,
  database: 'tastebuddy',
  ssl: false
};

const pool = new Pool(config);

let tablesInitialized = false;

// Sample recipes data
const sampleRecipes = [
  {
    title: 'Classic Spaghetti Carbonara',
    description: 'A traditional Italian pasta dish with eggs, cheese, pancetta, and black pepper',
    ingredients: [
      { item: 'spaghetti', amount: '400', unit: 'g' },
      { item: 'pancetta', amount: '200', unit: 'g' },
      { item: 'eggs', amount: '4', unit: 'whole' },
      { item: 'parmesan cheese', amount: '100', unit: 'g' },
      { item: 'black pepper', amount: '2', unit: 'tsp' },
      { item: 'salt', amount: '1', unit: 'tsp' }
    ],
    instructions: [
      'Boil pasta in salted water according to package instructions',
      'Fry pancetta until crispy',
      'Mix eggs, cheese, and pepper in a bowl',
      'Combine hot pasta with egg mixture and pancetta',
      'Serve immediately with extra cheese and pepper'
    ],
    cooking_time: 30,
    cuisine_type: 'Italian',
    difficulty_level: 'Intermediate',
    servings: 4
  },
  {
    title: 'Simple Chicken Stir-Fry',
    description: 'Quick and healthy chicken stir-fry with vegetables',
    ingredients: [
      { item: 'chicken breast', amount: '500', unit: 'g' },
      { item: 'broccoli', amount: '300', unit: 'g' },
      { item: 'carrots', amount: '2', unit: 'whole' },
      { item: 'soy sauce', amount: '3', unit: 'tbsp' },
      { item: 'garlic', amount: '3', unit: 'cloves' },
      { item: 'ginger', amount: '1', unit: 'tbsp' },
      { item: 'vegetable oil', amount: '2', unit: 'tbsp' }
    ],
    instructions: [
      'Cut chicken into bite-sized pieces',
      'Chop vegetables into similar sizes',
      'Heat oil in a wok or large frying pan',
      'Stir-fry chicken until cooked through',
      'Add vegetables and stir-fry until tender-crisp',
      'Add sauce and seasonings',
      'Serve hot with rice'
    ],
    cooking_time: 25,
    cuisine_type: 'Asian',
    difficulty_level: 'Easy',
    servings: 4
  },
  {
    title: 'Classic Omelet',
    description: 'A simple but delicious breakfast omelet',
    ingredients: [
      { item: 'eggs', amount: '3', unit: 'whole' },
      { item: 'milk', amount: '2', unit: 'tbsp' },
      { item: 'butter', amount: '1', unit: 'tbsp' },
      { item: 'cheese', amount: '50', unit: 'g' },
      { item: 'salt', amount: '1/4', unit: 'tsp' },
      { item: 'pepper', amount: '1/4', unit: 'tsp' }
    ],
    instructions: [
      'Beat eggs with milk, salt, and pepper',
      'Melt butter in a non-stick pan',
      'Pour in egg mixture',
      'Add cheese when eggs begin to set',
      'Fold omelet in half',
      'Serve immediately'
    ],
    cooking_time: 10,
    cuisine_type: 'International',
    difficulty_level: 'Easy',
    servings: 1
  }
];

// Initialize database tables
const initDb = async () => {
  if (tablesInitialized) return;
  
  const client = await pool.connect();
  try {
    // Start transaction
    await client.query('BEGIN');

    // Create users table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        dietary_preferences TEXT[],
        allergies TEXT[],
        cooking_skill_level VARCHAR(50),
        favorite_cuisines TEXT[],
        cooking_frequency VARCHAR(50),
        preferred_meal_types TEXT[],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS recipes (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        ingredients JSONB NOT NULL,
        instructions TEXT[] NOT NULL,
        cooking_time INTEGER NOT NULL,
        cuisine_type VARCHAR(100),
        difficulty_level VARCHAR(50),
        servings INTEGER,
        image_url TEXT,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert sample recipes
    for (const recipe of sampleRecipes) {
      await client.query(`
        INSERT INTO recipes (
          title, 
          description, 
          ingredients, 
          instructions, 
          cooking_time,
          cuisine_type,
          difficulty_level,
          servings
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (title) DO NOTHING
      `, [
        recipe.title,
        recipe.description,
        JSON.stringify(recipe.ingredients),
        recipe.instructions,
        recipe.cooking_time,
        recipe.cuisine_type,
        recipe.difficulty_level,
        recipe.servings
      ]);
    }

    // Commit transaction
    await client.query('COMMIT');
    console.log('Database tables initialized successfully');
    tablesInitialized = true;
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error initializing database tables:', error);
    // Don't exit process, just log the error
    console.error('Database initialization failed, but server will continue running');
  } finally {
    client.release();
  }
};

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // Don't exit process on connection errors
  console.error('Database error occurred, but server will continue running');
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
  initDb(); // Initialize tables when connection is established
});

module.exports = pool; 