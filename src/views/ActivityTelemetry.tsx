import React, { useEffect, useState } from 'react';
import { Activity, TrendingUp, HelpCircle } from 'lucide-react';
import { api } from '../lib/api';
import { Card, Skeleton } from '../components/ui';

interface Point {
  label: string;
  key: string;
  gigs: number;
  hours: number;
  people: number;
  crossDept: number;
  synergy: number;
}

type Metric = 'hours' | 'synergy' | 'gigs';

const METRICS: Array<{ id: Metric; label: string; suffix: string }> = [
  { id: 'hours', label: 'Hours', suffix: 'h' },
  { id: 'synergy', label: 'Synergy', suffix: '%' },
  { id: 'gigs', label: 'Engagements', suffix: '' }
];

/**
 * Six months of exchange activity, computed server-side from real applications.
 *
 * The curve is generated from the returned values rather than drawn as a fixed
 * path, so an empty month reads as empty instead of as a flourish.
 */
export function ActivityTelemetry() {
  const [data, setData] = useState<{ series: Point[]; synergyDefinition: string } | null>(null);
  const [scope, setScope] = useState<'org' | 'me'>('org');
  const [metric, setMetric] = useState<Metric>('hours');
  const [active, setActive] = useState<number | null>(null);
  const [explain, setExplain] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.get(`/telemetry?scope=${scope}`).then((d) => { if (!cancelled) setData(d); });
    return () => { cancelled = true; };
  }, [scope]);

  if (!data) {
    return (
      <Card className="p-6">
        <Skeleton className="h-4 w-48 mb-4" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </Card>
    );
  }

  const series = data.series;
  const values = series.map((p) => p[metric]);
  const max = Math.max(1, ...values);
  const suffix = METRICS.find((m) => m.id === metric)!.suffix;

  // Geometry — a plain polyline through the real values.
  const W = 700;
  const H = 150;
  const padY = 14;
  const stepX = series.length > 1 ? W / (series.length - 1) : W;
  const pts = values.map((v, i) => ({
    x: i * stepX,
    y: H - padY - (v / max) * (H - padY * 2)
  }));
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = `${line} L ${W},${H} L 0,${H} Z`;

  const shown = active ?? series.length - 1;
  const point = series[shown];
  const prev = shown > 0 ? series[shown - 1] : null;
  const delta = prev ? point[metric] - prev[metric] : 0;

  const total = series.reduce((sum, p) => sum + p.hours, 0);

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="text-sm font-semibold text-ink flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary-text" />
            Exchange activity
          </h2>
          <p className="text-xs text-ink-2 mt-0.5">
            {total}h of cross-team work over the last six months
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex gap-0.5 p-0.5 rounded-lg bg-surface-2">
            {(['org', 'me'] as const).map((sc) => (
              <button
                key={sc}
                onClick={() => { setScope(sc); setData(null); setActive(null); }}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  scope === sc ? 'bg-surface text-ink shadow-card' : 'text-ink-3 hover:text-ink-2'
                }`}
              >
                {sc === 'org' ? 'Everyone' : 'Me'}
              </button>
            ))}
          </div>
          <div className="flex gap-0.5 p-0.5 rounded-lg bg-surface-2">
            {METRICS.map((m) => (
              <button
                key={m.id}
                onClick={() => setMetric(m.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  metric === m.id ? 'bg-surface text-ink shadow-card' : 'text-ink-3 hover:text-ink-2'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Readout for the highlighted month */}
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4 p-3.5 rounded-xl bg-surface-2">
        <div>
          <p className="text-xs font-semibold text-ink">{point.label}</p>
          <p className="text-xs text-ink-3 mt-0.5">
            {point.gigs} {point.gigs === 1 ? 'engagement' : 'engagements'}
            {point.crossDept > 0 && ` · ${point.crossDept} across departments`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-semibold text-ink tabular-nums leading-none">
            {point[metric]}{suffix}
          </p>
          {prev && delta !== 0 && (
            <p className={`text-xs font-semibold mt-1 flex items-center gap-1 justify-end ${delta > 0 ? 'text-green' : 'text-ink-3'}`}>
              <TrendingUp className={`w-3 h-3 ${delta < 0 ? 'rotate-180' : ''}`} />
              {delta > 0 ? '+' : ''}{delta}{suffix} vs {prev.label}
            </p>
          )}
        </div>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-36 overflow-visible"
          preserveAspectRatio="none"
          role="img"
          aria-label={`${metric} by month`}
        >
          <defs>
            <linearGradient id="telemetryFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.18" />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0.25, 0.5, 0.75].map((f) => (
            <line
              key={f} x1="0" x2={W} y1={H * f} y2={H * f}
              stroke="var(--color-line)" strokeWidth="1" strokeDasharray="3 4"
            />
          ))}

          <path d={area} fill="url(#telemetryFill)" />
          <path d={line} fill="none" stroke="var(--color-primary)" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />

          {pts.map((p, i) => (
            <g key={i}>
              {shown === i && (
                <line x1={p.x} x2={p.x} y1="0" y2={H} stroke="var(--color-primary)"
                  strokeWidth="1" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
              )}
              <circle
                cx={p.x} cy={p.y} r={shown === i ? 5 : 3.5}
                fill={shown === i ? 'var(--color-surface-solid)' : 'var(--color-primary)'}
                stroke="var(--color-primary)" strokeWidth={shown === i ? 3 : 0}
                vectorEffect="non-scaling-stroke"
              />
              {/* Generous invisible hit area — the dots alone are too small to aim at */}
              <rect
                x={p.x - stepX / 2} y="0" width={stepX} height={H}
                fill="transparent" className="cursor-pointer"
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                tabIndex={0}
                role="button"
                aria-label={`${series[i].label}: ${series[i][metric]}${suffix}`}
              />
            </g>
          ))}
        </svg>

        <div className="flex justify-between mt-2">
          {series.map((p, i) => (
            <button
              key={p.key}
              onClick={() => setActive(i)}
              className={`text-xs font-medium transition-colors ${
                shown === i ? 'text-primary-text font-semibold' : 'text-ink-3 hover:text-ink-2'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3.5 border-t border-line">
        <button
          onClick={() => setExplain((v) => !v)}
          className="text-xs font-medium text-ink-3 hover:text-ink flex items-center gap-1.5"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          How is synergy calculated?
        </button>
        {explain && (
          <p className="text-xs text-ink-2 mt-2 leading-relaxed max-w-prose">
            {data.synergyDefinition} A month where every engagement stayed inside one
            department scores 0%; a month where every helper crossed a boundary scores 100%.
            Figures come from completed engagements only.
          </p>
        )}
      </div>
    </Card>
  );
}
