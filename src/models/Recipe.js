const db = require('../config/database');

class Recipe {
  static async create(recipeData) {
    const {
      title,
      description,
      ingredients,
      instructions,
      cuisine_type,
      dietary_tags,
      prep_time,
      cooking_time,
      difficulty_level
    } = recipeData;

    const query = `
      INSERT INTO recipes (
        title, description, ingredients, instructions, 
        cuisine_type, dietary_tags, prep_time, 
        cooking_time, difficulty_level
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;

    try {
      const result = await db.query(query, [
        title, description, ingredients, instructions,
        cuisine_type, dietary_tags, prep_time,
        cooking_time, difficulty_level
      ]);
      return result.rows[0];
    } catch (error) {
      throw new Error('Error creating recipe');
    }
  }

  static async findAll(filters = {}) {
    let query = 'SELECT * FROM recipes';
    const values = [];
    const conditions = [];

    if (filters.cuisine_type) {
      conditions.push(`cuisine_type = $${values.length + 1}`);
      values.push(filters.cuisine_type);
    }

    if (filters.dietary_tags) {
      conditions.push(`$${values.length + 1} = ANY(dietary_tags)`);
      values.push(filters.dietary_tags);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    const result = await db.query(query, values);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM recipes WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Recipe; 