const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const Recipe = require('../models/Recipe');
const validate = require('../middleware/validator');
const { AppError } = require('../middleware/errorHandler');
const NodeCache = require('node-cache');

// Initialize cache with 5 minutes TTL
const cache = new NodeCache({ stdTTL: 300 });

// Validation rules
const recipeValidation = [
    body('title').trim().notEmpty().withMessage('Recipe title is required'),
    body('ingredients').isArray().withMessage('Ingredients must be an array'),
    body('instructions').trim().notEmpty().withMessage('Instructions are required'),
    body('cookingTime').isInt({ min: 1 }).withMessage('Valid cooking time is required'),
];

// Cache middleware
const cacheMiddleware = (duration) => (req, res, next) => {
    if (req.method !== 'GET') {
        return next();
    }

    const key = `__express__${req.originalUrl || req.url}`;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
        return res.json(cachedResponse);
    } else {
        res.originalJson = res.json;
        res.json = (body) => {
            cache.set(key, body, duration);
            res.originalJson(body);
        };
        next();
    }
};

// Clear cache middleware
const clearCache = () => {
    cache.flushAll();
};

// Get all recipes with efficient pagination and filtering
router.get('/', cacheMiddleware(300), async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search, cuisine } = req.query;
        const result = await Recipe.findAll({ 
            page: parseInt(page), 
            limit: parseInt(limit), 
            search, 
            cuisine 
        });
        res.json({
            status: 'success',
            data: result.recipes,
            pagination: result.pagination
        });
    } catch (error) {
        next(error);
    }
});

// Search recipes by ingredients with preferences
router.post('/search-by-ingredients', async (req, res, next) => {
    try {
        const { ingredients, preferences } = req.body;
        
        if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
            throw new AppError('Please provide a valid list of ingredients', 400);
        }

        // Convert ingredients array to lowercase for case-insensitive search
        const lowerIngredients = ingredients.map(ing => ing.toLowerCase());

        // Get recipes from database with ingredient filtering
        const { recipes } = await Recipe.findAll({
            ingredients: lowerIngredients,
            ...(preferences?.cuisineType && { cuisine: preferences.cuisineType }),
            limit: 50 // Increase limit for ingredient search
        });

        // Further filter recipes based on user preferences
        let matchedRecipes = recipes.filter(recipe => {
            // Check if recipe matches difficulty preference
            if (preferences?.skillLevel && 
                preferences.skillLevel !== recipe.difficulty_level) {
                return false;
            }

            // Check if recipe matches cooking time preference
            if (preferences?.maxCookingTime && 
                recipe.cooking_time > preferences.maxCookingTime) {
                return false;
            }

            // Check if recipe matches dietary restrictions
            if (preferences?.dietaryRestrictions) {
                const restrictions = preferences.dietaryRestrictions;
                const recipeIngredients = recipe.ingredients.map(ing => 
                    typeof ing === 'string' ? ing.toLowerCase() : ing.item.toLowerCase()
                );
                
                // Check against common ingredients for each restriction
                const restrictedIngredients = {
                    vegetarian: ['meat', 'chicken', 'beef', 'pork', 'fish'],
                    vegan: ['meat', 'chicken', 'beef', 'pork', 'fish', 'egg', 'milk', 'cheese', 'cream'],
                    glutenFree: ['flour', 'bread', 'pasta', 'wheat'],
                    dairyFree: ['milk', 'cheese', 'cream', 'butter', 'yogurt']
                };

                for (const restriction of restrictions) {
                    if (restrictedIngredients[restriction]) {
                        const hasRestrictedIngredient = recipeIngredients.some(ing =>
                            restrictedIngredients[restriction].some(restricted =>
                                ing.includes(restricted)
                            )
                        );
                        if (hasRestrictedIngredient) return false;
                    }
                }
            }

            return true;
        });

        // Sort recipes by number of matching ingredients (most matches first)
        matchedRecipes.sort((a, b) => {
            const aMatches = countMatches(a.ingredients, lowerIngredients);
            const bMatches = countMatches(b.ingredients, lowerIngredients);
            return bMatches - aMatches;
        });

        res.json({
            status: 'success',
            data: matchedRecipes
        });
    } catch (error) {
        console.error('Search error:', error);
        next(error);
    }
});

// Helper function to count matching ingredients
function countMatches(recipeIngredients, searchIngredients) {
    if (!recipeIngredients) return 0;
    
    let ingredients;
    try {
        ingredients = typeof recipeIngredients === 'string' 
            ? JSON.parse(recipeIngredients) 
            : recipeIngredients;
    } catch (error) {
        console.error('Error parsing ingredients:', error);
        return 0;
    }

    return ingredients.reduce((count, ing) => {
        const ingredientName = ing.item.toLowerCase();
        const matches = searchIngredients.some(searchIng => 
            ingredientName.includes(searchIng) || searchIng.includes(ingredientName)
        );
        return count + (matches ? 1 : 0);
    }, 0);
}

// Get single recipe with caching
router.get('/:id', cacheMiddleware(300), async (req, res, next) => {
    try {
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            throw new AppError('Recipe not found', 404);
        }

        res.json({
            status: 'success',
            data: recipe
        });
    } catch (error) {
        next(error);
    }
});

// Create new recipe
router.post('/', validate(recipeValidation), async (req, res, next) => {
    try {
        const recipe = await Recipe.create(req.body);
        clearCache();
        
        res.status(201).json({
            status: 'success',
            data: recipe
        });
    } catch (error) {
        next(error);
    }
});

// Update recipe
router.put('/:id', validate(recipeValidation), async (req, res, next) => {
    try {
        const recipe = await Recipe.update(req.params.id, req.body);

        if (!recipe) {
            throw new AppError('Recipe not found', 404);
        }

        clearCache();

        res.json({
            status: 'success',
            data: recipe
        });
    } catch (error) {
        next(error);
    }
});

// Delete recipe
router.delete('/:id', async (req, res, next) => {
    try {
        const recipe = await Recipe.delete(req.params.id);

        if (!recipe) {
            throw new AppError('Recipe not found', 404);
        }

        clearCache();

        res.json({
            status: 'success',
            message: 'Recipe deleted successfully'
        });
    } catch (error) {
        next(error);
    }
});

// Mood-based recipe search
router.post('/mood-search', async (req, res, next) => {
    try {
        const { mood, location, preferences } = req.body;
        
        if (!mood) {
            throw new AppError('Please provide a mood for recipe suggestions', 400);
        }

        // Create a prompt for Gemini that takes into account all factors
        const prompt = `Given the following information:
        - User's mood: ${mood}
        - Location: ${location || 'Not specified'}
        - Preferences: ${preferences ? JSON.stringify(preferences) : 'None specified'}

        Please suggest 3 recipes that would be perfect for someone in this mood and situation.
        Consider:
        - The emotional impact of different foods
        - Local ingredients and cuisine styles
        - Weather and seasonal factors based on location
        - Any dietary preferences provided

        Format the response as a JSON object with a 'recipes' array. Each recipe must have:
        {
            "recipes": [
                {
                    "title": "Recipe Name",
                    "description": "Brief description explaining why this recipe suits the mood",
                    "cookingTime": minutes,
                    "difficultyLevel": "Easy/Medium/Hard",
                    "cuisineType": "Type of cuisine",
                    "ingredients": ["ingredient1", "ingredient2", "..."],
                    "instructions": ["Step 1", "Step 2", "..."],
                    "moodBenefits": "How this recipe can positively impact the current mood",
                    "seasonalRelevance": "Why this recipe works for the current season/location"
                }
            ]
        }`;

        const response = await generateRecipes(prompt);
        
        if (!response.recipes || !Array.isArray(response.recipes)) {
            throw new Error('Invalid response format from AI');
        }

        res.json({
            status: 'success',
            data: response.recipes
        });
    } catch (error) {
        console.error('Mood search error:', error);
        next(error);
    }
});

// General recipe search endpoint
router.post('/search', async (req, res, next) => {
    try {
        const { query, filters = {} } = req.body;
        const { page = 1, limit = 10 } = filters;

        const result = await Recipe.findAll({ 
            page: parseInt(page), 
            limit: parseInt(limit),
            search: query,
            cuisine: filters.cuisine,
            ingredients: filters.ingredients
        });

        res.json({
            status: 'success',
            data: result.recipes,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Search error:', error);
        next(error);
    }
});

module.exports = router; 