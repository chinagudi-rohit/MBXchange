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
 * Roll a person's badge tally onto their user row.
 *
 * `contribution_score` is deliberately NOT touched here. It is the average of
 * the 1–5 peer ratings on `appreciations`, exactly as it has always been, and
 * is maintained by the rating path alone — a badge award carries no rating,
 * so giving one does not move the score.
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
  let total = 0;
  for (const r of rows) total += parseInt(r.n, 10);
  await q(`UPDATE users SET badges_count = $1 WHERE id = $2`, [total, userId]);
}

/**
 * The original peer score: the mean of every 1–5 rating a person has been
 * given. Kept as its own routine so the rating path is the only thing that
 * ever writes contribution_score.
 */
export async function recomputeContributionScore(userId: string): Promise<void> {
  await q(
    `UPDATE users SET contribution_score = COALESCE((
       SELECT ROUND(AVG(rating)::numeric, 2) FROM appreciations
        WHERE to_user_id = $1 AND rating IS NOT NULL
     ), contribution_score) WHERE id = $1`,
    [userId]
  );
}
