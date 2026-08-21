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

const PUBLIC_USER_FIELDS = `
  id, email, name, initials, role, system_role AS "systemRole", status, department, campus,
  specialisation, experience_years AS "experienceYears", primary_skills AS "primarySkills", interests,
  available_for AS "availableFor", typical_availability AS "typicalAvailability",
  available_hours_week AS "availableHoursWeek", contribution_score AS "contributionScore",
  rating_breakdown AS "ratingBreakdown", badges, collaborations_count AS "collaborationsCount",
  departments_supported AS "departmentsSupported", people_helped AS "peopleHelped",
  hours_contributed AS "hoursContributed", bio, manager_id AS "managerId",
  must_change_password AS "mustChangePassword"
`;

export async function getUserById(id: string) {
  return one(`SELECT ${PUBLIC_USER_FIELDS} FROM users WHERE id = $1`, [id]);
}

export { PUBLIC_USER_FIELDS };

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
