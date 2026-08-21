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

export function computeRecommendation(input: RecommendationInput): Recommendation {
  const {
    applicantName, availableHoursWeek, committedHours,
    effortMin, effortMax, effortText, postDepartment,
    applicantSkills, postTags
  } = input;

  const remaining = Math.max(0, availableHoursWeek - committedHours);
  const skillOverlap = postTags.filter((t) =>
    applicantSkills.some((s) => s.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(s.toLowerCase()))
  );
  const skillNote = skillOverlap.length > 0
    ? ` Skill alignment with ${postDepartment}: ${skillOverlap.slice(0, 3).join(', ')}.`
    : ` No direct skill-tag overlap detected with this opportunity.`;
  const committedNote = committedHours > 0
    ? ` (${committedHours}h already committed to other engagements)`
    : '';

  if (effortMax <= 0) {
    return {
      verdict: 'Review Capacity',
      reason: `The opportunity does not declare an effort estimate; ${applicantName} has ${remaining}h available${committedNote}. Manual capacity review required.${skillNote}`
    };
  }

  if (remaining <= 0) {
    return {
      verdict: 'Not Recommended',
      reason: `${applicantName} has no remaining declared capacity this period${committedNote}, while the task requires ${effortText || `${effortMin}–${effortMax} hours`}. Approving would overallocate the employee.${skillNote}`
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
