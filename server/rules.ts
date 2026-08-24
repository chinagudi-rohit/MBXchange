/**
 * Rule-based AI recommendation engine for manager approvals.
 * Deterministic capacity check: the applicant's declared weekly availability
 * (minus hours already committed to approved/pending applications) is compared
 * against the opportunity's expected effort range.
 */

export interface RecommendationInput {
  applicantName: string;
  availableHoursWeek: number;
  typicalAvailability: string;
  committedHours: number; // hours already tied up in other pending/approved applications
  consumedHours?: number; // hours already spent on engagements completed this period
  bandwidthPeriod?: BandwidthPeriod;
  effortMin: number;
  effortMax: number;
  effortText: string;
  postTitle: string;
  postDepartment: string;
  applicantSkills: string[];
  postTags: string[];
}

export interface Recommendation {
  verdict: 'Approve' | 'Review Capacity' | 'Not Recommended';
  reason: string;
}

/** Parse "8–12 hours", "4-8 hours/month", "6 hours" into [min, max]. */
export function parseHoursRange(text: string): [number, number] {
  const range = text.match(/(\d+)\s*[–\-—]\s*(\d+)/);
  if (range) return [parseInt(range[1], 10), parseInt(range[2], 10)];
  const single = text.match(/(\d+)/);
  if (single) {
    const n = parseInt(single[1], 10);
    return [n, n];
  }
  return [0, 0];
}

/* ── Contribution tiers ───────────────────────────────────────────────────
 * Earned, never assigned. A tier is held when every one of its thresholds is
 * met, so someone cannot reach Principal on hours alone — breadth across
 * departments is part of the bar. Recomputed whenever totals change.
 */

export interface Tier {
  name: string;
  icon: string;
  minHours: number;
  minGigs: number;
  minDepartments: number;
  blurb: string;
}

export const TIERS: Tier[] = [
  { name: 'Contributor', icon: '◇', minHours: 0,   minGigs: 0,  minDepartments: 0, blurb: 'Getting started on the exchange' },
  { name: 'Collaborator', icon: '◆', minHours: 10,  minGigs: 2,  minDepartments: 1, blurb: '10 hours contributed across 2 engagements' },
  { name: 'Connector',   icon: '✦', minHours: 40,  minGigs: 5,  minDepartments: 2, blurb: '40 hours and work in 2 departments' },
  { name: 'Catalyst',    icon: '✧', minHours: 100, minGigs: 12, minDepartments: 3, blurb: '100 hours and reach across 3 departments' },
  { name: 'Principal',   icon: '★', minHours: 250, minGigs: 25, minDepartments: 5, blurb: '250 hours and reach across 5 departments' }
];

export interface TierInput {
  hoursContributed: number;
  collaborationsCount: number;
  departmentsSupported: number;
}

/** Highest tier whose thresholds are all satisfied. */
export function computeTier(input: TierInput): Tier {
  const { hoursContributed, collaborationsCount, departmentsSupported } = input;
  let earned = TIERS[0];
  for (const t of TIERS) {
    if (hoursContributed >= t.minHours && collaborationsCount >= t.minGigs && departmentsSupported >= t.minDepartments) {
      earned = t;
    }
  }
  return earned;
}

/** The tier above the current one, and how far short each threshold still is. */
export function nextTierProgress(input: TierInput): { next: Tier | null; needs: string[] } {
  const current = computeTier(input);
  const idx = TIERS.findIndex((t) => t.name === current.name);
  const next = TIERS[idx + 1] || null;
  if (!next) return { next: null, needs: [] };
  const needs: string[] = [];
  const hoursShort = next.minHours - input.hoursContributed;
  const gigsShort = next.minGigs - input.collaborationsCount;
  const deptsShort = next.minDepartments - input.departmentsSupported;
  if (hoursShort > 0) needs.push(`${hoursShort}h more`);
  if (gigsShort > 0) needs.push(`${gigsShort} more ${gigsShort === 1 ? 'engagement' : 'engagements'}`);
  if (deptsShort > 0) needs.push(`${deptsShort} more ${deptsShort === 1 ? 'department' : 'departments'}`);
  return { next, needs };
}

/* ── Opportunity match scoring ─────────────────────────────────────────────
 * A single, explainable fit number for an opportunity, broken into the two
 * things that actually decide whether someone can help: do they have the
 * skills, and do they have the hours. Every component is derived from data the
 * user entered or the platform recorded — nothing is invented, and the reason
 * string says exactly what drove the number.
 */

export interface MatchInput {
  /** Declared stack: skills + interests + specialisation. */
  stack: string[];
  userDepartment: string;
  remainingHours: number;
  postTags: string[];
  postTitle: string;
  postDepartment: string;
  effortMin: number;
  effortMax: number;
}

export interface MatchResult {
  score: number;        // 0–100 overall fit
  skillFit: number;     // 0–100 share of the requirement's skills you hold
  capacityFit: number;  // 0–100 how well your free hours cover the ask
  matchedSkills: string[];
  crossDepartment: boolean;
  reason: string;
}

/** Lowercased word tokens, ignoring very short filler words. */
export function tokeniseTerms(values: string[]): string[] {
  return values
    .flatMap((v) => String(v || '').toLowerCase().split(/[^a-z0-9+#.]+/))
    .filter((t) => t.length > 2);
}

export function computeMatch(input: MatchInput): MatchResult {
  const {
    stack, userDepartment, remainingHours,
    postTags, postTitle, postDepartment, effortMin, effortMax
  } = input;

  const stackTokens = new Set(tokeniseTerms(stack));
  const tags = postTags.filter(Boolean);

  const matchedSkills = tags.filter((t) =>
    tokeniseTerms([t]).some((tok) => stackTokens.has(tok))
  );

  // Skill fit: how much of what the requirement asks for you actually hold.
  // With no tags to compare, fall back to title-word overlap rather than
  // claiming a perfect match on no evidence.
  let skillFit: number;
  if (tags.length > 0) {
    skillFit = Math.round((matchedSkills.length / tags.length) * 100);
  } else {
    const titleTokens = tokeniseTerms([postTitle]);
    const hits = titleTokens.filter((t) => stackTokens.has(t)).length;
    skillFit = titleTokens.length ? Math.min(60, Math.round((hits / titleTokens.length) * 100)) : 0;
  }

  // Capacity fit: full marks when your free hours cover the upper estimate,
  // partial when they cover the minimum, zero when you have nothing left.
  const need = effortMax || effortMin || 0;
  let capacityFit: number;
  if (remainingHours <= 0) capacityFit = 0;
  else if (need <= 0) capacityFit = 60;                       // unknown effort — neutral
  else if (remainingHours >= need) capacityFit = 100;
  else if (remainingHours >= effortMin) capacityFit = 70;
  else capacityFit = Math.round((remainingHours / need) * 60);

  const crossDepartment = !!postDepartment && postDepartment !== userDepartment;

  // Skills weigh more than hours: hours can be rescheduled, expertise cannot.
  // Crossing a department boundary is the behaviour the platform exists to
  // encourage, so it earns a small, capped bonus.
  const base = skillFit * 0.65 + capacityFit * 0.35;
  const score = Math.max(0, Math.min(100, Math.round(base + (crossDepartment ? 5 : 0))));

  const parts: string[] = [];
  if (matchedSkills.length > 0) {
    parts.push(`you have ${matchedSkills.slice(0, 3).join(', ')}${matchedSkills.length > 3 ? ` +${matchedSkills.length - 3} more` : ''}`);
  } else {
    parts.push('no declared skill overlap yet');
  }
  if (remainingHours <= 0) parts.push('no bandwidth left this period');
  else if (need > 0 && remainingHours >= need) parts.push(`${remainingHours}h free covers the ${need}h needed`);
  else if (need > 0) parts.push(`${remainingHours}h free against ${need}h needed`);
  if (crossDepartment) parts.push(`it is outside ${userDepartment}`);

  const reason = parts.join(' · ').replace(/^./, (c) => c.toUpperCase()) + '.';

  return { score, skillFit, capacityFit, matchedSkills, crossDepartment, reason };
}

/* ── Bandwidth ─────────────────────────────────────────────────────────── */

export type BandwidthPeriod = 'week' | 'month';

export function periodLabel(period: string): string {
  return period === 'month' ? 'month' : 'week';
}

/**
 * Hours a person can still take on: what they declared for the period, less
 * what completed engagements have already consumed, less what is currently
 * committed to pending or approved applications.
 */
export function remainingBandwidth(declared: number, consumed: number, committed: number): number {
  return Math.max(0, declared - consumed - committed);
}

export function computeRecommendation(input: RecommendationInput): Recommendation {
  const {
    applicantName, availableHoursWeek, committedHours,
    consumedHours = 0, bandwidthPeriod = 'week',
    effortMin, effortMax, effortText, postDepartment,
    applicantSkills, postTags
  } = input;

  const remaining = remainingBandwidth(availableHoursWeek, consumedHours, committedHours);
  const per = periodLabel(bandwidthPeriod);
  const skillOverlap = postTags.filter((t) =>
    applicantSkills.some((s) => s.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(s.toLowerCase()))
  );
  const skillNote = skillOverlap.length > 0
    ? ` Skill alignment with ${postDepartment}: ${skillOverlap.slice(0, 3).join(', ')}.`
    : ` No direct skill-tag overlap detected with this opportunity.`;
  const notes: string[] = [];
  if (committedHours > 0) notes.push(`${committedHours}h already committed to other engagements`);
  if (consumedHours > 0) notes.push(`${consumedHours}h already used on completed work this ${per}`);
  const committedNote = notes.length > 0 ? ` (${notes.join('; ')})` : '';

  if (effortMax <= 0) {
    return {
      verdict: 'Review Capacity',
      reason: `The opportunity does not declare an effort estimate; ${applicantName} has ${remaining}h available${committedNote}. Manual capacity review required.${skillNote}`
    };
  }

  if (remaining <= 0) {
    return {
      verdict: 'Not Recommended',
      reason: `${applicantName} has no remaining declared capacity this ${per}${committedNote}, while the task requires ${effortText || `${effortMin}–${effortMax} hours`}. Approving would overallocate the employee.${skillNote}`
    };
  }

  if (remaining >= effortMax) {
    return {
      verdict: 'Approve',
      reason: `${applicantName} has ${remaining}h of declared capacity${committedNote}, which covers the full ${effortText || `${effortMin}–${effortMax} hours`} requirement.${skillNote}`
    };
  }

  if (remaining >= effortMin) {
    return {
      verdict: 'Review Capacity',
      reason: `${applicantName} has ${remaining}h available${committedNote} — enough for the minimum (${effortMin}h) but below the upper estimate (${effortMax}h). Consider a reduced-scope commitment or verify the sprint load before approving.${skillNote}`
    };
  }

  return {
    verdict: 'Not Recommended',
    reason: `${applicantName} has only ${remaining}h of declared capacity${committedNote}, below the minimum ${effortMin}h this task requires (${effortText || `${effortMin}–${effortMax} hours`}). Approving would exceed the employee's available work hours.${skillNote}`
  };
}
