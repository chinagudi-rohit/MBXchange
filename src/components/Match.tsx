import React from 'react';
import { Sparkles } from 'lucide-react';

/** Fit bands. Anything under 40 is shown honestly rather than dressed up. */
function band(score: number) {
  if (score >= 75) return { label: 'Strong fit', cls: 'bg-green-soft text-green' };
  if (score >= 50) return { label: 'Good fit', cls: 'bg-primary-soft text-primary-text' };
  if (score >= 25) return { label: 'Partial fit', cls: 'bg-amber-soft text-amber' };
  return { label: 'Weak fit', cls: 'bg-surface-2 text-ink-3' };
}

/** Compact percentage pill for feed cards and search results. */
export function MatchBadge({ score, className = '' }: { score?: number | null; className?: string }) {
  if (score == null) return null;
  const b = band(score);
  return (
    <span
      title={`${b.label} — ${score}% match against your declared skills and remaining bandwidth`}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${b.cls} ${className}`}
    >
      <Sparkles className="w-3 h-3" />
      {score}%
    </span>
  );
}

/**
 * The full breakdown: overall fit split into the two things that decide it,
 * plus the plain-language reason the server produced. Shown on the detail view
 * so a number is never presented without its working.
 */
export function MatchBreakdown({
  score, skillFit, capacityFit, reason, matchedSkills = [], crossDepartment
}: {
  score?: number | null;
  skillFit?: number | null;
  capacityFit?: number | null;
  reason?: string | null;
  matchedSkills?: string[];
  crossDepartment?: boolean;
}) {
  if (score == null) return null;
  const b = band(score);

  const bars = [
    { label: 'Skill overlap', value: skillFit ?? 0, hint: 'Share of the requested skills you have declared' },
    { label: 'Bandwidth fit', value: capacityFit ?? 0, hint: 'How well your remaining hours cover the effort' }
  ];

  return (
    <div className="p-4 rounded-2xl bg-surface-2">
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-sm font-semibold text-ink flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-primary-text" />
          Why this matches you
        </p>
        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${b.cls}`}>
          {score}% · {b.label}
        </span>
      </div>

      <div className="space-y-2.5">
        {bars.map((bar) => (
          <div key={bar.label} title={bar.hint}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-ink-2">{bar.label}</span>
              <span className="font-semibold text-ink tabular-nums">{bar.value}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-surface overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${Math.max(2, bar.value)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {matchedSkills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {matchedSkills.slice(0, 6).map((sk) => (
            <span key={sk} className="px-2 py-0.5 rounded-md bg-primary-soft text-primary-text text-xs font-semibold">
              {sk}
            </span>
          ))}
        </div>
      )}

      {reason && <p className="text-xs text-ink-2 mt-3 leading-relaxed">{reason}</p>}

      {crossDepartment && (
        <p className="text-xs text-violet font-medium mt-2">
          Cross-department — this is the kind of exchange the platform exists for.
        </p>
      )}
    </div>
  );
}
