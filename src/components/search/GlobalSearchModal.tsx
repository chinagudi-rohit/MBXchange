import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  X, 
  Users, 
  Briefcase, 
  ShoppingBag, 
  HelpCircle, 
  ArrowRight, 
  Sparkles,
  Command
} from 'lucide-react';
import { TalentProfile, WorkPost, MarketListing, CommunityGroup, KnowledgeQuestion, MainTab } from '../../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  experts: TalentProfile[];
  workPosts: WorkPost[];
  listings: MarketListing[];
  communities: CommunityGroup[];
  questions: KnowledgeQuestion[];
  onSelectPerson: (person: TalentProfile) => void;
  onSelectWork: (id: number) => void;
  onSelectListing: (id: number) => void;
  onSelectCommunity: (groupId: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  experts = [],
  workPosts = [],
  listings = [],
  communities = [],
  questions = [],
  onSelectPerson,
  onSelectWork,
  onSelectListing,
  onSelectCommunity
}) => {
  const [query, setQuery] = useState('');

  const safeExperts = Array.isArray(experts) ? experts : [];
  const safeWorkPosts = Array.isArray(workPosts) ? workPosts : [];
  const safeListings = Array.isArray(listings) ? listings : [];
  const safeCommunities = Array.isArray(communities) ? communities : [];
  const safeQuestions = Array.isArray(questions) ? questions : [];

  // Handle Cmd+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle search modal if triggered
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const searchResults = useMemo(() => {
    if (!query.trim()) {
      return {
        people: safeExperts.slice(0, 3),
        work: safeWorkPosts.slice(0, 3),
        listings: safeListings.slice(0, 2),
        communities: safeCommunities.slice(0, 2),
        questions: safeQuestions.slice(0, 2)
      };
    }

    const q = query.toLowerCase();

    const matchedPeople = safeExperts.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.role.toLowerCase().includes(q) ||
      p.department.toLowerCase().includes(q) ||
      p.primarySkills.some(s => s.toLowerCase().includes(q))
    );

    const matchedWork = safeWorkPosts.filter((w) =>
      w.title.toLowerCase().includes(q) ||
      w.department.toLowerCase().includes(q) ||
      w.tags.some(t => t.toLowerCase().includes(q)) ||
      w.description.toLowerCase().includes(q)
    );

    const matchedListings = safeListings.filter((l) =>
      l.title.toLowerCase().includes(q) ||
      l.category.toLowerCase().includes(q) ||
      l.description.toLowerCase().includes(q)
    );

    const matchedCommunities = safeCommunities.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.tags.some(t => t.toLowerCase().includes(q)) ||
      c.description.toLowerCase().includes(q)
    );

    const matchedQuestions = safeQuestions.filter((k) =>
      k.title.toLowerCase().includes(q) ||
      k.tags.some(t => t.toLowerCase().includes(q))
    );

    return {
      people: matchedPeople,
      work: matchedWork,
      listings: matchedListings,
      communities: matchedCommunities,
      questions: matchedQuestions
    };
  }, [query, safeExperts, safeWorkPosts, safeListings, safeCommunities, safeQuestions]);

  if (!isOpen) return null;

  const totalResults =
    searchResults.people.length +
    searchResults.work.length +
    searchResults.listings.length +
    searchResults.communities.length +
    searchResults.questions.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:p-20 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#14171d] border border-[#21242c] rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden text-slate-300 flex flex-col max-h-[85vh]">
        
        {/* Search Header Input */}
        <div className="p-4 sm:p-5 border-b border-[#21242c] flex items-center gap-3 bg-[#0f1116]">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people (e.g. 'AWS architect'), micro-gigs, tickets, communities, or Q&A..."
            className="w-full bg-transparent text-white placeholder-slate-500 text-sm sm:text-base font-medium focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 rounded-xl text-xs bg-[#1a1d26] border border-[#262a33] text-slate-400 hover:text-white"
          >
            ESC
          </button>
        </div>

        {/* Results Container */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {totalResults === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <p className="text-sm font-bold text-white">No results found for "{query}"</p>
              <p className="text-xs text-slate-500">Try searching for a skill like "AWS", "React", "Simulink", or a person's name.</p>
            </div>
          ) : (
            <>
              {/* 1. PEOPLE & SKILLS */}
              {searchResults.people.length > 0 && (
                <div className="space-y-2.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    <span>People & Verified Experts ({searchResults.people.length})</span>
                  </div>
                  <div className="space-y-2">
                    {searchResults.people.map((person) => (
                      <div
                        key={person.id}
                        onClick={() => { onSelectPerson(person); onClose(); }}
                        className="p-3 rounded-2xl bg-[#0f1116] hover:bg-[#1a1d26] border border-[#21242c] hover:border-indigo-500/40 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0">
                            {person.initials}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                              {person.name}
                            </div>
                            <div className="text-[11px] text-indigo-400">
                              {person.role} · <span className="text-slate-400">{person.department}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#14171d] text-amber-400 border border-[#21242c]">
                            ⭐ {person.contributionScore}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. WORK & MICRO-GIGS */}
              {searchResults.work.length > 0 && (
                <div className="space-y-2.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Work Exchange & Opportunities ({searchResults.work.length})</span>
                  </div>
                  <div className="space-y-2">
                    {searchResults.work.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => { onSelectWork(post.id); onClose(); }}
                        className="p-3 rounded-2xl bg-[#0f1116] hover:bg-[#1a1d26] border border-[#21242c] hover:border-indigo-500/40 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                      >
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                            {post.title}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {post.department} · {post.duration} · {post.expectedEffortHours}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {post.matchScore && (
                            <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                              {post.matchScore}% Match
                            </span>
                          )}
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. COMMUNITIES & GUILDS */}
              {searchResults.communities.length > 0 && (
                <div className="space-y-2.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                    <span>Communities & Guilds ({searchResults.communities.length})</span>
                  </div>
                  <div className="space-y-2">
                    {searchResults.communities.map((comm) => (
                      <div
                        key={comm.id}
                        onClick={() => { onSelectCommunity(comm.id); onClose(); }}
                        className="p-3 rounded-2xl bg-[#0f1116] hover:bg-[#1a1d26] border border-[#21242c] transition-all cursor-pointer flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{comm.icon}</span>
                          <div>
                            <div className="text-xs font-bold text-white group-hover:text-blue-300">
                              {comm.name}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {comm.memberCount} members · {comm.activeDiscussions} active discussions
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. MARKETPLACE */}
              {searchResults.listings.length > 0 && (
                <div className="space-y-2.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                    <span>Marketplace & Tickets ({searchResults.listings.length})</span>
                  </div>
                  <div className="space-y-2">
                    {searchResults.listings.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => { onSelectListing(item.id); onClose(); }}
                        className="p-3 rounded-2xl bg-[#0f1116] hover:bg-[#1a1d26] border border-[#21242c] transition-all cursor-pointer flex items-center justify-between gap-3 group"
                      >
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-amber-300">
                            {item.title}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {item.seller} · {item.location}
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-white">
                          {item.isFree ? 'FREE' : `${item.currency}${item.price}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </>
          )}

        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#0f1116] border-t border-[#21242c] flex items-center justify-between text-[11px] text-slate-500 px-6">
          <span>Search index covers People, Micro-Gigs, Marketplace, Communities & Knowledge</span>
          <span className="font-mono">MBXchange Unified Search</span>
        </div>

      </div>
    </div>
  );
};
