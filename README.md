# ReelMind: Autonomous AI Study Synthesis & Knowledge Graph

> **MLH Hackathon Project**  
> Turn passive short-form video consumption (Instagram Reels & YouTube Shorts) into structured academic knowledge, actionable study guides, and an interactive semantic knowledge graph.

---

## Overview

Students and lifelong learners spend hours consuming educational reels and video shorts on Instagram and YouTube. However, key insights are quickly lost in endless scrolling feeds.

**ReelMind** bridges this gap through a three-stage intelligent pipeline:
1. **Chrome Extension Audio Grabber**: Captures high-fidelity live tab audio directly from Instagram Reels and YouTube Shorts alongside real creator metadata.
2. **Audio Intelligence Engine**: Transcribes speech using **ElevenLabs Scribe v2** and synthesizes comprehensive academic solutions using **Google Gemma 4**.
3. **Interactive Knowledge Graph & De-duplication**: Links extracted study reports with personalized user academic goals using force-directed graph physics, canonical text fingerprinting, and semantic AI bridges.

---

## Architecture

```
┌─────────────────────────────────┐
│   Chrome Extension (MV3)        │
│  - Popup Dialog (Start/Stop)    │
│  - Live Audio Wave Equalizer    │
│  - Offscreen Opus Streamer      │
└────────────────┬────────────────┘
                 │ HTTP POST multipart/form-data
                 ▼
┌─────────────────────────────────┐
│   Node.js / Express Server      │
│  - WebSocket Real-time Hub      │
│  - ElevenLabs STT (Scribe v2)   │
│  - Google Gemma 4 Analyzer      │
│  - Strict De-duplication Engine │
└────────────────┬────────────────┘
                 │ WebSocket Broadcast
                 ▼
┌─────────────────────────────────┐
│   Web Dashboard (Obsidian UI)   │
│  - Report Cards & TTS Audio     │
│  - Force-Directed 2D Graph      │
│  - Academic Goal Synthesizer    │
└─────────────────────────────────┘
```

---

## Features

- **Chrome Extension Popup UI**:
  - Dark obsidian glass design matching the web dashboard theme.
  - Dedicated **Start Capture** and **Stop Capture** controls.
  - Dynamic **7-bar audio wave equalizer loader** with live timer during recording.
  - Instant dispatch confirmation banner with quick-action link to the dashboard.
- **Deep Academic Analysis**:
  - Comprehensive problem-solving breakdown, core principles, step-by-step action items, and verification questions.
  - Strictly grounded in the video transcript without hallucination.
- **Goal Knowledge Graph (Obsidian-Style)**:
  - Force-directed bipartite layout separating Study Reports and Academic Goals with balanced repulsion.
  - Canvas-rendered frosted glass cards with multi-line text wrapping and tag chips.
  - Traveling particle links showing semantic connection strength computed by Gemini.
- **Zero-Spam De-duplication Engine**:
  - SHA-256 canonical transcript fingerprinting and Jaccard similarity scoring prevent duplicate node spamming.

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Google Chrome browser
- API Keys:
  - [Google AI Studio](https://aistudio.google.com/) (Gemini / Gemma API Key)
  - [ElevenLabs](https://elevenlabs.io/) (Speech-to-Text API Key)
  - [OpenRouter](https://openrouter.ai/) *(Optional fallback)*

---

### Installation & Server Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/anshuvdebnath-cyber/MLH-HACKATHON.git
   cd MLH-HACKATHON
   ```

2. **Configure Environment Variables**:
   Create a `.env` file inside the `server/` directory:
   ```bash
   cp .env.example server/.env
   ```
   Add your API keys to `server/.env`:
   ```env
   PORT=5000
   ELEVENLABS_API_KEY=your_elevenlabs_key_here
   GEMINI_API_KEY=your_gemini_key_here
   OPENROUTER_API_KEY=your_openrouter_key_here
   OPENROUTER_MODEL=google/gemma-4-31b-it
   ```

3. **Install Dependencies & Start Server**:
   ```bash
   cd server
   npm install
   npm start
   ```
   The ReelMind dashboard will be live at `http://localhost:5000`.

---

### Chrome Extension Setup

1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** via the toggle switch in the top-right corner.
3. Click **Load unpacked** and select the `reel-audio-tester/` folder from this repository.
4. Pin **ReelMind Audio Grabber** to your Chrome toolbar.
5. Open any Instagram Reel or YouTube Short, click the extension icon, and click **Start Capture**!

---

## Security & Privacy

- All sensitive keys (`.env`) are strictly ignored by `.gitignore` and are never committed to version control.
- Screen capture is avoided entirely; tab audio is passed through standard WebRTC streams with explicit user intent (button click) for minimal permission footprint.
- All audio is processed in memory buffers and purged immediately following transcription.

---

## License

MIT License. Built for the MLH Hackathon.
