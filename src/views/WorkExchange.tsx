import React, { useMemo, useState, useEffect } from 'react';
import {
  Plus, ArrowLeft, MapPin, Clock, Send, UserPlus, Trash2, Pencil, Zap, MessageSquare,
  AlertCircle, CalendarDays, ShieldCheck
} from 'lucide-react';
import { useStore } from '../lib/store';
import { TiltCard } from '../components/TiltCard';
import { MatchBadge, MatchBreakdown } from '../components/Match';
import { api, timeAgo, type WorkPost, type User } from '../lib/api';
import {
  Button, Modal, Field, TextInput, TextArea, Select, StatusBadge, UrgencyBadge, Chip, Avatar, SaveButton, EmptyState, Card, SeatsIndicator, Reveal, SkeletonGrid
} from '../components/ui';

const DEPARTMENTS = ['PT-THIA', 'PT-THIS', 'PT-THIT', 'PT-THID', 'PT-THIE', 'PT-THIM', 'PT-THIP', 'PT-THIG', 'PT-THIC', 'PT-THIF'];
const STATUSES = ['Open', 'In Progress', 'Completed', 'Cancelled'];
const URGENCIES = ['Low', 'Medium', 'High', 'Critical'];

/* ══════════════════ Post form (create + edit) ══════════════════ */

export function WorkFormModal({ open, onClose, existing }: {
  open: boolean; onClose: () => void; existing?: WorkPost | null;
}) {
  const s = useStore();
  const [form, setForm] = useState({
    title: '', department: s.user?.department || DEPARTMENTS[0], urgency: 'Medium',
    duration: '', effortHours: '', location: 'Remote / Hybrid', seats: 1,
    tags: '', description: '', whyOpportunity: '', approvalRequired: true
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open && existing) {
      setForm({
        title: existing.title, department: existing.department, urgency: existing.urgency,
        duration: existing.duration, effortHours: existing.effortHours, location: existing.location,
        seats: existing.seats, tags: existing.tags.join(', '), description: existing.description,
        whyOpportunity: existing.whyOpportunity, approvalRequired: existing.approvalRequired
      });
    } else if (open) {
      setForm((f) => ({ ...f, title: '', duration: '', effortHours: '', tags: '', description: '', whyOpportunity: '', seats: 1 }));
    }
  }, [open, existing]);

  const submit = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      s.toast('error', 'Missing details', 'Title and description are required.');
      return;
    }
    setBusy(true);
    try {
      const payload = {
        ...form,
        seats: Number(form.seats) || 1,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean)
      };
      if (existing) {
        await api.patch(`/work-posts/${existing.id}`, payload);
        s.toast('success', 'Requirement updated');
      } else {
        await api.post('/work-posts', payload);
        s.toast('success', 'Requirement published', 'Your request is now visible across departments.');
      }
      await s.loadPosts();
      onClose();
    } catch (e: any) {
      s.toast('error', 'Could not save', e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open} onClose={onClose} wide
      title={existing ? 'Edit Requirement' : 'Post a Requirement'}
      subtitle={existing ? 'Changes are marked as edited for anyone who applied' : 'Describe the help you need from other squads'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={busy}>{busy ? 'Saving…' : existing ? 'Save Changes' : 'Publish'}</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Field label="Title" required>
            <TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Need DevOps support for EKS deployment automation" />
          </Field>
        </div>
        <Field label="Department">
          <Select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
            {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
          </Select>
        </Field>
        <Field label="Urgency">
          <Select value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })}>
            {URGENCIES.map((u) => <option key={u}>{u}</option>)}
          </Select>
        </Field>
        <Field label="Duration" hint="e.g. 2 days">
          <TextInput value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="2 days" />
        </Field>
        <Field label="Expected Effort" hint="e.g. 8–12 hours — used by the AI capacity check">
          <TextInput value={form.effortHours} onChange={(e) => setForm({ ...form, effortHours: e.target.value })} placeholder="8–12 hours" />
        </Field>
        <Field label="Location">
          <TextInput value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        </Field>
        <Field label="Open Positions (seats)" hint="How many people you need">
          <TextInput type="number" min={1} max={10} value={form.seats}
            onChange={(e) => setForm({ ...form, seats: Math.max(1, parseInt(e.target.value) || 1) })} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Skill Tags" hint="Comma-separated, e.g. AWS, Terraform, Kubernetes">
            <TextInput value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="AWS, Terraform" />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Description" required>
            <TextArea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What do you need, the context, and what a helper would do…" />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Why it's a great opportunity" hint="Optional — sell the gig">
            <TextArea rows={2} value={form.whyOpportunity} onChange={(e) => setForm({ ...form, whyOpportunity: e.target.value })} />
          </Field>
        </div>
        <label className="sm:col-span-2 flex items-center gap-2.5 text-sm text-ink-2">
          <input
            type="checkbox" checked={form.approvalRequired}
            onChange={(e) => setForm({ ...form, approvalRequired: e.target.checked })}
            className="w-4 h-4 accent-(--primary)"
          />
          Manager approval required for applicants
        </label>
      </div>
    </Modal>
  );
}

/* ══════════════════ Apply modal ══════════════════ */

function ApplyModal({ open, onClose, post }: { open: boolean; onClose: () => void; post: WorkPost }) {
  const s = useStore();
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) setNote('');
  }, [open]);

  const byId = useMemo(() => new Map(s.users.map((u) => [u.id, u])), [s.users]);
  const openSeats = post.seats - post.seatsFilled;
  const selfManager = s.user?.managerId ? byId.get(s.user.managerId)?.name : null;

  const submit = async () => {
    setBusy(true);
    try {
      const { results } = await api.post(`/work-posts/${post.id}/apply`, { note });
      const r = results[0] || {};
      if (r.error) {
        s.toast('error', 'Not submitted', r.error);
      } else if (r.status === 'awaiting_registration') {
        s.toast('info', 'Waiting on registration', 'Your manager needs to be registered before this can be approved. The admin has been notified.');
      } else if (r.status === 'approved') {
        s.toast('success', 'You are on this requirement', 'No approval was needed — the author has been notified.');
      } else {
        s.toast('success', 'Request submitted', selfManager ? `Sent to ${selfManager} for approval.` : 'Sent for manager approval.');
      }
      await s.loadPosts();
      onClose();
    } catch (e: any) {
      s.toast('error', 'Application failed', e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open} onClose={onClose}
      title="Apply to help"
      subtitle={`${post.title.slice(0, 70)} · ${openSeats} of ${post.seats} seats open`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={busy}>
            <Send className="w-3.5 h-3.5" />
            {busy ? 'Submitting…' : 'Submit request'}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex items-start gap-3 p-3.5 rounded-xl border border-primary bg-primary-soft/40">
          <Avatar initials={s.user?.initials || '?'} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ink">{s.user?.name}</p>
            <p className="text-xs text-ink-2 mt-1">
              {post.approvalRequired
                ? selfManager
                  ? `Approval will be requested from ${selfManager}.`
                  : 'You have no registered manager — the admin will be asked to register them first.'
                : 'No manager approval is needed for this requirement.'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-surface-2 text-xs">
          <span className="text-ink-2">Your remaining capacity</span>
          <span className="font-semibold text-ink">
            {s.user?.availableHoursWeek ?? 0}h / {s.user?.bandwidthPeriod === 'month' ? 'month' : 'week'}
            <span className="text-ink-3 font-medium"> · this asks for {post.effortHours || post.duration || '—'}</span>
          </span>
        </div>

        <Field label="Note to your manager" hint="Optional — context on availability, motivation, or timing">
          <TextArea value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Sprint commitments are on track; available Tue–Thu afternoons." />
        </Field>
      </div>
    </Modal>
  );
}

/* ══════════════════ Detail view ══════════════════ */

function WorkDetail({ postId, onBack }: { postId: string; onBack: () => void }) {
  const s = useStore();
  const [data, setData] = useState<any>(null);
  const [comment, setComment] = useState('');
  const [applyOpen, setApplyOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const load = async () => {
    const d = await api.get(`/work-posts/${postId}`);
    setData(d);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [postId]);

  if (!data) return <SkeletonGrid count={2} cols="grid-cols-1" />;
  const post: WorkPost = data.post;
  const isAuthor = post.authorId === s.user?.id;
  const canModerate = isAuthor || s.user?.systemRole === 'admin';
  const openSeats = post.seats - post.seatsFilled;
  const myApp = data.myApplication;

  const postComment = async () => {
    if (!comment.trim()) return;
    await api.post(`/work-posts/${post.id}/comments`, { text: comment });
    setComment('');
    await load();
    s.toast('success', 'Reply posted');
  };

  const changeStatus = async (status: string) => {
    try {
      await api.patch(`/work-posts/${post.id}`, { status });
      await Promise.all([load(), s.loadPosts()]);
      s.toast('success', 'Status updated', `Now "${status}".`);
    } catch (e: any) {
      s.toast('error', 'Could not update status', e.message);
    }
  };

  return (
    <div className="anim-fade-up">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-ink-2 hover:text-ink mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Work Exchange
      </button>

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <StatusBadge status={post.status} />
              <UrgencyBadge urgency={post.urgency} />
              <Chip tone="primary">{post.department}</Chip>
              {post.editedAt && <Chip>edited</Chip>}
            </div>
            <h1 className="text-xl font-semibold text-ink leading-snug">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-ink-2">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {post.duration || '—'} · {post.effortHours || 'effort TBD'}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {post.location}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SaveButton saved={s.isSaved('work', post.id)} onToggle={async () => {
              const now = await s.toggleSaved('work', post.id);
              s.toast('info', now ? 'Saved' : 'Removed from saved');
            }} />
            {canModerate && (
              <>
                <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </Button>
                <Select
                  value={post.status} onChange={(e) => changeStatus(e.target.value)}
                  className="!w-auto !py-1.5 text-xs font-bold"
                  aria-label="Change status"
                >
                  {STATUSES.map((st) => <option key={st}>{st}</option>)}
                </Select>
              </>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between flex-wrap gap-3 p-3.5 rounded-xl bg-surface-2">
          <SeatsIndicator total={post.seats} filled={post.seatsFilled} />
          {isAuthor ? (
            <span className="text-xs font-semibold text-ink-3">You posted this requirement</span>
          ) : myApp ? (
            <StatusBadge status={myApp.status} />
          ) : post.status === 'Open' && openSeats > 0 ? (
            <Button onClick={() => setApplyOpen(true)}>
              <Send className="w-3.5 h-3.5" /> Apply to help
            </Button>
          ) : (
            <span className="text-xs font-semibold text-ink-3">
              {post.status !== 'Open' ? 'Not accepting applications' : 'All seats filled'}
            </span>
          )}
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-3 mb-1.5">Description</h3>
            <p className="text-sm text-ink-2 leading-relaxed whitespace-pre-line">{post.description}</p>
          </div>
          {post.whyOpportunity && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-3 mb-1.5">Why it's a great opportunity</h3>
              <p className="text-sm text-ink-2 leading-relaxed whitespace-pre-line">{post.whyOpportunity}</p>
            </div>
          )}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((t) => <Chip key={t}>{t}</Chip>)}
            </div>
          )}
          <div className="flex items-center gap-2.5 pt-3 border-t border-line">
            <Avatar initials={post.authorInitials} size="md" name={post.authorName} />
            <div>
              <p className="text-xs font-medium text-ink">{post.authorName}</p>
              <p className="text-xs text-ink-3">{post.authorRole} · {timeAgo(post.createdAt)}</p>
            </div>
          </div>

          {post.matchScore != null && (
            <div className="mt-4">
              <MatchBreakdown
                score={post.matchScore}
                skillFit={post.skillFit}
                capacityFit={post.capacityFit}
                reason={post.matchReason}
                matchedSkills={post.matchedSkills}
                crossDepartment={post.crossDepartment}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Applications (author / manager / admin) */}
      {data.applications?.length > 0 && (
        <Card className="p-5 mt-4">
          <h3 className="text-sm font-semibold text-ink mb-3">Applications ({data.applications.length})</h3>
          <div className="space-y-2">
            {data.applications.map((a: any) => (
              <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-2">
                <Avatar initials={a.applicantInitials} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-ink truncate">{a.applicantName} · {a.department}</p>
                  <p className="text-xs text-ink-3">{timeAgo(a.createdAt)}{a.note ? ` — ${a.note.slice(0, 60)}` : ''}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Comments */}
      <Card className="p-5 mt-4">
        <h3 className="text-sm font-semibold text-ink mb-3 flex items-center gap-1.5">
          <MessageSquare className="w-4 h-4 text-ink-3" /> Discussion ({data.comments.length})
        </h3>
        <div className="space-y-3">
          {data.comments.map((c: any) => (
            <div key={c.id} className="flex gap-2.5">
              <Avatar initials={c.authorInitials} size="sm" />
              <div className="flex-1 min-w-0 bg-surface-2 rounded-xl px-3.5 py-2.5">
                <p className="text-xs font-medium text-ink">{c.authorName} <span className="font-medium text-ink-3">· {c.authorRole} · {timeAgo(c.createdAt)}</span></p>
                <p className="text-xs text-ink-2 mt-1 leading-relaxed">{c.text}</p>
              </div>
            </div>
          ))}
          {data.comments.length === 0 && <p className="text-xs text-ink-3">No replies yet — start the thread.</p>}
        </div>
        <div className="flex gap-2 mt-4">
          <TextInput
            value={comment} onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') postComment(); }}
            placeholder="Add a reply…"
          />
          <Button onClick={postComment} disabled={!comment.trim()} aria-label="Post reply"><Send className="w-4 h-4" /></Button>
        </div>
      </Card>

      <ApplyModal open={applyOpen} onClose={() => { setApplyOpen(false); load(); }} post={post} />
      <WorkFormModal open={editOpen} onClose={() => { setEditOpen(false); load(); s.loadPosts(); }} existing={post} />
    </div>
  );
}

/* ══════════════════ Feed ══════════════════ */

export function WorkExchange() {
  const s = useStore();
  const [query, setQuery] = useState('');
  const [dept, setDept] = useState('All');
  const [status, setStatus] = useState('All');
  const [urgency, setUrgency] = useState('All');
  const [newOpen, setNewOpen] = useState(false);
  const [section, setSection] = useState<'requirements' | 'bandwidth'>('requirements');
  const [offers, setOffers] = useState<any[]>([]);
  const [offerModal, setOfferModal] = useState(false);
  const [offerForm, setOfferForm] = useState({ availableHours: '', skills: '', notes: '' });

  useEffect(() => {
    if (section === 'bandwidth') api.get('/bandwidth-offers').then((d) => setOffers(d.offers));
  }, [section]);

  const filtered = useMemo(() => s.posts.filter((p) => {
    if (dept !== 'All' && p.department !== dept) return false;
    if (status !== 'All' && p.status !== status) return false;
    if (urgency !== 'All' && p.urgency !== urgency) return false;
    if (query) {
      const ql = query.toLowerCase();
      if (!p.title.toLowerCase().includes(ql) && !p.tags.some((t) => t.toLowerCase().includes(ql)) &&
          !p.description.toLowerCase().includes(ql)) return false;
    }
    return true;
  }), [s.posts, dept, status, urgency, query]);

  if (s.openWorkId) {
    return <WorkDetail postId={s.openWorkId} onBack={() => s.setOpenWorkId(null)} />;
  }

  const submitOffer = async () => {
    if (!offerForm.availableHours.trim()) {
      s.toast('error', 'Hours required', 'Tell colleagues how many hours you can offer.');
      return;
    }
    await api.post('/bandwidth-offers', {
      availableHours: offerForm.availableHours,
      skills: offerForm.skills.split(',').map((x) => x.trim()).filter(Boolean),
      notes: offerForm.notes
    });
    setOfferModal(false);
    setOfferForm({ availableHours: '', skills: '', notes: '' });
    s.toast('success', 'Bandwidth registered', 'Your available hours are visible to all squads.');
    const d = await api.get('/bandwidth-offers');
    setOffers(d.offers);
  };

  return (
    <div className="anim-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Work Exchange</h1>
          <p className="text-xs text-ink-2 mt-0.5">Cross-department requirements, micro-gigs and bandwidth sharing</p>
        </div>
        <div className="flex gap-2">
          <Button variant="soft" onClick={() => setOfferModal(true)}>
            <Zap className="w-3.5 h-3.5" /> I Can Help
          </Button>
          <Button onClick={() => setNewOpen(true)}>
            <Plus className="w-4 h-4" /> Post Requirement
          </Button>
        </div>
      </div>

      <div className="flex gap-1.5 mb-4 panel shadow-card p-1 rounded-xl w-fit">
        {(['requirements', 'bandwidth'] as const).map((sec) => (
          <button
            key={sec}
            onClick={() => setSection(sec)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              section === sec ? 'bg-primary text-on-primary' : 'text-ink-2 hover:text-ink'
            }`}
          >
            {sec === 'requirements' ? `Open Requirements (${s.posts.filter((p) => p.status === 'Open').length})` : `Bandwidth Pool`}
          </button>
        ))}
      </div>

      {section === 'requirements' ? (
        <>
          <div className="sticky-bar -mx-1 px-3 py-3 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              <TextInput placeholder="Search by title, tag, keyword…" value={query} onChange={(e) => setQuery(e.target.value)} />
              <Select value={dept} onChange={(e) => setDept(e.target.value)} aria-label="Filter by department">
                <option value="All">All departments</option>
                {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </Select>
              <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
                <option value="All">Any status</option>
                {STATUSES.map((st) => <option key={st}>{st}</option>)}
              </Select>
              <Select value={urgency} onChange={(e) => setUrgency(e.target.value)} aria-label="Filter by urgency">
                <option value="All">Any urgency</option>
                {URGENCIES.map((u) => <option key={u}>{u}</option>)}
              </Select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title="No requirements match"
              hint="Try clearing filters, or post the first requirement for your squad."
              action={<Button onClick={() => setNewOpen(true)}><Plus className="w-4 h-4" /> Post Requirement</Button>}
            />
          ) : (
            // Two per row at every desktop width — wider cards carry the full
            // brief so the feed is scannable without opening each one.
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filtered.map((p, i) => {
                const openSeats = p.seats - p.seatsFilled;
                return (
                  <Reveal key={p.id} delay={(i % 2) * 70}>
                    <TiltCard>
                    <Card className="p-7 h-full flex flex-col" onClick={() => s.setOpenWorkId(p.id)}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-2">
                            <MatchBadge score={p.matchScore} />
                            <Chip>{p.department}</Chip>
                            <StatusBadge status={p.status} />
                            <UrgencyBadge urgency={p.urgency} />
                            {p.editedAt && <Chip>edited</Chip>}
                          </div>
                          <h3 className="text-base font-semibold text-ink leading-snug">{p.title}</h3>
                        </div>
                        <SaveButton saved={s.isSaved('work', p.id)} onToggle={async () => {
                          const now = await s.toggleSaved('work', p.id);
                          s.toast('info', now ? 'Saved' : 'Removed from saved');
                        }} />
                      </div>

                      <p className="text-xs text-ink-2 mt-2 line-clamp-3 leading-relaxed">{p.description}</p>

                      {/* Key facts, always in the same place so rows scan vertically */}
                      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-2.5 mt-4">
                        {[
                          { icon: <Clock className="w-3 h-3" />, label: 'Effort', value: p.effortHours || '—' },
                          { icon: <CalendarDays className="w-3 h-3" />, label: 'Duration', value: p.duration || '—' },
                          { icon: <MapPin className="w-3 h-3" />, label: 'Location', value: p.location || '—' },
                          {
                            icon: <ShieldCheck className="w-3 h-3" />, label: 'Approval',
                            value: p.approvalRequired ? 'Manager' : 'Not needed'
                          }
                        ].map((f) => (
                          <div key={f.label} className="min-w-0">
                            <dt className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-ink-3">
                              {f.icon} {f.label}
                            </dt>
                            <dd className="text-xs font-semibold text-ink-2 mt-0.5 truncate" title={f.value}>
                              {f.value}
                            </dd>
                          </div>
                        ))}
                      </dl>

                      <div className="flex flex-wrap gap-1.5 mt-3.5">
                        {p.tags.slice(0, 6).map((t) => <Chip key={t}>{t}</Chip>)}
                        {p.tags.length > 6 && <Chip>+{p.tags.length - 6}</Chip>}
                      </div>

                      <div className="flex items-center justify-between gap-3 mt-auto pt-4">
                        <SeatsIndicator total={p.seats} filled={p.seatsFilled} />
                        <span className="text-xs text-ink-3">
                          {p.commentCount > 0 && <>{p.commentCount} {p.commentCount === 1 ? 'reply' : 'replies'} · </>}
                          {openSeats === 0 ? 'filled' : `${openSeats} open`}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3 mt-3 pt-3.5 border-t border-line">
                        <span className="flex items-center gap-2 min-w-0">
                          <Avatar initials={p.authorInitials} size="sm" name={p.authorName} />
                          <span className="min-w-0">
                            <span className="block text-xs font-semibold text-ink truncate">{p.authorName}</span>
                            <span className="block text-xs text-ink-3 truncate">{p.authorRole} · {timeAgo(p.createdAt)}</span>
                          </span>
                        </span>
                        {p.myApplication
                          ? <StatusBadge status={p.myApplication.status} />
                          : <span className="text-xs font-semibold text-primary-text shrink-0">View &amp; Apply →</span>}
                      </div>
                    </Card>
                    </TiltCard>
                  </Reveal>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {offers.map((o, i) => (
            <Reveal key={o.id} delay={(i % 2) * 70}>
            <Card className="p-7 h-full">
              <div className="flex items-center gap-2.5 mb-3">
                <Avatar initials={o.initials} name={o.authorName} />
                <div className="min-w-0">
                  <p className="text-sm font-normal text-ink truncate">{o.authorName}</p>
                  <p className="text-xs text-ink-3">{o.authorRole} · {o.department}</p>
                </div>
                <span className="ml-auto shrink-0"><Chip tone="primary">{o.availableHours}</Chip></span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {(o.skills || []).map((sk: string) => <Chip key={sk}>{sk}</Chip>)}
              </div>
              <p className="text-xs text-ink-2 leading-relaxed">{o.notes}</p>
              <div className="mt-3.5 pt-3 border-t border-line flex justify-end">
                <Button size="sm" variant="soft" onClick={() => { s.setMessagePartnerId(o.authorId); s.setMessagesOpen(true); }}>
                  <MessageSquare className="w-3.5 h-3.5" /> Message
                </Button>
              </div>
            </Card>
            </Reveal>
          ))}
          {offers.length === 0 && (
            <div className="lg:col-span-2">
              <EmptyState title="No bandwidth offers yet" hint="Be the first to share spare hours with peer squads."
                action={<Button onClick={() => setOfferModal(true)}><Zap className="w-4 h-4" /> Offer Bandwidth</Button>} />
            </div>
          )}
        </div>
      )}

      <WorkFormModal open={newOpen} onClose={() => setNewOpen(false)} />

      <Modal
        open={offerModal} onClose={() => setOfferModal(false)}
        title="Offer Bandwidth" subtitle="Declare spare hours other squads can book"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOfferModal(false)}>Cancel</Button>
            <Button onClick={submitOffer}>Publish Offer</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Available Hours" required hint='e.g. "6 hours this month"'>
            <TextInput value={offerForm.availableHours} onChange={(e) => setOfferForm({ ...offerForm, availableHours: e.target.value })} />
          </Field>
          <Field label="Skills Offered" hint="Comma-separated">
            <TextInput value={offerForm.skills} onChange={(e) => setOfferForm({ ...offerForm, skills: e.target.value })} placeholder="AWS, Kubernetes" />
          </Field>
          <Field label="Notes">
            <TextArea value={offerForm.notes} onChange={(e) => setOfferForm({ ...offerForm, notes: e.target.value })} />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
