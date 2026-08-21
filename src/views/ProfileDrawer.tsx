import React, { useState } from 'react';
import { Star, Zap, KeyRound, Award, Cpu, X, Plus } from 'lucide-react';
import { useStore } from '../lib/store';
import { api } from '../lib/api';
import { Drawer, Button, Field, TextInput, Chip, Avatar } from '../components/ui';

/** Common stacks offered as one-tap additions. */
const SKILL_SUGGESTIONS = [
  'AWS', 'Azure', 'Kubernetes', 'Terraform', 'Docker', 'CI/CD', 'Python', 'Java',
  'React', 'TypeScript', 'Node.js', 'Go', 'C++', 'Embedded C', 'AUTOSAR', 'CAN Bus',
  'MATLAB', 'Simulink', 'LLMs', 'RAG Architecture', 'PyTorch', 'Kafka', 'Spark',
  'SQL', 'Data Pipelines', 'ISO 26262', 'Functional Safety', 'dSPACE',
  'Hardware-in-the-Loop', 'INCA / CANape', 'ECU Calibration', 'Security', 'Figma'
];

/** Chip-based tag editor: type + Enter to add, click × to remove. */
function TagEditor({ tags, onChange, placeholder, suggestions = [] }: {
  tags: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  suggestions?: string[];
}) {
  const [draft, setDraft] = useState('');
  const add = (value: string) => {
    const v = value.trim();
    if (!v || tags.some((t) => t.toLowerCase() === v.toLowerCase())) { setDraft(''); return; }
    onChange([...tags, v]);
    setDraft('');
  };
  const unused = suggestions.filter(
    (sug) => !tags.some((t) => t.toLowerCase() === sug.toLowerCase())
  );
  const filtered = draft
    ? unused.filter((sug) => sug.toLowerCase().includes(draft.toLowerCase())).slice(0, 6)
    : unused.slice(0, 8);

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 pl-2 pr-1 py-1 rounded-lg bg-primary-soft text-primary text-[11px] font-bold">
            {t}
            <button
              onClick={() => onChange(tags.filter((x) => x !== t))}
              aria-label={`Remove ${t}`}
              className="p-0.5 rounded hover:bg-primary hover:text-on-primary transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {tags.length === 0 && <span className="text-[11px] text-ink-3">Nothing added yet.</span>}
      </div>
      <div className="flex gap-2">
        <TextInput
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); add(draft); }
            if (e.key === 'Backspace' && !draft && tags.length) onChange(tags.slice(0, -1));
          }}
          placeholder={placeholder}
        />
        <Button size="sm" variant="secondary" onClick={() => add(draft)} disabled={!draft.trim()} aria-label="Add">
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>
      {filtered.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {filtered.map((sug) => (
            <button
              key={sug}
              onClick={() => add(sug)}
              className="px-2 py-0.5 rounded-lg bg-surface-2 text-ink-2 text-[11px] font-semibold hover:bg-primary-soft hover:text-primary transition-colors"
            >
              + {sug}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProfileDrawer() {
  const s = useStore();
  const u = s.user;
  const [availability, setAvailability] = useState({ hours: u?.availableHoursWeek || 0, text: u?.typicalAvailability || '' });
  const [editingBandwidth, setEditingBandwidth] = useState(false);
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwBusy, setPwBusy] = useState(false);
  const [showPwForm, setShowPwForm] = useState(false);
  const [editingStack, setEditingStack] = useState(false);
  const [stackBusy, setStackBusy] = useState(false);
  const [stack, setStack] = useState<{ specialisation: string; skills: string[]; interests: string[] }>({
    specialisation: '', skills: [], interests: []
  });

  const saveStack = async () => {
    setStackBusy(true);
    try {
      await api.patch('/me', {
        specialisation: stack.specialisation,
        primarySkills: stack.skills,
        interests: stack.interests
      });
      await s.refreshMe();
      setEditingStack(false);
      s.toast('success', 'Specialisation updated', 'Your recommendations now use this stack.');
    } catch (e: any) {
      s.toast('error', 'Could not save', e.message);
    } finally {
      setStackBusy(false);
    }
  };

  if (!u) return null;

  const saveBandwidth = async () => {
    await api.patch('/me', { availableHoursWeek: Number(availability.hours), typicalAvailability: availability.text });
    await s.refreshMe();
    setEditingBandwidth(false);
    s.toast('success', 'Bandwidth updated', `Declared availability: ${availability.hours}h/week.`);
  };

  const changePassword = async () => {
    if (pw.next.length < 8) { s.toast('error', 'Too short', 'New password must be at least 8 characters.'); return; }
    if (pw.next !== pw.confirm) { s.toast('error', 'Passwords do not match'); return; }
    setPwBusy(true);
    try {
      await api.post('/auth/change-password', { currentPassword: pw.current, newPassword: pw.next });
      s.toast('success', 'Password changed');
      setPw({ current: '', next: '', confirm: '' });
      setShowPwForm(false);
      await s.refreshMe();
    } catch (e: any) {
      s.toast('error', 'Could not change password', e.message);
    } finally {
      setPwBusy(false);
    }
  };

  const stats = [
    { label: 'Gigs completed', value: u.collaborationsCount },
    { label: 'Hours contributed', value: `${u.hoursContributed}h` },
    { label: 'Departments helped', value: u.departmentsSupported },
    { label: 'Colleagues helped', value: u.peopleHelped }
  ];

  return (
    <Drawer
      open={s.profileOpen} onClose={() => s.setProfileOpen(false)}
      title="My Profile" subtitle="Reputation, bandwidth and account settings"
      width="max-w-lg"
    >
      <div className="p-5 space-y-5">
        {/* Identity */}
        <div className="flex items-center gap-4">
          <Avatar initials={u.initials} size="xl" name={u.name} />
          <div className="min-w-0">
            <p className="text-lg font-extrabold text-ink">{u.name}</p>
            <p className="text-xs text-ink-2">{u.role} · {u.department}</p>
            <p className="text-[11px] text-ink-3 mt-0.5">{u.campus}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="flex items-center gap-1 text-xs font-bold text-amber">
                <Star className="w-3.5 h-3.5 fill-current" /> {Number(u.contributionScore).toFixed(2)}
              </span>
              <Chip tone="primary">{u.systemRole.toUpperCase()}</Chip>
            </div>
          </div>
        </div>

        {u.mustChangePassword && (
          <p className="text-xs font-semibold text-amber bg-amber-soft rounded-xl px-3.5 py-2.5">
            You're using a temporary password issued by the admin — set your own below.
          </p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2.5">
          {stats.map((st) => (
            <div key={st.label} className="p-3.5 rounded-xl bg-surface-2 text-center">
              <p className="text-lg font-extrabold text-ink">{st.value}</p>
              <p className="text-[10px] font-medium text-ink-3 mt-0.5">{st.label}</p>
            </div>
          ))}
        </div>

        {/* Bandwidth */}
        <div className="p-4 rounded-2xl border border-line">
          <div className="flex items-center justify-between mb-1">
            <p className="flex items-center gap-1.5 text-sm font-bold text-ink">
              <Zap className="w-4 h-4 text-primary" /> Declared Bandwidth
            </p>
            {!editingBandwidth && (
              <Button size="sm" variant="secondary" onClick={() => setEditingBandwidth(true)}>Edit</Button>
            )}
          </div>
          <p className="text-[11px] text-ink-3 mb-3">
            The AI capacity check compares this against every request's required effort.
          </p>
          {editingBandwidth ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Hours / week">
                  <TextInput type="number" min={0} max={40} value={availability.hours}
                    onChange={(e) => setAvailability({ ...availability, hours: parseInt(e.target.value) || 0 })} />
                </Field>
                <Field label="Label" hint='e.g. "4–8 hours/month"'>
                  <TextInput value={availability.text}
                    onChange={(e) => setAvailability({ ...availability, text: e.target.value })} />
                </Field>
              </div>
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="secondary" onClick={() => setEditingBandwidth(false)}>Cancel</Button>
                <Button size="sm" onClick={saveBandwidth}>Save</Button>
              </div>
            </div>
          ) : (
            <p className="text-xl font-extrabold text-primary">
              {u.availableHoursWeek}h<span className="text-xs font-semibold text-ink-3">/week · {u.typicalAvailability || '—'}</span>
            </p>
          )}
        </div>

        {/* Specialisation & tech stack — drives recommendations */}
        <div className="p-4 rounded-2xl border border-line">
          <div className="flex items-center justify-between mb-1">
            <p className="flex items-center gap-1.5 text-sm font-bold text-ink">
              <Cpu className="w-4 h-4 text-primary" /> Specialisation &amp; tech stack
            </p>
            {!editingStack && (
              <Button size="sm" variant="secondary" onClick={() => {
                setStack({
                  specialisation: u.specialisation || '',
                  skills: [...u.primarySkills],
                  interests: [...u.interests]
                });
                setEditingStack(true);
              }}>Edit</Button>
            )}
          </div>
          <p className="text-[11px] text-ink-3 mb-3">
            Opportunities on your Home feed are ranked against this — the more precise it is,
            the better the match.
          </p>

          {editingStack ? (
            <div className="space-y-4">
              <Field label="Specialisation" hint='e.g. "Cloud platform engineering" or "ADAS perception"'>
                <TextInput
                  value={stack.specialisation}
                  onChange={(e) => setStack({ ...stack, specialisation: e.target.value })}
                  placeholder="What you specialise in"
                />
              </Field>
              <div>
                <p className="text-xs font-semibold text-ink-2 mb-1.5">Tech stack / skills</p>
                <TagEditor
                  tags={stack.skills}
                  onChange={(skills) => setStack({ ...stack, skills })}
                  placeholder="Add a technology and press Enter"
                  suggestions={SKILL_SUGGESTIONS}
                />
              </div>
              <div>
                <p className="text-xs font-semibold text-ink-2 mb-1.5">Interests <span className="font-normal text-ink-3">(also used for matching)</span></p>
                <TagEditor
                  tags={stack.interests}
                  onChange={(interests) => setStack({ ...stack, interests })}
                  placeholder="Add an interest and press Enter"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="secondary" onClick={() => setEditingStack(false)}>Cancel</Button>
                <Button size="sm" onClick={saveStack} disabled={stackBusy}>
                  {stackBusy ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-ink-3">Specialisation</p>
                <p className="text-sm font-semibold text-ink mt-0.5">
                  {u.specialisation || <span className="text-ink-3 font-normal">Not set yet — add it to sharpen your recommendations.</span>}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-ink-3 mb-1.5">Tech stack</p>
                <div className="flex flex-wrap gap-1.5">
                  {u.primarySkills.length
                    ? u.primarySkills.map((sk) => <Chip key={sk} tone="primary">{sk}</Chip>)
                    : <span className="text-[11px] text-ink-3">No skills added.</span>}
                </div>
              </div>
              {u.interests.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-ink-3 mb-1.5">Interests</p>
                  <div className="flex flex-wrap gap-1.5">
                    {u.interests.map((it) => <Chip key={it}>{it}</Chip>)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Badges */}
        {u.badges.length > 0 && (
          <div>
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-3 mb-2">
              <Award className="w-3.5 h-3.5" /> Badges
            </p>
            <div className="space-y-2">
              {u.badges.map((b) => (
                <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-2">
                  <span className="text-xl">{b.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-ink">{b.name}</p>
                    <p className="text-[10px] text-ink-3 truncate">{b.description}</p>
                  </div>
                  <span className="ml-auto text-[10px] text-ink-3 shrink-0">{b.dateEarned}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Password */}
        <div className="p-4 rounded-2xl border border-line">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-sm font-bold text-ink">
              <KeyRound className="w-4 h-4 text-ink-3" /> Password
            </p>
            {!showPwForm && (
              <Button size="sm" variant="secondary" onClick={() => setShowPwForm(true)}>Change</Button>
            )}
          </div>
          {showPwForm && (
            <div className="space-y-3 mt-3">
              <Field label="Current password" required>
                <TextInput type="password" autoComplete="current-password" value={pw.current}
                  onChange={(e) => setPw({ ...pw, current: e.target.value })} />
              </Field>
              <Field label="New password" required hint="At least 8 characters">
                <TextInput type="password" autoComplete="new-password" value={pw.next}
                  onChange={(e) => setPw({ ...pw, next: e.target.value })} />
              </Field>
              <Field label="Confirm new password" required>
                <TextInput type="password" autoComplete="new-password" value={pw.confirm}
                  onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
              </Field>
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="secondary" onClick={() => setShowPwForm(false)}>Cancel</Button>
                <Button size="sm" onClick={changePassword} disabled={pwBusy}>
                  {pwBusy ? 'Saving…' : 'Update Password'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}
