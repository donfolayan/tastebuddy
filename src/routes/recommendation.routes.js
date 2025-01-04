const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const RecommendationService = require('../services/RecommendationService');

// Get personalized recommendations
router.get('/personalized', auth, async (req, res) => {
  try {
    const recommendations = await RecommendationService.getPersonalizedRecommendations(req.user.userId);
    res.json(recommendations);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get mood-based recommendations
router.post('/mood', auth, async (req, res) => {
  try {
    const { mood } = req.body;
    const recommendations = await RecommendationService.getMoodBasedRecommendations(mood);
    res.json(recommendations);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router; 