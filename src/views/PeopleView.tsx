import React, { useMemo, useState } from 'react';
import { Star, MessageSquare, Handshake } from 'lucide-react';
import { useStore } from '../lib/store';
import { api, type User } from '../lib/api';
import { Button, Card, Chip, Avatar, Modal, Field, TextInput, TextArea, EmptyState, Reveal } from '../components/ui';

const DEPARTMENTS = ['All', 'PT-THIA', 'PT-THIS', 'PT-THIT', 'PT-THID', 'PT-THIE', 'PT-THIM', 'PT-THIP', 'PT-THIG', 'PT-THIC', 'PT-THIF'];

export function PeopleView() {
  const s = useStore();
  const [query, setQuery] = useState('');
  const [dept, setDept] = useState('All');
  const [target, setTarget] = useState<User | null>(null);
  const [form, setForm] = useState({ taskTitle: '', estimatedHours: '', dates: '', notes: '' });
  const [busy, setBusy] = useState(false);

  const people = useMemo(() => s.users.filter((u) => {
    if (u.id === s.user?.id || u.systemRole === 'admin') return false;
    if (dept !== 'All' && u.department !== dept) return false;
    if (query) {
      const ql = query.toLowerCase();
      if (!u.name.toLowerCase().includes(ql) &&
          !u.primarySkills.some((sk) => sk.toLowerCase().includes(ql)) &&
          !u.role.toLowerCase().includes(ql)) return false;
    }
    return true;
  }), [s.users, s.user, dept, query]);

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
        <p className="text-xs text-ink-2 mt-0.5">Verified colleagues across all PT-TH departments, with declared bandwidth</p>
      </div>

      <div className="sticky-bar -mx-1 px-1 py-2.5 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-2xl">
          <div className="sm:col-span-2">
            <TextInput placeholder="Search by name, skill, or role…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <select
            value={dept} onChange={(e) => setDept(e.target.value)} aria-label="Filter by department"
            className="w-full px-3.5 py-2.5 rounded-xl panel border border-line-strong text-sm text-ink focus:border-primary focus:outline-none"
          >
            <option value="All">All departments</option>
            {DEPARTMENTS.filter((d) => d !== 'All').map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {people.length === 0 ? (
        <EmptyState title="No matching colleagues" hint="Try a different search term or department." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {people.map((u, i) => (
            <Reveal key={u.id} delay={(i % 4) * 60}>
            <Card className="p-7 h-full flex flex-col">
              <div className="flex items-start gap-3">
                <Avatar initials={u.initials} size="lg" name={u.name} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-normal text-ink truncate">{u.name}</p>
                  <p className="text-xs text-ink-2 truncate">{u.role}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Chip>{u.department}</Chip>
                    <span className="flex items-center gap-0.5 text-xs font-semibold text-amber">
                      <Star className="w-3 h-3 fill-current" /> {Number(u.contributionScore).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3.5">
                {u.primarySkills.slice(0, 4).map((sk) => <Chip key={sk}>{sk}</Chip>)}
                {u.primarySkills.length > 4 && <Chip>+{u.primarySkills.length - 4}</Chip>}
              </div>
              <p className="text-xs text-ink-3 mt-3">
                Bandwidth: <b className="text-ink-2">{u.typicalAvailability || `${u.availableHoursWeek}h/week`}</b>
                {' '}· {u.collaborationsCount} gigs · {u.hoursContributed}h contributed
              </p>
              <div className="flex gap-2 mt-4 pt-3.5 border-t border-line">
                <Button size="sm" className="flex-1" onClick={() => setTarget(u)}>
                  <Handshake className="w-3.5 h-3.5" /> Request Collaboration
                </Button>
                <Button size="sm" variant="secondary" onClick={() => { s.setMessagePartnerId(u.id); s.setMessagesOpen(true); }}
                  aria-label={`Message ${u.name}`}>
                  <MessageSquare className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
            </Reveal>
          ))}
        </div>
      )}

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
