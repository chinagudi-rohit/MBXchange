import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Bell, 
  Bookmark, 
  ChevronDown, 
  Briefcase, 
  ShoppingBag, 
  HelpCircle, 
  MessageSquare,
  Sparkles,
  Zap,
  Menu,
  Car,
  Layers,
  Users
} from 'lucide-react';
import { MainTab, UserAccount, NotificationItem } from '../types';

interface NavbarProps {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  currentUser: UserAccount;
  onOpenRoleModal: () => void;
  onOpenProfile: () => void;
  onOpenMessages: () => void;
  unreadMessagesCount: number;
  onOpenNotifications: () => void;
  onOpenSaved: () => void;
  notifications: NotificationItem[];
  savedCount: number;
  onOpenGlobalSearch: () => void;
  onOpenCreateWork: () => void;
  onOpenOfferBandwidth: () => void;
  onOpenCreateListing: () => void;
  onOpenAskQuestion: () => void;
  onOpenOfferRide?: () => void;
  pendingApprovalsCount: number;
  onToggleMobileSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  currentUser,
  onOpenRoleModal,
  onOpenProfile,
  onOpenMessages,
  unreadMessagesCount,
  onOpenNotifications,
  onOpenSaved,
  notifications,
  savedCount,
  onOpenGlobalSearch,
  onOpenCreateWork,
  onOpenOfferBandwidth,
  onOpenCreateListing,
  onOpenAskQuestion,
  onOpenOfferRide,
  pendingApprovalsCount,
  onToggleMobileSidebar
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-[#0c0d10]/95 backdrop-blur-md border-b border-[#21242c] transition-all">
      <div className="w-full max-w-[1720px] 2xl:max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-10">
        
        {/* Top Header Row */}
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
          
          {/* Left: Brand Identity & Mobile Menu Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Mobile-Only Sidebar Toggle (Hidden on Desktop) */}
            {onToggleMobileSidebar && (
              <button
                onClick={onToggleMobileSidebar}
                className="p-2 rounded-xl bg-[#14171d] hover:bg-[#1f232e] border border-[#21242c] text-slate-300 hover:text-white transition-all cursor-pointer md:hidden shadow-xs"
                title="Toggle Navigation Menu"
                aria-label="Toggle Navigation Menu"
              >
                <Menu className="w-5 h-5 text-indigo-400" />
              </button>
            )}

            {/* Mercedes-Benz Brand Identity */}
            <button
              onClick={() => onTabChange('home')}
              className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
            >
              {/* Mercedes-Benz Emblem */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-black text-base shadow-lg shadow-indigo-500/25 border border-indigo-400/30 group-hover:scale-105 transition-transform">
                <span className="tracking-tighter">MB</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-white text-base tracking-tight leading-none group-hover:text-indigo-300 transition-colors">
                    MB<span className="text-indigo-400">Xchange</span>
                  </span>
                  <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
                    Internal
                  </span>
                </div>
                <span className="hidden sm:inline text-[10px] text-slate-400 font-medium tracking-wide">
                  Connect · Collaborate · Contribute
                </span>
              </div>
            </button>
          </div>

          {/* Center: Global Unified Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-2 lg:mx-6">
            <button
              onClick={onOpenGlobalSearch}
              className="w-full flex items-center justify-between px-4 py-2 rounded-xl bg-[#14171d] hover:bg-[#1a1d26] border border-[#21242c] hover:border-indigo-500/40 text-xs text-slate-400 shadow-inner transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                <span className="truncate">Search skills, people, micro-gigs, items, communities...</span>
              </div>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#0f1116] border border-[#262a33] text-[10px] font-mono text-slate-400">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Mobile Quick Search Button */}
            <button
              onClick={onOpenGlobalSearch}
              className="p-2 rounded-xl bg-[#14171d] hover:bg-[#1a1d26] border border-[#21242c] text-slate-400 hover:text-indigo-400 transition-colors md:hidden cursor-pointer"
              title="Search"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Quick + Create Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsCreateOpen(!isCreateOpen)}
                className="flex items-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Create</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </button>

              {isCreateOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsCreateOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#14171d] border border-[#21242c] shadow-2xl p-2 z-50 text-xs animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-[#21242c] mb-1">
                      Start Collaboration
                    </div>
                    
                    <button
                      onClick={() => { setIsCreateOpen(false); onOpenCreateWork(); }}
                      className="w-full flex items-start gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-[#1a1d26] text-slate-200 transition-colors cursor-pointer"
                    >
                      <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 mt-0.5">
                        <Briefcase className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold text-white block">Request Help (Post Requirement)</span>
                        <span className="text-[10px] text-slate-400">Find colleagues for short gigs or reviews</span>
                      </div>
                    </button>

                    <button
                      onClick={() => { setIsCreateOpen(false); onOpenOfferBandwidth(); }}
                      className="w-full flex items-start gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-[#1a1d26] text-slate-200 transition-colors cursor-pointer"
                    >
                      <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5">
                        <Zap className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold text-white block">Offer Help (Share Bandwidth)</span>
                        <span className="text-[10px] text-slate-400">Declare available hours for peer support</span>
                      </div>
                    </button>

                    <button
                      onClick={() => { setIsCreateOpen(false); if (onOpenOfferRide) onOpenOfferRide(); }}
                      className="w-full flex items-start gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-[#1a1d26] text-slate-200 transition-colors cursor-pointer"
                    >
                      <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5">
                        <Car className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold text-white block">Offer Carpool Ride</span>
                        <span className="text-[10px] text-slate-400">Share your daily commute route</span>
                      </div>
                    </button>

                    <div className="my-1 border-t border-[#21242c]" />

                    <button
                      onClick={() => { setIsCreateOpen(false); onOpenCreateListing(); }}
                      className="w-full flex items-start gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-[#1a1d26] text-slate-200 transition-colors cursor-pointer"
                    >
                      <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 mt-0.5">
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold text-white block">Post Market Item</span>
                        <span className="text-[10px] text-slate-400">List tech gear or vehicle accessories</span>
                      </div>
                    </button>

                    <button
                      onClick={() => { setIsCreateOpen(false); onOpenAskQuestion(); }}
                      className="w-full flex items-start gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-[#1a1d26] text-slate-200 transition-colors cursor-pointer"
                    >
                      <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 mt-0.5">
                        <HelpCircle className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold text-white block">Ask Technical Question</span>
                        <span className="text-[10px] text-slate-400">Get answers from MBRDI domain leads</span>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Direct Messages Icon Button */}
            <button
              onClick={onOpenMessages}
              className="p-2 rounded-xl bg-[#14171d] hover:bg-[#1f232e] border border-[#21242c] text-slate-400 hover:text-white transition-all cursor-pointer relative"
              title="Direct Messages"
              aria-label="Direct Messages"
            >
              <MessageSquare className="w-4 h-4" />
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-indigo-500 text-white animate-pulse shadow-sm">
                  {unreadMessagesCount}
                </span>
              )}
            </button>

            {/* Notifications Bell Button */}
            <button
              onClick={onOpenNotifications}
              className="p-2 rounded-xl bg-[#14171d] hover:bg-[#1f232e] border border-[#21242c] text-slate-400 hover:text-white transition-all cursor-pointer relative"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500 text-slate-950 font-mono shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Saved Items Bookmark Button */}
            <button
              onClick={onOpenSaved}
              className="p-2 rounded-xl bg-[#14171d] hover:bg-[#1f232e] border border-[#21242c] text-slate-400 hover:text-white transition-all cursor-pointer relative"
              title="Saved Items & Watchlist"
              aria-label="Saved Items"
            >
              <Bookmark className="w-4 h-4" />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Persona Switcher / Profile Badge */}
            <div className="pl-1 sm:pl-2 border-l border-[#21242c]">
              <button
                onClick={onOpenRoleModal}
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-[#14171d] hover:bg-[#1a1d26] border border-[#21242c] hover:border-indigo-500/30 transition-all cursor-pointer"
                title="Switch Persona / Role"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {currentUser.initials}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <div className="text-xs font-semibold text-slate-200 leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 leading-tight">
                    <span className="capitalize">{currentUser.systemRole}</span>
                    <span>·</span>
                    <span>{currentUser.campus}</span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
