import React, { useState } from 'react';
import { X, Send, Sparkles, Clock, ShieldCheck, UserCheck } from 'lucide-react';
import { TalentProfile } from '../../types';

interface RequestCollaborationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetTalent: TalentProfile | null;
  onSubmit: (data: {
    talentId: string;
    taskTitle: string;
    estimatedHours: string;
    dates: string;
    notes: string;
  }) => void;
  currentUser: TalentProfile;
}

export const RequestCollaborationModal: React.FC<RequestCollaborationModalProps> = ({
  isOpen,
  onClose,
  targetTalent,
  onSubmit,
  currentUser
}) => {
  const [taskTitle, setTaskTitle] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('4–6 hours');
  const [dates, setDates] = useState('Next week (Flexible)');
  const [notes, setNotes] = useState('');

  if (!isOpen || !targetTalent) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    onSubmit({
      talentId: targetTalent.id,
      taskTitle: taskTitle.trim(),
      estimatedHours,
      dates,
      notes: notes.trim()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-[#14171d] border border-[#21242c] rounded-3xl shadow-2xl max-w-lg w-full my-8 p-6 sm:p-8 relative overflow-hidden text-slate-300">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#21242c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 font-bold text-base flex items-center justify-center">
              {targetTalent.initials}
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Request Collaboration with {targetTalent.name}
              </h2>
              <p className="text-xs text-indigo-400 font-semibold">{targetTalent.role} · {targetTalent.department}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-[#1a1d26] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Target Talent Bandwidth indicator */}
          <div className="p-3 rounded-2xl bg-[#0f1116] border border-[#21242c] text-xs text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Available Bandwidth:</span>
            </span>
            <strong className="text-white font-mono">{targetTalent.typicalAvailability}</strong>
          </div>

          {/* Task / Project Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Task or Topic Name <span className="text-indigo-400">*</span>
            </label>
            <input
              type="text"
              required
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="e.g. Architecture Review for EKS Multi-Region Ingress"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#21242c] bg-[#0f1116] text-white placeholder-slate-600 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Requested Effort & Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Requested Effort
              </label>
              <select
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#21242c] bg-[#0f1116] text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="1–2 hours" className="bg-[#14171d] text-white">1–2 hours (Quick Pair/Review)</option>
                <option value="4–6 hours" className="bg-[#14171d] text-white">4–6 hours (Micro-Gig)</option>
                <option value="8–12 hours" className="bg-[#14171d] text-white">8–12 hours (Deep Pairing)</option>
                <option value="2–3 days" className="bg-[#14171d] text-white">2–3 days (Assignment)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Preferred Timeline
              </label>
              <input
                type="text"
                value={dates}
                onChange={(e) => setDates(e.target.value)}
                placeholder="e.g. Next sprint / Aug 22–24"
                className="w-full px-3 py-2 rounded-xl border border-[#21242c] bg-[#0f1116] text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Context & Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Collaboration Details
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Explain how their expertise will help unblock your squad..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#21242c] bg-[#0f1116] text-white placeholder-slate-600 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Governance note */}
          <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-xs text-slate-300 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Upon submitting, an automated collaboration ticket is created in MBXchange, and line managers will receive a standard notification.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#21242c]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-md shadow-indigo-500/25 flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Collaboration Request</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
