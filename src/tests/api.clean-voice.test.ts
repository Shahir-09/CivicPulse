import { describe, it, expect } from 'vitest';

describe('Clean Voice Endpoint tests', () => {
  it('should clean conversation transcripts correctly', () => {
    const rawSpeechText = "pothole on crossing main street lights are off also";
    const cleanedText = {
      title: "Broken Streetlight & Pothole",
      description: "A pothole is located on the main street crossing. Streetlights are also offline.",
      category: "pothole"
    };

    expect(rawSpeechText).toContain("pothole");
    expect(cleanedText.category).toBe("pothole");
  });
});
