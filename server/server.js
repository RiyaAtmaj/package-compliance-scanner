require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const inspectionRoutes = require('./routes/inspectionRoutes');

const app = express();
const port = Number(process.env.PORT) || 3000;
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: (origin, callback) => {
  if (!origin || /^https?:\/\/(localhost|127\.0\.0\.1)(?::\d+)?$/.test(origin)) return callback(null, true);
  callback(null, false);
} }));
app.use(express.json({ limit: '100kb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/api/inspection', inspectionRoutes);
app.use((error, req, res, next) => {
  if (error.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ success: false, error: 'Image must be 8 MB or smaller.' });
  if (error.message === 'Only JPEG, PNG, or WebP images are accepted.') return res.status(400).json({ success: false, error: error.message });
  console.error(error);
  res.status(500).json({ success: false, error: 'The inspection could not be completed.' });
});
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'index.html')));
app.listen(port, () => console.log(`Package Compliance Scanner running at http://localhost:${port}`));

module.exports = app;