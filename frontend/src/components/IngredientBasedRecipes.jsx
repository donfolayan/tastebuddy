import { useState } from 'react';
import api from '../services/api';

function IngredientBasedRecipes({ onRecipesFound }) {
  const [ingredients, setIngredients] = useState([]);
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddIngredient = (ingredient) => {
    const trimmedIngredient = ingredient.trim();
    if (trimmedIngredient) {
      setIngredients(prev => [...prev, trimmedIngredient]);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    
    // Check if the input ends with a comma
    if (value.endsWith(',')) {
      // Split by comma and add all non-empty ingredients
      const newIngredients = value
        .split(',')
        .map(ing => ing.trim())
        .filter(ing => ing.length > 0);
      
      // Add all new ingredients
      newIngredients.forEach(handleAddIngredient);
      setCurrentIngredient('');
    } else {
      setCurrentIngredient(value);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      // Split by comma in case there are multiple ingredients
      const newIngredients = currentIngredient
        .split(',')
        .map(ing => ing.trim())
        .filter(ing => ing.length > 0);
      
      // Add all new ingredients
      newIngredients.forEach(handleAddIngredient);
      setCurrentIngredient('');
    }
  };

  const handleRemoveIngredient = (index) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Add any remaining ingredient in the input
    if (currentIngredient.trim()) {
      const newIngredients = currentIngredient
        .split(',')
        .map(ing => ing.trim())
        .filter(ing => ing.length > 0);
      newIngredients.forEach(handleAddIngredient);
      setCurrentIngredient('');
    }

    if (ingredients.length === 0) return;

    setLoading(true);
    try {
      const response = await api.post('/recipes/by-ingredients', {
        ingredients,
        includePartialMatches: true,
        maxAdditionalIngredients: 3
      });

      if (response.data && response.data.recipes) {
        onRecipesFound(response.data.recipes);
      } else {
        console.error('Invalid response format:', response.data);
        throw new Error('No recipes found');
      }
    } catch (error) {
      console.error('Error finding recipes:', error);
      onRecipesFound([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface rounded-lg p-6 mb-8">
      <h3 className="text-xl font-bold text-text-primary mb-4">
        What's in Your Kitchen?
      </h3>
      <p className="text-text-secondary mb-4">
        List your available ingredients and we'll suggest recipes you can make.
        Separate ingredients with commas or press Enter.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={currentIngredient}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter ingredients (e.g., eggs, milk, flour)..."
            className="flex-1 bg-card border border-gray-700 rounded px-4 py-2 text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-secondary-accent"
          />
          <button
            type="button"
            onClick={() => {
              if (currentIngredient.trim()) {
                handleAddIngredient(currentIngredient);
                setCurrentIngredient('');
              }
            }}
            className="bg-secondary-accent hover:bg-secondary-accent-dark text-white px-4 py-2 rounded transition-colors"
          >
            Add
          </button>
        </div>

        {/* Ingredient Tags */}
        <div className="flex flex-wrap gap-2">
          {ingredients.map((ingredient, index) => (
            <span
              key={index}
              className="bg-card px-3 py-1 rounded-full text-sm text-text-primary flex items-center"
            >
              {ingredient}
              <button
                type="button"
                onClick={() => handleRemoveIngredient(index)}
                className="ml-2 text-text-tertiary hover:text-text-primary"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <button
          type="submit"
          disabled={ingredients.length === 0 || loading}
          className={`w-full bg-secondary-accent hover:bg-secondary-accent-dark text-white py-2 rounded transition-colors ${
            (ingredients.length === 0 || loading) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Finding Recipes...' : 'Find Recipes'}
        </button>
      </form>
    </div>
  );
}

export default IngredientBasedRecipes; 