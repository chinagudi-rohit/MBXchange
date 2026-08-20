import React, { useState } from 'react';
import { 
  Users, 
  HelpCircle, 
  MessageSquare, 
  Plus, 
  CheckCircle2, 
  Sparkles, 
  Star, 
  ChevronUp, 
  Calendar, 
  Car, 
  Search, 
  Send,
  Bell,
  MapPin,
  Clock
} from 'lucide-react';
import { CommunityGroup, KnowledgeQuestion, CommunityPost, TalentProfile } from '../../types';

interface CommunityFeedProps {
  groups: CommunityGroup[];
  questions: KnowledgeQuestion[];
  posts: CommunityPost[];
  onToggleJoinGroup: (groupId: string) => void;
  onUpvoteQuestion: (id: string) => void;
  onAddAnswer: (questionId: string, text: string) => void;
  onOpenAskQuestion: () => void;
  onOpenNewPost: () => void;
  onContactPost: (post: CommunityPost) => void;
  currentUser: TalentProfile;
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({
  groups = [],
  questions = [],
  posts = [],
  onToggleJoinGroup,
  onUpvoteQuestion,
  onAddAnswer,
  onOpenAskQuestion,
  onOpenNewPost,
  onContactPost,
  currentUser
}) => {
  const safeGroups = Array.isArray(groups) ? groups : [];
  const safeQuestions = Array.isArray(questions) ? questions : [];
  const safePosts = Array.isArray(posts) ? posts : [];

  const [activeTab, setActiveTab] = useState<'guilds' | 'questions' | 'notices'>('guilds');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(safeQuestions[0]?.id || null);
  const [answerDraft, setAnswerDraft] = useState('');

  const handleAnswerSubmit = (qId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!answerDraft.trim()) return;
    onAddAnswer(qId, answerDraft.trim());
    setAnswerDraft('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in">
      
      {/* Header Banner */}
      <div className="bg-[#14171d] border border-[#21242c] rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Communities, Guilds & Knowledge Graph</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Communities & Knowledge Exchange
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
            Connect around shared technical disciplines, ask verified enterprise questions, and coordinate campus sports and carpools.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={onOpenAskQuestion}
            className="flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 transition-all cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Ask the Community</span>
          </button>

          <button
            onClick={onOpenNewPost}
            className="flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Post Campus Notice</span>
          </button>
        </div>
      </div>

      {/* Sub-tabs: Guilds vs Questions vs Campus Notices */}
      <div className="flex items-center gap-2 border-b border-[#21242c] pb-3">
        <button
          onClick={() => setActiveTab('guilds')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'guilds'
              ? 'bg-[#1a1d26] text-indigo-400 border border-indigo-500/30 shadow-xs'
              : 'text-slate-400 hover:text-white hover:bg-[#14171d]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Communities & Guilds ({safeGroups.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'questions'
              ? 'bg-[#1a1d26] text-blue-400 border border-blue-500/30 shadow-xs'
              : 'text-slate-400 hover:text-white hover:bg-[#14171d]'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Ask the Community Q&A ({safeQuestions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('notices')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'notices'
              ? 'bg-[#1a1d26] text-emerald-400 border border-emerald-500/30 shadow-xs'
              : 'text-slate-400 hover:text-white hover:bg-[#14171d]'
          }`}
        >
          <Car className="w-3.5 h-3.5" />
          <span>Carpools & Campus Life ({safePosts.length})</span>
        </button>
      </div>

      {/* TAB 1: GUILDS & COMMUNITIES */}
      {activeTab === 'guilds' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeGroups.map((group) => (
            <div
              key={group.id}
              className="bg-[#14171d] border border-[#21242c] hover:border-indigo-500/40 rounded-2xl p-6 shadow-xl space-y-4 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 rounded-2xl bg-[#0f1116] border border-[#21242c]">{group.icon}</span>
                    <div>
                      <h3 className="font-bold text-white text-base leading-snug">{group.name}</h3>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">{group.category}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 mb-3">
                  {group.description}
                </p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {group.tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0f1116] text-slate-400 border border-[#21242c]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#21242c] flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  <strong className="text-white">{group.memberCount}</strong> members · <strong className="text-white">{group.activeDiscussions}</strong> topics
                </span>

                <button
                  onClick={() => onToggleJoinGroup(group.id)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    group.isJoined
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                  }`}
                >
                  {group.isJoined ? 'Joined ✓' : 'Join Guild'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: ASK THE COMMUNITY (Section 13 of Blueprint) */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          <div className="bg-[#14171d] border border-[#21242c] rounded-2xl p-5 shadow-xl flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-400" />
                Technical Questions & Expert Answers
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Builds the company technical knowledge graph. Answers marked as Accepted contribute to your reputation score.
              </p>
            </div>
            <button
              onClick={onOpenAskQuestion}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500"
            >
              + Ask Question
            </button>
          </div>

          <div className="space-y-4">
            {safeQuestions.map((q) => {
              const isExpanded = expandedQuestionId === q.id;
              return (
                <div
                  key={q.id}
                  className="bg-[#14171d] border border-[#21242c] rounded-2xl p-6 shadow-xl space-y-4 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Upvote Button */}
                      <button
                        onClick={() => onUpvoteQuestion(q.id)}
                        className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#0f1116] border border-[#21242c] text-xs font-mono font-bold text-slate-300 hover:text-indigo-400 hover:border-indigo-500/40 shrink-0 min-w-[44px]"
                      >
                        <ChevronUp className="w-4 h-4 text-indigo-400" />
                        <span>{q.votes}</span>
                      </button>

                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {q.hasAcceptedAnswer && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Accepted Answer
                            </span>
                          )}
                          <span className="text-xs text-slate-500">{q.time}</span>
                        </div>

                        <h3 className="text-base font-bold text-white hover:text-blue-300 transition-colors cursor-pointer" onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}>
                          {q.title}
                        </h3>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {q.details}
                        </p>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {q.tags.map((tag) => (
                            <span key={tag} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0f1116] text-slate-400 border border-[#21242c]">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                      className="px-3 py-1.5 rounded-xl text-xs bg-[#1a1d26] text-slate-300 hover:text-white border border-[#262a33] shrink-0"
                    >
                      {q.answers.length} Answers {isExpanded ? '▲' : '▼'}
                    </button>
                  </div>

                  {/* Expanded Answers List */}
                  {isExpanded && (
                    <div className="pt-4 border-t border-[#21242c] space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Answers & Solutions ({q.answers.length})
                      </h4>

                      <div className="space-y-3">
                        {q.answers.map((ans) => (
                          <div
                            key={ans.id}
                            className={`p-4 rounded-2xl border space-y-2 ${
                              ans.isAcceptedAnswer
                                ? 'bg-emerald-500/5 border-emerald-500/30'
                                : 'bg-[#0f1116] border-[#21242c]'
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold text-[10px] flex items-center justify-center">
                                  {ans.initials}
                                </div>
                                <span className="font-bold text-white">{ans.author}</span>
                                <span className="text-slate-500">·</span>
                                <span className="text-indigo-400 font-medium">{ans.role}</span>
                                {ans.isAcceptedAnswer && (
                                  <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                    ⭐ Verified Expert Solution
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-500">{ans.time}</span>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed pl-8">
                              {ans.text}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Post Answer Box */}
                      <form onSubmit={(e) => handleAnswerSubmit(q.id, e)} className="flex gap-2 pt-2">
                        <input
                          type="text"
                          value={answerDraft}
                          onChange={(e) => setAnswerDraft(e.target.value)}
                          placeholder="Share your verified solution or wiki reference..."
                          className="flex-1 px-4 py-2 rounded-xl bg-[#0f1116] border border-[#21242c] text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 cursor-pointer"
                        >
                          Submit Answer
                        </button>
                      </form>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: CARPOOLS & CAMPUS LIFE */}
      {activeTab === 'notices' && (
        <div className="space-y-4">
          {safePosts.map((post) => (
            <div
              key={post.id}
              className="bg-[#14171d] border border-[#21242c] rounded-2xl p-5 shadow-xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {post.type}
                  </span>
                  {post.location && (
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {post.location}
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500">{post.time}</span>
              </div>

              <h3 className="text-base font-bold text-white leading-snug">
                {post.title}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed">
                {post.description}
              </p>

              <div className="pt-3 border-t border-[#21242c] flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-indigo-500/20 text-indigo-400 font-bold text-[10px] flex items-center justify-center">
                    {post.initials}
                  </div>
                  <span className="text-slate-200 font-semibold">{post.author}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-400">{post.authorRole}</span>
                </div>

                <button
                  onClick={() => onContactPost(post)}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-[#1a1d26] hover:bg-indigo-600 border border-[#262a33]"
                >
                  {post.contacted ? 'Inquiry Sent ✓' : 'Reach Out'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
