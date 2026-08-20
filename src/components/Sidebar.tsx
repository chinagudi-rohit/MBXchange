import React, { useState } from 'react';
import { 
  Layers, 
  Briefcase, 
  Users, 
  Car, 
  ShoppingBag, 
  HelpCircle, 
  TrendingUp, 
  Award, 
  FileCheck, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Sparkles,
  Bookmark,
  Bell,
  MessageSquare,
  Search,
  Zap,
  UserCheck
} from 'lucide-react';
import { MainTab, UserAccount, NotificationItem } from '../types';

interface SidebarProps {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  currentUser: UserAccount;
  pendingApprovalsCount: number;
  unreadMessagesCount: number;
  unreadNotificationsCount: number;
  savedCount: number;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  onOpenCreateWork: () => void;
  onOpenOfferBandwidth: () => void;
  onOpenOfferRide: () => void;
  onOpenCreateListing: () => void;
  onOpenAskQuestion: () => void;
  onOpenSaved: () => void;
  onOpenMessages: () => void;
  onOpenNotifications: () => void;
  onOpenRoleModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  currentUser,
  pendingApprovalsCount,
  unreadMessagesCount,
  unreadNotificationsCount,
  savedCount,
  mobileOpen = false,
  onMobileClose,
  onOpenCreateWork,
  onOpenOfferBandwidth,
  onOpenOfferRide,
  onOpenCreateListing,
  onOpenAskQuestion,
  onOpenSaved,
  onOpenMessages,
  onOpenNotifications,
  onOpenRoleModal
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);

  const allNavItems: Array<{
    id: MainTab;
    label: string;
    description: string;
    icon: React.ReactNode;
    badge?: number;
    badgeColor?: string;
    managerOnly?: boolean;
    adminOnly?: boolean;
  }> = [
    {
      id: 'home',
      label: 'Home',
      description: 'Activity overview & AI matches',
      icon: <Layers className="w-4 h-4 shrink-0" />
    },
    {
      id: 'work',
      label: 'Work Exchange',
      description: 'Micro-gigs & cross-team bandwidth',
      icon: <Briefcase className="w-4 h-4 shrink-0" />
    },
    {
      id: 'people',
      label: 'People & Skills',
      description: 'Skill directory & collaboration',
      icon: <Users className="w-4 h-4 shrink-0" />
    },
    {
      id: 'carpool',
      label: 'Carpool & Rides',
      description: 'Campus commutes & EV rideshare',
      icon: <Car className="w-4 h-4 shrink-0" />
    },
    {
      id: 'marketplace',
      label: 'Marketplace',
      description: 'Peer equipment & auto classifieds',
      icon: <ShoppingBag className="w-4 h-4 shrink-0" />
    },
    {
      id: 'community',
      label: 'Communities',
      description: 'Guilds, forums & technical Q&A',
      icon: <HelpCircle className="w-4 h-4 shrink-0" />
    },
    {
      id: 'insights',
      label: 'Enterprise Insights',
      description: 'Skill heatmaps & org analytics',
      icon: <TrendingUp className="w-4 h-4 shrink-0" />
    },
    {
      id: 'manager',
      label: 'Manager Inbox',
      description: 'Direct report gig approvals',
      icon: <FileCheck className="w-4 h-4 shrink-0" />,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
      managerOnly: true
    },
    {
      id: 'myxchange',
      label: 'My Xchange',
      description: 'Personal portfolio, gigs & rep',
      icon: <Award className="w-4 h-4 shrink-0" />
    },
    {
      id: 'admin',
      label: 'Admin Governance',
      description: 'RBAC, audit logs & compliance',
      icon: <ShieldCheck className="w-4 h-4 shrink-0" />,
      adminOnly: true
    }
  ];

  const navItems = allNavItems.filter(item => {
    if (item.managerOnly && currentUser.systemRole !== 'manager' && currentUser.systemRole !== 'admin') {
      return false;
    }
    if (item.adminOnly && currentUser.systemRole !== 'admin') {
      return false;
    }
    return true;
  });

  const handleItemClick = (id: MainTab) => {
    onTabChange(id);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Top Header Section / Collapse Button */}
      <div className="flex items-center justify-between px-3.5 py-3 border-b border-[#1c1f26]">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Navigation
            </span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`hidden md:flex p-1.5 rounded-xl bg-[#14171d] hover:bg-[#1f232e] border border-[#21242c] text-slate-400 hover:text-white transition-all cursor-pointer ${
            isCollapsed ? 'mx-auto' : ''
          }`}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-indigo-400" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* Mobile Close Button */}
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="md:hidden p-1.5 rounded-xl bg-[#14171d] hover:bg-[#1f232e] border border-[#21242c] text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Top-to-Down Navigation List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1.5 scrollbar-thin scrollbar-thumb-[#21242c]">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group cursor-pointer text-left relative ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-950/60 to-indigo-900/30 text-indigo-300 border border-indigo-500/30 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#14171d]/80 border border-transparent'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              {/* Active Left Indicator Bar */}
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-indigo-500" />
              )}

              <div
                className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                  isActive
                    ? 'bg-indigo-500/20 text-indigo-400'
                    : 'bg-[#14171d] group-hover:bg-[#1c202a] text-slate-400 group-hover:text-slate-200'
                }`}
              >
                {item.icon}
              </div>

              {(!isCollapsed || mobileOpen) && (
                <div className="flex-1 min-w-0 flex items-center justify-between gap-1.5">
                  <div className="truncate">
                    <div className={`text-xs font-semibold truncate ${isActive ? 'text-white font-bold' : ''}`}>
                      {item.label}
                    </div>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold shrink-0 ${
                        item.badgeColor || 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}

              {isCollapsed && !mobileOpen && item.badge !== undefined && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[#0c0d10]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Quick Action Button & User Info in Sidebar Footer */}
      <div className="p-2 border-t border-[#1c1f26] space-y-2 bg-[#0a0b0e]/60">
        
        {/* Quick Post / Create Button */}
        <div className="relative">
          <button
            onClick={() => setIsQuickCreateOpen(!isQuickCreateOpen)}
            className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all cursor-pointer ${
              isCollapsed && !mobileOpen ? 'px-2' : ''
            }`}
            title="Post / Request"
          >
            <Plus className="w-4 h-4 shrink-0" />
            {(!isCollapsed || mobileOpen) && <span>Post / Request</span>}
          </button>

          {isQuickCreateOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsQuickCreateOpen(false)}
              />
              <div className="absolute left-full bottom-0 ml-2 w-64 rounded-2xl bg-[#14171d] border border-[#21242c] shadow-2xl p-2 z-50 text-xs animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-[#21242c] mb-1">
                  Create New Action
                </div>

                <button
                  onClick={() => { setIsQuickCreateOpen(false); onOpenCreateWork(); if (onMobileClose) onMobileClose(); }}
                  className="w-full flex items-start gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-[#1a1d26] text-slate-200 transition-colors cursor-pointer"
                >
                  <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 mt-0.5">
                    <Briefcase className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Request Help</span>
                    <span className="text-[10px] text-slate-400">Post gig or design review</span>
                  </div>
                </button>

                <button
                  onClick={() => { setIsQuickCreateOpen(false); onOpenOfferBandwidth(); if (onMobileClose) onMobileClose(); }}
                  className="w-full flex items-start gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-[#1a1d26] text-slate-200 transition-colors cursor-pointer"
                >
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Offer Bandwidth</span>
                    <span className="text-[10px] text-slate-400">List available hours & skills</span>
                  </div>
                </button>

                <button
                  onClick={() => { setIsQuickCreateOpen(false); onOpenOfferRide(); if (onMobileClose) onMobileClose(); }}
                  className="w-full flex items-start gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-[#1a1d26] text-slate-200 transition-colors cursor-pointer"
                >
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5">
                    <Car className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Offer Carpool Ride</span>
                    <span className="text-[10px] text-slate-400">Share your daily commute</span>
                  </div>
                </button>

                <button
                  onClick={() => { setIsQuickCreateOpen(false); onOpenCreateListing(); if (onMobileClose) onMobileClose(); }}
                  className="w-full flex items-start gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-[#1a1d26] text-slate-200 transition-colors cursor-pointer"
                >
                  <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 mt-0.5">
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Post Market Item</span>
                    <span className="text-[10px] text-slate-400">Sell/give equipment & accessories</span>
                  </div>
                </button>

                <button
                  onClick={() => { setIsQuickCreateOpen(false); onOpenAskQuestion(); if (onMobileClose) onMobileClose(); }}
                  className="w-full flex items-start gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-[#1a1d26] text-slate-200 transition-colors cursor-pointer"
                >
                  <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 mt-0.5">
                    <HelpCircle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Ask Community</span>
                    <span className="text-[10px] text-slate-400">Technical Q&A / Tech stack help</span>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Current User Quick Persona Card */}
        <div
          onClick={() => { onOpenRoleModal(); if (onMobileClose) onMobileClose(); }}
          className={`flex items-center gap-2.5 p-2 rounded-xl bg-[#14171d] hover:bg-[#1a1d26] border border-[#21242c] transition-all cursor-pointer ${
            isCollapsed && !mobileOpen ? 'justify-center p-1.5' : ''
          }`}
          title="Switch Role / Persona Gateway"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
            {currentUser.initials}
          </div>

          {(!isCollapsed || mobileOpen) && (
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                <span className="truncate">{currentUser.name}</span>
                {currentUser.systemRole === 'admin' && (
                  <span className="text-[8px] px-1 py-0.2 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 uppercase font-mono">
                    Admin
                  </span>
                )}
                {currentUser.systemRole === 'manager' && (
                  <span className="text-[8px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase font-mono">
                    Mgr
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {currentUser.department}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside
        className={`hidden md:flex flex-col shrink-0 border-r border-[#21242c] bg-[#0c0d10]/95 backdrop-blur-md transition-all duration-300 z-30 sticky top-16 h-[calc(100vh-4rem)] ${
          isCollapsed ? 'w-18' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity" 
            onClick={onMobileClose} 
          />
          <div className="relative w-72 max-w-[80vw] bg-[#0c0d10] border-r border-[#21242c] shadow-2xl z-10 flex flex-col h-full">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
