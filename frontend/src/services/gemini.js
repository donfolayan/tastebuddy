import api from './api';

export async function extractRecipeFromVideoContent(videoTitle, videoDescription) {
  try {
    const prompt = `
    You are a professional recipe curator. Your task is to analyze this YouTube cooking video content and extract a detailed recipe.
    You must respond with ONLY valid JSON, no other text.
    
    Video Title: "${videoTitle}"
    Video Description: "${videoDescription}"

    Follow these guidelines:

    1. Recipe Name:
       - Extract a clean, standardized name
       - Remove words like "how to", "recipe", "easy", etc.
       - Keep cuisine type if mentioned (e.g., "Italian", "Thai", etc.)

    2. Ingredients:
       - List all ingredients with precise measurements
       - Format as "2 cups flour" or "1 tablespoon olive oil"
       - Include all seasonings and garnishes
       - If exact measurements aren't given, provide reasonable estimates

    3. Instructions:
       - Break down into clear, numbered steps
       - Each step should be a single, specific action
       - Include cooking temperatures and times
       - Add any special notes or tips mentioned

    4. Additional Details:
       - Cooking Time: Total time in minutes (prep + cooking)
       - Difficulty Level: Must be exactly "Easy", "Medium", or "Hard"
       - Cuisine Type: Based on ingredients and cooking style

    You must respond with ONLY this exact JSON structure, no other text or explanations:
    {
      "title": "Clean recipe name",
      "ingredients": [
        "2 cups ingredient name",
        "1 tablespoon ingredient name"
      ],
      "instructions": [
        "Step 1 description",
        "Step 2 description"
      ],
      "cookingTime": 30,
      "difficultyLevel": "Easy",
      "cuisineType": "Cuisine name"
    }

    Important:
    - ONLY output valid JSON, no other text
    - All fields are required
    - cookingTime must be a number
    - ingredients and instructions must be arrays of strings
    - difficultyLevel must be exactly "Easy", "Medium", or "Hard"
    `;

    const response = await api.post('/ai/analyze', { prompt });
    return response.data;
  } catch (error) {
    console.error('Error extracting recipe from video:', error);
    throw error;
  }
} 