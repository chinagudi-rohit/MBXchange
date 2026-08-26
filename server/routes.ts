import { Router, type Response } from 'express';
import bcrypt from 'bcryptjs';
import { q, one, newId } from './db.ts';
import {
  requireAuth, requireRole, requireRealAdmin, signToken,
  getUserById, generateTempPassword, PUBLIC_USER_FIELDS, type AuthedRequest
} from './auth.ts';
import {
  computeRecommendation, parseHoursRange, computeTier, nextTierProgress, TIERS,
  computeMatch, remainingBandwidth, type MatchResult
} from './rules.ts';
import { SEED_USER_PASSWORD, SEED_ADMIN_PASSWORD } from './seed.ts';
import {
  AWARD_BADGES, BADGE_DIMENSIONS, getBadge, isBadgeId, recomputeRecognition,
  computeContributionScore
} from './badges.ts';

export const api = Router();

const WORK_STATUSES = ['Open', 'In Progress', 'Completed', 'Cancelled'];

async function audit(actorId: string | null, action: string, subject: string, detail: object = {}) {
  await q(`INSERT INTO audit_log (id, actor_id, action, subject, detail) VALUES ($1,$2,$3,$4,$5)`,
    [newId('aud'), actorId, action, subject, JSON.stringify(detail)]);
}

async function notify(recipientId: string | null, recipientRole: string | null, type: string,
  title: string, description: string, targetTab?: string, targetId?: string) {
  await q(
    `INSERT INTO notifications (id, recipient_id, recipient_role, type, title, description, target_tab, target_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [newId('n'), recipientId, recipientRole, type, title, description, targetTab || null, targetId || null]
  );
}

/**
 * Hours an applicant has tied up in work that has not finished yet.
 *
 * Applications on a Completed requirement are excluded: those hours were
 * already settled into `hours_consumed` when the post completed, and counting
 * them here as well would charge the same work against capacity twice.
 */
async function committedHours(applicantId: string, excludeAppId?: string): Promise<number> {
  const { rows } = await q(
    `SELECT a.commitment
       FROM applications a
       JOIN work_posts p ON p.id = a.post_id
      WHERE a.applicant_id = $1
        AND a.status IN ('pending_author','pending_manager','awaiting_registration','approved')
        AND p.status NOT IN ('Completed','Cancelled')
        AND ($2::text IS NULL OR a.id <> $2)`,
    [applicantId, excludeAppId || null]
  );
  return rows.reduce((sum, r) => sum + parseHoursRange(r.commitment || '')[1], 0);
}

/**
 * Settle a requirement's approved applications against everyone's bandwidth.
 *
 * Hours move out of declared capacity and into contribution totals, tiers are
 * recomputed, and each movement is written to the ledger so it can be reversed
 * if the post is reopened. The unique index on (application_id, kind) makes this
 * idempotent — completing an already-completed post is a no-op.
 */
async function settleCompletion(post: any, reverse = false): Promise<void> {
  const { rows: apps } = await q(
    `SELECT a.id, a.applicant_id, a.commitment, u.name
       FROM applications a JOIN users u ON u.id = a.applicant_id
      WHERE a.post_id = $1 AND a.status = 'approved'`,
    [post.id]
  );

  for (const app of apps) {
    // What the person actually signed up for, falling back to the post's estimate.
    const [, hi] = parseHoursRange(app.commitment || post.effort_hours || '');
    const hours = hi || 0;
    if (hours <= 0) continue;

    if (!reverse) {
      const existing = await one(
        `SELECT id FROM bandwidth_ledger WHERE application_id = $1 AND kind = 'consumed'`, [app.id]
      );
      if (existing) continue;

      await q(
        `INSERT INTO bandwidth_ledger (id, user_id, application_id, post_id, hours, kind, note)
         VALUES ($1,$2,$3,$4,$5,'consumed',$6)`,
        [newId('bl'), app.applicant_id, app.id, post.id, hours, `Completed "${post.title.slice(0, 60)}"`]
      );
      await q(
        `UPDATE users SET
           hours_consumed = hours_consumed + $1,
           hours_contributed = hours_contributed + $1,
           collaborations_count = collaborations_count + 1,
           departments_supported = (
             SELECT COUNT(DISTINCT wp.department) FROM applications a2
               JOIN work_posts wp ON wp.id = a2.post_id
              WHERE a2.applicant_id = $2 AND a2.status = 'approved' AND wp.status = 'Completed'
           )
         WHERE id = $2`,
        [hours, app.applicant_id]
      );
      await notify(app.applicant_id, null, 'feedback_received', 'Engagement completed',
        `"${post.title.slice(0, 50)}" is done. ${hours}h moved from your available bandwidth into your contribution total.`,
        'requests', post.id);

      // The manager who approved the time should know it was delivered — they
      // signed off the capacity and it now reads differently on their team's load.
      const helper = await one(`SELECT manager_id, name FROM users WHERE id = $1`, [app.applicant_id]);
      if (helper?.manager_id) {
        await notify(helper.manager_id, null, 'feedback_received', `${helper.name} completed an engagement`,
          `${hours}h on "${post.title.slice(0, 50)}" is finished and back in their available bandwidth. You can recognise the work from the requirement.`,
          'manager', post.id);
      }
    } else {
      const led = await one(
        `SELECT id, hours FROM bandwidth_ledger WHERE application_id = $1 AND kind = 'consumed'`, [app.id]
      );
      if (!led) continue;
      const back = Number(led.hours);
      await q(`DELETE FROM bandwidth_ledger WHERE id = $1`, [led.id]);
      await q(
        `UPDATE users SET
           hours_consumed = GREATEST(0, hours_consumed - $1),
           hours_contributed = GREATEST(0, hours_contributed - $1),
           collaborations_count = GREATEST(0, collaborations_count - 1)
         WHERE id = $2`,
        [back, app.applicant_id]
      );
    }

    await refreshTier(app.applicant_id);
  }
}

/** Recompute and persist a user's earned tier; notify them if it moved up. */
async function refreshTier(userId: string): Promise<void> {
  const u = await one(
    `SELECT id, tier, hours_contributed, collaborations_count, departments_supported FROM users WHERE id = $1`,
    [userId]
  );
  if (!u) return;
  const earned = computeTier({
    hoursContributed: Number(u.hours_contributed || 0),
    collaborationsCount: Number(u.collaborations_count || 0),
    departmentsSupported: Number(u.departments_supported || 0)
  });
  // The score leans on the same totals the tier does, so it is refreshed
  // here too rather than only when a badge is awarded.
  await recomputeRecognition(userId);
  if (earned.name === u.tier) return;
  const climbed = TIERS.findIndex((t) => t.name === earned.name) > TIERS.findIndex((t) => t.name === u.tier);
  await q(`UPDATE users SET tier = $1 WHERE id = $2`, [earned.name, userId]);
  if (climbed) {
    await notify(userId, null, 'feedback_received', `New tier reached: ${earned.name}`,
      `${earned.icon} You are now a ${earned.name} — ${earned.blurb}.`, 'insights', null);
  }
}


/**
 * Build a match scorer bound to one user, so a list of posts can be scored
 * without re-reading the user or their commitments per row.
 */
async function matcherFor(userId: string) {
  const me = await one(`SELECT * FROM users WHERE id = $1`, [userId]);
  const committed = await committedHours(userId);
  const remaining = remainingBandwidth(
    Number(me?.available_hours_week || 0),
    Number(me?.hours_consumed || 0),
    committed
  );
  const stack: string[] = [
    ...(me?.primary_skills || []),
    ...(me?.interests || []),
    ...(me?.specialisation ? [me.specialisation] : [])
  ];
  const configured = stack.filter(Boolean).length > 0;

  return {
    configured,
    remaining,
    score(post: any): MatchResult {
      return computeMatch({
        stack,
        userDepartment: me?.department || '',
        remainingHours: remaining,
        postTags: post.tags || [],
        postTitle: post.title || '',
        postDepartment: post.department || '',
        effortMin: Number(post.effortMin ?? post.effort_min ?? 0),
        effortMax: Number(post.effortMax ?? post.effort_max ?? 0)
      });
    }
  };
}

async function recommendFor(applicant: any, post: any, excludeAppId?: string) {
  const committed = await committedHours(applicant.id, excludeAppId);
  return computeRecommendation({
    applicantName: applicant.name,
    availableHoursWeek: applicant.available_hours_week ?? applicant.availableHoursWeek ?? 0,
    typicalAvailability: applicant.typical_availability ?? applicant.typicalAvailability ?? '',
    committedHours: committed,
    consumedHours: Number(applicant.hours_consumed ?? applicant.hoursConsumed ?? 0),
    bandwidthPeriod: (applicant.bandwidth_period ?? applicant.bandwidthPeriod ?? 'week') as 'week' | 'month',
    effortMin: post.effort_min,
    effortMax: post.effort_max,
    effortText: post.effort_hours,
    postTitle: post.title,
    postDepartment: post.department,
    applicantSkills: applicant.primary_skills ?? applicant.primarySkills ?? [],
    postTags: post.tags || []
  });
}

/**
 * Fills in behind every path that can approve an application: once every
 * seat on an Open post is taken, the post itself moves to In Progress
 * automatically rather than sitting Open with no room left to apply.
 * A no-op for posts an admin already moved on manually (In Progress,
 * Completed, Cancelled) or that still have room.
 */
async function advancePostIfFull(postId: string): Promise<void> {
  const post = await one<{ id: string; status: string; seats: number }>(
    `SELECT id, status, seats FROM work_posts WHERE id = $1`, [postId]
  );
  if (!post || post.status !== 'Open') return;
  const filled = await one<{ n: string }>(
    `SELECT COUNT(*)::text AS n FROM applications WHERE post_id = $1 AND status = 'approved'`, [postId]
  );
  if (parseInt(filled?.n || '0', 10) >= post.seats) {
    await q(`UPDATE work_posts SET status = 'In Progress' WHERE id = $1`, [postId]);
  }
}

// ============================== AUTH ==============================

api.post('/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  const row = await one(`SELECT * FROM users WHERE lower(email) = lower($1)`, [String(email).trim()]);
  if (!row || row.status !== 'active') return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(String(password), row.password_hash);
  if (!ok) {
    await audit(row.id, 'login_failed', row.email);
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  await audit(row.id, 'login', row.email);
  const token = signToken({ sub: row.id });
  const user = await getUserById(row.id);
  res.json({ token, user });
});

/**
 * Live roster for the pilot sign-in picker, so testers can jump into any account
 * without a hardcoded list going stale as users are added or deactivated.
 *
 * This is unauthenticated and exposes names and email addresses, so it is gated
 * behind DEMO_ACCOUNTS and must be turned off for a real rollout. It never
 * returns password hashes; the picker fills in the seed password by convention,
 * and admin-created accounts still need their one-time password typed in.
 */
api.get('/auth/demo-accounts', async (_req, res) => {
  if (process.env.DEMO_ACCOUNTS === 'false') {
    return res.status(404).json({ error: 'Not available' });
  }
  const { rows } = await q(
    `SELECT u.id, u.name, u.email, u.role, u.system_role AS "systemRole", u.department,
            u.initials, u.must_change_password AS "mustChangePassword",
            m.name AS "managerName"
       FROM users u
       LEFT JOIN users m ON m.id = u.manager_id
      WHERE u.status = 'active'
      ORDER BY CASE u.system_role WHEN 'admin' THEN 0 WHEN 'manager' THEN 1 ELSE 2 END, u.name`
  );
  res.json({
    accounts: rows,
    defaultPasswords: { admin: SEED_ADMIN_PASSWORD, user: SEED_USER_PASSWORD }
  });
});

api.post('/auth/change-password', requireAuth(), async (req, res) => {
  const { user, realUser } = req as AuthedRequest;
  if (user.id !== realUser.id) return res.status(403).json({ error: 'Cannot change password while impersonating' });
  const { currentPassword, newPassword } = req.body || {};
  if (!newPassword || String(newPassword).length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters' });
  }
  const row = await one(`SELECT password_hash FROM users WHERE id = $1`, [user.id]);
  const ok = await bcrypt.compare(String(currentPassword || ''), row.password_hash);
  if (!ok) return res.status(401).json({ error: 'Current password is incorrect' });
  const hash = await bcrypt.hash(String(newPassword), 10);
  await q(`UPDATE users SET password_hash = $1, must_change_password = FALSE, updated_at = now() WHERE id = $2`, [hash, user.id]);
  await audit(user.id, 'password_changed', user.email);
  res.json({ ok: true });
});

api.post('/auth/impersonate', requireAuth(), requireRealAdmin(), async (req, res) => {
  const { realUser } = req as AuthedRequest;
  const { userId } = req.body || {};
  const target = await getUserById(userId);
  if (!target) return res.status(404).json({ error: 'User not found' });
  await audit(realUser.id, 'impersonate_start', target.email, { targetId: target.id });
  const token = signToken({ sub: realUser.id, actAs: target.id });
  res.json({ token, user: target, impersonating: true });
});

api.post('/auth/stop-impersonation', requireAuth(), async (req, res) => {
  const { realUser } = req as AuthedRequest;
  await audit(realUser.id, 'impersonate_stop', realUser.email);
  const token = signToken({ sub: realUser.id });
  res.json({ token, user: realUser });
});

api.get('/me', requireAuth(), async (req, res) => {
  const { user, realUser, auth } = req as AuthedRequest;
  res.json({ user, impersonating: !!auth.actAs, realUser: auth.actAs ? { id: realUser.id, name: realUser.name } : undefined });
});

api.patch('/me', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  const {
    bio, typicalAvailability, availableHoursWeek, primarySkills, interests,
    availableFor, campus, specialisation, avatarUrl, bandwidthPeriod
  } = req.body || {};

  if (bandwidthPeriod && !['week', 'month'].includes(bandwidthPeriod)) {
    return res.status(400).json({ error: 'bandwidthPeriod must be week or month' });
  }
  // Photos arrive as a client-compressed data URL. Cap the size so a stray
  // upload cannot bloat the row — the client targets roughly 40 KB.
  if (avatarUrl && typeof avatarUrl === 'string') {
    if (avatarUrl.length > 400_000) {
      return res.status(400).json({ error: 'Image is too large — please choose a smaller photo' });
    }
    if (avatarUrl && !/^data:image\/(png|jpeg|jpg|webp);base64,/.test(avatarUrl)) {
      return res.status(400).json({ error: 'Unsupported image format' });
    }
  }

  await q(
    `UPDATE users SET
      bio = COALESCE($1, bio),
      typical_availability = COALESCE($2, typical_availability),
      available_hours_week = COALESCE($3, available_hours_week),
      primary_skills = COALESCE($4, primary_skills),
      interests = COALESCE($5, interests),
      available_for = COALESCE($6, available_for),
      campus = COALESCE($7, campus),
      specialisation = COALESCE($8, specialisation),
      avatar_url = COALESCE($9, avatar_url),
      bandwidth_period = COALESCE($10, bandwidth_period),
      updated_at = now()
     WHERE id = $11`,
    [
      bio ?? null, typicalAvailability ?? null,
      availableHoursWeek != null ? Number(availableHoursWeek) : null,
      primarySkills ? JSON.stringify(primarySkills) : null,
      interests ? JSON.stringify(interests) : null,
      availableFor ? JSON.stringify(availableFor) : null,
      campus ?? null, specialisation ?? null,
      avatarUrl ?? null, bandwidthPeriod ?? null, user.id
    ]
  );
  res.json({ user: await getUserById(user.id) });
});

// ============================== USERS ==============================

api.get('/users', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  // Admins need to see deactivated accounts to reactivate them; everyone else
  // only ever sees colleagues they can actually work with.
  const includeInactive = req.query.includeInactive === 'true' && user.systemRole === 'admin';
  const { rows } = await q(
    `SELECT ${PUBLIC_USER_FIELDS} FROM users
      WHERE ($1::boolean OR status = 'active')
      ORDER BY name`,
    [includeInactive]
  );
  res.json({ users: rows });
});

api.post('/users', requireAuth(), requireRealAdmin(), async (req, res) => {
  const { realUser } = req as AuthedRequest;
  const { name, email, role, systemRole, department, campus, managerId, typicalAvailability, availableHoursWeek, primarySkills } = req.body || {};
  if (!name || !email || !department) return res.status(400).json({ error: 'name, email and department are required' });
  const existing = await one(`SELECT id FROM users WHERE lower(email) = lower($1)`, [email]);
  if (existing) return res.status(409).json({ error: 'A user with this email already exists' });
  if (managerId) {
    const mgr = await getUserById(managerId);
    if (!mgr) return res.status(400).json({ error: 'Selected manager does not exist' });
  }
  const tempPassword = generateTempPassword();
  const hash = await bcrypt.hash(tempPassword, 10);
  const id = newId('usr');
  const initials = String(name).split(/\s+/).map((p: string) => p[0]).join('').slice(0, 2).toUpperCase();
  await q(
    `INSERT INTO users (id, email, name, initials, role, system_role, department, campus,
      typical_availability, available_hours_week, primary_skills, manager_id, password_hash, must_change_password)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,TRUE)`,
    [
      id, email, name, initials, role || 'Employee', systemRole || 'employee', department, campus || '',
      typicalAvailability || '', Number(availableHoursWeek) || 0,
      JSON.stringify(primarySkills || []), managerId || null, hash
    ]
  );
  await audit(realUser.id, 'user_created', email, { id, systemRole: systemRole || 'employee' });
  res.status(201).json({ user: await getUserById(id), tempPassword });
});

api.patch('/users/:id', requireAuth(), requireRealAdmin(), async (req, res) => {
  const { realUser } = req as AuthedRequest;
  const target = await getUserById(req.params.id);
  if (!target) return res.status(404).json({ error: 'User not found' });
  const { role, systemRole, department, campus, managerId, status } = req.body || {};
  await q(
    `UPDATE users SET
      role = COALESCE($1, role), system_role = COALESCE($2, system_role),
      department = COALESCE($3, department), campus = COALESCE($4, campus),
      manager_id = COALESCE($5, manager_id), status = COALESCE($6, status), updated_at = now()
     WHERE id = $7`,
    [role ?? null, systemRole ?? null, department ?? null, campus ?? null, managerId ?? null, status ?? null, req.params.id]
  );
  await audit(realUser.id, 'user_updated', target.email, req.body);
  res.json({ user: await getUserById(req.params.id) });
});

api.post('/users/:id/reset-password', requireAuth(), requireRealAdmin(), async (req, res) => {
  const { realUser } = req as AuthedRequest;
  const target = await getUserById(req.params.id);
  if (!target) return res.status(404).json({ error: 'User not found' });
  const tempPassword = generateTempPassword();
  const hash = await bcrypt.hash(tempPassword, 10);
  await q(`UPDATE users SET password_hash = $1, must_change_password = TRUE, updated_at = now() WHERE id = $2`, [hash, req.params.id]);
  await audit(realUser.id, 'password_reset', target.email);
  res.json({ tempPassword });
});

// ============================== WORK POSTS ==============================

const POST_SELECT = `
  p.id, p.title, p.department, p.team, p.status, p.urgency, p.duration,
  p.effort_hours AS "effortHours", p.effort_min AS "effortMin", p.effort_max AS "effortMax",
  p.location, p.approval_required AS "approvalRequired", p.seats, p.tags,
  p.author_id AS "authorId", p.author_name AS "authorName", p.author_role AS "authorRole",
  p.author_initials AS "authorInitials", p.description, p.why_opportunity AS "whyOpportunity",
  p.edited_at AS "editedAt", p.created_at AS "createdAt",
  (SELECT COUNT(*)::int FROM applications a WHERE a.post_id = p.id AND a.status = 'approved') AS "seatsFilled",
  (SELECT COUNT(*)::int FROM work_comments c WHERE c.post_id = p.id) AS "commentCount"
`;

api.get('/work-posts', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  const { rows } = await q(`SELECT ${POST_SELECT} FROM work_posts p ORDER BY p.created_at DESC`);
  const { rows: mine } = await q(
    `SELECT id, post_id AS "postId", status FROM applications WHERE applicant_id = $1 AND status NOT IN ('withdrawn')`,
    [user.id]
  );
  const mineByPost = new Map(mine.map((a: any) => [a.postId, a]));
  const matcher = await matcherFor(user.id);
  res.json({
    posts: rows.map((p: any) => {
      // Only score what you could actually take on: an open requirement, with a
      // seat free, that you did not post yourself. Anything else has no fit to
      // report, and scoring it would push finished work up a "best match" sort.
      const applicable = p.authorId !== user.id && p.status === 'Open' && p.seatsFilled < p.seats;
      const m = applicable ? matcher.score(p) : null;
      return {
        ...p,
        myApplication: mineByPost.get(p.id) || null,
        matchScore: m?.score ?? null,
        skillFit: m?.skillFit ?? null,
        capacityFit: m?.capacityFit ?? null,
        matchedSkills: m?.matchedSkills ?? [],
        crossDepartment: m?.crossDepartment ?? false,
        matchReason: m?.reason ?? null
      };
    }),
    stackConfigured: matcher.configured
  });
});

api.post('/work-posts', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  const b = req.body || {};
  if (!b.title || !b.description) return res.status(400).json({ error: 'Title and description are required' });
  const id = newId('wp');
  const [effMin, effMax] = parseHoursRange(b.effortHours || '');
  await q(
    `INSERT INTO work_posts (id, title, department, team, status, urgency, duration, effort_hours,
      effort_min, effort_max, location, approval_required, seats, tags, author_id, author_name, author_role,
      author_initials, description, why_opportunity)
     VALUES ($1,$2,$3,$4,'Open',$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
    [
      id, b.title, b.department || user.department, b.team || '', b.urgency || 'Medium',
      b.duration || '', b.effortHours || '', effMin, effMax, b.location || 'Remote / Hybrid',
      b.approvalRequired ?? true, Math.max(1, Number(b.seats) || 1), JSON.stringify(b.tags || []),
      user.id, user.name, user.role, user.initials, b.description, b.whyOpportunity || ''
    ]
  );
  const post = await one(`SELECT ${POST_SELECT} FROM work_posts p WHERE p.id = $1`, [id]);
  res.status(201).json({ post });
});

api.get('/work-posts/:id', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  const post = await one(`SELECT ${POST_SELECT} FROM work_posts p WHERE p.id = $1`, [req.params.id]);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  const { rows: comments } = await q(
    `SELECT c.id, c.text, c.created_at AS "createdAt", u.name AS "authorName", u.role AS "authorRole", u.initials AS "authorInitials"
     FROM work_comments c JOIN users u ON u.id = c.author_id WHERE c.post_id = $1 ORDER BY c.created_at`,
    [req.params.id]
  );
  const isPrivileged = user.id === post.authorId || user.systemRole !== 'employee';
  let applications: any[] = [];
  if (isPrivileged) {
    const { rows } = await q(
      `SELECT a.id, a.status, a.commitment, a.note, a.ai_recommendation AS "aiRecommendation",
        a.created_at AS "createdAt", u.name AS "applicantName", u.initials AS "applicantInitials", u.department
       FROM applications a JOIN users u ON u.id = a.applicant_id WHERE a.post_id = $1 ORDER BY a.created_at DESC`,
      [req.params.id]
    );
    applications = rows;
  }
  const myApp = await one(
    `SELECT id, status, note, commitment FROM applications WHERE post_id = $1 AND applicant_id = $2 AND status <> 'withdrawn'`,
    [req.params.id, user.id]
  );
  const matcher = await matcherFor(user.id);
  const applicable = post.authorId !== user.id && post.status === 'Open' && post.seatsFilled < post.seats;
  const m = applicable ? matcher.score(post) : null;
  res.json({
    post: {
      ...post,
      matchScore: m?.score ?? null,
      skillFit: m?.skillFit ?? null,
      capacityFit: m?.capacityFit ?? null,
      matchedSkills: m?.matchedSkills ?? [],
      crossDepartment: m?.crossDepartment ?? false,
      matchReason: m?.reason ?? null
    },
    comments, applications,
    myApplication: myApp || null,
    remainingHours: matcher.remaining
  });
});

api.patch('/work-posts/:id', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  const post = await one(`SELECT * FROM work_posts WHERE id = $1`, [req.params.id]);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (post.author_id !== user.id && user.systemRole !== 'admin') {
    return res.status(403).json({ error: 'Only the author can update this post' });
  }
  const b = req.body || {};
  if (b.status && !WORK_STATUSES.includes(b.status)) {
    return res.status(400).json({ error: `Status must be one of ${WORK_STATUSES.join(', ')}` });
  }
  const [effMin, effMax] = b.effortHours ? parseHoursRange(b.effortHours) : [post.effort_min, post.effort_max];
  await q(
    `UPDATE work_posts SET
      title = COALESCE($1, title), description = COALESCE($2, description),
      why_opportunity = COALESCE($3, why_opportunity), urgency = COALESCE($4, urgency),
      duration = COALESCE($5, duration), effort_hours = COALESCE($6, effort_hours),
      effort_min = $7, effort_max = $8, location = COALESCE($9, location),
      seats = COALESCE($10, seats), tags = COALESCE($11, tags), status = COALESCE($12, status),
      edited_at = CASE WHEN $13 THEN now() ELSE edited_at END
     WHERE id = $14`,
    [
      b.title ?? null, b.description ?? null, b.whyOpportunity ?? null, b.urgency ?? null,
      b.duration ?? null, b.effortHours ?? null, effMin, effMax, b.location ?? null,
      b.seats != null ? Math.max(1, Number(b.seats)) : null, b.tags ? JSON.stringify(b.tags) : null,
      b.status ?? null,
      !!(b.title || b.description || b.effortHours || b.seats), req.params.id
    ]
  );
  // Completing the requirement is what actually spends everyone's bandwidth.
  // Moving it back out of Completed returns those hours.
  if (b.status && b.status !== post.status) {
    if (b.status === 'Completed') {
      await settleCompletion({ ...post, title: b.title ?? post.title }, false);
    } else if (post.status === 'Completed') {
      await settleCompletion(post, true);
    }
  }

  const updated = await one(`SELECT ${POST_SELECT} FROM work_posts p WHERE p.id = $1`, [req.params.id]);
  res.json({ post: updated });
});

api.post('/work-posts/:id/comments', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  const { text } = req.body || {};
  if (!text) return res.status(400).json({ error: 'Comment text required' });
  const post = await one(`SELECT id, title, author_id FROM work_posts WHERE id = $1`, [req.params.id]);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  const id = newId('c');
  await q(`INSERT INTO work_comments (id, post_id, author_id, text) VALUES ($1,$2,$3,$4)`, [id, req.params.id, user.id, text]);
  if (post.author_id && post.author_id !== user.id) {
    await notify(post.author_id, null, 'reply', `New reply on "${post.title.slice(0, 50)}"`, `${user.name}: ${String(text).slice(0, 80)}`, 'work', post.id);
  }
  res.status(201).json({ ok: true });
});

// ---- Apply (self + optional colleagues; each routed to their own manager) ----

api.post('/work-posts/:id/apply', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  const post = await one(`SELECT * FROM work_posts WHERE id = $1`, [req.params.id]);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (post.status !== 'Open') return res.status(400).json({ error: 'This opportunity is not open for applications' });
  if (post.author_id === user.id) {
    return res.status(400).json({ error: 'You cannot apply to a requirement you posted yourself' });
  }

  // You apply for yourself. Nominating colleagues was removed — an application
  // is a commitment of your own time, and only you can make it.
  const { note = '' } = req.body || {};
  const memberIds: string[] = [user.id];

  const groupId = newId('grp');
  const results: any[] = [];

  for (const memberId of memberIds) {
    const member = await one(`SELECT * FROM users WHERE id = $1 AND status = 'active'`, [memberId]);
    if (!member) { results.push({ userId: memberId, error: 'User not found' }); continue; }
    const dup = await one(`SELECT id FROM applications WHERE post_id = $1 AND applicant_id = $2 AND status <> 'withdrawn'`, [post.id, memberId]);
    if (dup) { results.push({ userId: memberId, error: `${member.name} has already applied` }); continue; }

    const appId = newId('app');
    const needsApproval = post.approval_required;

    if (!needsApproval) {
      const rec = await recommendFor(member, post);
      await q(
        `INSERT INTO applications (id, post_id, group_id, applicant_id, submitted_by, manager_id, note, commitment, status, ai_recommendation, ai_reason, decided_at)
         VALUES ($1,$2,$3,$4,$5,NULL,$6,$7,'approved',$8,$9, now())`,
        [appId, post.id, groupId, memberId, user.id, note, post.effort_hours, rec.verdict, rec.reason]
      );
      if (post.author_id && post.author_id !== memberId) {
        await notify(post.author_id, null, 'help_offer', 'Support Offer Received', `${member.name} offered to support "${post.title.slice(0, 50)}".`, 'work', post.id);
      }
      await advancePostIfFull(post.id);
      results.push({ userId: memberId, applicationId: appId, status: 'approved' });
      continue;
    }

    // First decision always goes to the post's own author — anyone who has
    // posted a requirement can have applicants, not only managers. The
    // applicant's manager only enters once the author has said yes (see
    // POST /approvals/:id/decision), so there is nothing to check about
    // manager registration here.
    await q(
      `INSERT INTO applications (id, post_id, group_id, applicant_id, submitted_by, manager_id, note, commitment, status)
       VALUES ($1,$2,$3,$4,$5,NULL,$6,$7,'pending_author')`,
      [appId, post.id, groupId, memberId, user.id, note, post.effort_hours]
    );
    if (post.author_id) {
      await notify(post.author_id, null, 'help_offer', `Application Received: ${member.name}`,
        `${member.name} applied to support "${post.title.slice(0, 60)}" (${post.effort_hours || post.duration}).`, 'work', appId);
    }
    results.push({ userId: memberId, applicationId: appId, status: 'pending_author' });
  }

  res.status(201).json({ groupId, results });
});

// ============================== APPLICATIONS ==============================

const APP_SELECT = `
  a.id, a.post_id AS "postId", a.group_id AS "groupId", a.applicant_id AS "applicantId",
  a.submitted_by AS "submittedBy", a.manager_id AS "managerId", a.note, a.commitment, a.status,
  a.ai_recommendation AS "aiRecommendation", a.ai_reason AS "aiReason", a.manager_notes AS "managerNotes",
  a.edited_at AS "editedAt", a.decided_at AS "decidedAt", a.created_at AS "createdAt",
  p.title AS "postTitle", p.department AS "postDepartment", p.status AS "postStatus",
  p.effort_hours AS "postEffort", p.duration AS "postDuration",
  ap.name AS "applicantName", ap.initials AS "applicantInitials", ap.department AS "applicantDepartment",
  ap.role AS "applicantRole", ap.available_hours_week AS "applicantAvailableHours",
  ap.typical_availability AS "applicantTypicalAvailability",
  sb.name AS "submittedByName",
  mg.name AS "managerName"
`;
const APP_JOINS = `
  FROM applications a
  JOIN work_posts p ON p.id = a.post_id
  JOIN users ap ON ap.id = a.applicant_id
  JOIN users sb ON sb.id = a.submitted_by
  LEFT JOIN users mg ON mg.id = a.manager_id
`;

api.patch('/applications/:id', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  const app = await one(`SELECT * FROM applications WHERE id = $1`, [req.params.id]);
  if (!app) return res.status(404).json({ error: 'Application not found' });
  if (app.applicant_id !== user.id && app.submitted_by !== user.id) {
    return res.status(403).json({ error: 'Not your application' });
  }
  if (!['pending_author', 'pending_manager', 'awaiting_registration'].includes(app.status)) {
    return res.status(400).json({ error: 'Only pending applications can be edited' });
  }
  const { note, commitment } = req.body || {};
  await q(
    `UPDATE applications SET note = COALESCE($1, note), commitment = COALESCE($2, commitment), edited_at = now() WHERE id = $3`,
    [note ?? null, commitment ?? null, req.params.id]
  );
  {
    const applicant = await one(`SELECT name FROM users WHERE id = $1`, [app.applicant_id]);
    // Whoever holds the decision right now gets told it changed — the post's
    // author at the first stage, the applicant's manager at the second.
    const reviewer = app.status === 'pending_manager' ? app.manager_id
      : app.status === 'pending_author' ? (await one(`SELECT author_id FROM work_posts WHERE id = $1`, [app.post_id]))?.author_id
      : null;
    if (reviewer) {
      await notify(reviewer, null, 'manager_approval', `Request Edited: ${applicant?.name}`,
        `A pending approval request was edited by the applicant. Review the updated details.`, 'manager', app.id);
    }
  }
  const updated = await one(`SELECT ${APP_SELECT} ${APP_JOINS} WHERE a.id = $1`, [req.params.id]);
  res.json({ application: updated });
});

api.post('/applications/:id/withdraw', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  const app = await one(`SELECT * FROM applications WHERE id = $1`, [req.params.id]);
  if (!app) return res.status(404).json({ error: 'Application not found' });
  if (app.applicant_id !== user.id && app.submitted_by !== user.id) {
    return res.status(403).json({ error: 'Not your application' });
  }
  if (!['pending_author', 'pending_manager', 'awaiting_registration'].includes(app.status)) {
    return res.status(400).json({ error: 'Only pending applications can be withdrawn' });
  }
  await q(`UPDATE applications SET status = 'withdrawn', decided_at = now() WHERE id = $1`, [req.params.id]);
  await q(`UPDATE registration_requests SET status = 'dismissed' WHERE related_application_id = $1 AND status = 'pending'`, [req.params.id]);
  const reviewer = app.status === 'pending_manager' ? app.manager_id
    : app.status === 'pending_author' ? (await one(`SELECT author_id FROM work_posts WHERE id = $1`, [app.post_id]))?.author_id
    : null;
  if (reviewer) {
    await notify(reviewer, null, 'manager_approval', 'Request Withdrawn',
      `${user.name} withdrew a pending approval request.`, 'manager');
  }
  res.json({ ok: true });
});

// ============================== APPROVALS (manager inbox) ==============================

/**
 * Every application in `pending_author` where the caller posted the
 * requirement, every application in `pending_manager` where the caller is
 * the applicant's manager, and every collaboration request in
 * `pending_manager` where the caller is the target's manager — one inbox,
 * three sources, tagged so the client can render and act on each correctly.
 * Open to any authenticated user rather than gated to manager/admin: the
 * first decision on an application belongs to whoever posted it, and that
 * can be any employee.
 */
api.get('/approvals', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  const isAdmin = user.systemRole === 'admin';

  const authorWhere = isAdmin ? `WHERE a.status = 'pending_author'` : `WHERE a.status = 'pending_author' AND p.author_id = $1`;
  const { rows: authorStage } = await q(
    `SELECT ${APP_SELECT}, 'application' AS kind, 'author' AS stage ${APP_JOINS} ${authorWhere}`,
    isAdmin ? [] : [user.id]
  );

  const managerWhere = isAdmin ? `WHERE a.status = 'pending_manager'` : `WHERE a.status = 'pending_manager' AND a.manager_id = $1`;
  const { rows: managerStage } = await q(
    `SELECT ${APP_SELECT}, 'application' AS kind, 'manager' AS stage ${APP_JOINS} ${managerWhere}`,
    isAdmin ? [] : [user.id]
  );

  const collabWhere = isAdmin ? `WHERE c.status = 'pending_manager'` : `WHERE c.status = 'pending_manager' AND c.manager_id = $1`;
  const { rows: collabStage } = await q(
    `SELECT c.id, c.task_title AS "taskTitle", c.estimated_hours AS "estimatedHours", c.dates, c.notes,
       c.status, c.created_at AS "createdAt",
       'collab' AS kind, 'manager' AS stage,
       r.id AS "requesterId", r.name AS "requesterName", r.initials AS "requesterInitials",
       r.department AS "requesterDepartment", r.role AS "requesterRole",
       t.id AS "targetId", t.name AS "targetName", t.initials AS "targetInitials",
       t.department AS "targetDepartment", t.role AS "targetRole"
     FROM collab_requests c
     JOIN users r ON r.id = c.requester_id
     JOIN users t ON t.id = c.target_id
     ${collabWhere}`,
    isAdmin ? [] : [user.id]
  );

  const approvals = [...authorStage, ...managerStage, ...collabStage]
    .sort((a: any, b: any) => +new Date(b.createdAt) - +new Date(a.createdAt));
  res.json({ approvals });
});

api.post('/approvals/:id/decision', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  const { decision, notes = '' } = req.body || {};
  if (!['approved', 'rejected'].includes(decision)) {
    return res.status(400).json({ error: 'decision must be approved or rejected' });
  }
  if (decision === 'rejected' && !String(notes).trim()) {
    return res.status(400).json({ error: 'A reason is required to decline a request' });
  }

  const app = await one(`SELECT * FROM applications WHERE id = $1`, [req.params.id]);
  if (app) return decideApplication(app, user, decision, notes, res);

  const cr = await one(`SELECT * FROM collab_requests WHERE id = $1`, [req.params.id]);
  if (cr) return decideCollabAsManager(cr, user, decision, notes, res);

  return res.status(404).json({ error: 'Approval not found' });
});

async function decideApplication(app: any, user: AuthedRequest['user'], decision: 'approved' | 'rejected', notes: string, res: Response) {
  const stage = app.status === 'pending_author' ? 'author' : app.status === 'pending_manager' ? 'manager' : null;
  if (!stage) return res.status(400).json({ error: 'This request has already been decided' });

  const post = await one(`SELECT id, title, author_id, seats, effort_hours, department, tags, effort_min, effort_max FROM work_posts WHERE id = $1`, [app.post_id]);
  const isAdmin = user.systemRole === 'admin';
  const isReviewer = stage === 'author' ? post?.author_id === user.id : app.manager_id === user.id;
  if (!isAdmin && !isReviewer) {
    return res.status(403).json({
      error: stage === 'author' ? 'Only the requirement\'s author can decide this' : 'This request is routed to a different manager'
    });
  }
  // Admins can decide any request, which would otherwise include their own —
  // platform administration is held by engineers who also apply for work
  // here, so nobody approves their own capacity regardless of system role.
  if (app.applicant_id === user.id) {
    return res.status(403).json({ error: 'You cannot decide your own request' });
  }

  const applicant = await one(`SELECT * FROM users WHERE id = $1`, [app.applicant_id]);

  if (decision === 'rejected') {
    await q(`UPDATE applications SET status = 'rejected', manager_notes = $1, decided_at = now() WHERE id = $2`, [notes, app.id]);
    await audit(user.id, 'application_rejected', `${applicant?.name} → ${post?.title}`, { applicationId: app.id, stage, notes });
    await notify(app.applicant_id, null, 'manager_approval', 'Request Declined',
      `${user.name} declined your request for "${post?.title?.slice(0, 60)}"${notes ? ` — ${String(notes).slice(0, 80)}` : ''}.`,
      'requests', app.id);
    const updated = await one(`SELECT ${APP_SELECT} ${APP_JOINS} WHERE a.id = $1`, [app.id]);
    return res.json({ application: updated });
  }

  if (stage === 'author') {
    await audit(user.id, 'application_author_approved', `${applicant?.name} → ${post?.title}`, { applicationId: app.id });
    if (applicant?.manager_id) {
      const rec = await recommendFor(applicant, post, app.id);
      await q(
        `UPDATE applications SET status = 'pending_manager', manager_id = $1, ai_recommendation = $2, ai_reason = $3, author_decided_at = now() WHERE id = $4`,
        [applicant.manager_id, rec.verdict, rec.reason, app.id]
      );
      await notify(applicant.manager_id, null, 'manager_approval', `Approval Needed: ${applicant.name}`,
        `${applicant.name} requested approval to support "${post.title.slice(0, 60)}" (${post.effort_hours}). The requirement's author has already approved.`,
        'manager', app.id);
      await notify(app.applicant_id, null, 'manager_approval', 'Approved by the author — now with your manager',
        `${user.name} approved your request for "${post.title.slice(0, 60)}". It now needs your manager's sign-off.`, 'requests', app.id);
    } else {
      await q(`UPDATE applications SET status = 'awaiting_registration', author_decided_at = now() WHERE id = $1`, [app.id]);
      const regId = newId('reg');
      await q(
        `INSERT INTO registration_requests (id, requested_by, subject_name, subject_email, subject_kind,
          subject_role, subject_department, for_user_id, related_application_id, related_post_id, note, status)
         VALUES ($1,$2,$3,$4,'manager','','',$5,$6,$7,$8,'pending')`,
        [
          regId, user.id, `Manager of ${applicant.name}`, '', applicant.id, app.id, post.id,
          `${applicant.name} (${applicant.department}) was approved by the requirement's author but has no registered manager. Register their manager to route the final approval.`
        ]
      );
      await notify(null, 'admin', 'registration_request', `Registration Needed: manager of ${applicant.name}`,
        `An approved application for "${post.title.slice(0, 50)}" is waiting until ${applicant.name}'s manager is registered.`, 'admin', regId);
      await notify(app.applicant_id, null, 'manager_approval', 'Approved by the author — waiting on manager registration',
        `${user.name} approved your request for "${post.title.slice(0, 60)}", but you have no manager registered yet. The admin has been notified.`,
        'requests', app.id);
    }
    const updated = await one(`SELECT ${APP_SELECT} ${APP_JOINS} WHERE a.id = $1`, [app.id]);
    return res.json({ application: updated });
  }

  // stage === 'manager' — the final decision.
  await q(`UPDATE applications SET status = 'approved', manager_notes = $1, decided_at = now() WHERE id = $2`, [notes, app.id]);
  await audit(user.id, 'application_approved', `${applicant?.name} → ${post?.title}`, { applicationId: app.id, notes });
  await notify(app.applicant_id, null, 'manager_approval', 'Request Approved ✓',
    `${user.name} approved your request for "${post?.title?.slice(0, 60)}"${notes ? ` — ${String(notes).slice(0, 80)}` : ''}.`,
    'requests', app.id);
  if (post?.author_id) {
    await notify(post.author_id, null, 'help_offer', 'Seat Confirmed',
      `${applicant?.name} was approved to support "${post.title.slice(0, 60)}".`, 'work', post.id);
  }
  await advancePostIfFull(app.post_id);
  const updated = await one(`SELECT ${APP_SELECT} ${APP_JOINS} WHERE a.id = $1`, [app.id]);
  return res.json({ application: updated });
}

async function decideCollabAsManager(cr: any, user: AuthedRequest['user'], decision: 'approved' | 'rejected', notes: string, res: Response) {
  if (cr.status !== 'pending_manager') return res.status(400).json({ error: 'This request has already been decided' });
  const isAdmin = user.systemRole === 'admin';
  if (!isAdmin && cr.manager_id !== user.id) {
    return res.status(403).json({ error: 'This request is routed to a different manager' });
  }
  if (!isAdmin && (cr.requester_id === user.id || cr.target_id === user.id)) {
    return res.status(403).json({ error: 'You cannot decide your own request' });
  }

  const [requester, target] = await Promise.all([
    one(`SELECT name FROM users WHERE id = $1`, [cr.requester_id]),
    one(`SELECT name FROM users WHERE id = $1`, [cr.target_id])
  ]);
  const finalStatus = decision === 'approved' ? 'accepted' : 'declined';
  await q(`UPDATE collab_requests SET status = $1 WHERE id = $2`, [finalStatus, cr.id]);
  await audit(user.id, `collab_manager_${decision}`, `${target?.name} → ${requester?.name}: ${cr.task_title}`, { collabRequestId: cr.id, notes });

  const summary = `"${String(cr.task_title).slice(0, 60)}" between ${requester?.name} and ${target?.name}`;
  const title = decision === 'approved' ? 'Collaboration Approved ✓' : 'Collaboration Declined by Manager';
  const body = decision === 'approved'
    ? `${user.name} approved the collaboration ${summary}.`
    : `${user.name} declined the collaboration ${summary}${notes ? ` — ${String(notes).slice(0, 80)}` : ''}.`;
  await notify(cr.requester_id, null, 'collab_request', title, body, 'requests', cr.id);
  await notify(cr.target_id, null, 'collab_request', title, body, 'requests', cr.id);

  const updated = await one(`SELECT * FROM collab_requests WHERE id = $1`, [cr.id]);
  return res.json({ collabRequest: updated });
}

// ============================== MY REQUESTS (centralized hub) ==============================

api.get('/requests/mine', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  const { rows: applications } = await q(
    `SELECT ${APP_SELECT} ${APP_JOINS} WHERE a.applicant_id = $1 OR a.submitted_by = $1 ORDER BY a.created_at DESC`,
    [user.id]
  );
  const { rows: collabSent } = await q(
    `SELECT c.*, t.name AS "targetName", t.initials AS "targetInitials", t.department AS "targetDepartment",
       r.name AS "requesterName", r.initials AS "requesterInitials", r.department AS "requesterDepartment",
       m.name AS "managerName"
     FROM collab_requests c JOIN users t ON t.id = c.target_id JOIN users r ON r.id = c.requester_id
       LEFT JOIN users m ON m.id = c.manager_id
     WHERE c.requester_id = $1 ORDER BY c.created_at DESC`,
    [user.id]
  );
  const { rows: collabReceived } = await q(
    `SELECT c.*, t.name AS "targetName", t.initials AS "targetInitials", t.department AS "targetDepartment",
       r.name AS "requesterName", r.initials AS "requesterInitials", r.department AS "requesterDepartment",
       m.name AS "managerName"
     FROM collab_requests c JOIN users t ON t.id = c.target_id JOIN users r ON r.id = c.requester_id
       LEFT JOIN users m ON m.id = c.manager_id
     WHERE c.target_id = $1 ORDER BY c.created_at DESC`,
    [user.id]
  );
  const { rows: bookings } = await q(
    `SELECT b.id, b.trip_id AS "tripId", b.days, b.created_at AS "createdAt",
       t.origin, t.destination, t.departure_time AS "departureTime", t.direction, t.status AS "tripStatus",
       d.name AS "driverName"
     FROM carpool_bookings b JOIN carpool_trips t ON t.id = b.trip_id JOIN users d ON d.id = t.driver_id
     WHERE b.rider_id = $1 ORDER BY b.created_at DESC`,
    [user.id]
  );
  const { rows: regRequests } = await q(
    `SELECT id, subject_name AS "subjectName", subject_kind AS "subjectKind", status, note,
       created_at AS "createdAt"
     FROM registration_requests WHERE requested_by = $1 OR for_user_id = $1 ORDER BY created_at DESC`,
    [user.id]
  );
  res.json({ applications, collabSent, collabReceived, bookings, regRequests });
});

// ============================== COLLABORATION REQUESTS ==============================

api.post('/collab-requests', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  const { targetId, taskTitle, estimatedHours = '', dates = '', notes = '' } = req.body || {};
  if (!targetId || !taskTitle) return res.status(400).json({ error: 'targetId and taskTitle are required' });
  const target = await getUserById(targetId);
  if (!target) return res.status(404).json({ error: 'Target user not found' });
  const id = newId('cr');
  await q(
    `INSERT INTO collab_requests (id, requester_id, target_id, task_title, estimated_hours, dates, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [id, user.id, targetId, taskTitle, estimatedHours, dates, notes]
  );
  await notify(targetId, null, 'collab_request', 'New Collaboration Request',
    `${user.name} requested your help: "${String(taskTitle).slice(0, 60)}" (${estimatedHours || 'effort TBD'}).`, 'requests', id);
  res.status(201).json({ ok: true, id });
});

api.patch('/collab-requests/:id', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  const cr = await one(`SELECT * FROM collab_requests WHERE id = $1`, [req.params.id]);
  if (!cr) return res.status(404).json({ error: 'Request not found' });
  if (cr.requester_id !== user.id) return res.status(403).json({ error: 'Not your request' });
  if (cr.status !== 'pending') return res.status(400).json({ error: 'Only pending requests can be edited' });
  const { taskTitle, estimatedHours, dates, notes } = req.body || {};
  await q(
    `UPDATE collab_requests SET task_title = COALESCE($1, task_title), estimated_hours = COALESCE($2, estimated_hours),
      dates = COALESCE($3, dates), notes = COALESCE($4, notes), edited_at = now() WHERE id = $5`,
    [taskTitle ?? null, estimatedHours ?? null, dates ?? null, notes ?? null, req.params.id]
  );
  await notify(cr.target_id, null, 'collab_request', 'Collaboration Request Updated',
    `${user.name} edited their pending request "${(taskTitle || cr.task_title).slice(0, 60)}".`, 'requests', cr.id);
  res.json({ ok: true });
});

api.post('/collab-requests/:id/respond', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  const { action } = req.body || {};
  const cr = await one(`SELECT * FROM collab_requests WHERE id = $1`, [req.params.id]);
  if (!cr) return res.status(404).json({ error: 'Request not found' });
  const isTarget = cr.target_id === user.id;
  const isRequester = cr.requester_id === user.id;

  // Accepting is the one action with a real branch: it either hands off to
  // the target's manager for a second decision, or — for a target with no
  // registered manager — there is nobody to hand off to, so it finalises
  // immediately, same as it always did.
  if (action === 'accepted') {
    if (!isTarget) return res.status(403).json({ error: 'Only the recipient can do this' });
    if (cr.status !== 'pending') return res.status(400).json({ error: `Cannot accept a ${cr.status} request` });
    const target = await one(`SELECT name, manager_id FROM users WHERE id = $1`, [cr.target_id]);
    if (target?.manager_id) {
      await q(`UPDATE collab_requests SET status = 'pending_manager', manager_id = $1, target_decided_at = now() WHERE id = $2`,
        [target.manager_id, cr.id]);
      await notify(target.manager_id, null, 'collab_request', `Approval Needed: ${target.name}`,
        `${target.name} agreed to help with "${cr.task_title.slice(0, 60)}" — needs your sign-off.`,
        'manager', cr.id);
      await notify(cr.requester_id, null, 'collab_request', 'Accepted — pending manager sign-off',
        `${target.name} agreed to help with "${cr.task_title.slice(0, 60)}". Their manager needs to sign off before it is final.`,
        'requests', cr.id);
    } else {
      await q(`UPDATE collab_requests SET status = 'accepted', target_decided_at = now() WHERE id = $1`, [cr.id]);
      await notify(cr.requester_id, null, 'collab_request', 'Collaboration accepted',
        `${target?.name} accepted "${cr.task_title.slice(0, 60)}".`, 'requests', cr.id);
    }
    return res.json({ ok: true });
  }

  const allowed: Record<string, { who: string; from: string[] }> = {
    declined: { who: 'target', from: ['pending'] },
    completed: { who: 'either', from: ['accepted'] },
    withdrawn: { who: 'requester', from: ['pending', 'pending_manager'] }
  };
  const rule = allowed[action];
  if (!rule) return res.status(400).json({ error: 'Invalid action' });
  if (rule.who === 'target' && !isTarget) return res.status(403).json({ error: 'Only the recipient can do this' });
  if (rule.who === 'requester' && !isRequester) return res.status(403).json({ error: 'Only the requester can do this' });
  if (rule.who === 'either' && !isTarget && !isRequester) return res.status(403).json({ error: 'Not your request' });
  if (!rule.from.includes(cr.status)) return res.status(400).json({ error: `Cannot ${action} a ${cr.status} request` });
  await q(`UPDATE collab_requests SET status = $1 WHERE id = $2`, [action, req.params.id]);
  const other = isTarget ? cr.requester_id : cr.target_id;
  await notify(other, null, 'collab_request', `Collaboration ${action}`,
    `${user.name} marked "${cr.task_title.slice(0, 60)}" as ${action}.`, 'requests', cr.id);
  if (action === 'withdrawn' && cr.manager_id) {
    await notify(cr.manager_id, null, 'collab_request', 'Request Withdrawn',
      `${user.name} withdrew a collaboration request awaiting your sign-off.`, 'manager');
  }
  res.json({ ok: true });
});

// ============================== BANDWIDTH ==============================

api.get('/bandwidth-offers', requireAuth(), async (_req, res) => {
  const { rows } = await q(
    `SELECT b.id, b.available_hours AS "availableHours", b.skills, b.notes, b.created_at AS "createdAt",
       u.id AS "authorId", u.name AS "authorName", u.role AS "authorRole", u.department, u.initials
     FROM bandwidth_offers b JOIN users u ON u.id = b.author_id ORDER BY b.created_at DESC`
  );
  res.json({ offers: rows });
});

api.post('/bandwidth-offers', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  const { availableHours, skills = [], notes = '' } = req.body || {};
  if (!availableHours) return res.status(400).json({ error: 'availableHours is required' });
  await q(
    `INSERT INTO bandwidth_offers (id, author_id, available_hours, skills, notes) VALUES ($1,$2,$3,$4,$5)`,
    [newId('bo'), user.id, availableHours, JSON.stringify(skills), notes]
  );
  res.status(201).json({ ok: true });
});

// ============================== TRAINING ==============================

/** Promote the longest-waiting waitlister once a seat frees up. */
async function promoteFromWaitlist(sessionId: string): Promise<void> {
  const sess = await one<{ seats_total: number; status: string }>(
    `SELECT seats_total, status FROM training_sessions WHERE id = $1`, [sessionId]);
  if (!sess || sess.status !== 'scheduled') return;
  const taken = await one<{ n: string }>(
    `SELECT COUNT(*)::text AS n FROM training_registrations
      WHERE session_id = $1 AND status = 'registered'`, [sessionId]);
  if (parseInt(taken?.n || '0', 10) >= sess.seats_total) return;
  const next = await one<{ id: string; attendee_id: string }>(
    `SELECT id, attendee_id FROM training_registrations
      WHERE session_id = $1 AND status = 'waitlisted'
      ORDER BY created_at LIMIT 1`, [sessionId]);
  if (!next) return;
  await q(`UPDATE training_registrations SET status = 'registered' WHERE id = $1`, [next.id]);
  const t = await one<{ title: string }>(`SELECT title FROM training_sessions WHERE id = $1`, [sessionId]);
  await notify(next.attendee_id, null, 'help_offer', 'A seat opened up ✓',
    `You are off the waitlist for "${t?.title || 'the session'}".`, 'learning', sessionId);
}

api.get('/trainings', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  const { rows } = await q(
    `SELECT t.id, t.host_id AS "hostId", t.title, t.description, t.skills, t.level, t.format,
       t.location, t.session_date AS "sessionDate", t.start_time AS "startTime",
       t.duration_mins AS "durationMins", t.seats_total AS "seatsTotal", t.status,
       t.created_at AS "createdAt",
       h.name AS "hostName", h.role AS "hostRole", h.department AS "hostDepartment",
       h.initials AS "hostInitials", h.avatar_url AS "hostAvatarUrl",
       (SELECT COUNT(*)::int FROM training_registrations r
         WHERE r.session_id = t.id AND r.status = 'registered') AS "seatsFilled",
       (SELECT COUNT(*)::int FROM training_registrations r
         WHERE r.session_id = t.id AND r.status = 'waitlisted') AS "waitlistCount",
       (SELECT r.status FROM training_registrations r
         WHERE r.session_id = t.id AND r.attendee_id = $1) AS "myRegistration"
     FROM training_sessions t JOIN users h ON h.id = t.host_id
     ORDER BY t.session_date ASC, t.start_time ASC`,
    [user.id]
  );
  // Hosts get the roster for their own sessions; nobody else needs it.
  const { rows: attendees } = await q(
    `SELECT r.session_id AS "sessionId", r.status, u.id AS "attendeeId",
       u.name, u.initials, u.department, u.avatar_url AS "avatarUrl"
     FROM training_registrations r
     JOIN users u ON u.id = r.attendee_id
     JOIN training_sessions t ON t.id = r.session_id
     WHERE t.host_id = $1 ORDER BY r.created_at`,
    [user.id]
  );
  const bySession = new Map<string, any[]>();
  for (const a of attendees) {
    if (!bySession.has(a.sessionId)) bySession.set(a.sessionId, []);
    bySession.get(a.sessionId)!.push(a);
  }
  res.json({ trainings: rows.map((t: any) => ({ ...t, attendees: bySession.get(t.id) || [] })) });
});

api.post('/trainings', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  const b = req.body || {};
  if (!b.title || !String(b.title).trim()) return res.status(400).json({ error: 'Title is required' });
  if (!b.sessionDate) return res.status(400).json({ error: 'A session date is required' });
  const id = newId('trn');
  await q(
    `INSERT INTO training_sessions (id, host_id, title, description, skills, level, format,
      location, session_date, start_time, duration_mins, seats_total)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
    [
      id, user.id, String(b.title).trim(), b.description || '',
      JSON.stringify(Array.isArray(b.skills) ? b.skills : []),
      b.level || 'All levels', b.format || 'Virtual', b.location || '',
      b.sessionDate, b.startTime || '', Math.max(15, Number(b.durationMins) || 60),
      Math.max(1, Number(b.seatsTotal) || 25)
    ]
  );
  await audit(user.id, 'training_created', id, { title: b.title });
  res.status(201).json({ ok: true, id });
});

api.patch('/trainings/:id', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  const t = await one<any>(`SELECT * FROM training_sessions WHERE id = $1`, [req.params.id]);
  if (!t) return res.status(404).json({ error: 'Session not found' });
  if (t.host_id !== user.id && user.systemRole !== 'admin') {
    return res.status(403).json({ error: 'Only the host can change this session' });
  }
  const b = req.body || {};
  await q(
    `UPDATE training_sessions SET title = COALESCE($1, title), description = COALESCE($2, description),
      session_date = COALESCE($3, session_date), start_time = COALESCE($4, start_time),
      duration_mins = COALESCE($5, duration_mins), seats_total = COALESCE($6, seats_total),
      location = COALESCE($7, location), status = COALESCE($8, status), skills = COALESCE($9, skills)
     WHERE id = $10`,
    [
      b.title ?? null, b.description ?? null, b.sessionDate ?? null, b.startTime ?? null,
      b.durationMins != null ? Number(b.durationMins) : null,
      b.seatsTotal != null ? Number(b.seatsTotal) : null,
      b.location ?? null, b.status ?? null,
      Array.isArray(b.skills) ? JSON.stringify(b.skills) : null,
      req.params.id
    ]
  );
  // Cancelling or rescheduling is worth telling the people who signed up.
  if (b.status === 'cancelled' || b.sessionDate || b.startTime) {
    const { rows: signedUp } = await q(
      `SELECT attendee_id FROM training_registrations WHERE session_id = $1`, [req.params.id]);
    for (const r of signedUp) {
      await notify(r.attendee_id, null, 'system_alert',
        b.status === 'cancelled' ? 'Session cancelled' : 'Session rescheduled',
        `"${t.title}" — ${b.status === 'cancelled' ? 'the host cancelled this session.' : 'the host changed the schedule.'}`,
        'learning', req.params.id);
    }
  }
  // A larger room may mean the waitlist can move.
  if (b.seatsTotal != null) await promoteFromWaitlist(req.params.id);
  res.json({ ok: true });
});

api.post('/trainings/:id/register', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  const t = await one<any>(
    `SELECT t.*, (SELECT COUNT(*)::int FROM training_registrations r
                   WHERE r.session_id = t.id AND r.status = 'registered') AS filled
     FROM training_sessions t WHERE t.id = $1`, [req.params.id]);
  if (!t) return res.status(404).json({ error: 'Session not found' });
  if (t.status !== 'scheduled') return res.status(400).json({ error: 'This session is no longer open' });
  if (t.host_id === user.id) return res.status(400).json({ error: 'You are hosting this session' });
  const dup = await one(
    `SELECT id FROM training_registrations WHERE session_id = $1 AND attendee_id = $2`,
    [req.params.id, user.id]);
  if (dup) return res.status(400).json({ error: 'You are already signed up' });

  // A full session waitlists rather than refusing, so interest is still visible
  // to the host — who can then widen the room or repeat the session.
  const status = t.filled >= t.seats_total ? 'waitlisted' : 'registered';
  await q(
    `INSERT INTO training_registrations (id, session_id, attendee_id, status) VALUES ($1,$2,$3,$4)`,
    [newId('reg'), req.params.id, user.id, status]);
  await notify(t.host_id, null, 'help_offer',
    status === 'waitlisted' ? 'New waitlist signup' : 'New attendee',
    `${user.name} signed up for "${t.title}".`, 'learning', req.params.id);
  res.status(201).json({ ok: true, status });
});

api.post('/trainings/:id/cancel-registration', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  await q(`DELETE FROM training_registrations WHERE session_id = $1 AND attendee_id = $2`,
    [req.params.id, user.id]);
  await promoteFromWaitlist(req.params.id);
  res.json({ ok: true });
});

// ============================== COMMUNITY ==============================

api.get('/community', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  const { rows: groups } = await q(
    `SELECT g.id, g.name, g.category, g.icon, g.description, g.member_count AS "memberCount",
       g.active_discussions AS "activeDiscussions", g.tags,
       EXISTS(SELECT 1 FROM group_members m WHERE m.group_id = g.id AND m.user_id = $1) AS "isJoined"
     FROM community_groups g ORDER BY g.member_count DESC`,
    [user.id]
  );
  const { rows: posts } = await q(
    `SELECT id, type, group_name AS "groupName", title, description, author_id AS "authorId",
       author_name AS "authorName", author_role AS "authorRole", author_initials AS "authorInitials",
       location, date_info AS "dateInfo", created_at AS "createdAt"
     FROM community_posts ORDER BY created_at DESC`
  );
  const { rows: questions } = await q(
    `SELECT qq.id, qq.title, qq.details, qq.author_id AS "authorId", qq.author_name AS "authorName",
       qq.author_role AS "authorRole", qq.author_initials AS "authorInitials", qq.tags, qq.votes,
       qq.has_accepted AS "hasAccepted", qq.created_at AS "createdAt",
       (SELECT COUNT(*)::int FROM answers an WHERE an.question_id = qq.id) AS "answerCount"
     FROM questions qq ORDER BY qq.created_at DESC`
  );
  res.json({ groups, posts, questions });
});

api.get('/community/questions/:id', requireAuth(), async (req, res) => {
  const question = await one(
    `SELECT id, title, details, author_name AS "authorName", author_role AS "authorRole",
       author_initials AS "authorInitials", tags, votes, has_accepted AS "hasAccepted", created_at AS "createdAt"
     FROM questions WHERE id = $1`, [req.params.id]);
  if (!question) return res.status(404).json({ error: 'Question not found' });
  const { rows: answers } = await q(
    `SELECT id, author_name AS "authorName", author_role AS "authorRole", author_initials AS "authorInitials",
       text, accepted, likes, created_at AS "createdAt"
     FROM answers WHERE question_id = $1 ORDER BY accepted DESC, likes DESC`, [req.params.id]);
  res.json({ question, answers });
});

api.post('/community/groups/:id/toggle-join', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  const g = await one(`SELECT id FROM community_groups WHERE id = $1`, [req.params.id]);
  if (!g) return res.status(404).json({ error: 'Group not found' });
  const existing = await one(`SELECT 1 AS x FROM group_members WHERE group_id = $1 AND user_id = $2`, [req.params.id, user.id]);
  if (existing) {
    await q(`DELETE FROM group_members WHERE group_id = $1 AND user_id = $2`, [req.params.id, user.id]);
    await q(`UPDATE community_groups SET member_count = GREATEST(0, member_count - 1) WHERE id = $1`, [req.params.id]);
    res.json({ joined: false });
  } else {
    await q(`INSERT INTO group_members (group_id, user_id) VALUES ($1,$2)`, [req.params.id, user.id]);
    await q(`UPDATE community_groups SET member_count = member_count + 1 WHERE id = $1`, [req.params.id]);
    res.json({ joined: true });
  }
});

api.post('/community/posts', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  const { type = 'Notice', title, description = '', location = '', dateInfo = '' } = req.body || {};
  if (!title) return res.status(400).json({ error: 'Title is required' });
  await q(
    `INSERT INTO community_posts (id, type, title, description, author_id, author_name, author_role, author_initials, location, date_info)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [newId('cp'), type, title, description, user.id, user.name, user.role, user.initials, location || user.campus, dateInfo]
  );
  res.status(201).json({ ok: true });
});

api.post('/community/questions', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  const { title, details = '', tags = [] } = req.body || {};
  if (!title) return res.status(400).json({ error: 'Title is required' });
  await q(
    `INSERT INTO questions (id, title, details, author_id, author_name, author_role, author_initials, tags, votes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,1)`,
    [newId('kq'), title, details, user.id, user.name, user.role, user.initials, JSON.stringify(tags)]
  );
  res.status(201).json({ ok: true });
});

api.post('/community/questions/:id/answers', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  const { text } = req.body || {};
  if (!text) return res.status(400).json({ error: 'Answer text required' });
  const question = await one(`SELECT id, title, author_id FROM questions WHERE id = $1`, [req.params.id]);
  if (!question) return res.status(404).json({ error: 'Question not found' });
  await q(
    `INSERT INTO answers (id, question_id, author_id, author_name, author_role, author_initials, text)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [newId('ans'), req.params.id, user.id, user.name, user.role, user.initials, text]
  );
  if (question.author_id && question.author_id !== user.id) {
    await notify(question.author_id, null, 'community_reply', 'New Answer on Your Question',
      `${user.name} answered "${question.title.slice(0, 60)}".`, 'beyond');
  }
  res.status(201).json({ ok: true });
});

api.post('/community/questions/:id/vote', requireAuth(), async (req, res) => {
  await q(`UPDATE questions SET votes = votes + 1 WHERE id = $1`, [req.params.id]);
  res.json({ ok: true });
});

// ============================== CARPOOL ==============================

api.get('/carpool/trips', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  const { rows } = await q(
    `SELECT t.id, t.driver_id AS "driverId", t.direction, t.origin, t.destination, t.campus,
       t.departure_time AS "departureTime", t.days, t.vehicle_model AS "vehicleModel",
       t.vehicle_type AS "vehicleType", t.seats_total AS "seatsTotal", t.cost_per_ride AS "costPerRide",
       t.women_only AS "womenOnly", t.notes, t.amenities, t.status, t.created_at AS "createdAt",
       d.name AS "driverName", d.role AS "driverRole", d.department AS "driverDepartment", d.initials AS "driverInitials",
       (SELECT COUNT(*)::int FROM carpool_bookings b WHERE b.trip_id = t.id AND b.status = 'approved') AS "seatsBooked",
       (SELECT COUNT(*)::int FROM carpool_bookings b WHERE b.trip_id = t.id AND b.status = 'pending') AS "seatsPending",
       EXISTS(SELECT 1 FROM carpool_bookings b
               WHERE b.trip_id = t.id AND b.rider_id = $1 AND b.status = 'approved') AS "iAmBooked",
       (SELECT b.status FROM carpool_bookings b
         WHERE b.trip_id = t.id AND b.rider_id = $1) AS "myBookingStatus"
     FROM carpool_trips t JOIN users d ON d.id = t.driver_id
     WHERE t.status <> 'cancelled' ORDER BY t.created_at DESC`,
    [user.id]
  );
  // Riders are grouped per trip below. Pending ones ride along in the same
  // payload so a driver can act on seat requests from the trip card itself.
  const { rows: riders } = await q(
    `SELECT b.id AS "bookingId", b.trip_id AS "tripId", b.status, u.id AS "riderId",
       u.name, u.initials, u.department
     FROM carpool_bookings b JOIN users u ON u.id = b.rider_id
     WHERE b.status IN ('approved','pending')`
  );
  const ridersByTrip = new Map<string, any[]>();
  for (const r of riders) {
    if (!ridersByTrip.has(r.tripId)) ridersByTrip.set(r.tripId, []);
    ridersByTrip.get(r.tripId)!.push(r);
  }
  res.json({
    trips: rows.map((t: any) => {
      const all = ridersByTrip.get(t.id) || [];
      return {
        ...t,
        riders: all.filter((r) => r.status === 'approved'),
        // Only the driver needs to see who is still waiting on a decision.
        pendingRiders: t.driverId === user.id ? all.filter((r) => r.status === 'pending') : []
      };
    })
  });
});

api.post('/carpool/trips', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  const b = req.body || {};
  if (!b.origin || !b.destination) return res.status(400).json({ error: 'Origin and destination are required' });
  const created: string[] = [];
  const trips = Array.isArray(b.trips) && b.trips.length
    ? b.trips
    : [{ direction: b.direction || 'to_office', origin: b.origin, destination: b.destination, departureTime: b.departureTime }];
  for (const t of trips) {
    const id = newId('trip');
    await q(
      `INSERT INTO carpool_trips (id, driver_id, direction, origin, destination, campus, departure_time,
        days, vehicle_model, vehicle_type, seats_total, cost_per_ride, women_only, notes, amenities)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
      [
        id, user.id, t.direction === 'from_office' ? 'from_office' : 'to_office',
        t.origin || b.origin, t.destination || b.destination, b.campus || user.campus,
        t.departureTime || '08:30 AM', JSON.stringify(b.days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']),
        b.vehicleModel || '', b.vehicleType || 'Electric (EV)', Math.max(1, Number(b.seatsTotal) || 3),
        b.costPerRide || 'Free', !!b.womenOnly, b.notes || '', JSON.stringify(b.amenities || [])
      ]
    );
    created.push(id);
  }
  res.status(201).json({ ok: true, tripIds: created });
});

api.patch('/carpool/trips/:id', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  const t = await one(`SELECT * FROM carpool_trips WHERE id = $1`, [req.params.id]);
  if (!t) return res.status(404).json({ error: 'Trip not found' });
  if (t.driver_id !== user.id && user.systemRole !== 'admin') return res.status(403).json({ error: 'Not your trip' });
  const { status, departureTime, days, seatsTotal, notes } = req.body || {};
  await q(
    `UPDATE carpool_trips SET status = COALESCE($1, status), departure_time = COALESCE($2, departure_time),
      days = COALESCE($3, days), seats_total = COALESCE($4, seats_total), notes = COALESCE($5, notes) WHERE id = $6`,
    [status ?? null, departureTime ?? null, days ? JSON.stringify(days) : null,
      seatsTotal != null ? Number(seatsTotal) : null, notes ?? null, req.params.id]
  );
  res.json({ ok: true });
});

/** Booking a seat is a request now: the driver approves or rejects it. */
api.post('/carpool/trips/:id/book', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  const t = await one<any>(
    `SELECT t.*, d.name AS driver_name,
       (SELECT COUNT(*)::int FROM carpool_bookings b
         WHERE b.trip_id = t.id AND b.status = 'approved') AS booked
     FROM carpool_trips t JOIN users d ON d.id = t.driver_id WHERE t.id = $1`, [req.params.id]);
  if (!t) return res.status(404).json({ error: 'Trip not found' });
  if (t.status !== 'active') return res.status(400).json({ error: 'Trip is not active' });
  if (t.driver_id === user.id) return res.status(400).json({ error: 'You are the driver of this trip' });
  if (t.booked >= t.seats_total) return res.status(400).json({ error: 'No seats left on this trip' });

  // A previous rejection is kept on the row so the old thread still reads
  // correctly; clear it here so the rider can ask again.
  const dup = await one<{ id: string; status: string }>(
    `SELECT id, status FROM carpool_bookings WHERE trip_id = $1 AND rider_id = $2`, [req.params.id, user.id]);
  if (dup?.status === 'approved') return res.status(400).json({ error: 'Your seat on this trip is already confirmed' });
  if (dup?.status === 'pending') return res.status(400).json({ error: 'You already asked for a seat — the driver has not decided yet' });
  if (dup) await q(`DELETE FROM carpool_bookings WHERE id = $1`, [dup.id]);

  const days = Array.isArray(req.body?.days) ? req.body.days : [];
  const bookingId = newId('cb');
  await q(`INSERT INTO carpool_bookings (id, trip_id, rider_id, days, status) VALUES ($1,$2,$3,$4,'pending')`,
    [bookingId, req.params.id, user.id, JSON.stringify(days)]);

  const route = `${t.origin} → ${t.destination}`;
  // The request also lands in the driver's inbox as a message, so it can be
  // approved or rejected from the conversation without leaving Messages.
  await q(
    `INSERT INTO messages (id, sender_id, recipient_id, text, context_type, context_title, context_id)
     VALUES ($1,$2,$3,$4,'carpool_booking',$5,$6)`,
    [newId('msg'), user.id, t.driver_id,
      `Hi ${String(t.driver_name || '').split(' ')[0] || 'there'} — could I take a seat on your ${t.departure_time} ride? (${route})`,
      route, bookingId]
  );
  await notify(t.driver_id, null, 'help_offer', 'Seat Request',
    `${user.name} asked for a seat: ${route} (${t.departure_time}). Approve or decline it from Messages.`, 'beyond');
  res.status(201).json({ ok: true, bookingId });
});

/** The driver's decision on a seat request. Reachable from the trip card and
 *  from the booking's message thread — both post here. */
api.post('/carpool/bookings/:id/decision', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  const { decision } = req.body || {};
  if (!['approved', 'rejected'].includes(decision)) {
    return res.status(400).json({ error: 'decision must be approved or rejected' });
  }
  const b = await one<any>(
    `SELECT b.*, t.driver_id, t.origin, t.destination, t.departure_time, t.seats_total,
       r.name AS rider_name,
       (SELECT COUNT(*)::int FROM carpool_bookings x WHERE x.trip_id = b.trip_id AND x.status = 'approved') AS booked
     FROM carpool_bookings b
     JOIN carpool_trips t ON t.id = b.trip_id
     JOIN users r ON r.id = b.rider_id
     WHERE b.id = $1`, [req.params.id]);
  if (!b) return res.status(404).json({ error: 'Booking not found' });
  if (b.driver_id !== user.id) return res.status(403).json({ error: 'Only the driver can decide this' });
  if (b.status !== 'pending') return res.status(400).json({ error: 'This request has already been decided' });
  if (decision === 'approved' && b.booked >= b.seats_total) {
    return res.status(400).json({ error: 'No seats left to confirm' });
  }

  await q(`UPDATE carpool_bookings SET status = $1 WHERE id = $2`, [decision, req.params.id]);

  const route = `${b.origin} → ${b.destination}`;
  const reply = decision === 'approved'
    ? `Seat confirmed for the ${b.departure_time} ride (${route}). See you there.`
    : `Sorry — I can't fit you on the ${b.departure_time} ride (${route}) this time.`;
  await q(
    `INSERT INTO messages (id, sender_id, recipient_id, text, context_type, context_title, context_id)
     VALUES ($1,$2,$3,$4,'carpool_booking',$5,$6)`,
    [newId('msg'), user.id, b.rider_id, reply, route, req.params.id]
  );
  await notify(b.rider_id, null, 'help_offer',
    decision === 'approved' ? 'Seat Confirmed ✓' : 'Seat Request Declined',
    `${user.name}: ${reply}`, 'beyond');
  await audit(user.id, `carpool_booking_${decision}`, req.params.id, { rider: b.rider_name, route });
  res.json({ ok: true });
});

api.post('/carpool/trips/:id/cancel-booking', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  await q(`DELETE FROM carpool_bookings WHERE trip_id = $1 AND rider_id = $2`, [req.params.id, user.id]);
  res.json({ ok: true });
});

// ============================== MESSAGES ==============================

api.get('/messages', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  // A carpool booking message carries its booking's live state so the driver
  // can decide inline; `canDecide` is what the thread actually gates on.
  const { rows } = await q(
    `SELECT m.id, m.sender_id AS "senderId", m.recipient_id AS "recipientId", m.text,
       m.context_type AS "contextType", m.context_title AS "contextTitle",
       m.context_id AS "contextId", m.read, m.created_at AS "createdAt",
       b.status AS "bookingStatus",
       (b.status = 'pending' AND t.driver_id = $1) AS "canDecide"
     FROM messages m
     LEFT JOIN carpool_bookings b ON m.context_type = 'carpool_booking' AND b.id = m.context_id
     LEFT JOIN carpool_trips t ON t.id = b.trip_id
     WHERE m.sender_id = $1 OR m.recipient_id = $1 ORDER BY m.created_at`,
    [user.id]
  );
  res.json({ messages: rows });
});

api.post('/messages', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  const { recipientId, text, contextType = 'general', contextTitle = '', contextId = null } = req.body || {};
  if (!recipientId || !text) return res.status(400).json({ error: 'recipientId and text are required' });
  const recipient = await getUserById(recipientId);
  if (!recipient) return res.status(404).json({ error: 'Recipient not found' });
  await q(
    `INSERT INTO messages (id, sender_id, recipient_id, text, context_type, context_title, context_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [newId('msg'), user.id, recipientId, text, contextType, contextTitle, contextId]
  );
  res.status(201).json({ ok: true });
});

api.post('/messages/read', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  const { partnerId } = req.body || {};
  await q(`UPDATE messages SET read = TRUE WHERE sender_id = $1 AND recipient_id = $2`, [partnerId, user.id]);
  res.json({ ok: true });
});

// ============================== NOTIFICATIONS ==============================

api.get('/notifications', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  const { rows } = await q(
    `SELECT n.id, n.type, n.title, n.description, n.target_tab AS "targetTab", n.target_id AS "targetId",
       CASE WHEN n.recipient_id = $1 THEN n.read ELSE COALESCE(nc.read, FALSE) END AS read,
       n.created_at AS "createdAt"
     FROM notifications n
     LEFT JOIN notification_clears nc ON nc.notification_id = n.id AND nc.user_id = $1
     WHERE (n.recipient_id = $1 OR (n.recipient_id IS NULL AND (n.recipient_role = 'all' OR n.recipient_role = $2)))
       AND COALESCE(nc.cleared, FALSE) = FALSE
     ORDER BY n.created_at DESC LIMIT 100`,
    [user.id, user.systemRole]
  );
  res.json({ notifications: rows });
});

api.post('/notifications/:id/read', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  await q(`UPDATE notifications SET read = TRUE WHERE id = $1 AND recipient_id = $2`, [req.params.id, user.id]);
  await q(
    `INSERT INTO notification_clears (notification_id, user_id, read) VALUES ($1,$2,TRUE)
     ON CONFLICT (notification_id, user_id) DO UPDATE SET read = TRUE`,
    [req.params.id, user.id]
  );
  res.json({ ok: true });
});

api.post('/notifications/read-all', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  await q(`UPDATE notifications SET read = TRUE WHERE recipient_id = $1`, [user.id]);
  await q(
    `INSERT INTO notification_clears (notification_id, user_id, read)
     SELECT n.id, $1, TRUE FROM notifications n
     WHERE n.recipient_id IS NULL AND (n.recipient_role = 'all' OR n.recipient_role = $2)
     ON CONFLICT (notification_id, user_id) DO UPDATE SET read = TRUE`,
    [user.id, user.systemRole]
  );
  res.json({ ok: true });
});

// Clear ALL notifications for the current user (per-person clear)
api.delete('/notifications', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  await q(`DELETE FROM notifications WHERE recipient_id = $1`, [user.id]);
  await q(
    `INSERT INTO notification_clears (notification_id, user_id, read, cleared)
     SELECT n.id, $1, TRUE, TRUE FROM notifications n
     WHERE n.recipient_id IS NULL AND (n.recipient_role = 'all' OR n.recipient_role = $2)
     ON CONFLICT (notification_id, user_id) DO UPDATE SET cleared = TRUE, read = TRUE`,
    [user.id, user.systemRole]
  );
  res.json({ ok: true });
});

// ============================== SAVED ==============================

api.get('/saved', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  const { rows } = await q(`SELECT item_type AS "itemType", item_id AS "itemId" FROM saved_items WHERE user_id = $1`, [user.id]);
  res.json({ saved: rows });
});

api.post('/saved/toggle', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  const { itemType, itemId } = req.body || {};
  if (!['work', 'training', 'community', 'carpool'].includes(itemType) || !itemId) {
    return res.status(400).json({ error: 'Invalid itemType or itemId' });
  }
  const existing = await one(
    `SELECT 1 AS x FROM saved_items WHERE user_id = $1 AND item_type = $2 AND item_id = $3`,
    [user.id, itemType, String(itemId)]
  );
  if (existing) {
    await q(`DELETE FROM saved_items WHERE user_id = $1 AND item_type = $2 AND item_id = $3`, [user.id, itemType, String(itemId)]);
    res.json({ saved: false });
  } else {
    await q(`INSERT INTO saved_items (user_id, item_type, item_id) VALUES ($1,$2,$3)`, [user.id, itemType, String(itemId)]);
    res.json({ saved: true });
  }
});

// ============================== ADMIN ==============================

api.get('/admin/registration-requests', requireAuth(), requireRealAdmin(), async (_req, res) => {
  const { rows } = await q(
    `SELECT r.id, r.subject_name AS "subjectName", r.subject_email AS "subjectEmail",
       r.subject_kind AS "subjectKind", r.subject_role AS "subjectRole", r.subject_department AS "subjectDepartment",
       r.for_user_id AS "forUserId", r.related_application_id AS "relatedApplicationId",
       r.related_post_id AS "relatedPostId", r.note, r.status, r.created_at AS "createdAt",
       rb.name AS "requestedByName", fu.name AS "forUserName", fu.department AS "forUserDepartment",
       p.title AS "postTitle"
     FROM registration_requests r
     JOIN users rb ON rb.id = r.requested_by
     LEFT JOIN users fu ON fu.id = r.for_user_id
     LEFT JOIN work_posts p ON p.id = r.related_post_id
     ORDER BY (r.status = 'pending') DESC, r.created_at DESC`
  );
  res.json({ requests: rows });
});

api.post('/admin/registration-requests/:id/complete', requireAuth(), requireRealAdmin(), async (req, res) => {
  const { realUser } = req as AuthedRequest;
  const reg = await one(`SELECT * FROM registration_requests WHERE id = $1`, [req.params.id]);
  if (!reg) return res.status(404).json({ error: 'Registration request not found' });
  if (reg.status !== 'pending') return res.status(400).json({ error: 'Request already handled' });

  const { name, email, role, systemRole, department, campus, managerId } = req.body || {};
  if (!name || !email || !department) return res.status(400).json({ error: 'name, email and department are required' });
  const existing = await one(`SELECT id FROM users WHERE lower(email) = lower($1)`, [email]);
  if (existing) return res.status(409).json({ error: 'A user with this email already exists' });

  const tempPassword = generateTempPassword();
  const hash = await bcrypt.hash(tempPassword, 10);
  const newUserId = newId('usr');
  const initials = String(name).split(/\s+/).map((p: string) => p[0]).join('').slice(0, 2).toUpperCase();
  const effectiveSystemRole = systemRole || (reg.subject_kind === 'manager' ? 'manager' : 'employee');
  await q(
    `INSERT INTO users (id, email, name, initials, role, system_role, department, campus, manager_id, password_hash, must_change_password)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,TRUE)`,
    [newUserId, email, name, initials, role || 'Employee', effectiveSystemRole, department, campus || '', managerId || null, hash]
  );

  if (reg.subject_kind === 'manager' && reg.for_user_id) {
    // Link the new manager to the waiting employee and release any waiting applications
    await q(`UPDATE users SET manager_id = $1, updated_at = now() WHERE id = $2`, [newUserId, reg.for_user_id]);
    const { rows: waiting } = await q(
      `SELECT a.*, p.title, p.department AS post_department, p.tags, p.effort_min, p.effort_max, p.effort_hours
       FROM applications a JOIN work_posts p ON p.id = a.post_id
       WHERE a.applicant_id = $1 AND a.status = 'awaiting_registration'`,
      [reg.for_user_id]
    );
    for (const app of waiting) {
      const applicant = await one(`SELECT * FROM users WHERE id = $1`, [app.applicant_id]);
      const rec = await recommendFor(applicant, {
        title: app.title, department: app.post_department, tags: app.tags,
        effort_min: app.effort_min, effort_max: app.effort_max, effort_hours: app.effort_hours
      }, app.id);
      await q(
        `UPDATE applications SET manager_id = $1, status = 'pending_manager', ai_recommendation = $2, ai_reason = $3 WHERE id = $4`,
        [newUserId, rec.verdict, rec.reason, app.id]
      );
      await notify(newUserId, null, 'manager_approval', `Approval Needed: ${applicant.name}`,
        `${applicant.name} requested approval to support "${String(app.title).slice(0, 60)}".`, 'manager', app.id);
      await notify(app.applicant_id, null, 'manager_approval', 'Your request is moving',
        `Your manager ${name} is now registered — your request for "${String(app.title).slice(0, 50)}" has been routed for approval.`, 'requests', app.id);
    }
  }

  if (reg.subject_kind === 'employee' && reg.related_post_id) {
    // Create the application for the newly registered employee
    const post = await one(`SELECT * FROM work_posts WHERE id = $1`, [reg.related_post_id]);
    if (post && post.status === 'Open') {
      const applicant = await one(`SELECT * FROM users WHERE id = $1`, [newUserId]);
      const appId = newId('app');
      if (managerId) {
        const rec = await recommendFor(applicant, post);
        await q(
          `INSERT INTO applications (id, post_id, group_id, applicant_id, submitted_by, manager_id, note, commitment, status, ai_recommendation, ai_reason, author_decided_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pending_manager',$9,$10, now())`,
          [appId, post.id, newId('grp'), newUserId, reg.requested_by, managerId, `Included via nomination by request ${reg.id}`, post.effort_hours, rec.verdict, rec.reason]
        );
        await notify(managerId, null, 'manager_approval', `Approval Needed: ${name}`,
          `${name} was nominated for "${post.title.slice(0, 60)}".`, 'manager', appId);
      } else {
        await q(
          `INSERT INTO applications (id, post_id, group_id, applicant_id, submitted_by, manager_id, note, commitment, status)
           VALUES ($1,$2,$3,$4,$5,NULL,$6,$7,'awaiting_registration')`,
          [appId, post.id, newId('grp'), newUserId, reg.requested_by, 'Awaiting manager assignment', post.effort_hours]
        );
      }
    }
  }

  await q(
    `UPDATE registration_requests SET status = 'completed', created_user_id = $1, completed_at = now() WHERE id = $2`,
    [newUserId, req.params.id]
  );
  await notify(reg.requested_by, null, 'registration_request', 'Registration Completed',
    `${name} is now registered on MBXchange. Related requests have been routed.`, 'requests');
  await audit(realUser.id, 'registration_completed', email, { regId: reg.id, newUserId });
  res.json({ user: await getUserById(newUserId), tempPassword });
});

api.post('/admin/registration-requests/:id/dismiss', requireAuth(), requireRealAdmin(), async (req, res) => {
  const { realUser } = req as AuthedRequest;
  await q(`UPDATE registration_requests SET status = 'dismissed' WHERE id = $1 AND status = 'pending'`, [req.params.id]);
  await audit(realUser.id, 'registration_dismissed', req.params.id);
  res.json({ ok: true });
});

// ============================== RECOMMENDATIONS ==============================

/** Tokenise a skill/specialisation string for loose matching ("AI / ML" → ai, ml). */
function tokenise(values: string[]): string[] {
  return values
    .flatMap((v) => String(v).toLowerCase().split(/[^a-z0-9+#.]+/i))
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !['and', 'the', 'for', 'with'].includes(t));
}

api.get('/recommendations', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  const matcher = await matcherFor(user.id);

  const { rows: posts } = await q(
    `SELECT ${POST_SELECT} FROM work_posts p
     WHERE p.status = 'Open' AND ($1::text IS NULL OR p.author_id IS DISTINCT FROM $1)
     ORDER BY p.created_at DESC`,
    [user.id]
  );
  const { rows: mine } = await q(
    `SELECT post_id AS "postId" FROM applications WHERE applicant_id = $1 AND status <> 'withdrawn'`,
    [user.id]
  );
  const appliedTo = new Set(mine.map((m: any) => m.postId));

  const scored = posts
    .filter((p: any) => !appliedTo.has(p.id) && p.seatsFilled < p.seats)
    .map((p: any) => {
      const m = matcher.score(p);
      return {
        ...p,
        matchScore: m.score,
        skillFit: m.skillFit,
        capacityFit: m.capacityFit,
        matchedSkills: m.matchedSkills,
        crossDepartment: m.crossDepartment,
        matchReason: m.reason
      };
    })
    .sort((a: any, b: any) => b.matchScore - a.matchScore || +new Date(b.createdAt) - +new Date(a.createdAt));

  const me = await one(`SELECT specialisation, primary_skills FROM users WHERE id = $1`, [user.id]);
  res.json({
    recommendations: scored.slice(0, 12),
    stackConfigured: matcher.configured,
    remainingHours: matcher.remaining,
    stack: { specialisation: me?.specialisation || '', skills: me?.primary_skills || [] }
  });
});

// ============================== INSIGHTS (all roles) ==============================

/**
 * Six months of real exchange activity for the home-page chart.
 *
 * Every figure is computed from the applications and posts tables — no fixed
 * sample data. "Synergy" is defined rather than asserted: the share of a
 * month's completed engagements that crossed a department boundary, which is
 * the thing this platform exists to increase.
 */
// ============================== APPRECIATION ==============================

/**
 * Recognition for finished work.
 *
 * Only two people can write it: the person who posted the requirement (they
 * received the help) and the helper's own manager (they authorised the time).
 * The work has to be finished — praise for something still in flight is not
 * recognition, it is encouragement, and it would dilute the signal.
 */
api.post('/appreciations', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  const { applicationId, badgeId, message = '' } = req.body || {};
  if (!applicationId) return res.status(400).json({ error: 'applicationId is required' });
  if (!isBadgeId(badgeId)) return res.status(400).json({ error: 'Pick a badge to award' });

  const app = await one(
    `SELECT a.id, a.applicant_id, a.manager_id, a.status,
            p.id AS post_id, p.title, p.author_id, p.status AS post_status
       FROM applications a JOIN work_posts p ON p.id = a.post_id
      WHERE a.id = $1`,
    [applicationId]
  );
  if (!app) return res.status(404).json({ error: 'Engagement not found' });
  if (app.status !== 'approved') return res.status(400).json({ error: 'Only approved engagements can be recognised' });
  if (app.post_status !== 'Completed') return res.status(400).json({ error: 'Award the badge once the requirement is completed' });
  if (app.applicant_id === user.id) return res.status(400).json({ error: 'You cannot award yourself a badge' });

  const isAuthor = app.author_id === user.id;
  const isTheirManager = app.manager_id === user.id;
  if (!isAuthor && !isTheirManager && user.systemRole !== 'admin') {
    return res.status(403).json({ error: 'Only the requirement author or the helper\'s manager can award a badge here' });
  }

  const dup = await one(`SELECT id FROM appreciations WHERE application_id = $1 AND from_user_id = $2`, [applicationId, user.id]);
  if (dup) return res.status(409).json({ error: 'You have already awarded a badge for this engagement' });

  const badge = getBadge(badgeId)!;
  const id = newId('apr');
  await q(
    `INSERT INTO appreciations (id, to_user_id, from_user_id, post_id, application_id, badge_id, message)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [id, app.applicant_id, user.id, app.post_id, applicationId, badgeId, String(message).trim()]
  );
  await recomputeRecognition(app.applicant_id);

  await notify(app.applicant_id, null, 'feedback_received', `${user.name} awarded you "${badge.name}"`,
    `${badge.icon} On "${app.title.slice(0, 46)}"${String(message).trim() ? ` — “${String(message).trim().slice(0, 70)}”` : ''}`,
    'achievements', app.post_id);

  const row = await one(
    `SELECT ap.id, ap.message, ap.badge_id AS "badgeId", ap.created_at AS "createdAt",
            u.name AS "fromName", u.initials AS "fromInitials", u.role AS "fromRole", u.avatar_url AS "fromAvatarUrl",
            p.title AS "postTitle"
       FROM appreciations ap
       JOIN users u ON u.id = ap.from_user_id
       LEFT JOIN work_posts p ON p.id = ap.post_id
      WHERE ap.id = $1`,
    [id]
  );
  res.status(201).json({ appreciation: { ...row, badge } });
});

/** The badge vocabulary the award picker offers. */
api.get('/badges/catalogue', requireAuth(), async (_req, res) => {
  res.json({ badges: AWARD_BADGES, dimensions: BADGE_DIMENSIONS });
});

/** The signed-in user's 0-5 contribution score with its working shown. */
api.get('/score', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  const target = (req.query.userId as string) || user.id;
  const u = await one<any>(
    `SELECT badges_count, hours_contributed, departments_supported, collaborations_count, tier
       FROM users WHERE id = $1`, [target]);
  if (!u) return res.status(404).json({ error: 'User not found' });
  const { score, breakdown } = computeContributionScore({
    badges: Number(u.badges_count || 0),
    hoursContributed: Number(u.hours_contributed || 0),
    departmentsSupported: Number(u.departments_supported || 0),
    collaborationsCount: Number(u.collaborations_count || 0)
  });
  res.json({ score, outOf: 5, tier: u.tier, breakdown });
});

/** Recognition received by a person (defaults to the signed-in user). */
api.get('/appreciations', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  const target = (req.query.userId as string) || user.id;
  const { rows } = await q(
    `SELECT ap.id, ap.message, ap.badge_id AS "badgeId", ap.created_at AS "createdAt",
            u.name AS "fromName", u.initials AS "fromInitials", u.role AS "fromRole", u.avatar_url AS "fromAvatarUrl",
            p.title AS "postTitle", p.department AS "postDepartment"
       FROM appreciations ap
       JOIN users u ON u.id = ap.from_user_id
       LEFT JOIN work_posts p ON p.id = ap.post_id
      WHERE ap.to_user_id = $1
      ORDER BY ap.created_at DESC`,
    [target]
  );
  // Resolve each award against the catalogue so the client never has to.
  res.json({ appreciations: rows.map((r: any) => ({ ...r, badge: getBadge(r.badgeId) || null })) });
});

/**
 * Completed engagements the signed-in user is entitled to recognise, with
 * whether they already have. Drives the "recognise the team" prompt.
 */
api.get('/appreciations/pending', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  const { rows } = await q(
    `SELECT a.id AS "applicationId", a.applicant_id AS "applicantId", a.commitment,
            u.name AS "applicantName", u.initials AS "applicantInitials",
            u.role AS "applicantRole", u.department AS "applicantDepartment",
            u.avatar_url AS "applicantAvatarUrl",
            p.id AS "postId", p.title AS "postTitle",
            (ap.id IS NOT NULL) AS "alreadyRecognised", ap.badge_id AS "awardedBadgeId"
       FROM applications a
       JOIN work_posts p ON p.id = a.post_id
       JOIN users u ON u.id = a.applicant_id
       LEFT JOIN appreciations ap ON ap.application_id = a.id AND ap.from_user_id = $1
      WHERE a.status = 'approved'
        AND p.status = 'Completed'
        AND a.applicant_id <> $1
        AND (p.author_id = $1 OR a.manager_id = $1)
      ORDER BY p.created_at DESC`,
    [user.id]
  );
  res.json({ engagements: rows });
});

/**
 * Milestones: fixed, checkable achievements on the way to the next tier.
 *
 * Kept separate from tiers because a tier is a rank and a milestone is a
 * specific thing you did — "supported five departments" reads as an
 * accomplishment in a way that "Connector" alone does not.
 */
api.get('/milestones', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  const target = (req.query.userId as string) || user.id;
  const u = await one(
    `SELECT hours_contributed, collaborations_count, departments_supported, people_helped, tier
       FROM users WHERE id = $1`,
    [target]
  );
  if (!u) return res.status(404).json({ error: 'User not found' });

  const praise = await one<{ n: string }>(
    `SELECT COUNT(*)::text AS n FROM appreciations WHERE to_user_id = $1`, [target]
  );

  const hours = Number(u.hours_contributed || 0);
  const gigs = Number(u.collaborations_count || 0);
  const depts = Number(u.departments_supported || 0);
  const kudos = parseInt(praise?.n || '0', 10);

  const defs: Array<{ id: string; label: string; hint: string; value: number; goal: number; icon: string }> = [
    { id: 'first', label: 'First contribution', hint: 'Complete your first engagement', value: gigs, goal: 1, icon: '🌱' },
    { id: 'five', label: 'Five engagements', hint: 'Complete five pieces of work', value: gigs, goal: 5, icon: '🖐' },
    { id: 'twentyfive', label: 'Twenty-five engagements', hint: 'A sustained habit of helping', value: gigs, goal: 25, icon: '🏅' },
    { id: 'h25', label: '25 hours given', hint: 'Contribute 25 hours', value: hours, goal: 25, icon: '⏱' },
    { id: 'h100', label: '100 hours given', hint: 'Contribute 100 hours', value: hours, goal: 100, icon: '🔥' },
    { id: 'h250', label: '250 hours given', hint: 'Contribute 250 hours', value: hours, goal: 250, icon: '💎' },
    { id: 'd3', label: 'Three departments', hint: 'Help outside your own team three times over', value: depts, goal: 3, icon: '🌍' },
    { id: 'd5', label: 'Five departments', hint: 'Reach across five departments', value: depts, goal: 5, icon: '🧭' },
    { id: 'k1', label: 'First recognition', hint: 'Receive recognition from a colleague', value: kudos, goal: 1, icon: '👏' },
    { id: 'k10', label: 'Ten recognitions', hint: 'Be recognised ten times', value: kudos, goal: 10, icon: '🌟' }
  ];

  const milestones = defs.map((d) => ({
    ...d,
    achieved: d.value >= d.goal,
    progress: Math.min(100, Math.round((d.value / d.goal) * 100))
  }));

  res.json({
    milestones,
    achievedCount: milestones.filter((m) => m.achieved).length,
    totals: { hours, gigs, departments: depts, recognitions: kudos, tier: u.tier }
  });
});

api.get('/telemetry', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  const scope = req.query.scope === 'me' ? 'me' : 'org';

  const { rows } = await q(
    `WITH months AS (
       SELECT generate_series(
         date_trunc('month', now()) - interval '5 months',
         date_trunc('month', now()),
         interval '1 month'
       ) AS m
     ),
     done AS (
       SELECT date_trunc('month', COALESCE(a.decided_at, a.created_at)) AS m,
              a.id, a.applicant_id, a.commitment,
              wp.department AS post_dept, wp.effort_hours,
              u.department AS applicant_dept
         FROM applications a
         JOIN work_posts wp ON wp.id = a.post_id
         JOIN users u ON u.id = a.applicant_id
        WHERE a.status = 'approved'
          AND ($1::text = 'org' OR a.applicant_id = $2)
     )
     SELECT to_char(months.m, 'Mon') AS label,
            to_char(months.m, 'YYYY-MM') AS key,
            COUNT(done.id)::int AS gigs,
            COUNT(DISTINCT done.applicant_id)::int AS people,
            COUNT(*) FILTER (WHERE done.post_dept IS DISTINCT FROM done.applicant_dept)::int AS "crossDept",
            COALESCE(string_agg(COALESCE(done.commitment, done.effort_hours, ''), '|'), '') AS "hoursRaw"
       FROM months
       LEFT JOIN done ON done.m = months.m
      GROUP BY months.m
      ORDER BY months.m`,
    [scope, user.id]
  );

  const series = rows.map((r: any) => {
    const hours = String(r.hoursRaw || '')
      .split('|')
      .filter(Boolean)
      .reduce((sum, txt) => sum + parseHoursRange(txt)[1], 0);
    const gigs = Number(r.gigs || 0);
    // Share of the month's engagements that crossed departments.
    const synergy = gigs > 0 ? Math.round((Number(r.crossDept || 0) / gigs) * 100) : 0;
    return {
      label: r.label, key: r.key, gigs, hours,
      people: Number(r.people || 0),
      crossDept: Number(r.crossDept || 0),
      synergy
    };
  });

  res.json({
    scope,
    series,
    synergyDefinition: 'Share of completed engagements where the helper came from a different department than the requirement.'
  });
});

api.get('/insights', requireAuth(), async (_req, res) => {
  const { rows: heatmap } = await q(
    `SELECT skill, demand_score AS "demandScore", supply_score AS "supplyScore",
       requests_count AS "requestsCount", experts_count AS "expertsCount", status
     FROM capability_heatmap ORDER BY (demand_score - supply_score) DESC`
  );
  const { rows: departmentLoad } = await q(
    `SELECT department,
       COUNT(*)::int AS posts,
       COUNT(*) FILTER (WHERE status = 'Open')::int AS open
     FROM work_posts GROUP BY department ORDER BY posts DESC`
  );
  const { rows: topDemand } = await q(
    `SELECT t.tag AS skill, COUNT(*)::int AS mentions
     FROM work_posts p, jsonb_array_elements_text(p.tags) AS t(tag)
     WHERE p.status IN ('Open','In Progress')
     GROUP BY t.tag ORDER BY mentions DESC LIMIT 8`
  );
  res.json({ heatmap, departmentLoad, topDemand });
});

/**
 * Leaderboard, scoped three ways.
 *
 * `organisation` is everyone; `department` is the viewer's own department;
 * `team` is the people who report to the same manager the viewer does — plus
 * that manager. For a manager viewing it, "team" naturally means their own
 * reports, which is what they asked for without needing a fourth scope.
 */
api.get('/leaderboard', requireAuth(), async (req, res) => {
  const { user } = req as AuthedRequest;
  const scope = String(req.query.scope || 'organisation');
  const metric = String(req.query.metric || 'badges');
  const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '5'), 10) || 5));
  const offset = Math.max(0, parseInt(String(req.query.offset || '0'), 10) || 0);

  // The contribution score is deliberately NOT rankable here. It is a
  // personal figure shown to its owner; publishing an ordered list of it
  // turns the platform into a performance ranking, which is not what this
  // is for. Everything below measures collaboration reach instead.
  const ORDER: Record<string, string> = {
    badges: 'u.badges_count',
    hours: 'u.hours_contributed',
    engagements: 'u.collaborations_count',
    departments: 'u.departments_supported'
  };
  const orderBy = ORDER[metric] || ORDER.badges;
  const metricCol = ORDER[metric] ? metric : 'badges';

  let where = `u.status = 'active' AND u.system_role <> 'admin'`;
  const params: any[] = [];
  if (scope === 'department') {
    params.push(user.department);
    where += ` AND u.department = $${params.length}`;
  } else if (scope === 'team') {
    const anchor = user.systemRole === 'manager' ? user.id : user.managerId;
    if (!anchor) return res.json({ scope, metric: metricCol, rows: [], me: null, total: 0, unavailable: 'no-manager' });
    params.push(anchor);
    where += ` AND (u.manager_id = $${params.length} OR u.id = $${params.length})`;
  }

  // Rank in SQL so a page of 5 out of 20 000 people still carries true
  // positions, and dense ranking so equal values share a place rather than
  // being split by a tiebreak nobody can see.
  const ranked = `
    SELECT u.id, u.name, u.initials, u.role, u.department, u.avatar_url AS "avatarUrl",
      u.tier, ${orderBy} AS value,
      DENSE_RANK() OVER (ORDER BY ${orderBy} DESC) AS rank,
      ROW_NUMBER() OVER (ORDER BY ${orderBy} DESC, u.name ASC) AS seq
    FROM users u WHERE ${where}`;

  const { rows } = await q(
    `SELECT * FROM (${ranked}) r ORDER BY r.seq LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );
  const totalRow = await one<{ n: string }>(
    `SELECT COUNT(*)::text AS n FROM users u WHERE ${where}`, params);
  const meRow = await one(`SELECT * FROM (${ranked}) r WHERE r.id = $${params.length + 1}`, [...params, user.id]);

  res.json({
    scope, metric: metricCol,
    rows,
    me: meRow || null,
    total: parseInt(totalRow?.n || '0', 10),
    offset, limit
  });
});

/**
 * Reporting for managers and admins.
 *
 * A manager can only ever pull their own reports — the scope is forced to
 * their own id regardless of what the query asks for. An admin can pull the
 * whole organisation, one department, or one manager's team.
 */
api.get('/reports', requireAuth(), requireRole('manager', 'admin'), async (req, res) => {
  const { user } = req as AuthedRequest;
  const isAdmin = user.systemRole === 'admin';
  const requested = String(req.query.scope || (isAdmin ? 'organisation' : 'manager'));
  const scope = isAdmin ? requested : 'manager';
  const department = String(req.query.department || user.department);
  // The forced fallback is what stops a manager widening their own scope.
  const managerId = isAdmin ? String(req.query.managerId || user.id) : user.id;

  let peopleWhere = `u.status = 'active'`;
  const params: any[] = [];
  if (scope === 'department') {
    params.push(department);
    peopleWhere += ` AND u.department = $${params.length}`;
  } else if (scope === 'manager') {
    params.push(managerId);
    peopleWhere += ` AND u.manager_id = $${params.length}`;
  }

  const { rows: people } = await q(
    `SELECT u.id, u.name, u.initials, u.role, u.department, u.avatar_url AS "avatarUrl",
       u.tier, u.available_hours_week AS "availableHoursWeek", u.hours_consumed AS "hoursConsumed",
       u.hours_contributed AS "hoursContributed", u.collaborations_count AS "engagements",
       u.departments_supported AS "departmentsSupported",
       u.badges_count AS "badges", u.contribution_score AS "score",
       (SELECT COUNT(*)::int FROM applications a
         WHERE a.applicant_id = u.id AND a.status IN ('pending_author','pending_manager')) AS "openRequests",
       (SELECT COUNT(*)::int FROM applications a JOIN work_posts p ON p.id = a.post_id
         WHERE a.applicant_id = u.id AND a.status = 'approved'
           AND p.status NOT IN ('Completed','Cancelled')) AS "activeEngagements",
       (SELECT COUNT(*)::int FROM training_registrations r
         WHERE r.attendee_id = u.id AND r.status = 'registered') AS "trainingsBooked"
     FROM users u
     WHERE ${peopleWhere}
     ORDER BY u.hours_contributed DESC, u.name ASC`,
    params
  );

  const ids = people.map((p: any) => p.id);
  const totals = {
    people: people.length,
    hoursContributed: people.reduce((n: number, p: any) => n + Number(p.hoursContributed || 0), 0),
    engagements: people.reduce((n: number, p: any) => n + Number(p.engagements || 0), 0),
    badges: people.reduce((n: number, p: any) => n + Number(p.badges || 0), 0),
    declaredHours: people.reduce((n: number, p: any) => n + Number(p.availableHoursWeek || 0), 0),
    committedHours: people.reduce((n: number, p: any) => n + Number(p.hoursConsumed || 0), 0),
    openRequests: people.reduce((n: number, p: any) => n + Number(p.openRequests || 0), 0),
    activeEngagements: people.reduce((n: number, p: any) => n + Number(p.activeEngagements || 0), 0)
  };

  // Where this group's help actually went, and which skills it was asked for.
  const { rows: byDepartment } = ids.length ? await q(
    `SELECT p.department, COUNT(*)::int AS engagements, COALESCE(SUM(bl.hours),0)::int AS hours
       FROM applications a
       JOIN work_posts p ON p.id = a.post_id
       LEFT JOIN bandwidth_ledger bl ON bl.application_id = a.id
      WHERE a.applicant_id = ANY($1) AND a.status = 'approved' AND p.status = 'Completed'
      GROUP BY p.department ORDER BY hours DESC`, [ids]) : { rows: [] };

  const { rows: topSkills } = ids.length ? await q(
    `SELECT t.tag AS skill, COUNT(*)::int AS mentions
       FROM applications a
       JOIN work_posts p ON p.id = a.post_id, jsonb_array_elements_text(p.tags) AS t(tag)
      WHERE a.applicant_id = ANY($1) AND a.status = 'approved'
      GROUP BY t.tag ORDER BY mentions DESC LIMIT 8`, [ids]) : { rows: [] };

  // Admins pick a manager or department from these; managers never see them.
  const { rows: managers } = isAdmin ? await q(
    `SELECT id, name, department FROM users
      WHERE system_role IN ('manager','admin') AND status = 'active' ORDER BY name`) : { rows: [] };
  const { rows: departments } = isAdmin ? await q(
    `SELECT DISTINCT department FROM users WHERE status = 'active' ORDER BY department`) : { rows: [] };

  res.json({
    scope, department, managerId, isAdmin,
    people, totals, byDepartment, topSkills,
    filters: { managers, departments: departments.map((d: any) => d.department) }
  });
});

api.get('/admin/overview', requireAuth(), requireRole('manager', 'admin'), async (_req, res) => {
  const counts = async (sql: string) => {
    const r = await one<{ n: string }>(sql);
    return parseInt(r?.n || '0', 10);
  };
  const stats = {
    users: await counts(`SELECT COUNT(*)::text AS n FROM users WHERE status = 'active'`),
    openPosts: await counts(`SELECT COUNT(*)::text AS n FROM work_posts WHERE status = 'Open'`),
    pendingApprovals: await counts(`SELECT COUNT(*)::text AS n FROM applications WHERE status IN ('pending_author','pending_manager')`),
    awaitingRegistration: await counts(`SELECT COUNT(*)::text AS n FROM registration_requests WHERE status = 'pending'`),
    approvedThisMonth: await counts(`SELECT COUNT(*)::text AS n FROM applications WHERE status = 'approved'`),
    activeTrips: await counts(`SELECT COUNT(*)::text AS n FROM carpool_trips WHERE status = 'active'`),
    upcomingTrainings: await counts(`SELECT COUNT(*)::text AS n FROM training_sessions WHERE status = 'scheduled'`)
  };
  const { rows: departmentLoad } = await q(
    `SELECT department, COUNT(*)::int AS posts FROM work_posts GROUP BY department ORDER BY posts DESC`
  );
  const { rows: auditTail } = await q(
    `SELECT a.action, a.subject, a.created_at AS "createdAt", u.name AS "actorName"
     FROM audit_log a LEFT JOIN users u ON u.id = a.actor_id ORDER BY a.created_at DESC LIMIT 20`
  );
  res.json({ stats, departmentLoad, auditTail });
});

// Lightweight polling endpoint: unread counts only
api.get('/sync', requireAuth(), async (req, res) => {
  const { user, realUser } = req as AuthedRequest;
  // Presence rides on the poll the client already makes every 20s. Stamp the
  // real signed-in person, not an impersonated target.
  await q(`UPDATE users SET last_seen = now() WHERE id = $1`, [realUser.id]);
  const unreadNotifications = await one<{ n: string }>(
    `SELECT COUNT(*)::text AS n FROM notifications n
     LEFT JOIN notification_clears nc ON nc.notification_id = n.id AND nc.user_id = $1
     WHERE (n.recipient_id = $1 OR (n.recipient_id IS NULL AND (n.recipient_role = 'all' OR n.recipient_role = $2)))
       AND COALESCE(nc.cleared, FALSE) = FALSE
       AND (CASE WHEN n.recipient_id = $1 THEN n.read ELSE COALESCE(nc.read, FALSE) END) = FALSE`,
    [user.id, user.systemRole]
  );
  const unreadMessages = await one<{ n: string }>(
    `SELECT COUNT(*)::text AS n FROM messages WHERE recipient_id = $1 AND read = FALSE`, [user.id]);
  // Any employee can have this badge now — the first decision on an
  // application belongs to whoever posted the requirement, not only to
  // managers. Admins see every open approval org-wide; everyone else sees
  // what is actually routed to them: their own posts awaiting a first
  // decision, applications where they are the applicant's manager, and
  // collaboration requests awaiting their sign-off as the target's manager.
  const pendingApprovals = user.systemRole === 'admin'
    ? await one<{ n: string }>(
        `SELECT (
           (SELECT COUNT(*) FROM applications WHERE status IN ('pending_author','pending_manager')) +
           (SELECT COUNT(*) FROM collab_requests WHERE status = 'pending_manager')
         )::text AS n`)
    : await one<{ n: string }>(
        `SELECT (
           (SELECT COUNT(*) FROM applications a JOIN work_posts p ON p.id = a.post_id
             WHERE a.status = 'pending_author' AND p.author_id = $1) +
           (SELECT COUNT(*) FROM applications WHERE status = 'pending_manager' AND manager_id = $1) +
           (SELECT COUNT(*) FROM collab_requests WHERE status = 'pending_manager' AND manager_id = $1)
         )::text AS n`, [user.id]);
  res.json({
    unreadNotifications: parseInt(unreadNotifications?.n || '0', 10),
    unreadMessages: parseInt(unreadMessages?.n || '0', 10),
    pendingApprovals: parseInt(pendingApprovals?.n || '0', 10)
  });
});
