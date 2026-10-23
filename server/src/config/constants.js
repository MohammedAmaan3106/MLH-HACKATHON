const path = require('path');
const fs = require('fs');

// 1. Check server/.env
const serverEnv = path.resolve(__dirname, '../../.env');
if (fs.existsSync(serverEnv)) {
  require('dotenv').config({ path: serverEnv });
}

// 2. Check root .env
const rootEnv = path.resolve(__dirname, '../../../.env');
if (fs.existsSync(rootEnv)) {
  require('dotenv').config({ path: rootEnv });
}

// 3. Fallback standard CWD .env
require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  // Google AI Studio Direct Gemma 4 Settings
  GEMINI_API_KEY: (process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY || process.env.GOOGLE_API_KEY || '').trim(),
  GOOGLE_GEMMA_MODELS: [
    'models/gemma-4-31b-it',
    'models/gemma-4-26b-a4b-it'
  ],
  // OpenRouter Gemma 4 Models (strictly Gemma 4)
  PRIMARY_MODEL: process.env.OPENROUTER_MODEL || 'google/gemma-4-31b-it',
  CANDIDATE_MODELS: [
    process.env.OPENROUTER_MODEL || 'google/gemma-4-31b-it',
    'google/gemma-4-26b-a4b-it',
    'google/gemma-4-31b-it:free',
    'google/gemma-4-26b-a4b-it:free'
  ],
  ELEVENLABS_API_KEY: (process.env.ELEVENLABS_API_KEY || '').trim(),
  OPENROUTER_API_KEY: (process.env.OPENROUTER_API_KEY || '').trim(),
  // Maximum audio upload size (RAM only, discarded immediately)
  MAX_AUDIO_SIZE: 30 * 1024 * 1024,
  // Fetch timeout for external AI APIs
  API_TIMEOUT_MS: 45000
};
