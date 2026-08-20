import React, { useState } from 'react';
import { X, Zap, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import { BandwidthOffer, TalentProfile } from '../../types';

interface BandwidthOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (offer: Partial<BandwidthOffer>) => void;
  currentUser: TalentProfile;
}

export const BandwidthOfferModal: React.FC<BandwidthOfferModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentUser
}) => {
  const [availableHours, setAvailableHours] = useState('6 hours this month');
  const [skillsOffered, setSkillsOffered] = useState<string[]>(currentUser.primarySkills.slice(0, 4));
  const [notes, setNotes] = useState('Available for short architecture reviews, pair programming, or tooling support across squads.');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      availableHours,
      skillsOffered,
      notes: notes.trim()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-[#14171d] border border-[#21242c] rounded-3xl shadow-2xl max-w-lg w-full my-8 p-6 sm:p-8 relative overflow-hidden text-slate-300">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#21242c]">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-400" />
              Offer Help (Declare Bandwidth)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Let the MBXchange matching engine know your available capacity to help peer teams.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-[#1a1d26] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Available Hours */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Available Bandwidth Capacity
            </label>
            <select
              value={availableHours}
              onChange={(e) => setAvailableHours(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#21242c] bg-[#0f1116] text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="2–4 hours this month" className="bg-[#14171d] text-white">2–4 hours this month (Light Mentoring)</option>
              <option value="6 hours this month" className="bg-[#14171d] text-white">6 hours this month (Standard Review Support)</option>
              <option value="8–12 hours this month" className="bg-[#14171d] text-white">8–12 hours this month (Active Micro-Gigs)</option>
              <option value="16+ hours this month" className="bg-[#14171d] text-white">16+ hours this month (Stretch Projects)</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              How can you support other squads?
            </label>
            <textarea
              rows={3}
              required
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Happy to help teams optimize Terraform configs, review EKS clusters, or mentor junior engineers in CI/CD."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#21242c] bg-[#0f1116] text-white placeholder-slate-600 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Skills Selected */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Skills you wish to offer
            </label>
            <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-[#0f1116] border border-[#21242c]">
              {currentUser.primarySkills.map((skill) => {
                const isSelected = skillsOffered.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSkillsOffered(skillsOffered.filter(s => s !== skill));
                      } else {
                        setSkillsOffered([...skillsOffered, skill]);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                        : 'bg-[#14171d] text-slate-400 border border-[#21242c]'
                    }`}
                  >
                    {skill} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
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
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 shadow-md shadow-emerald-500/20"
            >
              Publish Available Capacity
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
