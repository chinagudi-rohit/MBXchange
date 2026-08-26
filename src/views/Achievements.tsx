import React, { useEffect, useState } from 'react';
import { Award, Heart, Sparkles, Send, Trophy, Check } from 'lucide-react';
import { useStore } from '../lib/store';
import { api, timeAgo } from '../lib/api';
import {
  Card, Button, Avatar, Modal, Field, TextArea, Select, EmptyState, RowSkeleton, Reveal, Chip
} from '../components/ui';

interface AwardBadge {
  id: string; name: string; icon: string; description: string;
  dimension: 'helping' | 'technicalExpertise' | 'collaboration' | 'reliability';
}

// The tier solid is the page's single accent — lazy so three.js stays off
// the critical path.
const TierCrystal3D = React.lazy(() =>
  import('../components/TierCrystal3D').then((m) => ({ default: m.TierCrystal3D }))
);


interface Milestone {
  id: string; label: string; hint: string; icon: string;
  value: number; goal: number; achieved: boolean; progress: number;
}

interface Appreciation {
  id: string; message: string; badgeId: string; badge: AwardBadge | null; createdAt: string;
  fromName: string; fromInitials: string; fromRole: string; fromAvatarUrl: string;
  postTitle: string | null; postDepartment?: string | null;
}

interface PendingEngagement {
  applicationId: string; applicantId: string; applicantName: string;
  applicantInitials: string; applicantRole: string; applicantDepartment: string;
  applicantAvatarUrl: string; postId: string; postTitle: string;
  commitment: string; alreadyRecognised: boolean; awardedBadgeId: string | null;
}

/**
 * Everything a person has earned, in one place: tier, milestones, recognition
 * received, and — for authors and managers — the people whose finished work
 * they can still recognise.
 */
export function Achievements() {
  const s = useStore();
  const [milestones, setMilestones] = useState<{ milestones: Milestone[]; achievedCount: number; totals: any } | null>(null);
  const [received, setReceived] = useState<Appreciation[] | null>(null);
  const [pending, setPending] = useState<PendingEngagement[]>([]);
  const [target, setTarget] = useState<PendingEngagement | null>(null);
  const [catalogue, setCatalogue] = useState<AwardBadge[]>([]);
  const [dimensions, setDimensions] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ message: '', badgeId: '', rating: '' });
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const [ms, ap, pe, bc] = await Promise.all([
      api.get('/milestones'),
      api.get('/appreciations'),
      api.get('/appreciations/pending'),
      api.get('/badges/catalogue')
    ]);
    setMilestones(ms);
    setReceived(ap.appreciations);
    setPending(pe.engagements);
    setCatalogue(bc.badges);
    setDimensions(bc.dimensions);
  };
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!target) return;
    if (!form.badgeId) {
      s.toast('error', 'Pick a badge', 'The badge is the recognition — choose the one that fits.');
      return;
    }
    setBusy(true);
    try {
      await api.post('/appreciations', {
        applicationId: target.applicationId,
        badgeId: form.badgeId,
        message: form.message,
        // Optional — only a supplied rating moves their score.
        rating: form.rating ? Number(form.rating) : undefined
      });
      s.toast('success', 'Badge awarded', `${target.applicantName} has been notified.`);
      setTarget(null);
      setForm({ message: '', badgeId: '', rating: '' });
      await Promise.all([load(), s.loadUsers()]);
    } catch (e: any) {
      s.toast('error', 'Could not award', e.message);
    } finally {
      setBusy(false);
    }
  };

  /** Badges the signed-in user has been awarded, grouped so repeats stack. */
  const earnedBadges = (received || []).reduce((acc, a) => {
    if (!a.badge) return acc;
    const hit = acc.find((x) => x.badge.id === a.badge!.id);
    if (hit) hit.count += 1;
    else acc.push({ badge: a.badge, count: 1 });
    return acc;
  }, [] as Array<{ badge: AwardBadge; count: number }>).sort((a, b) => b.count - a.count);

  if (!milestones || received === null) return <RowSkeleton count={6} />;

  const toRecognise = pending.filter((p) => !p.alreadyRecognised);
  const done = milestones.milestones.filter((m) => m.achieved);
  const next = milestones.milestones.filter((m) => !m.achieved);

  return (
    <div className="anim-fade-up space-y-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Achievements</h1>
        <p className="text-xs text-ink-2 mt-0.5">
          What you have picked up by working with other teams — and who you can recognise in return
        </p>
      </div>

      {/* Managers and requirement authors see this first: work is finished and
          someone is waiting to hear that it mattered. */}
      {toRecognise.length > 0 && (
        <Card className="p-5 border border-amber/30">
          <div className="flex items-start gap-3.5">
            <span className="w-10 h-10 rounded-2xl bg-amber-soft text-amber flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">
                {toRecognise.length} {toRecognise.length === 1 ? 'person is' : 'people are'} waiting to be recognised
              </p>
              <p className="text-xs text-ink-2 mt-0.5 leading-relaxed">
                Their work is finished. Award a badge that names what they actually did well.
              </p>
              <div className="space-y-2 mt-3.5">
                {toRecognise.slice(0, 5).map((p) => (
                  <div key={p.applicationId} className="flex flex-col sm:flex-row sm:items-center gap-2.5 p-2.5 rounded-xl bg-surface-2">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <Avatar initials={p.applicantInitials} size="sm" name={p.applicantName} src={p.applicantAvatarUrl} />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-ink truncate">{p.applicantName}</p>
                        <p className="text-xs text-ink-3 truncate">{p.commitment} · {p.postTitle}</p>
                      </div>
                    </div>
                    <Button size="sm" className="shrink-0" onClick={() => setTarget(p)}>
                      <Sparkles className="w-3.5 h-3.5" /> Award badge
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tier + headline totals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        {/* This page is about the tier, so the tier itself is the one bold thing
            on it — the solid gains a face count per rung, and everything around
            it stays flat. No separate header ornament here for that reason. */}
        <Card className="p-5 lg:col-span-1 flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-3 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5" /> Current tier
            </p>
            <p className="text-2xl font-bold tracking-tight text-ink mt-2.5">{milestones.totals.tier}</p>
            <p className="text-xs text-ink-2 mt-1">
              {milestones.achievedCount} of {milestones.milestones.length} milestones reached
            </p>
          </div>
          <React.Suspense fallback={null}>
            <TierCrystal3D artifact={s.tiers.find((t) => t.name === milestones.totals.tier)?.artifact} className="hidden sm:block w-20 h-20 shrink-0" />
          </React.Suspense>
        </Card>
        {[
          { label: 'Hours given', value: `${milestones.totals.hours}h` },
          { label: 'Engagements', value: milestones.totals.gigs },
          { label: 'Departments reached', value: milestones.totals.departments },
          { label: 'Badges earned', value: milestones.totals.recognitions }
        ].map((k) => (
          <Card key={k.label} className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-3">{k.label}</p>
            <p className="text-2xl font-bold tracking-tight text-ink mt-2 tabular-nums leading-none">{k.value}</p>
          </Card>
        ))}
      </div>

      {/* Milestones */}
      <section>
        <h2 className="text-sm font-semibold text-ink mb-3">Milestones</h2>
        <Reveal stagger className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {[...done, ...next].map((m) => (
            <Card key={m.id} className={`p-4 h-full flex items-start gap-3 ${m.achieved ? '' : 'opacity-90'}`}>
              <span
                aria-hidden="true"
                className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0 ${
                  m.achieved ? 'bg-amber-soft' : 'bg-surface-2 grayscale opacity-50'
                }`}
              >
                {m.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-ink flex items-center gap-1.5">
                  {m.label}
                  {m.achieved && <Chip tone="primary">Earned</Chip>}
                </p>
                <p className="text-xs text-ink-3 mt-0.5 leading-relaxed">{m.hint}</p>
                {!m.achieved && (
                  <div className="mt-2">
                    <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${m.progress}%` }} />
                    </div>
                    <p className="text-xs text-ink-3 mt-1 tabular-nums">{m.value} of {m.goal}</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </Reveal>
      </section>

      {/* Badge collection — repeats stack, so three "Unblocker" awards read as
          a strength rather than as three separate rows. */}
      {earnedBadges.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-ink mb-3 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber" /> Badges earned ({received.length})
          </h2>
          <Reveal stagger className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {earnedBadges.map(({ badge, count }) => (
              <Card key={badge.id} className="p-4 h-full flex items-start gap-3">
                <span className="w-10 h-10 rounded-2xl bg-amber-soft flex items-center justify-center text-lg shrink-0" aria-hidden="true">
                  {badge.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-ink flex items-center gap-1.5">
                    {badge.name}
                    {count > 1 && <Chip tone="primary">×{count}</Chip>}
                  </p>
                  <p className="text-xs text-ink-3 mt-0.5 leading-relaxed">{badge.description}</p>
                  <p className="text-xs text-ink-3 mt-1">{dimensions[badge.dimension]}</p>
                </div>
              </Card>
            ))}
          </Reveal>
        </section>
      )}

      {/* Who awarded what, most recent first */}
      <section>
        <h2 className="text-sm font-semibold text-ink mb-3">Recognition received ({received.length})</h2>
        {received.length === 0 ? (
          <EmptyState
            title="No recognition yet"
            hint="Complete an engagement and the person you helped can award you a badge for it."
          />
        ) : (
          <Reveal stagger className="space-y-2.5">
            {received.map((a) => (
              <Card key={a.id} className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar initials={a.fromInitials} size="md" name={a.fromName} src={a.fromAvatarUrl} />
                  <div className="min-w-0 flex-1">
                    {a.badge && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-soft text-amber text-xs font-bold mb-1.5">
                        <span aria-hidden="true">{a.badge.icon}</span> {a.badge.name}
                      </span>
                    )}
                    {a.message && <p className="text-sm text-ink leading-relaxed">“{a.message}”</p>}
                    <p className="text-xs text-ink-3 mt-1.5">
                      <b className="text-ink-2">{a.fromName}</b> · {a.fromRole}
                      {a.postTitle && <> · on {a.postTitle}</>} · {timeAgo(a.createdAt)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </Reveal>
        )}
      </section>

      <Modal
        open={!!target} onClose={() => setTarget(null)}
        title="Award a badge"
        subtitle={target ? `${target.applicantName} · ${target.postTitle}` : ''}
        footer={
          <>
            <Button variant="secondary" onClick={() => setTarget(null)}>Cancel</Button>
            <Button onClick={submit} disabled={busy || !form.badgeId}>
              <Send className="w-3.5 h-3.5" /> {busy ? 'Awarding…' : 'Award badge'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Which badge fits?" required>
            {/* Grouped by dimension so the choice is "what kind of good was
                this?" first, and only then which specific badge. */}
            <div className="space-y-3.5">
              {Object.entries(dimensions).map(([dim, label]) => (
                <div key={dim}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-3 mb-1.5">{label}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {catalogue.filter((b) => b.dimension === dim).map((b) => {
                      const picked = form.badgeId === b.id;
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setForm({ ...form, badgeId: b.id })}
                          title={b.description}
                          className={`p-2.5 rounded-xl text-left border transition-all ${
                            picked
                              ? 'border-primary bg-primary-soft'
                              : 'border-line bg-surface-2 hover:border-line-strong'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <span className="text-base leading-none" aria-hidden="true">{b.icon}</span>
                            {picked && <Check className="w-3 h-3 text-primary-text ml-auto" />}
                          </span>
                          <span className={`block text-xs font-semibold mt-1.5 ${picked ? 'text-primary-text' : 'text-ink'}`}>
                            {b.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Field>

          {form.badgeId && (
            <p className="text-xs text-ink-2 bg-surface-2 rounded-xl px-3 py-2.5">
              {catalogue.find((b) => b.id === form.badgeId)?.description}
            </p>
          )}

          <Field
            label="Rating (optional)"
            hint="Feeds their contribution score. Leave it blank to award the badge on its own."
          >
            <Select value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })}>
              <option value="">No rating</option>
              <option value="5">5 — Exceptional</option>
              <option value="4">4 — Above expectations</option>
              <option value="3">3 — Solid contribution</option>
              <option value="2">2 — Some gaps</option>
              <option value="1">1 — Did not work out</option>
            </Select>
          </Field>

          <Field label="Add a note (optional)" hint="A specific sentence makes the badge land harder.">
            <TextArea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="e.g. Rewrote the Terraform modules in two days and unblocked the whole squad before the sprint review."
            />
          </Field>
          <p className="text-xs text-ink-3">
            {target?.applicantName.split(' ')[0]} sees this on their profile and gets a notification. It cannot be edited afterwards.
          </p>
        </div>
      </Modal>
    </div>
  );
}
