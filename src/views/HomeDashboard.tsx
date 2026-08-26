import React, { useEffect, useState } from 'react';
import {
  Briefcase, ListChecks, ShieldCheck, Zap, ArrowRight, Compass, Users, Plus, Cpu,
  Award, Search, HandHeart
} from 'lucide-react';
import { useStore } from '../lib/store';
import { api, timeAgo } from '../lib/api';
import {
  Card, Chip, StatusBadge, UrgencyBadge, Button, SeatsIndicator, Avatar, Reveal
} from '../components/ui';
import { WorkFormModal } from './WorkExchange';
import { ActivityTelemetry } from './ActivityTelemetry';
import { TiltCard } from '../components/TiltCard';
import { MatchBadge } from '../components/Match';

// The tier solid carries real information (which tier is held); three.js is
// heavy, so it loads lazily rather than blocking the dashboard's first paint.
const TierCrystal3D = React.lazy(() =>
  import('../components/TierCrystal3D').then((m) => ({ default: m.TierCrystal3D }))
);

export function HomeDashboard() {
  const s = useStore();
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [newOpen, setNewOpen] = useState(false);
  const [recs, setRecs] = useState<{ items: any[]; configured: boolean }>({ items: [], configured: true });

  useEffect(() => {
    api.get('/requests/mine').then((d) => setMyRequests(d.applications || []));
  }, []);

  // Recommendations are ranked server-side against the user's specialisation
  // and tech stack, so re-fetch whenever the profile changes.
  useEffect(() => {
    api.get('/recommendations').then((d) =>
      setRecs({ items: d.recommendations || [], configured: d.stackConfigured })
    );
  }, [s.user?.specialisation, s.user?.primarySkills, s.user?.interests]);

  const recommended = recs.items.slice(0, 6);

  const pendingMine = myRequests.filter((r) => ['pending_author', 'pending_manager', 'awaiting_registration'].includes(r.status));
  const activeMine = myRequests.filter((r) => r.status === 'approved' && r.postStatus !== 'Completed' && r.postStatus !== 'Cancelled');
  const openCount = s.posts.filter((p) => p.status === 'Open').length;
  const firstName = (s.user?.name || '').replace(/^(Dr\.|Mr\.|Ms\.)\s*/, '').split(' ')[0];

  // Tier ladder mirrored from the server so the dashboard can show progress
  // toward the next rung without an extra round-trip.
  const TIER_LADDER = [
    { name: 'Contributor', icon: '\u25c7', hours: 0, gigs: 0, depts: 0 },
    { name: 'Collaborator', icon: '\u25c6', hours: 10, gigs: 2, depts: 1 },
    { name: 'Connector', icon: '\u2726', hours: 40, gigs: 5, depts: 2 },
    { name: 'Catalyst', icon: '\u2727', hours: 100, gigs: 12, depts: 3 },
    { name: 'Principal', icon: '\u2605', hours: 250, gigs: 25, depts: 5 }
  ];
  const currentTierName = s.user?.tier || 'Contributor';
  const tierIdx = Math.max(0, TIER_LADDER.findIndex((t) => t.name === currentTierName));
  const tierIcon = TIER_LADDER[tierIdx]?.icon || '\u25c7';
  const nextTier = TIER_LADDER[tierIdx + 1];
  const tierProgress = (() => {
    if (!nextTier || !s.user) return null;
    const h = s.user.hoursContributed || 0;
    const g = s.user.collaborationsCount || 0;
    const d = s.user.departmentsSupported || 0;
    const needs: string[] = [];
    if (nextTier.hours > h) needs.push(`${nextTier.hours - h}h more`);
    if (nextTier.gigs > g) needs.push(`${nextTier.gigs - g} more ${nextTier.gigs - g === 1 ? 'engagement' : 'engagements'}`);
    if (nextTier.depts > d) needs.push(`${nextTier.depts - d} more ${nextTier.depts - d === 1 ? 'department' : 'departments'}`);
    if (needs.length === 0) return null;
    const pct = Math.min(100, Math.round((h / Math.max(1, nextTier.hours)) * 100));
    return { next: nextTier.name, needs: needs.join(', '), pct };
  })();

  const stats = [
    { label: 'Open opportunities', value: openCount, icon: <Briefcase className="w-4 h-4" />, tab: 'work' as const },
    { label: 'My pending requests', value: pendingMine.length, icon: <ListChecks className="w-4 h-4" />, tab: 'requests' as const },
    { label: 'Active engagements', value: activeMine.length, icon: <Zap className="w-4 h-4" />, tab: 'requests' as const },
    ...(s.user?.systemRole !== 'employee'
      ? [{ label: 'Approvals waiting on me', value: s.counts.pendingApprovals, icon: <ShieldCheck className="w-4 h-4" />, tab: 'manager' as const }]
      : [])
  ];

  return (
    <div className="anim-fade-up space-y-14">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Welcome back, {firstName}</h1>
          <p className="text-sm text-ink-2 mt-1">
            Find help, lend your skills, and keep cross-department work moving.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => s.setTab('people')}>
            <Users className="w-4 h-4" /> Find People
          </Button>
          <Button onClick={() => setNewOpen(true)}>
            <Plus className="w-4 h-4" /> Post Requirement
          </Button>
        </div>
      </div>

      {/* Column count follows the number of tiles — employees see three and
          managers four, and neither should leave a gap at the end of the row. */}
      <Reveal
        stagger
        className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${
          stats.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
        }`}
      >
        {stats.map((st) => (
          <Card key={st.label} className="p-6" onClick={() => s.setTab(st.tab)}>
            <span className="flex items-center gap-2 text-ink-3">
              {st.icon}
              <span className="text-xs font-medium uppercase tracking-wide">{st.label}</span>
            </span>
            <span className="block text-2xl font-bold tracking-tight text-ink mt-3 leading-none">{st.value}</span>
          </Card>
        ))}
      </Reveal>

      {/* Post a requirement is the product's core action, so it gets a permanent
          home on the dashboard rather than living only in the header. */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        {/* The tier card beside this one is naturally tall, and short tiles left
            a dead band across the bottom of this card. The tiles stretch to the
            shared row height instead — filling it with the action itself rather
            than with decoration, since the accent in this row is already spent
            on the tier solid next door. */}
        <Card className="p-5 lg:col-span-2 flex flex-col">
          <h2 className="text-sm font-semibold text-ink mb-3.5">Quick actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 flex-1">
            {[
              { label: 'Post a requirement', hint: 'Ask for help', icon: <Plus className="w-4 h-4" />, tone: 'primary', onClick: () => setNewOpen(true) },
              { label: 'Offer bandwidth', hint: 'Lend your time', icon: <Zap className="w-4 h-4" />, tone: 'green', onClick: () => { s.setTab('work'); } },
              { label: 'Find experts', hint: 'Search people', icon: <Search className="w-4 h-4" />, tone: 'violet', onClick: () => s.setTab('people') },
              { label: 'My requests', hint: 'Track progress', icon: <ListChecks className="w-4 h-4" />, tone: 'amber', onClick: () => s.setTab('requests') }
            ].map((a) => (
              <button
                key={a.label}
                onClick={a.onClick}
                className="p-3.5 rounded-xl bg-surface-2 hover:bg-surface border border-transparent hover:border-line-strong text-left transition-all group flex flex-col"
              >
                <span className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                  a.tone === 'primary' ? 'bg-primary text-on-primary'
                  : a.tone === 'green' ? 'bg-green-soft text-green'
                  : a.tone === 'violet' ? 'bg-violet-soft text-violet'
                  : 'bg-amber-soft text-amber'
                }`}>
                  {a.icon}
                </span>
                {/* Label sits on the floor of the tile, so a taller tile reads as
                    deliberate rather than as a short label floating in a box. */}
                <span className="block text-xs font-semibold text-ink leading-tight mt-auto pt-3">{a.label}</span>
                <span className="block text-xs text-ink-3 mt-0.5">{a.hint}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Contribution tier — earned from completed work, not assigned */}
        <Card className="p-5 flex flex-col">
          <h2 className="text-sm font-semibold text-ink flex items-center gap-2">
            <Award className="w-4 h-4 text-amber" /> Your tier
          </h2>
          <div className="flex items-center gap-3 mt-3.5">
            {/* The solid gains a face count per rung of the ladder, so the badge
                shows the tier rather than just sitting next to its name. Falls
                back to the flat glyph wherever WebGL is unavailable. */}
            <span className="w-12 h-12 rounded-2xl bg-amber-soft text-amber flex items-center justify-center text-xl shrink-0 overflow-hidden">
              <React.Suspense fallback={<span>{tierIcon}</span>}>
                <TierCrystal3D
                  tier={s.user?.tier || 'Contributor'}
                  className="w-full h-full"
                  fallback={<span>{tierIcon}</span>}
                />
              </React.Suspense>
            </span>
            <div className="min-w-0">
              <p className="text-base font-semibold text-ink leading-tight">{s.user?.tier || 'Contributor'}</p>
              <p className="text-xs text-ink-3 mt-0.5">
                {s.user?.hoursContributed ?? 0}h · {s.user?.collaborationsCount ?? 0} engagements
              </p>
            </div>
          </div>
          {(s.user?.badges?.length || 0) > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {s.user!.badges.slice(0, 3).map((b) => (
                <span
                  key={b.id}
                  title={`${b.name} — ${b.description}`}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-2 text-ink-2 text-xs font-medium max-w-36"
                >
                  <span aria-hidden="true">{b.icon}</span>
                  <span className="truncate">{b.name}</span>
                </span>
              ))}
            </div>
          )}
          <button
            onClick={() => s.setTab('achievements')}
            className="text-xs font-semibold text-primary-text hover:underline underline-offset-2 text-left mt-3"
          >
            See milestones and recognition →
          </button>
          {tierProgress && (
            <div className="mt-auto pt-4">
              <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
                <div className="h-full rounded-full bg-amber transition-all" style={{ width: `${tierProgress.pct}%` }} />
              </div>
              <p className="text-xs text-ink-3 mt-2 leading-relaxed">
                {tierProgress.needs} to reach <b className="text-ink-2">{tierProgress.next}</b>
              </p>
            </div>
          )}
        </Card>
      </div>

      <ActivityTelemetry />

      {/* Prompt to configure the stack — recommendations depend on it */}
      {!recs.configured && (
        <Card className="p-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <span className="w-10 h-10 rounded-2xl bg-primary-soft text-primary-text flex items-center justify-center shrink-0">
              <Cpu className="w-5 h-5" />
            </span>
            <div>
              <p className="text-sm font-normal text-ink">Add your specialisation</p>
              <p className="text-xs text-ink-2">
                Tell us your tech stack and we'll rank opportunities against it instead of showing everything.
              </p>
            </div>
          </div>
          <Button onClick={() => s.setProfileOpen(true)}>Set up my stack</Button>
        </Card>
      )}

      <section>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-ink">Recommended for you</h2>
            {s.user?.specialisation && (
              <Chip tone="primary">matched to {s.user.specialisation}</Chip>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => s.setProfileOpen(true)} className="text-xs font-semibold text-ink-2 hover:text-ink">
              Tune my stack
            </button>
            <button onClick={() => s.setTab('work')} className="text-xs font-medium text-ink-2 hover:text-ink hover:underline underline-offset-2 flex items-center gap-1">
              All opportunities <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
        <Reveal stagger className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {recommended.map((p: any) => (
            <TiltCard key={p.id}>
            <Card className="p-5 h-full flex flex-col" onClick={() => { s.setTab('work'); s.setOpenWorkId(p.id); }}>
              <div className="flex items-center gap-1.5 flex-wrap mb-2">
                <MatchBadge score={p.matchScore} />
                <Chip>{p.department}</Chip>
                <UrgencyBadge urgency={p.urgency} />
              </div>
              <h3 className="text-base font-semibold text-ink leading-snug">{p.title}</h3>
              {p.matchReason && (
                <p className="text-xs text-ink-2 mt-2 leading-relaxed line-clamp-2" title={p.matchReason}>
                  {p.matchReason}
                </p>
              )}
              <div className="flex items-center justify-between mt-auto pt-3">
                <SeatsIndicator total={p.seats} filled={p.seatsFilled} />
                <span className="text-xs text-ink-3">{p.effortHours || p.duration}</span>
              </div>
            </Card>
            </TiltCard>
          ))}
          {recommended.length === 0 && (
            <Card className="p-6 md:col-span-2 xl:col-span-3 text-center">
              <p className="text-sm text-ink-2">No open opportunities right now — post one to get help from other squads.</p>
            </Card>
          )}
        </Reveal>
      </section>

      {pendingMine.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-ink">My pending requests</h2>
            <button onClick={() => s.setTab('requests')} className="text-xs font-medium text-ink-2 hover:text-ink hover:underline underline-offset-2 flex items-center gap-1">
              My Requests <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {pendingMine.slice(0, 3).map((r) => (
              <Card key={r.id} className="px-4.5 px-5 py-3.5 flex items-center gap-3" onClick={() => s.setTab('requests')}>
                <Avatar initials={r.applicantInitials} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-ink truncate">{r.postTitle}</p>
                  <p className="text-xs text-ink-3">
                    {r.applicantId === s.user?.id ? 'You' : r.applicantName} · {r.commitment || r.postEffort} · {timeAgo(r.createdAt)}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </Card>
            ))}
          </div>
        </section>
      )}

      <Card className="p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <span className="w-10 h-10 rounded-2xl bg-violet-soft text-violet flex items-center justify-center">
            <Compass className="w-5 h-5" />
          </span>
          <div>
            <p className="text-sm font-normal text-ink">Beyond Work</p>
            <p className="text-xs text-ink-2">Carpool rides and communities — everything off-desk lives here.</p>
          </div>
        </div>
        <Button variant="soft" onClick={() => s.setTab('beyond')}>Explore <ArrowRight className="w-3.5 h-3.5" /></Button>
      </Card>

      <WorkFormModal open={newOpen} onClose={() => setNewOpen(false)} />
    </div>
  );
}
