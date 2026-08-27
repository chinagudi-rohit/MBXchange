/**
 * Builds docs/MBXchange_Overview.pptx — the 4-slide leadership deck.
 *
 * Slides 1 and 2 keep the original layout; only the palette and the wording
 * change, so the deck still reads as the same document. Slide 2's product
 * mock is redrawn to resemble the shipped UI (sidebar, header, score ring,
 * stat tiles, a requirement card with the three-segment match meter) rather
 * than the abstract boxes it had. Slides 3 and 4 are new.
 *
 * Palette is lifted verbatim from src/index.css light mode.
 */
const fs = require('node:fs');
const path = require('node:path');
const pptxgen = require('pptxgenjs');

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';            // 13.333 x 7.5
pres.author = 'MBXchange';
pres.title = 'MBXchange Overview';

// ── Tokens, straight from the application ────────────────────────────────
const INK      = '1B2736';
const INK2     = '4D5A66';
const INK3     = '626D7A';
const PAGE     = 'F7F8FB';
const WHITE    = 'FFFFFF';
const PRIMARY  = '176DD0';
const PRIM_SFT = 'E7EFFA';
const GREEN    = '128166';
const AMBER    = '9A650D';
const TEAL     = '107A9C';
const VIOLET   = '6758C8';
const LINE     = 'CBD2DC';

// Dark ground for the opening and closing slides — Mercedes black, pulled a
// touch toward the app's navy so the deck reads as one document.
const DARK        = '0B0F14';
const DARK_PANEL  = '141B24';
const DARK_LINE   = '232D39';
const ON_DARK     = 'C3D2E4';
const ON_DARK_DIM = '8496A8';
const SKY         = '69AAF2';

const HEAD = 'Calibri';
const BODY = 'Calibri';
const W = 13.333;

const LOGO = 'image/png;base64,' + fs.readFileSync(
  path.join(__dirname, 'assets', 'mb-star.png')
).toString('base64');

/** Fresh object per call — pptxgenjs mutates options in place. */
const cardShadow = () => ({ type: 'outer', color: '1B2736', blur: 10, offset: 2, angle: 90, opacity: 0.10 });

function footer(slide, left, right, color) {
  slide.addText(left, {
    x: 0.55, y: 7.00, w: 9.5, h: 0.3, margin: 0,
    fontFace: BODY, fontSize: 9.5, color, isTextBox: true
  });
  slide.addText(right, {
    x: 12.28, y: 7.00, w: 0.5, h: 0.3, margin: 0, align: 'right',
    fontFace: BODY, fontSize: 9.5, color, isTextBox: true
  });
}

/* ═══════════════════════ 1 · Overview ═══════════════════════ */
{
  const s = pres.addSlide();
  s.background = { color: DARK };

  s.addImage({ data: LOGO, x: 0.55, y: 0.50, w: 0.5, h: 0.5 });
  s.addText([
    { text: 'MB', options: { color: WHITE } },
    { text: 'X', options: { color: SKY } },
    { text: 'change', options: { color: WHITE } }
  ], {
    x: 1.18, y: 0.48, w: 1.6, h: 0.34, margin: 0,
    fontFace: HEAD, fontSize: 17, bold: true, isTextBox: true
  });
  s.addShape(pres.ShapeType.roundRect, {
    x: 2.78, y: 0.545, w: 0.85, h: 0.24, rectRadius: 0.06,
    fill: { color: DARK_PANEL }, line: { color: DARK_LINE }
  });
  s.addText('INTERNAL', {
    x: 2.78, y: 0.545, w: 0.85, h: 0.24, margin: 0, align: 'center', valign: 'middle',
    fontFace: BODY, fontSize: 8, bold: true, charSpacing: 0.8, color: SKY, isTextBox: true
  });
  s.addText('Connect  ·  Collaborate  ·  Contribute', {
    x: 1.18, y: 0.86, w: 3.4, h: 0.22, margin: 0,
    fontFace: BODY, fontSize: 9.5, color: ON_DARK_DIM, isTextBox: true
  });

  s.addText('Projects beyond\nyour day-to-day work.', {
    x: 0.55, y: 2.45, w: 8.6, h: 1.85, margin: 0,
    fontFace: HEAD, fontSize: 42, bold: true, color: WHITE,
    lineSpacingMultiple: 1.12, isTextBox: true
  });

  s.addText(
    'Post the help you need, offer the hours and skills you want to bring, '
    + 'and let every request move through the right approvals — recorded as a '
    + 'history of what was actually done.',
    {
      x: 0.57, y: 4.42, w: 6.9, h: 0.9, margin: 0,
      fontFace: BODY, fontSize: 13, color: ON_DARK, lineSpacingMultiple: 1.3, isTextBox: true
    }
  );

  const points = [
    'Post what you need, and see who genuinely fits it',
    'Offer the bandwidth you choose to bring, not what a calendar implies',
    'Find where skills are scarce, and the sessions that close the gap'
  ];
  points.forEach((t, i) => {
    const y = 5.45 + i * 0.40;
    s.addShape(pres.ShapeType.ellipse, {
      x: 0.60, y: y + 0.115, w: 0.09, h: 0.09,
      fill: { color: SKY }, line: { color: SKY }
    });
    s.addText(t, {
      x: 0.85, y, w: 6.5, h: 0.32, margin: 0,
      fontFace: BODY, fontSize: 11.5, color: 'E2EAF3', isTextBox: true
    });
  });

  // Right-hand rail: what each role does
  s.addShape(pres.ShapeType.rect, {
    x: 9.55, y: 1.65, w: 0.012, h: 4.55,
    fill: { color: DARK_LINE }, line: { color: DARK_LINE }
  });
  s.addText('BUILT FOR EVERY ROLE', {
    x: 9.85, y: 1.65, w: 3.0, h: 0.28, margin: 0,
    fontFace: BODY, fontSize: 9, bold: true, charSpacing: 1.2, color: ON_DARK_DIM, isTextBox: true
  });
  const roles = [
    ['Employee', 'Post, apply, host a session, and recognise the people you worked with.'],
    ['Manager', 'Approve against the bandwidth somebody actually offered, with the facts on the request.'],
    ['Admin', 'Accounts, the badge and tier system, reporting and the audit trail.']
  ];
  roles.forEach(([title, body], i) => {
    const y = 2.10 + i * 1.15;
    s.addText(title, {
      x: 9.85, y, w: 3.0, h: 0.28, margin: 0,
      fontFace: HEAD, fontSize: 13, bold: true, color: WHITE, isTextBox: true
    });
    s.addText(body, {
      x: 9.85, y: y + 0.30, w: 3.0, h: 0.78, margin: 0,
      fontFace: BODY, fontSize: 10, color: ON_DARK_DIM, lineSpacingMultiple: 1.2, isTextBox: true
    });
  });

  // Section tabs
  s.addShape(pres.ShapeType.roundRect, {
    x: 0.55, y: 6.55, w: 1.7, h: 0.4, rectRadius: 0.08,
    fill: { color: PRIMARY }, line: { color: PRIMARY }
  });
  s.addText('Overview', {
    x: 0.55, y: 6.55, w: 1.7, h: 0.4, margin: 0, align: 'center', valign: 'middle',
    fontFace: HEAD, fontSize: 10.5, bold: true, color: WHITE, isTextBox: true
  });
  s.addShape(pres.ShapeType.roundRect, {
    x: 2.35, y: 6.55, w: 2.0, h: 0.4, rectRadius: 0.08,
    fill: { color: DARK_PANEL }, line: { color: DARK_LINE }
  });
  s.addText('How it works  ▸', {
    x: 2.35, y: 6.55, w: 2.0, h: 0.4, margin: 0, align: 'center', valign: 'middle',
    fontFace: HEAD, fontSize: 10.5, color: ON_DARK, isTextBox: true
  });

  footer(s, 'Mercedes-Benz internal platform  ·  Access provisioned by your administrator', '1 / 4', '5C6C7D');
  s.addNotes('Framing: MBXchange makes an exchange that already happens informally '
    + 'findable, decidable and creditable. Say "bandwidth people choose to offer" — '
    + 'never "spare capacity". This is not a performance or resourcing tool.');
}

/* ═══════════════════════ 2 · How it works ═══════════════════════ */
{
  const s = pres.addSlide();
  s.background = { color: PAGE };

  s.addShape(pres.ShapeType.roundRect, {
    x: 0.55, y: 0.50, w: 1.5, h: 0.36, rectRadius: 0.07,
    fill: { color: 'E9EDF3' }, line: { color: LINE }
  });
  s.addText('◂  Overview', {
    x: 0.55, y: 0.50, w: 1.5, h: 0.36, margin: 0, align: 'center', valign: 'middle',
    fontFace: BODY, fontSize: 10, color: INK2, isTextBox: true
  });

  s.addText('How MBXchange works', {
    x: 0.55, y: 0.94, w: 8.0, h: 0.5, margin: 0,
    fontFace: HEAD, fontSize: 27, bold: true, color: INK, isTextBox: true
  });
  s.addText('From a posted requirement to recognised, completed work.', {
    x: 0.55, y: 1.44, w: 7.4, h: 0.3, margin: 0,
    fontFace: BODY, fontSize: 12, color: INK2, isTextBox: true
  });

  // ── Four steps ──
  const steps = [
    ['Post a requirement', 'Total effort, skills and seats — visible to every team.'],
    ['See how well it fits', 'Skill overlap and the bandwidth you have offered.'],
    ['Two-stage approval', 'The author decides first, then your line manager.'],
    ['Recognition', 'A badge from the people you actually worked with.']
  ];
  steps.forEach(([title, body], i) => {
    const x = 0.55 + i * 3.15;
    s.addShape(pres.ShapeType.roundRect, {
      x, y: 1.95, w: 2.75, h: 1.28, rectRadius: 0.09,
      fill: { color: WHITE }, line: { color: LINE }, shadow: cardShadow()
    });
    s.addShape(pres.ShapeType.roundRect, {
      x: x + 0.16, y: 2.10, w: 0.32, h: 0.32, rectRadius: 0.07,
      fill: { color: PRIM_SFT }, line: { color: PRIM_SFT }
    });
    s.addText(String(i + 1), {
      x: x + 0.16, y: 2.10, w: 0.32, h: 0.32, margin: 0, align: 'center', valign: 'middle',
      fontFace: HEAD, fontSize: 11, bold: true, color: PRIMARY, isTextBox: true
    });
    s.addText(title, {
      x: x + 0.16, y: 2.49, w: 2.43, h: 0.32, margin: 0,
      fontFace: HEAD, fontSize: 12.5, bold: true, color: INK, isTextBox: true
    });
    s.addText(body, {
      x: x + 0.16, y: 2.80, w: 2.43, h: 0.40, margin: 0,
      fontFace: BODY, fontSize: 9.5, color: INK2, lineSpacingMultiple: 1.15, isTextBox: true
    });
    if (i < 3) {
      s.addShape(pres.ShapeType.rightArrow, {
        x: x + 2.82, y: 2.50, w: 0.26, h: 0.18,
        fill: { color: 'AEB8C5' }, line: { color: 'AEB8C5' }
      });
    }
  });

  // ── Inside the platform ──
  s.addText('INSIDE THE PLATFORM', {
    x: 0.55, y: 3.23, w: 6.0, h: 0.22, margin: 0,
    fontFace: BODY, fontSize: 9, bold: true, charSpacing: 1.2, color: INK3, isTextBox: true
  });
  const features = [
    [PRIMARY, 'Opportunities', 'Open requirements, ranked by fit'],
    [TEAL,    'People & Skills', 'Find capability and offered bandwidth'],
    [GREEN,   'Approvals', 'Two-stage sign-off on every request'],
    [AMBER,   'Learning', 'Colleague-run sessions on scarce skills'],
    [VIOLET,  'Insights', 'Where skills are short, and team reporting'],
    ['0E6D8C','Achievements', 'Badges and tiers, configurable by an admin']
  ];
  features.forEach(([color, title, body], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.55 + col * 3.15;
    const y = 3.51 + row * 1.00;
    s.addShape(pres.ShapeType.ellipse, {
      x, y: y + 0.09, w: 0.10, h: 0.10, fill: { color }, line: { color }
    });
    s.addText(title, {
      x: x + 0.22, y, w: 2.63, h: 0.26, margin: 0,
      fontFace: HEAD, fontSize: 11.5, bold: true, color: INK, isTextBox: true
    });
    s.addText(body, {
      x: x + 0.22, y: y + 0.26, w: 2.63, h: 0.50, margin: 0,
      fontFace: BODY, fontSize: 9, color: INK3, lineSpacingMultiple: 1.15, isTextBox: true
    });
  });

  /* ── Product mock ──────────────────────────────────────────────────────
     Deliberately low-detail but structurally true to the running app: the
     collapsed sidebar with an active item, the search header, the score ring
     with its hours bar, two stat tiles, and a requirement card carrying the
     three-segment match meter. */
  const MX = 6.95, MY = 3.55, MW = 5.83, MH = 3.00;

  s.addShape(pres.ShapeType.roundRect, {
    x: MX, y: MY, w: MW, h: MH, rectRadius: 0.05,
    fill: { color: WHITE }, line: { color: LINE }, shadow: cardShadow()
  });
  // browser chrome
  ['D96B63', 'DEB44F', '5FAE86'].forEach((c, i) => {
    s.addShape(pres.ShapeType.ellipse, {
      x: MX + 0.20 + i * 0.19, y: MY + 0.17, w: 0.08, h: 0.08,
      fill: { color: c }, line: { color: c }
    });
  });
  s.addShape(pres.ShapeType.roundRect, {
    x: MX + 0.85, y: MY + 0.11, w: 2.2, h: 0.20, rectRadius: 0.05,
    fill: { color: 'F1F4F8' }, line: { color: 'F1F4F8' }
  });
  s.addText('mbxchange.internal', {
    x: MX + 0.92, y: MY + 0.11, w: 2.1, h: 0.20, margin: 0, valign: 'middle',
    fontFace: BODY, fontSize: 7.5, color: INK3, isTextBox: true
  });
  s.addShape(pres.ShapeType.rect, {
    x: MX, y: MY + 0.36, w: MW, h: 0.008,
    fill: { color: 'E7EBF1' }, line: { color: 'E7EBF1' }
  });

  // sidebar
  const SB = 0.98;
  s.addShape(pres.ShapeType.rect, {
    x: MX, y: MY + 0.368, w: SB, h: MH - 0.368,
    fill: { color: 'F4F6FA' }, line: { color: 'F4F6FA' }
  });
  s.addShape(pres.ShapeType.roundRect, {
    x: MX + 0.10, y: MY + 0.50, w: 0.78, h: 0.20, rectRadius: 0.05,
    fill: { color: PRIMARY }, line: { color: PRIMARY }
  });
  s.addText('Post / Request', {
    x: MX + 0.10, y: MY + 0.50, w: 0.78, h: 0.20, margin: 0, align: 'center', valign: 'middle',
    fontFace: BODY, fontSize: 6, bold: true, color: WHITE, isTextBox: true
  });
  const nav = ['Home', 'Opportunities', 'People & Skills', 'My Requests', 'Learning', 'Insights'];
  nav.forEach((label, i) => {
    const y = MY + 0.82 + i * 0.235;
    if (i === 1) {
      s.addShape(pres.ShapeType.roundRect, {
        x: MX + 0.07, y: y - 0.03, w: 0.84, h: 0.20, rectRadius: 0.05,
        fill: { color: PRIM_SFT }, line: { color: PRIM_SFT }
      });
    }
    s.addShape(pres.ShapeType.roundRect, {
      x: MX + 0.14, y: y + 0.035, w: 0.09, h: 0.09, rectRadius: 0.02,
      fill: { color: i === 1 ? PRIMARY : 'B9C3CF' }, line: { color: i === 1 ? PRIMARY : 'B9C3CF' }
    });
    s.addText(label, {
      x: MX + 0.27, y, w: 0.66, h: 0.16, margin: 0, valign: 'middle',
      fontFace: BODY, fontSize: 6.2, bold: i === 1,
      color: i === 1 ? PRIMARY : INK3, isTextBox: true
    });
  });

  // header row
  s.addShape(pres.ShapeType.roundRect, {
    x: MX + SB + 0.14, y: MY + 0.50, w: 1.9, h: 0.20, rectRadius: 0.05,
    fill: { color: 'F1F4F8' }, line: { color: 'E3E8EF' }
  });
  s.addText('Search title, tag, author…', {
    x: MX + SB + 0.22, y: MY + 0.50, w: 1.8, h: 0.20, margin: 0, valign: 'middle',
    fontFace: BODY, fontSize: 6, color: '93A0AE', isTextBox: true
  });
  s.addShape(pres.ShapeType.ellipse, {
    x: MX + MW - 0.36, y: MY + 0.50, w: 0.20, h: 0.20,
    fill: { color: PRIM_SFT }, line: { color: PRIM_SFT }
  });
  s.addText('KI', {
    x: MX + MW - 0.36, y: MY + 0.50, w: 0.20, h: 0.20, margin: 0, align: 'center', valign: 'middle',
    fontFace: BODY, fontSize: 5.5, bold: true, color: PRIMARY, isTextBox: true
  });

  // score card with ring
  const CX = MX + SB + 0.14, CY = MY + 0.84;
  s.addShape(pres.ShapeType.roundRect, {
    x: CX, y: CY, w: 1.62, h: 0.94, rectRadius: 0.06,
    fill: { color: WHITE }, line: { color: 'E7EBF1' }
  });
  s.addShape(pres.ShapeType.ellipse, {
    x: CX + 0.12, y: CY + 0.18, w: 0.44, h: 0.44,
    fill: { color: PRIM_SFT }, line: { color: PRIMARY, width: 2 }
  });
  s.addText('4.2', {
    x: CX + 0.12, y: CY + 0.18, w: 0.44, h: 0.44, margin: 0, align: 'center', valign: 'middle',
    fontFace: HEAD, fontSize: 9, bold: true, color: INK, isTextBox: true
  });
  s.addText('CONTRIBUTION SCORE', {
    x: CX + 0.64, y: CY + 0.16, w: 0.92, h: 0.14, margin: 0,
    fontFace: BODY, fontSize: 5, bold: true, charSpacing: 0.4, color: INK3, isTextBox: true
  });
  s.addText('Catalyst', {
    x: CX + 0.64, y: CY + 0.30, w: 0.92, h: 0.18, margin: 0,
    fontFace: HEAD, fontSize: 9, bold: true, color: INK, isTextBox: true
  });
  s.addShape(pres.ShapeType.roundRect, {
    x: CX + 0.64, y: CY + 0.54, w: 0.86, h: 0.06, rectRadius: 0.03,
    fill: { color: 'E7EBF1' }, line: { color: 'E7EBF1' }
  });
  s.addShape(pres.ShapeType.roundRect, {
    x: CX + 0.64, y: CY + 0.54, w: 0.72, h: 0.06, rectRadius: 0.03,
    fill: { color: PRIMARY }, line: { color: PRIMARY }
  });
  s.addText('210h contributed', {
    x: CX + 0.64, y: CY + 0.63, w: 0.92, h: 0.14, margin: 0,
    fontFace: BODY, fontSize: 5.2, color: INK3, isTextBox: true
  });

  // two stat tiles
  [['OPEN', '15'], ['APPROVALS', '5']].forEach(([label, value], i) => {
    const x = CX + 1.74 + i * 1.28;
    s.addShape(pres.ShapeType.roundRect, {
      x, y: CY, w: 1.20, h: 0.44, rectRadius: 0.06,
      fill: { color: WHITE }, line: { color: 'E7EBF1' }
    });
    s.addText(label, {
      x: x + 0.10, y: CY + 0.05, w: 1.0, h: 0.13, margin: 0,
      fontFace: BODY, fontSize: 5, bold: true, charSpacing: 0.4, color: INK3, isTextBox: true
    });
    s.addText(value, {
      x: x + 0.10, y: CY + 0.17, w: 1.0, h: 0.22, margin: 0,
      fontFace: HEAD, fontSize: 12, bold: true, color: INK, isTextBox: true
    });
    // a second, quieter tile beneath
    s.addShape(pres.ShapeType.roundRect, {
      x, y: CY + 0.50, w: 1.20, h: 0.44, rectRadius: 0.06,
      fill: { color: WHITE }, line: { color: 'E7EBF1' }
    });
    s.addShape(pres.ShapeType.roundRect, {
      x: x + 0.10, y: CY + 0.60, w: 0.55, h: 0.07, rectRadius: 0.03,
      fill: { color: 'E7EBF1' }, line: { color: 'E7EBF1' }
    });
    s.addShape(pres.ShapeType.roundRect, {
      x: x + 0.10, y: CY + 0.72, w: 0.34, h: 0.11, rectRadius: 0.03,
      fill: { color: 'D8DFE8' }, line: { color: 'D8DFE8' }
    });
  });

  // requirement card with the three-segment match meter
  const RY = CY + 1.06;
  s.addShape(pres.ShapeType.roundRect, {
    x: CX, y: RY, w: 4.42, h: 0.80, rectRadius: 0.06,
    fill: { color: WHITE }, line: { color: 'E7EBF1' }
  });
  [0, 1, 2].forEach((i) => {
    s.addShape(pres.ShapeType.roundRect, {
      x: CX + 0.12 + i * 0.16, y: RY + 0.13, w: 0.13, h: 0.055, rectRadius: 0.025,
      fill: { color: i < 3 ? GREEN : 'E7EBF1' }, line: { color: i < 3 ? GREEN : 'E7EBF1' }
    });
  });
  s.addText('High match', {
    x: CX + 0.62, y: RY + 0.07, w: 0.8, h: 0.16, margin: 0, valign: 'middle',
    fontFace: BODY, fontSize: 5.8, bold: true, color: GREEN, isTextBox: true
  });
  ['PT-THIF', 'Open'].forEach((t, i) => {
    const x = CX + 1.46 + i * 0.52;
    s.addShape(pres.ShapeType.roundRect, {
      x, y: RY + 0.09, w: 0.46, h: 0.16, rectRadius: 0.04,
      fill: { color: 'F1F4F8' }, line: { color: 'F1F4F8' }
    });
    s.addText(t, {
      x, y: RY + 0.09, w: 0.46, h: 0.16, margin: 0, align: 'center', valign: 'middle',
      fontFace: BODY, fontSize: 5, color: INK3, isTextBox: true
    });
  });
  s.addText('Terraform modules for the shared platform VPC', {
    x: CX + 0.12, y: RY + 0.29, w: 3.2, h: 0.20, margin: 0,
    fontFace: HEAD, fontSize: 8, bold: true, color: INK, isTextBox: true
  });
  s.addText('8–12 hours total  ·  MBRDI Bengaluru  ·  2 of 2 seats open', {
    x: CX + 0.12, y: RY + 0.50, w: 3.4, h: 0.18, margin: 0,
    fontFace: BODY, fontSize: 5.8, color: INK3, isTextBox: true
  });
  s.addShape(pres.ShapeType.roundRect, {
    x: CX + 3.62, y: RY + 0.44, w: 0.68, h: 0.22, rectRadius: 0.05,
    fill: { color: PRIMARY }, line: { color: PRIMARY }
  });
  s.addText('Collaborate', {
    x: CX + 3.62, y: RY + 0.44, w: 0.68, h: 0.22, margin: 0, align: 'center', valign: 'middle',
    fontFace: BODY, fontSize: 5.8, bold: true, color: WHITE, isTextBox: true
  });

  footer(s, 'MBXchange  ·  React 19 + Vite  ·  Express  ·  PostgreSQL', '2 / 4', INK3);
  s.addNotes('Walk the four steps, then point at the surfaces. Do not read the '
    + 'cards out — they are signposts for the live demo. The mock on the right is '
    + 'the real Opportunities view in miniature.');
}

/* ═══════════════════════ 3 · The questions ═══════════════════════ */
{
  const s = pres.addSlide();
  s.background = { color: PAGE };

  s.addText('The questions worth asking', {
    x: 0.55, y: 0.66, w: 11, h: 0.62, margin: 0,
    fontFace: HEAD, fontSize: 30, bold: true, color: INK, isTextBox: true
  });
  s.addText('Raised here deliberately — we will take these live.', {
    x: 0.55, y: 1.28, w: 11, h: 0.32, margin: 0,
    fontFace: BODY, fontSize: 12.5, color: INK2, isTextBox: true
  });

  const questions = [
    [PRIMARY, 'We already have Teams, Viva and an internal job board. What does this do that they do not?'],
    [TEAL, 'If somebody gives hours to another team, whose budget carries that — and how do we keep it from pulling against committed delivery?'],
    [AMBER, 'What stops this becoming another tool nobody opens after month two?'],
    [VIOLET, 'Recognition data sits against named people. How do we keep it from being read as a performance signal?']
  ];

  const qh = 1.06;
  questions.forEach(([color, text], i) => {
    const y = 1.94 + i * (qh + 0.22);
    s.addShape(pres.ShapeType.roundRect, {
      x: 0.55, y, w: W - 1.1, h: qh, rectRadius: 0.08,
      fill: { color: WHITE }, line: { color: LINE }, shadow: cardShadow()
    });
    s.addShape(pres.ShapeType.ellipse, {
      x: 0.90, y: y + 0.33, w: 0.40, h: 0.40,
      fill: { color }, line: { color }
    });
    s.addText(`Q${i + 1}`, {
      x: 0.90, y: y + 0.33, w: 0.40, h: 0.40, margin: 0, align: 'center', valign: 'middle',
      fontFace: HEAD, fontSize: 10.5, bold: true, color: WHITE, isTextBox: true
    });
    s.addText(text, {
      x: 1.52, y: y + 0.22, w: W - 2.3, h: 0.62, margin: 0, valign: 'middle',
      fontFace: BODY, fontSize: 13, color: INK, lineSpacingMultiple: 1.2, isTextBox: true
    });
  });

  footer(s, 'MBXchange  ·  Overview', '3 / 4', INK3);
  s.addNotes('Q1 and Q2 decide the room. On Q1: none of those tools carry an '
    + 'approval or a record of what was given. On Q4: the score is private to the '
    + 'person and their manager, it feeds no review, and the platform is positioned '
    + 'for upskilling and collaboration, not advancement.');
}

/* ═══════════════════════ 4 · Thank you ═══════════════════════ */
{
  const s = pres.addSlide();
  s.background = { color: DARK };

  s.addImage({ data: LOGO, x: (W - 1.1) / 2, y: 1.85, w: 1.1, h: 1.1 });

  s.addText('Thank you', {
    x: 0, y: 3.30, w: W, h: 0.95, margin: 0, align: 'center',
    fontFace: HEAD, fontSize: 46, bold: true, color: WHITE, isTextBox: true
  });

  s.addShape(pres.ShapeType.rect, {
    x: (W - 1.6) / 2, y: 4.38, w: 1.6, h: 0.014,
    fill: { color: DARK_LINE }, line: { color: DARK_LINE }
  });

  s.addText([
    { text: 'MB', options: { color: WHITE } },
    { text: 'X', options: { color: SKY } },
    { text: 'change', options: { color: WHITE } }
  ], {
    x: 0, y: 4.62, w: W, h: 0.36, margin: 0, align: 'center',
    fontFace: HEAD, fontSize: 17, bold: true, isTextBox: true
  });
  s.addText('Connect  ·  Collaborate  ·  Contribute', {
    x: 0, y: 4.98, w: W, h: 0.30, margin: 0, align: 'center',
    fontFace: BODY, fontSize: 11.5, charSpacing: 1.0, color: ON_DARK_DIM, isTextBox: true
  });

  s.addText('Questions welcome.', {
    x: 0, y: 5.62, w: W, h: 0.30, margin: 0, align: 'center',
    fontFace: BODY, fontSize: 12, color: ON_DARK, isTextBox: true
  });

  footer(s, 'Mercedes-Benz internal platform', '4 / 4', '5C6C7D');
  s.addNotes('Hold here for questions. Slide 3 lists the four we expect.');
}

pres.writeFile({ fileName: process.argv[2] }).then((f) => console.log('wrote', f));
