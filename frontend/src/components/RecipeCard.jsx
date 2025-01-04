import { useNavigate } from 'react-router-dom';

function RecipeCard({ recipe }) {
  const navigate = useNavigate();
  const missingIngredientsCount = recipe.missingIngredients?.length || 0;

  const handleClick = () => {
    navigate(`/recipe/${recipe.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      className="group cursor-pointer transition-transform hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-3">
        <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
        {/* Add actual image when available */}
        {/* <img 
          src={recipe.image} 
          alt={recipe.title}
          className="w-full h-full object-cover"
        /> */}
      </div>
      <h3 className="font-display text-lg mb-1 group-hover:text-primary">
        {recipe.title}
      </h3>
      <p className="text-gray-500 text-sm line-clamp-2 mb-2">
        {recipe.description}
      </p>
      <div className="flex items-center space-x-4 text-sm text-gray-600">
        <span className="flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {recipe.cookingTime} mins
        </span>
        <span className="flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          {recipe.difficultyLevel}
        </span>
      </div>
      {missingIngredientsCount > 0 && (
        <div className="mb-2">
          <span className="inline-block bg-surface text-text-secondary text-sm px-2 py-1 rounded">
            Needs {missingIngredientsCount} more {missingIngredientsCount === 1 ? 'ingredient' : 'ingredients'}
          </span>
        </div>
      )}
      {recipe.missingIngredients && (
        <div className="mt-2 text-sm text-text-tertiary">
          Missing: {recipe.missingIngredients.join(', ')}
        </div>
      )}
    </div>
  );
}

export default RecipeCard; 