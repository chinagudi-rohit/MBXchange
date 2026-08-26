import React, { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { useStore } from '../lib/store';
import { api } from '../lib/api';
import { Card, Avatar, Chip, Select, EmptyState, RowSkeleton } from '../components/ui';

type Scope = 'organisation' | 'department' | 'team';
type Metric = 'score' | 'badges' | 'hours' | 'engagements' | 'departments';

interface Row {
  id: string; name: string; initials: string; role: string; department: string;
  avatarUrl: string; tier: string; rank: number; value: number;
}

const METRICS: Array<{ id: Metric; label: string; unit: (n: number) => string }> = [
  { id: 'score', label: 'Contribution score', unit: (n) => `${Number(n).toFixed(2)} / 5` },
  { id: 'badges', label: 'Badges earned', unit: (n) => `${n} badge${n === 1 ? '' : 's'}` },
  { id: 'hours', label: 'Hours contributed', unit: (n) => `${n}h` },
  { id: 'engagements', label: 'Engagements', unit: (n) => `${n}` },
  { id: 'departments', label: 'Departments reached', unit: (n) => `${n}` }
];

/** Only the top three get a medal — past that it is just a number. */
const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export function Leaderboard() {
  const s = useStore();
  const [scope, setScope] = useState<Scope>('organisation');
  const [metric, setMetric] = useState<Metric>('score');
  const [data, setData] = useState<{ rows: Row[]; me: Row | null; total: number; unavailable?: string } | null>(null);

  useEffect(() => {
    setData(null);
    api.get(`/leaderboard?scope=${scope}&metric=${metric}`).then(setData);
  }, [scope, metric]);

  const unit = METRICS.find((m) => m.id === metric)!.unit;
  const isManager = s.user?.systemRole === 'manager';

  const scopeLabels: Array<{ id: Scope; label: string; hint: string }> = [
    { id: 'organisation', label: 'Organisation', hint: 'Everyone on MBXchange' },
    { id: 'department', label: 'My department', hint: s.user?.department || '' },
    {
      id: 'team',
      label: isManager ? 'My reports' : 'My team',
      hint: isManager ? 'People who report to you' : 'Everyone under your manager'
    }
  ];

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
        <div>
          <h2 className="text-sm font-semibold text-ink flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber" /> Leaderboard
          </h2>
          <p className="text-xs text-ink-2 mt-0.5">
            {scopeLabels.find((x) => x.id === scope)?.hint}
            {data && ` · ${data.total} ${data.total === 1 ? 'person' : 'people'}`}
          </p>
        </div>
        <Select
          value={metric} onChange={(e) => setMetric(e.target.value as Metric)}
          aria-label="Rank by" className="w-auto"
        >
          {METRICS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
        </Select>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {scopeLabels.map((sc) => (
          <button
            key={sc.id} onClick={() => setScope(sc.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              scope === sc.id ? 'bg-primary-soft text-primary-text' : 'panel text-ink-2 hover:text-ink shadow-card'
            }`}
          >{sc.label}</button>
        ))}
      </div>

      {!data ? (
        <RowSkeleton count={5} />
      ) : data.unavailable === 'no-manager' ? (
        <EmptyState
          title="No team to rank"
          hint="You do not have a manager on record, so there is no peer group to compare against."
        />
      ) : data.rows.length === 0 ? (
        <EmptyState title="Nobody here yet" hint="Try a wider scope." />
      ) : (
        <Card className="divide-y divide-line">
          {data.rows.map((r) => {
            const isMe = r.id === s.user?.id;
            return (
              <div
                key={r.id}
                className={`p-3 sm:px-4 flex items-center gap-3 ${isMe ? 'bg-primary-soft/50' : ''}`}
              >
                <span className="w-8 shrink-0 text-center text-sm font-bold tabular-nums text-ink-2">
                  {MEDAL[r.rank] || r.rank}
                </span>
                <Avatar initials={r.initials} size="sm" name={r.name} src={r.avatarUrl} />
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-ink truncate">{r.name}</span>
                    {isMe && <Chip tone="primary">You</Chip>}
                  </span>
                  <span className="block text-xs text-ink-3 truncate">{r.role} · {r.tier}</span>
                </span>
                <span className="text-xs font-semibold text-ink shrink-0 tabular-nums">{unit(r.value)}</span>
              </div>
            );
          })}
        </Card>
      )}

      {/* If the viewer did not make the visible cut, show where they actually
          stand — a leaderboard you are absent from is demotivating noise. */}
      {data?.me && !data.rows.some((r) => r.id === data.me!.id) && (
        <Card className="mt-2 p-3 sm:px-4 flex items-center gap-3 bg-primary-soft/50">
          <span className="w-8 shrink-0 text-center text-sm font-bold tabular-nums text-ink-2">{data.me.rank}</span>
          <Avatar initials={data.me.initials} size="sm" name={data.me.name} src={data.me.avatarUrl} />
          <span className="flex-1 min-w-0">
            <span className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-ink truncate">{data.me.name}</span>
              <Chip tone="primary">You</Chip>
            </span>
            <span className="block text-xs text-ink-3 truncate">{data.me.role} · {data.me.tier}</span>
          </span>
          <span className="text-xs font-semibold text-ink shrink-0 tabular-nums">{unit(data.me.value)}</span>
        </Card>
      )}
    </section>
  );
}
