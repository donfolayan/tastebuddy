import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

function RecipeDetails() {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoId, setVideoId] = useState(null);
  const [standardizedTitle, setStandardizedTitle] = useState('');
  const { id } = useParams();

  const DEFAULT_VIDEO_ID = 'eY1FF6SEggk';

  const searchYoutubeVideo = async (searchQuery) => {
    try {
      const response = await api.get(`/recipes/youtube-search/${encodeURIComponent(searchQuery)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching YouTube:', error);
      return null;
    }
  };

  const standardizeRecipeTitle = (youtubeTitle) => {
    // Remove common YouTube title elements
    let title = youtubeTitle
      .replace(/\|.*$/, '') // Remove everything after |
      .replace(/\-.*$/, '') // Remove everything after -
      .replace(/(recipe|how to make|easy|homemade|best)/gi, '') // Remove common recipe words
      .replace(/[^\w\s]/g, '') // Remove special characters
      .trim()
      .split(' ')
      .filter(word => word.length > 0)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    return title;
  };

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/recipes/${id}`);
        const recipeData = response.data;

        // Search for a YouTube video first
        const searchQuery = `${recipeData.title} recipe`;
        const videoData = await searchYoutubeVideo(searchQuery);

        if (videoData) {
          const standardizedTitle = standardizeRecipeTitle(videoData.title);
          setVideoId(videoData.videoId);
          setStandardizedTitle(standardizedTitle);
          
          // Update recipe with standardized title
          setRecipe({
            ...recipeData,
            title: standardizedTitle
          });
        } else {
          setVideoId(DEFAULT_VIDEO_ID);
          setRecipe(recipeData);
          setStandardizedTitle(recipeData.title);
        }
      } catch (err) {
        setError('Failed to load recipe details');
        console.error('Error fetching recipe:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-error p-4">
        {error}
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="text-center text-text-secondary p-4">
        Recipe not found
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-text-primary mb-6">
        {standardizedTitle}
      </h1>

      {videoId && (
        <div className="w-full mb-8">
          <div className="relative" style={{ paddingTop: '56.25%' }}>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&iv_load_policy=3&enablejsapi=0&disablekb=1&fs=1&color=white`}
              title={standardizedTitle}
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-presentation"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
            ></iframe>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-background-secondary p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Ingredients</h2>
          <ul className="space-y-2">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="text-text-secondary">
                {ingredient}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-background-secondary p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Instructions</h2>
          <ol className="space-y-4">
            {recipe.instructions.map((step, index) => (
              <li key={index} className="text-text-secondary">
                <span className="font-medium text-primary mr-2">{index + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>

      {recipe.missingIngredients && recipe.missingIngredients.length > 0 && (
        <div className="mt-8 bg-background-secondary p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Missing Ingredients</h2>
          <ul className="space-y-2">
            {recipe.missingIngredients.map((ingredient, index) => (
              <li key={index} className="text-error">
                {ingredient}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default RecipeDetails; 