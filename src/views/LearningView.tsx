import React, { useEffect, useMemo, useState } from 'react';
import {
  GraduationCap, Plus, Clock, MapPin, Users, Video, Building2, CalendarDays, Check
} from 'lucide-react';
import { useStore } from '../lib/store';
import { TagEditor } from '../components/TagEditor';
import { api, type Training } from '../lib/api';
import {
  Button, Card, Chip, Avatar, Modal, Field, TextInput, TextArea, Select,
  SearchField, FilterBar, FilterSelect, EmptyState, SaveButton, SkeletonGrid, Reveal
} from '../components/ui';

const LEVELS = ['All levels', 'Beginner', 'Intermediate', 'Advanced'] as const;
const FORMATS = ['Virtual', 'In-person', 'Hybrid'] as const;

/** "Thu 4 Sep" — short enough for a card, unambiguous across locales. */
function sessionDay(iso: string): string {
  const d = new Date(`${String(iso).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}

function daysUntil(iso: string): number {
  const d = new Date(`${String(iso).slice(0, 10)}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

function durationLabel(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

const FORMAT_ICON: Record<string, React.ReactNode> = {
  Virtual: <Video className="w-3.5 h-3.5" />,
  'In-person': <Building2 className="w-3.5 h-3.5" />,
  Hybrid: <MapPin className="w-3.5 h-3.5" />
};

const EMPTY_FORM = {
  title: '', description: '', skills: [] as string[], level: 'All levels',
  format: 'Virtual', location: '', sessionDate: '', startTime: '10:00 AM',
  durationMins: 60, seatsTotal: 25
};

export function LearningView() {
  const s = useStore();
  const [sessions, setSessions] = useState<Training[] | null>(null);
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('All');
  const [format, setFormat] = useState('All');
  const [scope, setScope] = useState<'upcoming' | 'mine' | 'hosting' | 'past'>('upcoming');
  const [newOpen, setNewOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const load = () => api.get('/trainings').then((d) => setSessions(d.trainings));
  useEffect(() => { load(); }, []);

  const all = sessions || [];

  const counts = useMemo(() => ({
    upcoming: all.filter((t) => t.status === 'scheduled').length,
    mine: all.filter((t) => t.myRegistration).length,
    hosting: all.filter((t) => t.hostId === s.user?.id).length,
    past: all.filter((t) => t.status !== 'scheduled').length
  }), [all, s.user]);

  const filtered = all.filter((t) => {
    if (scope === 'upcoming' && t.status !== 'scheduled') return false;
    if (scope === 'mine' && !t.myRegistration) return false;
    if (scope === 'hosting' && t.hostId !== s.user?.id) return false;
    if (scope === 'past' && t.status === 'scheduled') return false;
    if (level !== 'All' && t.level !== level) return false;
    if (format !== 'All' && t.format !== format) return false;
    if (query) {
      const q = query.toLowerCase();
      const hay = `${t.title} ${t.description} ${t.hostName} ${t.skills.join(' ')}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const register = async (t: Training) => {
    try {
      const r = await api.post(`/trainings/${t.id}/register`);
      s.toast('success',
        r.status === 'waitlisted' ? 'Added to the waitlist' : 'You are signed up',
        r.status === 'waitlisted'
          ? `"${t.title}" is full — you'll be moved up if a seat frees.`
          : `${sessionDay(t.sessionDate)} at ${t.startTime}.`);
      load();
    } catch (e: any) { s.toast('error', 'Could not sign up', e.message); }
  };

  const cancelRegistration = async (t: Training) => {
    await api.post(`/trainings/${t.id}/cancel-registration`);
    s.toast('info', 'Registration cancelled', 'Your seat has been released.');
    load();
  };

  const cancelSession = async (t: Training) => {
    await api.patch(`/trainings/${t.id}`, { status: 'cancelled' });
    s.toast('info', 'Session cancelled', 'Everyone signed up has been notified.');
    load();
  };

  const submit = async () => {
    if (!form.title.trim()) {
      s.toast('error', 'Title required', 'Give the session a name people can search for.');
      return;
    }
    if (!form.sessionDate) {
      s.toast('error', 'Date required', 'Pick when the session runs.');
      return;
    }
    setBusy(true);
    try {
      await api.post('/trainings', form);
      s.toast('success', 'Session published', 'Colleagues can sign up now.');
      setNewOpen(false);
      setForm({ ...EMPTY_FORM });
      load();
    } catch (e: any) {
      s.toast('error', 'Could not publish', e.message);
    } finally {
      setBusy(false);
    }
  };

  if (!sessions) return <SkeletonGrid count={4} cols="md:grid-cols-2 xl:grid-cols-3" />;

  return (
    <div className="anim-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Learning</h1>
          <p className="text-xs text-ink-2 mt-0.5">
            Lectures and trainings run by colleagues — teach what you know, sign up for what you don't
          </p>
        </div>
        <Button onClick={() => setNewOpen(true)}><Plus className="w-4 h-4" /> Host a Session</Button>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {([
          ['upcoming', `Upcoming (${counts.upcoming})`],
          ['mine', `I'm attending (${counts.mine})`],
          ['hosting', `I'm hosting (${counts.hosting})`],
          ['past', `Past (${counts.past})`]
        ] as const).map(([val, label]) => (
          <button
            key={val} onClick={() => setScope(val)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              scope === val ? 'bg-primary-soft text-primary-text' : 'panel text-ink-2 hover:text-ink shadow-card'
            }`}
          >{label}</button>
        ))}
      </div>

      <FilterBar
        search={
          <SearchField
            value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sessions, topics or hosts…"
          />
        }
        sticky={false}
      >
        <FilterSelect value={level} onChange={(e) => setLevel(e.target.value)} aria-label="Filter by level">
          <option value="All">Any level</option>
          {LEVELS.map((l) => <option key={l}>{l}</option>)}
        </FilterSelect>
        <FilterSelect value={format} onChange={(e) => setFormat(e.target.value)} aria-label="Filter by format">
          <option value="All">Any format</option>
          {FORMATS.map((f) => <option key={f}>{f}</option>)}
        </FilterSelect>
      </FilterBar>

      {filtered.length === 0 ? (
        <EmptyState
          title="No sessions here yet"
          hint={scope === 'hosting'
            ? 'Host one — teaching a topic is the fastest way to find the others working on it.'
            : 'Try another filter, or host a session yourself.'}
        />
      ) : (
        <Reveal stagger className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((t) => {
            const isHost = t.hostId === s.user?.id;
            const seatsLeft = t.seatsTotal - t.seatsFilled;
            const until = daysUntil(t.sessionDate);
            const cancelled = t.status === 'cancelled';
            const done = t.status === 'completed';

            return (
              <Card key={t.id} className={`p-5 h-full flex flex-col ${cancelled ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary-soft text-primary-text">
                    <CalendarDays className="w-3.5 h-3.5" />
                    {sessionDay(t.sessionDate)} · {t.startTime}
                  </span>
                  <SaveButton saved={s.isSaved('training', t.id)} onToggle={async () => {
                    const now = await s.toggleSaved('training', t.id);
                    s.toast('info', now ? 'Session saved' : 'Removed from saved');
                  }} />
                </div>

                <h3 className="text-base font-semibold text-ink leading-snug mt-3">{t.title}</h3>
                <p className="text-xs text-ink-2 mt-1.5 leading-relaxed line-clamp-3">{t.description}</p>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  <Chip>{t.level}</Chip>
                  <Chip>
                    <span className="inline-flex items-center gap-1">{FORMAT_ICON[t.format]} {t.format}</span>
                  </Chip>
                  <Chip><span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {durationLabel(t.durationMins)}</span></Chip>
                  {t.skills.slice(0, 3).map((sk) => <Chip key={sk} tone="primary">{sk}</Chip>)}
                </div>

                {t.location && (
                  <p className="text-xs text-ink-3 mt-2.5 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 shrink-0" /> <span className="truncate">{t.location}</span>
                  </p>
                )}

                <div className="flex items-center justify-between mt-auto pt-3.5 border-t border-line">
                  <span className="flex items-center gap-2 min-w-0">
                    <Avatar initials={t.hostInitials} size="sm" name={t.hostName} src={t.hostAvatarUrl} />
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold text-ink truncate">{t.hostName}</span>
                      <span className="block text-xs text-ink-3 truncate">{t.hostDepartment}</span>
                    </span>
                  </span>
                  <span className="text-xs font-semibold shrink-0 text-ink-2 flex items-center gap-1">
                    <Users className="w-3 h-3" /> {t.seatsFilled}/{t.seatsTotal}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 mt-3">
                  <span className="text-xs text-ink-3">
                    {cancelled ? 'Cancelled'
                      : done ? 'Completed'
                      : until === 0 ? 'Today'
                      : until === 1 ? 'Tomorrow'
                      : until > 0 ? `in ${until} days`
                      : ''}
                    {!cancelled && !done && seatsLeft <= 0 && ` · full${t.waitlistCount ? ` · ${t.waitlistCount} waiting` : ''}`}
                  </span>

                  {cancelled || done ? null : isHost ? (
                    <div className="flex gap-2">
                      <Button size="sm" variant="danger" onClick={() => cancelSession(t)}>Cancel</Button>
                      <Chip tone="primary">You're hosting</Chip>
                    </div>
                  ) : t.myRegistration ? (
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md ${
                        t.myRegistration === 'registered' ? 'bg-green-soft text-green' : 'bg-amber-soft text-amber'
                      }`}>
                        {t.myRegistration === 'registered' ? <><Check className="w-3 h-3" /> Going</> : 'Waitlisted'}
                      </span>
                      <Button size="sm" variant="secondary" onClick={() => cancelRegistration(t)}>Cancel</Button>
                    </div>
                  ) : (
                    <Button size="sm" onClick={() => register(t)}>
                      {seatsLeft > 0 ? 'Sign Up' : 'Join Waitlist'}
                    </Button>
                  )}
                </div>

                {/* The host sees who is coming, so they can pitch the session
                    at the room that actually booked it. */}
                {isHost && t.attendees.length > 0 && (
                  <div className="mt-3.5 pt-3.5 border-t border-line">
                    <p className="text-xs font-semibold text-ink-2 mb-2">
                      {t.attendees.filter((a) => a.status === 'registered').length} attending
                      {t.waitlistCount > 0 && ` · ${t.waitlistCount} waitlisted`}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {t.attendees.map((a) => (
                        <span
                          key={a.attendeeId}
                          title={`${a.name} · ${a.department}${a.status === 'waitlisted' ? ' (waitlisted)' : ''}`}
                          className={a.status === 'waitlisted' ? 'opacity-50' : ''}
                        >
                          <Avatar initials={a.initials} size="sm" name={a.name} src={a.avatarUrl} />
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </Reveal>
      )}

      <Modal
        open={newOpen} onClose={() => setNewOpen(false)}
        title="Host a Session"
        subtitle="Teach a topic to whoever wants to learn it"
        footer={
          <>
            <Button variant="secondary" onClick={() => setNewOpen(false)}>Cancel</Button>
            <Button onClick={submit} disabled={busy}>{busy ? 'Publishing…' : 'Publish Session'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Title" required>
            <TextInput
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Terraform Modules That Survive a Second Team"
            />
          </Field>

          <Field label="What will you cover?" hint="A short outline helps people decide if it's for them.">
            <TextArea
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Topics, prerequisites, whether to bring a laptop…"
            />
          </Field>

          <Field label="Skills taught" hint="Used to match the session to people with that skill gap.">
            <TagEditor
              tags={form.skills}
              onChange={(skills) => setForm({ ...form, skills })}
              placeholder="Add a skill…"
              useCatalogue
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Level">
              <Select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
                {LEVELS.map((l) => <option key={l}>{l}</option>)}
              </Select>
            </Field>
            <Field label="Format">
              <Select value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })}>
                {FORMATS.map((f) => <option key={f}>{f}</option>)}
              </Select>
            </Field>
          </div>

          <Field label={form.format === 'Virtual' ? 'Meeting link or channel' : 'Location'}>
            <TextInput
              value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder={form.format === 'Virtual' ? 'Microsoft Teams' : 'MBRDI Whitefield · Room 4.12'}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Date" required>
              <TextInput
                type="date" value={form.sessionDate}
                onChange={(e) => setForm({ ...form, sessionDate: e.target.value })}
              />
            </Field>
            <Field label="Start time">
              <TextInput
                value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                placeholder="02:00 PM"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Duration (minutes)">
              <TextInput
                type="number" min={15} value={form.durationMins}
                onChange={(e) => setForm({ ...form, durationMins: Number(e.target.value) })}
              />
            </Field>
            <Field label="Seats" hint="A full session waitlists rather than turning people away.">
              <TextInput
                type="number" min={1} value={form.seatsTotal}
                onChange={(e) => setForm({ ...form, seatsTotal: Number(e.target.value) })}
              />
            </Field>
          </div>
        </div>
      </Modal>
    </div>
  );
}
