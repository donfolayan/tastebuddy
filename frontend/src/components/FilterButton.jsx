import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';

function FilterButton({ onApplyFilters }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    dietary: [],
    cuisine: [],
    spiceLevel: 'medium',
    cookingTime: '30',
  });

  const dietaryOptions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 
    'Dairy-Free', 'Keto', 'Paleo'
  ];

  const cuisineTypes = [
    'Italian', 'Mexican', 'Chinese', 'Indian', 
    'Japanese', 'Thai', 'Mediterranean', 'American'
  ];

  const handleDietaryChange = (option) => {
    setFilters(prev => ({
      ...prev,
      dietary: prev.dietary.includes(option)
        ? prev.dietary.filter(item => item !== option)
        : [...prev.dietary, option]
    }));
  };

  const handleCuisineChange = (option) => {
    setFilters(prev => ({
      ...prev,
      cuisine: prev.cuisine.includes(option)
        ? prev.cuisine.filter(item => item !== option)
        : [...prev.cuisine, option]
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 bg-card hover:bg-card-hover text-text-primary px-4 py-2 rounded-full transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        <span>Filters</span>
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setIsOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/80" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-surface p-6 shadow-xl transition-all">
                  <Dialog.Title className="text-lg font-bold text-text-primary mb-4">
                    Filter Recipes
                  </Dialog.Title>

                  {/* Dietary Restrictions */}
                  <div className="mb-6">
                    <h3 className="text-text-secondary mb-2">Dietary Restrictions</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {dietaryOptions.map((option) => (
                        <label
                          key={option}
                          className="flex items-center space-x-2 text-text-primary"
                        >
                          <input
                            type="checkbox"
                            checked={filters.dietary.includes(option)}
                            onChange={() => handleDietaryChange(option)}
                            className="form-checkbox bg-card border-gray-600 text-secondary-accent rounded focus:ring-secondary-accent focus:ring-offset-background"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Cuisine Types */}
                  <div className="mb-6">
                    <h3 className="text-text-secondary mb-2">Cuisine Types</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {cuisineTypes.map((cuisine) => (
                        <label
                          key={cuisine}
                          className="flex items-center space-x-2 text-text-primary"
                        >
                          <input
                            type="checkbox"
                            checked={filters.cuisine.includes(cuisine)}
                            onChange={() => handleCuisineChange(cuisine)}
                            className="form-checkbox bg-card border-gray-600 text-secondary-accent rounded focus:ring-secondary-accent focus:ring-offset-background"
                          />
                          <span>{cuisine}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Spice Level */}
                  <div className="mb-6">
                    <h3 className="text-text-secondary mb-2">Spice Level</h3>
                    <select
                      value={filters.spiceLevel}
                      onChange={(e) => setFilters(prev => ({ ...prev, spiceLevel: e.target.value }))}
                      className="w-full bg-card border border-gray-600 rounded px-3 py-2 text-text-primary"
                    >
                      <option value="mild">Mild</option>
                      <option value="medium">Medium</option>
                      <option value="hot">Hot</option>
                    </select>
                  </div>

                  {/* Cooking Time */}
                  <div className="mb-6">
                    <h3 className="text-text-secondary mb-2">Maximum Cooking Time (minutes)</h3>
                    <input
                      type="number"
                      value={filters.cookingTime}
                      onChange={(e) => setFilters(prev => ({ ...prev, cookingTime: e.target.value }))}
                      className="w-full bg-card border border-gray-600 rounded px-3 py-2 text-text-primary"
                      min="5"
                      max="180"
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleApply}
                      className="bg-secondary-accent hover:bg-secondary-accent-dark text-white px-4 py-2 rounded transition-colors"
                    >
                      Apply Filters
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

export default FilterButton; 