# MBXchange

Mercedes-Benz internal work exchange — cross-department requirements, nominations with
manager approval, people & skills discovery, and a parked **Beyond Work** area
(marketplace · carpool · communities).

Full-stack app: **React 19 + Vite + Tailwind v4** frontend, **Express + PostgreSQL** API,
JWT auth with admin-managed accounts, rule-based AI capacity checks on every approval,
and seeded demo data on first boot.

---

## Local development (zero installs beyond Node)

```bash
npm install
npm run dev
```

- Web: http://localhost:3000 (proxies `/api` to the API)
- API: http://localhost:8787
- Database: **embedded PGlite** (real Postgres in-process, file-backed at `.data/pglite`).
  No Docker, no Postgres install needed. Set `DATABASE_URL` to use external PostgreSQL —
  the same schema and seed run identically.
- Reset all data: `rm -rf .data` and restart.

### Seeded demo accounts (pilot only — rotate/remove for production)

| Role | Email | Password |
|---|---|---|
| Admin | markus.becker@mercedes-benz.com | `MBXAdmin@2026` |
| Manager | elena.rostova@mercedes-benz.com | `Mbx@2026` |
| Manager | johannes.brandner@mercedes-benz.com | `Mbx@2026` |
| Employee | rakesh.kumar@mercedes-benz.com | `Mbx@2026` |
| Employee (no manager — exercises the admin registration flow) | nikhil.verma@mercedes-benz.com | `Mbx@2026` |

All other seeded users share `Mbx@2026`. Override at first boot with
`SEED_USER_PASSWORD` / `SEED_ADMIN_PASSWORD`.

There is **no self-signup**: admins create accounts (Admin Console → Users → Create
Account) and hand the generated temporary password to the employee, who can change it
in *Profile → Change Password*.

---

## Production-like local run (Docker)

```bash
docker compose up --build
```

App on http://localhost:8080 with a real PostgreSQL container and persistent volume.
Set `JWT_SECRET` and `POSTGRES_PASSWORD` in your shell or an `.env` file first for
anything shared.

---

## Deploying to Azure (AKS)

The app ships as one container (API + static frontend) plus PostgreSQL.

### 1. Build & push the image (Azure Container Registry)

```bash
az acr login --name <acr-name>
docker build -t <acr-name>.azurecr.io/mbxchange:v2.0.0 .
docker push <acr-name>.azurecr.io/mbxchange:v2.0.0
```

### 2. Configure secrets

```bash
cp k8s/01-secrets.example.yaml k8s/01-secrets.yaml
# edit: strong JWT_SECRET, DB password, DATABASE_URL
```

For **managed Azure Database for PostgreSQL** (recommended for production —
backups, HA, patching handled by Azure): create the flexible server, then point
`DATABASE_URL` at it with `sslmode=require`, set `PGSSL: require` in
`k8s/03-app.yaml`, and **skip `02-postgres.yaml`**.

### 3. Deploy

```bash
kubectl apply -f k8s/00-namespace.yaml
kubectl apply -f k8s/01-secrets.yaml
kubectl apply -f k8s/02-postgres.yaml        # skip when using managed PostgreSQL
# edit image reference in 03-app.yaml → <acr-name>.azurecr.io/mbxchange:v2.0.0
kubectl apply -f k8s/03-app.yaml
kubectl apply -f k8s/04-ingress.yaml         # set your host/TLS first
kubectl -n mbxchange get pods
```

First boot creates the schema and loads the demo dataset automatically (skipped when
data already exists).

### Security posture

- Passwords hashed with bcrypt; JWT sessions (12 h); role checks enforced server-side
  on every endpoint; all SQL parameterized.
- Admin-only account creation with one-time temporary passwords; admin "view as user"
  impersonation is audit-logged (`audit_log` table, visible in Admin Console → Audit).
- Container runs non-root with dropped capabilities; secrets only via K8s Secrets.
- Before production: rotate the seeded demo passwords or wipe/replace the seed,
  set a strong `JWT_SECRET`, front the ingress with TLS, and consider Entra ID SSO
  as an auth upgrade.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | API (tsx watch, :8787) + web (Vite, :3000) together |
| `npm run build` | Frontend → `dist/`, API bundle → `dist-server/` |
| `npm start` | Serve the production build (API + static) on `API_PORT` (8787) |
| `npm run lint` | TypeScript check |
| `npm run clean` | Remove builds and the embedded dev database |

## Architecture notes

- `server/` — Express API, schema, seed, auth, and the rule-based recommendation
  engine (`server/rules.ts`) that compares declared weekly capacity (minus hours
  already committed to pending/approved engagements) against each opportunity's
  effort range → Approve / Review Capacity / Not Recommended.
- `src/` — React app: `lib/` (API client, store), `components/ui.tsx` (design
  system primitives), `views/` (screens). Glassmorphic UI on the **Claude Amber**
  palette (21st.dev/@serafimcloud) with an ambient gradient mesh, frosted panels,
  a collapsible sidebar (⌘\) and a dark-mode toggle; tokens in `src/index.css`.
  Semantic accents (success/warning/danger/info) are derived on the same warm
  scale — the danger red is deepened so it stays distinct from the terracotta
  primary.
- `Insights` is open to **every role**: capability demand-vs-supply heatmap,
  personal upskilling suggestions, live skill demand from open requirements, and
  per-department load.
- Statuses are exactly: **Open · In Progress · Completed · Cancelled** (work) and
  **pending · approved · rejected · withdrawn · awaiting_registration** (requests).
- Applications support self-apply **and adding colleagues** — every person's request
  routes to *their own* manager; people without a registered manager (or not on the
  platform) generate an admin registration request that unblocks automatically once
  completed.
