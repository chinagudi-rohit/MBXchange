# MBXchange — Design Audit

Measured against the running build on 2026-08-26 (blue palette, Outfit type,
1627 px content width at the tested viewport). Every value below was read off
the live DOM, not estimated.

---

## 1. Eye path, per tab

Format: **1st / 2nd / 3rd** = where the eye actually lands today.
**Should be** = the one thing the tab exists to make you do.
**Unearned attention** = elements pulling weight they have not justified.

### Login
- **1st** "Projects beyond your day-to-day work." — 40 px/700 on black, half the screen.
- **2nd** The blue Sign In button.
- **3rd** The email field.
- **Should be**: email field → password → Sign In. The marketing panel is
  decoration on an internal tool where every user already knows what the
  product is.
- **Unearned**: the three bullet points ("Post a requirement…") repeat the
  headline in smaller type; the black panel occupies 55 % of the viewport to
  say something a returning employee reads once, ever.

### Home
- **1st** "Welcome back, Vikram" — 28 px/700, top-left, highest contrast on the page.
- **2nd** The four stat tiles (`15 / 0 / 0 / 5`) — 28 px numerals in a row.
- **3rd** The contribution score ring.
- **Should be**: score → approvals waiting on me → recommended opportunities.
  The greeting is the largest text on the page and carries zero information.
- **Unearned**: the greeting (28 px for a name); "OPEN OPPORTUNITIES 15",
  which is an org-wide constant, not a personal signal, yet sits in the same
  visual class as "APPROVALS WAITING ON ME 5", which is an action; the
  "Your tier" card, which now restates the tier already printed inside the
  score ring 200 px to its left.

### Opportunities
- **1st** The sticky filter bar — four controls in a raised white panel.
- **2nd** Card titles (16 px/600).
- **3rd** The coloured fit chips ("High fit" / "Medium fit").
- **Should be**: fit chip → title → effort. Fit is the whole reason the feed
  is ranked, and it is currently the third thing seen and the smallest.
- **Unearned**: four filter dropdowns of equal weight when department and
  skill do almost all the work; the `PT-THIF` department chip repeated on
  every card in a single-department org; the metadata strip
  (EFFORT / DURATION / LOCATION / APPROVAL) — four labelled columns in 12 px
  caps for what is really one line of facts.

### People & Skills
- **1st** The search field.
- **2nd** Avatar circles down the left edge.
- **3rd** Names.
- **Should be**: name → skills → availability. The avatars are initials on
  flat fill; they carry no identity, and they currently out-rank the names
  next to them.
- **Unearned**: avatars at 40 px for two letters; the score chip, which sits
  at the same size and colour weight as the availability figure that actually
  determines whether you can ask this person for anything.

### My Requests
- **1st** The tab toggle ("Submitted by me / Received").
- **2nd** Section headings ("Work applications (4)").
- **3rd** Status badges.
- **Should be**: status → what it is → who is blocking it. Status is the only
  question this page answers and it is third.
- **Unearned**: the two-tab toggle rendered as a full segmented control for a
  binary that most users never switch; "Collaboration requests sent (0)" —
  empty sections occupying a heading each.

### Achievements
- **1st** "Collaborator" tier name — 28 px/700.
- **2nd** The tier crystal (3D, animated).
- **3rd** The stat tiles.
- **Should be**: tier → distance to next tier → what to do next. The
  milestone progress bars, which are the actionable part, are below the fold.
- **Unearned**: the 3D crystal — the single most visually expensive element
  in the app, encoding one fact (which tier) that is written in words beside
  it; five stat tiles in a row where three are near-duplicates
  (engagements / departments / badges).

### Insights
- **1st** The four org headline numbers (28 px).
- **2nd** The 3D skill globe.
- **3rd** The leaderboard.
- **Should be**: my rank → my gaps → org gaps. This tab opens with
  organisation-level statistics that no individual can act on.
- **Unearned**: the skill globe — heavy WebGL for a dataset the table below
  renders better; "1292h contributed" and "313 engagements", which are
  vanity totals; the leaderboard metric `<select>` styled identically to the
  scope chips beside it, so two different control types compete.

### Learning
- **1st** Date chips (blue, top-left of every card).
- **2nd** Session titles.
- **3rd** The Sign Up buttons.
- **Should be**: title → what it teaches → date. Somebody scanning for a
  topic is forced through the calendar first.
- **Unearned**: the date chip in `primary-soft` — the same colour as the
  primary action, on every card, so twelve dates compete with twelve buttons;
  the level and format chips repeated on all cards regardless of variance.

### Beyond Work
- **1st** The section toggle (Carpool / Communities).
- **2nd** The direction toggle (All trips / Morning / Evening).
- **3rd** The scope chips (All rides / Electric only / Women-only / …).
- **Should be**: a ride that fits me. Three stacked rows of filters run
  before a single piece of content — this is the worst offender in the app.
- **Unearned**: three separate filter systems in sequence, each styled
  differently (panel toggle, panel toggle, soft chips); the EV leaf badge,
  which is decorative on most cards.

### Approvals
- **1st** Section heading ("Awaiting your approval as manager (5)").
- **2nd** Applicant names.
- **3rd** The Approve button.
- **Should be**: the AI capacity verdict → the person → the decision. The
  capacity bar is the reason this screen exists and it sits mid-card in
  10 px bars.
- **Unearned**: the "Requirement author's decision" / "Manager's decision"
  chip, present on every card in a section where they are all the same
  stage.

### Admin Console
- **1st** The stat grid.
- **2nd** Section headings.
- **3rd** The audit tail.
- **Should be**: pending registrations → everything else. The one thing an
  admin must act on is buried under counts.
- **Unearned**: seven equally-weighted stat tiles, only one of which
  (awaiting registration) is ever actionable.

**The pattern across all ten**: filters and headings are styled louder than
content; every stat tile gets identical weight regardless of whether it is
actionable; and decorative 3D appears on the two tabs (Achievements,
Insights) that most need clear data.

---

## 2. Typography

**Family**: Outfit 400/500/600/700/800 for everything — a single geometric
sans doing display, UI and data.

**Measured scale in use** (size / line-height / weight):

| Rendered | Count | Role |
|---|---|---|
| 12 / 20 / 500 | 27 | body, labels |
| 12 / 20 / 600 | 24 | chips, emphasis |
| 12 / 20 / 400 | 15 | secondary text |
| 12 / 19.5 / 400 | 8 | inherited body |
| 16 / 22 / 600 | 7 | card titles |
| 28 / 28 / 700 / −0.7 | 5 | page titles, stat numerals |
| 20 / 20 / 700 / −0.5 | 4 | section display |
| 14 / 22 / 600 | 3 | subheads |

### Findings

1. **The scale is collapsed at the bottom.** 74 of 100 sampled text nodes are
   12 px. Body, captions, chips, table cells, hints and metadata all render at
   the same size, separated only by weight (400/500/600) and colour. Weight
   and colour are weak hierarchy signals compared to size; the result is a
   page of undifferentiated grey text. **Fix: move body to 14 px/22, keep
   12 px/16 strictly for captions and chip text.** That single change
   restores a real step between "content" and "label".

2. **The jump from 16 to 28 is a hole.** Card titles are 16 px, page titles
   28 px, and 20 px appears only four times. There is no intermediate size
   for section headings, so `h2` runs at 14 px/600 — smaller than the body
   text it introduces. **Fix: section headings at 18 px/24/600; card titles
   at 17 px/24/600; page titles at 30 px/34/700.**

3. **Line-height is too tight for the 12 px tier and too loose for display.**
   12/20 is a 1.67 ratio — generous for a caption — while 28/28 is 1.0, which
   makes two-line page titles collide. **Fix: 28→30 px with 36 px leading
   (1.2); 12 px captions to 16 px leading (1.33).**

4. **Letter-spacing is applied inconsistently.** −0.7 px at 28 px and −0.5 px
   at 20 px is correct optical compensation, but the 12 px uppercase labels
   carry only +0.3 px where uppercase at that size needs **+0.6 to +0.8 px**
   to stop the caps jamming together.

5. **Numerals are not tabular everywhere.** The stat tiles use `tabular-nums`,
   the leaderboard and report table do not consistently, so columns of figures
   shift by 1–2 px per row. **Fix: `font-variant-numeric: tabular-nums` on
   every numeric cell.**

6. **One family is doing too much.** Outfit is a geometric display face; at
   12 px its wide round forms and short x-height make dense UI text harder to
   read than a UI-optimised face. **Fix: keep Outfit for ≥20 px display only;
   set body/UI in Inter (or system UI stack) at 14 px.** This is the single
   highest-leverage typography change and costs nothing but a font swap.

---

## 3. White space

**Measured**: `main` padding 40 px top / 48 px sides; section rhythm
`space-y-14` = 56 px; card padding 20 px (`p-5`); card radius 12–16 px; grid
gaps 10–14 px.

### Findings

- **Macro (sections): correct.** 56 px between sections is a confident,
  premium interval. Leave it.
- **Macro (page): wrong.** `max-width: none` on the content column. At the
  tested 1627 px the grid stretches edge to edge, description lines run past
  100 characters, and four-column rows spread until the relationship between
  cards dissolves. **Fix: `max-width: 1280px; margin-inline: auto`.** This is
  the single biggest "cheap vs expensive" tell on the whole page — nothing
  else on this list changes the impression as much.
- **Component: too tight.** 20 px card padding against 12–14 px grid gaps
  means the space *inside* a card is barely larger than the space *between*
  cards, so the cards do not read as discrete objects. **Fix: card padding to
  24 px, grid gap to 20 px.** The ratio matters more than either number.
- **More padding would feel premium here, not less.** The content is dense
  (chips, metadata rows, avatars); density plus tight padding reads as
  "admin tool". The exception is the metadata strip inside opportunity cards,
  where **less** is right — it currently uses 4 labelled columns where one
  line of `6–8 h · 2 days · Hybrid` would do.
- **Vertical rhythm inside cards is unmanaged.** Gaps of 6, 8, 10, 12 and
  14 px all appear within a single card. **Fix: pick 8 / 16 / 24 and use
  nothing else.**

---

## 4. Colour

### Every colour in use

| Token | Value | Role |
|---|---|---|
| `--page` | `#f3f5f9` | page ground |
| `--surface-solid` | `rgba(255,255,255,.97)` | cards |
| `--surface-2` | `rgba(21,101,192,.06)` | inset fills |
| `--line` | `#d5dbe4` | hairlines |
| `--line-strong` | `#a9b3c1` | input borders |
| `--ink` | `#16202c` | primary text |
| `--ink-2` | `#48545f` | secondary text |
| `--ink-3` | `#6b7684` | tertiary text |
| `--primary` | `#1565c0` | brand fill |
| `--primary-strong` | `#0f4f9e` | hover |
| `--primary-text` | `#12569f` | brand text |
| `--primary-soft` | `rgba(21,101,192,.12)` | soft fill |
| `--accent-green` | `#10715a` | success |
| `--accent-amber` | `#8a5a0c` | warning |
| `--accent-red` | `#b3261e` | danger |
| `--accent-blue` | `#0e6d8c` | info |
| `--accent-violet` | `#5b4bc4` | cross-dept |

### Structure

- **Dominant**: near-white (`#fff` cards on `#f3f5f9`) — roughly 85 % of pixels.
- **Secondary**: the ink ramp, three greys.
- **Accent**: `#1565c0`, plus **five** semantic accents.

**The problem is accent count.** Six hues (blue, teal, green, amber, red,
violet) all appear at similar saturation and similar area — chips, badges,
icon tiles. On a single Opportunities card it is normal to see blue, amber,
green and violet simultaneously. A palette reads as expensive when it is
*restrained*; this one currently reads as a status-colour system with no
hierarchy between "brand" and "state". **Fix: demote violet and teal to text-
only usage (no filled chips), and reserve filled colour for exactly two
things — the primary action and a genuine alert.**

### Emotional signal

Correct for the brief. Cool blue on near-white is institutional, calm,
credible — right for an internal Mercedes-Benz platform, and a clear
improvement on the previous terracotta, which read consumer-warm. It is
currently *safe* rather than *distinctive*: there is no signature colour
moment anywhere, nothing a viewer would recognise as "the MBXchange blue"
after closing the tab.

### WCAG (measured contrast ratios)

| Pair | Ratio | Verdict |
|---|---|---|
| ink on card | 16.44 | AAA |
| ink-2 on card | 7.75 | AAA |
| ink-3 on card | 4.62 | AA (normal text) |
| ink-3 on page | 4.23 | **fails AA for normal text** |
| primary-text on card | 7.35 | AAA |
| white on primary | 5.75 | AA |
| green / amber / red / blue / violet on card | 5.86 – 6.54 | AA |
| line vs card | 1.39 | **fails 3:1 non-text** |
| line-strong vs card | 2.12 | **fails 3:1 non-text** |

Three real failures:
1. `--ink-3` on the page ground is **4.23:1** — under the 4.5 minimum. It is
   used for hints and metadata directly on `--page`. **Fix: darken to
   `#5d6874` (≈5.1:1).**
2. `--line` at **1.39:1** is invisible as a boundary. Acceptable for purely
   decorative dividers, not for the card edges and table rules it is used on.
   **Fix: `#c2cad6` (≈1.9) for decorative, and use `line-strong` wherever a
   border carries meaning.**
3. `--line-strong` at **2.12:1** is used on input borders, which are UI
   components requiring 3:1. **Fix: `#8c98a8` (≈3.1:1).**

### Sophistication

Mid. The tokens are well-organised and the ramp is coherent, but: pure white
cards on a cool grey is the most common SaaS combination in existence; there
is no tint relationship between the accents (they are picked per-hue, not
generated from a shared chroma); and the shadow is a generic
`0 2px 16px rgba(18,32,51,.10)` with a white inner line — the default
"card" recipe. Nothing here is wrong; nothing is memorable.

---

## 5. Three reasons it looks underdeveloped

1. **Everything is the same size.** 74 % of text is 12 px and every stat tile,
   chip and card carries equal visual weight. A design looks considered when
   something is clearly the most important thing on the screen; on nine of ten
   tabs here, nothing is.

2. **Full-bleed content at 1627 px.** No max-width means the layout has no
   composition — it is a grid stretched to whatever monitor it lands on, with
   100+ character line lengths. Every expensive-looking product constrains its
   measure.

3. **Decoration where data belongs.** A WebGL crystal to say "Collaborator"
   and a WebGL globe to say "these skills are scarce", while the actionable
   parts of both tabs (milestone progress, skill gaps) sit below the fold in
   12 px grey. Effort is visibly spent in the wrong place, which reads as
   inexperience rather than polish.

---

## 6. Three changes for 10× the perceived value

**1. Constrain and re-proportion the page.** `max-width: 1280px` centred;
card padding 20→24 px; grid gap 12→20 px; card radius unified at 16 px.
*Impact: highest. Costs ~10 lines of CSS and changes the impression of every
single screen.*

**2. Rebuild the type scale on two families.** Outfit for ≥20 px display only;
Inter for UI. Sizes: 30/36/700 page title, 18/24/600 section, 17/24/600 card
title, 14/22/400 body, 12/16/500 caption. Uppercase labels to +0.6 px
tracking. *Impact: high. This is what separates "internal tool" from
"product" more than colour ever will.*

**3. Spend the colour in one place and strip it everywhere else.** One filled
blue per screen — the primary action. Every other chip becomes text +
hairline on transparent. Delete the 3D crystal and globe; replace with the
data they were decorating. *Impact: high, and it makes change 1 and 2 legible
by removing what currently competes with them.*
