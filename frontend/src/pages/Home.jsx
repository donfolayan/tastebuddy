import { useState, useEffect } from 'react';
import api from '../services/api';
import RecipeCard from '../components/RecipeCard';
import MoodSelector from '../components/MoodSelector';
import PreferenceForm from '../components/PreferenceForm';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import FilterButton from '../components/FilterButton';
import IngredientBasedRecipes from '../components/IngredientBasedRecipes';

function Home() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState(null);
  const [error, setError] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [recommendationSource, setRecommendationSource] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const response = await api.get('/recipes');
      console.log('Fetched recipes:', response.data);
      setRecipes(response.data);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setError('Failed to fetch recipes');
    } finally {
      setLoading(false);
    }
  };

  const getMoodBasedRecommendations = async (mood) => {
    try {
      setLoading(true);
      setSelectedMood(mood);
      setError(null);
      setRecommendationSource('mood');
      
      const location = await getUserLocation();
      
      const response = await api.post('/recipes/recommendations', {
        mood,
        userPreferences: {
          dietary: user?.preferences?.dietary || [],
          cuisines: user?.preferences?.cuisines || [],
          spicePreference: user?.preferences?.spiceLevel || 'Medium',
          allergies: user?.preferences?.allergies || [],
          cookingExperience: user?.preferences?.cookingExperience || 'Beginner',
          location: location,
          seasonalPreferences: getCurrentSeason()
        }
      });

      console.log('Mood-based recommendations:', response.data);
      if (response.data && response.data.recipes && response.data.recipes.length > 0) {
        setRecipes(response.data.recipes);
      } else {
        setError('No recipes found for this mood');
        setRecipes([]);
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
      setError('Failed to get recommendations');
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get user's location
  const getUserLocation = async () => {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  };

  // Helper function to get current season
  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'Spring';
    if (month >= 5 && month <= 7) return 'Summer';
    if (month >= 8 && month <= 10) return 'Fall';
    return 'Winter';
  };

  const handleGuestPreferences = async (preferences) => {
    try {
      setLoading(true);
      setRecommendationSource('preferences');
      const response = await api.post('/recipes/guest-recommendations', {
        preferences,
        limit: 3 // Limit to 3 recipes for non-logged-in users
      });
      setRecipes(response.data);
      setShowLoginPrompt(true); // Show login prompt after showing results
    } catch (error) {
      console.error('Error getting recommendations:', error);
      setError('Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    try {
      setLoading(true);
      setRecommendationSource('search');
      const response = await api.post('/recipes/search', {
        query,
        filters: {
          page: 1,
          limit: 20,
          ...(user?.preferences?.cuisineType && { cuisine: user.preferences.cuisineType })
        }
      });
      
      if (response.data?.status === 'success') {
        setRecipes(response.data.data);
      } else {
        setError('No recipes found');
        setRecipes([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to search recipes');
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterApply = async (filters) => {
    try {
      setLoading(true);
      setRecommendationSource('filter');
      const response = await api.post('/recipes/filter', {
        ...filters,
        userId: user?.id
      });
      setRecipes(response.data);
    } catch (error) {
      console.error('Filter error:', error);
      setError('Failed to filter recipes');
    } finally {
      setLoading(false);
    }
  };

  const handleIngredientBasedRecipes = (recipes) => {
    setRecipes(recipes);
    setRecommendationSource('ingredients');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-text-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse" data-testid="loading-skeleton">
            <div className="h-12 w-3/4 bg-card rounded mb-4"></div>
            <div className="h-6 w-1/2 bg-card rounded mb-12"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-card rounded-lg p-6 space-y-4">
                  <div className="h-6 bg-card-hover rounded w-3/4"></div>
                  <div className="h-4 bg-card-hover rounded w-full"></div>
                  <div className="h-4 bg-card-hover rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-text-primary mb-4">
            Discover Delicious Recipes
          </h2>
          <p className="text-text-secondary text-lg mb-8">
            Find the perfect recipe for your mood
          </p>
          <div className="flex items-center space-x-4 mb-8">
            <SearchBar onSearch={handleSearch} />
            <FilterButton onApplyFilters={handleFilterApply} />
          </div>
        </div>

        {recommendationSource === 'search' && recipes.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-text-primary mb-8 text-center">
              Search Results
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </div>
        )}

        {!user && (
          <div className="mb-16">
            <PreferenceForm onSubmit={handleGuestPreferences} />
            {recommendationSource === 'preferences' && recipes.length > 0 && (
              <>
                <h3 className="text-2xl font-bold text-text-primary mb-8 mt-8">
                  Recipes Based on Your Preferences
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {recipes.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {error && (
          <div className="bg-error/10 text-error p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {showLoginPrompt && !user && (
          <div className="bg-card p-8 rounded-lg mb-16 text-white">
            <p className="font-display text-2xl mb-4">Want more personalized recommendations?</p>
            <p className="text-gray-300 mb-4">Create an account to unlock all features:</p>
            <ul className="list-none space-y-3 mb-6">
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Get unlimited recipe recommendations
              </li>
              {/* Add similar styling for other list items */}
            </ul>
            <Link
              to="/register"
              className="inline-block bg-primary hover:bg-primary-dark text-white font-medium px-8 py-3 rounded-full transition-colors"
            >
              Get Started
            </Link>
          </div>
        )}

        {recommendationSource === 'filter' && recipes.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-text-primary mb-8 text-center">
              Filtered Recipes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-8">
          <MoodSelector onMoodSelect={getMoodBasedRecommendations} />
          {recommendationSource === 'mood' && recipes.length > 0 && (
            <>
              <h3 className="text-2xl font-bold text-text-primary mb-8 mt-8">
                Recipes for Your {selectedMood} Mood
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {recipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            </>
          )}
        </div>

        {user && (
          <div className="mt-8">
            <IngredientBasedRecipes onRecipesFound={handleIngredientBasedRecipes} />
            {recommendationSource === 'ingredients' && recipes.length > 0 && (
              <>
                <h3 className="text-2xl font-bold text-text-primary mb-8 mt-8">
                  Recipes from Your Kitchen
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {recipes.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home; 