import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  ChevronUp, 
  ChevronDown, 
  MessageSquare, 
  Bookmark, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Filter, 
  Zap,
  Briefcase,
  UserPlus,
  Send,
  Calendar
} from 'lucide-react';
import { WorkPost, WorkStatus, BandwidthOffer, TalentProfile } from '../../types';
import { DEPARTMENTS_LIST, ALL_SKILLS_TAGS } from '../../data/initialData';

interface WorkFeedProps {
  posts: WorkPost[];
  bandwidthOffers: BandwidthOffer[];
  onOpenPost: (id: number) => void;
  onOpenNewPost: () => void;
  onOpenOfferBandwidth: () => void;
  onUpvote: (id: number) => void;
  onDownvote: (id: number) => void;
  onToggleBookmark: (id: number) => void;
  onApplyForGig: (post: WorkPost) => void;
  currentUser: TalentProfile;
}

export const WorkFeed: React.FC<WorkFeedProps> = ({
  posts = [],
  bandwidthOffers = [],
  onOpenPost,
  onOpenNewPost,
  onOpenOfferBandwidth,
  onUpvote,
  onDownvote,
  onToggleBookmark,
  onApplyForGig,
  currentUser
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'requirements' | 'bandwidth'>('requirements');
  const [selectedDept, setSelectedDept] = useState<string>('All Departments');
  const [selectedSkill, setSelectedSkill] = useState<string>('All Skills');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All Status');

  const safePosts = Array.isArray(posts) ? posts : [];
  const safeBandwidthOffers = Array.isArray(bandwidthOffers) ? bandwidthOffers : [];

  const filteredPosts = useMemo(() => {
    return safePosts.filter((post) => {
      if (selectedDept !== 'All Departments' && post.department !== selectedDept) {
        return false;
      }
      if (selectedSkill !== 'All Skills' && !post.tags.includes(selectedSkill)) {
        return false;
      }
      if (selectedStatus !== 'All Status' && post.status !== selectedStatus) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = post.title.toLowerCase().includes(q);
        const matchDesc = post.description.toLowerCase().includes(q);
        const matchTags = post.tags.some(t => t.toLowerCase().includes(q));
        const matchAuthor = post.author.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchTags && !matchAuthor) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      // Prioritize matchScore if available
      const scoreA = a.matchScore || 0;
      const scoreB = b.matchScore || 0;
      return scoreB - scoreA || b.timestamp - a.timestamp;
    });
  }, [safePosts, selectedDept, selectedSkill, selectedStatus, searchQuery]);

  return (
    <div className="w-full space-y-6 animate-in fade-in">
      
      {/* Top Work Exchange Header */}
      <div className="bg-[#14171d] border border-[#21242c] rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold mb-2">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Two-Sided Enterprise Work Exchange</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Work & Micro-Gig Exchange
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
            Publish technical support requirements or discover short-term peer gigs (30 mins to 3 days) with automated manager approval.
          </p>
        </div>

        {/* Action Dual Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={onOpenOfferBandwidth}
            className="flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span>I Can Help (Offer Bandwidth)</span>
          </button>
          
          <button
            onClick={onOpenNewPost}
            className="flex items-center gap-2 py-2.5 px-5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>I Need Help (Post Requirement)</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs: Requirements vs Bandwidth Pool */}
      <div className="flex items-center gap-2 border-b border-[#21242c] pb-3">
        <button
          onClick={() => setActiveSubTab('requirements')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'requirements'
              ? 'bg-[#1a1d26] text-indigo-400 border border-indigo-500/30 shadow-xs'
              : 'text-slate-400 hover:text-white hover:bg-[#14171d]'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Open Requirements ({posts.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('bandwidth')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'bandwidth'
              ? 'bg-[#1a1d26] text-emerald-400 border border-emerald-500/30 shadow-xs'
              : 'text-slate-400 hover:text-white hover:bg-[#14171d]'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Declared Bandwidth Pool ({bandwidthOffers.length})</span>
        </button>
      </div>

      {activeSubTab === 'requirements' ? (
        <>
          {/* Filter Bar */}
          <div className="bg-[#14171d] border border-[#21242c] rounded-2xl p-4 shadow-xl space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              
              <div className="sm:col-span-5 relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search requirements by technology, keyword, or team..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#21242c] bg-[#0f1116] text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-4">
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#21242c] bg-[#0f1116] text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {DEPARTMENTS_LIST.map((dept) => (
                    <option key={dept} value={dept} className="bg-[#14171d] text-white">
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#21242c] bg-[#0f1116] text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {ALL_SKILLS_TAGS.map((skill) => (
                    <option key={skill} value={skill} className="bg-[#14171d] text-white">
                      {skill}
                    </option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* Requirements Feed Cards */}
          <div>
            {filteredPosts.length === 0 ? (
              <div className="bg-[#14171d] border border-[#21242c] rounded-2xl p-12 text-center shadow-xl space-y-3">
                <Briefcase className="w-12 h-12 text-slate-500 mx-auto" />
                <h3 className="text-base font-bold text-white">No Requirements Found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Try adjusting your filters or post a new technical support request.
                </p>
                <button
                  onClick={onOpenNewPost}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500"
                >
                  Post Requirement
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => onOpenPost(post.id)}
                    className="bg-[#14171d] border border-[#21242c] hover:border-slate-700 rounded-2xl p-6 shadow-xl transition-all cursor-pointer group flex flex-col justify-between space-y-4 relative"
                  >
                    {/* Top Bar: Dept + Match Badge + Bookmark */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2.5 py-0.5 rounded bg-[#0f1116] border border-[#21242c]">
                          {post.department}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#0f1116] text-slate-400 border border-[#21242c]">
                          {post.duration} · {post.expectedEffortHours}
                        </span>
                        {post.matchScore && (
                          <span className="text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/30 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            {post.matchScore}% Match
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onToggleBookmark(post.id); }}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          post.bookmarked
                            ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'
                            : 'bg-[#0f1116] border-[#21242c] text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-1.5">
                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">
                        {post.description}
                      </p>
                    </div>

                    {/* Skills Pills */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-mono px-2.5 py-0.5 rounded-md bg-[#0f1116] text-slate-300 border border-[#21242c]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Footer Meta & Actions */}
                    <div className="pt-3 border-t border-[#21242c] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold text-[10px] flex items-center justify-center">
                            {post.initials}
                          </div>
                          <span className="font-semibold text-slate-200">{post.author}</span>
                          <span className="text-slate-600">·</span>
                          <span className="text-slate-400 truncate max-w-[120px]">{post.role}</span>
                        </div>
                        <span className="text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {post.location}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onApplyForGig(post); }}
                          className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Send className="w-3 h-3" />
                          <span>I'm Interested</span>
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Bandwidth Pool ("I Can Help" declarations) */
        <div className="space-y-4">
          <div className="bg-[#14171d] border border-[#21242c] rounded-2xl p-5 shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-emerald-400" />
              Available Talent Capacity Pool
            </h3>
            <p className="text-xs text-slate-400">
              Colleagues who have declared available hours to support other teams with short gigs, code reviews, or architectural mentoring.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {safeBandwidthOffers.map((offer) => (
              <div
                key={offer.id}
                className="bg-[#14171d] border border-[#21242c] hover:border-emerald-500/40 rounded-2xl p-5 shadow-xl space-y-3 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center">
                        {offer.initials}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-xs">{offer.author}</h4>
                        <p className="text-[10px] text-slate-400">{offer.department}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {offer.availableHours}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-[#0f1116] p-2.5 rounded-xl border border-[#21242c]">
                    "{offer.notes}"
                  </p>
                </div>

                <div className="flex flex-wrap gap-1 pt-2 border-t border-[#21242c]">
                  {offer.skillsOffered.map((skill) => (
                    <span key={skill} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0f1116] text-slate-300 border border-[#21242c]">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
