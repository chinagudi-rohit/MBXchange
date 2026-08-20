import React, { useState } from 'react';
import { 
  FileCheck, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  Briefcase,
  UserCheck
} from 'lucide-react';
import { ManagerApprovalItem, TalentProfile } from '../../types';

interface ManagerInboxProps {
  approvals: ManagerApprovalItem[];
  onApprove: (id: string, notes?: string) => void;
  onApproveWithConditions: (id: string, conditions: string) => void;
  onReject: (id: string, reason: string) => void;
  currentUser: TalentProfile;
}

export const ManagerInboxView: React.FC<ManagerInboxProps> = ({
  approvals = [],
  onApprove,
  onApproveWithConditions,
  onReject,
  currentUser
}) => {
  const [selectedItem, setSelectedItem] = useState<ManagerApprovalItem | null>(null);
  const [conditionText, setConditionText] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [activeModalAction, setActiveModalAction] = useState<'conditions' | 'reject' | null>(null);

  const safeApprovals = Array.isArray(approvals) ? approvals : [];

  const pendingApprovals = safeApprovals.filter(a => a.status === 'Pending');
  const pastApprovals = safeApprovals.filter(a => a.status !== 'Pending');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      
      {/* Header Banner */}
      <div className="bg-[#14171d] border border-[#21242c] rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Governance & Manager Approval Workflow</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Manager Collaboration Inbox
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1">
            Review and govern cross-department micro-gig commitments to prevent side-job conflicts and support employee growth transparently.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f1116] border border-[#21242c] text-center min-w-[140px]">
          <div className="text-2xl font-mono font-bold text-amber-400">{pendingApprovals.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Pending Approvals</div>
        </div>
      </div>

      {/* Pending Action Items */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          Pending Approvals Awaiting Review ({pendingApprovals.length})
        </h2>

        {pendingApprovals.length === 0 ? (
          <div className="bg-[#14171d] border border-[#21242c] rounded-2xl p-12 text-center shadow-xl space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white">All Caught Up!</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No pending collaboration approval requests from your team at this time.
            </p>
          </div>
        ) : (
          pendingApprovals.map((item) => (
            <div
              key={item.id}
              className="bg-[#14171d] border border-[#21242c] hover:border-amber-500/40 rounded-2xl p-6 shadow-xl space-y-5 transition-all"
            >
              {/* Employee and Opportunity Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#21242c]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-base">{item.employeeName}</span>
                    <span className="text-xs text-indigo-400 font-medium">({item.employeeRole})</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Department: <strong className="text-slate-300">{item.employeeDepartment}</strong> · Current Focus: <strong className="text-slate-300">{item.currentProject}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="px-2.5 py-1 rounded-lg bg-[#0f1116] border border-[#21242c]">
                    Requested: <strong>{item.requestedAt}</strong>
                  </span>
                </div>
              </div>

              {/* Target Project Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[#0f1116] border border-[#21242c] text-xs">
                <div>
                  <span className="text-slate-500 block mb-0.5">Target Opportunity:</span>
                  <strong className="text-white block font-medium">{item.opportunityTitle}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Target Department:</span>
                  <strong className="text-white block font-medium">{item.targetDepartment}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Commitment & Period:</span>
                  <strong className="text-amber-400 block font-mono font-bold">{item.requestedCommitment} ({item.period})</strong>
                </div>
              </div>

              {/* AI Recommendation Box (Section 19) */}
              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-indigo-300 flex items-center gap-2">
                    <span>AI Recommendation: {item.aiRecommendation}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {item.aiRecommendationReason}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
                <button
                  onClick={() => {
                    setSelectedItem(item);
                    setActiveModalAction('reject');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
                >
                  Reject
                </button>

                <button
                  onClick={() => {
                    setSelectedItem(item);
                    setActiveModalAction('conditions');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-amber-400 hover:bg-amber-500/10 border border-amber-500/20 transition-colors"
                >
                  Approve with Conditions
                </button>

                <button
                  onClick={() => onApprove(item.id)}
                  className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Collaboration</span>
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Past Approved / Reviewed Logs */}
      {pastApprovals.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-[#21242c]">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Decision History ({pastApprovals.length})
          </h2>

          <div className="space-y-2.5">
            {pastApprovals.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-[#0f1116] border border-[#21242c] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-bold text-white">{item.employeeName}</span>
                  <span className="text-slate-400"> → {item.opportunityTitle}</span>
                  <span className="text-slate-500 block text-[11px] mt-0.5">Commitment: {item.requestedCommitment}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                    item.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conditional / Rejection Modal */}
      {selectedItem && activeModalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#14171d] border border-[#21242c] rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 text-slate-300">
            <h3 className="text-base font-bold text-white">
              {activeModalAction === 'conditions' ? 'Approve with Conditions' : 'Reject Request'}
            </h3>
            
            <p className="text-xs text-slate-400">
              Provide feedback to {selectedItem.employeeName} regarding this cross-department gig request.
            </p>

            <textarea
              rows={3}
              value={activeModalAction === 'conditions' ? conditionText : rejectReason}
              onChange={(e) => activeModalAction === 'conditions' ? setConditionText(e.target.value) : setRejectReason(e.target.value)}
              placeholder={activeModalAction === 'conditions' ? 'e.g. Ensure primary squad sprint deliverables on MyAthlon are completed first...' : 'e.g. Current release milestone requires full squad focus this sprint...'}
              className="w-full p-3 rounded-xl bg-[#0f1116] border border-[#21242c] text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => { setSelectedItem(null); setActiveModalAction(null); }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (activeModalAction === 'conditions') {
                    onApproveWithConditions(selectedItem.id, conditionText);
                  } else {
                    onReject(selectedItem.id, rejectReason);
                  }
                  setSelectedItem(null);
                  setActiveModalAction(null);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500"
              >
                Confirm Decision
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
