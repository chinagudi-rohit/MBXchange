import React, { useEffect, useState } from 'react';
import { Check, X, MessageSquare, RefreshCw } from 'lucide-react';
import { useStore } from '../lib/store';
import { api, timeAgo, type Application } from '../lib/api';
import {
  Button, Card, StatusBadge, Chip, Avatar, AiBadge, Modal, Field, TextArea, EmptyState, SkeletonGrid
} from '../components/ui';

function CapacityBar({ available, requiredText }: { available: number; requiredText: string }) {
  const match = requiredText.match(/(\d+)\s*[–\-—]?\s*(\d+)?/);
  const reqMax = match ? parseInt(match[2] || match[1], 10) : 0;
  const scale = Math.max(available, reqMax, 1);
  return (
    <div className="space-y-1.5 min-w-40">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-ink-3 w-16 shrink-0">Available</span>
        <div className="flex-1 h-2 rounded-full bg-surface-2 overflow-hidden">
          <div className="h-full rounded-full bg-primary" style={{ width: `${(available / scale) * 100}%` }} />
        </div>
        <span className="text-xs font-semibold text-ink-2 w-8 text-right">{available}h</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-ink-3 w-16 shrink-0">Required</span>
        <div className="flex-1 h-2 rounded-full bg-surface-2 overflow-hidden">
          <div className={`h-full rounded-full ${reqMax > available ? 'bg-red' : 'bg-green'}`} style={{ width: `${(reqMax / scale) * 100}%` }} />
        </div>
        <span className="text-xs font-semibold text-ink-2 w-8 text-right">{reqMax}h</span>
      </div>
    </div>
  );
}

export function ManagerInbox() {
  const s = useStore();
  const [approvals, setApprovals] = useState<Application[] | null>(null);
  const [decide, setDecide] = useState<{ app: Application; decision: 'approved' | 'rejected' } | null>(null);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const load = async () => {
    const d = await api.get('/approvals');
    setApprovals(d.approvals);
  };
  useEffect(() => { load(); }, []);

  if (!approvals) return <SkeletonGrid count={3} cols="grid-cols-1" />;

  const pending = approvals.filter((a) => a.status === 'pending');
  const decided = approvals.filter((a) => a.status !== 'pending' && a.status !== 'awaiting_registration');
  const waiting = approvals.filter((a) => a.status === 'awaiting_registration');

  const submitDecision = async () => {
    if (!decide) return;
    if (decide.decision === 'rejected' && !notes.trim()) {
      s.toast('error', 'Reason required', 'Give the employee a short reason for declining.');
      return;
    }
    setBusy(true);
    try {
      await api.post(`/approvals/${decide.app.id}/decision`, { decision: decide.decision, notes });
      s.toast('success', decide.decision === 'approved' ? 'Request approved' : 'Request declined',
        `${decide.app.applicantName} has been notified.`);
      setDecide(null);
      setNotes('');
      await load();
    } catch (e: any) {
      s.toast('error', 'Decision failed', e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="anim-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Approvals</h1>
          <p className="text-xs text-ink-2 mt-0.5">
            Cross-department requests from your team — with a rule-based AI capacity check on every request
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={load} aria-label="Refresh"><RefreshCw className="w-4 h-4" /></Button>
      </div>

      {pending.length === 0 ? (
        <EmptyState title="No pending approvals" hint="New requests from your direct reports will appear here." />
      ) : (
        <div className="space-y-3.5">
          {pending.map((a) => (
            <Card key={a.id} className="p-5">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-60">
                  <Avatar initials={a.applicantInitials} size="lg" name={a.applicantName} />
                  <div className="min-w-0">
                    <p className="text-sm font-normal text-ink">{a.applicantName}</p>
                    <p className="text-xs text-ink-3">{a.applicantRole} · {a.applicantDepartment}</p>
                    <p className="text-sm text-ink mt-2 leading-snug">
                      wants to support <b>{a.postTitle}</b>
                      <span className="text-ink-2"> ({a.postDepartment})</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <Chip>Commitment: {a.commitment || a.postEffort || '—'}</Chip>
                      <Chip>Requested {timeAgo(a.createdAt)}</Chip>
                      {a.editedAt && <Chip>edited</Chip>}
                    </div>
                    {a.note && <p className="text-xs text-ink-2 mt-2 bg-surface-2 rounded-lg px-3 py-2">“{a.note}”</p>}
                  </div>
                </div>
                <div className="shrink-0 w-full sm:w-56">
                  <CapacityBar available={a.applicantAvailableHours} requiredText={a.commitment || a.postEffort || ''} />
                </div>
              </div>

              <div className="mt-4 p-3.5 rounded-xl bg-surface-2 flex flex-col gap-2">
                <AiBadge verdict={a.aiRecommendation} />
                <p className="text-xs text-ink-2 leading-relaxed">{a.aiReason}</p>
              </div>

              <div className="flex items-center justify-end gap-2 mt-4">
                <Button variant="secondary" size="sm" onClick={() => { s.setMessagePartnerId(a.applicantId); s.setMessagesOpen(true); }}>
                  <MessageSquare className="w-3.5 h-3.5" /> Message
                </Button>
                <Button variant="danger" size="sm" onClick={() => { setDecide({ app: a, decision: 'rejected' }); setNotes(''); }}>
                  <X className="w-3.5 h-3.5" /> Decline
                </Button>
                <Button size="sm" onClick={() => { setDecide({ app: a, decision: 'approved' }); setNotes(''); }}>
                  <Check className="w-3.5 h-3.5" /> Approve
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {waiting.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-ink mb-3">Blocked on registration ({waiting.length})</h2>
          <div className="space-y-2">
            {waiting.map((a) => (
              <Card key={a.id} className="p-4 flex items-center gap-3">
                <Avatar initials={a.applicantInitials} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-ink truncate">{a.applicantName} → {a.postTitle}</p>
                  <p className="text-xs text-violet font-medium">Waiting for the admin to register this person's manager.</p>
                </div>
                <StatusBadge status={a.status} />
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <button onClick={() => setShowHistory((v) => !v)} className="text-xs font-semibold text-ink-2 hover:text-ink">
          {showHistory ? '▾' : '▸'} Decision history ({decided.length})
        </button>
        {showHistory && (
          <div className="space-y-2 mt-3">
            {decided.map((a) => (
              <Card key={a.id} className="p-4 flex flex-wrap items-center gap-3">
                <Avatar initials={a.applicantInitials} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-ink truncate">{a.applicantName} → {a.postTitle}</p>
                  <p className="text-xs text-ink-3">
                    {a.commitment} · decided {a.decidedAt ? timeAgo(a.decidedAt) : ''}
                    {a.managerNotes && ` · “${a.managerNotes.slice(0, 60)}”`}
                  </p>
                </div>
                <AiBadge verdict={a.aiRecommendation} />
                <StatusBadge status={a.status} />
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={!!decide} onClose={() => setDecide(null)}
        title={decide?.decision === 'approved' ? 'Approve Request' : 'Decline Request'}
        subtitle={decide ? `${decide.app.applicantName} → ${decide.app.postTitle.slice(0, 60)}` : ''}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDecide(null)}>Cancel</Button>
            <Button variant={decide?.decision === 'rejected' ? 'danger' : 'primary'} onClick={submitDecision} disabled={busy}>
              {busy ? 'Submitting…' : decide?.decision === 'approved' ? 'Confirm Approval' : 'Confirm Decline'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {decide && (
            <div className="p-3.5 rounded-xl bg-surface-2">
              <AiBadge verdict={decide.app.aiRecommendation} />
              <p className="text-xs text-ink-2 mt-1.5 leading-relaxed">{decide.app.aiReason}</p>
            </div>
          )}
          {decide?.decision === 'approved' && decide.app.aiRecommendation === 'Not Recommended' && (
            <p className="text-xs font-medium text-amber bg-amber-soft rounded-xl px-3 py-2.5">
              Heads-up: the capacity check advises against this. Approving anyway will overallocate the employee's declared hours.
            </p>
          )}
          <Field
            label={decide?.decision === 'approved' ? 'Conditions / notes (optional)' : 'Reason for declining'}
            required={decide?.decision === 'rejected'}
          >
            <TextArea
              value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder={decide?.decision === 'approved'
                ? 'e.g. Approved for up to 6 hours; keep Thursday HiL run unaffected.'
                : 'e.g. Sprint capacity is fully committed this iteration.'}
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
