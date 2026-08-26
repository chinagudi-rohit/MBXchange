const pptxgen = require('pptxgenjs');

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';           // 13.3 x 7.5
pres.author = 'MBXchange';
pres.title = 'MBXchange Overview';

// ── Palette lifted straight from the running app's design tokens ──────────
const INK      = '1B2736';   // --ink
const INK2     = '4D5A66';   // --ink-2
const INK3     = '626D7A';   // --ink-3
const PAGE     = 'F7F8FB';   // --page
const WHITE    = 'FFFFFF';
const PRIMARY  = '176DD0';   // --primary
const PRIM_SFT = 'E7EFFA';   // --primary-soft flattened onto white
const GREEN    = '128166';
const AMBER    = '9A650D';
const TEAL     = '107A9C';
const VIOLET   = '6758C8';
const LINE     = 'CBD2DC';
const ON_DARK  = 'CCDAEB';   // readable secondary on the dark ground
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

  s.addText('INTERNAL PLATFORM  ·  MERCEDES-BENZ', {
    x: M, y: 0.62, w: 8, h: 0.28, margin: 0,
    fontFace: BODY, fontSize: 11, bold: true, charSpacing: 1.6, color: '8A9DB4', isTextBox: true
  });

  s.addText([
    { text: 'MB', options: { color: WHITE } },
    { text: 'X', options: { color: '69AAF2' } },
    { text: 'change', options: { color: WHITE } }
  ], {
    x: M, y: 1.02, w: 8, h: 0.95, margin: 0,
    fontFace: HEAD, fontSize: 48, bold: true, isTextBox: true
  });

  s.addText('Projects beyond your day-to-day work.', {
    x: M, y: 2.02, w: 7.6, h: 0.5, margin: 0,
    fontFace: HEAD, fontSize: 23, color: 'A8CAEE', isTextBox: true
  });

  s.addText(
    'One internal place where any team can post work it needs help with, and '
    + 'colleagues anywhere in the organisation can offer the bandwidth and skills '
    + 'they want to bring to it — routed through the right approvals, and open '
    + 'across departments and MB units rather than stopping at a team boundary.',
    {
      x: M, y: 2.62, w: 7.5, h: 1.1, margin: 0,
      fontFace: BODY, fontSize: 14.5, color: ON_DARK, lineSpacingMultiple: 1.3, isTextBox: true
    }
  );

  // Three value props, evenly spaced, on their own tinted panels
  const props = [
    ['1', 'Ask beyond your team', 'Post what you need, with the skills and total effort it takes.', PRIMARY],
    ['2', 'Match on offered bandwidth', 'Fit is scored on declared skills and the hours people choose to offer.', TEAL],
    ['3', 'Learn where demand is', 'Skill gaps surface from real requests, with sessions to close them.', AMBER]
  ];
  const cw = (W - M * 2 - 0.5) / 3;
  props.forEach(([n, title, body, color], i) => {
    const x = M + i * (cw + 0.25);
    s.addShape(pres.ShapeType.roundRect, {
      x, y: 4.28, w: cw, h: 1.72, rectRadius: 0.1,
      fill: { color: '23323F' }, line: { color: '31414F' }
    });
    discRow(s, {
      x: x + 0.28, y: 4.6, w: cw - 0.56,
      disc: 'dark', discColor: color, discText: n,
      title, body, titleColor: WHITE
    });
  });

  s.addText('Connect  ·  Collaborate  ·  Contribute', {
    x: M, y: 6.5, w: 6, h: 0.3, margin: 0,
    fontFace: BODY, fontSize: 11.5, color: '76899F', charSpacing: 0.8, isTextBox: true
  });

  s.addNotes('One-line framing: MBXchange makes willing bandwidth and cross-team '
    + 'requests findable across the whole organisation. Say "bandwidth people '
    + 'choose to offer", never "spare capacity" — this is not a utilisation tool.');
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
    [PRIMARY, 'Willing bandwidth becomes findable',
      'People say what they want to contribute and where. That offer is visible to any team that needs it, instead of being invisible outside their own.'],
    [TEAL, 'Collaboration reaches past the team boundary',
      'A request is open to every department and MB unit, so the right person is found on capability rather than on who happens to be nearby.'],
    [GREEN, 'Requests carry context, not guesswork',
      'Effort, skills and the bandwidth someone offered are all on the request, so a manager decides with the facts in front of them.'],
    [VIOLET, 'Upskilling follows genuine demand',
      'Scarce skills surface from real requests across the organisation, and colleague-run sessions close the gap where it actually exists.']
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

  s.addText('The common thread: knowledge and effort move to where they are '
    + 'needed, across the organisation rather than within one corner of it.', {
    x: M, y: 6.42, w: 11.4, h: 0.36, margin: 0,
    fontFace: BODY, fontSize: 13, italic: true, color: INK3, isTextBox: true
  });

  s.addNotes('Lead with reach past the team boundary — that is the part leadership '
    + 'already feels the absence of. Note the ceiling: this works the same way '
    + 'between departments and between MB units.');
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
    ['Post', 'Total effort, skills, seats'],
    ['Apply', 'Fit scored on offered bandwidth'],
    ['Approve', 'Author, then manager'],
    ['Recognise', 'Optional badge from the team']
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
        fill: { color: 'AEB8C5' }, line: { color: 'AEB8C5' }
      });
    }
  });

  // ── The surfaces that carry it ──
  s.addText('WHERE IT LIVES IN THE PRODUCT', {
    x: M, y: 3.24, w: 8, h: 0.28, margin: 0,
    fontFace: BODY, fontSize: 11, bold: true, charSpacing: 1.4, color: INK3, isTextBox: true
  });

  const features = [
    [PRIMARY, 'Opportunities', 'Open requirements from any team, ranked by fit'],
    [TEAL, 'People & Skills', 'Find capability anywhere in the organisation'],
    [GREEN, 'Approvals', 'Two-stage sign-off against offered bandwidth'],
    [AMBER, 'Learning', 'Colleague-run sessions on the skills in demand'],
    [VIOLET, 'Insights', 'Where skills are scarce, and who is contributing'],
    ['0E6D8C', 'Achievements', 'Badges and tiers, configurable by an admin']
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
    fontFace: BODY, fontSize: 14.5, color: 'A8CAEE', isTextBox: true
  });

  const questions = [
    'How is this different from asking someone on Teams — and what stops it becoming another tool nobody opens after month two?',
    'If an engineer contributes to another department, whose budget carries that time, and how do we keep it from pulling against committed delivery?',
    'The fit score and bandwidth check are rule-based, not learned. When a manager disagrees with the recommendation, who owns the consequences of that approval?',
    'Recognition data sits against named people. How do we keep it from being read as a performance signal, and what does that mean for how we govern it?'
  ];

  const qh = 1.02;
  questions.forEach((qtext, i) => {
    const y = 1.96 + i * (qh + 0.22);
    s.addShape(pres.ShapeType.roundRect, {
      x: M, y, w: W - M * 2, h: qh, rectRadius: 0.08,
      fill: { color: '23323F' }, line: { color: '31414F' }
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
      fontFace: BODY, fontSize: 13.5, color: 'E0EAF4', lineSpacingMultiple: 1.2, isTextBox: true
    });
  });

  s.addNotes('Answer live. Q2 (whose budget) and Q4 (recognition data governance) '
    + 'are the two that decide the room. On Q4: the score is private to the '
    + 'person and their manager, it feeds no review, and the platform is '
    + 'positioned for upskilling and collaboration, not advancement.');
}

pres.writeFile({ fileName: process.argv[2] })
  .then((f) => console.log('wrote', f));
