const db = require('../config/database');

class User {
  constructor() {
    console.log('Initializing User model...');
  }

  async testConnection() {
    try {
      console.log('Testing database connection...');
      const result = await db.query('SELECT NOW()');
      console.log('Database connection successful:', result[0]);
      return result[0];
    } catch (error) {
      console.error('Error connecting to the database:', error.message);
      console.error('Stack trace:', error.stack);
      throw error;
    }
  }

  // User methods
  async create(userData) {
    const { username, email, password } = userData;
    const query = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *';
    const values = [username, email, password];
    
    try {
      const result = await db.one(query, values);
      return result;
    } catch (err) {
      console.error('Error creating user:', err);
      throw err;
    }
  }

  async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    try {
      const result = await db.oneOrNone(query, [email]);
      return result;
    } catch (err) {
      console.error('Error finding user by email:', err);
      throw err;
    }
  }

  async findById(id) {
    const query = 'SELECT * FROM users WHERE id = $1';
    try {
      const result = await db.oneOrNone(query, [id]);
      return result;
    } catch (err) {
      console.error('Error finding user by id:', err);
      throw err;
    }
  }
}

// Export a singleton instance
module.exports = new User(); 