import { describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RecipeCard from '../RecipeCard';

describe('RecipeCard', () => {
  const mockRecipe = {
    id: 1,
    title: 'Test Recipe',
    description: 'A test recipe description',
    cooking_time: 30,
    difficulty_level: 'Easy',
    cuisine_type: 'Italian'
  };

  it('renders recipe information correctly', () => {
    render(
      <BrowserRouter>
        <RecipeCard recipe={mockRecipe} />
      </BrowserRouter>
    );

    expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    expect(screen.getByText('A test recipe description')).toBeInTheDocument();
    expect(screen.getByText('30 mins')).toBeInTheDocument();
    expect(screen.getByText('Easy')).toBeInTheDocument();
    expect(screen.getByText('Italian')).toBeInTheDocument();
  });
}); 