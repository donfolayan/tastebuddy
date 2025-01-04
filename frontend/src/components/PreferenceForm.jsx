import { useState } from 'react';

function PreferenceForm({ onSubmit }) {
  const [preferences, setPreferences] = useState({
    ingredients: [],
    tastePreference: '',
    dietaryRestrictions: [],
    cookingTime: '30',
    currentIngredient: ''
  });

  const handleIngredientAdd = () => {
    if (preferences.currentIngredient.trim()) {
      setPreferences(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, prev.currentIngredient.trim()],
        currentIngredient: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(preferences);
  };

  return (
    <div className="bg-surface rounded-lg p-8 shadow-lg">
      <h2 className="text-2xl font-bold text-text-primary mb-6">Tell us about your preferences</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Available Ingredients */}
        <div>
          <label className="block text-text-secondary mb-2">
            What ingredients do you have?
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={preferences.currentIngredient}
              onChange={(e) => setPreferences(prev => ({
                ...prev,
                currentIngredient: e.target.value
              }))}
              className="flex-1 bg-card border border-gray-600 rounded px-3 py-2 text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-secondary-accent"
              placeholder="Enter an ingredient"
            />
            <button
              type="button"
              onClick={handleIngredientAdd}
              className="bg-secondary-accent hover:bg-secondary-accent-dark text-white px-4 py-2 rounded transition-colors"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {preferences.ingredients.map((ingredient, index) => (
              <span
                key={index}
                className="bg-card px-3 py-1 rounded-full text-sm text-text-primary flex items-center"
              >
                {ingredient}
                <button
                  type="button"
                  onClick={() => setPreferences(prev => ({
                    ...prev,
                    ingredients: prev.ingredients.filter((_, i) => i !== index)
                  }))}
                  className="ml-2 text-text-tertiary hover:text-text-primary"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Taste Preference */}
        <div>
          <label className="block text-text-secondary mb-2">
            What type of food are you craving?
          </label>
          <select
            value={preferences.tastePreference}
            onChange={(e) => setPreferences(prev => ({
              ...prev,
              tastePreference: e.target.value
            }))}
            className="w-full bg-card border border-gray-600 rounded px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary-accent"
          >
            <option value="" className="bg-card">Select preference</option>
            <option value="sweet" className="bg-card">Sweet</option>
            <option value="savory" className="bg-card">Savory</option>
            <option value="spicy" className="bg-card">Spicy</option>
            <option value="healthy" className="bg-card">Healthy</option>
            <option value="comfort" className="bg-card">Comfort Food</option>
          </select>
        </div>

        {/* Dietary Restrictions */}
        <div>
          <label className="block text-text-secondary mb-2">
            Any dietary restrictions?
          </label>
          <div className="grid grid-cols-2 gap-3">
            {['vegetarian', 'vegan', 'gluten-free', 'dairy-free'].map((diet) => (
              <label key={diet} className="flex items-center space-x-2 text-text-primary">
                <input
                  type="checkbox"
                  checked={preferences.dietaryRestrictions.includes(diet)}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    dietaryRestrictions: e.target.checked
                      ? [...prev.dietaryRestrictions, diet]
                      : prev.dietaryRestrictions.filter(d => d !== diet)
                  }))}
                  className="form-checkbox bg-card border-gray-600 text-secondary-accent rounded focus:ring-secondary-accent focus:ring-offset-background"
                />
                <span className="capitalize">{diet}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Cooking Time */}
        <div>
          <label className="block text-text-secondary mb-2">
            Maximum cooking time (minutes)
          </label>
          <input
            type="number"
            value={preferences.cookingTime}
            onChange={(e) => setPreferences(prev => ({
              ...prev,
              cookingTime: e.target.value
            }))}
            className="w-full bg-card border border-gray-600 rounded px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary-accent"
            min="5"
            max="180"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-secondary-accent hover:bg-secondary-accent-dark text-white font-semibold py-3 rounded transition-colors"
        >
          Get Recommendations
        </button>
      </form>
    </div>
  );
}

export default PreferenceForm; 