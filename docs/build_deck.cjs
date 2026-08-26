const pptxgen = require('pptxgenjs');

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';           // 13.3 x 7.5
pres.author = 'MBXchange';
pres.title = 'MBXchange Overview';

// ── Palette lifted straight from the running app's design tokens ──────────
const INK      = '16202C';   // --ink
const INK2     = '48545F';   // --ink-2
const INK3     = '6B7684';   // --ink-3
const PAGE     = 'F3F5F9';   // --page
const WHITE    = 'FFFFFF';
const PRIMARY  = '1565C0';   // --primary
const PRIM_SFT = 'E4EDF8';   // --primary-soft flattened onto white
const GREEN    = '10715A';
const AMBER    = '8A5A0C';
const TEAL     = '0E6D8C';
const VIOLET   = '5B4BC4';
const LINE     = 'D5DBE4';
const ON_DARK  = 'C9D8EA';   // readable secondary on the dark ground
const HEAD     = 'Calibri';
const BODY     = 'Calibri';

const M = 0.65;              // page margin
const W = 13.33;

/** Card shadow — a fresh object every call; pptxgenjs mutates these in place. */
const shadow = () => ({ type: 'outer', color: '16202C', blur: 10, offset: 2, angle: 90, opacity: 0.10 });

/** Icon/number disc plus its label row, all sharing one vertical centre. */
function discRow(slide, { x, y, w, disc, discColor, discText, title, body, titleColor }) {
  const D = 0.46;
  slide.addShape(pres.ShapeType.ellipse, {
    x, y, w: D, h: D, fill: { color: discColor }, line: { color: discColor }
  });
  slide.addText(discText, {
    x, y, w: D, h: D, align: 'center', valign: 'middle', margin: 0,
    fontFace: HEAD, fontSize: 13, bold: true, color: disc === 'light' ? INK : WHITE,
    isTextBox: true
  });
  slide.addText(title, {
    x: x + D + 0.22, y: y - 0.03, w: w - D - 0.22, h: 0.3, margin: 0,
    fontFace: HEAD, fontSize: 15, bold: true, color: titleColor || INK, isTextBox: true
  });
  slide.addText(body, {
    x: x + D + 0.22, y: y + 0.28, w: w - D - 0.22, h: 0.62, margin: 0,
    fontFace: BODY, fontSize: 12, color: titleColor ? ON_DARK : INK2,
    lineSpacingMultiple: 1.15, isTextBox: true
  });
}

/* ════════════════════════ 1 · Introduction ════════════════════════ */
{
  const s = pres.addSlide();
  s.background = { color: INK };

  s.addText('INTERNAL PLATFORM  ·  MERCEDES-BENZ R&D INDIA', {
    x: M, y: 0.62, w: 8, h: 0.28, margin: 0,
    fontFace: BODY, fontSize: 11, bold: true, charSpacing: 1.6, color: '7E93AC', isTextBox: true
  });

  s.addText([
    { text: 'MB', options: { color: WHITE } },
    { text: 'X', options: { color: '5AA2F0' } },
    { text: 'change', options: { color: WHITE } }
  ], {
    x: M, y: 1.02, w: 8, h: 0.95, margin: 0,
    fontFace: HEAD, fontSize: 48, bold: true, isTextBox: true
  });

  s.addText('Projects beyond your day-to-day work.', {
    x: M, y: 2.02, w: 7.6, h: 0.5, margin: 0,
    fontFace: HEAD, fontSize: 23, color: '9FC5EC', isTextBox: true
  });

  s.addText(
    'One internal place where a team can post work it needs help with, and any '
    + 'employee can lend the hours and skills they actually have — with every '
    + 'request routed through the right approvals and recorded as a track record.',
    {
      x: M, y: 2.62, w: 7.5, h: 1.1, margin: 0,
      fontFace: BODY, fontSize: 14.5, color: ON_DARK, lineSpacingMultiple: 1.3, isTextBox: true
    }
  );

  // Three value props, evenly spaced, on their own tinted panels
  const props = [
    ['1', 'Ask across teams', 'Post a requirement with the effort and skills it needs.', PRIMARY],
    ['2', 'Match on real capacity', 'Fit is scored on declared skills and hours actually free.', TEAL],
    ['3', 'Recognise the work', 'Completed hours become badges, tiers and a visible score.', AMBER]
  ];
  const cw = (W - M * 2 - 0.5) / 3;
  props.forEach(([n, title, body, color], i) => {
    const x = M + i * (cw + 0.25);
    s.addShape(pres.ShapeType.roundRect, {
      x, y: 4.28, w: cw, h: 1.72, rectRadius: 0.1,
      fill: { color: '1E2C3C' }, line: { color: '2C3D50' }
    });
    discRow(s, {
      x: x + 0.28, y: 4.6, w: cw - 0.56,
      disc: 'dark', discColor: color, discText: n,
      title, body, titleColor: WHITE
    });
  });

  s.addText('Connect  ·  Collaborate  ·  Contribute', {
    x: M, y: 6.5, w: 6, h: 0.3, margin: 0,
    fontFace: BODY, fontSize: 11.5, color: '6B819B', charSpacing: 0.8, isTextBox: true
  });

  s.addNotes('One-line framing: MBXchange turns spare capacity and cross-team '
    + 'requests into a managed, visible process. Everything else follows from that.');
}

/* ════════════════════════ 2 · Impact ════════════════════════ */
{
  const s = pres.addSlide();
  s.background = { color: PAGE };

  s.addText('What this changes for the organisation', {
    x: M, y: 0.6, w: 11, h: 0.62, margin: 0,
    fontFace: HEAD, fontSize: 34, bold: true, color: INK, isTextBox: true
  });
  s.addText('Four shifts, all of them measurable from day one.', {
    x: M, y: 1.22, w: 11, h: 0.34, margin: 0,
    fontFace: BODY, fontSize: 14.5, color: INK2, isTextBox: true
  });

  const impacts = [
    [PRIMARY, 'Idle capacity becomes visible',
      'Spare hours are declared, not guessed at. Work goes to people who genuinely have room for it.'],
    [TEAL, 'Cross-team help stops being informal',
      'Favours asked over chat become tracked requests with an owner, an effort estimate and an outcome.'],
    [GREEN, 'Capacity decisions carry evidence',
      'A manager approves against declared hours and a capacity check, not against a feeling about workload.'],
    [VIOLET, 'Skill growth becomes measurable',
      'Gaps surface from real demand, and the sessions and badges that close them are recorded per person.']
  ];

  const cardW = (W - M * 2 - 0.4) / 2;
  const cardH = 1.95;
  impacts.forEach(([color, title, body], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = M + col * (cardW + 0.4);
    const y = 1.86 + row * (cardH + 0.34);
    s.addShape(pres.ShapeType.roundRect, {
      x, y, w: cardW, h: cardH, rectRadius: 0.09,
      fill: { color: WHITE }, line: { color: LINE }, shadow: shadow()
    });
    s.addShape(pres.ShapeType.ellipse, {
      x: x + 0.34, y: y + 0.34, w: 0.34, h: 0.34,
      fill: { color }, line: { color }
    });
    s.addText(title, {
      x: x + 0.86, y: y + 0.3, w: cardW - 1.2, h: 0.42, margin: 0,
      fontFace: HEAD, fontSize: 17, bold: true, color: INK, isTextBox: true
    });
    s.addText(body, {
      x: x + 0.34, y: y + 0.92, w: cardW - 0.68, h: 0.86, margin: 0,
      fontFace: BODY, fontSize: 13, color: INK2, lineSpacingMultiple: 1.25, isTextBox: true
    });
  });

  s.addText('The common thread: work that already happens informally becomes '
    + 'visible, approved and credited.', {
    x: M, y: 6.42, w: 11.4, h: 0.36, margin: 0,
    fontFace: BODY, fontSize: 13, italic: true, color: INK3, isTextBox: true
  });

  s.addNotes('Lead with capacity visibility — it is the one leadership already '
    + 'feels the absence of. The other three follow from it.');
}

/* ════════════════════════ 3 · Features & workflow ════════════════════════ */
{
  const s = pres.addSlide();
  s.background = { color: PAGE };

  s.addText('How it works, and what is inside', {
    x: M, y: 0.6, w: 11, h: 0.62, margin: 0,
    fontFace: HEAD, fontSize: 34, bold: true, color: INK, isTextBox: true
  });
  s.addText('A request moves left to right; the platform carries it the whole way.', {
    x: M, y: 1.22, w: 11, h: 0.34, margin: 0,
    fontFace: BODY, fontSize: 14.5, color: INK2, isTextBox: true
  });

  // ── The four-step spine ──
  const steps = [
    ['Post', 'Effort, skills, seats'],
    ['Apply', 'Fit scored on capacity'],
    ['Approve', 'Author, then manager'],
    ['Recognise', 'Badges, tier, score']
  ];
  const sw = (W - M * 2 - 0.66) / 4;
  steps.forEach(([label, sub], i) => {
    const x = M + i * (sw + 0.22);
    s.addShape(pres.ShapeType.roundRect, {
      x, y: 1.78, w: sw, h: 1.12, rectRadius: 0.09,
      fill: { color: i === 3 ? PRIM_SFT : WHITE }, line: { color: i === 3 ? PRIMARY : LINE },
      shadow: shadow()
    });
    s.addText(String(i + 1), {
      x: x + 0.26, y: 1.96, w: 0.3, h: 0.3, margin: 0, align: 'left', valign: 'middle',
      fontFace: HEAD, fontSize: 12, bold: true, color: PRIMARY, isTextBox: true
    });
    s.addText(label, {
      x: x + 0.26, y: 2.16, w: sw - 0.52, h: 0.32, margin: 0,
      fontFace: HEAD, fontSize: 17, bold: true, color: INK, isTextBox: true
    });
    s.addText(sub, {
      x: x + 0.26, y: 2.48, w: sw - 0.52, h: 0.3, margin: 0,
      fontFace: BODY, fontSize: 11.5, color: INK3, isTextBox: true
    });
    if (i < 3) {
      s.addShape(pres.ShapeType.rightArrow, {
        x: x + sw + 0.045, y: 2.26, w: 0.13, h: 0.14,
        fill: { color: 'A9B3C1' }, line: { color: 'A9B3C1' }
      });
    }
  });

  // ── The surfaces that carry it ──
  s.addText('WHERE IT LIVES IN THE PRODUCT', {
    x: M, y: 3.24, w: 8, h: 0.28, margin: 0,
    fontFace: BODY, fontSize: 11, bold: true, charSpacing: 1.4, color: INK3, isTextBox: true
  });

  const features = [
    [PRIMARY, 'Opportunities', 'Open requirements, ranked by fit'],
    [TEAL, 'People & Skills', 'Directory, and direct collaboration requests'],
    [GREEN, 'Approvals', 'Two-stage sign-off with a capacity check'],
    [AMBER, 'Learning', 'Colleague-run sessions, with sign-up'],
    [VIOLET, 'Insights', 'Skill gaps, leaderboard, manager reports'],
    ['0E6D8C', 'Achievements', 'Badges, tiers and the contribution score']
  ];
  const fw = (W - M * 2 - 0.5) / 3;
  features.forEach(([color, title, body], i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = M + col * (fw + 0.25);
    const y = 3.66 + row * 1.44;
    s.addShape(pres.ShapeType.roundRect, {
      x, y, w: fw, h: 1.24, rectRadius: 0.09,
      fill: { color: WHITE }, line: { color: LINE }, shadow: shadow()
    });
    s.addShape(pres.ShapeType.ellipse, {
      x: x + 0.28, y: y + 0.3, w: 0.28, h: 0.28,
      fill: { color }, line: { color }
    });
    s.addText(title, {
      x: x + 0.7, y: y + 0.27, w: fw - 0.98, h: 0.34, margin: 0,
      fontFace: HEAD, fontSize: 15, bold: true, color: INK, isTextBox: true
    });
    s.addText(body, {
      x: x + 0.28, y: y + 0.72, w: fw - 0.56, h: 0.42, margin: 0,
      fontFace: BODY, fontSize: 11.5, color: INK2, lineSpacingMultiple: 1.15, isTextBox: true
    });
  });

  s.addNotes('Walk the spine first, then point at each surface. Do not read the '
    + 'cards out — they are signposts for the live demo.');
}

/* ════════════════════════ 4 · Questions we expect ════════════════════════ */
{
  const s = pres.addSlide();
  s.background = { color: INK };

  s.addText('Questions we expect', {
    x: M, y: 0.66, w: 11, h: 0.66, margin: 0,
    fontFace: HEAD, fontSize: 34, bold: true, color: WHITE, isTextBox: true
  });
  s.addText('Raised here deliberately — we will take these live.', {
    x: M, y: 1.3, w: 11, h: 0.34, margin: 0,
    fontFace: BODY, fontSize: 14.5, color: '9FC5EC', isTextBox: true
  });

  const questions = [
    'How is this different from asking someone on Teams — and what stops it becoming another tool nobody opens after month two?',
    'If an engineer gives eight hours to another department, whose budget absorbed that, and how do we stop capacity leaking away from the committed roadmap?',
    'The capacity check and fit score are rule-based, not learned. When a manager disagrees with the recommendation, who owns the consequences of that approval?',
    'What does adoption look like in the first 90 days, and what specifically would tell us this has failed?'
  ];

  const qh = 1.02;
  questions.forEach((qtext, i) => {
    const y = 1.96 + i * (qh + 0.22);
    s.addShape(pres.ShapeType.roundRect, {
      x: M, y, w: W - M * 2, h: qh, rectRadius: 0.08,
      fill: { color: '1E2C3C' }, line: { color: '2C3D50' }
    });
    s.addShape(pres.ShapeType.ellipse, {
      x: M + 0.32, y: y + 0.31, w: 0.4, h: 0.4,
      fill: { color: PRIMARY }, line: { color: PRIMARY }
    });
    s.addText(`Q${i + 1}`, {
      x: M + 0.32, y: y + 0.31, w: 0.4, h: 0.4, margin: 0,
      align: 'center', valign: 'middle',
      fontFace: HEAD, fontSize: 11, bold: true, color: WHITE, isTextBox: true
    });
    s.addText(qtext, {
      x: M + 0.94, y: y + 0.2, w: W - M * 2 - 1.3, h: 0.64, margin: 0, valign: 'middle',
      fontFace: BODY, fontSize: 13.5, color: 'DCE7F3', lineSpacingMultiple: 1.2, isTextBox: true
    });
  });

  s.addNotes('Answer live. Q2 (budget/capacity leakage) and Q4 (definition of '
    + 'failure) are the two that decide the room.');
}

pres.writeFile({ fileName: process.argv[2] })
  .then((f) => console.log('wrote', f));
