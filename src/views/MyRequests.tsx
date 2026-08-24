import React, { useEffect, useState } from 'react';
import { Pencil, XCircle, Check, X, Car, UserPlus, RefreshCw } from 'lucide-react';
import { useStore } from '../lib/store';
import { api, timeAgo, type Application, type CollabRequest } from '../lib/api';
import {
  Button, Card, StatusBadge, Chip, Avatar, Modal, Field, TextInput, TextArea, EmptyState, RowSkeleton, Reveal
} from '../components/ui';

export function MyRequests() {
  const s = useStore();
  const [data, setData] = useState<any>(null);
  const [section, setSection] = useState<'submitted' | 'received'>('submitted');
  const [editApp, setEditApp] = useState<Application | null>(null);
  const [editCollab, setEditCollab] = useState<CollabRequest | null>(null);
  const [editForm, setEditForm] = useState({ note: '', commitment: '', taskTitle: '', estimatedHours: '', dates: '', notes: '' });
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const d = await api.get('/requests/mine');
    setData(d);
  };
  useEffect(() => { load(); }, []);

  if (!data) return <RowSkeleton count={5} />;

  const applications: Application[] = data.applications || [];
  const collabSent: CollabRequest[] = data.collabSent || [];
  const collabReceived: CollabRequest[] = data.collabReceived || [];
  const bookings: any[] = data.bookings || [];
  const regRequests: any[] = data.regRequests || [];

  const receivedActionable = collabReceived.filter((c) => c.status === 'pending').length;

  const withdrawApp = async (app: Application) => {
    try {
      await api.post(`/applications/${app.id}/withdraw`);
      s.toast('info', 'Application withdrawn');
      await Promise.all([load(), s.loadPosts()]);
    } catch (e: any) { s.toast('error', 'Could not withdraw', e.message); }
  };

  const saveAppEdit = async () => {
    if (!editApp) return;
    setBusy(true);
    try {
      await api.patch(`/applications/${editApp.id}`, { note: editForm.note, commitment: editForm.commitment });
      s.toast('success', 'Request updated', 'Your manager sees the edited details.');
      setEditApp(null);
      await load();
    } catch (e: any) { s.toast('error', 'Could not save', e.message); }
    finally { setBusy(false); }
  };

  const saveCollabEdit = async () => {
    if (!editCollab) return;
    setBusy(true);
    try {
      await api.patch(`/collab-requests/${editCollab.id}`, {
        taskTitle: editForm.taskTitle, estimatedHours: editForm.estimatedHours,
        dates: editForm.dates, notes: editForm.notes
      });
      s.toast('success', 'Request updated');
      setEditCollab(null);
      await load();
    } catch (e: any) { s.toast('error', 'Could not save', e.message); }
    finally { setBusy(false); }
  };

  const collabAction = async (id: string, action: string) => {
    try {
      await api.post(`/collab-requests/${id}/respond`, { action });
      s.toast('success', `Request ${action}`);
      await load();
    } catch (e: any) { s.toast('error', 'Action failed', e.message); }
  };

  const cancelBooking = async (tripId: string) => {
    await api.post(`/carpool/trips/${tripId}/cancel-booking`);
    s.toast('info', 'Booking cancelled');
    await load();
  };

  return (
    <div className="anim-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">My Requests</h1>
          <p className="text-xs text-ink-2 mt-0.5">Everything you've submitted and everything waiting on you — in one place</p>
        </div>
        <Button variant="ghost" size="sm" onClick={load} aria-label="Refresh"><RefreshCw className="w-4 h-4" /></Button>
      </div>

      <div className="flex gap-1.5 mb-5 panel shadow-card p-1 rounded-xl w-fit">
        {(['submitted', 'received'] as const).map((sec) => (
          <button
            key={sec} onClick={() => setSection(sec)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              section === sec ? 'bg-primary text-on-primary' : 'text-ink-2 hover:text-ink'
            }`}
          >
            {sec === 'submitted' ? 'Submitted by me' : 'Received'}
            {sec === 'received' && receivedActionable > 0 && (
              <span className="min-w-4 h-4 px-1 rounded-full bg-primary text-on-primary text-xs font-semibold flex items-center justify-center">
                {receivedActionable}
              </span>
            )}
          </button>
        ))}
      </div>

      {section === 'submitted' ? (
        <div className="space-y-6">
          {/* Gig applications */}
          <section>
            <h2 className="text-sm font-semibold text-ink mb-3">Work applications ({applications.length})</h2>
            {applications.length === 0 ? (
              <EmptyState title="No applications yet" hint="Put your name forward for an opportunity and track it here." />
            ) : (
              <Reveal stagger className="space-y-2.5">
                {applications.map((a) => {
                  const canEdit = ['pending', 'awaiting_registration'].includes(a.status);
                  const forSomeoneElse = a.applicantId !== s.user?.id;
                  return (
                    <Card key={a.id} className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar initials={a.applicantInitials} size="sm" name={a.applicantName} />
                        <div className="flex-1 min-w-0">
                          <button
                            onClick={() => { s.setTab('work'); s.setOpenWorkId(a.postId); }}
                            className="text-sm font-semibold text-ink hover:text-primary-text text-left leading-snug"
                          >
                            {a.postTitle}
                          </button>
                          <p className="text-xs text-ink-3 mt-0.5">
                            {forSomeoneElse ? <>Nominated: <b className="text-ink-2">{a.applicantName}</b> · </> : null}
                            {a.commitment || a.postEffort} · {a.postDepartment} · {timeAgo(a.createdAt)}
                            {a.editedAt && ' · edited'}
                            {a.managerName && <> · approver: <b className="text-ink-2">{a.managerName}</b></>}
                          </p>
                          {a.status === 'awaiting_registration' && (
                            <p className="text-xs text-violet font-medium mt-1">
                              Waiting for the admin to register {forSomeoneElse ? `${a.applicantName}'s` : 'your'} manager — then it routes for approval automatically.
                            </p>
                          )}
                          {a.managerNotes && (
                            <p className={`text-xs mt-1 rounded-lg px-2.5 py-1.5 ${
                              a.status === 'approved' ? 'text-amber bg-amber-soft' : 'text-ink-2 bg-surface-2'
                            }`}>
                              {a.status === 'approved' ? 'Approved with conditions: ' : 'Manager: '}
                              “{a.managerNotes}”
                            </p>
                          )}
                        </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <StatusBadge status={a.status} />
                          {canEdit && (
                            <>
                              <Button size="sm" variant="secondary" onClick={() => {
                                setEditApp(a);
                                setEditForm({ ...editForm, note: a.note, commitment: a.commitment });
                              }} aria-label="Edit request">
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button size="sm" variant="danger" onClick={() => withdrawApp(a)} aria-label="Withdraw request">
                                <XCircle className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </Reveal>
            )}
          </section>

          {/* Collab requests sent */}
          <section>
            <h2 className="text-sm font-semibold text-ink mb-3">Collaboration requests sent ({collabSent.length})</h2>
            {collabSent.length === 0 ? (
              <EmptyState title="No collaboration requests" hint="Ask a specific colleague for help from People & Skills." />
            ) : (
              <Reveal stagger className="space-y-2.5">
                {collabSent.map((c) => (
                  <Card key={c.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar initials={c.targetInitials} size="sm" name={c.targetName} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-normal text-ink leading-snug">{c.task_title}</p>
                      <p className="text-xs text-ink-3 mt-0.5">
                        To {c.targetName} ({c.targetDepartment}) · {c.estimated_hours || 'effort TBD'} · {timeAgo(c.created_at)}
                        {c.edited_at && ' · edited'}
                      </p>
                    </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={c.status} />
                      {c.status === 'pending' && (
                        <>
                          <Button size="sm" variant="secondary" aria-label="Edit" onClick={() => {
                            setEditCollab(c);
                            setEditForm({ ...editForm, taskTitle: c.task_title, estimatedHours: c.estimated_hours, dates: c.dates, notes: c.notes });
                          }}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="sm" variant="danger" aria-label="Withdraw" onClick={() => collabAction(c.id, 'withdrawn')}>
                            <XCircle className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                      {c.status === 'accepted' && (
                        <Button size="sm" variant="soft" onClick={() => collabAction(c.id, 'completed')}>Mark Completed</Button>
                      )}
                    </div>
                  </Card>
                ))}
              </Reveal>
            )}
          </section>

          {/* Carpool bookings */}
          {bookings.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-ink mb-3">Carpool bookings ({bookings.length})</h2>
              <Reveal stagger className="space-y-2.5">
                {bookings.map((b) => (
                  <Card key={b.id} className="p-4 flex flex-wrap items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-green-soft text-green flex items-center justify-center shrink-0">
                      <Car className="w-4 h-4" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-normal text-ink truncate">{b.origin} → {b.destination}</p>
                      <p className="text-xs text-ink-3">
                        {b.direction === 'to_office' ? 'Morning' : 'Evening'} · {b.departureTime} · driver {b.driverName}
                      </p>
                    </div>
                    <Button size="sm" variant="danger" onClick={() => cancelBooking(b.tripId)}>Cancel Seat</Button>
                  </Card>
                ))}
              </Reveal>
            </section>
          )}

          {/* Registration requests */}
          {regRequests.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-ink mb-3">Registration requests ({regRequests.length})</h2>
              <Reveal stagger className="space-y-2.5">
                {regRequests.map((r) => (
                  <Card key={r.id} className="p-4 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-violet-soft text-violet flex items-center justify-center shrink-0">
                      <UserPlus className="w-4 h-4" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-normal text-ink truncate">{r.subjectName} <span className="text-ink-3 font-medium">({r.subjectKind})</span></p>
                      <p className="text-xs text-ink-3 line-clamp-1">{r.note}</p>
                    </div>
                    <StatusBadge status={r.status === 'pending' ? 'awaiting_registration' : r.status} />
                  </Card>
                ))}
              </Reveal>
            </section>
          )}
        </div>
      ) : (
        <section>
          <h2 className="text-sm font-semibold text-ink mb-3">Collaboration requests to me ({collabReceived.length})</h2>
          {collabReceived.length === 0 ? (
            <EmptyState title="Nothing waiting on you" hint="Requests colleagues send you will land here." />
          ) : (
            <Reveal stagger className="space-y-2.5">
              {collabReceived.map((c) => (
                <Card key={c.id} className="p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Avatar initials={c.requesterInitials} size="sm" name={c.requesterName} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-normal text-ink leading-snug">{c.task_title}</p>
                      <p className="text-xs text-ink-3 mt-0.5">
                        From {c.requesterName} ({c.requesterDepartment}) · {c.estimated_hours || 'effort TBD'}
                        {c.dates && ` · ${c.dates}`} · {timeAgo(c.created_at)}{c.edited_at && ' · edited'}
                      </p>
                      {c.notes && <p className="text-xs text-ink-2 mt-1.5">{c.notes}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      {c.status === 'pending' ? (
                        <>
                          <Button size="sm" onClick={() => collabAction(c.id, 'accepted')}>
                            <Check className="w-3.5 h-3.5" /> Accept
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => collabAction(c.id, 'declined')}>
                            <X className="w-3.5 h-3.5" /> Decline
                          </Button>
                        </>
                      ) : (
                        <StatusBadge status={c.status} />
                      )}
                      {c.status === 'accepted' && (
                        <Button size="sm" variant="soft" onClick={() => collabAction(c.id, 'completed')}>Mark Completed</Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </Reveal>
          )}
          {(s.user?.systemRole === 'manager' || s.user?.systemRole === 'admin') && (
            <Card className="p-4 mt-4 flex items-center justify-between gap-3">
              <p className="text-xs text-ink-2">Approval requests from your team live in the <b>Approvals</b> inbox.</p>
              <Button size="sm" variant="soft" onClick={() => s.setTab('manager')}>Open Approvals</Button>
            </Card>
          )}
        </section>
      )}

      {/* Edit application modal */}
      <Modal
        open={!!editApp} onClose={() => setEditApp(null)}
        title="Edit Request" subtitle={editApp?.postTitle}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditApp(null)}>Cancel</Button>
            <Button onClick={saveAppEdit} disabled={busy}>{busy ? 'Saving…' : 'Save Changes'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Requested Commitment" hint='e.g. "8 hours"'>
            <TextInput value={editForm.commitment} onChange={(e) => setEditForm({ ...editForm, commitment: e.target.value })} />
          </Field>
          <Field label="Note to manager">
            <TextArea value={editForm.note} onChange={(e) => setEditForm({ ...editForm, note: e.target.value })} />
          </Field>
          <p className="text-xs text-ink-3 bg-surface-2 rounded-xl px-3 py-2.5">
            Edits are only possible while the request is pending. The approver is notified and sees an “edited” marker.
          </p>
        </div>
      </Modal>

      {/* Edit collab modal */}
      <Modal
        open={!!editCollab} onClose={() => setEditCollab(null)}
        title="Edit Collaboration Request" subtitle={editCollab ? `To ${editCollab.targetName}` : ''}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditCollab(null)}>Cancel</Button>
            <Button onClick={saveCollabEdit} disabled={busy}>{busy ? 'Saving…' : 'Save Changes'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Task / Topic" required>
            <TextInput value={editForm.taskTitle} onChange={(e) => setEditForm({ ...editForm, taskTitle: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Estimated Hours">
              <TextInput value={editForm.estimatedHours} onChange={(e) => setEditForm({ ...editForm, estimatedHours: e.target.value })} />
            </Field>
            <Field label="Dates">
              <TextInput value={editForm.dates} onChange={(e) => setEditForm({ ...editForm, dates: e.target.value })} />
            </Field>
          </div>
          <Field label="Notes">
            <TextArea value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
