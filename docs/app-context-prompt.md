# MBXchange — application context block

Paste everything below the line into a prompt as the "here is the application"
section. It is written to be read by a model, not by a person: it states what
the product is, the rules it must not break, and the exact design tokens to
build against. Keep it verbatim — the constraints are load-bearing.

---

## APPLICATION CONTEXT — MBXchange

You are working on **MBXchange**, an internal web platform for Mercedes-Benz
R&D. A team posts a piece of work it needs help with; any employee can offer
the hours and skills they choose to bring to it; the request is routed through
two human approvals and recorded as a history of what was actually done.

It exists because that exchange already happens informally — someone asks a
colleague on chat, the colleague helps in the margins of their week, and none
of it is visible, approved, or repeatable. MBXchange makes the same exchange
findable, decidable and creditable.

### HARD CONSTRAINTS — never violate these

These are product boundaries, not preferences. Breaking one is a defect.

1. **This is not a performance system.** No score, badge or tier feeds a
   review or implies advancement. Never write copy suggesting participation
   leads to promotion, career growth, visibility to leadership, or "building a
   profile". Frame everything as upskilling and cross-team collaboration.
2. **Never use "capacity" for a person's declared hours.** Declared bandwidth
   is what somebody *offers*, not a measurement of their spare time. Somebody
   with one nominally free hour may choose to give four, including at
   weekends. Use "bandwidth", "hours offered", "hours they have offered to
   give". Never compute or display "free capacity", "utilisation", or
   "spare capacity".
3. **Nobody is assigned work.** Every engagement begins as a voluntary
   application and passes two human decisions. There is no allocation or
   resourcing feature.
4. **The contribution score is private.** Visible only to the person, their
   line manager, and admins. It is never rankable on the leaderboard and never
   returned in the directory for other people. Do not add a UI caption telling
   users who can see it — access is enforced server-side and a privacy notice
   on every render is noise.
5. **Giving a badge is always optional.** Never gate, block, force or nag on
   the absence of one.
6. **Do not claim organisational reach in UI copy.** Avoid "across teams and
   MB units", "across departments", "organisation-wide" in page headers and
   subtitles. Describe what the page does instead. (The pitch deck may carry
   the wider positioning; the product UI may not.)

### ROLES

| Role | `systemRole` | Capabilities |
|---|---|---|
| Employee | `employee` | Post requirements, apply to others', declare bandwidth, host/attend sessions, request collaboration, award badges, see own score |
| Line manager | `manager` | All of the above, plus approve their reports' applications and collaboration sign-offs, and pull a report **on their own reports only** |
| Administrator | `admin` | Accounts, registration requests, badge vocabulary, tier ladder and its weighting, org-wide reporting, audit log |

### CORE FLOWS

**Two-stage approval — the spine of the product.**

```
apply ──▶ pending_author ──▶ pending_manager ──▶ approved
              │                     │
              ▼                     ▼
           rejected              rejected
```

- The **requirement's author decides first** (they received the help).
- Only then does it reach the **applicant's line manager** (they authorise the
  time). At this hand-off a fresh bandwidth recommendation is computed, so the
  manager decides against current numbers.
- When approved applications equal the seat count, the requirement advances to
  *In Progress* automatically.
- A rejection at either stage requires a written reason.
- Nobody may decide their own application — admins included.
- An applicant with no registered manager parks at `awaiting_registration`
  (reachable **only** from `pending_manager`) and raises a registration
  request to the admin.

**Direct collaboration requests** use the same shape from People & Skills:
`pending` (target decides) → `pending_manager` (their manager) → `accepted`.
If the target has no manager, accepting finalises immediately.

**Posting a requirement** captures title, description, department, urgency,
**total effort to complete**, location, seats, skill tags. Effort is the total
for the whole piece of work — there is deliberately **no duration field**.

### MATCHING

Each requirement is scored against the viewer on two axes:

- **Skill overlap** — share of the requirement's tags the viewer has declared.
- **Bandwidth fit** — total effort against hours offered, minus what is
  already committed.

**Never display the match as a percentage.** It is a heuristic over declared
data; "73%" claims precision the inputs do not have. Show a three-segment
meter with the level named beside it:

| Overall | Segments | Label | Colour |
|---|---|---|---|
| ≥ 70 | 3 | High match | `--accent-green` |
| 40–69 | 2 | Medium match | `--primary` |
| < 40 | 1 | Low match | `--ink-3` |

The detail view shows the working as a line across **Skills → Bandwidth →
Overall**, banded Low/Medium/High on the Y axis — the *shape* is the
information, and a hard dip on bandwidth is what you need to see before
applying.

### RECOGNITION, SCORE AND TIERS

**Badges** are the recognition unit (a 1–5 star rating was removed: everybody
gave 5, so it said nothing, while a badge names *what* the person did).

- Anyone who worked on a **completed** requirement may recognise anyone else
  who did — author, the people who did the work, and either side's manager.
- One badge per giver, per recipient, per requirement. You cannot award
  yourself.
- The vocabulary is **admin-owned** (12 seeded across four qualities: helping
  & mentorship, technical expertise, cross-team collaboration, reliability &
  follow-through). Each carries a `criteria` string shown to the giver.
- Retiring a badge that has been awarded **deactivates** it — never delete
  recognition somebody earned. Only an unheld badge is removed outright.

**Contribution score — hours contributed, and nothing else:**

```
score = 5 × min(1, hoursContributed / hoursTarget)      // hoursTarget default 250
```

Badges do **not** move it. It is recomputed wherever contribution totals
change.

**Tiers** — points out of 100 from a weighted formula:

```
points = 100 × ( wHours   × min(1, hours        / hoursTarget)
               + wContrib × min(1, contributions/ contributionsTarget) )
                 ÷ (wHours + wContrib)
```

Hours answer *how much did they give*; contribution count answers *how often
did they show up* — two different things, so each has its own weight and
saturation target. Weights are normalised and need not sum to 1. Defaults:
`wHours 0.6`, `wContrib 0.4`, `hoursTarget 250`, `contributionsTarget 25`.

Seeded ladder — every field admin-editable, and changing any of it
re-evaluates every active user:

| Tier | Reached at | 3D artifact |
|---|---|---|
| Contributor | 0 pts | tetrahedron |
| Collaborator | 12 pts | octahedron |
| Connector | 30 pts | dodecahedron |
| Catalyst | 55 pts | icosahedron |
| Principal | 80 pts | orbital icosa |

A promotion notification fires only when the new tier's threshold is genuinely
higher, so a rename never reads as a promotion.

### OTHER SURFACES

- **Learning** — anyone hosts a session (skills taught, level, format, date,
  seats). Registration is open, no host gate. A full session **waitlists**
  rather than refusing; freeing a seat promotes the longest-waiting person
  automatically.
- **Insights** — capability heatmap (demand vs supply per skill), leaderboard,
  and a team report for managers/admins. The leaderboard ranks badges, hours,
  engagements or departments reached — **never the score** — with `DENSE_RANK`
  in SQL so a page of five out of twenty thousand carries true positions. It
  shows five, expands to twenty, pages from there, and appends the viewer's
  own row if they fall outside the visible page.
- **Beyond Work** — carpool and communities. A carpool seat booking is a
  *request*: the driver approves or declines, and it lands in their Messages
  as an inline-actionable thread.
- **Profile** — catalogue-backed skill chips, plus **CV import** that reads
  PDF/.docx/text **entirely in the browser** (the CV is never uploaded) and
  proposes skills as a pre-ticked review list. Matching is a catalogue lookup,
  never a language model; typeahead aliases are deliberately not used as
  evidence, and short all-letter names (`C`, `R`, `Go`) are skipped because
  they hit "R&D" and "Go to market".

### PRIVACY / GDPR — field visibility

| Public to all colleagues | Restricted to self / line manager / admin |
|---|---|
| Name, initials, role, department, campus | Email address |
| Skills, interests, specialisation | Manager (who they report to) |
| Declared weekly bandwidth | Contribution score |
| Badges, badge count, tier | Hours consumed |
| Contribution totals (hours, engagements, departments) | `mustChangePassword` |
| Online/offline **boolean** | Exact `lastSeen` timestamp |

Presence is a dot, not a timestamp — a dot is useful, "last active at 14:07"
is monitoring.

Enforcement: `GET /score` and `GET /milestones` accept a `userId` and refuse
unless the caller is the subject, their manager, or an admin. `GET /reports`
is manager/admin only and a manager's scope is **forced** to their own reports
server-side. Admin routes check the *real* signed-in user, so an impersonated
session cannot escalate. Every administrative action is written to
`audit_log`.

Security: bcrypt password hashing, JWT bearer sessions, parameterised SQL
everywhere, 1 MB body cap, `X-Content-Type-Options: nosniff`,
`X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, generic error
messages with detail kept in the server log.

---

## DESIGN SYSTEM

### Colour tokens — light

| Token | Value | Role |
|---|---|---|
| `--page` | `#f7f8fb` | page ground |
| `--surface` | `rgba(255, 255, 255, 0.74)` | chrome (header, sidebar, drawers) |
| `--surface-solid` | `rgba(255, 255, 255, 0.97)` | content cards |
| `--surface-overlay` | `#ffffff` | modals, drawers — fully opaque |
| `--surface-2` | `rgba(23, 109, 208, 0.06)` | inset fills |
| `--line` | `#cbd2dc` | decorative hairline |
| `--line-strong` | `#929dac` | input and control borders |
| `--ink` | `#1b2736` | primary text |
| `--ink-2` | `#4d5a66` | secondary text |
| `--ink-3` | `#626d7a` | tertiary text |
| `--primary` | `#176dd0` | brand fill (buttons, active nav) |
| `--primary-strong` | `#1157ae` | hover |
| `--primary-text` | `#135caa` | brand-coloured text |
| `--primary-soft` | `rgba(23, 109, 208, 0.12)` | soft fill |
| `--on-primary` | `#ffffff` | text on a primary fill |
| `--accent-green` | `#128166` | success |
| `--accent-green-soft` | `rgba(18, 129, 102, 0.12)` | |
| `--accent-amber` | `#9a650d` | warning |
| `--accent-amber-soft` | `rgba(154, 101, 13, 0.14)` | |
| `--accent-red` | `#c22921` | danger |
| `--accent-red-soft` | `rgba(194, 41, 33, 0.10)` | |
| `--on-red` | `#ffffff` | text on a red fill |
| `--accent-blue` | `#107a9c` | info — **teal**, kept off the primary hue |
| `--accent-blue-soft` | `rgba(16, 122, 156, 0.12)` | |
| `--accent-violet` | `#6758c8` | cross-department |
| `--accent-violet-soft` | `rgba(103, 88, 200, 0.12)` | |
| `--glass-border` | `rgba(255, 255, 255, 0.70)` | |
| `--shadow-card` | `0 2px 16px -4px rgba(18, 32, 51, 0.10), 0 0 0 1px var(--glass-border), inset 0 1px 0 rgba(255,255,255,0.8)` | |
| `--shadow-pop` | `0 24px 48px -12px rgba(18, 32, 51, 0.26), 0 0 0 1px var(--glass-border)` | |

### Colour tokens — dark

| Token | Value |
|---|---|
| `--page` | `#0d131b` |
| `--surface` | `rgba(17, 24, 34, 0.70)` |
| `--surface-solid` | `rgba(21, 29, 40, 0.97)` |
| `--surface-overlay` | `#161e28` |
| `--surface-2` | `rgba(238, 243, 248, 0.055)` |
| `--line` | `#283545` |
| `--line-strong` | `#425266` |
| `--ink` | `#eaf0f6` |
| `--ink-2` | `#b1becd` |
| `--ink-3` | `#8797a9` |
| `--primary` | `#4c9aef` |
| `--primary-strong` | `#6fb0f6` |
| `--primary-text` | `#80b9f7` |
| `--primary-soft` | `rgba(90, 162, 240, 0.16)` |
| `--on-primary` | `#0b1420` — the fill is light here, so its text inverts |
| `--accent-green` | `#63cc9e` |
| `--accent-amber` | `#dea252` |
| `--accent-red` | `#fa7d7d` |
| `--on-red` | `#18212d` |
| `--accent-blue` | `#52bfe6` |
| `--accent-violet` | `#9079f4` |

Dark mode is applied by a `.dark` class on `<html>`; every colour is a token
so nothing needs a per-component dark variant.

### Measured contrast

Light, against white / against page ground:

| Pair | Ratio |
|---|---|
| `--ink` | 15.1 / 14.2 |
| `--ink-2` | 7.1 / 6.7 |
| `--ink-3` | 5.3 / 5.0 |
| `--primary-text` | 6.7 / 6.3 |
| white on `--primary` | 5.1 |
| green / amber / red / blue / violet | 4.8 – 5.8 |

Dark mode holds **4.98:1 or better** on the card for every text and accent
token. Any new colour must clear 4.5:1 for text and 3:1 for a border that
carries meaning.

### Palette discipline

One filled blue per screen — the primary action. Semantic accents sit off the
primary hue so a status chip never reads as "branded". Info is **teal**, not
blue, precisely so it stays legible as a *status* next to a blue button. Do
not introduce a sixth accent hue.

### Typography

**Outfit**, weights 400/500/600/700/800.

| Step | Size / line-height | Role |
|---|---|---|
| `text-xs` | 12 / 16 | chips and captions **only** |
| `text-sm` | 14 / 22 | body, list rows |
| `text-base` | 17 / 24 | card titles |
| `text-lg` | 18 / 24 | section headings |
| `text-xl` | 22 / 28 | sub-display |
| `text-2xl` | 30 / 36 | view titles |
| `text-3xl` | 40 / 44 | display |

Rules: 12 px is reserved for chips and captions — never body. Uppercase
micro-labels carry `+0.055em` tracking (caps at 12 px jam together without
it). Display sizes carry negative tracking (−0.5 to −0.7 px). Numeric columns
use `tabular-nums`.

### Layout and spacing

- Content column **capped at 1280 px, centred** (`max-w-[1280px] mx-auto`).
  Unbounded it stretches to the monitor, giving 100+ character measures.
- Page padding 40 px top / 48 px sides.
- Section rhythm 56 px (`space-y-14`).
- Card padding 20–24 px; grid gaps 16–20 px. **Space inside a card must exceed
  space between cards**, or they stop reading as discrete objects.
- Card radius 16 px.
- Inside a card use only 8 / 16 / 24 px gaps.

### Layer scale

Equal z-index falls back to DOM order — that is how a hovered card once
painted over the sticky filter bar. Keep the gaps:

```
 1  content card at rest
 5  content card lifted on hover
20  in-page sticky bar
30  app header
40  impersonation banner, mobile bottom nav
50  menus, drawers, modals
```

### Components and conventions

- **`FilterBar`** — every list page's filter row. The search field has a fixed
  **312 px** basis on every tab; dropdowns split the remainder evenly, so the
  row is symmetric with two filters or four. All controls a matched **44 px**
  tall. The search sits on a faint primary tint so it reads as the control
  that drives results, not as another filter.
- **`TiltCard`** — cursor-tracked tilt on grid cards: ≤4° rotation, 1.015
  scale, 6 px lift, 200 ms ease. Apply to **every grid of content cards**.
  Do **not** apply to full-width list rows or stat tiles — a tilting row that
  spans the page reads as a glitch. There is deliberately **no cursor glare**:
  a radial highlight under the pointer washes out the text beneath it. Skipped
  entirely under `prefers-reduced-motion` and on touch devices.
- **`Card`**, **`Button`**, **`Chip`**, **`Avatar`**, **`Modal`**, **`Field`**,
  **`TextInput`**, **`TextArea`**, **`Select`**, **`FilterSelect`**,
  **`EmptyState`**, **`SkeletonGrid`**, **`Reveal`** — shared in
  `src/components/ui.tsx`. Use these; do not hand-roll equivalents.
- **`TagEditor`** — catalogue-backed skill chips. Use it anywhere skills are
  entered.
- **3D tier artifacts** — three.js, 15-solid catalogue in
  `src/components/tierArtifacts.ts`. Standard material 0.35 roughness / 0.6
  metalness with a 0.22-opacity wireframe so facets read at badge size.
  Rotation 0.008 rad/frame, paused off-screen via `IntersectionObserver`,
  frozen under `prefers-reduced-motion`, flat-glyph fallback without WebGL.
  Accent colour read from the live CSS token and re-read on theme change.

### Motion

Deliberate and short. 200 ms for hover/press, 700 ms `cubic-bezier(0.2,0.8,0.3,1)`
for a value animating into place (score ring, progress bar). Nothing loops.
Everything respects `prefers-reduced-motion`.

---

## TECHNICAL SHAPE

- **Frontend:** React 19 + Vite + Tailwind v4 (`src/`). Views in `src/views/`,
  shared UI in `src/components/`, API client and store in `src/lib/`.
- **Backend:** Express (`server/`) — `routes.ts` (80 routes), `auth.ts`
  (JWT, field-visibility sets), `badges.ts` (score/badge rollups),
  `recognition.ts` (admin-owned badge + tier config, cached), `rules.ts`
  (matching and recommendation), `db.ts`, `seed.ts`, `schema.sql`.
- **Database:** PostgreSQL. Local dev uses PGlite — real Postgres in-process,
  so the same SQL runs either way. 27 tables.
- **Migrations** are idempotent and additive. When adding a column that needs
  a backfill, add it with the value that correctly backfills existing rows,
  *then* switch the default for new rows. Never write a backfill `UPDATE` that
  re-runs on every boot.
- **Seeding** runs only when the users table is empty; recognition defaults
  fill only empty tables so admin edits are never overwritten.
- **Verification:** `npm run lint` is `tsc --noEmit` and must stay clean.
  `docs/e2e-test.sh` drives the real HTTP API across all three roles — 77
  checks covering posting, applying, both approval stages, recognition,
  collaboration requests, Learning with waitlisting, carpool, manager
  reporting, the admin console, and every authorisation boundary.

## HOUSE STYLE FOR CODE

- Comments explain *why*, never *what*. If a line is non-obvious, say what it
  is defending against.
- Match the surrounding idiom, comment density and naming.
- Server-side authorisation is the source of truth; UI gating is a
  convenience, never the control.
- Parameterise every query. No string-built SQL.
