import React from 'react';
import { Sparkles } from 'lucide-react';

/**
 * Fit is reported as a level, not a percentage.
 *
 * The underlying score is a heuristic over declared skills and remaining
 * hours — it is not accurate to the percentage point, and printing "73%"
 * claims a precision the input data does not have. Three honest bands say
 * as much as the number did without overstating the certainty.
 */
export type FitLevel = 'High' | 'Medium' | 'Low';

export function fitLevel(score: number): FitLevel {
  if (score >= 70) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
}

/** Level colours for the chart's plotted points and the compact meter. */
const LEVEL_STROKE: Record<FitLevel, string> = {
  High: 'var(--accent-green)',
  Medium: 'var(--primary)',
  Low: 'var(--ink-3)'
};

const LEVEL_BAR: Record<FitLevel, string> = LEVEL_STROKE;

/**
 * Compact fit meter for feed cards and search results.
 *
 * A segmented bar rather than a word: three ticks that fill in proportion to
 * the match, with the level named beside them. It reads at a glance in a
 * dense grid — you can compare two cards without reading either label — and
 * still says the level out loud for anyone who cannot use the colour.
 */
export function MatchBadge({ score, className = '' }: { score?: number | null; className?: string }) {
  if (score == null) return null;
  const level = fitLevel(score);
  // One segment per band, filled up to the level reached.
  const filled = level === 'High' ? 3 : level === 'Medium' ? 2 : 1;
  const fill = LEVEL_BAR[level];

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${className}`}
      title={`${level} fit against your declared skills and the bandwidth you have offered`}
    >
      <span className="flex items-center gap-0.5" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block h-1.5 w-4 rounded-full transition-colors"
            style={{ background: i < filled ? fill : 'var(--surface-2)' }}
          />
        ))}
      </span>
      <span className="text-xs font-semibold" style={{ color: fill }}>{level} match</span>
    </span>
  );
}

/**
 * The fit profile as a line across the three measures that make it up.
 *
 * A line (rather than separate bars) is deliberate: it shows the *shape* of
 * a match at a glance — a flat high line reads differently from one that
 * dips hard on bandwidth, and that dip is the thing worth noticing before
 * applying. The Y axis is banded Low/Medium/High rather than 0–100 for the
 * same reason the badge is: the score is not precise enough to plot as a
 * number.
 */
function FitLineChart({ points }: { points: Array<{ label: string; value: number }> }) {
  const H = 96;

  // Everything is positioned in percentages of the plot box, so the dots, the
  // line and the x-axis labels stay locked together at any width. The SVG that
  // carries the line stretches with `preserveAspectRatio="none"` — it only
  // draws straight lines, which distort harmlessly; the dots are real DOM
  // elements so they stay circular.
  const pct = (v: number) => Math.max(0, Math.min(100, v));
  const plotted = points.map((p, i) => ({
    ...p,
    level: fitLevel(p.value),
    xPct: points.length === 1 ? 50 : (i / (points.length - 1)) * 100,
    yPct: 100 - pct(p.value)
  }));

  const bandTop = (v: number) => 100 - v;

  return (
    <div className="flex gap-2">
      {/* Y-axis band labels, sitting at the middle of each band */}
      <div className="relative shrink-0 w-10" style={{ height: H }}>
        {([
          ['High', (100 + 70) / 2],
          ['Med', (70 + 40) / 2],
          ['Low', 40 / 2]
        ] as const).map(([label, at]) => (
          <span
            key={label}
            className="absolute right-0 text-xs font-semibold text-ink-3 -translate-y-1/2"
            style={{ top: `${bandTop(at)}%` }}
          >
            {label}
          </span>
        ))}
      </div>

      <div className="flex-1 min-w-0">
        <div
          className="relative"
          style={{ height: H }}
          role="img"
          aria-label={`Fit profile: ${plotted.map((p) => `${p.label} ${p.level}`).join(', ')}`}
        >
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full"
            aria-hidden="true"
          >
            {[70, 40].map((v) => (
              <line
                key={v}
                x1={0} x2={100} y1={bandTop(v)} y2={bandTop(v)}
                stroke="var(--line)" strokeWidth="0.6" strokeDasharray="2 2"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            <polyline
              points={plotted.map((p) => `${p.xPct},${p.yPct}`).join(' ')}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {plotted.map((p) => (
            <span
              key={p.label}
              title={`${p.label}: ${p.level}`}
              className="absolute w-2.5 h-2.5 rounded-full -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${p.xPct}%`,
                top: `${p.yPct}%`,
                background: LEVEL_STROKE[p.level],
                boxShadow: '0 0 0 2px var(--surface-2)'
              }}
            />
          ))}
        </div>

        {/* X-axis labels, anchored to the same percentages as the dots */}
        <div className="relative h-4 mt-1">
          {plotted.map((p, i) => (
            <span
              key={p.label}
              className="absolute text-xs text-ink-3 font-medium whitespace-nowrap"
              style={{
                left: `${p.xPct}%`,
                transform: i === 0 ? 'none'
                  : i === plotted.length - 1 ? 'translateX(-100%)'
                  : 'translateX(-50%)'
              }}
            >
              {p.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * The full breakdown: overall fit split into the two things that decide it,
 * plus the plain-language reason the server produced. Shown on the detail view
 * so a verdict is never presented without its working.
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

  return (
    <div className="p-4 rounded-2xl bg-surface-2">
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-sm font-semibold text-ink flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-primary-text" />
          Why this matches you
        </p>
        <MatchBadge score={score} />
      </div>

      <FitLineChart
        points={[
          { label: 'Skills', value: skillFit ?? 0 },
          { label: 'Bandwidth', value: capacityFit ?? 0 },
          { label: 'Overall', value: score }
        ]}
      />

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
