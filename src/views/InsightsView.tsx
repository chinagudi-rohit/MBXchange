import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Lightbulb, Building2, Flame } from 'lucide-react';
import { useStore } from '../lib/store';
import { api } from '../lib/api';

// three.js is ~150KB gzipped and only two views ever draw with it, so it is
// split out of the initial bundle rather than paid for on first page load.
const SkillGlobe3D = React.lazy(() =>
  import('../components/SkillGlobe3D').then((m) => ({ default: m.SkillGlobe3D }))
);
import {
  Card, Chip, Button, EmptyState, RowSkeleton, Reveal
} from '../components/ui';

interface HeatmapRow {
  skill: string;
  demandScore: number;
  supplyScore: number;
  requestsCount: number;
  expertsCount: number;
  status: string;
}

const STATUS_META: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  'Gap (High Demand, Low Supply)': {
    label: 'Skill gap', cls: 'bg-red-soft text-red', icon: <TrendingUp className="w-3 h-3" />
  },
  'Balanced': {
    label: 'Balanced', cls: 'bg-green-soft text-green', icon: <Minus className="w-3 h-3" />
  },
  'High Availability': {
    label: 'Surplus', cls: 'bg-blue-soft text-blue', icon: <TrendingDown className="w-3 h-3" />
  }
};

export function InsightsView() {
  const s = useStore();
  const [data, setData] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'gaps' | 'surplus'>('all');

  useEffect(() => { api.get('/insights').then(setData); }, []);

  if (!data) return <RowSkeleton count={6} />;

  const heatmap: HeatmapRow[] = data.heatmap || [];
  const gaps = heatmap.filter((h) => h.status.startsWith('Gap'));
  const rows = filter === 'gaps' ? gaps
    : filter === 'surplus' ? heatmap.filter((h) => h.status === 'High Availability')
    : heatmap;

  // Skills the user does NOT already have → personal upskilling suggestions
  const mySkills = (s.user?.primarySkills || []).map((x) => x.toLowerCase());
  const upskill = gaps.filter((g) =>
    !mySkills.some((sk) => g.skill.toLowerCase().includes(sk) || sk.includes(g.skill.toLowerCase().split(' ')[0]))
  ).slice(0, 4);

  // Organisation totals, summed from the same user records the directory shows.
  const orgTotals = (() => {
    const contributors = s.users.filter((u) => (u.hoursContributed || 0) > 0);
    const hours = contributors.reduce((sum, u) => sum + (u.hoursContributed || 0), 0);
    const gigs = contributors.reduce((sum, u) => sum + (u.collaborationsCount || 0), 0);
    const multiDept = contributors.filter((u) => (u.departmentsSupported || 0) > 1).length;
    return {
      hours, gigs,
      people: contributors.length,
      crossPct: contributors.length ? Math.round((multiDept / contributors.length) * 100) : 0
    };
  })();

  const maxDeptPosts = Math.max(1, ...data.departmentLoad.map((d: any) => d.posts));
  const maxMentions = Math.max(1, ...(data.topDemand || []).map((d: any) => d.mentions));

  return (
    <div className="anim-fade-up space-y-14">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Capability Insights</h1>
        <p className="text-xs text-ink-2 mt-0.5">
          Where the organisation needs skills, where it has spare capacity — open to everyone
        </p>
      </div>

      {/* Headline numbers — all computed from live records, not fixed samples */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Hours contributed', value: `${orgTotals.hours}h`, hint: 'Across completed engagements' },
          { label: 'Completed engagements', value: orgTotals.gigs, hint: 'Approved and finished' },
          { label: 'Active contributors', value: orgTotals.people, hint: 'People who have helped' },
          { label: 'Cross-department share', value: `${orgTotals.crossPct}%`, hint: 'Helper outside the requesting team' }
        ].map((k) => (
          <Card key={k.label} className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-3">{k.label}</p>
            <p className="text-2xl font-bold tracking-tight text-ink mt-2 leading-none tabular-nums">{k.value}</p>
            <p className="text-xs text-ink-3 mt-1.5">{k.hint}</p>
          </Card>
        ))}
      </div>

      {/* Personal upskilling callout */}
      {upskill.length > 0 && (
        <Card className="p-7">
          <div className="flex items-start gap-3.5">
            <span className="w-10 h-10 rounded-2xl bg-amber-soft text-amber flex items-center justify-center shrink-0">
              <Lightbulb className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-normal text-ink">Upskilling opportunities for you</p>
              <p className="text-xs text-ink-2 mt-0.5 leading-relaxed">
                These capabilities are in high demand across departments but short on available experts.
                Building them makes you a strong match for cross-department requests.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {upskill.map((u) => (
                  <span key={u.skill} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-soft text-amber text-xs font-bold">
                    <Flame className="w-3 h-3" /> {u.skill}
                    <span className="font-medium opacity-80">· {u.requestsCount} requests / {u.expertsCount} experts</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* The same heatmap the table below breaks down, read at a glance:
          one node per capability, sized by demand and lit when experts are short. */}
      <React.Suspense fallback={<div className="panel rounded-2xl shadow-card h-96 mb-6" />}>
        <SkillGlobe3D skills={heatmap} className="mb-6" onSelectSkill={() => setFilter('gaps')} />
      </React.Suspense>

      {/* Heatmap */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h2 className="text-sm font-semibold text-ink">Demand vs supply by capability</h2>
          <div className="flex gap-1.5 panel rounded-xl p-1 shadow-card">
            {([
              ['all', `All capabilities (${heatmap.length})`],
              ['gaps', `Skill gaps (${gaps.length})`],
              ['surplus', 'Spare capacity']
            ] as const).map(([v, label]) => (
              <button
                key={v} onClick={() => setFilter(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filter === v ? 'bg-primary text-on-primary' : 'text-ink-2 hover:text-ink'
                }`}
              >{label}</button>
            ))}
          </div>
        </div>

        {rows.length === 0 ? (
          <EmptyState title="No capabilities in this view" hint="Switch the filter to see the full list." />
        ) : (
          <Card className="divide-y divide-line">
            {rows.map((h, i) => {
              const meta = STATUS_META[h.status] || STATUS_META['Balanced'];
              return (
                <Reveal key={h.skill} className="p-4 sm:px-5 flex flex-wrap items-center gap-x-4 gap-y-3">
                  <div className="min-w-44 flex-1">
                    <p className="text-sm font-normal text-ink">{h.skill}</p>
                    <p className="text-xs text-ink-3 mt-0.5">
                      {h.requestsCount} requests · {h.expertsCount} available experts
                    </p>
                  </div>

                  <div className="flex-1 min-w-52 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-ink-3 w-14 shrink-0">Demand</span>
                      <div className="flex-1 h-2 rounded-full bg-surface-2 overflow-hidden">
                        <div className="h-full rounded-full bg-primary draw-x"
                          style={{ width: `${h.demandScore}%`, transitionDelay: `${i * 30}ms` }} />
                      </div>
                      <span className="text-xs font-semibold text-ink-2 w-7 text-right">{h.demandScore}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-ink-3 w-14 shrink-0">Supply</span>
                      <div className="flex-1 h-2 rounded-full bg-surface-2 overflow-hidden">
                        <div className={`h-full rounded-full draw-x ${h.supplyScore < h.demandScore ? 'bg-red' : 'bg-green'}`}
                          style={{ width: `${h.supplyScore}%`, transitionDelay: `${i * 30 + 80}ms` }} />
                      </div>
                      <span className="text-xs font-semibold text-ink-2 w-7 text-right">{h.supplyScore}</span>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold shrink-0 ${meta.cls}`}>
                    {meta.icon} {meta.label}
                  </span>
                </Reveal>
              );
            })}
          </Card>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Live demand from open posts */}
        <section>
          <h2 className="text-sm font-semibold text-ink mb-3">Most requested skills right now</h2>
          <Card className="p-7">
            {(data.topDemand || []).length === 0 ? (
              <p className="text-xs text-ink-3">No open requirements with skill tags yet.</p>
            ) : (
              <div className="space-y-2.5">
                {data.topDemand.map((d: any, i: number) => (
                  <div key={d.skill} className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-ink-2 w-28 shrink-0 truncate">{d.skill}</span>
                    <div className="flex-1 h-2.5 rounded-full bg-surface-2 overflow-hidden">
                      <div className="h-full rounded-full bg-violet anim-grow-x"
                        style={{ width: `${(d.mentions / maxMentions) * 100}%`, animationDelay: `${i * 50}ms` }} />
                    </div>
                    <span className="text-xs font-semibold text-ink w-5 text-right">{d.mentions}</span>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-ink-3 mt-3.5">
              Live from open and in-progress requirements across all departments.
            </p>
          </Card>
        </section>

        {/* Department load */}
        <section>
          <h2 className="text-sm font-semibold text-ink mb-3">Requirements by department</h2>
          <Card className="p-7">
            <div className="space-y-2.5">
              {data.departmentLoad.map((d: any, i: number) => (
                <div key={d.department} className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-ink-2 w-20 shrink-0">
                    <Building2 className="w-3 h-3 text-ink-3" /> {d.department}
                  </span>
                  <div className="flex-1 h-2.5 rounded-full bg-surface-2 overflow-hidden">
                    <div className="h-full rounded-full bg-blue anim-grow-x"
                      style={{ width: `${(d.posts / maxDeptPosts) * 100}%`, animationDelay: `${i * 50}ms` }} />
                  </div>
                  <span className="text-xs font-semibold text-ink w-12 text-right">{d.open} open</span>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </div>

      <Card className="p-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-ink-2">
          Spotted a gap you can fill? Declare your bandwidth so matching squads can find you.
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => s.setProfileOpen(true)}>Update bandwidth</Button>
          <Button size="sm" onClick={() => s.setTab('work')}>Browse opportunities</Button>
        </div>
      </Card>
    </div>
  );
}
