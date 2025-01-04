const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const safeJSONParse = (text) => {
  try {
    // First try direct parsing
    return JSON.parse(text);
  } catch (e) {
    // If that fails, try to extract JSON from the text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e2) {
        throw new Error('Could not parse JSON from response');
      }
    }
    throw new Error('No JSON found in response');
  }
};

const validateRecipeData = (data) => {
  const required = ['title', 'ingredients', 'instructions', 'cookingTime', 'difficultyLevel', 'cuisineType'];
  const missing = required.filter(field => !data[field]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  if (!Array.isArray(data.ingredients) || !Array.isArray(data.instructions)) {
    throw new Error('Ingredients and instructions must be arrays');
  }

  return {
    title: String(data.title),
    ingredients: data.ingredients.map(String),
    instructions: data.instructions.map(String),
    cookingTime: Number(data.cookingTime) || 30,
    difficultyLevel: String(data.difficultyLevel),
    cuisineType: String(data.cuisineType)
  };
};

router.post('/analyze', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Generate content with safety options
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    const response = await result.response;
    const text = response.text();
    
    // Parse and validate the response
    const parsedData = safeJSONParse(text);
    const validatedData = validateRecipeData(parsedData);
    
    res.json(validatedData);
  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(400).json({ 
      error: 'Failed to analyze recipe',
      details: error.message 
    });
  }
});

module.exports = router; 