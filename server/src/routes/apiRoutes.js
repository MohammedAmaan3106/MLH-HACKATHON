/**
 * API Routes for ReelMind Engine
 */

const express = require('express');
const multer = require('multer');
const {
  MAX_AUDIO_SIZE,
  PRIMARY_MODEL,
  CANDIDATE_MODELS,
  ELEVENLABS_API_KEY,
  OPENROUTER_API_KEY,
  GEMINI_API_KEY,
  GOOGLE_GEMMA_MODELS
} = require('../config/constants');
const { registerClient, broadcast, getConnectedClientsCount } = require('../services/sseService');
const { transcribeAudio } = require('../services/transcriptionService');
const { analyzeContent } = require('../services/analysisService');
const {
  addGoal,
  deleteGoal,
  addReportToGraph,
  getGraph
} = require('../services/graphService');

const router = express.Router();

// Audio held strictly in ephemeral RAM - zero disk footprints
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_AUDIO_SIZE }
});

// SSE Events stream
router.get('/events', (req, res) => {
  registerClient(req, res);
});

// Real-Time Audio Processing Pipeline
router.post('/process', upload.single('audio'), async (req, res) => {
  const creator = (req.body.creator || 'creator').replace(/^@/, '');
  const caption = (req.body.caption || '').trim();
  const url = (req.body.url || '').trim();

  // Validate audio buffer
  if (!req.file || req.file.size < 300) {
    // If no audio but caption is present, we can still analyze!
    if (caption.length > 5) {
      console.log(`\n⚡ LIVE PROCESSING: Text/Caption only from @${creator}`);
      try {
        broadcast('status', { step: 'analyzing', message: '🧠 Analyzing caption with Gemma 4...' });
        const analysis = await analyzeContent('', caption, url);
        const result = {
          id: 'card_' + Date.now(),
          creator,
          url,
          caption,
          transcript: '(No audio provided - analyzed directly from caption)',
          notice: 'Caption-only analysis',
          analysis: analysis.data,
          modelUsed: analysis.model,
          processedAt: new Date().toLocaleTimeString()
        };
        broadcast('result', result);
        return res.json({ success: true, result });
      } catch (err) {
        broadcast('status', { step: 'error', message: `Error: ${err.message}` });
        return res.status(500).json({ error: err.message });
      }
    }
    return res.status(400).json({ error: 'No audio captured or recording was too short (<0.5s).' });
  }

  const audioDataUrl = `data:${req.file.mimetype || 'audio/webm'};base64,${req.file.buffer.toString('base64')}`;
  console.log(`\nLIVE PROCESSING: Reel from @${creator} (${(req.file.size / 1024).toFixed(1)} KB)`);

  broadcast('status', {
    step: 'transcribing',
    message: 'Transcribing speech with ElevenLabs Scribe v2...'
  });

  try {
    // 1. Transcription (with graceful fallback for music/silence)
    const sttResult = await transcribeAudio(req.file.buffer, req.file.mimetype);
    console.log(`STT Output: "${(sttResult.transcript || sttResult.notice || '').slice(0, 70)}..."`);

    broadcast('status', {
      step: 'analyzing',
      message: 'Synthesizing comprehensive analysis with Google Gemma 4...'
    });

    // 2. Structured Analysis
    const analysis = await analyzeContent(sttResult.transcript, caption, url);
    console.log(`Gemma analysis finished: "${analysis.data.title}"`);

    const result = {
      id: 'card_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9),
      creator,
      url,
      caption,
      audioDataUrl,
      transcript: sttResult.transcript,
      notice: sttResult.notice,
      analysis: analysis.data,
      modelUsed: analysis.model,
      processedAt: new Date().toLocaleTimeString()
    };

    // Broadcast live to all connected browser dashboards
    broadcast('result', result);

    // Ingest into Knowledge Graph with strict de-duplication
    addReportToGraph(result)
      .then(gRes => {
        broadcast('graph_update', gRes.graph);
      })
      .catch(err => console.warn('Knowledge graph update error:', err.message));

    // Audio buffer in req.file.buffer is naturally freed by garbage collector
    return res.json({ success: true, result });
  } catch (err) {
    console.error('Pipeline error:', err.message);
    broadcast('status', {
      step: 'error',
      message: `Error: ${err.message}`
    });
    return res.status(500).json({ error: err.message });
  }
});

// Backward compatibility alias for the Chrome extension
router.post('/ingest', (req, res, next) => {
  req.url = '/process';
  router.handle(req, res, next);
});

// Quick Text / Caption Analysis (No audio file required)
router.post('/analyze-text', express.json(), async (req, res) => {
  const { text, caption, creator, url } = req.body;
  const content = (text || caption || '').trim();

  if (!content) {
    return res.status(400).json({ error: 'Please provide some text or reel caption to analyze.' });
  }

  try {
    broadcast('status', { step: 'analyzing', message: '🧠 Analyzing text with Gemma 4...' });
    const analysis = await analyzeContent(content, caption || '', url || '');

    const result = {
      id: 'card_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9),
      creator: (creator || 'text_input').replace(/^@/, ''),
      url: url || '',
      caption: caption || '',
      transcript: content,
      notice: 'Text/Notes mode',
      analysis: analysis.data,
      modelUsed: analysis.model,
      processedAt: new Date().toLocaleTimeString()
    };

    broadcast('result', result);

    // Ingest into Knowledge Graph with strict de-duplication
    addReportToGraph(result)
      .then(gRes => {
        broadcast('graph_update', gRes.graph);
      })
      .catch(err => console.warn('Knowledge graph update error:', err.message));

    return res.json({ success: true, result });
  } catch (err) {
    broadcast('status', { step: 'error', message: `Error: ${err.message}` });
    return res.status(500).json({ error: err.message });
  }
});

// ============================================================
// Knowledge Graph & Academic Goals Endpoints
// ============================================================
router.get('/graph', (req, res) => {
  res.json({ success: true, graph: getGraph() });
});

router.post('/goals', express.json(), async (req, res) => {
  try {
    const { goalText } = req.body;
    const result = await addGoal(goalText);
    broadcast('graph_update', result.graph);
    res.json({ success: true, goal: result.goal, graph: result.graph });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/goals/:id', (req, res) => {
  try {
    const graph = deleteGoal(req.params.id);
    broadcast('graph_update', graph);
    res.json({ success: true, graph });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Diagnostic & Health Endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'online',
    mode: 'ephemeral-realtime',
    connected_dashboards: getConnectedClientsCount(),
    google_ai_studio_configured: Boolean(GEMINI_API_KEY.trim()),
    google_ai_models: GOOGLE_GEMMA_MODELS,
    elevenlabs_configured: Boolean(ELEVENLABS_API_KEY.trim()),
    openrouter_configured: Boolean(OPENROUTER_API_KEY.trim()),
    primary_model: PRIMARY_MODEL,
    fallback_models: CANDIDATE_MODELS
  });
});

module.exports = router;
