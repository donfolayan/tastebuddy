import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

function Recipe() {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await api.get(`/recipes/${id}`);
        setRecipe(response.data);
      } catch (error) {
        console.error('Error fetching recipe:', error);
        setError('Failed to load recipe');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-text-primary">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-12 w-3/4 bg-card rounded mb-4"></div>
            <div className="h-6 w-1/2 bg-card rounded mb-12"></div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-4 bg-card rounded w-full"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-text-primary">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-900/20 text-red-500 p-4 rounded-md">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">{recipe.title}</h1>
        <p className="text-text-secondary mb-8">{recipe.description}</p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-card p-4 rounded-lg">
            <span className="block text-text-secondary">Time</span>
            <span className="text-lg">{recipe.cookingTime} mins</span>
          </div>
          <div className="bg-card p-4 rounded-lg">
            <span className="block text-text-secondary">Difficulty</span>
            <span className="text-lg">{recipe.difficultyLevel}</span>
          </div>
          <div className="bg-card p-4 rounded-lg">
            <span className="block text-text-secondary">Cuisine</span>
            <span className="text-lg">{recipe.cuisineType}</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Ingredients</h2>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="text-text-secondary">{ingredient}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Instructions</h2>
            <ol className="space-y-4">
              {recipe.instructions.map((step, index) => (
                <li key={index} className="text-text-secondary">
                  <span className="font-medium text-text-primary">{index + 1}.</span> {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Recipe; 