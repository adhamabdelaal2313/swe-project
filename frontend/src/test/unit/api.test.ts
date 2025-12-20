import { describe, it, expect } from 'vitest';
import { apiUrl, API_BASE_URL } from '../../config/api';

// Unit Test: API Configuration Utility
describe('API Configuration', () => {
  it('should normalize paths correctly', () => {
    // Test path normalization
    expect(apiUrl('api/tasks')).toBe('/api/tasks');
    expect(apiUrl('/api/tasks')).toBe('/api/tasks');
  });

  it('should return API base URL', () => {
    // In test environment, should return empty string (dev mode)
    // or use VITE_API_URL if set
    expect(typeof API_BASE_URL).toBe('string');
  });

  it('should construct full API URLs', () => {
    const result = apiUrl('/api/tasks');
    // Should start with / or full URL
    expect(result).toMatch(/^(\/|https?:\/\/)/);
    expect(result).toContain('/api/tasks');
  });
});

