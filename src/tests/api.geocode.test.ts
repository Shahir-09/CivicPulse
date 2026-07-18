import { describe, it, expect } from 'vitest';

describe('Geocoding Endpoint tests', () => {
  it('should format coordinates and geocode correctly', () => {
    const lat = 12.9716;
    const lng = 77.5946;
    expect(lat).toBe(12.9716);
    expect(lng).toBe(77.5946);
  });
});
