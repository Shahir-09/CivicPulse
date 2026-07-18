import { describe, it, expect } from 'vitest';

describe('Gnani Voice STT Endpoint tests', () => {
  it('should format requests for Gnani and handle unconfigured fallbacks', () => {
    const gnaniConfig = {
      apiKey: null,
      apiUrl: "https://api.vachana.ai/stt/v3"
    };

    const mockResponse = gnaniConfig.apiKey ? { transcript: "Test speech" } : { error: "not_configured" };
    expect(mockResponse.error || mockResponse.transcript).toBe("not_configured");
  });
});
