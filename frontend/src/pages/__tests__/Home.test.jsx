import { describe, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../Home';
import { AuthProvider } from '../../context/AuthContext';
import api from '../../services/api';

// Mock the API module
vi.mock('../../services/api');

describe('Home', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks();
    // Mock initial recipes load
    api.get.mockResolvedValue({ data: [] });
  });

  it('loads and displays recipes', async () => {
    const mockRecipes = [
      {
        id: 1,
        title: 'Test Recipe',
        description: 'Test Description',
        cooking_time: 30,
        difficulty_level: 'Easy',
        cuisine_type: 'Italian'
      }
    ];

    api.get.mockResolvedValueOnce({ data: mockRecipes });

    render(
      <BrowserRouter>
        <AuthProvider>
          <Home />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    });
  });

  it('handles mood-based recommendations', async () => {
    const mockRecommendations = [
      {
        id: 2,
        title: 'Happy Recipe',
        description: 'Makes you happier',
        cooking_time: 20,
        difficulty_level: 'Medium',
        cuisine_type: 'French'
      }
    ];

    // Mock the initial recipes load
    api.get.mockResolvedValueOnce({ data: [] });
    // Mock the mood-based recommendations
    api.post.mockResolvedValueOnce({ data: mockRecommendations });

    render(
      <BrowserRouter>
        <AuthProvider>
          <Home />
        </AuthProvider>
      </BrowserRouter>
    );

    // Wait for the initial load to complete
    await waitFor(() => {
      expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
    });

    const happyButton = screen.getByText('Happy');
    fireEvent.click(happyButton);

    await waitFor(() => {
      expect(screen.getByText('Happy Recipe')).toBeInTheDocument();
    });
  });
}); 