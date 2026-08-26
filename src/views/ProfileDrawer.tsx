import React, { useState, useRef } from 'react';
import { Zap, KeyRound, Award, Cpu, Camera, Trash2, Star } from 'lucide-react';
import { useStore } from '../lib/store';
import { api } from '../lib/api';
import { processImageFile } from '../lib/imageCompressor';
import { Drawer, Button, Field, TextInput, Chip, Avatar } from '../components/ui';
import { TagEditor } from '../components/TagEditor';
import { CvSkillImport } from '../components/CvSkillImport';

export function ProfileDrawer() {
  const s = useStore();
  const u = s.user;
  const [availability, setAvailability] = useState({ hours: u?.availableHoursWeek || 0 });
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

  const consumed = Number(u.hoursConsumed || 0);
  const remaining = Math.max(0, (u.availableHoursWeek || 0) - consumed);

  const saveBandwidth = async () => {
    await api.patch('/me', { availableHoursWeek: Number(availability.hours) });
    await s.refreshMe();
    setEditingBandwidth(false);
    s.toast('success', 'Bandwidth updated', `Declared availability: ${availability.hours}h per week.`);
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
                <span className="text-ink-3 font-medium">/ 5</span>
              </span>
              <span className="text-xs font-medium text-ink-3">
                {Number(u.badgesCount)} badge{Number(u.badgesCount) === 1 ? '' : 's'}
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
            The bandwidth check compares this against what a request asks for, so nobody is matched to more than they offered.
          </p>
          {editingBandwidth ? (
            <div className="space-y-3">
              <Field label="Hours available per week">
                <TextInput type="number" min={0} max={168} value={availability.hours}
                  onChange={(e) => setAvailability({ ...availability, hours: parseInt(e.target.value) || 0 })} />
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
                  {' '}left of {u.availableHoursWeek}h this week
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
                    {consumed}h used by completed engagements this week.
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
                {/* Faster than typing twelve skills one at a time, and the
                    review step keeps a bad guess off the profile. */}
                <CvSkillImport
                  existing={stack.skills}
                  onAdd={(found) => setStack((prev) => ({
                    ...prev,
                    skills: [...prev.skills, ...found.filter((f) => !prev.skills.includes(f))]
                  }))}
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
