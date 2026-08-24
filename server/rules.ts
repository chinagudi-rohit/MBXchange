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
