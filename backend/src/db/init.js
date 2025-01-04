const fs = require('fs');
const path = require('path');
const { pool } = require('../db');

async function initializeDatabase() {
    try {
        console.log('Starting database initialization...');

        // Read the schema file
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Execute the schema
        await pool.query(schema);
        console.log('Schema created successfully');

        // Insert some sample data for testing
        const sampleData = `
            -- Insert sample users
            INSERT INTO users (username, email, password) VALUES
            ('testuser1', 'test1@example.com', '$2a$10$rQJXp1.VMvV3RzHEBQY9K.U5vx4c1JBjAzxxo.gx1fGHm0JyPPJpq'),
            ('testuser2', 'test2@example.com', '$2a$10$rQJXp1.VMvV3RzHEBQY9K.U5vx4c1JBjAzxxo.gx1fGHm0JyPPJpq');

            -- Insert sample recipes
            INSERT INTO recipes (title, description, cooking_time, difficulty_level, cuisine_type, ingredients, instructions, video_url) VALUES
            (
                'Spaghetti Carbonara',
                'Classic Italian pasta dish with creamy egg sauce',
                30,
                'Medium',
                'Italian',
                ARRAY['200g spaghetti', '100g pancetta', '2 large eggs', '50g Pecorino Romano'],
                ARRAY['Boil pasta', 'Cook pancetta', 'Mix eggs and cheese', 'Combine all ingredients'],
                'https://www.youtube.com/watch?v=3AAdKl1UYZs'
            ),
            (
                'Chicken Curry',
                'Aromatic and flavorful curry dish',
                45,
                'Medium',
                'Indian',
                ARRAY['500g chicken thighs', '2 tbsp curry powder', '400ml coconut milk', '1 onion'],
                ARRAY['Prepare ingredients', 'Cook chicken', 'Make sauce', 'Simmer until done'],
                'https://www.youtube.com/watch?v=eY1FF6SEggk'
            );

            -- Insert sample user ingredients
            INSERT INTO user_ingredients (user_id, ingredient_name, quantity, unit) VALUES
            (1, 'Pasta', 500, 'g'),
            (1, 'Eggs', 12, 'units'),
            (2, 'Chicken', 1000, 'g'),
            (2, 'Rice', 2, 'kg');
        `;

        // Execute sample data insertion
        await pool.query(sampleData);
        console.log('Sample data inserted successfully');

        console.log('Database initialization completed successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

// Run the initialization
initializeDatabase().catch(console.error); 