# MBXchange

Internal platform where employees take on projects and proofs of concept from
other teams, alongside their assigned work. Someone posts a requirement, people
put their name forward, the applicant's manager approves the time against real
declared capacity, and completed work turns into contribution hours, tiers,
milestones and recognition.

Full-stack TypeScript: React 19 + Vite frontend, Express API, PostgreSQL. One
container serves both.

---

## Running it on your own computer

This section is for a person setting the project up on their own laptop — on
either macOS or Windows — to develop, demo, or just try it out. No database
to install, no Docker, no accounts to create up front.

### 1. Install Node.js

The project needs **Node.js version 22**. If you're not sure whether you have
it, open a terminal and run:

```bash
node -v
```

If that prints `v22.x.x`, skip to step 2. Otherwise:

**On a Mac:**
Download the "LTS" installer from [nodejs.org](https://nodejs.org) and run
it like any other `.pkg` installer — Next, Next, Install. If you use
[Homebrew](https://brew.sh), `brew install node@22` works too.

**On Windows:**
Download the "LTS" Windows installer from [nodejs.org](https://nodejs.org)
and run it. Accept the defaults; it's a normal `.msi` install. Once it
finishes, close and reopen any terminal windows you had open, since Windows
only picks up the new install path in fresh terminal sessions.

Either way, close your terminal and open a new one afterwards, then run
`node -v` again to confirm it worked.

### 2. Get the code

If you already have the repository, skip this. Otherwise, from a terminal:

```bash
git clone https://github.com/chinagudi-rohit/MBXchange.git
cd MBXchange
```

This works identically on macOS and Windows — use Terminal on a Mac, and
either **PowerShell** or **Command Prompt** on Windows (PowerShell is the
better default on modern Windows).

### 3. Install the project's dependencies

From inside the `MBXchange` folder:

```bash
npm install
```

This downloads everything the app needs into a `node_modules` folder. It
takes a minute or two the first time. Same command on both platforms.

> **Windows note:** if this fails with a permissions error, you don't need
> to run it "as Administrator" — that usually points to antivirus software
> scanning `node_modules` while npm is writing to it. Excluding the project
> folder from real-time scanning, or simply retrying, usually clears it.

### 4. Start the app

```bash
npm run dev
```

This single command starts both halves of the app at once: the API server
and the web frontend. Watch the terminal for a line like:

```
[server] MBXchange API listening on http://localhost:8787
```

Once you see that, open your browser to:

```
http://localhost:3000
```

and you should see the sign-in screen. The very first time you do this, the
app quietly creates a small local database file under `.data/` in the
project folder and fills it with realistic demo data — people, projects,
carpool rides, the lot — so there's something to look at immediately. No
setup step required; it just happens.

### 5. Sign in

Use the **"Sign in as any user (pilot environment)"** panel on the sign-in
screen — it lists every demo account, and clicking one fills in the
credentials for you. If you'd rather type them in by hand:

| Role | Email | Password |
|---|---|---|
| Admin | `markus.becker@mercedes-benz.com` | `MBXAdmin@2026` |
| Manager | `elena.rostova@mercedes-benz.com` | `Mbx@2026` |
| Employee | `rakesh.kumar@mercedes-benz.com` | `Mbx@2026` |

### 6. Stopping the app

Click into the terminal window running `npm run dev` and press:

- **Mac:** `Ctrl + C`
- **Windows:** `Ctrl + C` (same key combination in both PowerShell and
  Command Prompt)

### 7. Starting over with a fresh database

Everything the app has stored — every account, project, and message — lives
in one folder: `.data/`. Deleting it and restarting gives you a completely
clean copy of the demo data, as if you'd just cloned the repository.

Stop the app first (step 6) — deleting the folder while it's still running
can crash the dev server.

**On a Mac**, from the project folder:

```bash
rm -rf .data
```

**On Windows**, using PowerShell, from the project folder:

```powershell
Remove-Item -Recurse -Force .data
```

**On Windows**, using Command Prompt instead:

```cmd
rmdir /s /q .data
```

Then run `npm run dev` again and it re-creates everything from scratch.

### If something doesn't work

| Problem | What's likely happening | Fix |
|---|---|---|
| `node: command not found` (Mac) or `'node' is not recognized...` (Windows) | Node.js isn't installed, or your terminal was open before you installed it | Reopen your terminal, or revisit step 1 |
| "Port 3000 is already in use" (or 8787) | Another copy of the app — or something else — is already using that port | **Mac:** `lsof -ti:3000 \| xargs kill`  **Windows (PowerShell):** `Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess \| Stop-Process` |
| `npm install` hangs or fails partway | A flaky network, or a half-finished previous install | Delete the `node_modules` folder (leave `package-lock.json` alone) and run `npm install` again |
| Blank white page in the browser | The frontend hasn't finished compiling yet, especially on the very first run | Wait a few seconds and refresh |
| Windows: a script "cannot be loaded because running scripts is disabled" | PowerShell's default execution policy blocks npm's helper scripts | Use Command Prompt instead, or run PowerShell as Administrator once and execute `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` |

Everything past this point is written for automated deployment rather than a
person setting the project up to develop or demo it locally — read on only
if you're deploying this somewhere real.

---

## For an automated agent deploying this

This section is written to be executed top-to-bottom. Every command is
copy-pasteable. Where a decision is required it is stated explicitly with a
default.

**Before you start, know these three things:**

| Question | Answer |
|---|---|
| Does this need a database server installed locally? | **No.** With no `DATABASE_URL` the API runs Postgres in-process (PGlite, file-backed). Local dev needs zero database setup. |
| What is the one change required before a real deployment? | Set `DEMO_ACCOUNTS=false`. See [Turning off the pilot sign-in](#turning-off-the-pilot-sign-in). |
| What must never be committed? | `.env`, `k8s/01-secrets.yaml`, `.data/`. All are already gitignored. |

### Prerequisites

- **Node.js 22.x** and npm 10+ (`node -v` should print `v22.x`)
- For containers: Docker 24+
- For Kubernetes: `kubectl` with a working context
- No PostgreSQL installation is required for local runs

### 1. Verify the repository runs locally

```bash
npm ci && npm run lint && npm run build
```

`lint` is `tsc --noEmit`. Both must exit 0 before you proceed. If either fails,
stop and report the output — do not continue to deployment.

### 2. Start it locally

```bash
npm run dev
```

This starts two processes: the API on `http://localhost:8787` and the Vite
frontend on `http://localhost:3000`. Open `http://localhost:3000`.

On first run the API creates `.data/pglite/`, applies the schema, runs
migrations, and seeds a demo dataset. Expect this log:

```
[db] using embedded PGlite at .../.data/pglite (set DATABASE_URL for external PostgreSQL)
[seed] populating demo dataset…
[server] MBXchange API listening on http://localhost:8787
```

Verify:

```bash
curl -s http://localhost:8787/api/health
# {"ok":true,"ts":...}
```

**Demo credentials** (pilot only — see the production switch below):

| Role | Email | Password |
|---|---|---|
| Admin | `markus.becker@mercedes-benz.com` | `MBXAdmin@2026` |
| Manager | `elena.rostova@mercedes-benz.com` | `Mbx@2026` |
| Employee | `rakesh.kumar@mercedes-benz.com` | `Mbx@2026` |

The sign-in screen also has a **"Sign in as any user (pilot environment)"**
panel listing every active account, for switching between roles while testing.

### 3. Reset local data

Stop the server first — deleting the directory while PGlite has it open
crashes the process.

```bash
# stop the dev server (Ctrl-C), then:
rm -rf .data
npm run dev   # re-seeds from scratch
```

---

## Turning off the pilot sign-in

**This is the single change required before any real deployment.**

Set one environment variable:

```
DEMO_ACCOUNTS=false
```

That does two things with no code change:

1. `GET /api/auth/demo-accounts` returns **404**
2. The login screen probes that endpoint on mount and, on 404, renders no
   pilot panel at all — the account list is not merely hidden, it is absent

It is already set to `"false"` in `k8s/03-app.yaml`. For Docker Compose or a
bare Node deployment, put it in the environment.

Verify after deploying:

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://<your-host>/api/auth/demo-accounts
# expect: 404
```

### Also do this for production

| Variable | Value | Why |
|---|---|---|
| `DEMO_ACCOUNTS` | `false` | Removes the pilot account picker |
| `SKIP_SEED` | `true` | Stops the demo dataset loading into a real database |
| `ADMIN_EMAIL` | your admin address | Bootstrap administrator |
| `ADMIN_PASSWORD` | a strong password | Bootstrap administrator |
| `JWT_SECRET` | 32+ random bytes | Signs sessions; **required** |
| `DATABASE_URL` | your Postgres URL | Without it the app uses local file storage, which does not survive pod restarts |

With `SKIP_SEED=true` the database starts empty except for one administrator
created from `ADMIN_EMAIL` / `ADMIN_PASSWORD`. That account is forced to change
its password at first sign-in. Every other user is created from the Admin
Console. **If you set `SKIP_SEED=true` without the admin variables, nobody can
sign in** — the API logs a warning saying exactly that.

Generate a secret:

```bash
openssl rand -base64 48
```

---

## Database setup

The app works against any PostgreSQL 14+. It creates its own schema on boot —
there is no migration CLI to run, and no SQL to apply by hand.

### What happens on every boot

1. `initSchema()` executes `server/schema.sql` (all statements are
   `CREATE TABLE IF NOT EXISTS`)
2. `applyMigrations()` runs idempotent `ALTER TABLE … ADD COLUMN IF NOT EXISTS`
   statements for columns added after a table first shipped
3. `seedIfEmpty()` loads demo data **only** when the `users` table is empty and
   `SKIP_SEED` is not `true`

This is safe to run repeatedly and safe on rolling deploys.

### Option A — embedded (local development only)

Set nothing. Data lands in `.data/pglite/`. Do not use this in Kubernetes: the
directory is pod-local and is lost on restart.

### Option B — PostgreSQL in a container

```bash
docker run -d --name mbx-db \
  -e POSTGRES_USER=mbx \
  -e POSTGRES_PASSWORD=change_me \
  -e POSTGRES_DB=mbxchange \
  -p 5432:5432 postgres:16-alpine

export DATABASE_URL='postgres://mbx:change_me@localhost:5432/mbxchange'
npm run dev
```

The log line changes to `[db] using PostgreSQL via DATABASE_URL`. That line is
your confirmation the external database is in use.

### Option C — managed PostgreSQL (Azure, RDS, Cloud SQL)

Create an empty database named `mbxchange`, then:

```
DATABASE_URL=postgres://<user>:<password>@<host>:5432/mbxchange?sslmode=require
PGSSL=require
```

`PGSSL=require` is needed for Azure Database for PostgreSQL. The application
user needs `CREATE TABLE` on the database — it builds its own schema.

### Backup

Ordinary Postgres tooling; nothing bespoke:

```bash
pg_dump "$DATABASE_URL" > mbxchange-$(date +%F).sql
psql "$DATABASE_URL" < mbxchange-2026-08-24.sql
```

---

## Deploying with Docker Compose

```bash
cp .env.example .env
# edit .env: set JWT_SECRET, DEMO_ACCOUNTS=false, and the admin variables
docker compose up -d --build
```

Compose starts PostgreSQL and the app together. The app is on
`http://localhost:8080`.

```bash
docker compose logs -f app     # follow logs
docker compose down            # stop, keep the volume
docker compose down -v         # stop and DELETE the database volume
```

---

## Deploying to Kubernetes

Manifests are in `k8s/`, applied in filename order.

```bash
# 1. Build and push the image
docker build -t <registry>/mbxchange:v1.0.0 .
docker push <registry>/mbxchange:v1.0.0

# 2. Point the deployment at that image
#    edit k8s/03-app.yaml -> spec.template.spec.containers[0].image

# 3. Create the secret (NEVER commit the result)
cp k8s/01-secrets.example.yaml k8s/01-secrets.yaml
#    replace every CHANGE_ME in k8s/01-secrets.yaml

# 4. Apply
kubectl apply -f k8s/00-namespace.yaml
kubectl apply -f k8s/01-secrets.yaml
kubectl apply -f k8s/02-postgres.yaml     # skip if using managed PostgreSQL
kubectl apply -f k8s/03-app.yaml
kubectl apply -f k8s/04-ingress.yaml      # edit the host first
```

Verify:

```bash
kubectl -n mbxchange rollout status deploy/mbxchange
kubectl -n mbxchange get pods
kubectl -n mbxchange logs -l app=mbxchange --tail=50
```

Expect `[db] using PostgreSQL via DATABASE_URL` and
`[server] MBXchange API listening`. Readiness and liveness probes both use
`GET /api/health`.

Using managed PostgreSQL instead of the in-cluster StatefulSet: skip
`02-postgres.yaml`, point `DATABASE_URL` in the secret at your server, and add
`PGSSL=require` to the deployment env.

---

## Post-deployment checklist

Run every check. All must pass.

```bash
HOST=https://<your-host>

# 1. Service is up
curl -s $HOST/api/health                                    # {"ok":true,...}

# 2. Pilot sign-in is OFF
curl -s -o /dev/null -w "%{http_code}\n" $HOST/api/auth/demo-accounts   # 404

# 3. Seed users did NOT load (production only)
curl -s -X POST $HOST/api/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"rakesh.kumar@mercedes-benz.com","password":"Mbx@2026"}'  # 401

# 4. The bootstrap admin CAN sign in
curl -s -X POST $HOST/api/auth/login -H 'Content-Type: application/json' \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}"     # token + mustChangePassword: true

# 5. Unauthenticated requests are rejected
curl -s -o /dev/null -w "%{http_code}\n" $HOST/api/users                 # 401
```

Then in a browser: sign in as the admin, confirm you are forced to change the
password, sign in again with the new one, and create the first real user from
**Admin Console → Users → Create Account**.

---

## Environment variables

| Variable | Default | Required | Purpose |
|---|---|---|---|
| `DATABASE_URL` | — | production | PostgreSQL connection string. Unset = embedded file storage. |
| `PGSSL` | — | Azure | Set to `require` for TLS-enforcing managed Postgres. |
| `JWT_SECRET` | dev fallback | **production** | Signs session tokens. Warns loudly if unset in production. |
| `API_PORT` | `8787` dev / `8080` container | no | Port the API listens on. |
| `DEMO_ACCOUNTS` | `true` | **production** | `false` removes the pilot account picker. |
| `SKIP_SEED` | — | production | `true` skips the demo dataset. |
| `ADMIN_EMAIL` | — | with `SKIP_SEED` | Bootstrap admin address. |
| `ADMIN_PASSWORD` | — | with `SKIP_SEED` | Bootstrap admin password. Forced change at first sign-in. |
| `ADMIN_NAME` | `Platform Administrator` | no | Display name for the bootstrap admin. |
| `ADMIN_DEPARTMENT` | empty | no | Department for the bootstrap admin. |
| `SEED_USER_PASSWORD` | `Mbx@2026` | no | Demo password. Irrelevant when `SKIP_SEED=true`. |
| `SEED_ADMIN_PASSWORD` | `MBXAdmin@2026` | no | Demo admin password. Same. |
| `PGLITE_DIR` | `.data/pglite` | no | Where embedded storage lives. |

---

## Architecture

```
Browser ──► Express (single container)
              ├── /api/*   REST, JWT auth
              └── /*       static Vite build
                    │
                    └──► PostgreSQL
```

| Path | Contents |
|---|---|
| `server/index.ts` | Entry point: schema, migrations, seed, static serving |
| `server/routes.ts` | All REST endpoints |
| `server/rules.ts` | Capacity engine, tier ladder, match scoring — pure functions, no I/O |
| `server/db.ts` | Driver switch (PostgreSQL vs embedded) and migrations |
| `server/schema.sql` | Canonical schema |
| `server/seed.ts` | Demo dataset and bootstrap admin |
| `src/views/` | One file per screen |
| `src/lib/store.tsx` | Global state, ~20s polling |
| `k8s/` | Kubernetes manifests |

### Things worth knowing before changing code

- **`server/rules.ts` has no database access.** Capacity checks, tiers and match
  scores are pure functions, deliberately testable in isolation.
- **Bandwidth is a ledger, not a counter.** Completing a requirement writes a
  `bandwidth_ledger` row and moves hours into contribution totals. Reopening it
  reverses the entry. A unique index on `(application_id, kind)` makes this
  idempotent.
- **Match scores are computed, never stored.** They depend on the viewer.
- **Presence rides the existing poll.** `GET /api/sync` stamps `last_seen`;
  under 90 seconds counts as online. There is no websocket.

---

## Roles

| Role | Can do |
|---|---|
| Employee | Post requirements, apply to others', declare bandwidth, use everything social |
| Manager | The above, plus approve/decline/approve-with-conditions for direct reports |
| Admin | The above, plus create and deactivate accounts, complete registration requests, read the audit log, and view the app as another user (audit-logged) |

Accounts are only ever created by an admin, who hands over a one-time password.
The recipient must replace it before they can reach any other screen.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `could not open file "base/…"` | `.data` deleted while running | Stop the server, `rm -rf .data`, restart |
| Everyone signed out after deploy | `JWT_SECRET` differs between replicas | Set one shared value in the secret |
| Demo users exist in production | `SKIP_SEED` not set on first boot | Drop the database, set `SKIP_SEED=true`, redeploy |
| Nobody can sign in, log warns about admin | `SKIP_SEED=true` with no admin vars | Set `ADMIN_EMAIL` and `ADMIN_PASSWORD`, restart |
| Pilot picker still visible | `DEMO_ACCOUNTS` not `false` | Set it; confirm `/api/auth/demo-accounts` is 404 |
| Data lost on pod restart | No `DATABASE_URL` | Set it — embedded storage is pod-local |
| `password authentication failed` | Wrong `DATABASE_URL`, or missing `sslmode=require` | Fix the URL; add `PGSSL=require` for Azure |

---

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | API + frontend with hot reload |
| `npm run build` | Production build (frontend + API bundle) |
| `npm run lint` | `tsc --noEmit` — must pass before deploying |
| `npm start` | Run the built app (requires `npm run build` first) |
