import React, { useEffect, useState } from 'react';
import { Briefcase, ListChecks, ShieldCheck, Zap, ArrowRight, Compass, Users, Plus, Cpu } from 'lucide-react';
import { useStore } from '../lib/store';
import { api, timeAgo } from '../lib/api';
import {
  Card, Chip, StatusBadge, UrgencyBadge, Button, SeatsIndicator, Avatar, Reveal
} from '../components/ui';
import { WorkFormModal } from './WorkExchange';

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

  const pendingMine = myRequests.filter((r) => ['pending', 'awaiting_registration'].includes(r.status));
  const activeMine = myRequests.filter((r) => r.status === 'approved' && r.postStatus !== 'Completed' && r.postStatus !== 'Cancelled');
  const openCount = s.posts.filter((p) => p.status === 'Open').length;
  const firstName = (s.user?.name || '').replace(/^(Dr\.|Mr\.|Ms\.)\s*/, '').split(' ')[0];

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

      <Reveal stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
            <Card key={p.id} className="p-5 h-full flex flex-col" onClick={() => { s.setTab('work'); s.setOpenWorkId(p.id); }}>
              <div className="flex items-center gap-1.5 flex-wrap mb-2">
                <Chip>{p.department}</Chip>
                <UrgencyBadge urgency={p.urgency} />
              </div>
              <h3 className="text-base font-semibold text-ink leading-snug">{p.title}</h3>
              {p.matchedSkills?.length > 0 && (
                <p className="text-xs text-ink-2 mt-2">
                  <span className="font-medium text-ink-2">Matches your stack:</span>{' '}
                  {p.matchedSkills.slice(0, 3).join(', ')}
                  {p.matchedSkills.length > 3 && ` +${p.matchedSkills.length - 3}`}
                </p>
              )}
              <div className="flex items-center justify-between mt-auto pt-3">
                <SeatsIndicator total={p.seats} filled={p.seatsFilled} />
                <span className="text-xs text-ink-3">{p.effortHours || p.duration}</span>
              </div>
            </Card>
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
            <p className="text-xs text-ink-2">Marketplace listings, carpool rides and communities — everything off-desk lives here.</p>
          </div>
        </div>
        <Button variant="soft" onClick={() => s.setTab('beyond')}>Explore <ArrowRight className="w-3.5 h-3.5" /></Button>
      </Card>

      <WorkFormModal open={newOpen} onClose={() => setNewOpen(false)} />
    </div>
  );
}
