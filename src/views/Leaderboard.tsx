import React, { useEffect, useState } from 'react';
import { Trophy, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '../lib/store';
import { api } from '../lib/api';
import { Card, Avatar, Chip, FilterSelect, Button, EmptyState, RowSkeleton } from '../components/ui';

type Scope = 'organisation' | 'department' | 'team';
type Metric = 'badges' | 'hours' | 'engagements' | 'departments';

interface Row {
  id: string; name: string; initials: string; role: string; department: string;
  avatarUrl: string; tier: string; rank: number; value: number;
}

/**
 * The contribution score is not among these on purpose. It is a personal
 * figure, shown to the person it belongs to; ranking everyone by it publicly
 * would turn this into a performance league table, which is not what the
 * platform is for. These four measure how widely someone has collaborated.
 */
const METRICS: Array<{ id: Metric; label: string; unit: (n: number) => string }> = [
  { id: 'badges', label: 'Badges earned', unit: (n) => `${n} badge${n === 1 ? '' : 's'}` },
  { id: 'hours', label: 'Hours contributed', unit: (n) => `${n}h` },
  { id: 'engagements', label: 'Engagements', unit: (n) => `${n}` },
  { id: 'departments', label: 'Departments reached', unit: (n) => `${n}` }
];

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

/** How many rows the collapsed list shows before "Show more". */
const PREVIEW = 5;
const PAGE = 15;

export function Leaderboard() {
  const s = useStore();
  const [scope, setScope] = useState<Scope>('organisation');
  const [metric, setMetric] = useState<Metric>('badges');
  const [rows, setRows] = useState<Row[] | null>(null);
  const [me, setMe] = useState<Row | null>(null);
  const [total, setTotal] = useState(0);
  const [unavailable, setUnavailable] = useState<string | undefined>();
  const [expanded, setExpanded] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPage = async (offset: number, limit: number, replace: boolean) => {
    const d = await api.get(`/leaderboard?scope=${scope}&metric=${metric}&limit=${limit}&offset=${offset}`);
    setRows((prev) => (replace || !prev ? d.rows : [...prev, ...d.rows]));
    setMe(d.me);
    setTotal(d.total);
    setUnavailable(d.unavailable);
  };

  // Collapse back to the preview whenever the view changes — an expanded list
  // of 20 000 people is not a sensible starting state for a new filter.
  useEffect(() => {
    setRows(null);
    setExpanded(false);
    fetchPage(0, PREVIEW, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, metric]);

  const expand = async () => {
    setLoadingMore(true);
    try {
      await fetchPage(0, PREVIEW + PAGE, true);
      setExpanded(true);
    } finally { setLoadingMore(false); }
  };

  const loadMore = async () => {
    if (!rows) return;
    setLoadingMore(true);
    try { await fetchPage(rows.length, PAGE, false); }
    finally { setLoadingMore(false); }
  };

  const collapse = async () => {
    await fetchPage(0, PREVIEW, true);
    setExpanded(false);
  };

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

  const renderRow = (r: Row, highlight: boolean) => (
    <div key={r.id} className={`p-3 sm:px-4 flex items-center gap-3 ${highlight ? 'bg-primary-soft/50' : ''}`}>
      <span className="w-8 shrink-0 text-center text-sm font-bold tabular-nums text-ink-2">
        {MEDAL[r.rank] || r.rank}
      </span>
      <Avatar initials={r.initials} size="sm" name={r.name} src={r.avatarUrl} />
      <span className="flex-1 min-w-0">
        <span className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-ink truncate">{r.name}</span>
          {highlight && <Chip tone="primary">You</Chip>}
        </span>
        <span className="block text-xs text-ink-3 truncate">{r.role} · {r.department}</span>
      </span>
      <span className="text-sm font-semibold text-ink shrink-0 tabular-nums">{unit(r.value)}</span>
    </div>
  );

  const meInList = !!(me && rows?.some((r) => r.id === me.id));
  const moreAvailable = !!rows && rows.length < total;

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
        <div>
          <h2 className="text-lg font-semibold text-ink flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber" /> Leaderboard
          </h2>
          <p className="text-xs text-ink-2 mt-0.5">
            {scopeLabels.find((x) => x.id === scope)?.hint}
            {total > 0 && ` · ${total.toLocaleString()} ${total === 1 ? 'person' : 'people'}`}
          </p>
        </div>
        <div className="w-full sm:w-56">
          <FilterSelect
            value={metric} onChange={(e) => setMetric(e.target.value as Metric)}
            aria-label="Rank by"
          >
            {METRICS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
          </FilterSelect>
        </div>
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

      {!rows ? (
        <RowSkeleton count={5} />
      ) : unavailable === 'no-manager' ? (
        <EmptyState
          title="No team to rank"
          hint="You do not have a manager on record, so there is no peer group to compare against."
        />
      ) : rows.length === 0 ? (
        <EmptyState title="Nobody here yet" hint="Try a wider scope." />
      ) : (
        <>
          <Card className="divide-y divide-line">
            {rows.map((r) => renderRow(r, r.id === s.user?.id))}
          </Card>

          {/* The list stays short by default. With thousands of colleagues an
              unbounded leaderboard would be the entire page. */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {!expanded && moreAvailable && (
              <Button variant="secondary" size="sm" onClick={expand} disabled={loadingMore}>
                <ChevronDown className="w-3.5 h-3.5" />
                {loadingMore ? 'Loading…' : `Show more (${total.toLocaleString()} total)`}
              </Button>
            )}
            {expanded && moreAvailable && (
              <Button variant="secondary" size="sm" onClick={loadMore} disabled={loadingMore}>
                <ChevronDown className="w-3.5 h-3.5" />
                {loadingMore ? 'Loading…' : `Load ${Math.min(PAGE, total - rows.length)} more`}
              </Button>
            )}
            {expanded && (
              <Button variant="ghost" size="sm" onClick={collapse}>
                <ChevronUp className="w-3.5 h-3.5" /> Collapse
              </Button>
            )}
            {rows.length >= total && total > PREVIEW && (
              <span className="text-xs text-ink-3">Showing all {total.toLocaleString()}</span>
            )}
          </div>
        </>
      )}

      {/* Where the viewer actually stands, when they are off the visible page. */}
      {me && !meInList && !unavailable && (
        <Card className="mt-2 divide-y divide-line">{renderRow(me, true)}</Card>
      )}
    </section>
  );
}
