export type UserRole =
  | 'Backend Developer'
  | 'Frontend Developer'
  | 'DevOps Engineer'
  | 'Lead DevOps Engineer'
  | 'Systems Engineer'
  | 'QA / Test Engineer'
  | 'Data Scientist'
  | 'AI / ML Engineer'
  | 'Product Manager'
  | 'Project Manager'
  | 'UX / UI Designer'
  | 'Business Analyst'
  | 'Embedded Engineer'
  | 'Cloud Architect'
  | 'Security Engineer'
  | 'Engineering Manager';

export type MBIDepartmentCode =
  | 'PT-THIA'
  | 'PT-THIS'
  | 'PT-THIT'
  | 'PT-THID'
  | 'PT-THIE'
  | 'PT-THIM'
  | 'PT-THIP'
  | 'PT-THIG'
  | 'PT-THIC'
  | 'PT-THIF';

export interface DepartmentInfo {
  code: MBIDepartmentCode;
  name: string;
  shortName: string;
  focus: string;
  color: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
  icon: string;
}

export const MBI_DEPARTMENTS: DepartmentInfo[] = [
  {
    code: 'PT-THIA',
    name: 'PT-THIA',
    shortName: 'PT-THIA',
    focus: 'AI/ML solutions, LLMs, GenAI, Knowledge Graphs, Data Architecture',
    color: 'purple',
    badgeBg: 'bg-purple-500/10',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    icon: 'Brain'
  },
  {
    code: 'PT-THIS',
    name: 'PT-THIS',
    shortName: 'PT-THIS',
    focus: 'Cloud infrastructure, DevOps, Kubernetes, CI/CD, Core backend services',
    color: 'indigo',
    badgeBg: 'bg-indigo-500/10',
    textColor: 'text-indigo-400',
    borderColor: 'border-indigo-500/30',
    icon: 'Server'
  },
  {
    code: 'PT-THIT',
    name: 'PT-THIT',
    shortName: 'PT-THIT',
    focus: 'Enterprise IT, Cloud platforms, Cyber security, Networking, Tooling',
    color: 'blue',
    badgeBg: 'bg-blue-500/10',
    textColor: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    icon: 'Cloud'
  },
  {
    code: 'PT-THID',
    name: 'PT-THID',
    shortName: 'PT-THID',
    focus: 'Business intelligence, Data pipelines, Telemetry analytics, Digitalization',
    color: 'cyan',
    badgeBg: 'bg-cyan-500/10',
    textColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/30',
    icon: 'BarChart3'
  },
  {
    code: 'PT-THIE',
    name: 'PT-THIE',
    shortName: 'PT-THIE',
    focus: 'ECU software, AUTOSAR, Firmware, In-vehicle networking, Telematics',
    color: 'emerald',
    badgeBg: 'bg-emerald-500/10',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    icon: 'Cpu'
  },
  {
    code: 'PT-THIM',
    name: 'PT-THIM',
    shortName: 'PT-THIM',
    focus: 'Digital twin, CAD/CAE simulation, Plant automation, Powertrain validation',
    color: 'amber',
    badgeBg: 'bg-amber-500/10',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    icon: 'Wrench'
  },
  {
    code: 'PT-THIP',
    name: 'PT-THIP',
    shortName: 'PT-THIP',
    focus: 'Agile transformation, Product ownership, Release governance, Portfolio',
    color: 'rose',
    badgeBg: 'bg-rose-500/10',
    textColor: 'text-rose-400',
    borderColor: 'border-rose-500/30',
    icon: 'Layers'
  },
  {
    code: 'PT-THIG',
    name: 'PT-THIG',
    shortName: 'PT-THIG',
    focus: 'Hardware-in-the-loop (HiL) rigs, dSPACE, automated test benches, system validation',
    color: 'teal',
    badgeBg: 'bg-teal-500/10',
    textColor: 'text-teal-400',
    borderColor: 'border-teal-500/30',
    icon: 'CheckCircle2'
  },
  {
    code: 'PT-THIC',
    name: 'PT-THIC',
    shortName: 'PT-THIC',
    focus: 'Powertrain controls, ECU calibration (INCA, CANape), motor control algorithms, connectivity',
    color: 'orange',
    badgeBg: 'bg-orange-500/10',
    textColor: 'text-orange-400',
    borderColor: 'border-orange-500/30',
    icon: 'Gauge'
  },
  {
    code: 'PT-THIF',
    name: 'PT-THIF',
    shortName: 'PT-THIF',
    focus: 'ISO 26262 functional safety, ASIL D safety concepts, fuel cell powertrains, HARA',
    color: 'red',
    badgeBg: 'bg-red-500/10',
    textColor: 'text-red-400',
    borderColor: 'border-red-500/30',
    icon: 'ShieldCheck'
  }
];

export const MBI_DEPARTMENT_CODES: MBIDepartmentCode[] = [
  'PT-THIA',
  'PT-THIS',
  'PT-THIT',
  'PT-THID',
  'PT-THIE',
  'PT-THIM',
  'PT-THIP',
  'PT-THIG',
  'PT-THIC',
  'PT-THIF'
];

export type WorkStatus = 'Open' | 'In Progress' | 'In progress' | 'In Review' | 'Resolved' | 'Completed' | 'Blocked';
export type UrgencyLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type GigDuration = '30 mins (Knowledge Session)' | '2 hours (Arch Review)' | '1 day (Support)' | '2–3 days (Short Gig)' | '1–2 weeks (Project)' | 'Flexible';
export type ContactPreference = 'reply' | 'email' | 'teams' | 'slack' | 'both' | 'direct';

export interface RatingBreakdown {
  helping: number;
  technicalExpertise: number;
  collaboration: number;
  reliability: number;
}

export interface ReputationBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
  dateEarned: string;
}

export interface TalentProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole | string;
  department: string;
  campus: string;
  avatarUrl?: string;
  initials: string;
  experienceYears: number;
  primarySkills: string[];
  interests: string[];
  availableFor: string[]; // e.g. ['Short Gigs', 'Architecture Review', 'Mentoring', 'DevOps Support']
  typicalAvailability: string; // e.g. '4–8 hours/month'
  currentAvailabilityHoursThisWeek: number;
  contributionScore: number; // e.g. 4.82
  ratingBreakdown: RatingBreakdown;
  badges: ReputationBadge[];
  collaborationsCount: number;
  departmentsSupportedCount: number;
  peopleHelpedCount: number;
  hoursContributed: number;
  bio?: string;
}

export interface UserProfile extends TalentProfile {}

export interface Comment {
  id: string;
  author: string;
  role: UserRole | string;
  initials: string;
  time: string;
  timestamp: number;
  text: string;
  likes?: number;
  isAcceptedAnswer?: boolean;
}

export interface WorkPost {
  id: number;
  title: string;
  department: string;
  team?: string;
  status: WorkStatus;
  urgency: UrgencyLevel;
  duration: string; // e.g. '2 days'
  expectedEffortHours: string; // e.g. '12–16 hours'
  location: string; // e.g. 'Remote' or 'Sindelfingen Bldg 30'
  managerApprovalRequired: boolean;
  managerApprovalStatus?: 'not_requested' | 'pending' | 'approved' | 'rejected';
  votes: number;
  voteState: -1 | 0 | 1;
  tags: string[];
  author: string;
  role: UserRole | string;
  initials: string;
  time: string;
  timestamp: number;
  description: string;
  whyOpportunity?: string;
  contactPref?: ContactPreference;
  comments: Comment[];
  contacted?: boolean;
  bookmarked?: boolean;
  matchScore?: number; // AI calculated match score e.g. 94%
  matchReason?: string;
  applicantCount?: number;
  hasApplied?: boolean;
}

export interface BandwidthOffer {
  id: string;
  author: string;
  role: string;
  department: string;
  initials: string;
  availableHours: string; // e.g. '6 hours this month'
  skillsOffered: string[];
  notes: string;
  time: string;
  timestamp: number;
}

export interface ManagerApprovalItem {
  id: string;
  employeeName: string;
  employeeRole: string;
  employeeDepartment: string;
  opportunityId: number;
  opportunityTitle: string;
  targetDepartment: string;
  requestedCommitment: string; // e.g. '8 hours'
  period: string; // e.g. '20–22 Aug'
  currentProject: string; // e.g. 'MyAthlon'
  aiRecommendation: 'Approve' | 'Review Capacity' | 'Caution';
  aiRecommendationReason: string;
  status: 'Pending' | 'Approved' | 'Approved with Conditions' | 'Rejected';
  requestedAt: string;
  managerNotes?: string;
}

export type MarketListingType = 'Sell' | 'Buy / Looking for' | 'Give Away (Free)' | 'Exchange' | 'Ticket / Event' | 'Service Offer';
export type MarketCategory =
  | 'All'
  | 'Vehicles'
  | 'Electronics'
  | 'Furniture & Home'
  | 'Sports & Outdoors'
  | 'Tickets & Events'
  | 'Books & Tools'
  | 'Services'
  | 'Giveaways & Free'
  | 'Other';

export type ItemCondition = 'Brand New' | 'Like New' | 'Used - Excellent' | 'Used' | 'Fair' | 'N/A';

export interface MarketListing {
  id: number;
  listingType?: MarketListingType;
  title: string;
  price: number;
  currency?: string;
  isFree?: boolean;
  category: MarketCategory;
  condition: ItemCondition | string;
  location: string;
  time: string;
  timestamp: number;
  seller: string;
  sellerRole: UserRole | string;
  initials: string;
  description: string;
  specs?: Record<string, string>;
  contacted?: boolean;
  bookmarked?: boolean;
  sold?: boolean;
  eventDate?: string;
  ticketQuantity?: number;
}

export type CommunityType =
  | 'Technology'
  | 'Interests & Sports'
  | 'Professional & Diversity'
  | 'Social & Giving'
  | 'Event'
  | 'Carpool & Rides'
  | 'Lost & Found'
  | 'Notice';

export interface CommunityGroup {
  id: string;
  name: string;
  category: 'Tech' | 'Interests' | 'Professional' | 'Social';
  icon: string;
  description: string;
  memberCount: number;
  isJoined?: boolean;
  activeDiscussions: number;
  tags: string[];
}

export interface CommunityPost {
  id: number;
  type: CommunityType;
  groupName?: string;
  title: string;
  description: string;
  author: string;
  authorRole: UserRole | string;
  initials: string;
  location?: string;
  dateInfo?: string;
  time: string;
  timestamp: number;
  contacted?: boolean;
  bookmarked?: boolean;
  repliesCount?: number;
}

export interface KnowledgeQuestion {
  id: string;
  title: string;
  details: string;
  author: string;
  authorRole: string;
  initials: string;
  tags: string[];
  votes: number;
  time: string;
  timestamp: number;
  answers: Comment[];
  hasAcceptedAnswer: boolean;
}

export interface NotificationItem {
  id: string;
  type: 'manager_approval' | 'match_found' | 'feedback_received' | 'help_offer' | 'reply' | 'market_inquiry' | 'community_reply';
  title: string;
  description: string;
  time: string;
  timestamp: number;
  read: boolean;
  targetTab?: MainTab;
  targetId?: number | string;
}

export interface CapabilityHeatmapItem {
  skill: string;
  demandScore: number; // 0 to 100
  supplyScore: number; // 0 to 100
  requestsCount: number;
  availableExpertsCount: number;
  status: 'Gap (High Demand, Low Supply)' | 'Balanced' | 'High Availability';
}

export type MainTab =
  | 'home'
  | 'work'
  | 'people'
  | 'marketplace'
  | 'community'
  | 'insights'
  | 'manager'
  | 'myxchange';
