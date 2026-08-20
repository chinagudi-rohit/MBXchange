import React from 'react';
import { 
  Briefcase, 
  Zap, 
  Users, 
  ShoppingBag, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  TrendingUp, 
  Award, 
  ShieldCheck, 
  MessageSquare,
  HelpCircle,
  Car,
  Laptop,
  ChevronRight
} from 'lucide-react';
import { TalentProfile, WorkPost, MarketListing, CommunityGroup, KnowledgeQuestion, MainTab } from '../../types';

interface HomeDashboardProps {
  currentUser: TalentProfile;
  workPosts: WorkPost[];
  listings: MarketListing[];
  communities: CommunityGroup[];
  questions: KnowledgeQuestion[];
  onNavigate: (tab: MainTab) => void;
  onOpenWorkDetail: (id: number) => void;
  onOpenListingDetail: (id: number) => void;
  onOpenCreateWork: () => void;
  onOpenOfferBandwidth: () => void;
  onOpenCreateListing: () => void;
  onOpenAskQuestion: () => void;
  onOpenApplyWork: (post: WorkPost) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  currentUser,
  workPosts = [],
  listings = [],
  communities = [],
  questions = [],
  onNavigate,
  onOpenWorkDetail,
  onOpenListingDetail,
  onOpenCreateWork,
  onOpenOfferBandwidth,
  onOpenCreateListing,
  onOpenAskQuestion,
  onOpenApplyWork
}) => {
  const safeWorkPosts = Array.isArray(workPosts) ? workPosts : [];
  const safeListings = Array.isArray(listings) ? listings : [];
  const safeCommunities = Array.isArray(communities) ? communities : [];
  const safeQuestions = Array.isArray(questions) ? questions : [];

  // Top recommended opportunity for current user based on matchScore
  const topRecommended = safeWorkPosts.find(p => p.matchScore && p.matchScore >= 90) || safeWorkPosts[0] || null;
  const recentGigs = safeWorkPosts.slice(0, 3);
  const featuredListings = safeListings.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-[#14171d] via-[#1a1e28] to-[#14171d] border border-[#21242c] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mercedes-Benz Internal Talent & Capability Marketplace</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Welcome back, {currentUser.name.split(' ')[0]} 👋
          </h1>
          
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Discover ways to contribute, cross-pollinate skills, support peer teams, and participate in trusted campus exchanges across the enterprise.
          </p>

          {/* User Quick Stats Pill */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 bg-[#0f1116] px-3 py-1.5 rounded-xl border border-[#262a33]">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <strong className="text-white">{currentUser.contributionScore}</strong> Contribution Score
            </span>
            <span className="flex items-center gap-1.5 bg-[#0f1116] px-3 py-1.5 rounded-xl border border-[#262a33]">
              <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
              <strong className="text-white">{currentUser.collaborationsCount}</strong> Gigs Completed
            </span>
            <span className="flex items-center gap-1.5 bg-[#0f1116] px-3 py-1.5 rounded-xl border border-[#262a33]">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <strong className="text-white">{currentUser.typicalAvailability}</strong> Declared Bandwidth
            </span>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 4 Action Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Pillar 1: Need Help */}
        <div 
          onClick={onOpenCreateWork}
          className="bg-[#14171d] hover:bg-[#1a1d26] border border-[#21242c] hover:border-indigo-500/50 rounded-2xl p-5 shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">
              I Need Help
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Post a technical requirement, micro-gig, or architecture review request for your squad.
            </p>
          </div>
          <div className="pt-4 mt-2 border-t border-[#21242c] flex items-center justify-between text-xs font-bold text-indigo-400">
            <span>Find Talent</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Pillar 2: Offer Help */}
        <div 
          onClick={onOpenOfferBandwidth}
          className="bg-[#14171d] hover:bg-[#1a1d26] border border-[#21242c] hover:border-emerald-500/50 rounded-2xl p-5 shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1 group-hover:text-emerald-300 transition-colors">
              I Can Help
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Declare your available bandwidth (e.g. 4-8 hrs/mo) and skills to support peer departments.
            </p>
          </div>
          <div className="pt-4 mt-2 border-t border-[#21242c] flex items-center justify-between text-xs font-bold text-emerald-400">
            <span>Share Skills</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Pillar 3: Find Experts */}
        <div 
          onClick={() => onNavigate('people')}
          className="bg-[#14171d] hover:bg-[#1a1d26] border border-[#21242c] hover:border-blue-500/50 rounded-2xl p-5 shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">
              People & Skills
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explore 600+ verified colleagues with skills in AWS, ROS2, AI/ML, Simulink, and React.
            </p>
          </div>
          <div className="pt-4 mt-2 border-t border-[#21242c] flex items-center justify-between text-xs font-bold text-blue-400">
            <span>Browse Experts</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Pillar 4: Employee Marketplace */}
        <div 
          onClick={() => onNavigate('marketplace')}
          className="bg-[#14171d] hover:bg-[#1a1d26] border border-[#21242c] hover:border-amber-500/50 rounded-2xl p-5 shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1 group-hover:text-amber-300 transition-colors">
              Marketplace
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Buy, sell, exchange, or give away items and spare event tickets within the employee community.
            </p>
          </div>
          <div className="pt-4 mt-2 border-t border-[#21242c] flex items-center justify-between text-xs font-bold text-amber-400">
            <span>Explore Listings</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </div>

      {/* Hero AI Recommendation Spotlight (Section 15 of Blueprint) */}
      {topRecommended && (
        <div className="bg-[#14171d] border-2 border-indigo-500/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  🔥 Recommended for you · {topRecommended.matchScore}% Match
                </span>
                <span className="text-xs text-slate-500">
                  {topRecommended.department}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white hover:text-indigo-300 transition-colors cursor-pointer" onClick={() => onOpenWorkDetail(topRecommended.id)}>
                {topRecommended.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-2">
                {topRecommended.description}
              </p>

              {/* Match reasoning badge */}
              {topRecommended.matchReason && (
                <div className="p-2.5 rounded-xl bg-[#0f1116] border border-[#21242c] text-xs text-indigo-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Why you match:</strong> {topRecommended.matchReason}</span>
                </div>
              )}

              {/* Tags & Meta */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
                <span className="flex items-center gap-1 text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  Effort: <strong>{topRecommended.expectedEffortHours}</strong> ({topRecommended.duration})
                </span>
                <span className="flex items-center gap-1 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  {topRecommended.location}
                </span>
                <span className="flex items-center gap-1 text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  Manager Approval: {topRecommended.managerApprovalRequired ? 'Required' : 'Not Required'}
                </span>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => onOpenApplyWork(topRecommended)}
                className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-lg shadow-indigo-500/25 transition-all cursor-pointer text-center"
              >
                I'm Interested (Request Gig)
              </button>
              <button
                onClick={() => onOpenWorkDetail(topRecommended.id)}
                className="px-6 py-3 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-[#1a1d26] hover:bg-[#21242c] border border-[#262a33] transition-colors cursor-pointer text-center"
              >
                View Full Details
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Two Column Layout: Work Exchange Gigs & Marketplace/Community Pulse */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 7 Cols: Open Opportunities (Work Exchange) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-400" />
                Trending Work Exchange Opportunities
              </h3>
              <p className="text-xs text-slate-400">Short-term engineering gigs & architecture pairing requests</p>
            </div>
            <button
              onClick={() => onNavigate('work')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
            >
              View All ({safeWorkPosts.length}) <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentGigs.map((post) => (
              <div
                key={post.id}
                onClick={() => onOpenWorkDetail(post.id)}
                className="bg-[#14171d] hover:bg-[#1a1d26] border border-[#21242c] hover:border-slate-700 rounded-2xl p-5 shadow-xl transition-all cursor-pointer group space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-0.5 rounded bg-[#0f1116] border border-[#21242c]">
                    {post.department}
                  </span>
                  {post.matchScore && (
                    <span className="text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      {post.matchScore}% Match
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-white text-sm group-hover:text-indigo-400 transition-colors leading-snug">
                  {post.title}
                </h4>

                <div className="flex flex-wrap items-center gap-1.5">
                  {post.tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0f1116] text-slate-300 border border-[#21242c]">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#21242c] text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-indigo-500/20 text-indigo-400 font-bold text-[9px] flex items-center justify-center">
                      {post.initials}
                    </div>
                    <span>{post.author}</span>
                  </div>
                  <span className="text-slate-500">{post.duration} · {post.expectedEffortHours}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 5 Cols: Enterprise Pulse & Marketplace Highlights */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Trending Across Mercedes-Benz Enterprise Pulse */}
          <div className="bg-[#14171d] border border-[#21242c] rounded-2xl p-5 shadow-xl space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Trending Across Enterprise
            </h4>
            
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-xl bg-[#0f1116] border border-[#21242c]">
                <div className="text-xl font-extrabold text-white font-mono">1,248</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Cross-Dept Gigs</div>
              </div>
              <div className="p-3 rounded-xl bg-[#0f1116] border border-[#21242c]">
                <div className="text-xl font-extrabold text-white font-mono">7,842</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Contributed Hours</div>
              </div>
              <div className="p-3 rounded-xl bg-[#0f1116] border border-[#21242c]">
                <div className="text-xl font-extrabold text-white font-mono">18</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Active Departments</div>
              </div>
              <div className="p-3 rounded-xl bg-[#0f1116] border border-[#21242c]">
                <div className="text-xl font-extrabold text-white font-mono">⭐ 4.82</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Avg Collab Rating</div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('insights')}
              className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 transition-colors"
            >
              View Enterprise Capability Heatmap →
            </button>
          </div>

          {/* Featured Marketplace Items */}
          <div className="bg-[#14171d] border border-[#21242c] rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                Featured Marketplace
              </h4>
              <button
                onClick={() => onNavigate('marketplace')}
                className="text-xs text-amber-400 hover:underline font-bold"
              >
                Browse ({safeListings.length})
              </button>
            </div>

            <div className="space-y-2.5">
              {featuredListings.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onOpenListingDetail(item.id)}
                  className="p-3 rounded-xl bg-[#0f1116] hover:bg-[#1a1d26] border border-[#21242c] transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                      {item.title}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      {item.seller} · {item.location}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-white">
                      {item.isFree ? 'FREE' : `${item.currency}${item.price}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
