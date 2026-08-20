import React, { useState, useMemo } from 'react';
import { 
  User, 
  X, 
  Sparkles, 
  Award, 
  Briefcase, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  ShoppingBag, 
  Bookmark, 
  Send, 
  TrendingUp, 
  ChevronRight, 
  Star, 
  Edit3,
  Calendar,
  Layers,
  Zap,
  Check
} from 'lucide-react';
import { 
  UserAccount, 
  CollaborationRequest, 
  WorkPost, 
  MarketListing, 
  BandwidthOffer, 
  DirectMessage,
  NotificationItem,
  SystemRole
} from '../types';

interface UserProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onUpdateCurrentUser: (updated: Partial<UserAccount>) => void;
  collabRequests: CollaborationRequest[];
  onUpdateCollabStatus: (requestId: string, status: 'accepted' | 'declined' | 'completed') => void;
  workPosts: WorkPost[];
  marketListings: MarketListing[];
  bandwidthOffers: BandwidthOffer[];
  directMessages: DirectMessage[];
  onOpenMessageWith: (userId: string) => void;
  onOpenWorkPost?: (post: WorkPost) => void;
  onOpenListing?: (listing: MarketListing) => void;
}

export const UserProfileDrawer: React.FC<UserProfileDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateCurrentUser,
  collabRequests,
  onUpdateCollabStatus,
  workPosts,
  marketListings,
  bandwidthOffers,
  directMessages,
  onOpenMessageWith,
  onOpenWorkPost,
  onOpenListing
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'collabs' | 'posts' | 'settings'>('overview');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState(currentUser.bio || '');
  const [availHoursInput, setAvailHoursInput] = useState(currentUser.currentAvailabilityHoursThisWeek);

  if (!isOpen) return null;

  // Filter requests involving current user
  const incomingRequests = collabRequests.filter(r => r.targetTalentId === currentUser.id);
  const outgoingRequests = collabRequests.filter(r => r.requesterId === currentUser.id);

  // Filter items created by current user
  const myWorkPosts = workPosts.filter(w => w.author === currentUser.name || w.authorId === currentUser.id);
  const myListings = marketListings.filter(l => l.seller === currentUser.name || l.sellerId === currentUser.id);
  const myBandwidth = bandwidthOffers.filter(b => b.author === currentUser.name || b.authorId === currentUser.id);

  const handleSaveBio = () => {
    onUpdateCurrentUser({
      bio: bioInput,
      currentAvailabilityHoursThisWeek: availHoursInput
    });
    setIsEditingBio(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-sm animate-in fade-in flex justify-end">
      <div 
        className="w-full max-w-2xl bg-[#0c0d10] border-l border-[#21242c] h-full overflow-y-auto flex flex-col shadow-2xl animate-in slide-in-from-right duration-200 text-slate-300"
      >
        
        {/* Top Header */}
        <div className="p-6 bg-gradient-to-b from-[#14171d] to-[#0c0d10] border-b border-[#21242c] relative">
          <div className="flex items-center justify-between mb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mercedes-Benz Talent Profile</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#1a1d26] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Hero Banner */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xl font-black flex items-center justify-center shrink-0 shadow-lg">
              {currentUser.initials}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-extrabold text-white tracking-tight truncate">
                  {currentUser.name}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                  {currentUser.systemRole || 'Employee'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ● Active
                </span>
              </div>

              <p className="text-xs text-indigo-400 font-semibold mt-0.5">
                {currentUser.role} · <span className="text-slate-300">{currentUser.department}</span>
              </p>

              <div className="flex items-center gap-4 text-xs text-slate-400 mt-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" /> {currentUser.campus}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" /> {currentUser.experienceYears}y exp
                </span>
                {currentUser.managerName && (
                  <span className="flex items-center gap-1 text-slate-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Reports to: {currentUser.managerName}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-4 gap-2 mt-6">
            <div className="p-2.5 rounded-xl bg-[#14171d] border border-[#21242c] text-center">
              <span className="text-[10px] text-slate-400 block">Rating</span>
              <span className="text-sm font-bold text-amber-400 font-mono">⭐ {currentUser.contributionScore}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#14171d] border border-[#21242c] text-center">
              <span className="text-[10px] text-slate-400 block">Hours Shared</span>
              <span className="text-sm font-bold text-indigo-400 font-mono">{currentUser.hoursContributed}h</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#14171d] border border-[#21242c] text-center">
              <span className="text-[10px] text-slate-400 block">Gigs Done</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">{currentUser.collaborationsCount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#14171d] border border-[#21242c] text-center">
              <span className="text-[10px] text-slate-400 block">Depts Helped</span>
              <span className="text-sm font-bold text-purple-400 font-mono">{currentUser.departmentsSupportedCount}</span>
            </div>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="flex items-center gap-1 px-6 border-b border-[#21242c] bg-[#14171d] shrink-0 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Overview & Skills
          </button>
          
          <button
            onClick={() => setActiveTab('collabs')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'collabs'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <span>My Collaborations</span>
            {(incomingRequests.length > 0 || outgoingRequests.length > 0) && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-indigo-500/20 text-indigo-300">
                {incomingRequests.length + outgoingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('posts')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'posts'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <span>My Posts & Listings</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-slate-800 text-slate-400">
              {myWorkPosts.length + myListings.length + myBandwidth.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Edit Profile
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 flex-1 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Bio & Availability */}
              <div className="p-4 rounded-2xl bg-[#14171d] border border-[#21242c] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">About Me</span>
                  <span className="text-xs font-bold text-emerald-400">
                    {currentUser.currentAvailabilityHoursThisWeek} hours available this week
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentUser.bio || 'Automotive engineering professional collaborating across cross-functional powertrain squads to deliver innovative digital and software solutions.'}
                </p>
              </div>

              {/* Skills & Badges */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Primary Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {currentUser.primarySkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-[#14171d] border border-indigo-500/30 text-indigo-300 text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Badges */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Earned Recognition & Badges</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentUser.badges.map((badge) => (
                    <div
                      key={badge.id}
                      className="p-3 rounded-2xl bg-[#14171d] border border-[#21242c] flex items-center gap-3"
                    >
                      <div className="text-2xl">{badge.icon}</div>
                      <div>
                        <div className="text-xs font-bold text-white">{badge.name}</div>
                        <div className="text-[10px] text-slate-400">{badge.description}</div>
                        <div className="text-[9px] text-slate-500 mt-0.5">Awarded {badge.dateEarned}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Available For */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Open For Collaboration In</h4>
                <div className="flex flex-wrap gap-2">
                  {currentUser.availableFor.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium"
                    >
                      ✓ {item}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: MY COLLABORATIONS */}
          {activeTab === 'collabs' && (
            <div className="space-y-6">
              
              {/* Incoming Requests */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                    Incoming Collaboration Requests ({incomingRequests.length})
                  </h4>
                </div>

                {incomingRequests.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-[#14171d] border border-[#21242c] text-center text-xs text-slate-500">
                    No incoming collaboration requests right now.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {incomingRequests.map((req) => (
                      <div key={req.id} className="p-4 rounded-2xl bg-[#14171d] border border-[#21242c] space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{req.taskTitle}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            req.status === 'accepted'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : req.status === 'pending'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {(req.status || 'pending').toUpperCase()}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400">{req.notes}</p>
                        
                        <div className="text-[11px] text-slate-500">
                          Requested by <strong className="text-slate-300">{req.requesterName}</strong> ({req.requesterDepartment}) · Commitment: <strong className="text-indigo-400">{req.estimatedHours}</strong>
                        </div>

                        {req.status === 'pending' && (
                          <div className="flex items-center gap-2 pt-2 border-t border-[#21242c]">
                            <button
                              onClick={() => onUpdateCollabStatus(req.id, 'accepted')}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer"
                            >
                              Accept Request
                            </button>
                            <button
                              onClick={() => onUpdateCollabStatus(req.id, 'declined')}
                              className="px-3 py-1.5 rounded-xl bg-[#21242c] hover:bg-rose-900/40 text-slate-300 hover:text-rose-400 text-xs font-bold transition-all cursor-pointer"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Outgoing Requests */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">
                  Outgoing Requests Sent by Me ({outgoingRequests.length})
                </h4>

                {outgoingRequests.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-[#14171d] border border-[#21242c] text-center text-xs text-slate-500">
                    You haven't requested any peer help yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {outgoingRequests.map((req) => (
                      <div key={req.id} className="p-4 rounded-2xl bg-[#14171d] border border-[#21242c] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{req.taskTitle}</span>
                          <span className="text-[10px] font-bold text-indigo-400 font-mono">{req.status}</span>
                        </div>
                        <p className="text-xs text-slate-400">Target colleague: {req.targetTalentName} ({req.targetDepartment})</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: MY POSTS & LISTINGS */}
          {activeTab === 'posts' && (
            <div className="space-y-6">
              
              {/* Work Posts */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Work Requirements Authored ({myWorkPosts.length})
                </h4>
                {myWorkPosts.length === 0 ? (
                  <p className="text-xs text-slate-500">No active work posts created.</p>
                ) : (
                  myWorkPosts.map(p => (
                    <div key={p.id} className="p-3.5 rounded-2xl bg-[#14171d] border border-[#21242c] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{p.title}</span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/20 text-indigo-400">
                          {p.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{p.description}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Marketplace Listings */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Marketplace Listings ({myListings.length})
                </h4>
                {myListings.length === 0 ? (
                  <p className="text-xs text-slate-500">No marketplace listings posted.</p>
                ) : (
                  myListings.map(l => (
                    <div key={l.id} className="p-3.5 rounded-2xl bg-[#14171d] border border-[#21242c] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{l.title}</span>
                        <span className="text-xs font-bold font-mono text-emerald-400">
                          {l.isFree ? 'Free' : `₹${l.price}`}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{l.condition} · {l.category}</p>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {/* TAB 4: EDIT PROFILE SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#14171d] border border-[#21242c] space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">Update Profile Details</h4>
                
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Weekly Availability (Hours)</label>
                  <input
                    type="number"
                    min="0"
                    max="40"
                    value={availHoursInput}
                    onChange={(e) => setAvailHoursInput(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0c0d10] border border-[#262a33] text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Personal Bio</label>
                  <textarea
                    rows={4}
                    value={bioInput}
                    onChange={(e) => setBioInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0c0d10] border border-[#262a33] text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  onClick={handleSaveBio}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
