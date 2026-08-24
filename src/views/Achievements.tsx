import React, { useEffect, useState } from 'react';
import { Award, Heart, Sparkles, Send, Trophy } from 'lucide-react';
import { useStore } from '../lib/store';
import { api, timeAgo } from '../lib/api';
import {
  Card, Button, Avatar, Modal, Field, TextArea, Select, EmptyState, RowSkeleton, Reveal, Chip
} from '../components/ui';

interface Milestone {
  id: string; label: string; hint: string; icon: string;
  value: number; goal: number; achieved: boolean; progress: number;
}

interface Appreciation {
  id: string; message: string; rating: number | null; createdAt: string;
  fromName: string; fromInitials: string; fromRole: string; fromAvatarUrl: string;
  postTitle: string | null; postDepartment?: string | null;
}

interface PendingEngagement {
  applicationId: string; applicantId: string; applicantName: string;
  applicantInitials: string; applicantRole: string; applicantDepartment: string;
  applicantAvatarUrl: string; postId: string; postTitle: string;
  commitment: string; alreadyRecognised: boolean;
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
  const [form, setForm] = useState({ message: '', rating: '5' });
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const [ms, ap, pe] = await Promise.all([
      api.get('/milestones'),
      api.get('/appreciations'),
      api.get('/appreciations/pending')
    ]);
    setMilestones(ms);
    setReceived(ap.appreciations);
    setPending(pe.engagements);
  };
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!target) return;
    if (!form.message.trim()) {
      s.toast('error', 'Say something specific', 'A blank note does not land as recognition.');
      return;
    }
    setBusy(true);
    try {
      await api.post('/appreciations', {
        applicationId: target.applicationId,
        message: form.message,
        rating: Number(form.rating)
      });
      s.toast('success', 'Recognition sent', `${target.applicantName} has been notified.`);
      setTarget(null);
      setForm({ message: '', rating: '5' });
      await Promise.all([load(), s.loadUsers()]);
    } catch (e: any) {
      s.toast('error', 'Could not send', e.message);
    } finally {
      setBusy(false);
    }
  };

  if (!milestones || received === null) return <RowSkeleton count={6} />;

  const toRecognise = pending.filter((p) => !p.alreadyRecognised);
  const done = milestones.milestones.filter((m) => m.achieved);
  const next = milestones.milestones.filter((m) => !m.achieved);

  return (
    <div className="anim-fade-up space-y-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Achievements</h1>
        <p className="text-xs text-ink-2 mt-0.5">
          What you have earned by helping other teams — and who you can recognise in return
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
                Their work is finished. A specific sentence about what they did is worth more than a rating on its own.
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
                      <Sparkles className="w-3.5 h-3.5" /> Recognise
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
        <Card className="p-5 lg:col-span-1 flex flex-col">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-3 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5" /> Current tier
          </p>
          <p className="text-2xl font-bold tracking-tight text-ink mt-2.5">{milestones.totals.tier}</p>
          <p className="text-xs text-ink-2 mt-1">
            {milestones.achievedCount} of {milestones.milestones.length} milestones reached
          </p>
        </Card>
        {[
          { label: 'Hours given', value: `${milestones.totals.hours}h` },
          { label: 'Engagements', value: milestones.totals.gigs },
          { label: 'Departments reached', value: milestones.totals.departments },
          { label: 'Recognitions', value: milestones.totals.recognitions }
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

      {/* Recognition received */}
      <section>
        <h2 className="text-sm font-semibold text-ink mb-3">Recognition received ({received.length})</h2>
        {received.length === 0 ? (
          <EmptyState
            title="No recognition yet"
            hint="Complete an engagement and the person you helped can recognise the work."
          />
        ) : (
          <Reveal stagger className="space-y-2.5">
            {received.map((a) => (
              <Card key={a.id} className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar initials={a.fromInitials} size="md" name={a.fromName} src={a.fromAvatarUrl} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-ink leading-relaxed">“{a.message}”</p>
                    <p className="text-xs text-ink-3 mt-1.5">
                      <b className="text-ink-2">{a.fromName}</b> · {a.fromRole}
                      {a.postTitle && <> · on {a.postTitle}</>} · {timeAgo(a.createdAt)}
                    </p>
                  </div>
                  {a.rating != null && (
                    <span className="text-xs font-semibold text-amber shrink-0 tabular-nums">{a.rating}/5</span>
                  )}
                </div>
              </Card>
            ))}
          </Reveal>
        )}
      </section>

      {/* Badges */}
      {(s.user?.badges?.length || 0) > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-ink mb-3 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber" /> Badges
          </h2>
          <Reveal stagger className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {s.user!.badges.map((b) => (
              <Card key={b.id} className="p-4 h-full flex items-start gap-3">
                <span className="w-10 h-10 rounded-2xl bg-amber-soft flex items-center justify-center text-lg shrink-0" aria-hidden="true">
                  {b.icon}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-ink">{b.name}</p>
                  <p className="text-xs text-ink-3 mt-0.5 leading-relaxed">{b.description}</p>
                  <p className="text-xs text-ink-3 mt-1">{b.dateEarned}</p>
                </div>
              </Card>
            ))}
          </Reveal>
        </section>
      )}

      <Modal
        open={!!target} onClose={() => setTarget(null)}
        title="Recognise this work"
        subtitle={target ? `${target.applicantName} · ${target.postTitle}` : ''}
        footer={
          <>
            <Button variant="secondary" onClick={() => setTarget(null)}>Cancel</Button>
            <Button onClick={submit} disabled={busy}>
              <Send className="w-3.5 h-3.5" /> {busy ? 'Sending…' : 'Send recognition'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="What did they do well?" required hint="Specific beats generous — name the thing that made a difference.">
            <TextArea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="e.g. Rewrote the Terraform modules in two days and unblocked the whole squad before the sprint review."
            />
          </Field>
          <Field label="Rating" hint="Feeds their contribution score in the directory">
            <Select value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })}>
              <option value="5">5 — Exceptional</option>
              <option value="4">4 — Above expectations</option>
              <option value="3">3 — Solid contribution</option>
              <option value="2">2 — Some gaps</option>
              <option value="1">1 — Did not work out</option>
            </Select>
          </Field>
          <p className="text-xs text-ink-3">
            {target?.applicantName.split(' ')[0]} sees this on their profile and gets a notification. It cannot be edited afterwards.
          </p>
        </div>
      </Modal>
    </div>
  );
}
