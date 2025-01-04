const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');

// Get all recipes
router.get('/', recipeController.getAllRecipes);

// Get mood-based recommendations
router.post('/recommendations', recipeController.getRecommendations);

// Get single recipe
router.get('/:id', recipeController.getRecipeById);

// Get recipes by ingredients
router.post('/by-ingredients', recipeController.getRecipesByIngredients);

// Search YouTube for recipe videos
router.get('/youtube-search/:query', recipeController.searchYouTube);

module.exports = router; 