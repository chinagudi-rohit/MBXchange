import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Bell, 
  Bookmark, 
  ChevronDown, 
  Sparkles, 
  ShieldCheck, 
  Users, 
  Briefcase, 
  ShoppingBag, 
  HelpCircle, 
  TrendingUp, 
  Award, 
  Zap,
  Layers,
  Menu,
  X,
  FileCheck
} from 'lucide-react';
import { MainTab, TalentProfile, NotificationItem } from '../types';

interface NavbarProps {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  currentUser: TalentProfile;
  onOpenRoleModal: () => void;
  onOpenNotifications: () => void;
  onOpenSaved: () => void;
  notifications: NotificationItem[];
  savedCount: number;
  onOpenGlobalSearch: () => void;
  onOpenCreateWork: () => void;
  onOpenOfferBandwidth: () => void;
  onOpenCreateListing: () => void;
  onOpenAskQuestion: () => void;
  pendingApprovalsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  currentUser,
  onOpenRoleModal,
  onOpenNotifications,
  onOpenSaved,
  notifications,
  savedCount,
  onOpenGlobalSearch,
  onOpenCreateWork,
  onOpenOfferBandwidth,
  onOpenCreateListing,
  onOpenAskQuestion,
  pendingApprovalsCount
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const navLinks: Array<{ id: MainTab; label: string; icon: React.ReactNode; badge?: number }> = [
    { id: 'home', label: 'Home', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'work', label: 'Work Exchange', icon: <Briefcase className="w-3.5 h-3.5" /> },
    { id: 'people', label: 'People & Skills', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'marketplace', label: 'Marketplace', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
    { id: 'community', label: 'Communities', icon: <HelpCircle className="w-3.5 h-3.5" /> },
    { id: 'insights', label: 'Enterprise Insights', icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { 
      id: 'manager', 
      label: 'Manager Inbox', 
      icon: <FileCheck className="w-3.5 h-3.5" />,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined 
    },
    { id: 'myxchange', label: 'My Xchange', icon: <Award className="w-3.5 h-3.5" /> }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0c0d10]/95 backdrop-blur-md border-b border-[#21242c] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header Row */}
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onTabChange('home')}
              className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
            >
              {/* Mercedes-Benz Style Geometric Star/Badge */}
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
                <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                  Connect · Collaborate · Contribute
                </span>
              </div>
            </button>
          </div>

          {/* Center: Global Unified Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <button
              onClick={onOpenGlobalSearch}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#14171d] hover:bg-[#1a1d26] border border-[#21242c] hover:border-indigo-500/40 text-xs text-slate-400 shadow-inner transition-all text-left cursor-pointer group"
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
          <div className="flex items-center gap-2.5">
            
            {/* Quick + Create Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsCreateOpen(!isCreateOpen)}
                className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
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

                    <div className="my-1 border-t border-[#21242c]" />

                    <button
                      onClick={() => { setIsCreateOpen(false); onOpenCreateListing(); }}
                      className="w-full flex items-start gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-[#1a1d26] text-slate-200 transition-colors cursor-pointer"
                    >
                      <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 mt-0.5">
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold text-white block">Post Marketplace Item</span>
                        <span className="text-[10px] text-slate-400">Sell, give away, or request goods/tickets</span>
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
                        <span className="font-bold text-white block">Ask the Community</span>
                        <span className="text-[10px] text-slate-400">Post technical questions to expert guilds</span>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Saved Drawer Icon */}
            <button
              onClick={onOpenSaved}
              className="p-2 rounded-xl bg-[#14171d] hover:bg-[#1a1d26] border border-[#21242c] text-slate-400 hover:text-slate-200 transition-colors relative cursor-pointer"
              title="Saved Items"
            >
              <Bookmark className="w-4 h-4" />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Notifications Icon */}
            <button
              onClick={onOpenNotifications}
              className="p-2 rounded-xl bg-[#14171d] hover:bg-[#1a1d26] border border-[#21242c] text-slate-400 hover:text-slate-200 transition-colors relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User Profile Mini Switcher */}
            <button
              onClick={onOpenRoleModal}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-[#14171d] hover:bg-[#1a1d26] border border-[#21242c] hover:border-slate-700 transition-all cursor-pointer text-left"
              title="Switch user or view profile"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 font-bold text-xs flex items-center justify-center">
                {currentUser.initials}
              </div>
              <div className="hidden xl:flex flex-col">
                <span className="text-xs font-bold text-white leading-none truncate max-w-[120px]">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-indigo-400 font-medium truncate max-w-[120px]">
                  ⭐ {currentUser.contributionScore} · {currentUser.role}
                </span>
              </div>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-[#14171d] border border-[#21242c] text-slate-400 hover:text-white md:hidden"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

          </div>

        </div>

        {/* Desktop Navigation Links Strip */}
        <nav className="hidden md:flex items-center gap-1 py-2 overflow-x-auto scrollbar-none border-t border-[#1a1d26]">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onTabChange(link.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1a1d26] text-indigo-400 border border-indigo-500/30 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#14171d]'
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
                {link.badge !== undefined && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Mobile Dropdown Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-[#21242c] space-y-1">
            <button
              onClick={() => { onOpenGlobalSearch(); setIsMobileMenuOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-[#14171d] text-xs text-slate-300 mb-2"
            >
              <Search className="w-4 h-4 text-indigo-400" />
              <span>Search everything...</span>
            </button>
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => { onTabChange(link.id); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
                  activeTab === link.id
                    ? 'bg-[#1a1d26] text-indigo-400 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {link.icon}
                  <span>{link.label}</span>
                </div>
                {link.badge !== undefined && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400">
                    {link.badge} pending
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

      </div>
    </header>
  );
};
