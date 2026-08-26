import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { one } from './db.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'mbx-dev-secret-change-in-production';
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.warn('[auth] WARNING: JWT_SECRET is not set in production — using an insecure default.');
}

export interface TokenPayload {
  sub: string;          // authenticated user id
  actAs?: string;       // admin impersonation target user id
  iat?: number;
  exp?: number;
}

export interface AuthedRequest extends Request {
  auth: TokenPayload;
  user: any;            // effective user row (impersonated target when actAs is set)
  realUser: any;        // the actually authenticated user row
}

export function signToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

/**
 * What one colleague may see about another.
 *
 * Data minimisation: the directory exists so people can find the right person
 * and ask them for help, and everything here serves that. Fields that serve
 * only the person themselves — their contact address, who they report to,
 * their personal score, how loaded they currently are — are deliberately
 * absent and live in DIRECTORY_PRIVATE_FIELDS instead.
 *
 * Contribution totals (hours, engagements, departments) and recognition
 * (badges, tier) stay visible: they are what the leaderboard and profiles are
 * for, and they describe work done for other teams rather than anything
 * private about the person.
 */
const PUBLIC_USER_FIELDS = `
  id, name, initials, role, system_role AS "systemRole", status, department, campus,
  specialisation, experience_years AS "experienceYears", primary_skills AS "primarySkills", interests,
  available_for AS "availableFor", typical_availability AS "typicalAvailability",
  available_hours_week AS "availableHoursWeek",
  rating_breakdown AS "ratingBreakdown", badges, badges_count AS "badgesCount",
  collaborations_count AS "collaborationsCount",
  departments_supported AS "departmentsSupported", people_helped AS "peopleHelped",
  hours_contributed AS "hoursContributed", bio,
  avatar_url AS "avatarUrl", bandwidth_period AS "bandwidthPeriod",
  tier,
  (last_seen IS NOT NULL AND last_seen > now() - interval '90 seconds') AS "isOnline"
`;

/**
 * Added on top of the public set for the person themselves, their manager,
 * and administrators. `last_seen` is an exact timestamp — a presence *dot*
 * is fine for everyone, a precise "last active at" is monitoring.
 */
const DIRECTORY_PRIVATE_FIELDS = `
  email, manager_id AS "managerId",
  contribution_score AS "contributionScore",
  hours_consumed AS "hoursConsumed",
  must_change_password AS "mustChangePassword",
  last_seen AS "lastSeen"
`;

/** Everything — only ever for the signed-in user, their manager, or an admin. */
const FULL_USER_FIELDS = `${PUBLIC_USER_FIELDS}, ${DIRECTORY_PRIVATE_FIELDS}`;

export async function getUserById(id: string) {
  return one(`SELECT ${FULL_USER_FIELDS} FROM users WHERE id = $1`, [id]);
}

/**
 * True when `viewer` is entitled to the private half of `subject`'s record:
 * themselves, the manager they report to, or an administrator.
 */
export async function canSeePrivateProfile(
  viewer: { id: string; systemRole: string },
  subjectId: string
): Promise<boolean> {
  if (viewer.id === subjectId) return true;
  if (viewer.systemRole === 'admin') return true;
  const row = await one<{ manager_id: string | null }>(
    `SELECT manager_id FROM users WHERE id = $1`, [subjectId]);
  return !!row && row.manager_id === viewer.id;
}

export { PUBLIC_USER_FIELDS, DIRECTORY_PRIVATE_FIELDS, FULL_USER_FIELDS };

export function requireAuth() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Authentication required' });
    try {
      const payload = verifyToken(token);
      const realUser = await getUserById(payload.sub);
      if (!realUser || realUser.status !== 'active') {
        return res.status(401).json({ error: 'Account not found or inactive' });
      }
      let user = realUser;
      if (payload.actAs) {
        if (realUser.systemRole !== 'admin') {
          return res.status(403).json({ error: 'Impersonation requires admin' });
        }
        const target = await getUserById(payload.actAs);
        if (!target) return res.status(404).json({ error: 'Impersonation target not found' });
        user = target;
      }
      (req as AuthedRequest).auth = payload;
      (req as AuthedRequest).user = user;
      (req as AuthedRequest).realUser = realUser;
      next();
    } catch {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }
  };
}

export function requireRole(...roles: Array<'employee' | 'manager' | 'admin'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { user } = req as AuthedRequest;
    if (!user || !roles.includes(user.systemRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

/** Admin check against the REAL authenticated user (ignores impersonation). */
export function requireRealAdmin() {
  return (req: Request, res: Response, next: NextFunction) => {
    const { realUser } = req as AuthedRequest;
    if (!realUser || realUser.systemRole !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  };
}

export function generateTempPassword(): string {
  const words = ['Star', 'Drive', 'Benz', 'Silver', 'Arrow', 'Torque', 'Volt', 'Apex'];
  const w = words[Math.floor(Math.random() * words.length)];
  const n = Math.floor(1000 + Math.random() * 9000);
  const sym = ['!', '@', '#', '$'][Math.floor(Math.random() * 4)];
  return `${w}${sym}${n}`;
}
