const { generateRecipes } = require('./gemini');

// Mock recipe data
const mockRecipes = {
    happy: [
        {
            id: 1,
            title: "Colorful Summer Salad",
            description: "A vibrant and refreshing salad perfect for a sunny day",
            cookingTime: 15,
            difficultyLevel: "Easy",
            cuisineType: "Mediterranean",
            ingredients: ["Mixed greens", "Cherry tomatoes", "Avocado", "Cucumber", "Citrus dressing"],
            instructions: [
                "Wash and chop all vegetables",
                "Mix greens in a large bowl",
                "Add tomatoes, avocado, and cucumber",
                "Drizzle with citrus dressing",
                "Toss gently and serve"
            ],
            requiredIngredients: ["Mixed greens", "Cherry tomatoes", "Avocado"],
            videoUrl: "https://www.youtube.com/watch?v=YN4VVjHx_v0"
        },
        {
            id: 2,
            title: "Berry Smoothie Bowl",
            description: "A delightful and nutritious breakfast bowl",
            cookingTime: 10,
            difficultyLevel: "Easy",
            cuisineType: "Healthy",
            ingredients: ["Mixed berries", "Banana", "Greek yogurt", "Honey", "Granola"],
            instructions: [
                "Blend berries, banana, and yogurt",
                "Pour into a bowl",
                "Top with granola and honey",
                "Add fresh berries for garnish"
            ],
            requiredIngredients: ["Mixed berries", "Banana", "Greek yogurt"],
            videoUrl: "https://www.youtube.com/watch?v=rpNtKOTJ2BM"
        }
    ],
    stressed: [
        {
            id: 4,
            title: "Comforting Mac and Cheese",
            description: "Classic comfort food with a creamy cheese sauce",
            cookingTime: 30,
            difficultyLevel: "Medium",
            cuisineType: "American",
            ingredients: ["Macaroni", "Cheddar cheese", "Milk", "Butter", "Breadcrumbs"],
            instructions: [
                "Cook macaroni according to package",
                "Make cheese sauce with butter, milk, and cheese",
                "Combine pasta and sauce",
                "Top with breadcrumbs",
                "Bake until golden"
            ],
            requiredIngredients: ["Macaroni", "Cheddar cheese", "Milk"],
            videoUrl: "https://www.youtube.com/watch?v=FUeyrEN14Rk"
        }
    ]
};

const getRecipeRecommendations = async (mood, preferences) => {
    try {
        const prompt = `Generate exactly 3 recipes for a user who is feeling "${mood}" with these preferences: ${JSON.stringify(preferences)}.

        Return ONLY a JSON object with this exact structure:
        {
            "recipes": [
                {
                    "title": "Recipe Name",
                    "description": "A brief and clear description",
                    "cookingTime": 30,
                    "difficultyLevel": "Easy/Medium/Hard",
                    "cuisineType": "Type of cuisine",
                    "ingredients": ["ingredient1", "ingredient2", "..."],
                    "instructions": ["Step 1", "Step 2", "..."],
                    "requiredIngredients": ["main ingredient1", "main ingredient2"],
                    "videoUrl": "A YouTube video URL showing how to make this dish (e.g., https://www.youtube.com/watch?v=...)"
                }
            ]
        }

        Rules:
        1. Generate exactly 3 recipes
        2. All fields are required
        3. cookingTime must be a number in minutes
        4. difficultyLevel must be one of: Easy, Medium, Hard
        5. ingredients and instructions must be arrays of strings
        6. requiredIngredients should list only the essential ingredients
        7. videoUrl should be a valid YouTube video URL showing how to make this specific dish
        8. Response must be valid JSON
        9. Do not include any text outside the JSON structure`;

        try {
            const response = await generateRecipes(prompt);
            
            if (!response.recipes || !Array.isArray(response.recipes)) {
                throw new Error('Invalid response format from AI');
            }

            return response;
        } catch (aiError) {
            console.log('Gemini API failed, using mock data:', aiError);
            return {
                recipes: mockRecipes[mood.toLowerCase()] || mockRecipes.happy
            };
        }
    } catch (error) {
        console.error('AI Service Error:', error);
        throw new Error('Failed to get recipe recommendations');
    }
};

module.exports = {
    getRecipeRecommendations
}; 