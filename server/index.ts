import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { initSchema, applyMigrations, closeDb } from './db.ts';
import { seedIfEmpty, backfillReferenceData, seedRecognitionDefaults } from './seed.ts';
import { api } from './routes.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// API_PORT wins so dev harnesses that inject PORT (for the web server) don't collide with the API
const PORT = parseInt(process.env.API_PORT || process.env.PORT || '8787', 10);

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));

// Minimal security headers (no extra deps)
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});

app.get('/api/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));
app.use('/api', api);

// Serve the built frontend in production (single-container deployment)
const distDir = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(distDir, 'index.html')));
}

// JSON error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[api] error:', err?.message || err);
  res.status(500).json({ error: 'Internal server error' });
});

async function main() {
  await initSchema();
  await applyMigrations();
  // Badges and tiers must exist before the demo seed computes anybody's tier.
  await seedRecognitionDefaults();
  await seedIfEmpty();
  await backfillReferenceData();
  app.listen(PORT, () => {
    console.log(`[server] MBXchange API listening on http://localhost:${PORT}`);
  });
}

process.on('SIGTERM', async () => { await closeDb(); process.exit(0); });
process.on('SIGINT', async () => { await closeDb(); process.exit(0); });

main().catch((e) => {
  console.error('[server] fatal startup error:', e);
  process.exit(1);
});
