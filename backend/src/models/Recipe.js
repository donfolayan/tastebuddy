const pool = require('../config/database');

class Recipe {
  // Recipe methods
  static async findAll({ page = 1, limit = 10, search, cuisine, ingredients } = {}) {
    const offset = (page - 1) * limit;
    let queryParams = [];
    let queryConditions = [];
    let baseQuery = `
      SELECT 
        id,
        title,
        description,
        ingredients,
        instructions,
        cooking_time,
        cuisine_type,
        difficulty_level,
        servings,
        image_url,
        created_at,
        updated_at
      FROM recipes`;

    // Full text search for recipe title and description
    if (search) {
      queryConditions.push(`(
        title ILIKE $${queryParams.length + 1} OR 
        description ILIKE $${queryParams.length + 1} OR
        cuisine_type ILIKE $${queryParams.length + 1}
      )`);
      queryParams.push(`%${search}%`);
    }

    // Cuisine type filter
    if (cuisine) {
      queryConditions.push(`cuisine_type ILIKE $${queryParams.length + 1}`);
      queryParams.push(`%${cuisine}%`);
    }

    // Ingredient search using JSONB containment
    if (ingredients && ingredients.length > 0) {
      const ingredientConditions = ingredients.map((_, index) => {
        queryParams.push(`%${ingredients[index].toLowerCase()}%`);
        return `ingredients::text ILIKE $${queryParams.length}`;
      });
      queryConditions.push(`(${ingredientConditions.join(' OR ')})`);
    }

    // Combine all conditions
    if (queryConditions.length > 0) {
      baseQuery += ` WHERE ${queryConditions.join(' AND ')}`;
    }

    // Add ordering and pagination
    baseQuery += ` ORDER BY created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    try {
      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) FROM recipes';
      if (queryConditions.length > 0) {
        countQuery += ` WHERE ${queryConditions.join(' AND ')}`;
      }
      const countResult = await pool.query(countQuery, queryParams.slice(0, -2));
      const totalCount = parseInt(countResult.rows[0].count);

      // Get paginated results
      const result = await pool.query(baseQuery, queryParams);
      
      // Parse ingredients and instructions if they're stored as strings
      const recipes = result.rows.map(recipe => ({
        ...recipe,
        ingredients: typeof recipe.ingredients === 'string' 
          ? JSON.parse(recipe.ingredients) 
          : recipe.ingredients,
        instructions: Array.isArray(recipe.instructions) 
          ? recipe.instructions 
          : JSON.parse(recipe.instructions)
      }));

      return {
        recipes,
        pagination: {
          total: totalCount,
          page,
          limit,
          pages: Math.ceil(totalCount / limit)
        }
      };
    } catch (error) {
      console.error('Error in findAll:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const result = await pool.query('SELECT * FROM recipes WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error in findById:', error);
      throw error;
    }
  }

  static async create(recipeData) {
    const {
      title,
      description,
      ingredients,
      instructions,
      cookingTime,
      cuisineType,
      difficultyLevel,
      servings,
      imageUrl,
      createdBy
    } = recipeData;

    try {
      const result = await pool.query(
        `INSERT INTO recipes (
          title, description, ingredients, instructions, cooking_time,
          cuisine_type, difficulty_level, servings, image_url, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
          title,
          description,
          JSON.stringify(ingredients),
          instructions,
          cookingTime,
          cuisineType,
          difficultyLevel,
          servings,
          imageUrl,
          createdBy
        ]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error in create:', error);
      throw error;
    }
  }

  static async update(id, recipeData) {
    const {
      title,
      description,
      ingredients,
      instructions,
      cookingTime,
      cuisineType,
      difficultyLevel,
      servings,
      imageUrl
    } = recipeData;

    try {
      const result = await pool.query(
        `UPDATE recipes
        SET title = $1, description = $2, ingredients = $3, instructions = $4,
            cooking_time = $5, cuisine_type = $6, difficulty_level = $7,
            servings = $8, image_url = $9, updated_at = CURRENT_TIMESTAMP
        WHERE id = $10
        RETURNING *`,
        [
          title,
          description,
          JSON.stringify(ingredients),
          instructions,
          cookingTime,
          cuisineType,
          difficultyLevel,
          servings,
          imageUrl,
          id
        ]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error in update:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const result = await pool.query('DELETE FROM recipes WHERE id = $1 RETURNING *', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error in delete:', error);
      throw error;
    }
  }
}

module.exports = Recipe; 