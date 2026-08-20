import React, { useState } from 'react';
import { X, Plus, Sparkles, Briefcase, Trash2, Clock, ShieldCheck } from 'lucide-react';
import { WorkPost, TalentProfile, UrgencyLevel, GigDuration } from '../../types';
import { DEPARTMENTS_LIST, ALL_SKILLS_TAGS } from '../../data/initialData';

interface WorkNewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (post: Partial<WorkPost>) => void;
  currentUser: TalentProfile;
}

export const WorkNewModal: React.FC<WorkNewModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentUser
}) => {
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState(currentUser.department);
  const [duration, setDuration] = useState<GigDuration>('2–3 days (Short Gig)');
  const [expectedEffort, setExpectedEffort] = useState('8–12 hours');
  const [urgency, setUrgency] = useState<UrgencyLevel>('Medium');
  const [location, setLocation] = useState('Remote / Sindelfingen');
  const [description, setDescription] = useState('');
  const [whyOpportunity, setWhyOpportunity] = useState('');
  const [managerApproval, setManagerApproval] = useState(true);

  const [tags, setTags] = useState<string[]>(['AWS', 'Terraform']);
  const [customTag, setCustomTag] = useState('');

  if (!isOpen) return null;

  const handleAddTag = (tagToAdd: string) => {
    const clean = tagToAdd.trim();
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // AI Skill extraction suggestion simulator
  const handleExtractSkillsFromDescription = () => {
    const text = (title + ' ' + description).toLowerCase();
    const suggestions: string[] = [];
    ALL_SKILLS_TAGS.forEach((skill) => {
      if (skill !== 'All Skills' && text.includes(skill.toLowerCase()) && !tags.includes(skill)) {
        suggestions.push(skill);
      }
    });
    if (suggestions.length > 0) {
      setTags([...tags, ...suggestions]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    onSubmit({
      title: title.trim(),
      department,
      status: 'Open',
      urgency,
      duration,
      expectedEffortHours: expectedEffort,
      location,
      managerApprovalRequired: managerApproval,
      tags: tags.length > 0 ? tags : ['Engineering'],
      description: description.trim(),
      whyOpportunity: whyOpportunity.trim() || undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-[#14171d] border border-[#21242c] rounded-3xl shadow-2xl max-w-2xl w-full my-8 p-6 sm:p-8 relative overflow-hidden text-slate-300">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#21242c]">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-400" />
              Post a Requirement (Work Exchange)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Find colleagues across Mercedes-Benz squads for short-term assistance, pairing, or architecture reviews.
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
          
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Requirement Title <span className="text-indigo-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Need DevOps support for deployment automation on AWS EKS"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#21242c] bg-[#0f1116] text-white placeholder-slate-600 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Department & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#21242c] bg-[#0f1116] text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {DEPARTMENTS_LIST.filter(d => d !== 'All Departments').map((d) => (
                  <option key={d} value={d} className="bg-[#14171d] text-white">
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Location & Mode
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Remote or Sindelfingen Bldg 30"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#21242c] bg-[#0f1116] text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Duration & Effort */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Micro-Gig Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value as GigDuration)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#21242c] bg-[#0f1116] text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="30 mins (Knowledge Session)" className="bg-[#14171d] text-white">30 mins (Knowledge Session)</option>
                <option value="2 hours (Arch Review)" className="bg-[#14171d] text-white">2 hours (Architecture Review)</option>
                <option value="1 day (Support)" className="bg-[#14171d] text-white">1 day (Technical Support)</option>
                <option value="2–3 days (Short Gig)" className="bg-[#14171d] text-white">2–3 days (Short Gig)</option>
                <option value="1–2 weeks (Project)" className="bg-[#14171d] text-white">1–2 weeks (Project Assignment)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Estimated Total Effort
              </label>
              <input
                type="text"
                value={expectedEffort}
                onChange={(e) => setExpectedEffort(e.target.value)}
                placeholder="e.g. 8–12 hours"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#21242c] bg-[#0f1116] text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              What help do you need? <span className="text-indigo-400">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleExtractSkillsFromDescription}
              placeholder="Describe the task, technical blockers, and desired outcome..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#21242c] bg-[#0f1116] text-white placeholder-slate-600 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Why This Opportunity? */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Why Join This Opportunity? (Optional)
            </label>
            <textarea
              rows={2}
              value={whyOpportunity}
              onChange={(e) => setWhyOpportunity(e.target.value)}
              placeholder="• Automate deployment pipeline&#10;• Improve release reliability for critical vehicle telemetry"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#21242c] bg-[#0f1116] text-white placeholder-slate-600 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Required Skills Picker */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <span>Required Skills & Tech</span>
                <span className="text-[10px] text-indigo-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Auto-matched with employees
                </span>
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-xl bg-[#0f1116] border border-[#21242c] mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-lg bg-[#1a1d26] text-indigo-300 text-xs font-mono font-semibold border border-indigo-500/30 flex items-center gap-1.5"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-400"
                  >
                    ×
                  </button>
                </span>
              ))}

              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag(customTag);
                      setCustomTag('');
                    }
                  }}
                  placeholder="+ Add skill (Press Enter)"
                  className="px-2 py-1 bg-transparent text-white text-xs placeholder-slate-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Quick Skill Chips */}
            <div className="flex flex-wrap gap-1">
              {['AWS', 'Kubernetes', 'Terraform', 'React', 'Python', 'Simulink', 'C++', 'Security', 'Kafka'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleAddTag(s)}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#14171d] hover:bg-[#1a1d26] text-slate-400 border border-[#21242c]"
                >
                  +{s}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#21242c]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-lg shadow-indigo-500/25 cursor-pointer"
            >
              Publish Requirement to MBXchange
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
