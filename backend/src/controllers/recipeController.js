const { getRecipeRecommendations } = require('../services/aiService');
const { generateRecipes } = require('../services/gemini');
const fetch = require('node-fetch');

// In-memory storage for recipes (temporary solution)
let recipeStore = new Map();

const recipeController = {
    // Get all recipes
    getAllRecipes: async (req, res) => {
        try {
            // For testing, return dummy data
            const recipes = [
                {
                    id: 1,
                    title: 'Spaghetti Carbonara',
                    description: 'Classic Italian pasta dish with creamy egg sauce',
                    cookingTime: 30,
                    difficultyLevel: 'Medium',
                    cuisineType: 'Italian',
                    ingredients: [
                        '200g spaghetti',
                        '100g pancetta',
                        '2 large eggs',
                        '50g Pecorino Romano'
                    ]
                },
                {
                    id: 2,
                    title: 'Vegetable Stir-Fry',
                    description: 'Quick and healthy Asian-inspired dish',
                    cookingTime: 20,
                    difficultyLevel: 'Easy',
                    cuisineType: 'Asian',
                    ingredients: [
                        'Mixed vegetables',
                        'Tofu',
                        'Soy sauce',
                        'Ginger'
                    ]
                },
                {
                    id: 3,
                    title: 'Chicken Curry',
                    description: 'Aromatic and flavorful curry dish',
                    cookingTime: 45,
                    difficultyLevel: 'Medium',
                    cuisineType: 'Indian',
                    ingredients: [
                        'Chicken thighs',
                        'Curry powder',
                        'Coconut milk',
                        'Onions'
                    ]
                }
            ];
            res.json(recipes);
        } catch (error) {
            console.error('Error fetching recipes:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // Get mood-based recommendations
    getRecommendations: async (req, res) => {
        try {
            const { mood, userPreferences } = req.body;
            console.log('Received request:', { mood, userPreferences });

            if (!mood) {
                return res.status(400).json({ error: 'Mood is required' });
            }

            const aiRecommendations = await getRecipeRecommendations(mood, userPreferences);
            console.log('AI Response:', aiRecommendations);

            if (!aiRecommendations || !aiRecommendations.recipes) {
                console.error('Invalid AI response:', aiRecommendations);
                return res.status(500).json({ 
                    error: 'Invalid response format from AI service',
                    details: process.env.NODE_ENV === 'development' ? aiRecommendations : undefined
                });
            }

            const recommendations = {
                recipes: aiRecommendations.recipes.map((recipe, index) => {
                    const recipeId = Date.now() + index;
                    const recipeWithId = {
                        id: recipeId,
                        ...recipe
                    };
                    // Store the recipe
                    recipeStore.set(recipeId, recipeWithId);
                    return recipeWithId;
                })
            };

            res.json(recommendations);
        } catch (error) {
            console.error('Recommendation error:', error);
            res.status(500).json({ 
                error: 'Failed to get recommendations',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Get single recipe by ID
    getRecipeById: async (req, res) => {
        try {
            const { id } = req.params;
            
            // Try to get recipe from store
            const recipe = recipeStore.get(parseInt(id));
            
            if (recipe) {
                return res.json(recipe);
            }

            // If not found, return 404
            res.status(404).json({ error: 'Recipe not found' });
        } catch (error) {
            console.error('Error fetching recipe:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // Helper function to normalize ingredient names
    normalizeIngredient: (ingredient) => {
        return ingredient
            .toLowerCase()
            .trim()
            // Remove common units and quantities
            .replace(/\d+(\.\d+)?(\s*)(g|kg|ml|l|cup|cups|tbsp|tsp|teaspoon|tablespoon|pound|lb|oz|ounce)s?\b/g, '')
            // Remove common words
            .replace(/\b(fresh|dried|chopped|sliced|diced|minced|ground|powdered|of)\b/g, '')
            // Remove extra spaces
            .replace(/\s+/g, ' ')
            // Remove common plurals
            .replace(/s\b/g, '')
            .trim();
    },

    // Get recipes by ingredients
    getRecipesByIngredients: async (req, res) => {
        try {
            const { ingredients, includePartialMatches, maxAdditionalIngredients } = req.body;

            if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
                return res.status(400).json({ error: 'Valid ingredients array is required' });
            }

            // Normalize user ingredients
            const normalizedUserIngredients = ingredients.map(ing => recipeController.normalizeIngredient(ing));
            console.log('Normalized user ingredients:', normalizedUserIngredients);

            try {
                const prompt = `Given these ingredients: ${ingredients.join(', ')}.
                Please suggest 3 recipes that can be made with these ingredients.
                If possible, also suggest recipes that require up to ${maxAdditionalIngredients} additional ingredients.
                
                Format the response as a JSON object with a 'recipes' array. Each recipe must have:
                {
                    "recipes": [
                        {
                            "title": "Recipe Name",
                            "description": "Brief description",
                            "cookingTime": 30,
                            "difficultyLevel": "Easy/Medium/Hard",
                            "cuisineType": "Type of cuisine",
                            "ingredients": ["ingredient1", "ingredient2", "..."],
                            "instructions": ["Step 1", "Step 2", "..."],
                            "requiredIngredients": ["Only the ingredients needed for this recipe"],
                            "videoUrl": "A valid YouTube video URL"
                        }
                    ]
                }

                The response must be valid JSON and follow this exact format. Do not include any additional text or explanations outside the JSON structure.`;

                const response = await generateRecipes(prompt);
                
                if (!response.recipes || !Array.isArray(response.recipes)) {
                    throw new Error('Invalid response format from AI');
                }

                // Process recipes and store them
                const processedRecipes = response.recipes.map((recipe, index) => {
                    const recipeId = Date.now() + index;
                    
                    // Normalize recipe's required ingredients
                    const normalizedRequiredIngredients = recipe.requiredIngredients.map(ing => recipeController.normalizeIngredient(ing));
                    console.log(`Recipe ${recipe.title} normalized ingredients:`, normalizedRequiredIngredients);

                    // Find missing ingredients
                    const missingIngredients = recipe.requiredIngredients.filter((ingredient, idx) => {
                        const normalizedIngredient = normalizedRequiredIngredients[idx];
                        return !normalizedUserIngredients.some(userIng => 
                            normalizedIngredient.includes(userIng) || userIng.includes(normalizedIngredient)
                        );
                    });

                    const recipeWithId = {
                        id: recipeId,
                        ...recipe,
                        ...(missingIngredients.length > 0 ? { missingIngredients } : {})
                    };
                    // Store the recipe
                    recipeStore.set(recipeId, recipeWithId);
                    return recipeWithId;
                });

                res.json({ recipes: processedRecipes });
            } catch (aiError) {
                console.log('Gemini API failed, using mock data:', aiError);
                
                // Use mock data and store it
                const mockIngredientRecipes = {
                    recipes: [
                        {
                            id: 1,
                            title: "Simple Pasta Dish",
                            description: "A quick and easy pasta dish with common ingredients",
                            cookingTime: 20,
                            difficultyLevel: "Easy",
                            cuisineType: "Italian",
                            ingredients: ["Pasta", "Olive oil", "Garlic", "Salt", "Pepper", "Parmesan cheese"],
                            instructions: [
                                "Boil pasta according to package instructions",
                                "Sauté garlic in olive oil",
                                "Combine pasta with garlic oil",
                                "Season with salt and pepper",
                                "Top with parmesan cheese"
                            ],
                            requiredIngredients: ["Pasta", "Olive oil", "Garlic"],
                            videoUrl: "https://www.youtube.com/watch?v=bJUiWdM__Qw"
                        },
                        {
                            id: 2,
                            title: "Basic Omelette",
                            description: "A fluffy omelette that's perfect for any time of day",
                            cookingTime: 15,
                            difficultyLevel: "Easy",
                            cuisineType: "French",
                            ingredients: ["Eggs", "Butter", "Salt", "Pepper", "Cheese", "Herbs"],
                            instructions: [
                                "Beat eggs with salt and pepper",
                                "Melt butter in pan",
                                "Pour eggs and cook until set",
                                "Add cheese and fold",
                                "Garnish with herbs"
                            ],
                            requiredIngredients: ["Eggs", "Butter", "Salt"],
                            videoUrl: "https://www.youtube.com/watch?v=OQyRuOEKfVk"
                        },
                        {
                            id: 3,
                            title: "Rice Stir-Fry",
                            description: "A versatile stir-fry that works with any vegetables",
                            cookingTime: 25,
                            difficultyLevel: "Medium",
                            cuisineType: "Asian Fusion",
                            ingredients: ["Rice", "Vegetables", "Soy sauce", "Oil", "Garlic", "Ginger"],
                            instructions: [
                                "Cook rice according to package instructions",
                                "Stir-fry vegetables with garlic and ginger",
                                "Add rice and soy sauce",
                                "Mix well and serve hot"
                            ],
                            requiredIngredients: ["Rice", "Vegetables", "Soy sauce"],
                            videoUrl: "https://www.youtube.com/watch?v=eY1FF6SEggk"
                        }
                    ]
                };

                const processedMockRecipes = mockIngredientRecipes.recipes.map(recipe => {
                    const recipeId = recipe.id;
                    
                    // Normalize recipe's required ingredients
                    const normalizedRequiredIngredients = recipe.requiredIngredients.map(ing => recipeController.normalizeIngredient(ing));
                    
                    // Find missing ingredients
                    const missingIngredients = recipe.requiredIngredients.filter((ingredient, idx) => {
                        const normalizedIngredient = normalizedRequiredIngredients[idx];
                        return !normalizedUserIngredients.some(userIng => 
                            normalizedIngredient.includes(userIng) || userIng.includes(normalizedIngredient)
                        );
                    });

                    const recipeWithMissing = {
                        ...recipe,
                        ...(missingIngredients.length > 0 ? { missingIngredients } : {})
                    };
                    // Store the recipe
                    recipeStore.set(recipeId, recipeWithMissing);
                    return recipeWithMissing;
                });

                res.json({ recipes: processedMockRecipes });
            }
        } catch (error) {
            console.error('Error getting recipes by ingredients:', error);
            res.status(500).json({ 
                error: 'Failed to get recipes',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Search YouTube for recipe videos
    searchYouTube: async (req, res) => {
        try {
            const { query } = req.params;
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${encodeURIComponent(query + ' recipe cooking')}&key=${process.env.YOUTUBE_API_KEY}&type=video&videoCategoryId=26&relevanceLanguage=en&order=relevance&videoDuration=medium`
            );
            const data = await response.json();
            
            if (data.items && data.items.length > 0) {
                const video = data.items[0];
                // Get video details to ensure it's a valid cooking video
                const videoDetailsResponse = await fetch(
                    `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${video.id.videoId}&key=${process.env.YOUTUBE_API_KEY}`
                );
                const videoDetails = await videoDetailsResponse.json();
                
                if (videoDetails.items && videoDetails.items.length > 0) {
                    const videoInfo = videoDetails.items[0];
                    // Check if video title or description contains cooking-related terms
                    const isCookingVideo = /recipe|cooking|how to make|prepare|kitchen/i.test(
                        videoInfo.snippet.title + ' ' + videoInfo.snippet.description
                    );
                    
                    if (isCookingVideo) {
                        res.json({
                            videoId: video.id.videoId,
                            title: video.snippet.title,
                            viewCount: videoInfo.statistics.viewCount,
                            channelTitle: video.snippet.channelTitle
                        });
                        return;
                    }
                }
            }
            
            // If no suitable video found, return null
            res.json(null);
        } catch (error) {
            console.error('YouTube search error:', error);
            res.status(500).json({ error: 'Failed to search YouTube' });
        }
    }
};

module.exports = recipeController; 