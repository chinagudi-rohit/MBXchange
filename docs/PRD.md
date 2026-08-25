# MBXchange — Product Requirements Document

**Status:** Describes the implemented product (v2.0.0) as it exists in this repository, not a forward-looking proposal. Every requirement below is backed by working code, a database table, or an API route — see the file references inline.
**Owner:** Internal platform team
**Last updated:** 2026-08-25

---

## 1. Problem statement

Inside a large organization, useful work is trapped inside department silos. An
engineer who wants to help a struggling team elsewhere has no discovery
mechanism, no structured way to ask their manager for time against it, and no
record afterward that it happened. Managers, in turn, have no visibility into
who on their team is being asked to lend time, or whether that time is even
available.

MBXchange is an internal marketplace that turns "can anyone help with X"
Slack messages into a structured, auditable flow: post a requirement, apply
against real declared bandwidth, get a manager decision with a computed
capacity check attached, and walk away with a durable record of the
contribution.

## 2. Goals

- Let any employee post cross-department work and have the right people find it.
- Replace "just ask your manager informally" with a capacity-aware approval
  step that shows the manager real numbers, not a blind yes/no.
- Make cross-team contribution visible and rewarded (tiers, milestones,
  recognition) instead of invisible unpaid extra work.
- Give managers and admins a single place to see approvals, registrations,
  and organization-wide skill supply/demand.
- Extend the same "people helping people" idea past formal work into a
  lightweight internal marketplace, carpool board, and interest communities
  (Beyond Work), since that traffic already exists informally at most
  companies and benefits from the same trust/identity layer.

## 3. Non-goals

- Not a full HRIS, org chart, or performance-review system — `manager_id` is
  the only reporting-line data it holds, and only what approvals need.
- Not a project-management / ticketing tool. A work post is a request for a
  person and a time commitment, not a tracked project with subtasks.
- Not a payments or expense system — `listings` in Beyond Work display a
  price but the platform does not process any transaction.
- The "AI" in "AI Review", "AI Skill Match", and "AI capacity check" is a
  deterministic, explainable rules engine (`server/rules.ts`), not a
  model-backed recommendation — see §7. This is a deliberate choice, not a
  placeholder for a future model integration.

## 4. Personas / roles

The system has exactly three roles, enforced server-side via
`users.system_role` (`employee | manager | admin`, `server/schema.sql:7`):

| Role | Can do everything an Employee can, plus |
|---|---|
| **Employee** | Post requirements, browse and apply to opportunities, offer spare bandwidth, message colleagues, build a skill profile, earn tiers/badges, buy/sell in Beyond Work, join carpools and communities. |
| **Manager** | Everything above, **plus** an Approvals queue for every application where they are the applicant's `manager_id` — each with a computed capacity verdict — and Message/Decline/Approve actions on each. |
| **Admin** | Everything above, **plus** the Admin Console: org-wide overview stats, full user directory (active + inactive), manager-registration requests, and a read-only audit log of every significant action in the system. |

A person's role is fixed at the account level, not per-screen — a manager
sees the Approvals tab in their own sidebar permanently, not only when they
have pending items.

## 5. Core user flow

This is the spine of the product; every other feature hangs off it. Verified
end-to-end against the running app (see the session's functional test):

1. **Post.** An employee opens *Post Requirement*, sets title, department,
   urgency, duration, expected effort range, seats, skill tags, and a
   description. `POST /work-posts` creates a row in `work_posts`
   (`server/schema.sql:39`).
2. **Discover.** The post appears in *Opportunities* for every employee,
   ranked by a computed match score (§7.2) against their declared skills and
   remaining bandwidth. Filterable by department, status, urgency, skill;
   searchable by title/tag/author.
3. **Apply.** An interested employee opens the post, sees *why it matches
   them* (skill overlap %, capacity fit %, cross-department flag), and clicks
   *Apply to help*. The dialog shows their own current remaining capacity and
   names the exact manager who will decide, resolved automatically from
   `users.manager_id`. `POST /work-posts/:id/apply` creates a row in
   `applications` with `status = 'pending'`.
3a. If the applicant declares an available `manager_id` that isn't yet a
    registered account, the flow degrades gracefully into a
    `registration_requests` row instead of leaving the application stuck —
    surfaced to admins as *Registration Needed* (§6.9).
4. **Decide.** The resolved manager sees the request in *Approvals*, with a
   computed verdict (`Approve` / `Review Capacity` / `Not Recommended`) and a
   plain-English reason string generated by `computeRecommendation()`
   (§7.1) — never a bare score. They can Message the applicant, Decline, or
   Approve (with an optional note) via a confirmation step.
   `POST /approvals/:id/decision`.
5. **Notify.** Approval fires two independent notifications: the applicant
   gets *Request Approved*, the original poster gets *Seat Confirmed* — both
   rows in `notifications`, both visible immediately in the bell dropdown
   and on `/api/sync`'s next poll.
6. **Record.** The decision is written to `audit_log` with actor, action,
   subject, and structured detail — visible to admins in the Audit Log tab,
   attributable to a specific person and timestamp, never anonymous.
7. **Close the loop.** Hours worked accrue to `bandwidth_ledger`, feed
   `users.hours_contributed` / `collaborations_count` /
   `departments_supported`, and are what `computeTier()` (§7.3) evaluates
   against — so a completed engagement visibly moves the needle on the
   helper's tier, milestones, and Home dashboard stats in the same session.

## 6. Feature requirements by area

Each area below is a real, routed view under `src/views/`.

### 6.1 Home Dashboard (`HomeDashboard.tsx`)
- Four headline stats: open opportunities, my pending requests, active
  engagements, approvals waiting on me (manager/admin only).
- Quick actions: post a requirement, offer bandwidth, find experts, view my
  requests.
- *Your tier* card: current tier, hours/engagement count, up to two earned
  badges, a progress bar toward the next tier with the exact shortfall
  (`nextTierProgress()`).
- *Exchange activity*: a 6-month hours-contributed chart, filterable by
  Everyone/Me and by Hours/Synergy/Engagements, with month-over-month delta.
- *Recommended for you*: opportunities ranked by `computeMatch()`, each
  showing its score, matched skills, and the same plain-English reason
  string used in the detail view — the recommendation logic is shared, not
  duplicated, between the list and the detail page.

### 6.2 Opportunities (`WorkExchange.tsx`)
- Two tabs: *Open Requirements* (posted work) and *Bandwidth Pool* (people
  who've proactively offered spare hours via `bandwidth_offers`).
- Filter bar: free-text search, department, status, urgency, skill, sort
  (best match / newest).
- Card and detail view both surface seats-remaining, approval requirement,
  skill tags, author, and a discussion thread (`work_comments`) scoped to
  the post.
- Interactive hover: cards use a cursor-tracked 3D tilt (`TiltCard.tsx`) with
  a glare sweep — deliberately constrained to `(hover: hover) and
  (pointer: fine)` devices and `prefers-reduced-motion`, and engineered so
  the tilt never blurs the card's own text regardless of the tilt angle
  (see `.tilt-active .panel` in `src/index.css`).

### 6.3 People & Skills (`PeopleView.tsx`)
- Searchable directory of every active colleague: department, tier,
  top-rated skill categories, badges, declared weekly/monthly bandwidth,
  and total gigs/hours contributed.
- *Request Collaboration* — a direct, informal ask to a specific person
  (`collab_requests`), separate from the formal work-post/approval chain,
  for a lighter-weight "can you help me for an hour" case.

### 6.4 My Requests (`MyRequests.tsx`)
- *Submitted by me*: every application the user has sent, its status, and
  the deciding manager.
- *Received*: collaboration requests sent to this person by colleagues,
  actionable inline (accept/decline).
- Doubles as the applicant-facing mirror of the manager's Approvals queue —
  the same `applications` row, viewed from the other side.

### 6.5 Achievements (`Achievements.tsx`)
- Current tier, hours given, departments reached, recognitions received.
- Milestone grid (`server/rules.ts` isn't the source here — milestones are a
  separate, explicit checklist rendered from `/api/milestones`) each with
  earned/in-progress state and a numeric progress bar.
- Tier ladder is fixed and earned, never assigned — see §7.3; a user cannot
  buy or be granted a tier.

### 6.6 Insights (`InsightsView.tsx`)
- Org-wide, not personal: total hours contributed, completed engagements,
  active contributors.
- *Upskilling opportunities*: capabilities where organizational demand
  outstrips available experts, computed from `capability_heatmap`.
- *Demand vs supply by capability*: paired bar comparison per skill.
- Exists to give admins and leads a data-driven answer to "what skill gap
  should we actually be hiring or training for," sourced from real request
  and applicant data rather than survey guesses.

### 6.7 Beyond Work (`BeyondWork.tsx`)
Three sub-tabs sharing one shell, all opt-in and unrelated to the approval
chain:
- **Marketplace** — colleague-to-colleague listings (`listings`): sell,
  free-giveaway, or event-ticket, with category/condition/price.
- **Carpool** — one-way trip offers (`carpool_trips`) with day-of-week
  recurrence, seats, women-only flag, and per-rider bookings
  (`carpool_bookings`).
- **Communities** — interest groups (`community_groups`) with posts and a
  lightweight Q&A (`questions` / `answers`, with accepted-answer and vote
  support) scoped per group.

### 6.8 Approvals (`ManagerInbox.tsx`) — manager & admin only
- One card per pending `applications` row where the signed-in user is
  `manager_id`, each with an inline **AI: Approve / Review Capacity / Not
  Recommended** panel (§7.1) computed fresh on every load, never cached
  stale advice.
- Message / Decline / Approve, each with a confirmation step and optional
  note; a *Decision history* section beneath the live queue for what's
  already been decided.

### 6.9 Admin Console (`AdminConsole.tsx`) — admin only
- **Overview**: active users, open requirements, pending approvals, approved
  engagements, active carpool trips, marketplace listings; requirements
  broken out by department.
- **Users**: full directory including inactive accounts
  (`?includeInactive=true`), with reset-password and activate/deactivate.
- **Registrations**: requests to onboard a manager who doesn't yet have an
  account, raised automatically when an employee applies under a manager
  MBXchange has never seen — closes a real gap where an application would
  otherwise have nowhere to route.
- **Audit Log**: every login, application, approval decision, and
  registration action, each attributed to an actor and timestamp, sourced
  directly from `audit_log` with no filtering or redaction for admins.

### 6.10 Cross-cutting
- **Global search** (`GlobalSearch.tsx`, ⌘K) across opportunities, people,
  and listings.
- **Messages** (`MessagesDrawer.tsx`) — direct messaging tied to a work post
  or collaboration context (`context_type`, `context_title`), not a general
  chat product.
- **Notifications** — typed, targeted either at a specific `recipient_id`
  or broadcast to a `recipient_role`, with per-user read/clear state for the
  broadcast case (`notification_clears`) so a role-wide announcement doesn't
  force everyone into the same read state.
- **Saved items** — bookmark any work post, listing, community, or carpool
  trip (`saved_items`).
- **Password change on first login** (`ForcePasswordChange.tsx`) — every
  seeded/admin-created account starts with `must_change_password = true`.

## 7. Key business logic

The three algorithms below are the actual product differentiators — the UI
around them is standard CRUD, but this logic is what makes an approval or a
recommendation trustworthy rather than arbitrary. All three live in
`server/rules.ts` and are unit-testable pure functions, deliberately kept
free of side effects.

### 7.1 Manager capacity check (`computeRecommendation`)
Deterministic, not probabilistic. Given the applicant's declared weekly/
monthly hours, hours already consumed this period, hours already committed
to other pending/approved applications, and the opportunity's effort range:

- No effort estimate on the post → **Review Capacity** (can't compute,
  say so explicitly rather than guessing).
- Remaining capacity ≤ 0 → **Not Recommended**.
- Remaining capacity covers the full upper estimate → **Approve**.
- Remaining capacity covers the minimum but not the upper estimate →
  **Review Capacity**, suggesting a reduced-scope commitment.
- Remaining capacity is below even the minimum → **Not Recommended**.

Every verdict returns a human-readable reason naming the exact numbers
involved (e.g. *"Rakesh Kumar has only 6h of declared capacity, below the
minimum 8h this task requires... Approving would exceed the employee's
available work hours."*) plus a separate skill-alignment note — verified
directly against the running app during functional testing.

### 7.2 Opportunity match score (`computeMatch`)
A 0–100 fit score shown on every opportunity card and detail page:
`score = skillFit × 0.65 + capacityFit × 0.35`, plus a capped +5 bonus for
crossing a department boundary (the behavior the whole platform exists to
encourage). Skill fit degrades gracefully to title-word overlap (capped at
60) when a post has no tags, rather than reporting a false 0% or 100%. The
reason string is generated from the same inputs the score used, so the
number is never unexplained.

### 7.3 Contribution tiers (`computeTier`, `TIERS`)
Five tiers — Contributor → Collaborator → Connector → Catalyst → Principal —
each gated on **all three** of hours contributed, engagement count, and
distinct departments supported (e.g. Catalyst needs 100h *and* 12 gigs *and*
3 departments; hours alone cannot buy a tier). `nextTierProgress()` reports
the exact shortfall on whichever threshold(s) are still unmet, which is what
powers the "16h more, 2 more engagements to reach Connector" copy on the
tier card.

## 8. Data model

18 tables in `server/schema.sql`, PostgreSQL-compatible and also runnable
against PGlite for a zero-install local dev database (`server/db.ts`). Core
entities:

- **`users`** — identity, role, department, declared skills/interests,
  bandwidth declaration (`available_hours_week`, `bandwidth_period`),
  `manager_id` (self-referencing FK — the only org-chart data the system
  keeps), tier/contribution stats, password hash.
- **`work_posts`** → **`applications`** (one row per person applying, unique
  per `(post_id, applicant_id)`) → **`work_comments`** (threaded discussion).
- **`registration_requests`** — the manager-not-yet-registered escape hatch
  described in §6.9.
- **`collab_requests`** — informal person-to-person asks, separate from the
  formal work-post pipeline.
- **`bandwidth_offers`**, **`bandwidth_ledger`** — declared spare time and
  the append-only ledger of hours drawn against it (kept as a ledger, not a
  running total, specifically so a completion can be reversed and a manager
  can see *where* capacity went, per the schema's own inline comment).
- **`listings`**, **`carpool_trips`** + **`carpool_bookings`**,
  **`community_groups`** + **`group_members`** + **`community_posts`**,
  **`questions`** + **`answers`** — the Beyond Work surface.
- **`messages`**, **`notifications`** + **`notification_clears`**,
  **`saved_items`** — cross-cutting communication and personalization.
- **`capability_heatmap`** — precomputed org-wide skill demand/supply, feeds
  Insights.
- **`audit_log`** — append-only, actor + action + subject + JSON detail.
- **`appreciations`** — post-hoc recognition (message + optional rating)
  written by a requirement's author or the helper's manager, shown on the
  helper's profile.

## 9. API surface

~60 REST endpoints under `/api` (`server/routes.ts`), grouped by resource:
`auth` (login, demo-accounts, change-password, impersonate/stop-impersonate
— the latter for admin support access), `users`, `work-posts` (+ `:id`,
`:id/apply`, `:id/comments`), `applications/:id` (+ `:id/withdraw`),
`approvals` (+ `:id/decision`), `admin/overview`,
`admin/registration-requests` (+ `:id/complete`, `:id/dismiss`),
`collab-requests`, `bandwidth-offers`, `listings`, `carpool/trips` (+
`:id/book`, `:id/cancel-booking`), `community` (groups, posts, questions,
answers, votes), `messages`, `notifications`, `saved`, `milestones`,
`appreciations`, `insights`, `telemetry`, and a `sync` endpoint the client
polls for near-real-time cross-tab state (§10).

## 10. Non-functional requirements

- **Auth**: JWT-based sessions, `bcryptjs` password hashing, forced password
  change on first login for provisioned accounts.
- **Authorization**: role checks (`employee | manager | admin`) enforced
  server-side in `routes.ts`, not just hidden in the UI — e.g. the
  Approvals list is filtered to applications where the requester actually is
  `manager_id`, and Admin Console routes require `system_role = 'admin'`.
- **Auditability**: every state-changing action of consequence (login,
  application, approval decision, registration) writes to `audit_log` —
  verified directly in this session: three different demo-account logins and
  one approval decision all appeared correctly, attributed and timestamped.
- **Near-real-time sync**: `/api/sync` polling keeps notification counts,
  approval queues, and dashboard stats current across role switches without
  a full page reload.
- **Responsive layout**: desktop sidebar collapses to a bottom tab bar under
  the mobile breakpoint; verified at both ends of that range during this
  session.
- **Accessibility / motion**: the `TiltCard` 3D hover effect explicitly
  checks `prefers-reduced-motion` and `(hover: hover) and (pointer: fine)`
  before enabling itself, rather than assuming every device wants it.
- **Theming**: light/dark mode toggle; Mercedes-Benz-derived visual language
  (`--primary` orange accent, the three-pointed star mark, `INTERNAL` badge)
  applied consistently across the login screen, shell header, and
  marketing/overview collateral (see the companion deck, §12).
- **Deployment**: single container serves both the built frontend and the
  API (`Dockerfile`, `docker-compose.yml`, `k8s/` manifests included), with
  a documented path for both local development (this doc's companion
  README) and automated agent-driven deployment.

## 11. Success metrics (as designed for, not yet measured in production)

- **Time-to-fill**: median time from a work post going live to its seats
  being filled.
- **Approval latency**: median time from application to manager decision.
- **Cross-department rate**: share of approved applications where
  `crossDepartment = true` — the platform's core value proposition is
  people working *outside* their own department.
- **Repeat contribution**: share of employees with more than one approved
  engagement in a rolling 90 days — a proxy for whether the tier/recognition
  loop is actually motivating return use rather than one-off participation.
- **Capacity-check override rate**: how often managers approve against a
  *Not Recommended* verdict — a high rate would suggest the capacity model
  needs recalibration rather than being ignored outright.

## 12. Related artifacts

- `README.md` — setup and deployment instructions (human-facing local setup
  plus an automated-agent deployment section).
- `docs/MBXchange_Overview.pptx` — a 2-slide, Mercedes-Benz-styled overview
  deck built from this same product, covering the same core flow and
  platform surface described in §5–§6.

## 13. Open questions / explicitly out of scope for now

- No automated test suite exists yet (`npm run lint` type-checks only); the
  functional verification behind this PRD's claims was a manual, scripted
  end-to-end pass across employee/manager/admin roles, not a CI-enforced
  regression suite.
- The recommendation engine is intentionally rule-based and explainable
  (§7.1); whether a learned model should ever augment or replace it is an
  open product question, not a committed roadmap item.
- No real-time push (websockets) — `sync` is poll-based. Acceptable at
  current scale; worth revisiting if approval latency becomes
  notification-latency-bound.
- Payments/checkout for Beyond Work marketplace listings is explicitly out
  of scope (§3) — listings are discovery only, transactions happen off
  -platform.
