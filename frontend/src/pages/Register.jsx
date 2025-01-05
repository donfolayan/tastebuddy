import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Predefined options for select fields
const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const CUISINES = ['Italian', 'Mexican', 'Chinese', 'Japanese', 'Indian', 'Thai', 'Mediterranean', 'American', 'French'];
const DIETARY_PREFERENCES = ['Vegetarian', 'Vegan', 'Pescatarian', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo'];
const COOKING_FREQUENCIES = ['Daily', 'Few times a week', 'Weekly', 'Occasionally'];
const MEAL_TYPES = ['Quick & Easy', 'Meal Prep', 'Gourmet', 'Healthy', 'Comfort Food', 'Budget-Friendly'];
const COMMON_ALLERGIES = ['Peanuts', 'Tree Nuts', 'Milk', 'Eggs', 'Soy', 'Wheat', 'Fish', 'Shellfish'];

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [dietaryPreferences, setDietaryPreferences] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [cookingSkillLevel, setCookingSkillLevel] = useState('');
  const [favoriteCuisines, setFavoriteCuisines] = useState([]);
  const [cookingFrequency, setCookingFrequency] = useState('');
  const [preferredMealTypes, setPreferredMealTypes] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      setError('');
      setLoading(true);
      await register({ 
        email, 
        password,
        username,
        dietaryPreferences,
        allergies,
        cookingSkillLevel,
        favoriteCuisines,
        cookingFrequency,
        preferredMealTypes
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create an account');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMultiSelect = (e, setter) => {
    const options = Array.from(e.target.selectedOptions, option => option.value);
    setter(options);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold text-text-primary">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
              Sign in
            </Link>
          </p>
        </div>

        {error && (
          <div className="bg-error/10 text-error p-4 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Required Fields */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-background border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-text-primary">
                Username (optional)
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-background border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-primary">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-background border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-text-primary">
                Confirm password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-background border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Optional Fields Toggle */}
            <div className="pt-4">
              <button
                type="button"
                onClick={() => setShowOptionalFields(!showOptionalFields)}
                className="text-primary hover:text-primary-dark text-sm font-medium focus:outline-none"
              >
                {showOptionalFields ? '- Hide preferences' : '+ Add your cooking preferences (optional)'}
              </button>
            </div>

            {/* Optional Fields */}
            {showOptionalFields && (
              <div className="space-y-4 pt-4">
                <div>
                  <label htmlFor="cookingSkillLevel" className="block text-sm font-medium text-text-primary">
                    Cooking Skill Level
                  </label>
                  <select
                    id="cookingSkillLevel"
                    value={cookingSkillLevel}
                    onChange={(e) => setCookingSkillLevel(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-background border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  >
                    <option value="">Select your skill level</option>
                    {SKILL_LEVELS.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="dietaryPreferences" className="block text-sm font-medium text-text-primary">
                    Dietary Preferences (hold Ctrl/Cmd to select multiple)
                  </label>
                  <select
                    id="dietaryPreferences"
                    multiple
                    value={dietaryPreferences}
                    onChange={(e) => handleMultiSelect(e, setDietaryPreferences)}
                    className="mt-1 block w-full px-3 py-2 bg-background border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  >
                    {DIETARY_PREFERENCES.map(pref => (
                      <option key={pref} value={pref}>{pref}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="allergies" className="block text-sm font-medium text-text-primary">
                    Allergies (hold Ctrl/Cmd to select multiple)
                  </label>
                  <select
                    id="allergies"
                    multiple
                    value={allergies}
                    onChange={(e) => handleMultiSelect(e, setAllergies)}
                    className="mt-1 block w-full px-3 py-2 bg-background border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  >
                    {COMMON_ALLERGIES.map(allergy => (
                      <option key={allergy} value={allergy}>{allergy}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="favoriteCuisines" className="block text-sm font-medium text-text-primary">
                    Favorite Cuisines (hold Ctrl/Cmd to select multiple)
                  </label>
                  <select
                    id="favoriteCuisines"
                    multiple
                    value={favoriteCuisines}
                    onChange={(e) => handleMultiSelect(e, setFavoriteCuisines)}
                    className="mt-1 block w-full px-3 py-2 bg-background border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  >
                    {CUISINES.map(cuisine => (
                      <option key={cuisine} value={cuisine}>{cuisine}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="cookingFrequency" className="block text-sm font-medium text-text-primary">
                    How often do you cook?
                  </label>
                  <select
                    id="cookingFrequency"
                    value={cookingFrequency}
                    onChange={(e) => setCookingFrequency(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-background border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  >
                    <option value="">Select frequency</option>
                    {COOKING_FREQUENCIES.map(freq => (
                      <option key={freq} value={freq}>{freq}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="preferredMealTypes" className="block text-sm font-medium text-text-primary">
                    Preferred Meal Types (hold Ctrl/Cmd to select multiple)
                  </label>
                  <select
                    id="preferredMealTypes"
                    multiple
                    value={preferredMealTypes}
                    onChange={(e) => handleMultiSelect(e, setPreferredMealTypes)}
                    className="mt-1 block w-full px-3 py-2 bg-background border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  >
                    {MEAL_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register; 