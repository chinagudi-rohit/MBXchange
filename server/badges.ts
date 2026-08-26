/**
 * Award badges — the unit of peer recognition on MBXchange.
 *
 * Recognition used to be a free-text note plus a 1–5 star rating. A star
 * rating collapses very different kinds of good work into one number, and
 * everybody gives 5, so it carried almost no signal. A badge names *what*
 * the person did well, which is both more useful to read and more useful to
 * aggregate.
 *
 * The catalogue below is modelled on how peer-recognition platforms in this
 * space generally structure their badge sets — a small, fixed, positive-only
 * vocabulary, each badge tied to one underlying quality so the awards roll
 * up into a profile. It is our own wording, not a copy of any one product's
 * list.
 *
 * Every badge maps to one `dimension`, and a person's profile shows how many
 * badges they hold in each. Keep this list SHORT: a long catalogue makes
 * picking one a chore and spreads the counts too thin to mean anything.
 */

import { q } from './db.ts';

export type BadgeDimension = 'helping' | 'technicalExpertise' | 'collaboration' | 'reliability';

export interface AwardBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
  dimension: BadgeDimension;
}

export const BADGE_DIMENSIONS: Record<BadgeDimension, string> = {
  helping: 'Helping & mentorship',
  technicalExpertise: 'Technical expertise',
  collaboration: 'Cross-team collaboration',
  reliability: 'Reliability & follow-through'
};

export const AWARD_BADGES: AwardBadge[] = [
  // ── Helping & mentorship ──────────────────────────────────────────────
  {
    id: 'unblocker',
    name: 'Unblocker',
    icon: '🔓',
    description: 'Cleared a blocker that was holding up the whole team.',
    dimension: 'helping'
  },
  {
    id: 'mentor',
    name: 'Generous Mentor',
    icon: '🧭',
    description: 'Taught as they worked, so the knowledge stayed behind.',
    dimension: 'helping'
  },
  {
    id: 'first_responder',
    name: 'First Responder',
    icon: '⚡',
    description: 'Picked it up immediately when it mattered most.',
    dimension: 'helping'
  },

  // ── Technical expertise ───────────────────────────────────────────────
  {
    id: 'deep_diver',
    name: 'Deep Diver',
    icon: '🔬',
    description: 'Chased the problem to its actual root cause.',
    dimension: 'technicalExpertise'
  },
  {
    id: 'out_of_the_box',
    name: 'Out of the Box',
    icon: '💡',
    description: 'Found an approach nobody else in the room had considered.',
    dimension: 'technicalExpertise'
  },
  {
    id: 'quality_champion',
    name: 'Quality Champion',
    icon: '🛡️',
    description: 'Raised the bar on quality instead of just shipping it.',
    dimension: 'technicalExpertise'
  },

  // ── Cross-team collaboration ──────────────────────────────────────────
  {
    id: 'bridge_builder',
    name: 'Bridge Builder',
    icon: '🌉',
    description: 'Connected two teams that were solving the same problem apart.',
    dimension: 'collaboration'
  },
  {
    id: 'team_player',
    name: 'Team Player',
    icon: '🤝',
    description: 'Made the group work better, not just their own part of it.',
    dimension: 'collaboration'
  },
  {
    id: 'customer_first',
    name: 'Customer First',
    icon: '🎯',
    description: 'Kept the person on the other end of the work in view throughout.',
    dimension: 'collaboration'
  },

  // ── Reliability & follow-through ──────────────────────────────────────
  {
    id: 'dependable',
    name: 'Rock Solid',
    icon: '🪨',
    description: 'Said they would do it, and it was done.',
    dimension: 'reliability'
  },
  {
    id: 'calm_under_pressure',
    name: 'Calm Under Pressure',
    icon: '🧊',
    description: 'Stayed steady and clear-headed when the deadline got tight.',
    dimension: 'reliability'
  },
  {
    id: 'above_and_beyond',
    name: 'Above & Beyond',
    icon: '🚀',
    description: 'Went well past what was actually asked of them.',
    dimension: 'reliability'
  }
];

const BY_ID = new Map(AWARD_BADGES.map((b) => [b.id, b]));

export function getBadge(id: string): AwardBadge | undefined {
  return BY_ID.get(id);
}

export function isBadgeId(id: unknown): id is string {
  return typeof id === 'string' && BY_ID.has(id);
}

/**
 * The four things that move a person's contribution score, and how much of
 * each counts as "fully there".
 *
 * The score is deliberately NOT a peer star rating. Everybody gave 5, so that
 * number said nothing. This one is computed from work the person actually
 * did, and every component is visible in the UI — so "improve your score"
 * translates into a specific next action rather than into hoping somebody
 * rates you well.
 */
export interface ScoreComponent {
  key: 'recognition' | 'impact' | 'reach' | 'consistency';
  label: string;
  hint: string;
  /** Value at which this component is considered maxed out. */
  target: number;
  weight: number;
}

export const SCORE_COMPONENTS: ScoreComponent[] = [
  { key: 'recognition', label: 'Recognition', hint: 'Badges awarded to you', target: 12, weight: 0.35 },
  { key: 'impact', label: 'Impact', hint: 'Hours contributed to other teams', target: 100, weight: 0.25 },
  { key: 'reach', label: 'Reach', hint: 'Departments you have supported', target: 5, weight: 0.20 },
  { key: 'consistency', label: 'Consistency', hint: 'Engagements completed', target: 20, weight: 0.20 }
];

export interface ScoreInput {
  badges: number;
  hoursContributed: number;
  departmentsSupported: number;
  collaborationsCount: number;
}

export interface ScoreBreakdownRow extends ScoreComponent {
  value: number;
  /** 0–1 share of this component's target that has been reached. */
  ratio: number;
  /** How many points of the 5 this component currently contributes. */
  points: number;
}

/** Score out of 5, plus the working that produced it. */
export function computeContributionScore(input: ScoreInput): {
  score: number;
  breakdown: ScoreBreakdownRow[];
} {
  const raw: Record<ScoreComponent['key'], number> = {
    recognition: input.badges,
    impact: input.hoursContributed,
    reach: input.departmentsSupported,
    consistency: input.collaborationsCount
  };
  const breakdown = SCORE_COMPONENTS.map((c) => {
    const value = Math.max(0, Number(raw[c.key]) || 0);
    const ratio = Math.min(1, value / c.target);
    return { ...c, value, ratio, points: Math.round(ratio * c.weight * 5 * 100) / 100 };
  });
  const score = breakdown.reduce((n, b) => n + b.points, 0);
  return { score: Math.round(score * 100) / 100, breakdown };
}

/**
 * Roll a person's awarded badges — and everything else the score depends on —
 * up onto their user row.
 *
 * `badges_count` is how many badges they hold and `rating_breakdown` is the
 * count per dimension, so both are counts of real awards. `contribution_score`
 * is the 0–5 score derived from those counts plus their contribution totals.
 *
 * Lives here rather than in routes.ts because the seed needs it too, and
 * routes.ts already imports from seed.ts.
 */
export async function recomputeRecognition(userId: string): Promise<void> {
  const { rows } = await q<{ badge_id: string; n: string }>(
    `SELECT badge_id, COUNT(*)::text AS n FROM appreciations
      WHERE to_user_id = $1 AND badge_id <> '' GROUP BY badge_id`,
    [userId]
  );
  const byDimension: Record<BadgeDimension, number> = {
    helping: 0, technicalExpertise: 0, collaboration: 0, reliability: 0
  };
  let total = 0;
  for (const r of rows) {
    const badge = getBadge(r.badge_id);
    const n = parseInt(r.n, 10);
    total += n;
    if (badge) byDimension[badge.dimension] += n;
  }

  const totals = await q<{
    hours_contributed: number; departments_supported: number; collaborations_count: number;
  }>(
    `SELECT hours_contributed, departments_supported, collaborations_count
       FROM users WHERE id = $1`,
    [userId]
  );
  const t = totals.rows[0];
  const { score } = computeContributionScore({
    badges: total,
    hoursContributed: Number(t?.hours_contributed || 0),
    departmentsSupported: Number(t?.departments_supported || 0),
    collaborationsCount: Number(t?.collaborations_count || 0)
  });

  await q(
    `UPDATE users SET badges_count = $1, rating_breakdown = $2, contribution_score = $3 WHERE id = $4`,
    [total, JSON.stringify(byDimension), score, userId]
  );
}
