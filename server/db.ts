/**
 * Database adapter with two interchangeable drivers:
 *  - PostgreSQL (node-postgres) when DATABASE_URL is set  → production / docker / AKS
 *  - PGlite (real Postgres in-process, file-backed) otherwise → zero-install local dev
 * Both speak the same SQL; schema.sql and seed run identically on either.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface QueryResult<T = any> {
  rows: T[];
}

interface Driver {
  query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>>;
  close(): Promise<void>;
}

let driver: Driver | null = null;

async function createDriver(): Promise<Driver> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const { Pool } = await import('pg');
    const ssl = process.env.PGSSL === 'require' ? { rejectUnauthorized: false } : undefined;
    const pool = new Pool({ connectionString: url, ssl, max: 10 });
    console.log('[db] using PostgreSQL via DATABASE_URL');
    return {
      query: (sql, params) => pool.query(sql, params),
      close: () => pool.end()
    };
  }
  const { PGlite } = await import('@electric-sql/pglite');
  const dataDir = process.env.PGLITE_DIR || path.join(__dirname, '..', '.data', 'pglite');
  fs.mkdirSync(path.dirname(dataDir), { recursive: true });
  const lite = await PGlite.create(dataDir);
  console.log(`[db] using embedded PGlite at ${dataDir} (set DATABASE_URL for external PostgreSQL)`);
  return {
    query: async (sql, params) => {
      const res = await lite.query(sql, params);
      return { rows: res.rows as any[] };
    },
    close: () => lite.close()
  };
}

export async function q<T = any>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
  if (!driver) driver = await createDriver();
  return driver.query<T>(sql, params);
}

export async function one<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
  const { rows } = await q<T>(sql, params);
  return rows[0];
}

export async function initSchema(): Promise<void> {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  // Strip comment lines, then split on statement boundaries (no functions/triggers in this schema)
  const cleaned = schema
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n');
  const statements = cleaned
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  for (const stmt of statements) {
    await q(stmt);
  }
}

/**
 * Idempotent column additions for databases created before a field existed.
 * CREATE TABLE IF NOT EXISTS never alters an existing table, so new columns
 * have to be added explicitly here.
 */
export async function applyMigrations(): Promise<void> {
  const migrations = [
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS specialisation TEXT NOT NULL DEFAULT ''`,
    // Profile photo, stored as a compressed data URL (~30–40 KB after client-side resize).
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT NOT NULL DEFAULT ''`,
    // Bandwidth can be declared per week or per month; the hours column is unchanged,
    // this only records which period those hours describe.
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS bandwidth_period TEXT NOT NULL DEFAULT 'week'`,
    // Hours already consumed by completed engagements in the current period.
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS hours_consumed NUMERIC NOT NULL DEFAULT 0`,
    // Presence: stamped by the existing /api/sync poll.
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ`,
    // Earned tier, recomputed whenever contribution totals change.
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS tier TEXT NOT NULL DEFAULT 'Contributor'`,
    `CREATE TABLE IF NOT EXISTS bandwidth_ledger (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      application_id TEXT,
      post_id TEXT,
      hours NUMERIC NOT NULL,
      kind TEXT NOT NULL DEFAULT 'consumed',
      note TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`,
    `CREATE INDEX IF NOT EXISTS idx_ledger_user ON bandwidth_ledger(user_id)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_ledger_app_kind ON bandwidth_ledger(application_id, kind)`
  ];
  for (const sql of migrations) {
    await q(sql);
  }
}

export async function closeDb(): Promise<void> {
  if (driver) {
    await driver.close();
    driver = null;
  }
}

export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
