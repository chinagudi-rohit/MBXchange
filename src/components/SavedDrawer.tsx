import React from 'react';
import { Bookmark, X, Briefcase, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { WorkPost, MarketListing, CommunityPost } from '../types';

interface SavedDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedWorkPosts: WorkPost[];
  savedListings: MarketListing[];
  savedCommunityPosts: CommunityPost[];
  onOpenWork: (id: number) => void;
  onOpenListing: (id: number) => void;
  onOpenCommunity: (id: number) => void;
  onToggleWorkBookmark: (id: number) => void;
  onToggleListingBookmark: (id: number) => void;
}

export const SavedDrawer: React.FC<SavedDrawerProps> = ({
  isOpen,
  onClose,
  savedWorkPosts = [],
  savedListings = [],
  savedCommunityPosts = [],
  onOpenWork,
  onOpenListing,
  onOpenCommunity,
  onToggleWorkBookmark,
  onToggleListingBookmark
}) => {
  if (!isOpen) return null;

  const safeWork = Array.isArray(savedWorkPosts) ? savedWorkPosts : [];
  const safeListings = Array.isArray(savedListings) ? savedListings : [];
  const safeCommunity = Array.isArray(savedCommunityPosts) ? savedCommunityPosts : [];

  const totalSaved = safeWork.length + safeListings.length + safeCommunity.length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in" onClick={onClose}>
      <div 
        className="w-full max-w-md bg-[#14171d] h-full border-l border-[#21242c] shadow-2xl flex flex-col animate-in slide-in-from-right text-slate-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#21242c] bg-[#0f1116]">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-indigo-400 fill-indigo-500/20" />
            <h3 className="font-bold text-white text-base">Saved Items</h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              {totalSaved}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-[#1a1d26] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {totalSaved === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-[#1a1d26] border border-[#21242c] flex items-center justify-center mx-auto mb-3 text-slate-500">
                <Bookmark className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-slate-300">No saved items yet</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Bookmark important Work requests, marketplace bargains, and community events to review later.
              </p>
            </div>
          ) : (
            <>
              {/* Work Posts Section */}
              {savedWorkPosts.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Work Requests ({savedWorkPosts.length})</span>
                  </div>
                  <div className="space-y-2.5">
                    {savedWorkPosts.map((post) => (
                      <div
                        key={post.id}
                        className="p-3.5 rounded-xl border border-[#21242c] hover:border-indigo-500/50 bg-[#0f1116] transition-all flex flex-col gap-2 group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#1a1d26] text-slate-300 border border-[#262a33]">
                            {post.department}
                          </span>
                          <button
                            onClick={() => onToggleWorkBookmark(post.id)}
                            className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                            title="Remove bookmark"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <h5
                          onClick={() => { onOpenWork(post.id); onClose(); }}
                          className="text-xs font-semibold text-white group-hover:text-indigo-400 cursor-pointer line-clamp-2"
                        >
                          {post.title}
                        </h5>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-[#21242c]">
                          <span>{post.author} · {post.role}</span>
                          <button
                            onClick={() => { onOpenWork(post.id); onClose(); }}
                            className="text-indigo-400 font-semibold flex items-center gap-1 hover:underline"
                          >
                            View <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Market Listings Section */}
              {savedListings.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    <ShoppingBag className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Marketplace Listings ({savedListings.length})</span>
                  </div>
                  <div className="space-y-2.5">
                    {savedListings.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl border border-[#21242c] hover:border-indigo-500/50 bg-[#0f1116] transition-all flex flex-col gap-2 group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-indigo-400 font-mono">
                            €{item.price.toLocaleString()}
                          </span>
                          <button
                            onClick={() => onToggleListingBookmark(item.id)}
                            className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                            title="Remove bookmark"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <h5
                          onClick={() => { onOpenListing(item.id); onClose(); }}
                          className="text-xs font-semibold text-white group-hover:text-indigo-400 cursor-pointer line-clamp-2"
                        >
                          {item.title}
                        </h5>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-[#21242c]">
                          <span>{item.location}</span>
                          <button
                            onClick={() => { onOpenListing(item.id); onClose(); }}
                            className="text-indigo-400 font-semibold flex items-center gap-1 hover:underline"
                          >
                            View <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
