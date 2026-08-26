/**
 * Recognition configuration — badges and tiers — read from the database.
 *
 * Both used to be constants compiled into the server. An administrator now
 * owns them: adding a badge, rewording one, renaming a tier or retuning the
 * thresholds is a data change, not a deploy.
 *
 * Everything here is cached in-process and invalidated on write, because the
 * tier ladder is consulted on every contribution recompute and the badge list
 * on every award.
 */

import { q, one } from './db.ts';

export type BadgeDimension = 'helping' | 'technicalExpertise' | 'collaboration' | 'reliability';

export const BADGE_DIMENSIONS: Record<BadgeDimension, string> = {
  helping: 'Helping & mentorship',
  technicalExpertise: 'Technical expertise',
  collaboration: 'Cross-team collaboration',
  reliability: 'Reliability & follow-through'
};

export interface BadgeDef {
  id: string;
  name: string;
  icon: string;
  description: string;
  dimension: BadgeDimension;
  criteria: string;
  active: boolean;
  sortOrder: number;
}

export interface TierDef {
  id: string;
  name: string;
  artifact: string;
  icon: string;
  blurb: string;
  minPoints: number;
  sortOrder: number;
  active: boolean;
}

export interface TierSettings {
  hoursWeight: number;
  contributionsWeight: number;
  hoursTarget: number;
  contributionsTarget: number;
}

let badgeCache: BadgeDef[] | null = null;
let tierCache: TierDef[] | null = null;
let settingsCache: TierSettings | null = null;

export function invalidateRecognitionCache(): void {
  badgeCache = null;
  tierCache = null;
  settingsCache = null;
}

export async function getBadgeDefs(includeInactive = false): Promise<BadgeDef[]> {
  if (!badgeCache) {
    const { rows } = await q<any>(
      `SELECT id, name, icon, description, dimension, criteria, active,
              sort_order AS "sortOrder"
         FROM badge_definitions ORDER BY sort_order, name`
    );
    badgeCache = rows;
  }
  return includeInactive ? badgeCache! : badgeCache!.filter((b) => b.active);
}

export async function getBadgeDef(id: string): Promise<BadgeDef | undefined> {
  return (await getBadgeDefs(true)).find((b) => b.id === id);
}

/** Only an active badge may be awarded; a retired one still renders on history. */
export async function isAwardableBadge(id: unknown): Promise<boolean> {
  if (typeof id !== 'string') return false;
  return (await getBadgeDefs()).some((b) => b.id === id);
}

export async function getTierDefs(includeInactive = false): Promise<TierDef[]> {
  if (!tierCache) {
    const { rows } = await q<any>(
      `SELECT id, name, artifact, icon, blurb, min_points AS "minPoints",
              sort_order AS "sortOrder", active
         FROM tier_definitions ORDER BY sort_order, min_points`
    );
    tierCache = rows.map((r: any) => ({ ...r, minPoints: Number(r.minPoints) }));
  }
  return includeInactive ? tierCache! : tierCache!.filter((t) => t.active);
}

export async function getTierSettings(): Promise<TierSettings> {
  if (!settingsCache) {
    const r = await one<any>(
      `SELECT hours_weight AS "hoursWeight", contributions_weight AS "contributionsWeight",
              hours_target AS "hoursTarget", contributions_target AS "contributionsTarget"
         FROM tier_settings WHERE id = 1`
    );
    settingsCache = r
      ? {
          hoursWeight: Number(r.hoursWeight),
          contributionsWeight: Number(r.contributionsWeight),
          hoursTarget: Number(r.hoursTarget),
          contributionsTarget: Number(r.contributionsTarget)
        }
      : { hoursWeight: 0.6, contributionsWeight: 0.4, hoursTarget: 250, contributionsTarget: 25 };
  }
  return settingsCache!;
}

export interface TierInput {
  hoursContributed: number;
  collaborationsCount: number;
}

/**
 * Tier points, out of 100.
 *
 * Hours answer "how much did they give" and contribution count answers "how
 * often did they show up" — two different things, so each gets its own
 * weight and its own saturation target rather than being added together
 * raw. An admin owns all four numbers.
 */
export function tierPoints(input: TierInput, st: TierSettings): {
  points: number;
  hoursRatio: number;
  contributionsRatio: number;
} {
  const hoursRatio = st.hoursTarget > 0
    ? Math.min(1, Math.max(0, input.hoursContributed) / st.hoursTarget) : 0;
  const contributionsRatio = st.contributionsTarget > 0
    ? Math.min(1, Math.max(0, input.collaborationsCount) / st.contributionsTarget) : 0;
  const wSum = st.hoursWeight + st.contributionsWeight;
  // Normalising by the weight sum keeps the score on 0–100 even if an admin
  // enters weights that do not add to 1.
  const points = wSum > 0
    ? ((hoursRatio * st.hoursWeight + contributionsRatio * st.contributionsWeight) / wSum) * 100
    : 0;
  return { points: Math.round(points * 100) / 100, hoursRatio, contributionsRatio };
}

/** The highest tier whose threshold the input clears. */
export async function computeTierFromDb(input: TierInput): Promise<{
  tier: TierDef; points: number; next: TierDef | null; toNext: number;
}> {
  const [tiers, st] = await Promise.all([getTierDefs(), getTierSettings()]);
  const ladder = [...tiers].sort((a, b) => a.minPoints - b.minPoints);
  const { points } = tierPoints(input, st);

  const fallback: TierDef = {
    id: 'unranked', name: 'Contributor', artifact: 'octahedron', icon: '◇',
    blurb: 'Getting started on the exchange', minPoints: 0, sortOrder: 0, active: true
  };
  let earned = ladder[0] || fallback;
  for (const t of ladder) if (points >= t.minPoints) earned = t;

  const next = ladder.find((t) => t.minPoints > points) || null;
  return { tier: earned, points, next, toNext: next ? Math.round((next.minPoints - points) * 100) / 100 : 0 };
}
