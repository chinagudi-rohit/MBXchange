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
    // Recognition written by a requirement's author or the helper's manager
    // once work is finished. One per person per engagement.
    `CREATE TABLE IF NOT EXISTS appreciations (
      id TEXT PRIMARY KEY,
      to_user_id TEXT NOT NULL REFERENCES users(id),
      from_user_id TEXT NOT NULL REFERENCES users(id),
      post_id TEXT,
      application_id TEXT,
      message TEXT NOT NULL DEFAULT '',
      rating INTEGER,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`,
    `CREATE INDEX IF NOT EXISTS idx_appreciation_to ON appreciations(to_user_id)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_appreciation_unique ON appreciations(application_id, from_user_id)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_ledger_app_kind ON bandwidth_ledger(application_id, kind)`,
    // Two-stage approval: the post's author decides first, then the
    // applicant's manager. Widens the status set (drop+recreate the
    // constraint, since ALTER COLUMN can't add CHECK values in place) and
    // adds the author's own decision timestamp alongside the existing one.
    `ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_status_check`,
    `ALTER TABLE applications ADD CONSTRAINT applications_status_check CHECK (status IN ('pending_author','pending_manager','awaiting_registration','approved','rejected','withdrawn'))`,
    `ALTER TABLE applications ADD COLUMN IF NOT EXISTS author_decided_at TIMESTAMPTZ`,
    // Same shape for collaboration requests: the target decides first, then
    // the target's manager.
    `ALTER TABLE collab_requests DROP CONSTRAINT IF EXISTS collab_requests_status_check`,
    `ALTER TABLE collab_requests ADD CONSTRAINT collab_requests_status_check CHECK (status IN ('pending','pending_manager','accepted','declined','completed','withdrawn'))`,
    `ALTER TABLE collab_requests ADD COLUMN IF NOT EXISTS manager_id TEXT REFERENCES users(id)`,
    `ALTER TABLE collab_requests ADD COLUMN IF NOT EXISTS target_decided_at TIMESTAMPTZ`,
    // Carpool bookings now gate on the driver's decision instead of being
    // instantly confirmed. Rows that predate the gate were effectively already
    // confirmed, so the column is added defaulting to 'approved' (which
    // backfills them) and only then switched to 'pending' for new bookings.
    // Doing it in that order avoids a backfill UPDATE, which on every restart
    // would wrongly confirm bookings that are legitimately still pending.
    `ALTER TABLE carpool_bookings ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'approved'`,
    `ALTER TABLE carpool_bookings ALTER COLUMN status SET DEFAULT 'pending'`,
    `ALTER TABLE carpool_bookings DROP CONSTRAINT IF EXISTS carpool_bookings_status_check`,
    `ALTER TABLE carpool_bookings ADD CONSTRAINT carpool_bookings_status_check CHECK (status IN ('pending','approved','rejected'))`,
    // Lets a message point at the record it concerns, so a booking request
    // can carry inline approve/reject actions in the thread itself.
    `ALTER TABLE messages ADD COLUMN IF NOT EXISTS context_id TEXT`,
    // The marketplace is gone; knowledge-sharing sessions replace it. Saved
    // items must accept 'training' and stop accepting 'listing', and any
    // saved listings are dropped along with the table they pointed at.
    `DELETE FROM saved_items WHERE item_type = 'listing'`,
    `ALTER TABLE saved_items DROP CONSTRAINT IF EXISTS saved_items_item_type_check`,
    `ALTER TABLE saved_items ADD CONSTRAINT saved_items_item_type_check CHECK (item_type IN ('work','training','community','carpool'))`,
    `DROP TABLE IF EXISTS listings`
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
