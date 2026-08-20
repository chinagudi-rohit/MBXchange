import React, { useEffect } from 'react';
import { 
  X, 
  Layers, 
  Briefcase, 
  Users, 
  ShoppingBag, 
  HelpCircle, 
  TrendingUp, 
  FileCheck, 
  Award, 
  ShieldCheck, 
  Search, 
  Plus, 
  Zap, 
  MessageSquare, 
  Bookmark, 
  Bell, 
  ArrowRight,
  Shield,
  Building2,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Car
} from 'lucide-react';
import { MainTab, UserAccount, NotificationItem } from '../types';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
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
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  isOpen,
  onClose,
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
  pendingApprovalsCount
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const allNavItems: Array<{
    id: MainTab;
    label: string;
    description: string;
    icon: React.ReactNode;
    badge?: number;
    badgeColor?: string;
    roleTag?: string;
    managerOnly?: boolean;
    adminOnly?: boolean;
  }> = [
    {
      id: 'home',
      label: 'Home Dashboard',
      description: 'Platform overview, AI recommendation spotlight & fast actions',
      icon: <Layers className="w-4 h-4 text-indigo-400" />
    },
    {
      id: 'work',
      label: 'Work & Micro-Gig Exchange',
      description: 'Peer task sharing, 30m-3d gigs & declared bandwidth pool',
      icon: <Briefcase className="w-4 h-4 text-indigo-400" />
    },
    {
      id: 'people',
      label: 'People & Skills Graph',
      description: 'Verified enterprise directory with 10 MBI departments',
      icon: <Users className="w-4 h-4 text-blue-400" />
    },
    {
      id: 'carpool',
      label: 'Carpool & Rides',
      description: 'Daily campus commutes, EV ridesharing & cost splitting',
      icon: <Car className="w-4 h-4 text-emerald-400" />
    },
    {
      id: 'marketplace',
      label: 'Employee Marketplace',
      description: 'Peer-to-peer equipment, car accessories & internal classifieds',
      icon: <ShoppingBag className="w-4 h-4 text-amber-400" />
    },
    {
      id: 'community',
      label: 'Communities & Guilds',
      description: 'Knowledge Q&A, technical guilds & campus interest clubs',
      icon: <HelpCircle className="w-4 h-4 text-cyan-400" />
    },
    {
      id: 'insights',
      label: 'Enterprise Insights & Heatmap',
      description: 'Organizational skill demand vs internal capacity telemetry',
      icon: <TrendingUp className="w-4 h-4 text-purple-400" />
    },
    {
      id: 'manager',
      label: 'Manager Approval Inbox',
      description: 'Review cross-department micro-gig requests & mobility',
      icon: <FileCheck className="w-4 h-4 text-amber-400" />,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
      managerOnly: true
    },
    {
      id: 'myxchange',
      label: 'My Xchange Hub',
      description: 'Personal score, verified badges & mobility tracking',
      icon: <Award className="w-4 h-4 text-indigo-400" />
    },
    {
      id: 'admin',
      label: 'Admin Governance Console',
      description: 'User hierarchy, RBAC permissions & audit logs',
      icon: <ShieldCheck className="w-4 h-4 text-rose-400" />,
      roleTag: 'ADMIN',
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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden text-slate-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200 cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Drawer Panel */}
      <div className="fixed inset-y-0 left-0 max-w-md sm:max-w-lg w-full bg-[#0c0d10] border-r border-[#21242c] shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-250">
        
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-[#21242c] bg-[#101217] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-black text-base shadow-lg shadow-indigo-500/25 border border-indigo-400/30">
              <span className="tracking-tighter">MB</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-lg tracking-tight">
                  MB<span className="text-indigo-400">Xchange</span>
                </span>
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
                  Internal
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Mercedes-Benz Internal Talent & Mobility Network
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-[#171a22] hover:bg-[#202430] border border-[#262a33] text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Persona Card */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#14171d] via-[#181b24] to-[#14171d] border-b border-[#21242c]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-bold text-base flex items-center justify-center shrink-0">
                {currentUser.initials}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white leading-tight">
                    {currentUser.name}
                  </h4>
                  <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                    currentUser.systemRole === 'admin' 
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : currentUser.systemRole === 'manager'
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {(currentUser.systemRole || 'employee').toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-indigo-400 font-medium mt-0.5">
                  {currentUser.role} · {currentUser.department}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                  <span>⭐ {currentUser.contributionScore} pts</span>
                  <span>·</span>
                  <span>📍 {currentUser.campus}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => { onClose(); onOpenRoleModal(); }}
              className="px-3 py-1.5 rounded-xl bg-[#202430] hover:bg-indigo-600 border border-[#2a2f3d] hover:border-indigo-500 text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer shrink-0"
            >
              Switch
            </button>
          </div>

          {/* Quick Profile & Messages Row */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#21242c]">
            <button
              onClick={() => { onClose(); onOpenProfile(); }}
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-[#0f1116] hover:bg-[#1b1e28] border border-[#21242c] text-xs font-medium text-slate-300 transition-colors cursor-pointer"
            >
              <span>My Profile</span>
            </button>
            <button
              onClick={() => { onClose(); onOpenMessages(); }}
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-[#0f1116] hover:bg-[#1b1e28] border border-[#21242c] text-xs font-medium text-slate-300 transition-colors relative cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              <span>Inbox</span>
              {unreadMessagesCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadMessagesCount}
                </span>
              )}
            </button>
            <button
              onClick={() => { onClose(); onOpenSaved(); }}
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-[#0f1116] hover:bg-[#1b1e28] border border-[#21242c] text-xs font-medium text-slate-300 transition-colors relative cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-400" />
              <span>Saved ({savedCount})</span>
            </button>
          </div>
        </div>

        {/* Search Bar in Drawer */}
        <div className="p-4 border-b border-[#21242c] bg-[#0e1014]">
          <button
            onClick={() => { onClose(); onOpenGlobalSearch(); }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#14171d] hover:bg-[#1a1d26] border border-[#21242c] hover:border-indigo-500/40 text-xs text-slate-400 transition-all text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
              <span>Search skills, people, gigs, listings...</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-[#0f1116] border border-[#262a33] text-[10px] font-mono text-slate-400">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-thin">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Platform Modules
          </div>

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  onClose();
                }}
                className={`w-full flex items-start gap-3.5 p-3 rounded-2xl text-left transition-all cursor-pointer group ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-950/60 to-[#14171d] border border-indigo-500/40 text-white shadow-lg'
                    : 'hover:bg-[#14171d] text-slate-300 border border-transparent'
                }`}
              >
                <div className={`p-2 rounded-xl mt-0.5 ${
                  isActive ? 'bg-indigo-600 text-white' : 'bg-[#171a22] border border-[#21242c] group-hover:scale-105'
                } transition-transform`}>
                  {item.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm font-bold truncate ${isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                      {item.label}
                    </span>
                    {item.badge !== undefined && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.badgeColor || 'bg-indigo-500/20 text-indigo-400'}`}>
                        {item.badge} pending
                      </span>
                    )}
                    {item.roleTag && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        {item.roleTag}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 leading-snug">
                    {item.description}
                  </p>
                </div>

                <ChevronRight className={`w-4 h-4 mt-1 shrink-0 transition-transform ${
                  isActive ? 'text-indigo-400 translate-x-0.5' : 'text-slate-600 group-hover:text-slate-400'
                }`} />
              </button>
            );
          })}

          {/* Quick Actions Section */}
          <div className="pt-4 mt-4 border-t border-[#21242c]">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Fast Enterprise Actions
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { onClose(); onOpenCreateWork(); }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[#14171d] hover:bg-[#1a1d26] border border-[#21242c] hover:border-indigo-500/40 text-xs font-semibold text-slate-200 text-left transition-colors cursor-pointer"
              >
                <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                  <Briefcase className="w-3.5 h-3.5" />
                </div>
                <span>Request Gig</span>
              </button>

              <button
                onClick={() => { onClose(); onOpenOfferBandwidth(); }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[#14171d] hover:bg-[#1a1d26] border border-[#21242c] hover:border-emerald-500/40 text-xs font-semibold text-slate-200 text-left transition-colors cursor-pointer"
              >
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <span>Offer Bandwidth</span>
              </button>

              <button
                onClick={() => { onClose(); onOpenCreateListing(); }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[#14171d] hover:bg-[#1a1d26] border border-[#21242c] hover:border-amber-500/40 text-xs font-semibold text-slate-200 text-left transition-colors cursor-pointer"
              >
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <ShoppingBag className="w-3.5 h-3.5" />
                </div>
                <span>Post Item</span>
              </button>

              {onOpenOfferRide && (
                <button
                  onClick={() => { onClose(); onOpenOfferRide(); }}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-[#14171d] hover:bg-[#1a1d26] border border-[#21242c] hover:border-emerald-500/40 text-xs font-semibold text-slate-200 text-left transition-colors cursor-pointer"
                >
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <Car className="w-3.5 h-3.5" />
                  </div>
                  <span>Offer Ride</span>
                </button>
              )}

              <button
                onClick={() => { onClose(); onOpenAskQuestion(); }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[#14171d] hover:bg-[#1a1d26] border border-[#21242c] hover:border-blue-500/40 text-xs font-semibold text-slate-200 text-left transition-colors cursor-pointer"
              >
                <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                  <HelpCircle className="w-3.5 h-3.5" />
                </div>
                <span>Ask Guild</span>
              </button>
            </div>
          </div>
        </div>

        {/* Drawer Footer Status */}
        <div className="p-4 border-t border-[#21242c] bg-[#0a0b0e] text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50 animate-pulse" />
            <span className="text-slate-400">Mercedes-Benz Secure Gateway</span>
          </div>
          <span className="font-mono text-[10px] text-slate-600">v2.4 Enterprise</span>
        </div>

      </div>
    </div>
  );
};
