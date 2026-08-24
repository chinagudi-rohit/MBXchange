/**
 * Idempotent seed: ports the demo dataset from src/data/initialData.ts into the DB
 * so every fresh deployment ships with testable dummy data.
 * Runs only when the users table is empty.
 */
import bcrypt from 'bcryptjs';
import { q, one, newId } from './db.ts';
import { computeRecommendation, parseHoursRange, computeTier } from './rules.ts';
import {
  INITIAL_USER_ACCOUNTS,
  INITIAL_WORK_POSTS,
  INITIAL_BANDWIDTH_OFFERS,
  INITIAL_MANAGER_APPROVALS,
  INITIAL_CARPOOL_RIDES,
  INITIAL_MARKETPLACE_LISTINGS,
  INITIAL_COMMUNITIES,
  INITIAL_KNOWLEDGE_QUESTIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_COMMUNITY_POSTS,
  INITIAL_DIRECT_MESSAGES,
  INITIAL_COLLABORATION_REQUESTS,
  INITIAL_USER_SAVED_MAP,
  INITIAL_CAPABILITY_HEATMAP
} from '../src/data/initialData.ts';

/** Runs on every boot: backfills reference data added after an install was first seeded. */
export async function backfillReferenceData(): Promise<void> {
  const existing = await one<{ n: string }>('SELECT COUNT(*)::text AS n FROM capability_heatmap');
  if (existing && parseInt(existing.n, 10) > 0) return;
  for (const h of INITIAL_CAPABILITY_HEATMAP) {
    await q(
      `INSERT INTO capability_heatmap (skill, demand_score, supply_score, requests_count, experts_count, status)
       VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (skill) DO NOTHING`,
      [h.skill, h.demandScore, h.supplyScore, h.requestsCount, h.availableExpertsCount, h.status]
    );
  }
  console.log('[seed] capability heatmap reference data loaded');
}

export const SEED_USER_PASSWORD = process.env.SEED_USER_PASSWORD || 'Mbx@2026';
export const SEED_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'MBXAdmin@2026';

// Tuned weekly capacities so the seeded approval queue demonstrates every AI verdict
const CAPACITY_OVERRIDES: Record<string, number> = {
  usr_rakesh: 6,   // 8h request  -> Not Recommended (the capacity bug showcase)
  usr_arjun: 8,    // 6h request  -> Approve
  usr_priya: 8,    // 12h request -> Not Recommended
  usr_anand: 10,   // 8h request  -> Approve
  usr_sneha: 10,   // 10h request -> Approve
  usr_vikram: 9,   // 8h request  -> Review Capacity band
  usr_maya: 5
};

const STATUS_MAP: Record<string, string> = {
  'Open': 'Open',
  'In Progress': 'In Progress',
  'In progress': 'In Progress',
  'In Review': 'In Progress',
  'Resolved': 'Completed',
  'Completed': 'Completed',
  'Blocked': 'Open'
};

function daysFromSchedule(scheduleType?: string, daysOfWeek?: string[]): string[] {
  if (daysOfWeek && daysOfWeek.length) return daysOfWeek;
  switch (scheduleType) {
    case 'Daily (Mon–Fri)': return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    case 'Mon, Wed, Fri': return ['Mon', 'Wed', 'Fri'];
    case 'Tue, Thu': return ['Tue', 'Thu'];
    default: return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  }
}


/**
 * Create the single administrator a fresh production database needs.
 *
 * Controlled by ADMIN_EMAIL / ADMIN_PASSWORD. Runs only when no admin exists,
 * so restarts and rolling deploys never overwrite a changed password.
 */
export async function ensureBootstrapAdmin(): Promise<void> {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  const existingAdmin = await one<{ n: string }>(
    `SELECT COUNT(*)::text AS n FROM users WHERE system_role = 'admin'`
  );
  if (existingAdmin && parseInt(existingAdmin.n, 10) > 0) return;

  if (!email || !password) {
    console.warn(
      '[seed] No admin exists and ADMIN_EMAIL / ADMIN_PASSWORD are not set — ' +
      'nobody will be able to sign in. Set both and restart.'
    );
    return;
  }

  const name = process.env.ADMIN_NAME || 'Platform Administrator';
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  await q(
    `INSERT INTO users (id, email, name, initials, role, system_role, status, department, campus,
       password_hash, must_change_password)
     VALUES ($1,$2,$3,$4,$5,'admin','active',$6,'',$7,TRUE)
     ON CONFLICT (email) DO NOTHING`,
    [
      newId('usr'), email.toLowerCase(), name, initials,
      process.env.ADMIN_ROLE || 'Platform Administrator',
      process.env.ADMIN_DEPARTMENT || '',
      await bcrypt.hash(password, 10)
    ]
  );
  console.log(`[seed] bootstrap admin created: ${email} (must change password on first sign-in)`);
}

export async function seedIfEmpty(): Promise<void> {
  if (process.env.SKIP_SEED === 'true') {
    // A production database still needs one account to sign in with, or the
    // admin console is unreachable and no users can ever be created.
    await ensureBootstrapAdmin();
    console.log('[seed] SKIP_SEED=true — demo dataset skipped');
    return;
  }
  const existing = await one<{ n: string }>('SELECT COUNT(*)::text AS n FROM users');
  if (existing && parseInt(existing.n, 10) > 0) {
    console.log('[seed] database already populated — skipping');
    return;
  }
  console.log('[seed] populating demo dataset…');

  const userHash = await bcrypt.hash(SEED_USER_PASSWORD, 10);
  const adminHash = await bcrypt.hash(SEED_ADMIN_PASSWORD, 10);

  // ---- Users (managers referenced by manager_id, so insert without FK first pass order: sorted so managers first)
  const accounts = [...INITIAL_USER_ACCOUNTS];
  const inserted = new Set<string>();
  const pending = [...accounts];
  while (pending.length) {
    const next = pending.findIndex(u => !u.managerId || inserted.has(u.managerId));
    const u = next >= 0 ? pending.splice(next, 1)[0] : pending.shift()!;
    const hours = CAPACITY_OVERRIDES[u.id] ?? u.currentAvailabilityHoursThisWeek ?? 0;
    await q(
      `INSERT INTO users (id, email, name, initials, role, system_role, status, department, campus,
        experience_years, primary_skills, interests, available_for, typical_availability,
        available_hours_week, contribution_score, rating_breakdown, badges, collaborations_count,
        departments_supported, people_helped, hours_contributed, bio, manager_id, password_hash, must_change_password)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26)`,
      [
        u.id, u.email, u.name, u.initials, u.role, u.systemRole || 'employee', u.status || 'active',
        u.department, u.campus, u.experienceYears || 0,
        JSON.stringify(u.primarySkills || []), JSON.stringify(u.interests || []),
        JSON.stringify(u.availableFor || []), u.typicalAvailability || '',
        hours, u.contributionScore || 0,
        JSON.stringify(u.ratingBreakdown || {}), JSON.stringify(u.badges || []),
        u.collaborationsCount || 0, u.departmentsSupportedCount || 0, u.peopleHelpedCount || 0,
        u.hoursContributed || 0, u.bio || '',
        inserted.has(u.managerId || '') ? u.managerId : null,
        u.systemRole === 'admin' ? adminHash : userHash,
        false
      ]
    );
    inserted.add(u.id);
  }
  // Demo user with NO registered manager (exercises the admin registration flow)
  await q(
    `INSERT INTO users (id, email, name, initials, role, system_role, status, department, campus,
      experience_years, primary_skills, interests, available_for, typical_availability,
      available_hours_week, contribution_score, rating_breakdown, badges, bio, manager_id, password_hash, must_change_password)
     VALUES ($1,$2,$3,$4,$5,'employee','active',$6,$7,$8,$9,$10,$11,$12,$13,$14,'{}','[]',$15,NULL,$16,FALSE)`,
    [
      'usr_nikhil', 'nikhil.verma@mercedes-benz.com', 'Nikhil Verma', 'NV', 'QA / Test Engineer',
      'PT-THIS', 'MBRDI Bengaluru Hub', 5,
      JSON.stringify(['Selenium', 'Playwright', 'Python', 'API Testing']),
      JSON.stringify(['Test Automation', 'Quality Engineering']),
      JSON.stringify(['Test Suite Reviews', 'Automation Pairing']),
      '4–6 hours/month', 5, 4.6,
      'QA automation engineer. Recently onboarded — manager assignment pending.',
      userHash
    ]
  );

  const nameToId = new Map<string, string>();
  for (const u of INITIAL_USER_ACCOUNTS) nameToId.set(u.name, u.id);
  nameToId.set('Nikhil Verma', 'usr_nikhil');
  const uid = (name?: string) => (name && nameToId.get(name)) || null;

  // ---- Work posts
  for (const p of INITIAL_WORK_POSTS) {
    const [effMin, effMax] = parseHoursRange(p.expectedEffortHours || '');
    const seats = Math.max(1, Math.min(3, Math.ceil((p.applicantCount || 1) / 2)));
    await q(
      `INSERT INTO work_posts (id, title, department, team, status, urgency, duration, effort_hours,
        effort_min, effort_max, location, approval_required, seats, tags, author_id, author_name,
        author_role, author_initials, description, why_opportunity, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)`,
      [
        String(p.id), p.title, p.department, p.team || '', STATUS_MAP[p.status] || 'Open',
        p.urgency, p.duration, p.expectedEffortHours, effMin, effMax, p.location,
        p.managerApprovalRequired, seats, JSON.stringify(p.tags || []),
        uid(p.author), p.author, String(p.role), p.initials,
        p.description, p.whyOpportunity || '', new Date(p.timestamp).toISOString()
      ]
    );
    for (const c of p.comments || []) {
      const authorId = uid(c.author);
      if (!authorId) continue;
      await q(
        `INSERT INTO work_comments (id, post_id, author_id, text, created_at) VALUES ($1,$2,$3,$4,$5)`,
        [String(c.id), String(p.id), authorId, c.text, new Date(c.timestamp).toISOString()]
      );
    }
  }

  // ---- Applications from seeded manager approvals (AI verdicts computed by the real engine)
  // Spread the demo engagements back over the last six months so the activity
  // chart has a real history to aggregate instead of one spike on install day.
  const decidedAt = (i: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() - ((INITIAL_MANAGER_APPROVALS.length - 1 - i) % 6));
    d.setDate(Math.min(28, 3 + (i * 5) % 25));
    return d.toISOString();
  };

  for (const [i, a] of INITIAL_MANAGER_APPROVALS.entries()) {
    const applicant = await one(`SELECT * FROM users WHERE id = $1`, [a.employeeId]);
    if (!applicant) continue;
    const post = await one(`SELECT * FROM work_posts WHERE id = $1`, [String(a.opportunityId)]);
    const [cMin, cMax] = parseHoursRange(a.requestedCommitment);
    const rec = computeRecommendation({
      applicantName: applicant.name,
      availableHoursWeek: applicant.available_hours_week,
      typicalAvailability: applicant.typical_availability,
      committedHours: 0,
      effortMin: cMin,
      effortMax: cMax,
      effortText: a.requestedCommitment,
      postTitle: a.opportunityTitle,
      postDepartment: post?.department || a.targetDepartment,
      applicantSkills: applicant.primary_skills || [],
      postTags: post ? (post.tags || []) : []
    });
    const status = a.status === 'Approved' || a.status === 'Approved with Conditions' ? 'approved'
      : a.status === 'Rejected' ? 'rejected' : 'pending';
    await q(
      `INSERT INTO applications (id, post_id, group_id, applicant_id, submitted_by, manager_id, note,
        commitment, status, ai_recommendation, ai_reason, manager_notes, decided_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [
        a.id, post ? String(a.opportunityId) : '101', a.id, a.employeeId, a.employeeId, a.managerId,
        `Current project: ${a.currentProject}. Period: ${a.period}.`,
        a.requestedCommitment, status, rec.verdict, rec.reason, a.managerNotes || '',
        status === 'pending' ? null : decidedAt(i)
      ]
    );
  }

  // ---- Historical completed engagements
  // Demo history so the activity chart and contribution tiers have something
  // real to aggregate on a fresh install. These are ordinary rows: completed
  // work posts with approved applications, spread over the last six months and
  // deliberately mixed across departments so cross-department synergy is
  // measurable rather than assumed.
  const historyPairs: Array<[string, string, string, number, string]> = [
    ['usr_rakesh', 'PT-THIA', 'Terraform modules for the GenAI inference cluster', 8, 'Cloud'],
    ['usr_priya', 'PT-THIS', 'LLM gateway rate-limiting review', 6, 'AI'],
    ['usr_arjun', 'PT-THIM', 'Telemetry pipeline for thermal rig exports', 10, 'Data'],
    ['usr_sneha', 'PT-THIT', 'CAN bus capture tooling for the security team', 6, 'Embedded'],
    ['usr_anand', 'PT-THIF', 'Thermal model cross-check for fuel-cell HARA', 12, 'CAE'],
    ['usr_vikram', 'PT-THIC', 'HiL rig automation for calibration sweeps', 8, 'Test'],
    ['usr_maya', 'PT-THIG', 'Motor efficiency curves for the test bench', 6, 'Calibration'],
    ['usr_rakesh', 'PT-THID', 'Kubernetes autoscaling for the BI workloads', 8, 'Cloud'],
    ['usr_priya', 'PT-THIP', 'RAG evaluation harness for release governance docs', 10, 'AI'],
    ['usr_arjun', 'PT-THIE', 'Kafka topic design for in-vehicle event capture', 8, 'Data'],
    ['usr_sneha', 'PT-THIA', 'Embedded profiling for on-device inference', 6, 'Embedded'],
    ['usr_anand', 'PT-THIS', 'Simulation workload sizing on the shared cluster', 8, 'CAE'],
    ['usr_vikram', 'PT-THIF', 'Fault-injection rig for ASIL D validation', 12, 'Test'],
    ['usr_maya', 'PT-THID', 'Signal decoding for calibration telemetry', 6, 'Calibration'],
    ['usr_rakesh', 'PT-THIT', 'Private endpoints and DNS for the platform VPC', 8, 'Cloud'],
    ['usr_priya', 'PT-THIM', 'Vision model for surface-defect screening', 10, 'AI'],
    ['usr_arjun', 'PT-THIG', 'Test-run analytics dashboard for the HiL fleet', 8, 'Data'],
    ['usr_sneha', 'PT-THIC', 'AUTOSAR adapter for calibration tooling', 6, 'Embedded']
  ];

  for (const [i, [helperId, deptNeedingHelp, title, hours, tag]] of historyPairs.entries()) {
    const when = new Date();
    when.setMonth(when.getMonth() - (5 - Math.floor(i / 3)));
    when.setDate(Math.min(28, 4 + (i * 7) % 22));
    const iso = when.toISOString();

    const postId = `wp_hist_${i}`;
    const appId = `app_hist_${i}`;
    const author = deptNeedingHelp === 'PT-THIA' ? 'usr_priya' : 'usr_elena';

    await q(
      `INSERT INTO work_posts (id, title, description, department, status, urgency, duration,
        effort_hours, effort_min, effort_max, location, approval_required, tags, author_id,
        seats, created_at)
       VALUES ($1,$2,$3,$4,'Completed','Medium','1 week',$5,$6,$6,'Remote / Hybrid',TRUE,$7,$8,1,$9)`,
      [
        postId, title, `Cross-department support delivered for ${deptNeedingHelp}.`,
        deptNeedingHelp, `${hours} hours`, hours, JSON.stringify([tag]), author, iso
      ]
    );

    await q(
      `INSERT INTO applications (id, post_id, group_id, applicant_id, submitted_by, manager_id,
        note, commitment, status, ai_recommendation, ai_reason, created_at, decided_at)
       VALUES ($1,$2,$1,$3,$3,NULL,'',$4,'approved','Approve','Capacity confirmed at the time of approval.',$5,$5)`,
      [appId, postId, helperId, `${hours} hours`, iso]
    );

    await q(
      `INSERT INTO bandwidth_ledger (id, user_id, application_id, post_id, hours, kind, note, created_at)
       VALUES ($1,$2,$3,$4,$5,'consumed',$6,$7)`,
      [`bl_hist_${i}`, helperId, appId, postId, hours, `Completed "${title.slice(0, 50)}"`, iso]
    );
  }

  // Bring contribution totals and tiers in line with the history just written.
  await q(
    `UPDATE users u SET
       hours_contributed = COALESCE(h.hours, 0),
       collaborations_count = COALESCE(h.gigs, 0),
       departments_supported = COALESCE(h.depts, 0)
     FROM (
       SELECT a.applicant_id AS uid,
              SUM(bl.hours)::int AS hours,
              COUNT(*)::int AS gigs,
              COUNT(DISTINCT wp.department)::int AS depts
         FROM applications a
         JOIN work_posts wp ON wp.id = a.post_id
         JOIN bandwidth_ledger bl ON bl.application_id = a.id
        WHERE a.status = 'approved' AND wp.status = 'Completed'
        GROUP BY a.applicant_id
     ) h
     WHERE u.id = h.uid`
  );

  // Award the tier each person's history actually earns, using the same ladder
  // the live completion path uses so seeded and earned tiers never disagree.
  const { rows: forTier } = await q(
    `SELECT id, hours_contributed, collaborations_count, departments_supported FROM users`
  );
  for (const t of forTier) {
    const earned = computeTier({
      hoursContributed: Number(t.hours_contributed || 0),
      collaborationsCount: Number(t.collaborations_count || 0),
      departmentsSupported: Number(t.departments_supported || 0)
    });
    await q(`UPDATE users SET tier = $1 WHERE id = $2`, [earned.name, t.id]);
  }

  // ---- Bandwidth offers
  for (const b of INITIAL_BANDWIDTH_OFFERS) {
    const authorId = uid(b.author) || uid(b.author.replace('Johannes Brandner', 'Dr. Johannes Brandner'));
    if (!authorId) continue;
    await q(
      `INSERT INTO bandwidth_offers (id, author_id, available_hours, skills, notes, created_at)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [b.id, authorId, b.availableHours, JSON.stringify(b.skillsOffered), b.notes, new Date(b.timestamp).toISOString()]
    );
  }

  // ---- Marketplace listings
  for (const l of INITIAL_MARKETPLACE_LISTINGS) {
    await q(
      `INSERT INTO listings (id, listing_type, title, price, currency, is_free, category, condition,
        location, seller_id, seller_name, seller_role, seller_initials, description, specs,
        event_date, ticket_quantity, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
      [
        String(l.id), l.listingType || 'Sell', l.title, l.price, l.currency || '€', l.isFree || false,
        l.category, String(l.condition), l.location, uid(l.seller), l.seller, String(l.sellerRole),
        l.initials, l.description, JSON.stringify(l.specs || {}), l.eventDate || null,
        l.ticketQuantity || null, new Date(l.timestamp).toISOString()
      ]
    );
  }

  // ---- Communities
  for (const g of INITIAL_COMMUNITIES) {
    await q(
      `INSERT INTO community_groups (id, name, category, icon, description, member_count, active_discussions, tags)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [g.id, g.name, g.category, g.icon, g.description, g.memberCount, g.activeDiscussions, JSON.stringify(g.tags)]
    );
  }
  const memberships: Array<[string, string]> = [
    ['grp_cloud', 'usr_rakesh'], ['grp_ai', 'usr_rakesh'],
    ['grp_cloud', 'usr_elena'], ['grp_ai', 'usr_priya'],
    ['grp_ev', 'usr_maya'], ['grp_cloud', 'usr_arjun']
  ];
  for (const [g, u] of memberships) {
    await q(`INSERT INTO group_members (group_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [g, u]);
  }

  // ---- Community posts
  for (const p of INITIAL_COMMUNITY_POSTS) {
    await q(
      `INSERT INTO community_posts (id, type, group_name, title, description, author_id, author_name,
        author_role, author_initials, location, date_info, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [
        String(p.id), p.type, p.groupName || null, p.title, p.description, uid(p.author), p.author,
        String(p.authorRole), p.initials, p.location || '', p.dateInfo || '', new Date(p.timestamp).toISOString()
      ]
    );
  }

  // ---- Knowledge questions & answers
  for (const kq of INITIAL_KNOWLEDGE_QUESTIONS) {
    await q(
      `INSERT INTO questions (id, title, details, author_id, author_name, author_role, author_initials,
        tags, votes, has_accepted, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        kq.id, kq.title, kq.details, uid(kq.author), kq.author, kq.authorRole, kq.initials,
        JSON.stringify(kq.tags), kq.votes, kq.hasAcceptedAnswer, new Date(kq.timestamp).toISOString()
      ]
    );
    for (const ans of kq.answers) {
      await q(
        `INSERT INTO answers (id, question_id, author_id, author_name, author_role, author_initials,
          text, accepted, likes, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          ans.id, kq.id, uid(ans.author), ans.author, String(ans.role), ans.initials,
          ans.text, ans.isAcceptedAnswer || false, ans.likes || 0, new Date(ans.timestamp).toISOString()
        ]
      );
    }
  }

  // ---- Carpool: split round-trip rides into one-way trips
  for (const r of INITIAL_CARPOOL_RIDES) {
    const days = daysFromSchedule(r.scheduleType, r.daysOfWeek);
    const trips: Array<{ id: string; direction: string; origin: string; destination: string; time: string }> = [
      { id: `${r.id}_am`, direction: 'to_office', origin: r.origin, destination: r.destination, time: r.departureTime }
    ];
    if (r.returnTime) {
      trips.push({ id: `${r.id}_pm`, direction: 'from_office', origin: r.destination, destination: r.origin, time: r.returnTime });
    }
    for (const t of trips) {
      await q(
        `INSERT INTO carpool_trips (id, driver_id, direction, origin, destination, campus, departure_time,
          days, vehicle_model, vehicle_type, seats_total, cost_per_ride, women_only, notes, amenities, status, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'active',$16)`,
        [
          t.id, r.driverId, t.direction, t.origin, t.destination, r.campus, t.time,
          JSON.stringify(days), r.vehicleModel, r.vehicleType, r.totalSeats,
          r.costSharingPerTrip || r.costPerRide || 'Free', r.womenOnly || false,
          r.notes || '', JSON.stringify(r.amenities || []), new Date(r.createdAt || Date.now()).toISOString()
        ]
      );
      for (const pax of r.passengers || []) {
        const riderId = nameToId.has(pax.name) ? nameToId.get(pax.name)! : (INITIAL_USER_ACCOUNTS.some(u => u.id === pax.id) ? pax.id : null);
        if (!riderId) continue;
        await q(
          `INSERT INTO carpool_bookings (id, trip_id, rider_id, days) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
          [newId('cb'), t.id, riderId, JSON.stringify(days)]
        );
      }
    }
  }

  // ---- Direct messages
  for (const m of INITIAL_DIRECT_MESSAGES) {
    const senderId = INITIAL_USER_ACCOUNTS.some(u => u.id === m.senderId) ? m.senderId : uid(m.senderName);
    const recipientId = INITIAL_USER_ACCOUNTS.some(u => u.id === m.recipientId) ? m.recipientId : uid(m.recipientName);
    if (!senderId || !recipientId) continue;
    await q(
      `INSERT INTO messages (id, sender_id, recipient_id, text, context_type, context_title, read, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [m.id, senderId, recipientId, m.text, m.contextType || 'general', m.contextTitle || '', m.read, new Date(m.timestamp).toISOString()]
    );
  }

  // ---- Collaboration requests
  for (const c of INITIAL_COLLABORATION_REQUESTS) {
    await q(
      `INSERT INTO collab_requests (id, requester_id, target_id, task_title, estimated_hours, dates, notes, status, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [c.id, c.requesterId, c.targetTalentId, c.taskTitle, c.estimatedHours, c.dates, c.notes, c.status, new Date(c.timestamp).toISOString()]
    );
  }

  // ---- Notifications
  for (const n of INITIAL_NOTIFICATIONS) {
    await q(
      `INSERT INTO notifications (id, recipient_id, recipient_role, type, title, description, target_tab, target_id, read, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        n.id, n.recipientId || null, n.recipientRole || null, n.type, n.title, n.description,
        n.targetTab || null, n.targetId != null ? String(n.targetId) : null, n.read, new Date(n.timestamp).toISOString()
      ]
    );
  }

  // ---- Saved items
  for (const [userId, saved] of Object.entries(INITIAL_USER_SAVED_MAP)) {
    for (const w of saved.workIds || []) {
      await q(`INSERT INTO saved_items (user_id, item_type, item_id) VALUES ($1,'work',$2) ON CONFLICT DO NOTHING`, [userId, String(w)]);
    }
    for (const l of saved.listingIds || []) {
      await q(`INSERT INTO saved_items (user_id, item_type, item_id) VALUES ($1,'listing',$2) ON CONFLICT DO NOTHING`, [userId, String(l)]);
    }
    for (const c of saved.communityIds || []) {
      await q(`INSERT INTO saved_items (user_id, item_type, item_id) VALUES ($1,'community',$2) ON CONFLICT DO NOTHING`, [userId, String(c)]);
    }
    for (const r of saved.carpoolIds || []) {
      await q(`INSERT INTO saved_items (user_id, item_type, item_id) VALUES ($1,'carpool',$2) ON CONFLICT DO NOTHING`, [userId, `${r}_am`]);
    }
  }

  // ---- Demo registration request (Nikhil has no registered manager)
  await q(
    `INSERT INTO registration_requests (id, requested_by, subject_name, subject_email, subject_kind,
      subject_role, subject_department, for_user_id, note, status)
     VALUES ($1,$2,$3,$4,'manager',$5,$6,$7,$8,'pending')`,
    [
      'reg_demo_1', 'usr_nikhil', 'Sandeep Iyer', 'sandeep.iyer@mercedes-benz.com',
      'Engineering Manager', 'PT-THIS', 'usr_nikhil',
      'Nikhil Verma joined the QA team last month; his manager Sandeep Iyer is not yet registered on MBXchange.'
    ]
  );
  await q(
    `INSERT INTO notifications (id, recipient_id, recipient_role, type, title, description, target_tab)
     VALUES ($1, NULL, 'admin', 'registration_request', $2, $3, 'admin')`,
    [
      newId('n'),
      'Registration Needed: Sandeep Iyer',
      'Nikhil Verma requires his manager Sandeep Iyer to be registered before approvals can flow.'
    ]
  );

  await q(
    `INSERT INTO audit_log (id, actor_id, action, subject, detail) VALUES ($1, NULL, 'seed', 'database', $2)`,
    [newId('aud'), JSON.stringify({ note: 'Demo dataset seeded' })]
  );

  console.log('[seed] done — demo data loaded');
}
