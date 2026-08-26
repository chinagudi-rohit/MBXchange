import React from 'react';
import { Star } from 'lucide-react';
import type { ScoreResponse } from '../lib/api';

const DIMENSIONS: Array<[string, string]> = [
  ['helping', 'Helping & mentorship'],
  ['technicalExpertise', 'Technical expertise'],
  ['collaboration', 'Cross-team collaboration'],
  ['reliability', 'Reliability & follow-through']
];

/**
 * The peer score, out of 5 — the mean of the ratings colleagues have given.
 *
 * Access is enforced on the server (GET /score refuses anyone but the
 * subject, their manager, and admins), so the card does not advertise who
 * can see it; a privacy notice on every render is noise.
 */
export function ScoreCard({
  data, compact = false, onOpenDetail
}: {
  data: ScoreResponse | null;
  compact?: boolean;
  onOpenDetail?: () => void;
}) {
  if (!data) {
    return <div className="panel rounded-[1rem] shadow-card h-full min-h-44 animate-pulse" />;
  }

  const pct = Math.max(0, Math.min(1, data.score / data.outOf));
  const R = 42;
  const CIRC = 2 * Math.PI * R;
  const dims = DIMENSIONS
    .map(([key, label]) => ({ key, label, value: Number((data.breakdown as any)?.[key] ?? 0) }))
    .filter((d) => d.value > 0);

  return (
    <div className="panel rounded-[1rem] shadow-card p-6 h-full flex flex-col">
      <div className="flex items-start gap-5">
        <div className="relative shrink-0" style={{ width: 96, height: 96 }}>
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90" aria-hidden="true">
            <circle cx="50" cy="50" r={R} fill="none" stroke="var(--surface-2)" strokeWidth="8" />
            <circle
              cx="50" cy="50" r={R} fill="none"
              stroke="var(--primary)" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC * (1 - pct)}
              style={{ transition: 'stroke-dashoffset 700ms cubic-bezier(0.2,0.8,0.3,1)' }}
            />
          </svg>
          <span className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[1.75rem] leading-none font-bold tracking-tight text-ink tabular-nums">
              {data.score.toFixed(2)}
            </span>
            <span className="text-xs text-ink-3 mt-0.5">of {data.outOf}</span>
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-3 flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber fill-amber" /> Contribution score
          </p>
          <p className="text-base font-semibold text-ink mt-1.5 leading-snug">{data.tier}</p>
          <p className="text-xs text-ink-2 mt-1 leading-relaxed">
            {data.badgesCount > 0
              ? <>{data.badgesCount} badge{data.badgesCount === 1 ? '' : 's'} from colleagues you have worked with.</>
              : <>Take on a piece of cross-team work and colleagues can recognise it here.</>}
          </p>
          {onOpenDetail && (
            <button
              onClick={onOpenDetail}
              className="text-xs font-semibold text-primary-text hover:underline underline-offset-2 mt-2"
            >
              See milestones and recognition →
            </button>
          )}
        </div>
      </div>

      {!compact && dims.length > 0 && (
        <div className="mt-5 space-y-2.5">
          {dims.map((d) => (
            <div key={d.key}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-ink-2">{d.label}</span>
                <span className="font-semibold text-ink tabular-nums">{d.value.toFixed(1)} / 5</span>
              </div>
              <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(d.value / 5) * 100}%`, transition: 'width 700ms cubic-bezier(0.2,0.8,0.3,1)' }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
