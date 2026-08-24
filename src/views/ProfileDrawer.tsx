import React, { useState, useRef } from 'react';
import { Star, Zap, KeyRound, Award, Cpu, X, Plus, Camera, Trash2 } from 'lucide-react';
import { useStore } from '../lib/store';
import { api } from '../lib/api';
import { processImageFile } from '../lib/imageCompressor';
import { searchSkills, ALL_SKILLS } from '../data/skills';
import { Drawer, Button, Field, TextInput, Chip, Avatar, Select } from '../components/ui';

/**
 * Chip-based tag editor with a typeahead over the skill catalogue.
 *
 * Typing filters on canonical names *and* aliases, so "full" surfaces
 * "Full Stack Developer" alongside the stack that usually comes with it, and
 * "k8s" finds Kubernetes. Arrow keys move through the list, Enter accepts the
 * highlighted suggestion (or the raw text, so anything not in the catalogue can
 * still be added).
 */
function TagEditor({ tags, onChange, placeholder, useCatalogue = false, suggestions = [] }: {
  tags: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  useCatalogue?: boolean;
  suggestions?: string[];
}) {
  const [draft, setDraft] = useState('');
  const [active, setActive] = useState(0);
  const [focused, setFocused] = useState(false);

  const add = (value: string) => {
    const v = value.trim();
    if (!v || tags.some((t) => t.toLowerCase() === v.toLowerCase())) { setDraft(''); return; }
    onChange([...tags, v]);
    setDraft('');
    setActive(0);
  };

  // Ranked matches from the catalogue while typing; a starter set when idle.
  const matches = useCatalogue && draft.trim()
    ? searchSkills(draft, tags, 8)
    : [];

  const idleChips = (useCatalogue ? ALL_SKILLS : suggestions)
    .filter((sug) => !tags.some((t) => t.toLowerCase() === sug.toLowerCase()))
    .filter((sug) => !draft || sug.toLowerCase().includes(draft.toLowerCase()))
    .slice(0, 8);

  const showList = focused && matches.length > 0;

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 pl-2 pr-1 py-1 rounded-lg bg-primary-soft text-primary-text text-xs font-bold">
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
        {tags.length === 0 && <span className="text-xs text-ink-3">Nothing added yet.</span>}
      </div>

      <div className="relative">
        <div className="flex gap-2">
          <TextInput
            value={draft}
            onChange={(e) => { setDraft(e.target.value); setActive(0); }}
            onFocus={() => setFocused(true)}
            // Delayed so a click on a suggestion lands before the list unmounts.
            onBlur={() => setTimeout(() => setFocused(false), 120)}
            onKeyDown={(e) => {
              if (showList && e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => (i + 1) % matches.length); return; }
              if (showList && e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => (i - 1 + matches.length) % matches.length); return; }
              if (e.key === 'Enter') {
                e.preventDefault();
                add(showList ? matches[active].name : draft);
                return;
              }
              if (e.key === 'Escape') { setFocused(false); return; }
              if (e.key === 'Backspace' && !draft && tags.length) onChange(tags.slice(0, -1));
            }}
            placeholder={placeholder}
            role="combobox"
            aria-expanded={showList}
            aria-autocomplete="list"
          />
          <Button size="sm" variant="secondary" onClick={() => add(draft)} disabled={!draft.trim()} aria-label="Add">
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>

        {showList && (
          <ul
            role="listbox"
            className="absolute z-20 left-0 right-0 top-full mt-1 panel-overlay rounded-xl shadow-pop p-1 max-h-60 overflow-y-auto"
          >
            {matches.map((m, i) => (
              <li key={m.name}>
                <button
                  role="option"
                  aria-selected={i === active}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => add(m.name)}
                  className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                    i === active ? 'bg-primary-soft text-primary-text' : 'text-ink hover:bg-surface-2'
                  }`}
                >
                  <span className="text-xs font-semibold truncate">{m.name}</span>
                  <span className="text-xs text-ink-3 shrink-0">{m.group}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {!showList && idleChips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {idleChips.map((sug) => (
            <button
              key={sug}
              onClick={() => add(sug)}
              className="px-2 py-0.5 rounded-lg bg-surface-2 text-ink-2 text-xs font-semibold hover:bg-primary-soft hover:text-primary-text transition-colors"
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
  const [availability, setAvailability] = useState({
    hours: u?.availableHoursWeek || 0,
    text: u?.typicalAvailability || '',
    period: (u?.bandwidthPeriod || 'week') as 'week' | 'month'
  });
  const [editingBandwidth, setEditingBandwidth] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
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

  const periodWord = u.bandwidthPeriod === 'month' ? 'month' : 'week';
  const consumed = Number(u.hoursConsumed || 0);
  const remaining = Math.max(0, (u.availableHoursWeek || 0) - consumed);

  const saveBandwidth = async () => {
    await api.patch('/me', {
      availableHoursWeek: Number(availability.hours),
      typicalAvailability: availability.text,
      bandwidthPeriod: availability.period
    });
    await s.refreshMe();
    setEditingBandwidth(false);
    s.toast('success', 'Bandwidth updated', `Declared availability: ${availability.hours}h per ${availability.period}.`);
  };

  const onPickPhoto = async (file?: File) => {
    if (!file) return;
    setPhotoBusy(true);
    try {
      // Resized and compressed in the browser so what reaches the API is small.
      const dataUrl = await processImageFile(file, { maxWidth: 400, quality: 0.85, cropToSquare: true });
      await api.patch('/me', { avatarUrl: dataUrl });
      await Promise.all([s.refreshMe(), s.loadUsers()]);
      s.toast('success', 'Photo updated');
    } catch (e: any) {
      s.toast('error', 'Could not update photo', e?.message || 'Please try a different image.');
    } finally {
      setPhotoBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const removePhoto = async () => {
    setPhotoBusy(true);
    try {
      await api.patch('/me', { avatarUrl: '' });
      await Promise.all([s.refreshMe(), s.loadUsers()]);
      s.toast('info', 'Photo removed');
    } finally {
      setPhotoBusy(false);
    }
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
          <input
            ref={fileRef} type="file" className="hidden"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={(e) => onPickPhoto(e.target.files?.[0])}
          />
          <div className="relative shrink-0">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={photoBusy}
              aria-label="Change profile photo"
              title="Change profile photo"
              className="group relative rounded-full block"
            >
              <Avatar initials={u.initials} size="xl" name={u.name} src={u.avatarUrl} />
              <span className="absolute inset-0 rounded-full bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </span>
            </button>
            {photoBusy && (
              <span className="absolute inset-0 rounded-full bg-surface/70 flex items-center justify-center">
                <span className="w-4 h-4 rounded-full border-2 border-line-strong border-t-primary animate-spin" />
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-lg font-medium text-ink">{u.name}</p>
            <p className="text-xs text-ink-2">{u.role} · {u.department}</p>
            <p className="text-xs text-ink-3 mt-0.5">{u.campus}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="flex items-center gap-1 text-xs font-semibold text-amber">
                <Star className="w-3.5 h-3.5 fill-current" /> {Number(u.contributionScore).toFixed(2)}
              </span>
              <Chip tone="primary">{u.systemRole.toUpperCase()}</Chip>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => fileRef.current?.click()}
                className="text-xs font-semibold text-primary-text hover:underline underline-offset-2"
              >
                {u.avatarUrl ? 'Change photo' : 'Add a photo'}
              </button>
              {u.avatarUrl && (
                <button
                  onClick={removePhoto}
                  className="text-xs font-medium text-ink-3 hover:text-red flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Remove
                </button>
              )}
            </div>
          </div>
        </div>

        {u.mustChangePassword && (
          <p className="text-xs font-medium text-amber bg-amber-soft rounded-xl px-3.5 py-2.5">
            You're using a temporary password issued by the admin — set your own below.
          </p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2.5">
          {stats.map((st) => (
            <div key={st.label} className="p-3.5 rounded-xl bg-surface-2 text-center">
              <p className="text-lg font-medium text-ink">{st.value}</p>
              <p className="text-xs font-medium text-ink-3 mt-0.5">{st.label}</p>
            </div>
          ))}
        </div>

        {/* Bandwidth */}
        <div className="p-4 rounded-2xl border border-line">
          <div className="flex items-center justify-between mb-1">
            <p className="flex items-center gap-1.5 text-sm font-normal text-ink">
              <Zap className="w-4 h-4 text-primary-text" /> Declared Bandwidth
            </p>
            {!editingBandwidth && (
              <Button size="sm" variant="secondary" onClick={() => setEditingBandwidth(true)}>Edit</Button>
            )}
          </div>
          <p className="text-xs text-ink-3 mb-3">
            The AI capacity check compares this against every request's required effort.
          </p>
          {editingBandwidth ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Hours available">
                  <TextInput type="number" min={0} max={200} value={availability.hours}
                    onChange={(e) => setAvailability({ ...availability, hours: parseInt(e.target.value) || 0 })} />
                </Field>
                <Field label="Per" hint="Pick the period these hours cover">
                  <Select
                    value={availability.period}
                    onChange={(e) => setAvailability({ ...availability, period: e.target.value as 'week' | 'month' })}
                  >
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                  </Select>
                </Field>
              </div>
              <Field label="Label" hint='Free text shown on your profile, e.g. "Tue–Thu afternoons"'>
                <TextInput value={availability.text}
                  onChange={(e) => setAvailability({ ...availability, text: e.target.value })} />
              </Field>
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="secondary" onClick={() => setEditingBandwidth(false)}>Cancel</Button>
                <Button size="sm" onClick={saveBandwidth}>Save</Button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xl font-medium text-primary-text">
                {remaining}h
                <span className="text-xs font-semibold text-ink-3">
                  {' '}left of {u.availableHoursWeek}h this {periodWord}
                  {u.typicalAvailability ? ` · ${u.typicalAvailability}` : ''}
                </span>
              </p>
              {consumed > 0 && (
                <div className="mt-2.5">
                  <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${Math.min(100, (consumed / Math.max(1, u.availableHoursWeek)) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-ink-3 mt-1.5">
                    {consumed}h used by completed engagements this {periodWord}.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Specialisation & tech stack — drives recommendations */}
        <div className="p-4 rounded-2xl border border-line">
          <div className="flex items-center justify-between mb-1">
            <p className="flex items-center gap-1.5 text-sm font-normal text-ink">
              <Cpu className="w-4 h-4 text-primary-text" /> Specialisation &amp; tech stack
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
          <p className="text-xs text-ink-3 mb-3">
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
                <p className="text-xs font-medium text-ink-2 mb-1.5">Tech stack / skills</p>
                <TagEditor
                  tags={stack.skills}
                  onChange={(skills) => setStack({ ...stack, skills })}
                  placeholder="Search a technology or role — try “full”, “k8s”, “safety”"
                  useCatalogue
                />
              </div>
              <div>
                <p className="text-xs font-medium text-ink-2 mb-1.5">Interests <span className="font-normal text-ink-3">(also used for matching)</span></p>
                <TagEditor
                  tags={stack.interests}
                  onChange={(interests) => setStack({ ...stack, interests })}
                  placeholder="Search an interest — try “ai”, “design”, “mentoring”"
                  useCatalogue
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
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-3">Specialisation</p>
                <p className="text-sm font-normal text-ink mt-0.5">
                  {u.specialisation || <span className="text-ink-3 font-normal">Not set yet — add it to sharpen your recommendations.</span>}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-3 mb-1.5">Tech stack</p>
                <div className="flex flex-wrap gap-1.5">
                  {u.primarySkills.length
                    ? u.primarySkills.map((sk) => <Chip key={sk} tone="primary">{sk}</Chip>)
                    : <span className="text-xs text-ink-3">No skills added.</span>}
                </div>
              </div>
              {u.interests.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-3 mb-1.5">Interests</p>
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
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-3 mb-2">
              <Award className="w-3.5 h-3.5" /> Badges
            </p>
            <div className="space-y-2">
              {u.badges.map((b) => (
                <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-2">
                  <span className="text-xl">{b.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-ink">{b.name}</p>
                    <p className="text-xs text-ink-3 truncate">{b.description}</p>
                  </div>
                  <span className="ml-auto text-xs text-ink-3 shrink-0">{b.dateEarned}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Password */}
        <div className="p-4 rounded-2xl border border-line">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-sm font-normal text-ink">
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
