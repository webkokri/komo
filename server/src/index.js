import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import app from './app.js';

// Local / single-server mode: also serve the built React site (npm run build in the project root).
// On Vercel only app.js runs, as a serverless function (see api/index.js).
const here = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(here, '..', '..', 'dist');
if (fs.existsSync(path.join(DIST, 'index.html'))) {
  app.use(express.static(DIST, { index: false, maxAge: '1h' }));
  app.get(/^\/admin(\/|$)/, (req, res) => res.sendFile(path.join(DIST, 'admin.html')));
  app.get('*', (req, res) => res.sendFile(path.join(DIST, 'index.html')));
}

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => console.log(`KOMOREBI API listening on http://localhost:${port}`));
