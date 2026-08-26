import React, { useEffect, useState } from 'react';
import { Flame, Sparkles, ArrowRight, HandHeart, Clock, Building2, Users } from 'lucide-react';
import { useStore } from '../lib/store';
import { api, timeAgo } from '../lib/api';
import { Card, Avatar, Chip, Button } from '../components/ui';

interface Award {
  id: string; message: string; createdAt: string;
  fromName: string; fromInitials: string; fromAvatarUrl: string;
  postTitle: string | null;
  badge: { id: string; name: string; icon: string; description: string; dimension: string } | null;
}

interface HeatmapRow {
  skill: string; requestsCount: number; expertsCount: number; status: string;
}

/**
 * The personal half of the dashboard: what you have actually contributed, how
 * you have been recognised, and where the organisation is short of a skill you
 * do not have yet.
 *
 * It is deliberately made of things the person can act on. Totals alone are a
 * scoreboard; paired with the gaps they are a next step.
 */
export function MyExchangePanel() {
  const s = useStore();
  const [awards, setAwards] = useState<Award[] | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapRow[]>([]);
  const [dimensions, setDimensions] = useState<Record<string, string>>({});

  useEffect(() => {
    api.get('/appreciations').then((d) => setAwards(d.appreciations)).catch(() => setAwards([]));
    api.get('/insights').then((d) => setHeatmap(d.heatmap || [])).catch(() => { /* non-fatal */ });
    api.get('/badges/catalogue').then((d) => setDimensions(d.dimensions)).catch(() => { /* non-fatal */ });
  }, []);

  const u = s.user;
  if (!u) return null;

  const impact = [
    { label: 'Hours given', value: `${u.hoursContributed ?? 0}h`, icon: <Clock className="w-3.5 h-3.5" /> },
    { label: 'Engagements', value: u.collaborationsCount ?? 0, icon: <HandHeart className="w-3.5 h-3.5" /> },
    { label: 'Departments', value: u.departmentsSupported ?? 0, icon: <Building2 className="w-3.5 h-3.5" /> },
    { label: 'Colleagues helped', value: u.peopleHelped ?? 0, icon: <Users className="w-3.5 h-3.5" /> }
  ];

  // Badge counts per dimension, scaled to the person's own strongest area so
  // the shape shows what they are known for.
  const breakdown = Object.entries(dimensions).map(([key, label]) => ({
    key, label, value: Number((u.ratingBreakdown as any)?.[key] ?? 0)
  }));
  const peak = Math.max(1, ...breakdown.map((b) => b.value));
  const hasRecognition = breakdown.some((b) => b.value > 0);

  // Skill gaps the person does not already cover — the honest version of
  // "what should I learn next".
  const mySkills = (u.primarySkills || []).map((x) => x.toLowerCase());
  const upskill = heatmap
    .filter((h) => h.status.startsWith('Gap'))
    .filter((h) => !mySkills.some((sk) =>
      h.skill.toLowerCase().includes(sk) || sk.includes(h.skill.toLowerCase().split(' ')[0])))
    .slice(0, 5);

  const recentAwards = (awards || []).filter((a) => a.badge).slice(0, 3);

  return (
    <section>
      <div className="flex items-center justify-between gap-2 mb-3">
        <h2 className="text-sm font-semibold text-ink">Your exchange</h2>
        <button
          onClick={() => s.setTab('achievements')}
          className="text-xs font-medium text-ink-2 hover:text-ink hover:underline underline-offset-2 flex items-center gap-1"
        >
          Achievements <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        {/* Impact + recognition shape */}
        <Card className="p-5 lg:col-span-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {impact.map((k) => (
              <div key={k.label} className="p-3 rounded-xl bg-surface-2">
                <span className="flex items-center gap-1.5 text-ink-3">
                  {k.icon}
                  <span className="text-xs font-medium">{k.label}</span>
                </span>
                <p className="text-xl font-bold tracking-tight text-ink mt-1.5 leading-none tabular-nums">{k.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-3 mb-2.5">
              What you are recognised for
            </p>
            {!hasRecognition ? (
              <p className="text-xs text-ink-2 leading-relaxed">
                No badges yet. Finish an engagement and the person you helped can award one —
                that is what fills this in.
              </p>
            ) : (
              <div className="space-y-2">
                {breakdown.map((b) => (
                  <div key={b.key} className="flex items-center gap-2.5">
                    <span className="text-xs font-medium text-ink-2 w-44 shrink-0 truncate">{b.label}</span>
                    <div className="flex-1 h-2 rounded-full bg-surface-2 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${(b.value / peak) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-ink w-5 text-right tabular-nums">{b.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {recentAwards.length > 0 && (
            <div className="mt-4 pt-4 border-t border-line">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-3 mb-2">Latest recognition</p>
              <div className="space-y-2">
                {recentAwards.map((a) => (
                  <div key={a.id} className="flex items-center gap-2.5">
                    <Avatar initials={a.fromInitials} size="sm" name={a.fromName} src={a.fromAvatarUrl} />
                    <span className="min-w-0 flex-1">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber">
                        <span aria-hidden="true">{a.badge!.icon}</span> {a.badge!.name}
                      </span>
                      <span className="block text-xs text-ink-3 truncate">
                        {a.fromName}{a.postTitle && ` · ${a.postTitle}`} · {timeAgo(a.createdAt)}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* What to learn next */}
        <Card className="p-5 flex flex-col">
          <p className="text-sm font-semibold text-ink flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber" /> Worth learning next
          </p>
          <p className="text-xs text-ink-2 mt-1 leading-relaxed">
            In demand across departments, and short of people who can do it.
          </p>

          {upskill.length === 0 ? (
            <p className="text-xs text-ink-3 mt-3 leading-relaxed">
              Nothing pressing — the skills in shortest supply are ones you already have.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {upskill.map((g) => (
                <span
                  key={g.skill}
                  title={`${g.requestsCount} requests · ${g.expertsCount} available experts`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-soft text-amber text-xs font-bold"
                >
                  <Flame className="w-3 h-3" /> {g.skill}
                </span>
              ))}
            </div>
          )}

          <div className="mt-auto pt-4 flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => s.setTab('learning')}>
              Find a session
            </Button>
            <Button size="sm" variant="ghost" onClick={() => s.setTab('insights')}>
              All gaps
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
}
