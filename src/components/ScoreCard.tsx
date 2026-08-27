import React from 'react';
import { Star, Clock, HandHeart, Building2 } from 'lucide-react';
import type { ScoreResponse } from '../lib/api';

/**
 * The contribution score, out of 5.
 *
 * It is a function of hours contributed to other teams and nothing else, so
 * the hours are shown right beneath it — the number is only motivating if
 * you can see what moves it. The engagement and department counts sit
 * alongside as context; they do not feed the score.
 *
 * Access is enforced on the server (GET /score refuses anyone but the
 * subject, their manager and admins), so the card carries no privacy notice.
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
  const toNext = Math.max(0, data.hoursTarget - data.hoursContributed);

  const stats = [
    { icon: <Clock className="w-3.5 h-3.5" />, label: 'Hours given', value: `${data.hoursContributed}h` },
    { icon: <HandHeart className="w-3.5 h-3.5" />, label: 'Engagements', value: data.engagements },
    { icon: <Building2 className="w-3.5 h-3.5" />, label: 'Departments', value: data.departments }
  ];

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
            {toNext > 0
              ? <>Built from <b className="text-ink">{data.hoursContributed}h</b> given to other teams — {toNext}h more reaches the top of the scale.</>
              : <>Built from <b className="text-ink">{data.hoursContributed}h</b> given to other teams. You are at the top of the scale.</>}
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

      {!compact && (
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-medium text-ink-2">Hours contributed</span>
            <span className="font-semibold text-ink tabular-nums">
              {data.hoursContributed}<span className="text-ink-3 font-medium"> / {data.hoursTarget}</span>
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${pct * 100}%`, transition: 'width 700ms cubic-bezier(0.2,0.8,0.3,1)' }}
            />
          </div>

          {/* Context, not inputs — these do not move the score. */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            {stats.map((k) => (
              <div key={k.label} className="p-2.5 rounded-xl bg-surface-2">
                <span className="flex items-center gap-1 text-ink-3">
                  {k.icon}<span className="text-xs font-medium truncate">{k.label}</span>
                </span>
                <p className="text-sm font-bold text-ink mt-1 tabular-nums leading-none">{k.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
