/**
 * ReelMind Real-Time Engine Entry Point
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const { PORT } = require('./src/config/constants');
const apiRoutes = require('./src/routes/apiRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mount API routes
app.use('/api', apiRoutes);

// Root route serves the dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 ReelMind Real-Time Engine active at http://localhost:${PORT}`);
  console.log(`✨ Ephemeral RAM pipeline: Zero disk storage, maximum privacy.`);
  console.log(`📡 SSE Stream: http://localhost:${PORT}/api/events`);
  console.log(`======================================================\n`);
});
