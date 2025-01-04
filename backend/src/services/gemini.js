const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Gemini API client
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set in environment variables');
    throw new Error('GEMINI_API_KEY is required');
}

// Log environment check (but don't expose the key)
console.log('Environment Check:', {
    'NODE_ENV': process.env.NODE_ENV,
    'API Key exists': Boolean(GEMINI_API_KEY),
    'API Key length': GEMINI_API_KEY?.length
});

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

async function generateRecipes(prompt) {
    try {
        const generationConfig = {
            temperature: 0.7,
            topK: 40,
            topP: 0.8,
            maxOutputTokens: 1000,
        };

        // Combine context and prompt into a single user message
        const fullPrompt = `You are a helpful chef that provides recipe recommendations.
        Always respond with properly formatted JSON following the exact structure provided.
        Do not include any additional text, markdown formatting, or explanations.
        Ensure all JSON properties match the specified format exactly.
        For each recipe, you MUST include a valid YouTube video URL showing how to make the dish.
        Search for popular cooking channels like "Tasty", "Food Network", or "Bon Appetit" for the video URLs.

        Example response format:
        {
            "recipes": [
                {
                    "title": "Recipe Name",
                    "description": "Brief description",
                    "cookingTime": 30,
                    "difficultyLevel": "Easy/Medium/Hard",
                    "cuisineType": "Type of cuisine",
                    "ingredients": ["ingredient1", "ingredient2"],
                    "instructions": ["Step 1", "Step 2"],
                    "requiredIngredients": ["Only the ingredients needed"],
                    "videoUrl": "https://www.youtube.com/watch?v=VALID_VIDEO_ID"
                }
            ]
        }

        ${prompt}`;

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
            generationConfig,
        });

        const response = await result.response;
        const text = response.text();
        
        // Clean up the response text to ensure valid JSON
        const cleanedText = text
            .trim()
            // Remove any markdown code block markers
            .replace(/^```json\s*/, '')
            .replace(/^```\s*/, '')
            .replace(/```$/, '')
            // Remove any trailing commas before closing brackets/braces
            .replace(/,(\s*[}\]])/g, '$1')
            .trim();

        try {
            const parsedResponse = JSON.parse(cleanedText);
            
            // Validate the response structure
            if (!parsedResponse.recipes || !Array.isArray(parsedResponse.recipes)) {
                throw new Error('Response missing recipes array');
            }

            // Ensure each recipe has the required properties
            parsedResponse.recipes = parsedResponse.recipes.map(recipe => {
                // Normalize ingredients and required ingredients
                const normalizedIngredients = Array.isArray(recipe.ingredients) 
                    ? recipe.ingredients.map(ing => ing.trim())
                    : [];
                const normalizedRequiredIngredients = Array.isArray(recipe.requiredIngredients)
                    ? recipe.requiredIngredients.map(ing => ing.trim())
                    : recipe.ingredients ? recipe.ingredients.map(ing => ing.trim()) : [];

                // Generate a search-friendly recipe title
                const searchTitle = recipe.title
                    .toLowerCase()
                    .replace(/[^a-z0-9\s]/g, '')
                    .trim()
                    .replace(/\s+/g, ' ');

                // Ensure there's a valid video URL
                let videoUrl = recipe.videoUrl;
                if (!videoUrl || !videoUrl.includes('youtube.com/watch?v=')) {
                    // Generate a search URL if no valid video URL is provided
                    videoUrl = `https://www.youtube.com/watch?v=`;
                    // Add some popular video IDs for common recipes
                    const commonRecipeVideos = {
                        'pasta': 'bJUiWdM__Qw',
                        'omelette': 'OQyRuOEKfVk',
                        'stir fry': 'eY1FF6SEggk',
                        'curry': 'HOM-EQvrHMc',
                        'rice': 'KnBj4Dp0vbM',
                        'chicken': 'yKAM5-ZuRpo',
                        'default': 'eY1FF6SEggk'
                    };
                    
                    // Find a matching video or use default
                    const videoId = Object.entries(commonRecipeVideos).find(([key]) => 
                        searchTitle.includes(key))?.[1] || commonRecipeVideos.default;
                    videoUrl += videoId;
                }

                return {
                    title: recipe.title || 'Untitled Recipe',
                    description: recipe.description || 'No description available',
                    cookingTime: recipe.cookingTime || 30,
                    difficultyLevel: recipe.difficultyLevel || 'Medium',
                    cuisineType: recipe.cuisineType || 'Global',
                    ingredients: normalizedIngredients,
                    instructions: Array.isArray(recipe.instructions) ? recipe.instructions : [],
                    requiredIngredients: normalizedRequiredIngredients,
                    videoUrl: videoUrl
                };
            });

            return parsedResponse;
        } catch (parseError) {
            console.error('Failed to parse Gemini response as JSON:', cleanedText);
            throw new Error('Invalid JSON response from Gemini');
        }
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw error;
    }
}

module.exports = {
    generateRecipes
}; 