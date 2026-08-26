/**
 * Pull skills out of an uploaded CV.
 *
 * This is deliberately a catalogue match, not a language model: the CV text is
 * scanned for the skill names in SKILL_CATALOGUE (plus the abbreviations in
 * SYNONYMS below), and only those are proposed. That means it can never invent
 * a skill the platform does not know how to match on, every hit traces back to
 * a phrase the person actually wrote, and it runs entirely in the browser —
 * the CV is never uploaded anywhere. The trade-off is that a skill the
 * catalogue has never heard of will be missed, which is why the result is a
 * *suggestion* the person reviews rather than something written straight onto
 * the profile.
 */

import { SKILL_CATALOGUE, type SkillEntry } from '../data/skills';

export interface ExtractedSkill {
  name: string;
  group: string;
  /** The phrase in the CV that matched — shown so the person can sanity-check. */
  matchedOn: string;
  /** How many times it appeared; used to sort confident hits first. */
  hits: number;
}

export class CvParseError extends Error {}

/**
 * The catalogue's own `aliases` are NOT used here.
 *
 * Those exist for typeahead discovery — typing "python" should *offer* Django
 * and Flask, and typing "kubernetes" should offer Helm. That is exactly wrong
 * as evidence: a CV mentioning Python does not mean the person writes Django,
 * and "Mercedes" in an employer line is not the MB.OS skill. Extraction
 * therefore matches canonical names only, plus the genuine abbreviations
 * below — every hit is a phrase the person actually wrote.
 */
const SYNONYMS: Record<string, string[]> = {
  Kubernetes: ['k8s'],
  JavaScript: ['ecmascript'],
  PostgreSQL: ['postgres', 'psql'],
  'Node.js': ['nodejs'],
  'Next.js': ['nextjs'],
  'Vue.js': ['vuejs'],
  'CI/CD': ['ci / cd', 'continuous integration', 'continuous delivery'],
  'Bash / Shell': ['bash', 'shell scripting'],
  'HTML / CSS': ['html', 'css'],
  'AI / ML Engineer': ['machine learning engineer'],
  'QA / Test Engineer': ['qa engineer', 'test engineer', 'sdet'],
  'UX / UI Designer': ['ux designer', 'ui designer'],
  'Hardware-in-the-Loop': ['hardware in the loop', 'hil'],
  'ADAS / Autonomous Driving': ['adas', 'autonomous driving'],
  'IAM / OAuth': ['oauth', 'oidc'],
  'Agile / Scrum': ['scrum'],
  'LIN / FlexRay': ['flexray'],
  'UDS / Diagnostics': ['uds'],
  'INCA / CANape': ['canape'],
  'CAD / CAE': ['cad'],
  'Accessibility (WCAG)': ['wcag'],
  'scikit-learn': ['sklearn'],
  LLMs: ['llm', 'large language model'],
  'RAG Architecture': ['retrieval augmented generation', 'retrieval-augmented generation', 'rag'],
  NLP: ['natural language processing'],
  'REST APIs': ['rest api', 'restful'],
  'Simulation & CAE Engineer': ['cae engineer'],
  'Google Cloud': ['gcp']
};

/**
 * Short, purely alphabetic names ("C", "R", "Go") match constantly in ordinary
 * prose — "R&D", "Go to market", a stray initial — and there is no reliable
 * way to tell a real mention from an accident, so they are skipped. Missing
 * one the person can add by hand beats putting a skill on a profile they
 * never claimed.
 *
 * Short names carrying punctuation ("C#") are unambiguous and stay in.
 */
function tooShortToMatch(name: string): boolean {
  return name.length < 3 && /^[A-Za-z]+$/.test(name);
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Count whole-phrase occurrences, case-insensitively.
 *
 * `\b` does not work at a boundary that is already punctuation — "C++" and
 * "Node.js" would never match — so the boundaries are asserted explicitly
 * against characters that could continue a token.
 */
function countOccurrences(haystack: string, phrase: string): number {
  const p = escapeRegex(phrase);
  const re = new RegExp(`(?<![A-Za-z0-9+#.&-])${p}(?![A-Za-z0-9+#&-])`, 'gi');
  return (haystack.match(re) || []).length;
}

/** Scan CV text for catalogue skills. */
export function extractSkillsFromText(text: string): ExtractedSkill[] {
  if (!text.trim()) return [];
  const found: ExtractedSkill[] = [];

  for (const entry of SKILL_CATALOGUE as SkillEntry[]) {
    if (tooShortToMatch(entry.name)) continue;

    let hits = 0;
    let matchedOn = '';

    const nameHits = countOccurrences(text, entry.name);
    if (nameHits > 0) {
      hits += nameHits;
      matchedOn = entry.name;
    }

    for (const syn of SYNONYMS[entry.name] || []) {
      const synHits = countOccurrences(text, syn);
      if (synHits > 0) {
        hits += synHits;
        if (!matchedOn) matchedOn = syn;
      }
    }

    if (hits > 0) found.push({ name: entry.name, group: entry.group, matchedOn, hits });
  }

  // Most-mentioned first: a CV that says "Terraform" nine times is telling you
  // something a single passing mention is not.
  return found.sort((a, b) => b.hits - a.hits || a.name.localeCompare(b.name));
}

/** Read a .docx by inflating its ZIP and stripping the WordprocessingML tags. */
async function readDocx(file: File): Promise<string> {
  const mammoth = await import('mammoth/mammoth.browser.js' as string);
  const buf = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buf });
  return result.value || '';
}

/** Read a PDF page by page via pdf.js. */
async function readPdf(file: File): Promise<string> {
  const pdfjs: any = await import('pdfjs-dist');
  // pdf.js needs its worker; point it at the copy shipped in the package so
  // nothing is fetched from a CDN at runtime.
  const workerSrc = (await import('pdfjs-dist/build/pdf.worker.mjs?url' as string)).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    pages.push(content.items.map((it: any) => it.str ?? '').join(' '));
  }
  return pages.join('\n');
}

/**
 * Extract the plain text of a CV.
 *
 * Everything happens in the browser — the file is read locally and never sent
 * to the server.
 */
export async function readCvText(file: File): Promise<string> {
  const name = file.name.toLowerCase();

  if (file.size > 10 * 1024 * 1024) {
    throw new CvParseError('That file is over 10 MB — try exporting a smaller PDF.');
  }

  try {
    if (name.endsWith('.pdf')) return await readPdf(file);
    if (name.endsWith('.docx')) return await readDocx(file);
    if (name.endsWith('.txt') || name.endsWith('.md') || name.endsWith('.rtf')) {
      return await file.text();
    }
    if (name.endsWith('.doc')) {
      throw new CvParseError('Legacy .doc files are not supported — save it as .docx or PDF.');
    }
    throw new CvParseError('Upload a PDF, .docx, or plain-text CV.');
  } catch (err) {
    if (err instanceof CvParseError) throw err;
    throw new CvParseError(
      'That file could not be read. If it is a scanned PDF the text is an image, so there is nothing to extract.'
    );
  }
}

/** Read a CV and return the catalogue skills it mentions. */
export async function extractSkillsFromCv(file: File): Promise<{ skills: ExtractedSkill[]; charsRead: number }> {
  const text = await readCvText(file);
  if (!text.trim()) {
    throw new CvParseError(
      'No text found in that file. A scanned or image-only PDF has no text layer to read.'
    );
  }
  return { skills: extractSkillsFromText(text), charsRead: text.length };
}
