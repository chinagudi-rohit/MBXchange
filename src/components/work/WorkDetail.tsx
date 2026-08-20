import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Bookmark, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  Users, 
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { WorkPost, WorkStatus, TalentProfile } from '../../types';

interface WorkDetailProps {
  post: WorkPost;
  onBack: () => void;
  onUpvote: (id: number) => void;
  onDownvote: (id: number) => void;
  onToggleBookmark: (id: number) => void;
  onOfferHelp: (post: WorkPost) => void;
  onAddComment: (postId: number, text: string) => void;
  onUpdateStatus: (postId: number, status: WorkStatus) => void;
  currentUser: TalentProfile;
}

export const WorkDetail: React.FC<WorkDetailProps> = ({
  post,
  onBack,
  onUpvote,
  onDownvote,
  onToggleBookmark,
  onOfferHelp,
  onAddComment,
  onUpdateStatus,
  currentUser
}) => {
  const [commentText, setCommentText] = useState('');

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(post.id, commentText.trim());
    setCommentText('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in">
      
      {/* Top back navigation bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-[#14171d] hover:bg-[#1a1d26] border border-[#21242c] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Work Exchange</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleBookmark(post.id)}
            className={`p-2 rounded-xl border transition-colors ${
              post.bookmarked
                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'
                : 'bg-[#14171d] border-[#21242c] text-slate-500 hover:text-white'
            }`}
            title="Save Opportunity"
          >
            <Bookmark className="w-4 h-4" />
          </button>

          <button
            onClick={() => onOfferHelp(post)}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>I'm Interested (Request Gig)</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Details (8 cols) & Request Owner Card (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 8 Cols: Opportunity Content */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-[#14171d] border border-[#21242c] rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden space-y-6">
            
            {/* Department + Status Badges */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3 py-1 rounded-md bg-[#0f1116] border border-[#21242c]">
                  {post.department}
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {post.status}
                </span>
              </div>

              {post.matchScore && (
                <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/30 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {post.matchScore}% Match for you
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              {post.title}
            </h1>

            {/* Micro-Gig Meta Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#0f1116] border border-[#21242c] text-xs">
              <div>
                <span className="text-slate-500 block mb-0.5">Duration:</span>
                <strong className="text-white block font-medium">{post.duration}</strong>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Estimated Effort:</span>
                <strong className="text-amber-400 block font-mono font-bold">{post.expectedEffortHours}</strong>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Location:</span>
                <strong className="text-slate-300 block font-medium">{post.location}</strong>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Detailed Requirement & Context
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {post.description}
              </p>
            </div>

            {/* Why This Opportunity? (Section 18 of Blueprint) */}
            {post.whyOpportunity && (
              <div className="p-4 rounded-2xl bg-[#0f1116] border border-[#21242c] space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Why Join This Opportunity?
                </h3>
                <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                  {post.whyOpportunity}
                </p>
              </div>
            )}

            {/* Required Technologies & Skills */}
            <div className="space-y-2 pt-4 border-t border-[#21242c]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Required Technical Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-lg bg-[#0f1116] text-xs font-mono font-semibold text-indigo-300 border border-indigo-500/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Discussion & Responses Thread */}
          <div className="bg-[#14171d] border border-[#21242c] rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              Technical Discussion & Questions ({post.comments.length})
            </h3>

            {/* Comments List */}
            <div className="space-y-3">
              {post.comments.map((comment) => (
                <div key={comment.id} className="p-4 rounded-2xl bg-[#0f1116] border border-[#21242c] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold text-[10px] flex items-center justify-center">
                        {comment.initials}
                      </div>
                      <span className="font-bold text-white">{comment.author}</span>
                      <span className="text-slate-500">·</span>
                      <span className="text-indigo-400">{comment.role}</span>
                    </div>
                    <span className="text-[11px] text-slate-500">{comment.time}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed pl-8">
                    {comment.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Post Comment Input */}
            <form onSubmit={handleCommentSubmit} className="flex gap-2 pt-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Ask a technical question or suggest an architectural approach..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#21242c] bg-[#0f1116] text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 cursor-pointer shrink-0"
              >
                Reply
              </button>
            </form>
          </div>

        </div>

        {/* Right 4 Cols: Request Owner & Manager Workflow Box */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Owner Profile Card */}
          <div className="bg-[#14171d] border border-[#21242c] rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Request Owner
            </h3>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 font-bold text-base flex items-center justify-center shrink-0">
                {post.initials}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-white text-base truncate">{post.author}</h4>
                <p className="text-xs text-indigo-400 font-medium truncate">{post.role}</p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">{post.department}</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#0f1116] border border-[#21242c] text-xs text-slate-400 space-y-1.5">
              <div className="flex items-center justify-between">
                <span>Manager Approval:</span>
                <span className="font-bold text-emerald-400">Integrated ✓</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Interest Expressed:</span>
                <span className="text-white font-mono font-bold">{post.applicantCount || 3} colleagues</span>
              </div>
            </div>

            <button
              onClick={() => onOfferHelp(post)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>I'm Interested (Request Gig)</span>
            </button>
          </div>

          {/* Governance Notice */}
          <div className="bg-[#14171d] border border-[#21242c] rounded-3xl p-5 shadow-xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>Transparent Governance:</strong> When you express interest, an automated approval notice is routed to your line manager based on your declared availability.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
