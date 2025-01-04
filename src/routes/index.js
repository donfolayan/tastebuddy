const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const recipeRoutes = require('./recipe.routes');
const userRoutes = require('./user.routes');
const recommendationRoutes = require('./recommendation.routes');

router.use('/auth', authRoutes);
router.use('/recipes', recipeRoutes);
router.use('/users', userRoutes);
router.use('/recommendations', recommendationRoutes);

module.exports = router; 