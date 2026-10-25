/**
 * Reelsidian Express application.
 * Vercel imports the exported app; local development starts the HTTP listener.
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
const { PORT } = require('./src/config/constants');
const apiRoutes = require('./src/routes/apiRoutes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Reelsidian engine active at http://localhost:${PORT}`);
  });
}

module.exports = app;
