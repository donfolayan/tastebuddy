import { describe, it, expect, vi } from 'vitest';
import api from '../api';

describe('API Service', () => {
  it('handles 401 responses by redirecting to login', async () => {
    const originalLocation = window.location;
    delete window.location;
    window.location = { href: '' };

    const mockError = {
      response: { status: 401 }
    };

    try {
      await api.interceptors.response.handlers[0].rejected(mockError);
    } catch (error) {
      expect(window.location.href).toBe('/login');
      expect(localStorage.getItem('token')).toBeNull();
    }

    window.location = originalLocation;
  });
}); 