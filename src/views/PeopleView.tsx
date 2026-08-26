import React, { useMemo, useState } from 'react';
import { MessageSquare, Handshake, Award, X } from 'lucide-react';
import { useStore } from '../lib/store';
import { TiltCard } from '../components/TiltCard';
import { api, type User } from '../lib/api';
import { Button, Card, Chip, Avatar, Modal, Field, TextInput, TextArea, Select, SearchField, FilterBar, FilterSelect, EmptyState, Reveal } from '../components/ui';



const DEPARTMENTS = ['All', 'PT-THIA', 'PT-THIS', 'PT-THIT', 'PT-THID', 'PT-THIE', 'PT-THIM', 'PT-THIP', 'PT-THIG', 'PT-THIC', 'PT-THIF'];

export function PeopleView() {
  const s = useStore();
  const [query, setQuery] = useState('');
  const [dept, setDept] = useState('All');
  const [skill, setSkill] = useState('All');
  const [sort, setSort] = useState<'contribution' | 'availability' | 'name'>('contribution');
  const [profile, setProfile] = useState<User | null>(null);
  const [target, setTarget] = useState<User | null>(null);
  const [form, setForm] = useState({ taskTitle: '', estimatedHours: '', dates: '', notes: '' });
  const [busy, setBusy] = useState(false);

  const people = useMemo(() => s.users.filter((u) => {
    if (u.id === s.user?.id || u.systemRole === 'admin') return false;
    if (dept !== 'All' && u.department !== dept) return false;
    if (skill !== 'All' && !u.primarySkills.includes(skill)) return false;
    if (query) {
      const ql = query.toLowerCase();
      if (!u.name.toLowerCase().includes(ql) &&
          !u.primarySkills.some((sk) => sk.toLowerCase().includes(ql)) &&
          !u.role.toLowerCase().includes(ql)) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sort === 'availability') {
      // Most free hours first — who can actually take something on today.
      const freeA = Math.max(0, (a.availableHoursWeek || 0) - (a.hoursConsumed || 0));
      const freeB = Math.max(0, (b.availableHoursWeek || 0) - (b.hoursConsumed || 0));
      return freeB - freeA;
    }
    if (sort === 'name') return a.name.localeCompare(b.name);
    // Sorted on badges, not the contribution score — that score is private
    // to its owner and is no longer sent for other people.
    return Number(b.badgesCount || 0) - Number(a.badgesCount || 0);
  }), [s.users, s.user, dept, skill, query, sort]);

  // Skill vocabulary from the directory itself.
  const skillOptions = useMemo(() => {
    const seen = new Map<string, number>();
    s.users.forEach((u) => u.primarySkills.forEach((sk) => seen.set(sk, (seen.get(sk) || 0) + 1)));
    return [...seen.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([t]) => t);
  }, [s.users]);

  const sendRequest = async () => {
    if (!target || !form.taskTitle.trim()) {
      s.toast('error', 'Task title required');
      return;
    }
    setBusy(true);
    try {
      await api.post('/collab-requests', { targetId: target.id, ...form });
      s.toast('success', 'Collaboration request sent', `Proposal sent to ${target.name}. Track it in My Requests.`);
      setTarget(null);
      setForm({ taskTitle: '', estimatedHours: '', dates: '', notes: '' });
    } catch (e: any) {
      s.toast('error', 'Could not send', e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="anim-fade-up">
      <div className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight text-ink">People & Skills</h1>
        <p className="text-xs text-ink-2 mt-0.5">Colleagues across every department and MB unit, with the bandwidth they have offered</p>
      </div>

      <FilterBar
        search={<SearchField placeholder="Search by name, skill, or role…" value={query} onChange={(e) => setQuery(e.target.value)} />}
        footer={<>Showing <b className="text-ink-2">{people.length}</b> of {s.users.length - 1} colleagues</>}
      >
        <FilterSelect value={dept} onChange={(e) => setDept(e.target.value)} aria-label="Filter by department">
          <option value="All">All departments</option>
          {DEPARTMENTS.filter((d) => d !== 'All').map((d) => <option key={d}>{d}</option>)}
        </FilterSelect>
        <FilterSelect value={skill} onChange={(e) => setSkill(e.target.value)} aria-label="Filter by skill">
          <option value="All">Any skill</option>
          {skillOptions.map((sk) => <option key={sk}>{sk}</option>)}
        </FilterSelect>
        <FilterSelect value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label="Sort colleagues">
          <option value="contribution">Most recognised</option>
          <option value="availability">Most bandwidth offered</option>
          <option value="name">Name A–Z</option>
        </FilterSelect>
      </FilterBar>

      {people.length === 0 ? (
        <EmptyState title="No matching colleagues" hint="Try a different search term or department." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {people.map((u, i) => (
            <Reveal key={u.id} delay={(i % 4) * 60}>
              <TiltCard>
            <Card className="p-7 h-full flex flex-col">
              <div className="flex items-start gap-3 cursor-pointer" onClick={() => setProfile(u)}>
                <Avatar initials={u.initials} size="lg" name={u.name} src={u.avatarUrl} showPresence online={u.isOnline} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-normal text-ink truncate">{u.name}</p>
                  <p className="text-xs text-ink-2 truncate">{u.role}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Chip>{u.department}</Chip>
                    {u.badgesCount > 0 && (
                      <span className="flex items-center gap-0.5 text-xs font-semibold text-amber">
                        <Award className="w-3 h-3" /> {u.badgesCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3.5">
                {u.primarySkills.slice(0, 4).map((sk) => <Chip key={sk}>{sk}</Chip>)}
                {u.primarySkills.length > 4 && <Chip>+{u.primarySkills.length - 4}</Chip>}
              </div>

              {/* Earned recognition — tier from completed work, badges from the profile */}
              {(u.tier || u.badges?.length > 0) && (
                <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                  {u.tier && u.tier !== 'Contributor' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-soft text-amber text-xs font-semibold">
                      <Award className="w-3 h-3" /> {u.tier}
                    </span>
                  )}
                  {(u.badges || []).slice(0, 2).map((bdg) => (
                    <span
                      key={bdg.id}
                      title={`${bdg.name} — ${bdg.description}`}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-2 text-ink-2 text-xs font-medium max-w-40"
                    >
                      <span aria-hidden="true">{bdg.icon}</span>
                      <span className="truncate">{bdg.name}</span>
                    </span>
                  ))}
                  {(u.badges?.length || 0) > 2 && (
                    <span className="text-xs text-ink-3 font-medium">+{u.badges.length - 2}</span>
                  )}
                </div>
              )}

              <p className="text-xs text-ink-3 mt-3">
                Bandwidth: <b className="text-ink-2">{u.availableHoursWeek}h/week</b>
                {u.hoursConsumed > 0 && <span className="text-ink-3"> ({Math.max(0, u.availableHoursWeek - u.hoursConsumed)}h free)</span>}
                {' '}· {u.collaborationsCount} gigs · {u.hoursContributed}h contributed
              </p>
              <div className="flex gap-2 mt-auto pt-3.5 border-t border-line">
                <Button size="sm" className="flex-1" onClick={() => setTarget(u)}>
                  <Handshake className="w-3.5 h-3.5" /> Request Collaboration
                </Button>
                <Button size="sm" variant="secondary" onClick={() => { s.setMessagePartnerId(u.id); s.setMessagesOpen(true); }}
                  aria-label={`Message ${u.name}`}>
                  <MessageSquare className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      )}

      {/* Full profile — the rating breakdown and badges we already store but
          previously only showed for the signed-in user. */}
      <Modal
        open={!!profile} onClose={() => setProfile(null)}
        title={profile?.name || ''}
        subtitle={profile ? `${profile.role} · ${profile.department} · ${profile.campus}` : ''}
        footer={
          <>
            <Button variant="secondary" onClick={() => { const u = profile; setProfile(null); if (u) { s.setMessagePartnerId(u.id); s.setMessagesOpen(true); } }}>
              <MessageSquare className="w-3.5 h-3.5" /> Message
            </Button>
            <Button onClick={() => { const u = profile; setProfile(null); setTarget(u); }}>
              <Handshake className="w-3.5 h-3.5" /> Request Collaboration
            </Button>
          </>
        }
      >
        {profile && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar initials={profile.initials} size="xl" name={profile.name} src={profile.avatarUrl} showPresence online={profile.isOnline} />
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-amber">
                  <Award className="w-4 h-4" /> {Number(profile.badgesCount)}
                  <span className="text-ink-3 font-medium text-xs">
                    badge{Number(profile.badgesCount) === 1 ? '' : 's'} earned
                  </span>
                  <span className="text-xs font-medium text-ink-3">contribution score</span>
                </p>
                <p className="text-xs text-ink-2 mt-1">
                  {profile.isOnline ? 'Online now' : 'Offline'} · {profile.experienceYears} yrs experience
                </p>
                {profile.tier && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-soft text-amber text-xs font-semibold mt-1.5">
                    <Award className="w-3 h-3" /> {profile.tier}
                  </span>
                )}
              </div>
            </div>

            {profile.bio && <p className="text-sm text-ink-2 leading-relaxed">{profile.bio}</p>}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { label: 'Gigs', value: profile.collaborationsCount },
                { label: 'Hours', value: `${profile.hoursContributed}h` },
                { label: 'Departments', value: profile.departmentsSupported },
                { label: 'People helped', value: profile.peopleHelped }
              ].map((st) => (
                <div key={st.label} className="p-3 rounded-xl bg-surface-2 text-center">
                  <p className="text-base font-semibold text-ink tabular-nums">{st.value}</p>
                  <p className="text-xs text-ink-3 mt-0.5">{st.label}</p>
                </div>
              ))}
            </div>

            {profile.ratingBreakdown && Object.keys(profile.ratingBreakdown).length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-3 mb-2.5">Recognition by kind</p>
                <div className="space-y-2.5">
                  {(() => {
                    const dims = [
                      ['helping', 'Helping & mentorship'],
                      ['technicalExpertise', 'Technical expertise'],
                      ['collaboration', 'Cross-team collaboration'],
                      ['reliability', 'Reliability & follow-through']
                    ] as const;
                    // Bars are scaled to this person's own strongest dimension,
                    // so the shape shows where they are recognised most.
                    const peak = Math.max(1, ...dims.map(([k]) => Number(profile.ratingBreakdown[k] ?? 0)));
                    return dims.map(([key, label]) => {
                      const v = Number(profile.ratingBreakdown[key] ?? 0);
                      if (!v) return null;
                      return (
                        <div key={key}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-medium text-ink-2">{label}</span>
                            <span className="font-semibold text-ink tabular-nums">{v}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
                            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${(v / peak) * 100}%` }} />
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            {profile.badges?.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-3 mb-2.5">Recognition</p>
                <div className="space-y-2">
                  {profile.badges.map((bdg) => (
                    <div key={bdg.id} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-surface-2">
                      <span className="text-base leading-none mt-0.5" aria-hidden="true">{bdg.icon}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-ink">{bdg.name}</p>
                        <p className="text-xs text-ink-3 mt-0.5">{bdg.description} · {bdg.dateEarned}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-3 mb-2">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.primarySkills.map((sk) => <Chip key={sk}>{sk}</Chip>)}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!target} onClose={() => setTarget(null)}
        title={`Request Collaboration`}
        subtitle={target ? `${target.name} · ${target.role} · ${target.department}` : ''}
        footer={
          <>
            <Button variant="secondary" onClick={() => setTarget(null)}>Cancel</Button>
            <Button onClick={sendRequest} disabled={busy}>{busy ? 'Sending…' : 'Send Request'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Task / Topic" required>
            <TextInput value={form.taskTitle} onChange={(e) => setForm({ ...form, taskTitle: e.target.value })}
              placeholder="e.g. Terraform review for GPU node groups" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Estimated Hours">
              <TextInput value={form.estimatedHours} onChange={(e) => setForm({ ...form, estimatedHours: e.target.value })} placeholder="6 hours" />
            </Field>
            <Field label="Preferred Dates">
              <TextInput value={form.dates} onChange={(e) => setForm({ ...form, dates: e.target.value })} placeholder="24–26 Aug" />
            </Field>
          </div>
          <Field label="Context / Notes">
            <TextArea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="What you need help with and any constraints…" />
          </Field>
          {target && (
            <p className="text-xs text-ink-3 bg-surface-2 rounded-xl px-3 py-2.5">
              {target.name} can accept or decline. You can edit or withdraw the request while it's pending — see <b>My Requests</b>.
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}
