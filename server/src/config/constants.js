const path = require('path');
const fs = require('fs');

// Load local environment files when running outside Vercel.
const serverEnv = path.resolve(__dirname, '../../.env');
if (fs.existsSync(serverEnv)) require('dotenv').config({ path: serverEnv });

const rootEnv = path.resolve(__dirname, '../../../.env');
if (fs.existsSync(rootEnv)) require('dotenv').config({ path: rootEnv });

require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  GEMINI_API_KEY: (process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY || process.env.GOOGLE_API_KEY || '').trim(),
  GOOGLE_GEMMA_MODELS: ['gemini-3.8-flash'],
  PRIMARY_MODEL: process.env.OPENROUTER_MODEL || 'google/gemma-3-27b-it:free',
  CANDIDATE_MODELS: [
    process.env.OPENROUTER_MODEL || 'google/gemma-3-27b-it:free',
    'google/gemma-3-12b-it:free'
  ],
  ELEVENLABS_API_KEY: (process.env.ELEVENLABS_API_KEY || '').trim(),
  OPENROUTER_API_KEY: (process.env.OPENROUTER_API_KEY || '').trim(),
  MAX_AUDIO_SIZE: 30 * 1024 * 1024,
  API_TIMEOUT_MS: 45000
};
