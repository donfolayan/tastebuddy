const OpenAI = require('openai');
const Recipe = require('../models/Recipe');
const User = require('../models/User');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

class RecommendationService {
  static async getPersonalizedRecommendations(userId) {
    try {
      const user = await User.findById(userId);
      const userPreferences = user.preferences;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{
          role: "system",
          content: "You are a culinary expert providing personalized recipe recommendations."
        }, {
          role: "user",
          content: `Suggest recipes for a user with these preferences: ${JSON.stringify(userPreferences)}`
        }]
      });

      const suggestions = completion.choices[0].message.content;
      return this.processAISuggestions(suggestions);
    } catch (error) {
      throw new Error('Failed to generate recommendations');
    }
  }

  static async getMoodBasedRecommendations(mood) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{
          role: "system",
          content: "You are a culinary expert providing mood-based recipe recommendations."
        }, {
          role: "user",
          content: `Suggest recipes for someone feeling ${mood}`
        }]
      });

      const suggestions = completion.choices[0].message.content;
      return this.processAISuggestions(suggestions);
    } catch (error) {
      throw new Error('Failed to generate mood-based recommendations');
    }
  }

  static async processAISuggestions(suggestions) {
    // Process and format AI suggestions
    // This would include parsing the AI response and matching with database recipes
    return suggestions;
  }
}

module.exports = RecommendationService; 