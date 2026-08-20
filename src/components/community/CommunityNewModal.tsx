import React, { useState } from 'react';
import { X, Plus, Sparkles, Users, Calendar, Car, HelpCircle, Bell } from 'lucide-react';
import { CommunityPost, CommunityType, UserProfile } from '../../types';

interface CommunityNewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (post: Partial<CommunityPost>) => void;
  currentUser: UserProfile;
}

export const CommunityNewModal: React.FC<CommunityNewModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentUser
}) => {
  const [type, setType] = useState<CommunityType>('Event');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState(currentUser.campus || 'Sindelfingen campus');
  const [dateInfo, setDateInfo] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const communityTypes: Array<{ type: CommunityType; label: string; desc: string }> = [
    { type: 'Event', label: 'Event / Spare Ticket', desc: 'Concerts, sports, charity runs' },
    { type: 'Carpool & Rides', label: 'Carpool & Rides', desc: 'Daily commute or airport rides' },
    { type: 'Lost & Found', label: 'Lost & Found', desc: 'Keys, badges, earbuds, umbrellas' },
    { type: 'Notice', label: 'Department Notice', desc: 'Clubs, tournaments, general info' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      type,
      title: title.trim(),
      location: location.trim() || undefined,
      dateInfo: dateInfo.trim() || undefined,
      description: description.trim() || 'No additional details provided.'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-[#14171d] border border-[#21242c] rounded-2xl shadow-2xl max-w-xl w-full my-8 p-6 sm:p-8 relative overflow-hidden text-slate-300">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#21242c]">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              New Community Notice
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Share spare tickets, carpools, lost & found, or announcements with colleagues.
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
          
          {/* Post Type Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Notice Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {communityTypes.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setType(item.type)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    type === item.type
                      ? 'bg-[#1a1d26] border-indigo-500 text-white font-semibold ring-1 ring-indigo-500/30'
                      : 'border-[#21242c] bg-[#0f1116] hover:bg-[#1a1d26]/60 text-slate-400'
                  }`}
                >
                  <span className="text-xs font-bold block text-white">{item.label}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Post Title <span className="text-indigo-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Spare VIP ticket to the Stuttgart Jazz Open — this Friday"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#21242c] bg-[#0f1116] text-white placeholder-slate-600 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Timing & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Location / Route
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Schlossplatz / Route Böblingen-Sindelfingen"
                className="w-full px-3.5 py-2 rounded-xl border border-[#21242c] bg-[#0f1116] text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Date / Time (Optional)
              </label>
              <input
                type="text"
                value={dateInfo}
                onChange={(e) => setDateInfo(e.target.value)}
                placeholder="e.g. This Friday 19:30 or Mon-Thu recurring"
                className="w-full px-3.5 py-2 rounded-xl border border-[#21242c] bg-[#0f1116] text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Description & Details
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context, pickup details, timings, or who to reach out to..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#21242c] bg-[#0f1116] text-white placeholder-slate-600 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#21242c]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-[#1a1d26] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
            >
              Post Notice
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
