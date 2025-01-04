const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create({ email, password, preferences }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO users (email, password, preferences)
      VALUES ($1, $2, $3)
      RETURNING id, email, preferences;
    `;
    
    try {
      const result = await db.query(query, [email, hashedPassword, preferences]);
      return result.rows[0];
    } catch (error) {
      throw new Error('Error creating user');
    }
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query(query, [email]);
    return result.rows[0];
  }
}

module.exports = User; 