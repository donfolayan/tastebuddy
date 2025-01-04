import { describe, it, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import api from '../../services/api';

vi.mock('../../services/api');

describe('AuthContext', () => {
  it('handles login successfully', async () => {
    const mockUser = { id: 1, email: 'test@example.com' };
    const mockToken = 'test-token';
    
    api.post.mockResolvedValueOnce({ 
      data: { user: mockUser, token: mockToken } 
    });

    let testAuth;
    const TestComponent = () => {
      testAuth = useAuth();
      return null;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      await testAuth.login('test@example.com', 'password');
    });

    expect(testAuth.user).toEqual(mockUser);
    expect(localStorage.getItem('token')).toBe(mockToken);
  });
}); 