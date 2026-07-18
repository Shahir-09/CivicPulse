# Gnani.ai, Mem0, and GenZDealZ AI Partner Integration Guide

This guide details the configurations, architecture, and fallback strategies for the partner technologies integrated into **CivicPulse**.

---

## 1. Gnani.ai (Speech-to-Text Voice reporting)

### Architecture
We implement a server-side proxy route to keep our API key secure. The frontend records the audio using the `MediaRecorder` API and submits it to `/api/gnani/transcribe`. If the API key is not present or returns an error, the system automatically falls back to native Web Speech recognition.

### Setup & Activation
To activate the live Gnani.ai integration:
1. Obtain an API key from Gnani.ai.
2. In your `.env` file, configure the following variables:
   ```bash
   GNANI_API_KEY=your_gnani_api_key
   GNANI_API_URL=https://api.gnani.ai/v1/speech/recognize
   GNANI_LANGUAGE=en-IN
   VITE_GNANI_CONFIGURED=true
   ```

### Fallback Chain
```
🎤 Speak Complaint -> is VITE_GNANI_CONFIGURED true?
  ├── YES -> Try Gnani STT Relay -> [Gnani STT Success] -> Form Pre-fills
  └── NO/FAIL -> Try browser webkitSpeechRecognition -> [Browser STT Success] -> Form Pre-fills
      └── FAIL -> Open Voice Simulator popup modal (manual presets)
```

---

## 2. Mem0 AI (Long-term Personalization Memory)

### Architecture
We use the Mem0 AI Memory Layer to give the CivicPulse Assistant a memory across multiple sessions. In the Insights Chat and Clean Voice cleaning loop, the server queries Mem0 for memories matching the current authenticated user (`req.user.localId`). Mem0 extracts user preferences, local areas, and past issues, allowing a personalized response.

### Setup & Activation
1. Sign up on [Mem0.ai](https://mem0.ai) and retrieve an API key.
2. In your `.env` file, configure:
   ```bash
   MEM0_API_KEY=your_mem0_api_key
   ```
3. The platform will automatically begin calling the Mem0 API when users converse with the Insights Chat Assistant.

---

## 3. GenZDealZ AI (Claude Fallback Integration)

### Architecture
Claude (Anthropic) is added to the `FALLBACK_MODELS` chain managed by `geminiRetry.ts`. If the Google Gemini Flash endpoint experiences quota issues or failures, the server automatically routes queries to Claude.

### Setup & Activation
1. Configure your Anthropic API Key in `.env`:
   ```bash
   ANTHROPIC_API_KEY=your_anthropic_api_key
   ```
2. Update the `FALLBACK_MODELS` list in your `.env` to include the Claude model:
   ```bash
   FALLBACK_MODELS=gemini:gemini-2.5-flash,anthropic:claude-3-5-sonnet-20241022,groq:...
   ```
