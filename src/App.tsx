import React, { useState, useEffect, useMemo } from 'react';
import { 
  MainTab, 
  TalentProfile, 
  UserAccount,
  WorkPost, 
  MarketListing, 
  CommunityPost, 
  CommunityGroup,
  KnowledgeQuestion,
  BandwidthOffer,
  ManagerApprovalItem,
  CapabilityHeatmapItem,
  NotificationItem, 
  WorkStatus,
  DirectMessage,
  CollaborationRequest,
  UserSavedMap,
  CarpoolRide
} from './types';
import { 
  INITIAL_USER_ACCOUNTS,
  INITIAL_TALENT_PROFILES,
  INITIAL_WORK_POSTS, 
  INITIAL_BANDWIDTH_OFFERS,
  INITIAL_COMMUNITY_GROUPS,
  INITIAL_KNOWLEDGE_QUESTIONS,
  INITIAL_LISTINGS, 
  INITIAL_COMMUNITY_POSTS, 
  INITIAL_MANAGER_APPROVALS,
  INITIAL_CAPABILITY_HEATMAP,
  INITIAL_NOTIFICATIONS,
  INITIAL_DIRECT_MESSAGES,
  INITIAL_COLLABORATION_REQUESTS,
  INITIAL_USER_SAVED_MAP,
  INITIAL_CARPOOL_RIDES
} from './data/initialData';

// UI Components
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { RoleSelectorModal } from './components/RoleSelectorModal';
import { NotificationsModal } from './components/NotificationsModal';
import { SavedDrawer } from './components/SavedDrawer';
import { ContactDialog } from './components/ContactDialog';
import { UserProfileDrawer } from './components/UserProfileDrawer';
import { DirectMessagesDrawer } from './components/DirectMessagesDrawer';
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
import { CarpoolView } from './components/carpool/CarpoolView';
import { OfferRideModal } from './components/carpool/OfferRideModal';
import { EnterpriseInsightsView } from './components/insights/EnterpriseInsightsModal';
import { ManagerInboxView } from './components/manager/ManagerInboxModal';
import { MyXchangeView } from './components/myXchange/MyXchangeModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [activeMessagePartnerId, setActiveMessagePartnerId] = useState<string | undefined>(undefined);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [isNewWorkOpen, setIsNewWorkOpen] = useState(false);
  const [isOfferBandwidthOpen, setIsOfferBandwidthOpen] = useState(false);
  const [isOfferRideOpen, setIsOfferRideOpen] = useState(false);
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
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>(() => {
    const loaded = safeGetArray<UserAccount>('mbx_user_accounts', INITIAL_USER_ACCOUNTS);
    return loaded.map(u => {
      const match = INITIAL_USER_ACCOUNTS.find(init => init.id === u.id);
      return {
        ...(match || {}),
        ...u,
        systemRole: (u.systemRole || match?.systemRole || 'employee')
      };
    });
  });

  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    const saved = safeGetObject<UserAccount | null>('mbx_current_user', null);
    if (saved && saved.id) {
      const match = INITIAL_USER_ACCOUNTS.find(init => init.id === saved.id);
      return {
        ...(match || INITIAL_USER_ACCOUNTS[0]),
        ...saved,
        systemRole: (saved.systemRole || match?.systemRole || 'employee')
      };
    }
    return INITIAL_USER_ACCOUNTS[0];
  });

  const [directMessages, setDirectMessages] = useState<DirectMessage[]>(() => {
    return safeGetArray('mbx_direct_messages', INITIAL_DIRECT_MESSAGES);
  });

  const [collabRequests, setCollabRequests] = useState<CollaborationRequest[]>(() => {
    return safeGetArray('mbx_collab_requests', INITIAL_COLLABORATION_REQUESTS);
  });

  const [userSavedMap, setUserSavedMap] = useState<UserSavedMap>(() => {
    return safeGetObject('mbx_user_saved_map', INITIAL_USER_SAVED_MAP);
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

  const [carpoolRides, setCarpoolRides] = useState<CarpoolRide[]>(() => {
    return safeGetArray('mbx_carpool_rides', INITIAL_CARPOOL_RIDES);
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    return safeGetArray('mbx_notifications', INITIAL_NOTIFICATIONS);
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('mbx_user_accounts', JSON.stringify(userAccounts));
  }, [userAccounts]);

  useEffect(() => {
    localStorage.setItem('mbx_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('mbx_direct_messages', JSON.stringify(directMessages));
  }, [directMessages]);

  useEffect(() => {
    localStorage.setItem('mbx_collab_requests', JSON.stringify(collabRequests));
  }, [collabRequests]);

  useEffect(() => {
    localStorage.setItem('mbx_user_saved_map', JSON.stringify(userSavedMap));
  }, [userSavedMap]);

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
    localStorage.setItem('mbx_carpool_rides', JSON.stringify(carpoolRides));
  }, [carpoolRides]);

  useEffect(() => {
    localStorage.setItem('mbx_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Derived user-specific counts & filtering
  const userSavedData = userSavedMap[currentUser.id] || { workIds: [], listingIds: [], communityIds: [], carpoolIds: [] };
  const savedCount = (userSavedData.workIds?.length || 0) + (userSavedData.listingIds?.length || 0) + (userSavedData.communityIds?.length || 0) + (userSavedData.carpoolIds?.length || 0);

  const unreadMessagesCount = useMemo(() => {
    return directMessages.filter(m => m.recipientId === currentUser.id && !m.read).length;
  }, [directMessages, currentUser.id]);

  const userNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (!n.recipientId && !n.recipientRole) return true;
      if (n.recipientId === currentUser.id) return true;
      if (n.recipientRole === 'all') return true;
      if (n.recipientRole === currentUser.systemRole) return true;
      if (currentUser.systemRole === 'admin') return true;
      return false;
    });
  }, [notifications, currentUser.id, currentUser.systemRole]);

  const pendingApprovalsCount = useMemo(() => {
    if (currentUser.systemRole === 'manager') {
      const directReportIds = currentUser.directReportIds || [];
      return managerApprovals.filter(a => {
        if (a.status !== 'Pending') return false;
        if (a.managerId === currentUser.id) return true;
        if (a.employeeId && directReportIds.includes(a.employeeId)) return true;
        return false;
      }).length;
    }
    if (currentUser.systemRole === 'admin') {
      return managerApprovals.filter(a => a.status === 'Pending').length;
    }
    return 0;
  }, [managerApprovals, currentUser.id, currentUser.systemRole, currentUser.directReportIds]);

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

  // Bookmark toggles with UserSavedMap sync
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

    setUserSavedMap(prev => {
      const current = prev[currentUser.id] || { workIds: [], listingIds: [], communityIds: [] };
      const exists = current.workIds.includes(id);
      const nextWorkIds = exists ? current.workIds.filter(wid => wid !== id) : [...current.workIds, id];
      return {
        ...prev,
        [currentUser.id]: {
          ...current,
          workIds: nextWorkIds
        }
      };
    });
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

    setUserSavedMap(prev => {
      const current = prev[currentUser.id] || { workIds: [], listingIds: [], communityIds: [], carpoolIds: [] };
      const exists = current.listingIds.includes(id);
      const nextListingIds = exists ? current.listingIds.filter(lid => lid !== id) : [...current.listingIds, id];
      return {
        ...prev,
        [currentUser.id]: {
          ...current,
          listingIds: nextListingIds
        }
      };
    });
  };

  const handleToggleCarpoolBookmark = (id: string) => {
    setCarpoolRides((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const nextBookmarked = !r.bookmarked;
        addToast(
          'info',
          nextBookmarked ? 'Ride Saved' : 'Route Removed',
          `"${r.origin} → ${r.destination}"`
        );
        return { ...r, bookmarked: nextBookmarked };
      })
    );

    setUserSavedMap(prev => {
      const current = prev[currentUser.id] || { workIds: [], listingIds: [], communityIds: [], carpoolIds: [] };
      const carpoolIds = current.carpoolIds || [];
      const exists = carpoolIds.includes(id);
      const nextCarpoolIds = exists ? carpoolIds.filter(cid => cid !== id) : [...carpoolIds, id];
      return {
        ...prev,
        [currentUser.id]: {
          ...current,
          carpoolIds: nextCarpoolIds
        }
      };
    });
  };

  // Carpool Actions
  const handleCreateCarpoolRide = (rideData: Partial<CarpoolRide>) => {
    const newRide: CarpoolRide = {
      id: 'ride_' + Date.now(),
      driverId: currentUser.id,
      driverName: currentUser.name,
      driverRole: currentUser.role,
      driverDepartment: currentUser.department,
      driverInitials: currentUser.initials,
      origin: rideData.origin || 'Whitefield',
      destination: rideData.destination || 'MBRDI Facility',
      campus: rideData.campus || currentUser.campus,
      departureTime: rideData.departureTime || '08:30 AM',
      returnTime: rideData.returnTime,
      daysOfWeek: rideData.daysOfWeek || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      totalSeats: rideData.totalSeats || 3,
      availableSeats: rideData.availableSeats || 3,
      vehicleModel: rideData.vehicleModel || 'Mercedes-Benz EQA 250+',
      vehicleType: rideData.vehicleType || 'Electric (EV)',
      routeHighlights: rideData.routeHighlights || [],
      amenities: rideData.amenities || ['EV Zero Emissions', 'Climate Control AC'],
      contributionType: rideData.contributionType || 'Free / Company Eco-Pass',
      costPerRide: rideData.costPerRide || 'Free',
      womenOnly: rideData.womenOnly || false,
      notes: rideData.notes || '',
      status: 'active',
      passengers: []
    };
    setCarpoolRides(prev => [newRide, ...prev]);
    setIsOfferRideOpen(false);
    addToast('success', 'Ride Offered', 'Your carpool listing is live for colleagues.');
  };

  const handleBookCarpoolSeat = (rideId: string) => {
    setCarpoolRides(prev => prev.map(ride => {
      if (ride.id !== rideId) return ride;
      if (ride.availableSeats <= 0) {
        addToast('error', 'Ride Full', 'No available seats remain on this route.');
        return ride;
      }
      if (ride.passengers?.some(p => p.id === currentUser.id)) {
        addToast('info', 'Already Booked', 'You already have a seat reserved on this ride.');
        return ride;
      }
      const newPassenger = {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
        initials: currentUser.initials,
        pickupLocation: ride.origin,
        bookedAt: 'Just now'
      };
      addToast('success', 'Seat Reserved!', `You're riding with ${ride.driverName} (${ride.origin} → ${ride.destination}).`);
      return {
        ...ride,
        availableSeats: ride.availableSeats - 1,
        passengers: [...(ride.passengers || []), newPassenger]
      };
    }));
  };

  const handleCancelCarpoolSeat = (rideId: string) => {
    setCarpoolRides(prev => prev.map(ride => {
      if (ride.id !== rideId) return ride;
      const filtered = (ride.passengers || []).filter(p => p.id !== currentUser.id);
      addToast('info', 'Booking Cancelled', 'Your seat has been released.');
      return {
        ...ride,
        availableSeats: Math.min(ride.totalSeats, ride.availableSeats + 1),
        passengers: filtered
      };
    }));
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

  // Apply / Offer Help on Work Post
  const handleApplyForGig = (post: WorkPost) => {
    setWorkPosts((prev) =>
      prev.map((p) => {
        if (p.id !== post.id) return p;
        return {
          ...p,
          hasApplied: true,
          applicantCount: (p.applicantCount || 0) + 1
        };
      })
    );

    // If manager approval required, generate approval item
    if (post.managerApprovalRequired) {
      const newApproval: ManagerApprovalItem = {
        id: 'app_' + Date.now(),
        employeeId: currentUser.id,
        employeeName: currentUser.name,
        employeeRole: currentUser.role,
        employeeDepartment: currentUser.department,
        managerId: currentUser.managerId,
        opportunityId: post.id,
        opportunityTitle: post.title,
        targetDepartment: post.department,
        requestedCommitment: post.duration || '8 hours',
        period: 'Upcoming sprint',
        currentProject: 'Vehicle Electronics & Powertrain Delivery',
        aiRecommendation: 'Approve',
        aiRecommendationReason: `${currentUser.name} has 6h available capacity this sprint. Cross-department skill alignment with ${post.department} is high (92%).`,
        status: 'Pending',
        requestedAt: 'Just now'
      };

      setManagerApprovals((prev) => [newApproval, ...prev]);

      // Add notification for manager
      const newNotification: NotificationItem = {
        id: 'n_' + Date.now(),
        recipientId: currentUser.managerId,
        recipientRole: 'manager',
        type: 'manager_approval',
        title: 'New Cross-Department Mobility Request',
        description: `${currentUser.name} requested approval to support "${post.title}" (${post.department}).`,
        time: 'Just now',
        timestamp: Date.now(),
        read: false,
        targetTab: 'manager'
      };

      setNotifications((prev) => [newNotification, ...prev]);

      addToast(
        'info',
        'Manager Approval Initiated',
        `Request sent to your manager ${currentUser.managerName || 'for review'}.`
      );
    } else {
      addToast(
        'success',
        'Support Offer Registered',
        `The author ${post.author} has been notified of your peer availability.`
      );
    }
  };

  // Create Work Post
  const handleCreateWorkPost = (newPostData: Partial<WorkPost>) => {
    const newId = Date.now();
    const newPost: WorkPost = {
      id: newId,
      title: newPostData.title || 'Untitled Opportunity',
      department: newPostData.department || currentUser.department,
      status: 'Open',
      urgency: newPostData.urgency || 'Medium',
      duration: newPostData.duration || '1–2 days',
      expectedEffortHours: newPostData.expectedEffortHours || '8–12 hours',
      location: newPostData.location || 'Remote / Hybrid',
      managerApprovalRequired: newPostData.managerApprovalRequired ?? true,
      votes: 1,
      voteState: 1,
      tags: newPostData.tags || ['Automotive'],
      author: currentUser.name,
      authorId: currentUser.id,
      role: currentUser.role,
      initials: currentUser.initials,
      time: 'Just now',
      timestamp: Date.now(),
      description: newPostData.description || '',
      whyOpportunity: newPostData.whyOpportunity || '',
      comments: [],
      matchScore: 92,
      matchReason: 'High domain synergy with engineering skill graph.'
    };

    setWorkPosts((prev) => [newPost, ...prev]);
    setIsNewWorkOpen(false);
    addToast('success', 'Requirement Published', 'Your engineering requirement is live across departments.');
  };

  // Create Bandwidth Offer
  const handleCreateBandwidthOffer = (data: { availableHours: string; skillsOffered: string[]; notes: string }) => {
    const newOffer: BandwidthOffer = {
      id: 'bo_' + Date.now(),
      author: currentUser.name,
      authorId: currentUser.id,
      role: currentUser.role,
      department: currentUser.department,
      initials: currentUser.initials,
      availableHours: data.availableHours,
      skillsOffered: data.skillsOffered,
      notes: data.notes,
      time: 'Just now',
      timestamp: Date.now()
    };

    setBandwidthOffers((prev) => [newOffer, ...prev]);
    setIsOfferBandwidthOpen(false);
    addToast('success', 'Bandwidth Registered', 'Your available hours are visible to all squads.');
  };

  // Create Marketplace Listing
  const handleCreateListing = (data: Partial<MarketListing>) => {
    const newListing: MarketListing = {
      id: Date.now(),
      title: data.title || 'Marketplace Item',
      price: data.price || 0,
      currency: '₹',
      isFree: data.isFree || false,
      category: data.category || 'Other',
      condition: data.condition || 'Used - Excellent',
      location: data.location || currentUser.campus,
      time: 'Just now',
      timestamp: Date.now(),
      seller: currentUser.name,
      sellerId: currentUser.id,
      sellerRole: currentUser.role,
      initials: currentUser.initials,
      description: data.description || '',
      specs: data.specs || {}
    };

    setListings((prev) => [newListing, ...prev]);
    setIsNewListingOpen(false);
    addToast('success', 'Item Posted', 'Your listing is now active in the internal marketplace.');
  };

  // Create Community Post
  const handleCreateCommunityPost = (data: Partial<CommunityPost>) => {
    const newPost: CommunityPost = {
      id: Date.now(),
      type: data.type || 'Notice',
      title: data.title || 'Community Update',
      description: data.description || '',
      author: currentUser.name,
      authorId: currentUser.id,
      authorRole: currentUser.role,
      initials: currentUser.initials,
      location: currentUser.campus,
      dateInfo: 'Active today',
      time: 'Just now',
      timestamp: Date.now(),
      repliesCount: 0
    };

    setCommunityPosts((prev) => [newPost, ...prev]);
    setIsNewCommunityOpen(false);
    addToast('success', 'Community Post Shared', 'Your discussion is live.');
  };

  // Create Knowledge Question
  const handleCreateQuestion = (data: { title: string; details: string; tags: string[] }) => {
    const newQuestion: KnowledgeQuestion = {
      id: 'q_' + Date.now(),
      title: data.title,
      details: data.details,
      author: currentUser.name,
      authorId: currentUser.id,
      authorRole: currentUser.role,
      initials: currentUser.initials,
      tags: data.tags,
      votes: 1,
      time: 'Just now',
      timestamp: Date.now(),
      answers: [],
      hasAcceptedAnswer: false
    };

    setKnowledgeQuestions((prev) => [newQuestion, ...prev]);
    setIsAskQuestionOpen(false);
    addToast('success', 'Question Posted', 'Engineering community guilds notified.');
  };

  // Answer Knowledge Question
  const handleAddAnswer = (questionId: string, text: string) => {
    const newAnswer = {
      id: 'ans_' + Date.now(),
      author: currentUser.name,
      role: currentUser.role,
      initials: currentUser.initials,
      time: 'Just now',
      timestamp: Date.now(),
      text,
      likes: 0
    };

    setKnowledgeQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, answers: [...q.answers, newAnswer] } : q))
    );

    addToast('success', 'Answer Submitted', 'Your technical insight has been posted.');
  };

  const handleUpvoteQuestion = (questionId: string) => {
    setKnowledgeQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, votes: q.votes + 1 } : q))
    );
  };

  const handleToggleJoinGroup = (groupId: string) => {
    setCommunityGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        const nextJoined = !g.isJoined;
        addToast('info', nextJoined ? 'Joined Community' : 'Left Community', g.name);
        return {
          ...g,
          isJoined: nextJoined,
          memberCount: nextJoined ? g.memberCount + 1 : g.memberCount - 1
        };
      })
    );
  };

  // Direct Messaging Handlers
  const handleSendDirectMessage = (
    recipientId: string, 
    text: string, 
    contextTitle?: string, 
    contextType?: 'work' | 'market' | 'community' | 'collab' | 'general'
  ) => {
    const recipient = userAccounts.find(u => u.id === recipientId);
    if (!recipient) return;

    const newMsg: DirectMessage = {
      id: 'msg_' + Date.now(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderInitials: currentUser.initials,
      senderRole: currentUser.role,
      recipientId: recipient.id,
      recipientName: recipient.name,
      recipientInitials: recipient.initials,
      recipientRole: recipient.role,
      text,
      timestamp: Date.now(),
      time: 'Just now',
      read: false,
      contextTitle,
      contextType: contextType || 'general'
    };

    setDirectMessages(prev => [...prev, newMsg]);

    // Send notification to recipient
    const newNotif: NotificationItem = {
      id: 'notif_' + Date.now(),
      recipientId: recipient.id,
      type: 'direct_message',
      title: `New Message from ${currentUser.name}`,
      description: text.slice(0, 60),
      time: 'Just now',
      timestamp: Date.now(),
      read: false
    };

    setNotifications(prev => [newNotif, ...prev]);
    addToast('success', 'Message Sent', `Direct message sent to ${recipient.name}.`);
  };

  const handleMarkConversationRead = (partnerId: string) => {
    setDirectMessages(prev => prev.map(m => {
      if (m.senderId === partnerId && m.recipientId === currentUser.id) {
        return { ...m, read: true };
      }
      return m;
    }));
  };

  // Collaboration Request Handler
  const handleSendCollaborationRequest = (data: {
    targetTalent: TalentProfile;
    taskTitle: string;
    estimatedHours: string;
    dates: string;
    notes: string;
  }) => {
    const newRequest: CollaborationRequest = {
      id: 'cr_' + Date.now(),
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      requesterRole: currentUser.role,
      requesterDepartment: currentUser.department,
      targetTalentId: data.targetTalent.id,
      targetTalentName: data.targetTalent.name,
      targetDepartment: data.targetTalent.department,
      taskTitle: data.taskTitle,
      estimatedHours: data.estimatedHours,
      dates: data.dates,
      notes: data.notes,
      status: 'pending',
      timestamp: Date.now(),
      time: 'Just now'
    };

    setCollabRequests(prev => [newRequest, ...prev]);

    // Send Notification to Target Talent
    const newNotif: NotificationItem = {
      id: 'notif_cr_' + Date.now(),
      recipientId: data.targetTalent.id,
      type: 'collab_request',
      title: 'New Collaboration Request',
      description: `${currentUser.name} requested your help for "${data.taskTitle}" (${data.estimatedHours}).`,
      time: 'Just now',
      timestamp: Date.now(),
      read: false,
      targetTab: 'people'
    };

    setNotifications(prev => [newNotif, ...prev]);
    setTargetCollaborationTalent(null);
    addToast(
      'success',
      'Collaboration Request Sent',
      `Proposal sent to ${data.targetTalent.name}.`
    );
  };

  const handleUpdateCollabStatus = (requestId: string, status: 'accepted' | 'declined' | 'completed') => {
    setCollabRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return { ...r, status };
      }
      return r;
    }));

    addToast('success', 'Collaboration Updated', `Engagement marked as "${status}".`);
  };

  // Manager Approval Actions
  const handleApproveManager = (id: string, notes?: string) => {
    setManagerApprovals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'Approved', managerNotes: notes } : a))
    );
    addToast('success', 'Mobility Approved', 'Employee capacity allocated for cross-department gig.');
  };

  const handleApproveConditions = (id: string, conditions: string) => {
    setManagerApprovals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'Approved with Conditions', managerNotes: conditions } : a))
    );
    addToast('info', 'Approved with Conditions', 'Conditions recorded in mobility log.');
  };

  const handleRejectManager = (id: string, reason: string) => {
    setManagerApprovals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'Rejected', managerNotes: reason } : a))
    );
    addToast('error', 'Request Declined', 'Notification dispatched to squad member.');
  };

  // Notifications Handlers
  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    addToast('info', 'Notifications Cleared', 'All unread alerts marked as read.');
  };

  const handleSelectNotification = (item: NotificationItem) => {
    setNotifications((prev) => prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)));
    setIsNotificationsOpen(false);
    if (item.targetTab) {
      handleTabChange(item.targetTab);
    }
  };

  // Saved Drawer Items
  const savedWorkPosts = workPosts.filter((p) => userSavedData.workIds?.includes(p.id) || p.bookmarked);
  const savedListings = listings.filter((l) => userSavedData.listingIds?.includes(l.id) || l.bookmarked);
  const savedCommunity = communityPosts.filter((c) => userSavedData.communityIds?.includes(c.id) || c.bookmarked);

  // Active Detail Views
  const activeWorkPost = workPosts.find((p) => p.id === selectedWorkId);
  const activeListing = listings.find((l) => l.id === selectedListingId);

  return (
    <div className="min-h-screen bg-[#08090c] text-slate-200 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} onRemoveToast={removeToast} />

      {/* Global Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        currentUser={currentUser}
        onOpenRoleModal={() => setIsRoleModalOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenMessages={() => setIsMessagesOpen(true)}
        unreadMessagesCount={unreadMessagesCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenSaved={() => setIsSavedDrawerOpen(true)}
        notifications={userNotifications}
        savedCount={savedCount}
        onOpenGlobalSearch={() => setIsGlobalSearchOpen(true)}
        onOpenCreateWork={() => setIsNewWorkOpen(true)}
        onOpenOfferBandwidth={() => setIsOfferBandwidthOpen(true)}
        onOpenOfferRide={() => setIsOfferRideOpen(true)}
        onOpenCreateListing={() => setIsNewListingOpen(true)}
        onOpenAskQuestion={() => setIsAskQuestionOpen(true)}
        pendingApprovalsCount={pendingApprovalsCount}
      />

      {/* Main Container with Left Top-to-Down Sidebar and Content */}
      <div className="flex-1 w-full flex">
        {/* Left Top-to-Down Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          currentUser={currentUser}
          pendingApprovalsCount={pendingApprovalsCount}
          unreadMessagesCount={unreadMessagesCount}
          unreadNotificationsCount={userNotifications.filter(n => !n.read).length}
          savedCount={savedCount}
          onOpenCreateWork={() => setIsNewWorkOpen(true)}
          onOpenOfferBandwidth={() => setIsOfferBandwidthOpen(true)}
          onOpenOfferRide={() => setIsOfferRideOpen(true)}
          onOpenCreateListing={() => setIsNewListingOpen(true)}
          onOpenAskQuestion={() => setIsAskQuestionOpen(true)}
          onOpenSaved={() => setIsSavedDrawerOpen(true)}
          onOpenMessages={() => setIsMessagesOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenRoleModal={() => setIsRoleModalOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 w-full max-w-[1720px] 2xl:max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 py-6 mb-16 md:mb-0">
        
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
            experts={userAccounts}
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
                const sellerUser = userAccounts.find(u => u.name === listing.seller || u.id === listing.sellerId);
                if (sellerUser) {
                  setActiveMessagePartnerId(sellerUser.id);
                  setIsMessagesOpen(true);
                } else {
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
                }
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
                const sellerUser = userAccounts.find(u => u.name === listing.seller || u.id === listing.sellerId);
                if (sellerUser) {
                  setActiveMessagePartnerId(sellerUser.id);
                  setIsMessagesOpen(true);
                } else {
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
                }
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
              const authorUser = userAccounts.find(u => u.name === post.author || u.id === post.authorId);
              if (authorUser) {
                setActiveMessagePartnerId(authorUser.id);
                setIsMessagesOpen(true);
              } else {
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
              }
            }}
            currentUser={currentUser}
          />
        )}

        {/* 6. CARPOOL & RIDES */}
        {activeTab === 'carpool' && (
          <CarpoolView
            rides={carpoolRides}
            onOfferRide={() => setIsOfferRideOpen(true)}
            onBookSeat={handleBookCarpoolSeat}
            onCancelBooking={handleCancelCarpoolSeat}
            onContactDriver={(ride) => {
              const driverUser = userAccounts.find(u => u.id === ride.driverId || u.name === ride.driverName);
              if (driverUser) {
                setActiveMessagePartnerId(driverUser.id);
                setIsMessagesOpen(true);
              } else {
                setContactDialog({
                  isOpen: true,
                  targetTitle: `Carpool: ${ride.origin} → ${ride.destination}`,
                  recipientName: ride.driverName,
                  recipientRole: ride.driverRole,
                  recipientInitials: ride.driverInitials,
                  contextType: 'community',
                  onSuccessCallback: () => {
                    addToast('success', 'Message Sent', `Connected with driver ${ride.driverName}.`);
                  }
                });
              }
            }}
            onToggleBookmark={handleToggleCarpoolBookmark}
            savedRideIds={userSavedData.carpoolIds || []}
            currentUser={currentUser}
          />
        )}

        {/* 7. ENTERPRISE INSIGHTS & HEATMAP */}
        {activeTab === 'insights' && (
          <EnterpriseInsightsView />
        )}

        {/* 8. MANAGER INBOX */}
        {activeTab === 'manager' && (
          <ManagerInboxView
            approvals={managerApprovals}
            onApprove={handleApproveManager}
            onApproveWithConditions={handleApproveConditions}
            onReject={handleRejectManager}
            currentUser={currentUser}
            allUsers={userAccounts}
            onOpenMessageWith={(userId) => {
              setActiveMessagePartnerId(userId);
              setIsMessagesOpen(true);
            }}
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
              setUserAccounts(prev => prev.map(u => u.id === currentUser.id ? {
                ...u,
                currentAvailabilityHoursThisWeek: hours,
                typicalAvailability: text
              } : u));
              addToast('success', 'Bandwidth Updated', `Your declared availability is now "${text}".`);
            }}
          />
        )}

        {/* 9. ADMIN GOVERNANCE CONSOLE */}
        {activeTab === 'admin' && (
          <AdminDashboard
            currentUser={currentUser}
            users={userAccounts}
            onUpdateUsers={(updated) => setUserAccounts(updated)}
            onSelectUserForSession={(user) => {
              setCurrentUser(user);
              addToast('success', 'Session Switched', `Now operating as ${user.name} (${user.systemRole}).`);
            }}
            collabRequests={collabRequests}
            workPosts={workPosts}
            managerApprovals={managerApprovals}
          />
        )}

        </main>
      </div>

      {/* Corporate Footer */}
      <footer className="border-t border-[#21242c] py-6 bg-[#0c0d10] text-slate-500 text-xs mt-auto">
        <div className="w-full max-w-[1720px] 2xl:max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
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
              Active Persona: {currentUser.name} ({(currentUser.systemRole || 'employee').toUpperCase()})
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
        experts={userAccounts}
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

      {/* User Profile Drawer */}
      <UserProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
        onUpdateCurrentUser={(updated) => {
          setCurrentUser(prev => ({ ...prev, ...updated }));
          setUserAccounts(prev => prev.map(u => u.id === currentUser.id ? { ...u, ...updated } : u));
          addToast('success', 'Profile Updated', 'Your profile details have been saved.');
        }}
        collabRequests={collabRequests}
        onUpdateCollabStatus={handleUpdateCollabStatus}
        workPosts={workPosts}
        marketListings={listings}
        bandwidthOffers={bandwidthOffers}
        directMessages={directMessages}
        onOpenMessageWith={(userId) => {
          setActiveMessagePartnerId(userId);
          setIsProfileOpen(false);
          setIsMessagesOpen(true);
        }}
      />

      {/* Direct Messages Drawer */}
      <DirectMessagesDrawer
        isOpen={isMessagesOpen}
        onClose={() => { setIsMessagesOpen(false); setActiveMessagePartnerId(undefined); }}
        currentUser={currentUser}
        allUsers={userAccounts}
        messages={directMessages}
        onSendMessage={handleSendDirectMessage}
        onMarkConversationRead={handleMarkConversationRead}
        selectedUserId={activeMessagePartnerId}
      />

      {/* Role / Persona Switcher Modal */}
      <RoleSelectorModal
        isModal={true}
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        currentUser={currentUser}
        allUsers={userAccounts}
        onSelectTalent={(talent) => {
          setCurrentUser(talent);
          setIsRoleModalOpen(false);
          addToast('success', 'Profile Switched', `Logged in as ${talent.name} (${talent.role} · ${(talent.systemRole || 'employee').toUpperCase()}).`);
        }}
      />

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={userNotifications}
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
        savedCarpoolRides={carpoolRides.filter((r) => userSavedData.carpoolIds?.includes(r.id) || r.bookmarked)}
        onOpenWork={(id) => { setSelectedWorkId(id); setActiveTab('work'); setIsSavedDrawerOpen(false); }}
        onOpenListing={(id) => { setSelectedListingId(id); setActiveTab('marketplace'); setIsSavedDrawerOpen(false); }}
        onOpenCommunity={(id) => { setActiveTab('community'); setIsSavedDrawerOpen(false); }}
        onOpenCarpool={(id) => { setActiveTab('carpool'); setIsSavedDrawerOpen(false); }}
        onToggleWorkBookmark={handleToggleWorkBookmark}
        onToggleListingBookmark={handleToggleListingBookmark}
        onToggleCarpoolBookmark={handleToggleCarpoolBookmark}
      />

      {/* Offer Ride Modal (Carpool) */}
      <OfferRideModal
        isOpen={isOfferRideOpen}
        onClose={() => setIsOfferRideOpen(false)}
        onSubmit={handleCreateCarpoolRide}
        currentUser={currentUser}
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
