import React, { useEffect, useState } from 'react';
import { Check, X, MessageSquare, RefreshCw } from 'lucide-react';
import { useStore } from '../lib/store';
import { TiltCard } from '../components/TiltCard';
import { api, timeAgo, type ApprovalItem } from '../lib/api';
import {
  Button, Card, Chip, Avatar, AiBadge, Modal, Field, TextArea, EmptyState, SkeletonGrid
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

/** A short line naming what this card is and who is waiting on the decision. */
function stageBlurb(a: ApprovalItem): { verb: string; subject: string; object: string } {
  if (a.kind === 'collab') {
    return { verb: 'agreed to help', subject: a.targetName || '', object: a.requesterName || '' };
  }
  return a.stage === 'author'
    ? { verb: 'applied to', subject: a.applicantName || '', object: a.postTitle || '' }
    : { verb: 'wants to support', subject: a.applicantName || '', object: a.postTitle || '' };
}

export function ManagerInbox() {
  const s = useStore();
  const [approvals, setApprovals] = useState<ApprovalItem[] | null>(null);
  const [decide, setDecide] = useState<{ item: ApprovalItem; decision: 'approved' | 'rejected'; conditional?: boolean } | null>(null);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const d = await api.get('/approvals');
    setApprovals(d.approvals);
  };
  useEffect(() => { load(); }, []);

  if (!approvals) return <SkeletonGrid count={3} cols="grid-cols-1" />;

  const authorStage = approvals.filter((a) => a.kind === 'application' && a.stage === 'author');
  const managerStage = approvals.filter((a) => a.kind === 'application' && a.stage === 'manager');
  const collabStage = approvals.filter((a) => a.kind === 'collab');

  const submitDecision = async () => {
    if (!decide) return;
    if (decide.decision === 'rejected' && !notes.trim()) {
      s.toast('error', 'Reason required', 'Give a short reason for declining.');
      return;
    }
    if (decide.conditional && !notes.trim()) {
      s.toast('error', 'Conditions required', 'Spell out the limits you are approving under.');
      return;
    }
    setBusy(true);
    try {
      await api.post(`/approvals/${decide.item.id}/decision`, { decision: decide.decision, notes });
      const who = decide.item.kind === 'collab' ? decide.item.targetName : decide.item.applicantName;
      s.toast('success',
        decide.decision === 'rejected' ? 'Request declined'
          : decide.conditional ? 'Approved with conditions' : 'Request approved',
        `${who} has been notified.`);
      setDecide(null);
      setNotes('');
      await Promise.all([load(), s.loadPosts()]);
    } catch (e: any) {
      s.toast('error', 'Decision failed', e.message);
    } finally {
      setBusy(false);
    }
  };

  const messagePartner = (a: ApprovalItem) => {
    const id = a.kind === 'collab' ? a.targetId : a.applicantId;
    if (id) { s.setMessagePartnerId(id); s.setMessagesOpen(true); }
  };

  const renderCard = (a: ApprovalItem) => {
    const { verb, subject, object } = stageBlurb(a);
    const isSelf = a.kind === 'collab'
      ? (a.requesterId === s.user?.id || a.targetId === s.user?.id)
      : a.applicantId === s.user?.id;
    const avatarInitials = a.kind === 'collab' ? a.targetInitials : a.applicantInitials;
    const avatarName = subject;
    const roleLine = a.kind === 'collab'
      ? `${a.targetRole} · ${a.targetDepartment}`
      : `${a.applicantRole} · ${a.applicantDepartment}`;
    const commitment = a.kind === 'collab' ? (a.estimatedHours || 'effort TBD') : (a.commitment || a.postEffort || '—');
    const note = a.kind === 'collab' ? a.notes : a.note;

    return (
      <TiltCard key={`${a.kind}:${a.id}`}>
      <Card className="p-5 h-full flex flex-col">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-60">
            <Avatar initials={avatarInitials || '?'} size="lg" name={avatarName} />
            <div className="min-w-0">
              <p className="text-sm font-normal text-ink">{avatarName}</p>
              <p className="text-xs text-ink-3">{roleLine}</p>
              <p className="text-sm text-ink mt-2 leading-snug">
                {verb} <b>{object}</b>
                {a.kind === 'application' && <span className="text-ink-2"> ({a.postDepartment})</span>}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <Chip>Commitment: {commitment}</Chip>
                <Chip>Requested {timeAgo(a.createdAt)}</Chip>
                {a.editedAt && <Chip>edited</Chip>}
                <Chip tone={a.stage === 'author' ? 'primary' : undefined}>
                  {a.stage === 'author' ? "Requirement author's decision" : "Manager's decision"}
                </Chip>
              </div>
              {note && <p className="text-xs text-ink-2 mt-2 bg-surface-2 rounded-lg px-3 py-2">“{note}”</p>}
            </div>
          </div>
          {a.kind === 'application' && a.stage === 'manager' && (
            <div className="shrink-0 w-full sm:w-56">
              <CapacityBar available={a.applicantAvailableHours || 0} requiredText={a.commitment || a.postEffort || ''} />
            </div>
          )}
        </div>

        {/* The bandwidth check is a manager-stage thing — it compares
            declared bandwidth against required effort, which is exactly what
            a manager (not a requirement's author) needs to weigh. */}
        {a.kind === 'application' && a.stage === 'manager' && (
          <div className="mt-4 p-3.5 rounded-xl bg-surface-2 flex flex-col gap-2">
            <AiBadge verdict={a.aiRecommendation || ''} />
            <p className="text-xs text-ink-2 leading-relaxed">{a.aiReason}</p>
          </div>
        )}

        {/* Admins can decide any request, which would otherwise include their
            own — the platform is administered by engineers who also apply
            for work and request collaboration here. The server refuses a
            self-decision either way; this keeps the UI honest. */}
        {isSelf ? (
          <div className="flex items-center justify-end gap-3 mt-4">
            <p className="text-xs text-ink-3">
              Your own request — {a.kind === 'collab' ? 'the target\'s manager' : (a.stage === 'author' ? 'the requirement\'s author' : (a.managerName || 'your manager'))} decides this one.
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-2 mt-4">
            <Button variant="secondary" size="sm" onClick={() => messagePartner(a)}>
              <MessageSquare className="w-3.5 h-3.5" /> Message
            </Button>
            <Button variant="danger" size="sm" onClick={() => { setDecide({ item: a, decision: 'rejected' }); setNotes(''); }}>
              <X className="w-3.5 h-3.5" /> Decline
            </Button>
            <Button size="sm" onClick={() => { setDecide({ item: a, decision: 'approved' }); setNotes(''); }}>
              <Check className="w-3.5 h-3.5" /> Approve
            </Button>
          </div>
        )}
      </Card>
      </TiltCard>
    );
  };

  const totalPending = authorStage.length + managerStage.length + collabStage.length;

  return (
    <div className="anim-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Approvals</h1>
          <p className="text-xs text-ink-2 mt-0.5">
            Requests waiting on a decision from you — as a requirement's author, as a manager, or both
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={load} aria-label="Refresh"><RefreshCw className="w-4 h-4" /></Button>
      </div>

      {totalPending === 0 ? (
        <EmptyState title="Nothing waiting on you" hint="Applications to things you've posted, and requests routed to you as a manager, will appear here." />
      ) : (
        <div className="space-y-8">
          {authorStage.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-ink mb-3">
                Applications to your requirements ({authorStage.length})
              </h2>
              <div className="space-y-3.5">{authorStage.map(renderCard)}</div>
            </section>
          )}
          {managerStage.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-ink mb-3">
                Awaiting your approval as manager ({managerStage.length})
              </h2>
              <div className="space-y-3.5">{managerStage.map(renderCard)}</div>
            </section>
          )}
          {collabStage.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-ink mb-3">
                Collaboration requests awaiting your sign-off ({collabStage.length})
              </h2>
              <div className="space-y-3.5">{collabStage.map(renderCard)}</div>
            </section>
          )}
        </div>
      )}

      <Modal
        open={!!decide} onClose={() => setDecide(null)}
        title={decide?.decision === 'rejected' ? 'Decline Request' : decide?.conditional ? 'Approve with Conditions' : 'Approve Request'}
        subtitle={decide ? `${decide.item.kind === 'collab' ? decide.item.targetName : decide.item.applicantName} → ${(decide.item.kind === 'collab' ? decide.item.taskTitle : decide.item.postTitle || '').slice(0, 60)}` : ''}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDecide(null)}>Cancel</Button>
            <Button variant={decide?.decision === 'rejected' ? 'danger' : 'primary'} onClick={submitDecision} disabled={busy}>
              {busy ? 'Submitting…' : decide?.decision === 'rejected' ? 'Confirm Decline' : decide?.conditional ? 'Approve with Conditions' : 'Confirm Approval'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {decide?.item.kind === 'application' && decide.item.stage === 'manager' && (
            <div className="p-3.5 rounded-xl bg-surface-2">
              <AiBadge verdict={decide.item.aiRecommendation || ''} />
              <p className="text-xs text-ink-2 mt-1.5 leading-relaxed">{decide.item.aiReason}</p>
            </div>
          )}
          {decide?.decision === 'approved' && decide.item.aiRecommendation === 'Not Recommended' && (
            <p className="text-xs font-medium text-amber bg-amber-soft rounded-xl px-3 py-2.5">
              Heads-up: this asks for more than they offered. Approving anyway commits them beyond the bandwidth they put forward.
            </p>
          )}
          <Field
            label={
              decide?.decision === 'rejected' ? 'Reason for declining'
                : decide?.conditional ? 'Conditions of approval'
                : 'Notes (optional)'
            }
            required={decide?.decision === 'rejected' || !!decide?.conditional}
            hint={decide?.conditional ? 'The other party sees this.' : undefined}
          >
            <TextArea
              value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder={decide?.decision === 'approved'
                ? 'e.g. Approved for up to 6 hours; keep Thursday HiL run unaffected.'
                : 'e.g. Fully committed this sprint — happy to revisit next one.'}
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
