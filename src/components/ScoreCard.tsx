import React from 'react';
import { Star } from 'lucide-react';
import type { ScoreResponse } from '../lib/api';

/**
 * The contribution score, out of 5, with the working shown.
 *
 * The number on its own is a scoreboard. What makes it motivating is the
 * breakdown underneath: each bar is a lever the person can actually pull, and
 * the copy names the next one worth pulling. That is why the components are
 * rendered here rather than hidden behind a tooltip.
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
  // The weakest component is the honest answer to "what do I do next".
  const weakest = [...data.breakdown].sort((a, b) => a.ratio - b.ratio)[0];

  // Ring geometry: r=42 in a 100-box, stroke sits inside the viewBox.
  const R = 42;
  const CIRC = 2 * Math.PI * R;

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
            {weakest && weakest.ratio < 1 ? (
              <>Biggest gain right now: <b className="text-ink">{weakest.label.toLowerCase()}</b> — {weakest.hint.toLowerCase()}.</>
            ) : (
              <>Every component is maxed out. You are at the top of the scale.</>
            )}
          </p>
          {onOpenDetail && (
            <button
              onClick={onOpenDetail}
              className="text-xs font-semibold text-primary-text hover:underline underline-offset-2 mt-2"
            >
              See how it is calculated →
            </button>
          )}
        </div>
      </div>

      {!compact && (
        <div className="mt-5 space-y-2.5">
          {data.breakdown.map((b) => (
            <div key={b.key} title={`${b.hint} — ${b.value} of ${b.target}`}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-ink-2">{b.label}</span>
                <span className="font-semibold text-ink tabular-nums">
                  {b.value}<span className="text-ink-3 font-medium"> / {b.target}</span>
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${b.ratio * 100}%`, transition: 'width 700ms cubic-bezier(0.2,0.8,0.3,1)' }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
