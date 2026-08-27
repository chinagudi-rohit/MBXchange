# MBXchange — Product Requirements Document

**Status:** reflects the shipped build on branch `rohit` as of 2026-08-27.
Every value, route, threshold and colour below was read off the running
system, not proposed. Where something is a deliberate non-goal it says so.

---

## 1. What the product is

MBXchange is an internal platform where a team can post a piece of work it
needs help with, and any employee can offer the hours and skills they choose
to bring to it — with the request routed through the right approvals and
recorded as a history of what was actually done.

It exists because that exchange already happens: someone asks a colleague on
chat, the colleague helps in the margins of their week, and nothing about it
is visible, approved, or repeatable. MBXchange makes the same exchange
findable, decidable, and creditable.

### 1.1 What it is not

These are firm boundaries, not omissions.

- **Not a performance system.** No score, badge or tier feeds a review, and
  nothing in the product suggests participation leads to advancement. The
  contribution score is private to the person and their line manager.
- **Not a utilisation or capacity tracker.** Declared hours are what somebody
  *offers*, not a measurement of their spare time. The product never computes
  "free capacity" from a sprint, and the copy avoids the word.
- **Not a resourcing/allocation tool.** Nobody is assigned. Every engagement
  starts as a voluntary application and passes two human decisions.
- **Not a public league table.** The leaderboard ranks collaboration reach,
  never the personal score.

### 1.2 Primary users

| Role | System role | What they can do |
|---|---|---|
| Employee | `employee` | Post requirements, apply to others', declare bandwidth, host and attend sessions, request collaboration, award badges, see their own score |
| Line manager | `manager` | Everything an employee can, plus approve their reports' applications and collaboration sign-offs, and pull a report on their own reports only |
| Administrator | `admin` | Account lifecycle, registration requests, the badge vocabulary, the tier ladder and its weighting, org-wide reporting, audit log |

---

## 2. Core domain model

27 tables. The ones that carry the product:

| Table | Holds |
|---|---|
| `users` | Person, role, department, declared skills, declared weekly bandwidth, contribution totals, tier |
| `work_posts` | A requirement: title, department, total effort, seats, skills, urgency, status |
| `applications` | One row per person per requirement, carrying the two-stage approval state |
| `collab_requests` | A direct ask to one named person, with its own two-stage state |
| `appreciations` | One badge award: who, to whom, for which engagement |
| `badge_definitions` | The admin-owned badge vocabulary |
| `tier_definitions` | The admin-owned tier ladder, one row per rung |
| `tier_settings` | Single row: the weighting behind tier points |
| `training_sessions` / `training_registrations` | Colleague-run sessions and their attendees |
| `carpool_trips` / `carpool_bookings` | One-way trips and seat requests |
| `bandwidth_ledger` | Append-only record of hours consumed and released |
| `audit_log` | Every administrative action |

**80 API routes.** Everything below `/api`, all behind `requireAuth()` except
login and the demo-account list.

---

## 3. Functional specification

### 3.1 Posting a requirement

**Who:** any employee.
**Where:** Opportunities → *Post Requirement*, or the global *Post / Request*
menu, or the Home quick action.

Fields: title (required), description (required), department, urgency
(Low/Medium/High/Critical), **total effort to complete**, location, seats,
skill tags, "why it's a great opportunity", and a manager-approval toggle.

**Effort is the total for the whole piece of work, not a weekly rate.** There
is deliberately no separate "duration" field — it invited people to describe
the same thing twice and disagree with themselves.

Skill tags use the same catalogue-backed chip editor as the profile, so a tag
here is the same token the matcher scores against.

### 3.2 Finding work — the match

Every requirement is scored against the viewer:

- **Skill overlap** — share of the requirement's tags the viewer has declared.
- **Bandwidth fit** — how the total effort sits against the hours the viewer
  has offered, minus what they have already committed.

The two combine into an overall figure that is **never shown as a
percentage**. It is a heuristic over declared data and is not accurate to the
point; printing "73%" would claim precision the inputs do not have.

Instead the card shows a **three-segment meter** with the level beside it:

| Overall | Segments lit | Label | Colour |
|---|---|---|---|
| ≥ 70 | 3 | High match | `--accent-green` |
| 40–69 | 2 | Medium match | `--primary` |
| < 40 | 1 | Low match | `--ink-3` |

Opening a requirement shows the working: a line chart across **Skills →
Bandwidth → Overall**, banded Low/Medium/High on the Y axis. A line rather
than three bars, because the *shape* is the information — a flat high line
and one that dips hard on bandwidth mean very different things, and the dip
is what you need to see before applying.

### 3.3 Applying — the two-stage approval

This is the spine of the product.

```
apply ──▶ pending_author ──▶ pending_manager ──▶ approved
              │                     │
              ▼                     ▼
           rejected              rejected
```

1. **Author's decision.** The person who posted the requirement decides
   first. They received the help; they judge whether this applicant fits.
2. **Line manager's decision.** Only after the author says yes does it reach
   the applicant's manager, who is authorising the time. At this hand-off the
   system computes a fresh bandwidth recommendation, so the manager decides
   against current numbers rather than the ones at application time.
3. **Seats fill → status advances.** When approved applications equal the
   seat count, the requirement moves to *In Progress* automatically.

Rules enforced server-side:
- A rejection at either stage requires a written reason.
- Nobody can decide their own application; admins included.
- An applicant with no registered manager parks at `awaiting_registration`
  and raises a registration request to the admin rather than silently failing.
- Withdrawing is allowed from any pending state.

**`awaiting_registration` is reachable only from `pending_manager`** — the
author has already said yes, and the only thing missing is a manager to hand
off to.

### 3.4 Direct collaboration requests

Same two-stage shape, different entry point. From People & Skills you ask one
named person for help on a specific task.

```
request ──▶ pending (target decides) ──▶ pending_manager (their manager) ──▶ accepted
```

If the target has no manager on record, accepting finalises immediately —
there is nobody to hand off to.

### 3.5 Bandwidth

Each person declares the hours per week they are willing to offer. This is an
**offer, not a measurement**: somebody with one nominally free hour may choose
to give four, and the product never infers availability from a sprint.

The ledger records hours as engagements complete and releases them if an
engagement is withdrawn or cancelled, so the figure behind a recommendation is
always the current one.

### 3.6 Recognition — badges

**Badges are the recognition unit.** Recognition used to be a free-text note
plus a 1–5 rating; everybody gave 5, so the rating said nothing while a badge
names *what* the person did.

- **Who can award:** anyone who worked on a completed requirement may
  recognise anyone else who did — the author, the people who did the work, and
  either side's manager.
- **When:** only once the requirement is *Completed*.
- **Limit:** one badge per giver, per recipient, per requirement. You can
  recognise several people on one piece of work; you cannot recognise the same
  person twice for it.
- **Optional, always.** Nothing blocks, gates or nags on the absence of a
  badge. The prompt to recognise is a suggestion.
- **Not self-serving:** you cannot award yourself.

The vocabulary is **admin-owned** (§3.9), seeded with 12 badges across four
qualities: helping & mentorship, technical expertise, cross-team
collaboration, reliability & follow-through. Each badge carries a
`criteria` string — guidance shown to whoever is choosing one.

Retiring a badge that has been awarded **deactivates** it rather than deleting
it; nobody loses recognition they earned. Only an unheld badge is removed
outright.

### 3.7 Contribution score

**Definition: hours contributed, and nothing else.**

```
score = 5 × min(1, hoursContributed / hoursTarget)
```

`hoursTarget` defaults to 250 and is the same admin-configurable number the
tier ladder uses — one knob, not two.

- Badges do **not** move it. Awarding one is recognition, not scoring.
- It is recomputed wherever contribution totals change.
- **Visibility:** the person, their line manager, and admins. `GET /score`
  and `GET /milestones` refuse anyone else. It is not rankable on the
  leaderboard and is not returned in the directory for other people.

The Home card shows the number, the hours behind it, and how far the top of
the scale is. Engagement and department counts sit alongside as context and
are explicitly not inputs.

### 3.8 Tiers

A tier is a rank earned from contribution history. Points out of 100:

```
points = 100 × ( wHours × min(1, hours/hoursTarget)
               + wContrib × min(1, contributions/contributionsTarget) )
                 ÷ (wHours + wContrib)
```

Hours answer *how much did they give*; contribution count answers *how often
did they show up*. Two different things, so each carries its own weight and
its own saturation target. Weights are normalised, so they need not sum to 1.

Defaults: `wHours 0.6`, `wContrib 0.4`, `hoursTarget 250`,
`contributionsTarget 25`. Seeded ladder:

| Tier | Reached at | Artifact |
|---|---|---|
| Contributor | 0 pts | tetrahedron |
| Collaborator | 12 pts | octahedron |
| Connector | 30 pts | dodecahedron |
| Catalyst | 55 pts | icosahedron |
| Principal | 80 pts | orbital icosa |

Everything here is admin-editable. Changing a threshold or a weight
re-evaluates every active user. A tier promotion notification fires only when
the new tier's threshold is genuinely higher than the old one's, so a rename
never reads as a promotion.

### 3.9 Administration

**Admin Console → Badges & Tiers.**

- **Weighting editor** with a live preview against four sample profiles.
  Saving re-tiers the whole organisation, so seeing the effect first is the
  difference between a considered change and a surprise.
- **Tier ladder:** add, rename, retune the threshold, edit the description,
  pick the 3D artifact, deactivate. The ladder refuses to drop its last tier.
- **Badge vocabulary:** add, edit name/icon/description/criteria, move between
  qualities, retire. Changing a badge's quality re-buckets every award of it.

**3D artifact catalogue: 15 solids** — deliberately more than the ladder needs
so a newly created tier always has something distinctive available:
tetrahedron, cube, octahedron, hex prism, diamond, dodecahedron, icosahedron,
geodesic sphere, torus, torus knot, capsule, sphere, ringed core, orbital
icosa, crown. Three carry an orbiting ring, which is the cheapest way to make
the top of a ladder look like the top.

Other admin surfaces: account creation with a generated one-time password,
role and status changes, password reset, registration-request completion,
impersonation (audit-logged, and admin checks use the *real* signed-in user so
an impersonated session cannot escalate), and the audit log.

### 3.10 Learning

Anyone can host a lecture or training: title, description, skills taught,
level, format (Virtual/In-person/Hybrid), location, date, start time,
duration, seats.

Registration is open — no host gate. A **full session waitlists** rather than
refusing, so interest stays visible to the host, who can then widen the room
or repeat it. Freeing a seat, either by a cancellation or by the host adding
seats, promotes the longest-waiting person automatically and notifies them.

Hosts see their roster on their own session cards and can cancel or
reschedule; both notify everyone signed up.

### 3.11 Insights

- **Leaderboard.** Scoped to organisation / department / team, where "team"
  means a manager's own reports and, for everyone else, their peer group under
  the same manager. Ranks on badges, hours, engagements, or departments
  reached — **never the contribution score**. Ranking is computed in SQL with
  `DENSE_RANK`, so a page of five out of twenty thousand still carries true
  positions and equal values share a place. Shows five, expands to twenty,
  pages from there; if the viewer falls outside the visible page their own row
  is appended so the board is never demotivating noise.
- **Capability heatmap** — demand vs supply per skill, sourced from live
  requirement tags.
- **Team report** (managers and admins). An admin can pull organisation-wide,
  by department, or by manager; **a manager is forced to their own reports
  server-side regardless of what the request asks for**. The roster table
  flags anyone whose committed hours exceed their declared bandwidth — the
  reason to open it — and exports to CSV.

### 3.12 Beyond Work

Carpool and Communities. Carpool seat booking is a **request**, not an instant
confirmation: the driver approves or declines, and the request lands in their
Messages as a thread they can act on inline. A declined booking keeps its row
so the thread still reads correctly; asking again clears it first.

### 3.13 Profile

Declared skills use a catalogue-backed chip editor. **CV import** reads a PDF
(pdf.js), .docx (mammoth) or plain text **entirely in the browser — the CV is
never uploaded** — and proposes skills as a pre-ticked review list.

Matching is a catalogue lookup, not a language model: only skills already in
the catalogue can be proposed, and each hit records the phrase it matched. The
catalogue's own typeahead aliases are deliberately *not* used — they exist so
typing "python" offers Django, which is exactly wrong as evidence. Short
all-letter names (`C`, `R`, `Go`) are skipped: they hit "R&D" and "Go to
market" constantly.

---

## 4. Security, privacy and GDPR

### 4.1 Data minimisation

The directory returns only what serves finding the right person and asking
them for help.

| Public to all colleagues | Restricted to self / line manager / admin |
|---|---|
| Name, initials, role, department, campus | Email address |
| Skills, interests, specialisation | Manager (who they report to) |
| Declared weekly bandwidth | Contribution score |
| Badges, badge count, tier | Hours consumed |
| Contribution totals (hours, engagements, departments) | `mustChangePassword` |
| Online/offline **boolean** | Exact `lastSeen` timestamp |

Presence is a dot, not a timestamp: a dot is useful, "last active at 14:07" is
monitoring.

### 4.2 Access control

- `GET /score` and `GET /milestones` accept a `userId` and **refuse** unless
  the caller is the subject, their line manager, or an admin.
- `GET /reports` is manager/admin only, and a manager's scope is forced to
  their own reports server-side.
- Admin routes check the **real** signed-in user (`requireRealAdmin`), so an
  impersonated session cannot perform admin actions.
- Approvals are visible only to the person the decision is routed to.
- Every administrative action is written to `audit_log`.

### 4.3 Transport and application security

- Password hashing with bcrypt; JWT bearer sessions.
- `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
  `Referrer-Policy: no-referrer` on every response.
- Every query is parameterised — no string-built SQL anywhere.
- 1 MB request body cap.
- Errors return a generic message; details stay in the server log.

---

## 5. Visual specification

### 5.1 Colour

A cool corporate blue on a light neutral ground. Semantic accents sit off the
primary hue so a status chip never reads as "branded".

**Light**

| Token | Value | Role |
|---|---|---|
| `--page` | `#f7f8fb` | page ground |
| `--surface-solid` | `rgba(255,255,255,.97)` | cards |
| `--surface-2` | `rgba(23,109,208,.06)` | inset fills |
| `--line` | `#cbd2dc` | decorative hairline |
| `--line-strong` | `#929dac` | input / control borders |
| `--ink` | `#1b2736` | primary text |
| `--ink-2` | `#4d5a66` | secondary text |
| `--ink-3` | `#626d7a` | tertiary text |
| `--primary` | `#176dd0` | brand fill |
| `--primary-strong` | `#1157ae` | hover |
| `--primary-text` | `#135caa` | brand text |
| `--accent-green` | `#128166` | success |
| `--accent-amber` | `#9a650d` | warning |
| `--accent-red` | `#c22921` | danger |
| `--accent-blue` | `#107a9c` | info (teal, to stay distinct from primary) |
| `--accent-violet` | `#6758c8` | cross-department |

**Dark** — navy-tinted, one step deeper: page `#0d131b`, cards
`rgba(21,29,40,.97)`, ink `#eaf0f6`, primary `#4c9aef`.

**Measured contrast** (light, against white / against page):

| Pair | Ratio |
|---|---|
| ink | 15.1 / 14.2 |
| ink-2 | 7.1 / 6.7 |
| ink-3 | 5.3 / 5.0 |
| primary-text | 6.7 / 6.3 |
| white on primary | 5.1 |
| green / amber / red / blue / violet | 4.8–5.8 |

Dark mode holds 4.98:1 or better on the card for every text and accent token.

### 5.2 Typography

**Outfit**, 400/500/600/700/800.

| Step | Size / line-height | Role |
|---|---|---|
| `xs` | 12 / 16 | chips and captions **only** |
| `sm` | 14 / 22 | body, list rows |
| `base` | 17 / 24 | card titles |
| `lg` | 18 / 24 | section headings |
| `xl` | 22 / 28 | sub-display |
| `2xl` | 30 / 36 | view titles |
| `3xl` | 40 / 44 | display |

The scale was rebuilt from 12·14·16·20·28, which put three quarters of the
app's text at 12 px — body, captions, chips and table cells all one size,
separated only by weight, which is a weak hierarchy signal. 17 and 18 fill the
hole that previously forced section headings *smaller* than the text they
introduced.

Uppercase micro-labels carry +0.055em tracking; caps at 12 px jam together
without it. Numeric columns use `tabular-nums`.

### 5.3 Layout and space

- Content column **capped at 1280 px and centred**. Unbounded it stretched to
  the full monitor, giving 100+ character measures and grids so sparse the
  cards stopped reading as a set.
- Page padding 40 px top / 48 px sides.
- Section rhythm 56 px.
- Card padding 20–24 px; grid gaps 16–20 px. The ratio matters more than
  either number: space *inside* a card must exceed space *between* cards or
  they stop reading as discrete objects.
- Card radius 16 px.

### 5.4 The filter row

Every list page shares one `FilterBar`. The search field has a **fixed 312 px
basis on every tab** and the dropdowns split the remainder evenly, so the row
stays symmetric whether a page has two filters or four. All controls are a
matched 44 px tall; the search sits on a faint primary tint so it reads as the
control that drives the results rather than as another filter.

### 5.5 Cards and depth

Grid cards use a **cursor-tracked tilt**: ≤4° rotation, 1.015 scale, 6 px
lift, 200 ms ease. Applied to every grid of content cards — Opportunities,
People, Home recommendations, Learning, carpool, community groups and posts,
Achievements milestones and badges, approvals, and the admin tier and badge
cards.

Deliberately **not** applied to My Requests, Insights or the Admin Console:
those are full-width list rows and stat tiles, and tilting a row that spans
the page reads as a glitch rather than as depth.

There is **no cursor glare**. A radial highlight under the pointer washed out
whatever text sat beneath it, making the part of the card you were looking at
the least legible part of it.

The effect is skipped entirely under `prefers-reduced-motion` and on touch
devices, where there is no hover state and the transform fights scrolling.

### 5.6 Layer scale

Equal z-index falls back to DOM order, which is how a hovered card once
painted over the sticky filter bar. The scale is fixed:

```
 1  content card at rest
 5  content card lifted on hover
20  in-page sticky bar
30  app header
40  impersonation banner, mobile bottom nav
50  menus, drawers, modals
```

### 5.7 3D artifacts

Tier solids render in three.js: standard material at 0.35 roughness / 0.6
metalness with a 0.22-opacity wireframe overlay so facets stay legible at
badge size. Rotation 0.008 rad/frame, paused when off-screen via
`IntersectionObserver`, and frozen to a static pose under
`prefers-reduced-motion`. Falls back to a flat glyph wherever WebGL is
unavailable. Accent colour is read from the live CSS token and re-read on
theme change.

---

## 6. Non-functional

- **Stack:** React 19 + Vite, Express, PostgreSQL (PGlite in local dev — real
  Postgres in-process, so the same SQL runs either way).
- **Migrations** are idempotent and additive; a column is added defaulting to
  the value that correctly backfills existing rows, then switched to its
  going-forward default. No backfill `UPDATE` that would re-run on every boot.
- **Seeding** runs only when the users table is empty; recognition defaults
  fill only empty tables, so an admin's edits are never overwritten.
- **Accessibility:** every text token clears WCAG AA; focus rings on all
  interactive elements; the match meter states its level in text, not colour
  alone; charts carry `role="img"` with a text label.
- **Testing:** `docs/e2e-test.sh` drives the real HTTP API across all three
  roles — 77 checks covering posting, applying, both approval stages,
  recognition, collaboration requests, Learning with waitlisting, carpool,
  manager reporting, the admin console, and every authorisation boundary.

---

## 7. Open questions

1. **Hours target.** 250 h is the saturation point for both the score and the
   tier ladder. It is a guess until there is real usage data; it is
   admin-tunable precisely because it will need retuning.
2. **Whose budget.** The product records that an engineer gave hours to
   another team. It does not model cost transfer, and that is the first
   question leadership will ask.
3. **Badge inflation.** Nothing currently rate-limits awards beyond one per
   giver/recipient/requirement. If badges become universal they stop meaning
   anything; worth watching before adding more of them.
