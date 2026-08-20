import React, { useState, useEffect } from 'react';
import { 
  MainTab, 
  TalentProfile, 
  WorkPost, 
  MarketListing, 
  CommunityPost, 
  CommunityGroup,
  KnowledgeQuestion,
  BandwidthOffer,
  ManagerApprovalItem,
  CapabilityHeatmapItem,
  NotificationItem, 
  WorkStatus 
} from './types';
import { 
  INITIAL_TALENT_PROFILES,
  INITIAL_WORK_POSTS, 
  INITIAL_BANDWIDTH_OFFERS,
  INITIAL_COMMUNITY_GROUPS,
  INITIAL_KNOWLEDGE_QUESTIONS,
  INITIAL_LISTINGS, 
  INITIAL_COMMUNITY_POSTS, 
  INITIAL_MANAGER_APPROVALS,
  INITIAL_CAPABILITY_HEATMAP,
  INITIAL_NOTIFICATIONS 
} from './data/initialData';

// UI Components
import { Navbar } from './components/Navbar';
import { RoleSelectorModal } from './components/RoleSelectorModal';
import { NotificationsModal } from './components/NotificationsModal';
import { SavedDrawer } from './components/SavedDrawer';
import { ContactDialog } from './components/ContactDialog';
import { ToastContainer, ToastMessage } from './components/Toast';

// Views
import { HomeDashboard } from './components/home/HomeDashboard';
import { WorkFeed } from './components/work/WorkFeed';
import { WorkDetail } from './components/work/WorkDetail';
import { WorkNewModal } from './components/work/WorkNewModal';
import { BandwidthOfferModal } from './components/work/BandwidthOfferModal';
import { PeopleSkillsView } from './components/people/PeopleSkillsView';
import { RequestCollaborationModal } from './components/people/RequestCollaborationModal';
import { MarketGrid } from './components/market/MarketGrid';
import { MarketDetail } from './components/market/MarketDetail';
import { MarketNewModal } from './components/market/MarketNewModal';
import { CommunityFeed } from './components/community/CommunityFeed';
import { CommunityNewModal } from './components/community/CommunityNewModal';
import { AskQuestionModal } from './components/community/AskQuestionModal';
import { EnterpriseInsightsView } from './components/insights/EnterpriseInsightsModal';
import { ManagerInboxView } from './components/manager/ManagerInboxModal';
import { MyXchangeView } from './components/myXchange/MyXchangeModal';
import { GlobalSearchModal } from './components/search/GlobalSearchModal';

// Storage helper utilities with fallbacks
function safeGetArray<T>(key: string, fallback: T[]): T[] {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return fallback;
  } catch (e) {
    return fallback;
  }
}

function safeGetObject<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && Object.keys(parsed).length > 0) {
      return parsed;
    }
    return fallback;
  } catch (e) {
    return fallback;
  }
}

export default function App() {
  // Navigation & Screen State
  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [selectedWorkId, setSelectedWorkId] = useState<number | null>(null);
  const [selectedListingId, setSelectedListingId] = useState<number | null>(null);

  // Modals & Drawers
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [isNewWorkOpen, setIsNewWorkOpen] = useState(false);
  const [isOfferBandwidthOpen, setIsOfferBandwidthOpen] = useState(false);
  const [isNewListingOpen, setIsNewListingOpen] = useState(false);
  const [isNewCommunityOpen, setIsNewCommunityOpen] = useState(false);
  const [isAskQuestionOpen, setIsAskQuestionOpen] = useState(false);
  const [targetCollaborationTalent, setTargetCollaborationTalent] = useState<TalentProfile | null>(null);

  // Contact Dialog State
  const [contactDialog, setContactDialog] = useState<{
    isOpen: boolean;
    targetTitle: string;
    recipientName: string;
    recipientRole: string;
    recipientInitials: string;
    contextType: 'work' | 'market' | 'community';
    onSuccessCallback?: () => void;
  }>({
    isOpen: false,
    targetTitle: '',
    recipientName: '',
    recipientRole: '',
    recipientInitials: '',
    contextType: 'work'
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // State Management with LocalStorage persistence & safe fallbacks
  const [currentUser, setCurrentUser] = useState<TalentProfile>(() => {
    return safeGetObject('mbx_current_user', INITIAL_TALENT_PROFILES[0]);
  });

  const [talentProfiles, setTalentProfiles] = useState<TalentProfile[]>(() => {
    return safeGetArray('mbx_talents', INITIAL_TALENT_PROFILES);
  });

  const [workPosts, setWorkPosts] = useState<WorkPost[]>(() => {
    return safeGetArray('mbx_work_posts', INITIAL_WORK_POSTS);
  });

  const [bandwidthOffers, setBandwidthOffers] = useState<BandwidthOffer[]>(() => {
    return safeGetArray('mbx_bandwidth_offers', INITIAL_BANDWIDTH_OFFERS);
  });

  const [communityGroups, setCommunityGroups] = useState<CommunityGroup[]>(() => {
    return safeGetArray('mbx_community_groups', INITIAL_COMMUNITY_GROUPS);
  });

  const [knowledgeQuestions, setKnowledgeQuestions] = useState<KnowledgeQuestion[]>(() => {
    return safeGetArray('mbx_knowledge_questions', INITIAL_KNOWLEDGE_QUESTIONS);
  });

  const [listings, setListings] = useState<MarketListing[]>(() => {
    return safeGetArray('mbx_listings', INITIAL_LISTINGS);
  });

  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(() => {
    return safeGetArray('mbx_community_posts', INITIAL_COMMUNITY_POSTS);
  });

  const [managerApprovals, setManagerApprovals] = useState<ManagerApprovalItem[]>(() => {
    return safeGetArray('mbx_manager_approvals', INITIAL_MANAGER_APPROVALS);
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    return safeGetArray('mbx_notifications', INITIAL_NOTIFICATIONS);
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('mbx_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('mbx_work_posts', JSON.stringify(workPosts));
  }, [workPosts]);

  useEffect(() => {
    localStorage.setItem('mbx_bandwidth_offers', JSON.stringify(bandwidthOffers));
  }, [bandwidthOffers]);

  useEffect(() => {
    localStorage.setItem('mbx_community_groups', JSON.stringify(communityGroups));
  }, [communityGroups]);

  useEffect(() => {
    localStorage.setItem('mbx_knowledge_questions', JSON.stringify(knowledgeQuestions));
  }, [knowledgeQuestions]);

  useEffect(() => {
    localStorage.setItem('mbx_listings', JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    localStorage.setItem('mbx_community_posts', JSON.stringify(communityPosts));
  }, [communityPosts]);

  useEffect(() => {
    localStorage.setItem('mbx_manager_approvals', JSON.stringify(managerApprovals));
  }, [managerApprovals]);

  useEffect(() => {
    localStorage.setItem('mbx_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Tab switcher
  const handleTabChange = (tab: MainTab) => {
    setActiveTab(tab);
    setSelectedWorkId(null);
    setSelectedListingId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Upvote / Downvote Work Posts
  const handleUpvoteWork = (id: number) => {
    setWorkPosts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const newVoteState = p.voteState === 1 ? 0 : 1;
        return { ...p, voteState: newVoteState as any };
      })
    );
  };

  const handleDownvoteWork = (id: number) => {
    setWorkPosts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const newVoteState = p.voteState === -1 ? 0 : -1;
        return { ...p, voteState: newVoteState as any };
      })
    );
  };

  // Bookmark toggles
  const handleToggleWorkBookmark = (id: number) => {
    setWorkPosts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const nextBookmarked = !p.bookmarked;
        addToast(
          'info',
          nextBookmarked ? 'Opportunity Saved' : 'Bookmark Removed',
          `"${p.title.slice(0, 38)}..."`
        );
        return { ...p, bookmarked: nextBookmarked };
      })
    );
  };

  const handleToggleListingBookmark = (id: number) => {
    setListings((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const nextBookmarked = !l.bookmarked;
        addToast(
          'info',
          nextBookmarked ? 'Listing Saved' : 'Watchlist Removed',
          `"${l.title.slice(0, 38)}..."`
        );
        return { ...l, bookmarked: nextBookmarked };
      })
    );
  };

  // Comments / Replies on Work Post
  const handleAddComment = (postId: number, text: string) => {
    const newComment = {
      id: 'c_' + Date.now(),
      author: currentUser.name,
      role: currentUser.role,
      initials: currentUser.initials,
      time: 'Just now',
      timestamp: Date.now(),
      text,
      likes: 0
    };

    setWorkPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p))
    );

    addToast('success', 'Reply posted', 'Your response is now visible in the opportunity thread.');
  };

  // Update Status on Work Post
  const handleUpdateWorkStatus = (postId: number, status: WorkStatus) => {
    setWorkPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, status } : p))
    );
    addToast('success', 'Status Updated', `Requirement status changed to "${status}".`);
  };

  // Submit New Work Post (I Need Help)
  const handleCreateWorkPost = (data: Partial<WorkPost>) => {
    const newId = Math.max(0, ...workPosts.map(p => p.id)) + 1;

    const newPost: WorkPost = {
      id: newId,
      title: data.title || 'Untitled Requirement',
      department: data.department || currentUser.department,
      status: 'Open',
      urgency: data.urgency || 'Medium',
      duration: data.duration || '2–3 days (Short Gig)',
      expectedEffortHours: data.expectedEffortHours || '8–12 hours',
      managerApprovalRequired: data.managerApprovalRequired ?? true,
      votes: 1,
      voteState: 1,
      tags: data.tags || ['Engineering'],
      author: currentUser.name,
      role: currentUser.role,
      initials: currentUser.initials,
      location: data.location || currentUser.campus,
      time: 'Just now',
      timestamp: Date.now(),
      description: data.description || '',
      whyOpportunity: data.whyOpportunity,
      contactPref: 'reply',
      comments: [],
      contacted: false,
      bookmarked: false,
      matchScore: 92,
      applicantCount: 0
    };

    setWorkPosts((prev) => [newPost, ...prev]);
    setSelectedWorkId(newId);
    setActiveTab('work');
    addToast('success', 'Requirement Published', 'Your micro-gig is live on MBXchange and matching relevant colleagues.');
  };

  // Submit Bandwidth Declaration (I Can Help)
  const handleCreateBandwidthOffer = (data: Partial<BandwidthOffer>) => {
    const newOffer: BandwidthOffer = {
      id: 'bo_' + Date.now(),
      author: currentUser.name,
      role: currentUser.role,
      department: currentUser.department,
      initials: currentUser.initials,
      availableHours: data.availableHours || '6 hours this month',
      skillsOffered: data.skillsOffered || currentUser.primarySkills,
      notes: data.notes || 'Available for architecture reviews and cross-squad pairing.',
      time: 'Just now',
      timestamp: Date.now()
    };

    setBandwidthOffers((prev) => [newOffer, ...prev]);
    addToast('success', 'Bandwidth Registered', 'Your available capacity has been updated across the MBXchange matching pool.');
  };

  // Apply for Micro-Gig (Trigger Manager Approval Workflow)
  const handleApplyForGig = (post: WorkPost) => {
    const newApproval: ManagerApprovalItem = {
      id: 'appr_' + Date.now(),
      employeeName: currentUser.name,
      employeeRole: currentUser.role,
      employeeDepartment: currentUser.department,
      opportunityId: post.id,
      currentProject: 'MyAthlon / Fleet Telemetry',
      opportunityTitle: post.title,
      targetDepartment: post.department,
      requestedCommitment: post.expectedEffortHours,
      period: 'Next 7 Days',
      requestedAt: 'Today',
      status: 'Pending',
      aiRecommendation: 'Approve',
      aiRecommendationReason: `Requested commitment (${post.expectedEffortHours}) aligns with ${currentUser.name}'s declared bandwidth with zero sprint blockers.`
    };

    setManagerApprovals((prev) => [newApproval, ...prev]);
    setWorkPosts((prev) => prev.map(p => p.id === post.id ? { ...p, contacted: true, applicantCount: (p.applicantCount || 0) + 1 } : p));
    addToast('success', 'Interest Registered', `Manager approval request routed for "${post.title.slice(0, 32)}...".`);
  };

  // Manager Approval Actions
  const handleApproveManager = (id: string, notes?: string) => {
    setManagerApprovals((prev) => prev.map(a => a.id === id ? { ...a, status: 'Approved', managerNotes: notes } : a));
    addToast('success', 'Gig Approved', 'Employee is approved to participate in cross-department collaboration.');
  };

  const handleApproveConditions = (id: string, conditions: string) => {
    setManagerApprovals((prev) => prev.map(a => a.id === id ? { ...a, status: 'Approved with Conditions', managerNotes: conditions } : a));
    addToast('info', 'Approved with Conditions', 'Conditions recorded and sent to employee.');
  };

  const handleRejectManager = (id: string, reason: string) => {
    setManagerApprovals((prev) => prev.map(a => a.id === id ? { ...a, status: 'Rejected', managerNotes: reason } : a));
    addToast('error', 'Request Rejected', 'Feedback delivered to employee.');
  };

  // Request Collaboration from Talent Directory
  const handleSendCollaborationRequest = (data: {
    talentId: string;
    taskTitle: string;
    estimatedHours: string;
    dates: string;
    notes: string;
  }) => {
    const target = talentProfiles.find(t => t.id === data.talentId);
    if (target) {
      addToast('success', 'Request Sent', `Collaboration proposal sent to ${target.name}.`);
    }
  };

  // Community Group Join/Leave
  const handleToggleJoinGroup = (groupId: string) => {
    setCommunityGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        const nextState = !g.isJoined;
        addToast('info', nextState ? 'Joined Guild' : 'Left Guild', `${g.name}`);
        return {
          ...g,
          isJoined: nextState,
          memberCount: g.memberCount + (nextState ? 1 : -1)
        };
      })
    );
  };

  // Question Upvote
  const handleUpvoteQuestion = (id: string) => {
    setKnowledgeQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, votes: q.votes + 1 } : q))
    );
  };

  // Add Answer to Question
  const handleAddAnswer = (questionId: string, text: string) => {
    const newAnswer = {
      id: 'ans_' + Date.now(),
      author: currentUser.name,
      role: currentUser.role,
      initials: currentUser.initials,
      time: 'Just now',
      timestamp: Date.now(),
      text,
      isAcceptedAnswer: false,
      votes: 1
    };

    setKnowledgeQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, answers: [...q.answers, newAnswer] } : q))
    );

    addToast('success', 'Answer Submitted', 'Your knowledge contribution is now public in the guild graph.');
  };

  // Ask Question Submission
  const handleCreateQuestion = (data: Partial<KnowledgeQuestion>) => {
    const newQ: KnowledgeQuestion = {
      id: 'q_' + Date.now(),
      title: data.title || 'Untitled Question',
      details: data.details || '',
      author: currentUser.name,
      authorRole: currentUser.role,
      initials: currentUser.initials,
      time: 'Just now',
      timestamp: Date.now(),
      tags: data.tags || ['DevOps'],
      votes: 1,
      hasAcceptedAnswer: false,
      answers: []
    };

    setKnowledgeQuestions((prev) => [newQ, ...prev]);
    setActiveTab('community');
    addToast('success', 'Question Published', 'Mercedes-Benz engineering guilds have been notified.');
  };

  // Submit New Marketplace Listing
  const handleCreateListing = (data: Partial<MarketListing>) => {
    const newId = Math.max(0, ...listings.map(l => l.id)) + 1;

    const newListing: MarketListing = {
      id: newId,
      title: data.title || 'Untitled Item',
      price: data.price || 0,
      currency: '€',
      category: data.category || 'Other',
      condition: data.condition || 'Used',
      location: data.location || currentUser.campus,
      time: 'Just now',
      timestamp: Date.now(),
      seller: currentUser.name,
      sellerRole: currentUser.role,
      initials: currentUser.initials,
      description: data.description || '',
      specs: data.specs,
      contacted: false,
      bookmarked: false
    };

    setListings((prev) => [newListing, ...prev]);
    setSelectedListingId(newId);
    setActiveTab('marketplace');
    addToast('success', 'Item Listed', 'Your listing is live on the Mercedes-Benz Campus Marketplace.');
  };

  // Submit New Community Notice / Post
  const handleCreateCommunityPost = (data: Partial<CommunityPost>) => {
    const newId = Math.max(0, ...communityPosts.map(p => p.id)) + 1;

    const newPost: CommunityPost = {
      id: newId,
      type: data.type || 'Notice',
      title: data.title || 'Untitled Notice',
      description: data.description || '',
      location: data.location || currentUser.campus,
      dateInfo: data.dateInfo,
      time: 'Just now',
      timestamp: Date.now(),
      author: currentUser.name,
      authorRole: currentUser.role,
      initials: currentUser.initials,
      contacted: false,
      bookmarked: false
    };

    setCommunityPosts((prev) => [newPost, ...prev]);
    setActiveTab('community');
    addToast('success', 'Notice Published', 'Your announcement is live on campus noticeboards.');
  };

  // Notifications
  const handleSelectNotification = (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
    setIsNotificationsOpen(false);

    if (item.targetTab === 'work' && item.targetId) {
      setActiveTab('work');
      setSelectedWorkId(item.targetId);
    } else if (item.targetTab === 'marketplace' && item.targetId) {
      setActiveTab('marketplace');
      setSelectedListingId(item.targetId);
    } else if (item.targetTab) {
      setActiveTab(item.targetTab);
    }
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    addToast('info', 'All caught up', 'Marked all notifications as read.');
  };

  // Saved items
  const savedWorkPosts = workPosts.filter((p) => p.bookmarked);
  const savedListings = listings.filter((l) => l.bookmarked);
  const savedCommunity = communityPosts.filter((c) => c.bookmarked);
  const totalSavedCount = savedWorkPosts.length + savedListings.length + savedCommunity.length;

  // Selected Detail Models
  const activeWorkPost = selectedWorkId
    ? workPosts.find((p) => p.id === selectedWorkId) || null
    : null;

  const activeListing = selectedListingId
    ? listings.find((l) => l.id === selectedListingId) || null
    : null;

  const pendingApprovalsCount = managerApprovals.filter(a => a.status === 'Pending').length;

  return (
    <div className="min-h-screen bg-[#0c0d10] text-slate-300 flex flex-col font-sans transition-colors selection:bg-indigo-500 selection:text-white">
      
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        currentUser={currentUser}
        onOpenRoleModal={() => setIsRoleModalOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenSaved={() => setIsSavedDrawerOpen(true)}
        notifications={notifications}
        savedCount={totalSavedCount}
        onOpenGlobalSearch={() => setIsGlobalSearchOpen(true)}
        onOpenCreateWork={() => setIsNewWorkOpen(true)}
        onOpenOfferBandwidth={() => setIsOfferBandwidthOpen(true)}
        onOpenCreateListing={() => setIsNewListingOpen(true)}
        onOpenAskQuestion={() => setIsAskQuestionOpen(true)}
        pendingApprovalsCount={pendingApprovalsCount}
      />

      {/* Main Content Body */}
      <main className="flex-1 pb-16">
        
        {/* 1. HOME DASHBOARD */}
        {activeTab === 'home' && (
          <HomeDashboard
            currentUser={currentUser}
            workPosts={workPosts}
            listings={listings}
            communities={communityGroups}
            questions={knowledgeQuestions}
            onNavigate={handleTabChange}
            onOpenWorkDetail={(id) => { setSelectedWorkId(id); setActiveTab('work'); }}
            onOpenListingDetail={(id) => { setSelectedListingId(id); setActiveTab('marketplace'); }}
            onOpenCreateWork={() => setIsNewWorkOpen(true)}
            onOpenOfferBandwidth={() => setIsOfferBandwidthOpen(true)}
            onOpenCreateListing={() => setIsNewListingOpen(true)}
            onOpenAskQuestion={() => setIsAskQuestionOpen(true)}
            onOpenApplyWork={handleApplyForGig}
          />
        )}

        {/* 2. WORK EXCHANGE */}
        {activeTab === 'work' && (
          activeWorkPost ? (
            <WorkDetail
              post={activeWorkPost}
              onBack={() => setSelectedWorkId(null)}
              onUpvote={handleUpvoteWork}
              onDownvote={handleDownvoteWork}
              onToggleBookmark={handleToggleWorkBookmark}
              onOfferHelp={handleApplyForGig}
              onAddComment={handleAddComment}
              onUpdateStatus={handleUpdateWorkStatus}
              currentUser={currentUser}
            />
          ) : (
            <WorkFeed
              posts={workPosts}
              bandwidthOffers={bandwidthOffers}
              onOpenPost={(id) => { setSelectedWorkId(id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              onOpenNewPost={() => setIsNewWorkOpen(true)}
              onOpenOfferBandwidth={() => setIsOfferBandwidthOpen(true)}
              onUpvote={handleUpvoteWork}
              onDownvote={handleDownvoteWork}
              onToggleBookmark={handleToggleWorkBookmark}
              onApplyForGig={handleApplyForGig}
              currentUser={currentUser}
            />
          )
        )}

        {/* 3. PEOPLE & SKILLS */}
        {activeTab === 'people' && (
          <PeopleSkillsView
            experts={talentProfiles}
            onRequestCollaboration={(talent) => setTargetCollaborationTalent(talent)}
            currentUser={currentUser}
          />
        )}

        {/* 4. MARKETPLACE */}
        {activeTab === 'marketplace' && (
          activeListing ? (
            <MarketDetail
              listing={activeListing}
              onBack={() => setSelectedListingId(null)}
              onToggleBookmark={handleToggleListingBookmark}
              onContactSeller={(listing) => {
                setContactDialog({
                  isOpen: true,
                  targetTitle: listing.title,
                  recipientName: listing.seller,
                  recipientRole: listing.sellerRole,
                  recipientInitials: listing.initials,
                  contextType: 'market',
                  onSuccessCallback: () => {
                    setListings(prev => prev.map(l => l.id === listing.id ? { ...l, contacted: true } : l));
                    addToast('success', 'Inquiry Sent', `Seller ${listing.seller} contacted.`);
                  }
                });
              }}
              currentUser={currentUser}
            />
          ) : (
            <MarketGrid
              listings={listings}
              onOpenListing={(id) => { setSelectedListingId(id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              onOpenNewListing={() => setIsNewListingOpen(true)}
              onToggleBookmark={handleToggleListingBookmark}
              onContactSeller={(listing) => {
                setContactDialog({
                  isOpen: true,
                  targetTitle: listing.title,
                  recipientName: listing.seller,
                  recipientRole: listing.sellerRole,
                  recipientInitials: listing.initials,
                  contextType: 'market',
                  onSuccessCallback: () => {
                    setListings(prev => prev.map(l => l.id === listing.id ? { ...l, contacted: true } : l));
                    addToast('success', 'Inquiry Sent', `Seller ${listing.seller} contacted.`);
                  }
                });
              }}
              currentUser={currentUser}
            />
          )
        )}

        {/* 5. COMMUNITIES & GUILDS */}
        {activeTab === 'community' && (
          <CommunityFeed
            groups={communityGroups}
            questions={knowledgeQuestions}
            posts={communityPosts}
            onToggleJoinGroup={handleToggleJoinGroup}
            onUpvoteQuestion={handleUpvoteQuestion}
            onAddAnswer={handleAddAnswer}
            onOpenAskQuestion={() => setIsAskQuestionOpen(true)}
            onOpenNewPost={() => setIsNewCommunityOpen(true)}
            onContactPost={(post) => {
              setContactDialog({
                isOpen: true,
                targetTitle: post.title,
                recipientName: post.author,
                recipientRole: post.authorRole,
                recipientInitials: post.initials,
                contextType: 'community',
                onSuccessCallback: () => {
                  setCommunityPosts(prev => prev.map(p => p.id === post.id ? { ...p, contacted: true } : p));
                  addToast('success', 'Message Sent', `Connected with ${post.author}.`);
                }
              });
            }}
            currentUser={currentUser}
          />
        )}

        {/* 6. ENTERPRISE INSIGHTS & HEATMAP */}
        {activeTab === 'insights' && (
          <EnterpriseInsightsView />
        )}

        {/* 7. MANAGER INBOX */}
        {activeTab === 'manager' && (
          <ManagerInboxView
            approvals={managerApprovals}
            onApprove={handleApproveManager}
            onApproveWithConditions={handleApproveConditions}
            onReject={handleRejectManager}
            currentUser={currentUser}
          />
        )}

        {/* 8. MY XCHANGE */}
        {activeTab === 'myxchange' && (
          <MyXchangeView
            currentUser={currentUser}
            onUpdateAvailability={(hours, text) => {
              setCurrentUser(prev => ({
                ...prev,
                currentAvailabilityHoursThisWeek: hours,
                typicalAvailability: text
              }));
              addToast('success', 'Bandwidth Updated', `Your declared availability is now "${text}".`);
            }}
          />
        )}

      </main>

      {/* Corporate Footer */}
      <footer className="border-t border-[#21242c] py-6 bg-[#0c0d10] text-slate-500 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-indigo-600 shadow-sm text-white font-black text-[10px] flex items-center justify-center">
              MB
            </div>
            <span className="font-semibold text-slate-300">MBXchange — Mercedes-Benz Internal Marketplace</span>
            <span>· Enterprise Talent & Skills Graph</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsRoleModalOpen(true)}
              className="text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
            >
              Active Persona: {currentUser.name} ({currentUser.role})
            </button>
            <span>·</span>
            <span>Campus: {currentUser.campus}</span>
            <span>·</span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
              Encrypted Corporate Gateway
            </span>
          </div>
        </div>
      </footer>

      {/* Global Search Modal (Cmd+K / Omnibox) */}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        experts={talentProfiles}
        workPosts={workPosts}
        listings={listings}
        communities={communityGroups}
        questions={knowledgeQuestions}
        onSelectPerson={(person) => {
          setTargetCollaborationTalent(person);
        }}
        onSelectWork={(id) => {
          setSelectedWorkId(id);
          setActiveTab('work');
        }}
        onSelectListing={(id) => {
          setSelectedListingId(id);
          setActiveTab('marketplace');
        }}
        onSelectCommunity={(groupId) => {
          setActiveTab('community');
        }}
      />

      {/* Request Collaboration Modal */}
      <RequestCollaborationModal
        isOpen={!!targetCollaborationTalent}
        onClose={() => setTargetCollaborationTalent(null)}
        targetTalent={targetCollaborationTalent}
        onSubmit={handleSendCollaborationRequest}
        currentUser={currentUser}
      />

      {/* Bandwidth Offer Modal */}
      <BandwidthOfferModal
        isOpen={isOfferBandwidthOpen}
        onClose={() => setIsOfferBandwidthOpen(false)}
        onSubmit={handleCreateBandwidthOffer}
        currentUser={currentUser}
      />

      {/* Role / Persona Switcher Modal */}
      <RoleSelectorModal
        isModal={true}
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        currentUser={currentUser}
        onSelectTalent={(talent) => {
          setCurrentUser(talent);
          setIsRoleModalOpen(false);
          addToast('success', 'Profile Switched', `Logged in as ${talent.name} (${talent.role}).`);
        }}
      />

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onSelectNotification={handleSelectNotification}
      />

      {/* Saved Drawer */}
      <SavedDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        savedWorkPosts={savedWorkPosts}
        savedListings={savedListings}
        savedCommunityPosts={savedCommunity}
        onOpenWork={(id) => { setSelectedWorkId(id); setActiveTab('work'); setIsSavedDrawerOpen(false); }}
        onOpenListing={(id) => { setSelectedListingId(id); setActiveTab('marketplace'); setIsSavedDrawerOpen(false); }}
        onOpenCommunity={(id) => { setActiveTab('community'); setIsSavedDrawerOpen(false); }}
        onToggleWorkBookmark={handleToggleWorkBookmark}
        onToggleListingBookmark={handleToggleListingBookmark}
      />

      {/* Work Requirement Modal (I Need Help) */}
      <WorkNewModal
        isOpen={isNewWorkOpen}
        onClose={() => setIsNewWorkOpen(false)}
        onSubmit={handleCreateWorkPost}
        currentUser={currentUser}
      />

      {/* Marketplace Item New Modal */}
      <MarketNewModal
        isOpen={isNewListingOpen}
        onClose={() => setIsNewListingOpen(false)}
        onSubmit={handleCreateListing}
        currentUser={currentUser}
      />

      {/* Community Notice New Modal */}
      <CommunityNewModal
        isOpen={isNewCommunityOpen}
        onClose={() => setIsNewCommunityOpen(false)}
        onSubmit={handleCreateCommunityPost}
        currentUser={currentUser}
      />

      {/* Ask Question Modal */}
      <AskQuestionModal
        isOpen={isAskQuestionOpen}
        onClose={() => setIsAskQuestionOpen(false)}
        onSubmit={handleCreateQuestion}
        currentUser={currentUser}
      />

      {/* Generic Contact Dialog */}
      <ContactDialog
        isOpen={contactDialog.isOpen}
        onClose={() => setContactDialog((prev) => ({ ...prev, isOpen: false }))}
        targetTitle={contactDialog.targetTitle}
        recipientName={contactDialog.recipientName}
        recipientRole={contactDialog.recipientRole}
        recipientInitials={contactDialog.recipientInitials}
        contextType={contactDialog.contextType}
        currentUser={currentUser}
        onSend={(msg) => {
          if (contactDialog.onSuccessCallback) {
            contactDialog.onSuccessCallback();
          }
        }}
      />

    </div>
  );
}
