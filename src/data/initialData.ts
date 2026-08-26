import { 
  TalentProfile, 
  UserAccount,
  WorkPost, 
  BandwidthOffer, 
  ManagerApprovalItem, 
  MarketListing, 
  CommunityGroup, 
  CommunityPost, 
  KnowledgeQuestion, 
  NotificationItem, 
  CapabilityHeatmapItem,
  DirectMessage,
  CollaborationRequest,
  UserSavedMap,
  CarpoolRide,
  UserRole 
} from '../types';

/* ── PT-THIF engineering org ──────────────────────────────────────────────
 *
 *  Rajesh Deshmukh — Head of Engineering
 *  ├── Meenakshi Pillai
 *  │   ├── Vikram Subramanian ── 9 engineers (core product squad)
 *  │   └── Priya Malhotra ─────── 2 engineers
 *  └── Sameer Qureshi
 *      ├── Ajay Bhatnagar ──── 2 engineers
 *      └── Vivek Agarwal ───── 2 engineers
 *
 *  Platform administration is a dedicated service account, not a hat worn by
 *  somebody's staff account — see ADMIN_USER below for why.
 *
 *  Every account sits in PT-THIF: this is a single-department org chart, so
 *  `department` is uniform by design. Cross-department reach still shows up
 *  through the work people take on for *other* departments, which is what
 *  `departmentsSupportedCount` and the opportunity feed measure.
 */

/**
 * Platform administration runs through this account rather than through any
 * employee's or manager's own login.
 *
 * Two properties of the admin role make that the wrong thing to attach to a
 * staff account: admins are filtered out of the People directory, so granting
 * it to an engineer hides them from the colleagues who need to find them; and
 * admins can act on any request, which puts a person who also applies for work
 * next to their own approvals. Rohit and Rakesh built MBXchange and operate it
 * — they do that by signing into this account, and stay ordinary engineers in
 * the directory and in the approval chain.
 */
export const ADMIN_USER: UserAccount = {
  id: 'usr_admin',
  name: 'MBXchange Administrator',
  email: 'mbxchange.admin@mercedes-benz.com',
  role: 'Platform Administrator',
  systemRole: 'admin',
  status: 'active',
  department: 'PT-THIF',
  campus: 'MBRDI Bengaluru Hub',
  initials: 'MX',
  experienceYears: 0,
  primarySkills: [],
  interests: [],
  availableFor: [],
  typicalAvailability: 'Not available for gigs',
  currentAvailabilityHoursThisWeek: 0,
  contributionScore: 0,
  ratingBreakdown: { helping: 0, technicalExpertise: 0, collaboration: 0, reliability: 0 },
  badges: [],
  collaborationsCount: 0,
  departmentsSupportedCount: 0,
  peopleHelpedCount: 0,
  hoursContributed: 0,
  bio: 'Service account for MBXchange platform administration — account provisioning, registration requests and the audit trail. Operated by the engineers who built the platform; it does not post or apply for work itself.'
};

export const MANAGER_NARESH: UserAccount = {
  id: 'usr_naresh',
  name: 'Rajesh Deshmukh',
  email: 'rajesh.deshmukh@mercedes-benz.com',
  role: 'Head of Engineering',
  systemRole: 'manager',
  status: 'active',
  department: 'PT-THIF',
  managerName: undefined,
  directReportIds: ['usr_sanila', 'usr_irfan'],
  campus: 'MBRDI Bengaluru Hub',
  initials: 'RD',
  experienceYears: 21,
  primarySkills: ['Engineering Leadership', 'Org Design', 'Platform Strategy', 'Delivery Governance', 'Capacity Planning', 'Stakeholder Management'],
  interests: ['Talent Mobility', 'Engineering Culture', 'Platform Modernisation', 'Cross-Team Enablement'],
  availableFor: ['Executive Sponsorship', 'Escalations', 'Org-Level Reviews', 'Career Conversations'],
  typicalAvailability: 'Ad-hoc',
  currentAvailabilityHoursThisWeek: 4,
  contributionScore: 4.97,
  ratingBreakdown: { helping: 5.0, technicalExpertise: 4.9, collaboration: 5.0, reliability: 4.95 },
  badges: [
    { id: 'b_adm1', name: 'Executive Sponsor', icon: '⭐', description: 'Championed cross-team engineering mobility across PT-THIF', dateEarned: 'Jun 2024' },
    { id: 'b_adm2', name: 'Org Builder', icon: '🏛️', description: 'Grew PT-THIF engineering to four squads across two management lines', dateEarned: 'Jan 2024' }
  ],
  collaborationsCount: 41,
  departmentsSupportedCount: 9,
  peopleHelpedCount: 96,
  hoursContributed: 210,
  bio: 'Heads PT-THIF engineering. Runs delivery across four squads through two senior managers, and sponsors the internal exchange that lets engineers contribute beyond their own backlog.'
};

/* ── Senior managers (second line) ─────────────────────────────────────── */

export const MANAGER_SANILA: UserAccount = {
  id: 'usr_sanila',
  name: 'Meenakshi Pillai',
  email: 'meenakshi.pillai@mercedes-benz.com',
  role: 'Senior Engineering Manager',
  systemRole: 'manager',
  status: 'active',
  department: 'PT-THIF',
  managerId: 'usr_naresh',
  managerName: 'Rajesh Deshmukh',
  directReportIds: ['usr_kalyan', 'usr_swati'],
  campus: 'MBRDI Bengaluru Hub',
  initials: 'MP',
  experienceYears: 17,
  primarySkills: ['People Leadership', 'Programme Delivery', 'Agile at Scale', 'Capacity Management', 'Architecture Governance', 'Risk Management'],
  interests: ['Team Topologies', 'Developer Experience', 'Succession Planning', 'Delivery Metrics'],
  availableFor: ['Manager Approvals', 'Programme Reviews', 'Hiring Panels', 'Mentoring Managers'],
  typicalAvailability: '5–8 hours/week',
  currentAvailabilityHoursThisWeek: 6,
  contributionScore: 4.93,
  ratingBreakdown: { helping: 4.95, technicalExpertise: 4.85, collaboration: 5.0, reliability: 4.9 },
  badges: [
    { id: 'b_ss1', name: 'Talent Champion', icon: '🌟', description: 'Approved 30+ cross-team engineering exchanges', dateEarned: 'Aug 2025' },
    { id: 'b_ss2', name: 'Delivery Anchor', icon: '⚓', description: 'Two squads shipped every committed release train for four quarters', dateEarned: 'Feb 2026' }
  ],
  collaborationsCount: 30,
  departmentsSupportedCount: 7,
  peopleHelpedCount: 48,
  hoursContributed: 118,
  bio: 'Senior manager for the platform and delivery squads under Kalyan and Swati. Protects team capacity while still saying yes to cross-team work that grows people.'
};

export const MANAGER_IRFAN: UserAccount = {
  id: 'usr_irfan',
  name: 'Sameer Qureshi',
  email: 'sameer.qureshi@mercedes-benz.com',
  role: 'Senior Engineering Manager',
  systemRole: 'manager',
  status: 'active',
  department: 'PT-THIF',
  managerId: 'usr_naresh',
  managerName: 'Rajesh Deshmukh',
  directReportIds: ['usr_nitin', 'usr_prabhat'],
  campus: 'MBRDI Whitefield Hub',
  initials: 'SQ',
  experienceYears: 16,
  primarySkills: ['People Leadership', 'Platform Engineering', 'Reliability Strategy', 'Vendor Management', 'Cost Optimisation', 'Data Governance'],
  interests: ['SRE Practice', 'Observability Culture', 'Cloud Economics', 'Engineering Onboarding'],
  availableFor: ['Manager Approvals', 'Architecture Boards', 'Incident Reviews', 'Mentoring Managers'],
  typicalAvailability: '4–8 hours/week',
  currentAvailabilityHoursThisWeek: 6,
  contributionScore: 4.9,
  ratingBreakdown: { helping: 4.9, technicalExpertise: 4.9, collaboration: 4.9, reliability: 4.95 },
  badges: [
    { id: 'b_ij1', name: 'Reliability Steward', icon: '🛡️', description: 'Held 99.95% availability across two production platforms', dateEarned: 'Nov 2025' }
  ],
  collaborationsCount: 26,
  departmentsSupportedCount: 6,
  peopleHelpedCount: 40,
  hoursContributed: 102,
  bio: 'Senior manager for the data and reliability squads under Nitin and Prabhat. Focused on keeping platforms boringly dependable and engineers unblocked.'
};

/* ── Line managers (first line) ────────────────────────────────────────── */

export const MANAGER_KALYAN: UserAccount = {
  id: 'usr_kalyan',
  name: 'Vikram Subramanian',
  email: 'vikram.subramanian@mercedes-benz.com',
  role: 'Engineering Manager',
  systemRole: 'manager',
  status: 'active',
  department: 'PT-THIF',
  managerId: 'usr_sanila',
  managerName: 'Meenakshi Pillai',
  directReportIds: [
    'usr_rohit', 'usr_rakesh', 'usr_sangeeta', 'usr_upasana', 'usr_ishana',
    'usr_sunil', 'usr_rashmi', 'usr_shital', 'usr_aman'
  ],
  campus: 'MBRDI Bengaluru Hub',
  initials: 'VS',
  experienceYears: 14,
  primarySkills: ['People Leadership', 'Delivery Management', 'Capacity Planning', '.NET Ecosystem', 'Solution Architecture', 'Stakeholder Management'],
  interests: ['Team Health', 'Engineering Craft', 'Cross-Team Mobility', 'Release Predictability'],
  availableFor: ['Manager Approvals', 'Resource Planning', 'Design Reviews', 'Mentoring'],
  typicalAvailability: '6–8 hours/week',
  currentAvailabilityHoursThisWeek: 6,
  contributionScore: 4.92,
  ratingBreakdown: { helping: 4.9, technicalExpertise: 4.9, collaboration: 4.95, reliability: 4.95 },
  badges: [
    { id: 'b_kt1', name: 'Talent Champion', icon: '🌟', description: 'Approved 30+ cross-team engineering exchanges', dateEarned: 'Aug 2025' },
    { id: 'b_kt2', name: 'Squad Builder', icon: '🧩', description: 'Grew the core product squad to nine engineers without a delivery slip', dateEarned: 'Dec 2025' }
  ],
  collaborationsCount: 32,
  departmentsSupportedCount: 8,
  peopleHelpedCount: 45,
  hoursContributed: 110,
  bio: 'Engineering manager for the core PT-THIF product squad — nine engineers spanning full stack, DevOps, QA, product and agile delivery. Approves exchange requests against real declared capacity.'
};

export const MANAGER_SWATI: UserAccount = {
  id: 'usr_swati',
  name: 'Priya Malhotra',
  email: 'priya.malhotra@mercedes-benz.com',
  role: 'Engineering Manager',
  systemRole: 'manager',
  status: 'active',
  department: 'PT-THIF',
  managerId: 'usr_sanila',
  managerName: 'Meenakshi Pillai',
  directReportIds: ['usr_amith', 'usr_rohitshet'],
  campus: 'MBRDI Bengaluru Hub',
  initials: 'PM',
  experienceYears: 13,
  primarySkills: ['People Leadership', 'Backend Architecture', 'API Strategy', 'Integration Patterns', 'Agile Delivery', 'Code Quality'],
  interests: ['Domain-Driven Design', 'Contract Testing', 'Developer Onboarding', 'Technical Debt Strategy'],
  availableFor: ['Manager Approvals', 'API Design Reviews', 'Integration Consulting', 'Mentoring'],
  typicalAvailability: '5–8 hours/week',
  currentAvailabilityHoursThisWeek: 5,
  contributionScore: 4.88,
  ratingBreakdown: { helping: 4.9, technicalExpertise: 4.9, collaboration: 4.9, reliability: 4.85 },
  badges: [
    { id: 'b_sw1', name: 'API Steward', icon: '🔗', description: 'Standardised integration contracts across four consuming teams', dateEarned: 'Sep 2025' }
  ],
  collaborationsCount: 22,
  departmentsSupportedCount: 6,
  peopleHelpedCount: 31,
  hoursContributed: 78,
  bio: 'Engineering manager for the backend and integration squad. Owns the service contracts other PT-THIF teams build against.'
};

export const MANAGER_NITIN: UserAccount = {
  id: 'usr_nitin',
  name: 'Ajay Bhatnagar',
  email: 'ajay.bhatnagar@mercedes-benz.com',
  role: 'Engineering Manager',
  systemRole: 'manager',
  status: 'active',
  department: 'PT-THIF',
  managerId: 'usr_irfan',
  managerName: 'Sameer Qureshi',
  directReportIds: ['usr_avinash', 'usr_soumya'],
  campus: 'MBRDI Whitefield Hub',
  initials: 'AB',
  experienceYears: 15,
  primarySkills: ['People Leadership', 'Data Platform Strategy', 'Analytics Engineering', 'Front-End Architecture', 'Design Systems', 'Agile Delivery'],
  interests: ['Data Quality', 'Self-Service Analytics', 'Accessibility', 'Design Tokens'],
  availableFor: ['Manager Approvals', 'Data Model Reviews', 'UX Architecture Reviews', 'Mentoring'],
  typicalAvailability: '4–6 hours/week',
  currentAvailabilityHoursThisWeek: 4,
  contributionScore: 4.9,
  ratingBreakdown: { helping: 4.9, technicalExpertise: 4.9, collaboration: 4.9, reliability: 4.9 },
  badges: [
    { id: 'b_nc1', name: 'Insight Enabler', icon: '📈', description: 'Put self-service dashboards in front of every squad lead', dateEarned: 'Oct 2025' }
  ],
  collaborationsCount: 24,
  departmentsSupportedCount: 7,
  peopleHelpedCount: 33,
  hoursContributed: 86,
  bio: 'Engineering manager for the data and experience squad. Bridges the reporting layer and the front-end design system PT-THIF products share.'
};

export const MANAGER_PRABHAT: UserAccount = {
  id: 'usr_prabhat',
  name: 'Vivek Agarwal',
  email: 'vivek.agarwal@mercedes-benz.com',
  role: 'Engineering Manager',
  systemRole: 'manager',
  status: 'active',
  department: 'PT-THIF',
  managerId: 'usr_irfan',
  managerName: 'Sameer Qureshi',
  directReportIds: ['usr_pawan', 'usr_raghav'],
  campus: 'MBRDI Whitefield Hub',
  initials: 'VA',
  experienceYears: 14,
  primarySkills: ['People Leadership', 'Site Reliability', 'Release Engineering', 'Quality Strategy', 'Incident Management', 'Automation'],
  interests: ['Progressive Delivery', 'Chaos Engineering', 'Shift-Left Testing', 'On-Call Health'],
  availableFor: ['Manager Approvals', 'Reliability Reviews', 'Release Readiness Checks', 'Mentoring'],
  typicalAvailability: '4–6 hours/week',
  currentAvailabilityHoursThisWeek: 5,
  contributionScore: 4.87,
  ratingBreakdown: { helping: 4.85, technicalExpertise: 4.9, collaboration: 4.85, reliability: 4.95 },
  badges: [
    { id: 'b_pr1', name: 'Release Guardian', icon: '🚦', description: 'Cut failed-release rate to under 2% across three quarters', dateEarned: 'Jan 2026' }
  ],
  collaborationsCount: 21,
  departmentsSupportedCount: 6,
  peopleHelpedCount: 29,
  hoursContributed: 74,
  bio: 'Engineering manager for reliability and quality. Owns the release gate and the on-call rotation that keeps PT-THIF services healthy.'
};

/* ── Vikram Subramanian's squad (9) ─────────────────────────────────────── */

/**
 * Rohit and Rakesh built MBXchange and look after it, but they hold no
 * elevated rights on their own accounts — they administer it through
 * ADMIN_USER. Here they are ordinary engineers on Kalyan's squad, visible in
 * the People directory and routed through Kalyan for approvals like everyone
 * else.
 */
export const CURRENT_USER: UserAccount = {
  id: 'usr_rohit',
  name: 'Arjun Mehta',
  email: 'arjun.mehta@mercedes-benz.com',
  role: 'Full Stack Developer',
  systemRole: 'employee',
  status: 'active',
  department: 'PT-THIF',
  managerId: 'usr_kalyan',
  managerName: 'Vikram Subramanian',
  campus: 'MBRDI Bengaluru Hub',
  initials: 'AM',
  experienceYears: 8,
  primarySkills: ['C#', '.NET Core', 'ASP.NET Web API', 'Angular', 'TypeScript', 'RxJS', 'Entity Framework', 'SQL Server', 'Azure'],
  interests: ['Clean Architecture', 'Micro Frontends', 'Performance Tuning', 'Developer Tooling'],
  availableFor: ['Feature Development', 'Code Reviews', 'Angular Pairing', 'API Design Support'],
  typicalAvailability: '4–8 hours/week',
  currentAvailabilityHoursThisWeek: 6,
  contributionScore: 4.86,
  ratingBreakdown: { helping: 4.85, technicalExpertise: 4.9, collaboration: 4.85, reliability: 4.85 },
  badges: [
    { id: 'b_rc1', name: 'Platform Author', icon: '🏛️', description: 'Co-built MBXchange and keeps it running for PT-THIF', dateEarned: 'Aug 2026' },
    { id: 'b_rc2', name: 'Full Stack Finisher', icon: '🧱', description: 'Shipped 15+ end-to-end features across API and Angular layers', dateEarned: 'Nov 2025' },
    { id: 'b_rc3', name: 'Cross-Team Contributor', icon: '🏆', description: 'Supported four squads outside the core product backlog', dateEarned: 'Feb 2026' }
  ],
  collaborationsCount: 14,
  departmentsSupportedCount: 5,
  peopleHelpedCount: 22,
  hoursContributed: 52,
  bio: 'Full stack developer on the core PT-THIF product squad, working across .NET Core services and Angular front ends. Co-built MBXchange and keeps it running day to day with Rakesh — happy to pair on RxJS, EF Core query tuning, or untangling a slow endpoint.'
};

export const EMP_RAKESH: UserAccount = {
  id: 'usr_rakesh',
  name: 'Karthik Iyer',
  email: 'karthik.iyer@mercedes-benz.com',
  role: 'Lead DevOps Engineer',
  systemRole: 'employee',
  status: 'active',
  department: 'PT-THIF',
  managerId: 'usr_kalyan',
  managerName: 'Vikram Subramanian',
  campus: 'MBRDI Bengaluru Hub',
  initials: 'KI',
  experienceYears: 14,
  primarySkills: ['AWS', 'Azure', 'Kubernetes', 'Terraform', 'Docker', 'CI/CD', 'GitHub Actions', 'AIOps'],
  interests: ['AIOps', 'Cloud Architecture', 'Observability', 'Automation', 'EV Tech'],
  availableFor: ['Short Gigs', 'Architecture Review', 'Mentoring', 'DevOps Support'],
  typicalAvailability: '4–8 hours/week',
  currentAvailabilityHoursThisWeek: 6,
  contributionScore: 4.82,
  ratingBreakdown: { helping: 4.8, technicalExpertise: 4.9, collaboration: 4.7, reliability: 4.9 },
  badges: [
    { id: 'b0', name: 'Platform Author', icon: '🏛️', description: 'Co-built MBXchange and keeps it running for PT-THIF', dateEarned: 'Aug 2026' },
    { id: 'b1', name: 'Cross-Team Contributor', icon: '🏆', description: 'Completed 20+ cross-department collaborations', dateEarned: 'Oct 2025' },
    { id: 'b2', name: 'Collaboration Champion', icon: '🤝', description: 'Supported every squad in PT-THIF', dateEarned: 'Dec 2025' },
    { id: 'b3', name: 'Knowledge Sharer', icon: '🧠', description: 'Top verified answer author in Cloud & Kubernetes communities', dateEarned: 'Jan 2026' },
    { id: 'b4', name: 'Rapid Responder', icon: '🚀', description: 'Under 2-hour response time on critical peer support', dateEarned: 'Feb 2026' }
  ],
  collaborationsCount: 23,
  departmentsSupportedCount: 7,
  peopleHelpedCount: 31,
  hoursContributed: 82,
  bio: 'Lead DevOps engineer on the core PT-THIF squad, focused on developer productivity, immutable infrastructure, and helping other teams scale safely on AWS/Azure Kubernetes. Co-built MBXchange and looks after its deployment and operations alongside Rohit.'
};

export const EMP_SANGEETA: UserAccount = {
  id: 'usr_sangeeta',
  name: 'Neha Kulkarni',
  email: 'neha.kulkarni@mercedes-benz.com',
  role: 'Product Owner',
  systemRole: 'employee',
  status: 'active',
  department: 'PT-THIF',
  managerId: 'usr_kalyan',
  managerName: 'Vikram Subramanian',
  campus: 'MBRDI Bengaluru Hub',
  initials: 'NK',
  experienceYears: 11,
  primarySkills: ['Product Discovery', 'Backlog Management', 'User Story Mapping', 'Roadmapping', 'Stakeholder Management', 'OKRs', 'Jira'],
  interests: ['Outcome-Driven Roadmaps', 'Customer Journey Mapping', 'Product Analytics', 'Continuous Discovery'],
  availableFor: ['Requirement Workshops', 'Backlog Refinement', 'Roadmap Reviews', 'Stakeholder Facilitation'],
  typicalAvailability: '6–10 hours/week',
  currentAvailabilityHoursThisWeek: 8,
  contributionScore: 4.91,
  ratingBreakdown: { helping: 5.0, technicalExpertise: 4.7, collaboration: 4.95, reliability: 4.9 },
  badges: [
    { id: 'b_sg1', name: 'Discovery Lead', icon: '🧭', description: 'Ran discovery for three products now in production', dateEarned: 'Aug 2025' },
    { id: 'b_sg2', name: 'Cross-Domain Contributor', icon: '🌍', description: 'Shaped requirements for six teams outside her own backlog', dateEarned: 'Nov 2025' }
  ],
  collaborationsCount: 18,
  departmentsSupportedCount: 6,
  peopleHelpedCount: 27,
  hoursContributed: 64,
  bio: 'Product owner for the core PT-THIF product squad. Turns vague stakeholder asks into a sequenced, testable backlog — and is usually the fastest route to "is this actually worth building".'
};

export const EMP_UPASANA: UserAccount = {
  id: 'usr_upasana',
  name: 'Divya Krishnan',
  email: 'divya.krishnan@mercedes-benz.com',
  role: 'Full Stack Developer',
  systemRole: 'employee',
  status: 'active',
  department: 'PT-THIF',
  managerId: 'usr_kalyan',
  managerName: 'Vikram Subramanian',
  campus: 'MBRDI Bengaluru Hub',
  initials: 'DK',
  experienceYears: 7,
  primarySkills: ['C#', '.NET Core', 'Angular', 'TypeScript', 'REST APIs', 'PostgreSQL', 'xUnit', 'Docker'],
  interests: ['Test-Driven Development', 'API Design', 'Refactoring', 'Database Performance'],
  availableFor: ['Feature Development', 'Unit Test Coverage Drives', 'Code Reviews', 'Bug Triage Support'],
  typicalAvailability: '4–8 hours/week',
  currentAvailabilityHoursThisWeek: 5,
  contributionScore: 4.89,
  ratingBreakdown: { helping: 4.9, technicalExpertise: 4.9, collaboration: 4.85, reliability: 4.9 },
  badges: [
    { id: 'b_ug1', name: 'Quality Advocate', icon: '✅', description: 'Lifted service test coverage from 41% to 82%', dateEarned: 'Sep 2025' }
  ],
  collaborationsCount: 12,
  departmentsSupportedCount: 4,
  peopleHelpedCount: 19,
  hoursContributed: 46,
  bio: 'Full stack developer with a strong testing habit. Works across .NET Core APIs and Angular screens, and is the person the squad asks when a flaky integration test needs a real fix.'
};

export const EMP_ISHANA: UserAccount = {
  id: 'usr_ishana',
  name: 'Ananya Reddy',
  email: 'ananya.reddy@mercedes-benz.com',
  role: 'Full Stack Developer',
  systemRole: 'employee',
  status: 'active',
  department: 'PT-THIF',
  managerId: 'usr_kalyan',
  managerName: 'Vikram Subramanian',
  campus: 'MBRDI Whitefield Hub',
  initials: 'AR',
  experienceYears: 6,
  primarySkills: ['Angular', 'TypeScript', '.NET Core', 'ASP.NET Web API', 'SCSS', 'Cypress', 'Git', 'SQL'],
  interests: ['Component Architecture', 'Front-End Testing', 'Accessibility', 'State Management'],
  availableFor: ['Feature Development', 'Angular Pairing', 'UI Bug Fixes', 'Component Reviews'],
  typicalAvailability: '4–6 hours/week',
  currentAvailabilityHoursThisWeek: 5,
  contributionScore: 4.84,
  ratingBreakdown: { helping: 4.85, technicalExpertise: 4.8, collaboration: 4.9, reliability: 4.8 },
  badges: [
    { id: 'b_ik1', name: 'Component Craftsman', icon: '🧩', description: 'Built the shared Angular component library used by three squads', dateEarned: 'Dec 2025' }
  ],
  collaborationsCount: 10,
  departmentsSupportedCount: 4,
  peopleHelpedCount: 16,
  hoursContributed: 38,
  bio: 'Full stack developer leaning front-end. Maintains the shared Angular component library and cares a lot about keeping the UI consistent and accessible across PT-THIF products.'
};

export const EMP_SUNIL: UserAccount = {
  id: 'usr_sunil',
  name: 'Suresh Pillai',
  email: 'suresh.pillai@mercedes-benz.com',
  role: 'Senior Developer & Team Lead',
  systemRole: 'employee',
  status: 'active',
  department: 'PT-THIF',
  managerId: 'usr_kalyan',
  managerName: 'Vikram Subramanian',
  campus: 'MBRDI Bengaluru Hub',
  initials: 'SP',
  experienceYears: 13,
  primarySkills: ['.NET Core', 'Angular', 'System Design', 'Microservices', 'Azure DevOps', 'Performance Tuning', 'Code Review', 'Mentoring'],
  interests: ['Distributed Systems', 'Technical Mentoring', 'Architecture Decision Records', 'Build Pipeline Speed'],
  availableFor: ['Design Reviews', 'Architecture Consulting', 'Mentoring', 'Performance Investigations'],
  typicalAvailability: '4–8 hours/week',
  currentAvailabilityHoursThisWeek: 6,
  contributionScore: 4.93,
  ratingBreakdown: { helping: 4.9, technicalExpertise: 5.0, collaboration: 4.85, reliability: 4.95 },
  badges: [
    { id: 'b_sn1', name: 'Technical Anchor', icon: '🎯', description: 'Design authority on 20+ production services', dateEarned: 'Nov 2025' },
    { id: 'b_sn2', name: 'Mentor of the Year', icon: '🧑‍🏫', description: 'Mentored six engineers through their first production release', dateEarned: 'Jan 2026' }
  ],
  collaborationsCount: 24,
  departmentsSupportedCount: 8,
  peopleHelpedCount: 34,
  hoursContributed: 88,
  bio: 'Senior developer and team lead for the core squad. Splits time between hands-on .NET/Angular work, design reviews, and growing the engineers around him.'
};

export const EMP_RASHMI: UserAccount = {
  id: 'usr_rashmi',
  name: 'Kavya Nair',
  email: 'kavya.nair@mercedes-benz.com',
  role: 'Business Analyst & Scrum Master',
  systemRole: 'employee',
  status: 'active',
  department: 'PT-THIF',
  managerId: 'usr_kalyan',
  managerName: 'Vikram Subramanian',
  campus: 'MBRDI Bengaluru Hub',
  initials: 'KN',
  experienceYears: 10,
  primarySkills: ['Requirements Engineering', 'Agile / Scrum', 'Sprint Facilitation', 'Process Mapping', 'Jira', 'Confluence', 'UAT Coordination'],
  interests: ['Team Facilitation', 'Flow Efficiency', 'Retrospective Formats', 'Requirement Traceability'],
  availableFor: ['Requirement Workshops', 'Scrum Facilitation', 'Process Reviews', 'UAT Planning'],
  typicalAvailability: '5–8 hours/week',
  currentAvailabilityHoursThisWeek: 5,
  contributionScore: 4.9,
  ratingBreakdown: { helping: 4.95, technicalExpertise: 4.7, collaboration: 5.0, reliability: 4.9 },
  badges: [
    { id: 'b_rp1', name: 'Flow Facilitator', icon: '🔄', description: 'Cut average story cycle time by a third across two squads', dateEarned: 'Jul 2025' }
  ],
  collaborationsCount: 17,
  departmentsSupportedCount: 7,
  peopleHelpedCount: 26,
  hoursContributed: 62,
  bio: 'Business analyst and scrum master for the core PT-THIF squad. Writes the requirements the team builds from and runs the ceremonies that keep delivery honest.'
};

export const EMP_SHITAL: UserAccount = {
  id: 'usr_shital',
  name: 'Pooja Joshi',
  email: 'pooja.joshi@mercedes-benz.com',
  role: 'Testing Lead',
  systemRole: 'employee',
  status: 'active',
  department: 'PT-THIF',
  managerId: 'usr_kalyan',
  managerName: 'Vikram Subramanian',
  campus: 'MBRDI Bengaluru Hub',
  initials: 'PJ',
  experienceYears: 12,
  primarySkills: ['Test Strategy', 'Selenium', 'Playwright', 'API Testing', 'Test Automation', 'Performance Testing', 'Defect Management'],
  interests: ['Shift-Left Testing', 'Risk-Based Test Design', 'Automation ROI', 'Quality Coaching'],
  availableFor: ['Test Strategy Reviews', 'Automation Framework Setup', 'Exploratory Test Sessions', 'Quality Coaching'],
  typicalAvailability: '4–8 hours/week',
  currentAvailabilityHoursThisWeek: 6,
  contributionScore: 4.88,
  ratingBreakdown: { helping: 4.9, technicalExpertise: 4.9, collaboration: 4.85, reliability: 4.9 },
  badges: [
    { id: 'b_sh1', name: 'Automation Architect', icon: '🤖', description: 'Built the regression suite that gates every PT-THIF release', dateEarned: 'Oct 2025' }
  ],
  collaborationsCount: 16,
  departmentsSupportedCount: 6,
  peopleHelpedCount: 24,
  hoursContributed: 58,
  bio: 'Testing lead for the core squad. Owns the regression suite that gates releases, and is usually lent out to other teams that need an automation framework stood up from scratch.'
};

export const EMP_AMAN: UserAccount = {
  id: 'usr_aman',
  name: 'Rohan Chauhan',
  email: 'rohan.chauhan@mercedes-benz.com',
  role: 'Junior Developer',
  systemRole: 'employee',
  status: 'active',
  department: 'PT-THIF',
  managerId: 'usr_kalyan',
  managerName: 'Vikram Subramanian',
  campus: 'MBRDI Bengaluru Hub',
  initials: 'RC',
  experienceYears: 2,
  primarySkills: ['C#', '.NET Core', 'Angular', 'JavaScript', 'HTML/CSS', 'SQL', 'Git'],
  interests: ['Learning Clean Code', 'Debugging Techniques', 'Unit Testing', 'Open Source'],
  availableFor: ['Bug Fixes', 'Documentation', 'Pair Programming (learning)', 'Test Data Setup'],
  typicalAvailability: '2–4 hours/week',
  currentAvailabilityHoursThisWeek: 3,
  contributionScore: 4.62,
  ratingBreakdown: { helping: 4.7, technicalExpertise: 4.4, collaboration: 4.8, reliability: 4.6 },
  badges: [
    { id: 'b_ay1', name: 'First Contribution', icon: '🌱', description: 'Shipped a first production fix within eight weeks of joining', dateEarned: 'Feb 2026' }
  ],
  collaborationsCount: 3,
  departmentsSupportedCount: 1,
  peopleHelpedCount: 5,
  hoursContributed: 12,
  bio: 'Junior developer, two years in. Picking up .NET and Angular on the core squad, and actively looking for small cross-team gigs to widen his exposure.'
};

/* ── Priya Malhotra's squad (2) ──────────────────────────────────────────── */

export const EMP_AMITH: UserAccount = {
  id: 'usr_amith',
  name: 'Nikhil Rao',
  email: 'nikhil.rao@mercedes-benz.com',
  role: 'Backend Developer',
  systemRole: 'employee',
  status: 'active',
  department: 'PT-THIF',
  managerId: 'usr_swati',
  managerName: 'Priya Malhotra',
  campus: 'MBRDI Bengaluru Hub',
  initials: 'NR',
  experienceYears: 9,
  primarySkills: ['C#', '.NET Core', 'Microservices', 'REST APIs', 'SQL Server', 'Redis', 'RabbitMQ', 'Domain-Driven Design'],
  interests: ['Event-Driven Architecture', 'Caching Strategy', 'API Versioning', 'Database Design'],
  availableFor: ['API Development', 'Backend Code Reviews', 'Service Design Consulting', 'Query Optimisation'],
  typicalAvailability: '4–8 hours/week',
  currentAvailabilityHoursThisWeek: 6,
  contributionScore: 4.87,
  ratingBreakdown: { helping: 4.85, technicalExpertise: 4.95, collaboration: 4.8, reliability: 4.9 },
  badges: [
    { id: 'b_ak1', name: 'Service Builder', icon: '⚙️', description: 'Delivered eight production microservices with zero rollback', dateEarned: 'Nov 2025' }
  ],
  collaborationsCount: 13,
  departmentsSupportedCount: 5,
  peopleHelpedCount: 20,
  hoursContributed: 48,
  bio: 'Backend developer on the integration squad. Builds and maintains the .NET microservices and messaging contracts other PT-THIF teams consume.'
};

export const EMP_ROHIT_SHET: UserAccount = {
  id: 'usr_rohitshet',
  name: 'Varun Prabhu',
  email: 'varun.prabhu@mercedes-benz.com',
  role: 'Cloud & Integration Engineer',
  systemRole: 'employee',
  status: 'active',
  department: 'PT-THIF',
  managerId: 'usr_swati',
  managerName: 'Priya Malhotra',
  campus: 'MBRDI Whitefield Hub',
  initials: 'VP',
  experienceYears: 8,
  primarySkills: ['Azure', 'API Management', 'Logic Apps', '.NET Core', 'Integration Patterns', 'OAuth / OIDC', 'Bicep'],
  interests: ['Hybrid Integration', 'API Gateways', 'Zero-Trust Networking', 'Cost Optimisation'],
  availableFor: ['Integration Design', 'Azure Consulting', 'API Gateway Setup', 'Auth Troubleshooting'],
  typicalAvailability: '4–6 hours/week',
  currentAvailabilityHoursThisWeek: 5,
  contributionScore: 4.85,
  ratingBreakdown: { helping: 4.9, technicalExpertise: 4.85, collaboration: 4.8, reliability: 4.85 },
  badges: [
    { id: 'b_rs1', name: 'Integration Specialist', icon: '🔌', description: 'Connected nine internal systems through a single managed gateway', dateEarned: 'Dec 2025' }
  ],
  collaborationsCount: 11,
  departmentsSupportedCount: 5,
  peopleHelpedCount: 18,
  hoursContributed: 44,
  bio: 'Cloud and integration engineer. The person to call when two systems need to talk to each other securely and nobody is sure whose token is expiring.'
};

/* ── Ajay Bhatnagar's squad (2) ───────────────────────────────────────── */

export const EMP_AVINASH: UserAccount = {
  id: 'usr_avinash',
  name: 'Harish Menon',
  email: 'harish.menon@mercedes-benz.com',
  role: 'Data Engineer',
  systemRole: 'employee',
  status: 'active',
  department: 'PT-THIF',
  managerId: 'usr_nitin',
  managerName: 'Ajay Bhatnagar',
  campus: 'MBRDI Whitefield Hub',
  initials: 'HM',
  experienceYears: 9,
  primarySkills: ['SQL', 'Python', 'ETL', 'Azure Data Factory', 'Databricks', 'Power BI', 'Data Modelling'],
  interests: ['Data Quality', 'Lakehouse Architecture', 'Pipeline Observability', 'Self-Service BI'],
  availableFor: ['Pipeline Development', 'Data Model Reviews', 'Power BI Dashboards', 'SQL Tuning'],
  typicalAvailability: '4–8 hours/week',
  currentAvailabilityHoursThisWeek: 6,
  contributionScore: 4.86,
  ratingBreakdown: { helping: 4.85, technicalExpertise: 4.9, collaboration: 4.8, reliability: 4.9 },
  badges: [
    { id: 'b_av1', name: 'Pipeline Pioneer', icon: '📊', description: 'Rebuilt the nightly ETL to run in a quarter of the time', dateEarned: 'Jan 2026' }
  ],
  collaborationsCount: 14,
  departmentsSupportedCount: 6,
  peopleHelpedCount: 21,
  hoursContributed: 52,
  bio: 'Data engineer on the data and experience squad. Builds the pipelines and models that feed reporting for the wider PT-THIF organisation.'
};

export const EMP_SOUMYA: UserAccount = {
  id: 'usr_soumya',
  name: 'Anjali Desai',
  email: 'anjali.desai@mercedes-benz.com',
  role: 'UI / UX Engineer',
  systemRole: 'employee',
  status: 'active',
  department: 'PT-THIF',
  managerId: 'usr_nitin',
  managerName: 'Ajay Bhatnagar',
  campus: 'MBRDI Bengaluru Hub',
  initials: 'AD',
  experienceYears: 7,
  primarySkills: ['Angular', 'TypeScript', 'Design Systems', 'Figma', 'SCSS', 'Accessibility (WCAG)', 'Usability Testing'],
  interests: ['Design Tokens', 'Inclusive Design', 'Motion Design', 'Front-End Performance'],
  availableFor: ['UI Reviews', 'Design System Consulting', 'Accessibility Audits', 'Prototyping'],
  typicalAvailability: '4–6 hours/week',
  currentAvailabilityHoursThisWeek: 5,
  contributionScore: 4.89,
  ratingBreakdown: { helping: 4.9, technicalExpertise: 4.85, collaboration: 4.95, reliability: 4.85 },
  badges: [
    { id: 'b_sm1', name: 'Design System Steward', icon: '🎨', description: 'Unified the token set behind every PT-THIF front end', dateEarned: 'Oct 2025' },
    { id: 'b_sm2', name: 'Accessibility Advocate', icon: '♿', description: 'Brought three products to WCAG AA compliance', dateEarned: 'Feb 2026' }
  ],
  collaborationsCount: 15,
  departmentsSupportedCount: 6,
  peopleHelpedCount: 23,
  hoursContributed: 54,
  bio: 'UI/UX engineer bridging design and Angular implementation. Owns the shared design tokens and runs the accessibility audits other squads book her for.'
};

/* ── Vivek Agarwal's squad (2) ────────────────────────────────────────── */

export const EMP_PAWAN: UserAccount = {
  id: 'usr_pawan',
  name: 'Girish Kulkarni',
  email: 'girish.kulkarni@mercedes-benz.com',
  role: 'Site Reliability Engineer',
  systemRole: 'employee',
  status: 'active',
  department: 'PT-THIF',
  managerId: 'usr_prabhat',
  managerName: 'Vivek Agarwal',
  campus: 'MBRDI Whitefield Hub',
  initials: 'GK',
  experienceYears: 10,
  primarySkills: ['Kubernetes', 'Terraform', 'Prometheus', 'Grafana', 'Incident Response', 'Linux', 'Go', 'CI/CD'],
  interests: ['Observability', 'Error Budgets', 'Chaos Engineering', 'Capacity Forecasting'],
  availableFor: ['Reliability Reviews', 'Observability Setup', 'Incident Postmortems', 'Kubernetes Troubleshooting'],
  typicalAvailability: '4–8 hours/week',
  currentAvailabilityHoursThisWeek: 6,
  contributionScore: 4.9,
  ratingBreakdown: { helping: 4.9, technicalExpertise: 4.95, collaboration: 4.85, reliability: 4.95 },
  badges: [
    { id: 'b_ph1', name: 'Incident Commander', icon: '🚨', description: 'Led response on 30+ production incidents with clean postmortems', dateEarned: 'Nov 2025' }
  ],
  collaborationsCount: 18,
  departmentsSupportedCount: 7,
  peopleHelpedCount: 28,
  hoursContributed: 66,
  bio: 'Site reliability engineer on the reliability and quality squad. Owns observability and the on-call playbooks, and is regularly borrowed by teams debugging production Kubernetes.'
};

export const EMP_RAGHAV: UserAccount = {
  id: 'usr_raghav',
  name: 'Tarun Malviya',
  email: 'tarun.malviya@mercedes-benz.com',
  role: 'QA Automation Engineer',
  systemRole: 'employee',
  status: 'active',
  department: 'PT-THIF',
  managerId: 'usr_prabhat',
  managerName: 'Vivek Agarwal',
  campus: 'MBRDI Bengaluru Hub',
  initials: 'TM',
  experienceYears: 6,
  primarySkills: ['Playwright', 'TypeScript', 'API Testing', 'CI Pipelines', 'Test Data Management', 'Postman', 'SQL'],
  interests: ['Contract Testing', 'Flaky Test Elimination', 'Test Reporting', 'Shift-Left Quality'],
  availableFor: ['Automation Support', 'Test Pipeline Setup', 'API Test Coverage', 'Regression Runs'],
  typicalAvailability: '4–6 hours/week',
  currentAvailabilityHoursThisWeek: 5,
  contributionScore: 4.81,
  ratingBreakdown: { helping: 4.85, technicalExpertise: 4.8, collaboration: 4.8, reliability: 4.8 },
  badges: [
    { id: 'b_rg1', name: 'Flake Hunter', icon: '🔍', description: 'Took the CI suite from 12% flaky runs to under 1%', dateEarned: 'Jan 2026' }
  ],
  collaborationsCount: 9,
  departmentsSupportedCount: 4,
  peopleHelpedCount: 14,
  hoursContributed: 34,
  bio: 'QA automation engineer focused on keeping the pipeline trustworthy. Writes the Playwright and API suites that stop regressions before the release gate.'
};

export const INITIAL_USER_ACCOUNTS: UserAccount[] = [
  // Platform service account
  ADMIN_USER,
  // Leadership
  MANAGER_NARESH,
  MANAGER_SANILA,
  MANAGER_IRFAN,
  // Line managers
  MANAGER_KALYAN,
  MANAGER_SWATI,
  MANAGER_NITIN,
  MANAGER_PRABHAT,
  // Kalyan's squad
  CURRENT_USER,
  EMP_RAKESH,
  EMP_SANGEETA,
  EMP_UPASANA,
  EMP_ISHANA,
  EMP_SUNIL,
  EMP_RASHMI,
  EMP_SHITAL,
  EMP_AMAN,
  // Swati's squad
  EMP_AMITH,
  EMP_ROHIT_SHET,
  // Nitin's squad
  EMP_AVINASH,
  EMP_SOUMYA,
  // Prabhat's squad
  EMP_PAWAN,
  EMP_RAGHAV
];

export const INITIAL_TALENT_PROFILES: TalentProfile[] = INITIAL_USER_ACCOUNTS;
export const EXPERTS_LIST: TalentProfile[] = INITIAL_USER_ACCOUNTS;

export const INITIAL_DIRECT_MESSAGES: DirectMessage[] = [
  {
    id: 'msg_1',
    senderId: 'usr_sangeeta',
    senderName: 'Neha Kulkarni',
    senderInitials: 'NK',
    senderRole: 'Senior AI / Data Architect',
    recipientId: 'usr_rakesh',
    recipientName: 'Karthik Iyer',
    recipientInitials: 'KI',
    recipientRole: 'Lead DevOps Engineer',
    text: 'Hi Rakesh, thank you for the tips on AKS private cluster DNS. The GenAI copilot search latency dropped from 420ms to 65ms after we configured internal endpoint caching!',
    timestamp: Date.now() - 3600000 * 3,
    time: '3h ago',
    read: false,
    contextType: 'work',
    contextTitle: 'GenAI Knowledge Graph Latency Optimization',
    contextId: 102
  },
  {
    id: 'msg_2',
    senderId: 'usr_rakesh',
    senderName: 'Karthik Iyer',
    senderInitials: 'KI',
    senderRole: 'Lead DevOps Engineer',
    recipientId: 'usr_sangeeta',
    recipientName: 'Neha Kulkarni',
    recipientInitials: 'NK',
    recipientRole: 'Senior AI / Data Architect',
    text: 'That is fantastic news, Priya! Let me know if you need automated Helm charts for the semantic vector indexing pipeline.',
    timestamp: Date.now() - 3600000 * 2,
    time: '2h ago',
    read: true,
    contextType: 'work',
    contextTitle: 'GenAI Knowledge Graph Latency Optimization',
    contextId: 102
  },
  {
    id: 'msg_3',
    senderId: 'usr_kalyan',
    senderName: 'Vikram Subramanian',
    senderInitials: 'VS',
    senderRole: 'Engineering Manager & Tech Lead',
    recipientId: 'usr_rakesh',
    recipientName: 'Karthik Iyer',
    recipientInitials: 'KI',
    recipientRole: 'Lead DevOps Engineer',
    text: 'Hi Rakesh, I approved your 8-hour cross-department collaboration request for PT-THIA. Great to see our cloud patterns being leveraged by AI squads.',
    timestamp: Date.now() - 3600000 * 5,
    time: '5h ago',
    read: false,
    contextType: 'collab',
    contextTitle: 'Manager Approval: PT-THIA Cross-Collaboration'
  },
  {
    id: 'msg_4',
    senderId: 'usr_rohit',
    senderName: 'Arjun Mehta',
    senderInitials: 'AM',
    senderRole: 'Data Engineering Specialist',
    recipientId: 'usr_kalyan',
    recipientName: 'Vikram Subramanian',
    recipientInitials: 'VS',
    recipientRole: 'Engineering Manager & Tech Lead',
    text: 'Hi Elena, I submitted a request to support the Powertrain Telemetry Pipeline gig for 6 hours next week. My sprint commitments for MBRDI Kafka streaming are on track.',
    timestamp: Date.now() - 3600000 * 1,
    time: '1h ago',
    read: false,
    contextType: 'collab',
    contextTitle: 'Approval Request: Powertrain Telemetry Pipeline'
  },
  {
    id: 'msg_5',
    senderId: 'usr_upasana',
    senderName: 'Divya Krishnan',
    senderInitials: 'DK',
    senderRole: 'Embedded & AUTOSAR Engineer',
    recipientId: 'usr_nitin',
    recipientName: 'Ajay Bhatnagar',
    recipientInitials: 'AB',
    recipientRole: 'Principal Functional Safety & Tech Lead',
    text: 'Dr. Brandner, the ECU CAN-FD stack validation on the Sindelfingen test bench is ready for your safety sign-off.',
    timestamp: Date.now() - 3600000 * 4,
    time: '4h ago',
    read: false,
    contextType: 'work',
    contextTitle: 'CAN-FD Telemetry Safety Review'
  },
  {
    id: 'msg_6',
    senderId: 'usr_ishana',
    senderName: 'Ananya Reddy',
    senderInitials: 'AR',
    senderRole: 'Cloud Security & Compliance Engineer',
    recipientId: 'usr_swati',
    recipientName: 'Chitra Subramaniam',
    recipientInitials: 'CS',
    recipientRole: 'Head of Software Strategy',
    text: 'Clara, the automated IAM role segregation audit across our Azure Landing Zones passed all CIS benchmarks.',
    timestamp: Date.now() - 3600000 * 6,
    time: '6h ago',
    read: false,
    contextType: 'general',
    contextTitle: 'Cloud Security Audit Status'
  },
  {
    id: 'msg_7',
    senderId: 'usr_nitin',
    senderName: 'Ajay Bhatnagar',
    senderInitials: 'AB',
    senderRole: 'Principal Functional Safety & Tech Lead',
    recipientId: 'usr_naresh',
    recipientName: 'Rajesh Deshmukh',
    recipientInitials: 'RD',
    recipientRole: 'Head of Enterprise Platform',
    text: 'Markus, the cross-department HiL test validation sharing between PT-THIG and PT-THIE has saved approximately 180 engineering hours this quarter.',
    timestamp: Date.now() - 3600000 * 24,
    time: '1d ago',
    read: true,
    contextType: 'general',
    contextTitle: 'Quarterly Cross-Department Mobility Metrics'
  }
];

export const INITIAL_USER_SAVED_MAP: UserSavedMap = {
  usr_rakesh: {
    workIds: [102, 105],
    listingIds: [201, 203],
    communityIds: [301],
    carpoolIds: ['ride_2', 'ride_5']
  },
  usr_sangeeta: {
    workIds: [101, 104],
    listingIds: [205],
    communityIds: [301],
    carpoolIds: ['ride_1']
  },
  usr_kalyan: {
    workIds: [101, 102, 107],
    listingIds: [202],
    communityIds: [301],
    carpoolIds: ['ride_3']
  },
  usr_swati: {
    workIds: [102, 106],
    listingIds: [204],
    communityIds: [302],
    carpoolIds: ['ride_4']
  },
  usr_nitin: {
    workIds: [103, 108],
    listingIds: [201],
    communityIds: [303],
    carpoolIds: ['ride_3']
  },
  usr_naresh: {
    workIds: [101, 108, 110],
    listingIds: [201, 202],
    communityIds: [301, 302],
    carpoolIds: ['ride_1', 'ride_3']
  }
};

export const INITIAL_COLLABORATION_REQUESTS: CollaborationRequest[] = [
  {
    id: 'collab_1',
    requesterId: 'usr_sangeeta',
    requesterName: 'Neha Kulkarni',
    requesterRole: 'Senior AI / Data Architect',
    requesterDepartment: 'PT-THIA',
    targetTalentId: 'usr_rakesh',
    targetTalentName: 'Karthik Iyer',
    targetDepartment: 'PT-THIS',
    taskTitle: 'Terraform & EKS Automation for GenAI Knowledge Graph Cluster',
    estimatedHours: '8 hours (2 sessions)',
    dates: '24–26 Aug 2026',
    notes: 'Need expert DevOps review for provisioning private EKS node groups with GPU acceleration for local LLM inference.',
    status: 'accepted',
    timestamp: Date.now() - 3600000 * 24,
    time: 'Yesterday'
  },
  {
    id: 'collab_2',
    requesterId: 'usr_ishana',
    requesterName: 'Ananya Reddy',
    requesterRole: 'Simulation & CAE Engineer',
    requesterDepartment: 'PT-THIM',
    targetTalentId: 'usr_upasana',
    targetTalentName: 'Divya Krishnan',
    targetDepartment: 'PT-THIE',
    taskTitle: 'Simulink to AUTOSAR C Code Generation Verification',
    estimatedHours: '6 hours',
    dates: '28 Aug 2026',
    notes: 'Validating generated C algorithms on motor inverter firmware loops.',
    status: 'pending',
    timestamp: Date.now() - 3600000 * 6,
    time: '6h ago'
  }
];

export const INITIAL_WORK_POSTS: WorkPost[] = [
  {
    id: 101,
    title: 'Need DevOps Engineer – Deployment Automation on AWS & EKS',
    department: 'PT-THIS',
    team: 'PT-THIS Cloud Infrastructure',
    status: 'Open',
    urgency: 'Medium',
    duration: '2 days',
    expectedEffortHours: '8–12 hours',
    location: 'MBRDI Bengaluru Hub / Hybrid',
    managerApprovalRequired: true,
    managerApprovalStatus: 'not_requested',
    votes: 8,
    voteState: 0,
    tags: ['AWS', 'Terraform', 'Kubernetes', 'GitHub Actions', 'CI/CD'],
    author: 'Amit Sharma',
    role: 'Engineering Lead',
    initials: 'AS',
    time: '2 hours ago',
    timestamp: Date.now() - 7200000,
    description: `We are migrating our internal telemetry and currency settlement services to AWS EKS and need a seasoned DevOps engineer from PT-THIS or peer departments for 2 days to review our Terraform modules, automate GitHub Actions pipelines with OIDC, and ensure security compliance with corporate landing zones.`,
    whyOpportunity: `• Automate deployment pipeline for critical PT-THIS microservices\n• Improve release reliability and zero-downtime rolling updates\n• Share best practices with junior platform engineers`,
    contactPref: 'both',
    matchScore: 94,
    matchReason: 'Direct match with your skills in AWS, Terraform, Kubernetes and CI/CD.',
    applicantCount: 3,
    hasApplied: false,
    comments: [
      {
        id: 'c101_1',
        author: 'Karthik Iyer',
        role: 'Lead DevOps Engineer',
        initials: 'KI',
        time: '1 hour ago',
        timestamp: Date.now() - 3600000,
        text: 'I have standard Terraform modules for AWS OIDC authentication with GitHub Actions that we deployed in PT-THIS Cloud Infra. Happy to pair on this!'
      }
    ]
  },
  {
    id: 102,
    title: 'Need AI Specialist for 3 days — Diagnostic Copilot & RAG Pipeline',
    department: 'PT-THIA',
    team: 'PT-THIA GenAI & Knowledge Engineering',
    status: 'Open',
    urgency: 'High',
    duration: '3 days',
    expectedEffortHours: '12–16 hours',
    location: 'MBRDI Bengaluru Hub / Hybrid',
    managerApprovalRequired: true,
    managerApprovalStatus: 'not_requested',
    votes: 14,
    voteState: 1,
    tags: ['Python', 'LLMs', 'RAG Architecture', 'Vector DB', 'FastAPI'],
    author: 'Dr. Sunita Lal',
    role: 'AI Research Lead',
    initials: 'SL',
    time: '4 hours ago',
    timestamp: Date.now() - 14400000,
    description: `We have 15,000 internal engineering diagnostic manuals and workshop guides. We need an AI / NLP specialist to help structure a high-performance RAG pipeline, optimize embedding retrieval benchmarks, and integrate with our internal LLM gateway.`,
    whyOpportunity: `• Build cutting-edge enterprise GenAI copilot for Mercedes-Benz India\n• Hands-on exposure to hybrid vector search architectures\n• High visibility with management showcase next month`,
    contactPref: 'both',
    matchScore: 88,
    matchReason: 'Enterprise AI architecture, knowledge graphs, and scalable API backend.',
    applicantCount: 4,
    hasApplied: false,
    comments: [
      {
        id: 'c102_1',
        author: 'Neha Kulkarni',
        role: 'Senior AI / Data Architect',
        initials: 'NK',
        time: '3 hours ago',
        timestamp: Date.now() - 10800000,
        text: 'I built the semantic search pipeline in PT-THIA last quarter. Let me know if you want to reuse our vector indexer.'
      }
    ]
  },
  {
    id: 103,
    title: 'Thermal runaway simulation in Simulink — Model Validation & CAE Pairing',
    department: 'PT-THIM',
    team: 'PT-THIM CAE & Plant Simulation',
    status: 'In Progress',
    urgency: 'Critical',
    duration: '1 day',
    expectedEffortHours: '6–8 hours',
    location: 'MBRDI Pune Powertrain Center',
    managerApprovalRequired: true,
    managerApprovalStatus: 'approved',
    votes: 11,
    voteState: 0,
    tags: ['MATLAB', 'Simulink', 'Thermal Modeling', 'Digital Twin', 'ANSYS'],
    author: 'Deepak Rana',
    role: 'Simulation Specialist',
    initials: 'DR',
    time: 'Yesterday',
    timestamp: Date.now() - 86400000,
    description: `Need an experienced Simulink & thermal engineer from PT-THIM or PT-THIE to sanity check our multi-cell heat dissipation models under 350kW DC fast-charging stress scenarios. Specifically checking convective coefficient lookup tables and cell-to-cell thermal propagation.`,
    whyOpportunity: `• Validate core safety models for upcoming generation platform\n• Cross-pollinate thermal modeling methodologies across PT-THIM and PT-THIE teams`,
    contactPref: 'direct',
    matchScore: 65,
    matchReason: 'Hardware simulation and thermal safety modeling.',
    applicantCount: 2,
    hasApplied: false,
    comments: []
  },
  {
    id: 104,
    title: 'Telemetry Kafka Streaming Optimization — Real-time Fleet Ingestion',
    department: 'PT-THID',
    team: 'PT-THID Telemetry & Data Platform',
    status: 'Open',
    urgency: 'Medium',
    duration: '2 days',
    expectedEffortHours: '8–10 hours',
    location: 'MBRDI Bengaluru Hub',
    managerApprovalRequired: false,
    votes: 19,
    voteState: 0,
    tags: ['Kafka', 'Spark', 'Python', 'Databricks', 'Data Pipelines'],
    author: 'Arjun Mehta',
    role: 'Data Engineering Specialist',
    initials: 'AM',
    time: '1 day ago',
    timestamp: Date.now() - 95000000,
    description: `Our vehicle sensor ingestion stream is scaling to 50M records/day across test vehicles. Looking for a peer review on Kafka partition sizing, consumer group rebalancing policies, and Spark streaming batch windows.`,
    whyOpportunity: `• Scale enterprise connected vehicle analytics across MBRDI\n• Peer review high-throughput streaming architecture`,
    contactPref: 'both',
    matchScore: 82,
    matchReason: 'Matches data platform engineering and distributed messaging architecture.',
    applicantCount: 5,
    hasApplied: false,
    comments: []
  },
  {
    id: 105,
    title: 'Cybersecurity Threat Modeling on Connected Fleet Telematics API',
    department: 'PT-THIT',
    team: 'PT-THIT Enterprise Cloud Security',
    status: 'Open',
    urgency: 'High',
    duration: '1–2 days',
    expectedEffortHours: '8–12 hours',
    location: 'MBRDI Bengaluru & Remote',
    managerApprovalRequired: true,
    votes: 9,
    voteState: 0,
    tags: ['Security', 'Zero-Trust', 'OAuth2', 'API Gateway', 'Threat Modeling'],
    author: 'Farhan Wagh',
    role: 'Security Engineer',
    initials: 'FW',
    time: '2 days ago',
    timestamp: Date.now() - 172800000,
    description: `Conducting threat modeling and STRIDE analysis on our new cloud telematics API handling remote vehicle pre-conditioning. Looking for a security architect or senior backend lead from PT-THIT / PT-THIS to review OAuth2 token exchange flows and rate-limiting safeguards.`,
    contactPref: 'both',
    matchScore: 88,
    matchReason: 'Matches your cloud security and API gateway architecture background.',
    applicantCount: 2,
    hasApplied: false,
    comments: []
  },
  {
    id: 106,
    title: 'AUTOSAR ECU CAN-FD Protocol Stacks & Motor Controller Debugging',
    department: 'PT-THIE',
    team: 'PT-THIE ECU Firmware & RTOS',
    status: 'Open',
    urgency: 'High',
    duration: '2 days',
    expectedEffortHours: '10–14 hours',
    location: 'MBRDI Whitefield Campus',
    managerApprovalRequired: true,
    managerApprovalStatus: 'not_requested',
    votes: 12,
    voteState: 0,
    tags: ['AUTOSAR', 'Embedded C', 'CAN Bus', 'C++', 'ECU Software'],
    author: 'Divya Krishnan',
    role: 'Embedded & AUTOSAR Engineer',
    initials: 'DK',
    time: '3 hours ago',
    timestamp: Date.now() - 10800000,
    description: `Need an embedded systems peer to assist in debugging CAN-FD message timing delays during high-voltage inverter state transitions. Experience with Vector CANoe and AUTOSAR OS task prioritization needed.`,
    whyOpportunity: `• Accelerate power inverter firmware delivery for MBI EV prototypes\n• Work directly with Vector CANoe test benches`,
    contactPref: 'both',
    matchScore: 74,
    matchReason: 'Embedded systems and real-time communications.',
    applicantCount: 3,
    hasApplied: false,
    comments: []
  },
  {
    id: 107,
    title: 'Agile Release Governance & Cross-Squad Dependency Mapping',
    department: 'PT-THIP',
    team: 'PT-THIP Agile Governance & Delivery',
    status: 'Open',
    urgency: 'Medium',
    duration: '1 day',
    expectedEffortHours: '4–6 hours',
    location: 'MBRDI Bengaluru Hub',
    managerApprovalRequired: false,
    votes: 7,
    voteState: 0,
    tags: ['Agile Transformation', 'Jira / Confluence', 'Release Governance', 'Product Strategy'],
    author: 'Priya Malhotra',
    role: 'Agile Product & Governance Lead',
    initials: 'PM',
    time: '5 hours ago',
    timestamp: Date.now() - 18000000,
    description: `Looking for agile champions across PT-TH squads to standardize quarterly PI planning dependency boards and automate release readiness checklists in Jira.`,
    whyOpportunity: `• Streamline cross-departmental alignment across all PT-TH units\n• Share agile scaling best practices`,
    contactPref: 'both',
    matchScore: 70,
    matchReason: 'Process optimization and cross-department collaboration.',
    applicantCount: 2,
    hasApplied: false,
    comments: []
  },
  {
    id: 108,
    title: 'Automated HiL Rig Test Suite & dSPACE Scripting for Inverter Validation',
    department: 'PT-THIG',
    team: 'PT-THIG Virtual Validation & HiL Test Benches',
    status: 'Open',
    urgency: 'High',
    duration: '2–3 days',
    expectedEffortHours: '10–16 hours',
    location: 'MBRDI Bengaluru Hub & Test Lab',
    managerApprovalRequired: true,
    managerApprovalStatus: 'not_requested',
    votes: 11,
    voteState: 0,
    tags: ['Hardware-in-the-Loop', 'dSPACE', 'Python Automation', 'CAPL', 'CANoe'],
    author: 'Suresh Pillai',
    role: 'Lead HiL & Test Bench Architect',
    initials: 'SP',
    time: '2 hours ago',
    timestamp: Date.now() - 7200000,
    description: `Setting up automated regression test harnesses on our dSPACE Scalexio HiL benches for the new generation electric drive unit. Seeking a testing or automation engineer from PT-THIG, PT-THIE, or PT-THIS to pair on CAPL scripts, automated fault-injection pipelines, and test bench health monitoring.`,
    whyOpportunity: `• Scale automated Hardware-in-the-Loop continuous validation across Mercedes-Benz EV programs\n• Work directly on state-of-the-art dSPACE Scalexio test rigs\n• Cross-pollinate automation frameworks across test squads`,
    contactPref: 'both',
    matchScore: 86,
    matchReason: 'Virtual validation, automated test harness scripting, and test bench architecture.',
    applicantCount: 2,
    hasApplied: false,
    comments: []
  },
  {
    id: 109,
    title: 'INCA / CANape ECU Calibration Optimization for Permanent Magnet Motor Control',
    department: 'PT-THIC',
    team: 'PT-THIC Powertrain Controls & Calibration',
    status: 'Open',
    urgency: 'Medium',
    duration: '2 days',
    expectedEffortHours: '8–12 hours',
    location: 'MBRDI Bengaluru & Pune Test Track',
    managerApprovalRequired: true,
    managerApprovalStatus: 'not_requested',
    votes: 15,
    voteState: 0,
    tags: ['INCA / CANape', 'ECU Calibration', 'Motor Control', 'MATLAB', 'Simulink'],
    author: 'Kavya Nair',
    role: 'Senior Powertrain Controls & Calibration Specialist',
    initials: 'KN',
    time: '4 hours ago',
    timestamp: Date.now() - 14400000,
    description: `Optimizing MTPA (Maximum Torque Per Ampere) calibration maps and field weakening algorithms under dynamic chassis dynamometer load profiles. Looking for a powertrain controls specialist from PT-THIC or PT-THIM for 2 days of data analysis, INCA curve tuning, and thermal boundary checks.`,
    whyOpportunity: `• Direct impact on electric drive efficiency and thermal management\n• Collaborate between controls calibration and simulation teams`,
    contactPref: 'both',
    matchScore: 84,
    matchReason: 'Powertrain motor controls, dynamometer calibration, and MATLAB simulation.',
    applicantCount: 3,
    hasApplied: false,
    comments: []
  },
  {
    id: 110,
    title: 'ISO 26262 ASIL D Safety Architecture Review — Fuel Cell & High-Voltage Disconnect',
    department: 'PT-THIF',
    team: 'PT-THIF Safety Governance & Future Powertrain',
    status: 'Open',
    urgency: 'Critical',
    duration: '2 days',
    expectedEffortHours: '8–12 hours',
    location: 'MBRDI Bengaluru & Stuttgart Cell',
    managerApprovalRequired: true,
    managerApprovalStatus: 'not_requested',
    votes: 13,
    voteState: 0,
    tags: ['ISO 26262', 'Functional Safety', 'ASIL D', 'HARA', 'Safety Architecture'],
    author: 'Ajay Bhatnagar',
    role: 'Principal Functional Safety & Future Tech Lead',
    initials: 'AB',
    time: '1 day ago',
    timestamp: Date.now() - 86400000,
    description: `Conducting safety case reviews and quantitative FMEDA audits on the high-voltage pyrofuse and hydrogen fuel cell emergency isolation controllers. Need an experienced safety engineer or systems architect for cross-departmental peer review of our technical safety requirements (TSR).`,
    whyOpportunity: `• High-impact safety assurance for future zero-emission propulsion platforms\n• Deep exposure to ISO 26262 ASIL D decomposition and safety case audits`,
    contactPref: 'both',
    matchScore: 78,
    matchReason: 'Safety-critical systems, ISO 26262 governance, and high-voltage platform review.',
    applicantCount: 1,
    hasApplied: false,
    comments: []
  },
  {
    id: 111,
    title: 'Angular 19 migration — shared component library upgrade',
    department: 'PT-THIP',
    team: 'PT-THIP Digital Products',
    status: 'Open',
    urgency: 'High',
    duration: '3 days',
    expectedEffortHours: '10–14 hours',
    location: 'MBRDI Bengaluru Hub / Hybrid',
    managerApprovalRequired: true,
    managerApprovalStatus: 'not_requested',
    votes: 11,
    voteState: 0,
    tags: ['Angular', 'TypeScript', 'RxJS', 'Design Systems', 'SCSS'],
    author: 'Manoj Verma',
    role: 'Engineering Lead',
    initials: 'MV',
    time: '3 hours ago',
    timestamp: Date.now() - 10800000,
    description: `Our internal ordering portal is stuck on Angular 15 and the shared component library has drifted from the corporate design tokens. We need a front-end pair for three days to plan and execute the upgrade, replace deprecated RxJS operators, and re-align the component styles with the shared token set.`,
    whyOpportunity: `• Unblock four squads still pinned to the old library version\n• Hands-on with a large-scale Angular migration\n• Shape the shared component API other teams build on`,
    contactPref: 'both',
    matchScore: 0,
    matchReason: '',
    applicantCount: 2,
    hasApplied: false,
    comments: []
  },
  {
    id: 112,
    title: '.NET Core API performance review — slow settlement endpoints',
    department: 'PT-THIT',
    team: 'PT-THIT Enterprise Services',
    status: 'Open',
    urgency: 'High',
    duration: '2 days',
    expectedEffortHours: '6–10 hours',
    location: 'Remote / Hybrid',
    managerApprovalRequired: true,
    managerApprovalStatus: 'not_requested',
    votes: 9,
    voteState: 0,
    tags: ['C#', '.NET Core', 'Entity Framework', 'SQL Server', 'Performance Tuning'],
    author: 'Deepak Rana',
    role: 'Systems Engineer',
    initials: 'DR',
    time: '5 hours ago',
    timestamp: Date.now() - 18000000,
    description: `Three settlement endpoints degraded from 200ms to over 4 seconds after our last release. We suspect N+1 queries in the EF Core layer and missing indexes, but we need someone with deep .NET and SQL Server profiling experience to confirm the cause and propose the fix.`,
    whyOpportunity: `• Concrete, measurable win — restore endpoints to sub-second\n• Work with production profiling traces on a live system\n• Leave the team with a repeatable query-review checklist`,
    contactPref: 'both',
    matchScore: 0,
    matchReason: '',
    applicantCount: 1,
    hasApplied: false,
    comments: []
  },
  {
    id: 113,
    title: 'Playwright end-to-end suite for the supplier portal',
    department: 'PT-THIA',
    team: 'PT-THIA Platform Engineering',
    status: 'Open',
    urgency: 'Medium',
    duration: '4 days',
    expectedEffortHours: '8–12 hours',
    location: 'MBRDI Bengaluru Hub / Hybrid',
    managerApprovalRequired: true,
    managerApprovalStatus: 'not_requested',
    votes: 7,
    voteState: 0,
    tags: ['Playwright', 'TypeScript', 'Test Automation', 'API Testing', 'CI/CD'],
    author: 'Farhan Wagh',
    role: 'Operations Lead',
    initials: 'FW',
    time: '1 day ago',
    timestamp: Date.now() - 86400000,
    description: `The supplier portal is regression-tested entirely by hand before every release, which costs us two days per cycle. We are looking for help standing up a Playwright suite covering the six critical journeys, wired into our existing GitHub Actions pipeline.`,
    whyOpportunity: `• Remove two days of manual regression from every release\n• Design the automation framework from a clean slate\n• Coach the team's testers on maintaining it afterwards`,
    contactPref: 'both',
    matchScore: 0,
    matchReason: '',
    applicantCount: 2,
    hasApplied: false,
    comments: []
  },
  {
    id: 114,
    title: 'Power BI capacity dashboard for engineering leadership',
    department: 'PT-THID',
    team: 'PT-THID Data & Analytics',
    status: 'Open',
    urgency: 'Medium',
    duration: '3 days',
    expectedEffortHours: '6–10 hours',
    location: 'MBRDI Whitefield Hub / Hybrid',
    managerApprovalRequired: true,
    managerApprovalStatus: 'not_requested',
    votes: 6,
    voteState: 0,
    tags: ['Power BI', 'SQL', 'Data Modelling', 'ETL', 'Azure Data Factory'],
    author: 'Siddharth Bose',
    role: 'Head of Software Strategy',
    initials: 'SB',
    time: '1 day ago',
    timestamp: Date.now() - 90000000,
    description: `Leadership currently assembles headcount and capacity numbers by hand from four different exports. We want a modelled dataset and a Power BI dashboard that answers "where is capacity going" without a spreadsheet in the loop.`,
    whyOpportunity: `• Replace a recurring manual report with a live dashboard\n• Model data that several departments will consume\n• Direct exposure to engineering leadership stakeholders`,
    contactPref: 'both',
    matchScore: 0,
    matchReason: '',
    applicantCount: 1,
    hasApplied: false,
    comments: []
  },
  {
    id: 115,
    title: 'Accessibility audit — WCAG AA for the internal booking tool',
    department: 'PT-THIE',
    team: 'PT-THIE Workplace Systems',
    status: 'Open',
    urgency: 'Low',
    duration: '2 days',
    expectedEffortHours: '4–8 hours',
    location: 'Remote / Hybrid',
    managerApprovalRequired: true,
    managerApprovalStatus: 'not_requested',
    votes: 5,
    voteState: 0,
    tags: ['Accessibility (WCAG)', 'Angular', 'Usability Testing', 'Design Systems'],
    author: 'Chitra Subramaniam',
    role: 'UX / UI Designer',
    initials: 'CS',
    time: '2 days ago',
    timestamp: Date.now() - 172800000,
    description: `Our internal room-booking tool has never been audited for accessibility and we have a compliance review next quarter. We need someone to run a WCAG AA audit, document the gaps with severity, and pair with our developers on the highest-impact fixes.`,
    whyOpportunity: `• Make a daily-use internal tool usable for everyone\n• Clear, well-scoped deliverable with a defined standard\n• Build accessibility capability inside the owning team`,
    contactPref: 'both',
    matchScore: 0,
    matchReason: '',
    applicantCount: 1,
    hasApplied: false,
    comments: []
  },
  {
    id: 116,
    title: 'Kubernetes cost and reliability review — non-prod clusters',
    department: 'PT-THIG',
    team: 'PT-THIG Test Systems',
    status: 'Open',
    urgency: 'Medium',
    duration: '2 days',
    expectedEffortHours: '6–8 hours',
    location: 'Remote / Hybrid',
    managerApprovalRequired: true,
    managerApprovalStatus: 'not_requested',
    votes: 8,
    voteState: 0,
    tags: ['Kubernetes', 'Terraform', 'Prometheus', 'Grafana', 'Cost Optimisation'],
    author: 'Meera Lakshmanan',
    role: 'Cloud Architect',
    initials: 'ML',
    time: '2 days ago',
    timestamp: Date.now() - 180000000,
    description: `Our non-production clusters cost more than production and nobody is sure why. We want a second pair of eyes on resource requests, autoscaling configuration, and idle workloads, plus a view on whether our alerting would actually catch a real outage.`,
    whyOpportunity: `• Immediate, quantifiable infrastructure savings\n• Shape the observability baseline for a whole environment\n• Cross-pollinate platform practice between departments`,
    contactPref: 'both',
    matchScore: 0,
    matchReason: '',
    applicantCount: 2,
    hasApplied: false,
    comments: []
  }
];

export const INITIAL_BANDWIDTH_OFFERS: BandwidthOffer[] = [
  {
    id: 'bo_1',
    author: 'Karthik Iyer',
    role: 'Lead DevOps Engineer',
    department: 'PT-THIS',
    initials: 'KI',
    availableHours: '6 hours this month',
    skillsOffered: ['AWS', 'Kubernetes', 'Terraform', 'CI/CD Pipelines'],
    notes: 'Available for short architecture reviews, Terraform modularization, or EKS onboarding support across PT-TH departments.',
    time: 'Today',
    timestamp: Date.now() - 3600000
  },
  {
    id: 'bo_2',
    author: 'Neha Kulkarni',
    role: 'Senior AI / Data Architect',
    department: 'PT-THIA',
    initials: 'NK',
    availableHours: '8 hours this month',
    skillsOffered: ['Python', 'LLMs', 'RAG Architecture', 'Knowledge Graphs'],
    notes: 'Happy to help teams integrate GenAI copilots, evaluate embedding models, or review knowledge graph schemas.',
    time: 'Yesterday',
    timestamp: Date.now() - 86400000
  },
  {
    id: 'bo_3',
    author: 'Arjun Mehta',
    role: 'Data Engineering Specialist',
    department: 'PT-THID',
    initials: 'AM',
    availableHours: '4 hours this month',
    skillsOffered: ['Python', 'Spark', 'Kafka', 'Databricks'],
    notes: 'Available for guidance on Kafka stream sizing, ETL pipeline optimizations, and telemetry data lakehouse architecture.',
    time: '2 days ago',
    timestamp: Date.now() - 172800000
  },
  {
    id: 'bo_4',
    author: 'Divya Krishnan',
    role: 'Embedded & AUTOSAR Engineer',
    department: 'PT-THIE',
    initials: 'DK',
    availableHours: '5 hours this month',
    skillsOffered: ['AUTOSAR', 'Embedded C', 'CAN Bus', 'ECU Software'],
    notes: 'Available to support peer squads on CAN bus protocol debugging, RTOS task timing, and firmware code reviews.',
    time: '3 days ago',
    timestamp: Date.now() - 259200000
  },
  {
    id: 'bo_5',
    author: 'Suresh Pillai',
    role: 'Lead HiL & Test Bench Architect',
    department: 'PT-THIG',
    initials: 'SP',
    availableHours: '6 hours this month',
    skillsOffered: ['dSPACE', 'Hardware-in-the-Loop', 'Vector VT System', 'CAPL Scripting'],
    notes: 'Available to assist squads on automated test bench configuration, dSPACE Scalexio setup, and fault injection tests.',
    time: 'Today',
    timestamp: Date.now() - 1800000
  },
  {
    id: 'bo_6',
    author: 'Kavya Nair',
    role: 'Senior Powertrain Controls & Calibration Specialist',
    department: 'PT-THIC',
    initials: 'KN',
    availableHours: '5 hours this month',
    skillsOffered: ['INCA / CANape', 'ECU Calibration', 'Motor Control', 'Simulink'],
    notes: 'Available for motor drive tuning consultations, INCA calibration dataset reviews, and dynamometer data evaluations.',
    time: 'Yesterday',
    timestamp: Date.now() - 82000000
  },
  {
    id: 'bo_7',
    author: 'Ajay Bhatnagar',
    role: 'Principal Functional Safety & Future Tech Lead',
    department: 'PT-THIF',
    initials: 'AB',
    availableHours: '4 hours this month',
    skillsOffered: ['ISO 26262', 'Functional Safety', 'ASIL D Concepts', 'HARA Analysis'],
    notes: 'Available for technical safety requirement audits, ISO 26262 stage-gate pre-checks, and fuel cell safety hazard assessments.',
    time: '2 days ago',
    timestamp: Date.now() - 170000000
  }
];

export const INITIAL_MANAGER_APPROVALS: ManagerApprovalItem[] = [
  {
    id: 'mng_app_1',
    employeeId: 'usr_rakesh',
    employeeName: 'Karthik Iyer',
    employeeRole: 'Lead DevOps Engineer',
    employeeDepartment: 'PT-THIS',
    managerId: 'usr_kalyan',
    opportunityId: 101,
    opportunityTitle: 'Need DevOps Engineer – Deployment Automation on AWS & EKS',
    targetDepartment: 'PT-THIA',
    requestedCommitment: '8 hours',
    period: '20–22 Aug 2026',
    currentProject: 'Cloud Foundation Platform & MBRDI Kubernetes',
    aiRecommendation: 'Approve',
    aiRecommendationReason: 'Rakesh has 6 declared available hours this sprint, zero sprint blockers in Jira, and high cross-department feedback (⭐ 4.82/5).',
    status: 'Pending',
    requestedAt: '1 hour ago'
  },
  {
    id: 'mng_app_2',
    employeeId: 'usr_rohit',
    employeeName: 'Arjun Mehta',
    employeeRole: 'Full Stack Developer',
    employeeDepartment: 'PT-THIS',
    managerId: 'usr_kalyan',
    opportunityId: 104,
    opportunityTitle: 'Powertrain Telemetry Pipeline – Kafka & Snowflake Streaming',
    targetDepartment: 'PT-THID',
    requestedCommitment: '6 hours',
    period: '23–25 Aug 2026',
    currentProject: 'Vehicle Diagnostic Data Ingestion Pipeline',
    aiRecommendation: 'Approve',
    aiRecommendationReason: 'Arjun completed 100% of sprint deliverables 2 days ahead of schedule. Cross-functional data sharing will accelerate PT-THID roadmap.',
    status: 'Pending',
    requestedAt: '3 hours ago'
  },
  {
    id: 'mng_app_3',
    employeeId: 'usr_sangeeta',
    employeeName: 'Neha Kulkarni',
    employeeRole: 'Product Owner',
    employeeDepartment: 'PT-THIA',
    managerId: 'usr_kalyan',
    opportunityId: 102,
    opportunityTitle: 'Need AI Specialist for 3 days — Diagnostic Copilot & RAG Pipeline',
    targetDepartment: 'PT-THID',
    requestedCommitment: '12 hours',
    period: '22–25 Aug 2026',
    currentProject: 'Diagnostic LLM Copilot Gateway',
    aiRecommendation: 'Approve',
    aiRecommendationReason: 'High synergy with primary team goals and accelerates telemetry analytics across both squads.',
    status: 'Approved',
    requestedAt: 'Yesterday',
    managerNotes: 'Approved. Great cross-department collaboration between PT-THIA and PT-THID.'
  },
  {
    id: 'mng_app_4',
    employeeId: 'usr_ishana',
    employeeName: 'Ananya Reddy',
    employeeRole: 'Full Stack Developer',
    employeeDepartment: 'PT-THIA',
    managerId: 'usr_kalyan',
    opportunityId: 108,
    opportunityTitle: 'Cloud Security Architecture Assessment — Zero Trust VPC Peering',
    targetDepartment: 'PT-THIT',
    requestedCommitment: '8 hours',
    period: '26–28 Aug 2026',
    currentProject: 'Azure Landing Zone Automated Governance',
    aiRecommendation: 'Approve',
    aiRecommendationReason: 'Anand holds Lead AWS & Azure Security certifications. Excellent knowledge transfer opportunity.',
    status: 'Pending',
    requestedAt: '4 hours ago'
  },
  {
    id: 'mng_app_5',
    employeeId: 'usr_upasana',
    employeeName: 'Divya Krishnan',
    employeeRole: 'Full Stack Developer',
    employeeDepartment: 'PT-THIG',
    managerId: 'usr_kalyan',
    opportunityId: 103,
    opportunityTitle: 'AUTOSAR Classic Migration for Battery Management System',
    targetDepartment: 'PT-THIB',
    requestedCommitment: '10 hours',
    period: '24–27 Aug 2026',
    currentProject: 'CAN-FD High-Speed Telemetry Stack',
    aiRecommendation: 'Approve with Conditions',
    aiRecommendationReason: 'Ensure Sindelfingen test bench HIL validation run on Thursday is not delayed.',
    status: 'Pending',
    requestedAt: '2 hours ago'
  },
  {
    id: 'mng_app_6',
    employeeId: 'usr_sunil',
    employeeName: 'Suresh Pillai',
    employeeRole: 'Senior Developer & Team Lead',
    employeeDepartment: 'PT-THIE',
    managerId: 'usr_kalyan',
    opportunityId: 105,
    opportunityTitle: 'Hardware-in-the-Loop Test Script Automation in Python/dSPACE',
    targetDepartment: 'PT-THIC',
    requestedCommitment: '8 hours',
    period: '25–28 Aug 2026',
    currentProject: 'dSPACE HiL Test Bench Automation',
    aiRecommendation: 'Approve',
    aiRecommendationReason: 'Strong domain alignment with dSPACE test automation frameworks.',
    status: 'Pending',
    requestedAt: '5 hours ago'
  }
];

export const INITIAL_CARPOOL_RIDES: CarpoolRide[] = [
  {
    id: 'ride_1',
    driverId: 'usr_rakesh',
    driverName: 'Karthik Iyer',
    driverRole: 'Lead DevOps Engineer',
    driverDepartment: 'PT-THIS',
    driverInitials: 'KI',
    driverRating: 4.9,
    origin: 'Indiranagar 100ft Road (Metro Gate 1)',
    destination: 'MBRDI Whitefield Campus (Building 3)',
    campus: 'MBRDI Whitefield Hub',
    departureTime: '08:15 AM',
    returnTime: '05:45 PM',
    scheduleType: 'Daily (Mon–Fri)',
    vehicleModel: 'Mercedes-Benz EQA 250+ (Electric)',
    vehicleType: 'Electric (EV)',
    totalSeats: 4,
    availableSeats: 2,
    passengers: [
      {
        id: 'usr_rohit',
        name: 'Arjun Mehta',
        role: 'Data Engineering Specialist',
        department: 'PT-THIS',
        initials: 'AM',
        status: 'confirmed'
      },
      {
        id: 'usr_sangeeta',
        name: 'Neha Kulkarni',
        role: 'Senior AI / Data Architect',
        department: 'PT-THIA',
        initials: 'NK',
        status: 'confirmed'
      }
    ],
    costSharingPerTrip: 'Free / Eco-Commute',
    notes: 'EV silent drive with Wi-Fi hotspot. Daily commute via Marathahalli flyover. Charging reserved at Whitefield Hub B2.',
    routeHighlights: ['Indiranagar Metro', 'HAL Old Airport Rd', 'Marathahalli Bridge', 'Whitefield Gate 3'],
    amenities: ['EV Zero Emissions', 'Climate Control AC', 'Quiet Work Mode', 'Device Fast Charger'],
    contactPref: 'chat',
    createdAt: Date.now() - 3600000 * 24
  },
  {
    id: 'ride_2',
    driverId: 'usr_kalyan',
    driverName: 'Vikram Subramanian',
    driverRole: 'Engineering Manager & Tech Lead',
    driverDepartment: 'PT-THIS',
    driverInitials: 'VS',
    driverRating: 5.0,
    origin: 'Koramangala 4th Block (Sony World Signal)',
    destination: 'MBRDI Whitefield Campus (Building 1)',
    campus: 'MBRDI Whitefield Hub',
    departureTime: '08:45 AM',
    returnTime: '06:15 PM',
    scheduleType: 'Mon, Wed, Fri',
    vehicleModel: 'Mercedes-Benz C 300e (PHEV)',
    vehicleType: 'Hybrid (PHEV)',
    totalSeats: 4,
    availableSeats: 3,
    passengers: [
      {
        id: 'usr_ishana',
        name: 'Ananya Reddy',
        role: 'Cloud Security Engineer',
        department: 'PT-THIA',
        initials: 'AR',
        status: 'confirmed'
      }
    ],
    costSharingPerTrip: 'Free / Eco-Commute',
    notes: 'Manager commute. Open to mentorship chats or silent morning prep. Non-smoking vehicle.',
    routeHighlights: ['Koramangala Ring Rd', 'Bellandur EcoSpace', 'ORR Mahadevapura', 'MBRDI Whitefield'],
    amenities: ['Hybrid Commute', 'Mentorship Friendly', 'Coffee Cup Holders', 'Spacious Trunk'],
    contactPref: 'chat',
    createdAt: Date.now() - 3600000 * 48
  },
  {
    id: 'ride_3',
    driverId: 'usr_nitin',
    driverName: 'Ajay Bhatnagar',
    driverRole: 'Principal Functional Safety & Tech Lead',
    driverDepartment: 'PT-THIG',
    driverInitials: 'AB',
    driverRating: 4.95,
    origin: 'Stuttgart Hbf / Charlottenplatz',
    destination: 'Sindelfingen Plant (Tor 3 R&D Center)',
    campus: 'Sindelfingen Plant & Tech Center',
    departureTime: '07:45 AM',
    returnTime: '04:45 PM',
    scheduleType: 'Daily (Mon–Fri)',
    vehicleModel: 'Mercedes-Benz EQS 450+ (Electric)',
    vehicleType: 'Electric (EV)',
    totalSeats: 4,
    availableSeats: 2,
    passengers: [
      {
        id: 'usr_upasana',
        name: 'Divya Krishnan',
        role: 'Embedded & AUTOSAR Engineer',
        department: 'PT-THIG',
        initials: 'DK',
        status: 'confirmed'
      },
      {
        id: 'usr_sunil',
        name: 'Suresh Pillai',
        role: 'HiL Test Specialist',
        department: 'PT-THIE',
        initials: 'SP',
        status: 'confirmed'
      }
    ],
    costSharingPerTrip: 'Free / Eco-Commute',
    notes: 'Sindelfingen daily R&D commute. Highway A81 corridor. Dedicated EV charging at Tor 3.',
    routeHighlights: ['Stuttgart Süd', 'Vaihingen Kreuz', 'Böblingen Nord', 'Sindelfingen Tor 3'],
    amenities: ['MBUX Hyperscreen Music', 'EV Silent Cruise', 'Heated/Cooled Seats', 'Spacious Trunk'],
    contactPref: 'chat',
    createdAt: Date.now() - 3600000 * 36
  },
  {
    id: 'ride_4',
    driverId: 'usr_swati',
    driverName: 'Chitra Subramaniam',
    driverRole: 'Head of Software Strategy',
    driverDepartment: 'PT-THIA',
    driverInitials: 'CS',
    driverRating: 4.98,
    origin: 'Tübingen Bahnhof / Lustnau',
    destination: 'Böblingen Tech Hub & R&D Campus',
    campus: 'Böblingen Tech Hub',
    departureTime: '08:00 AM',
    returnTime: '05:30 PM',
    scheduleType: 'Tue, Thu',
    vehicleModel: 'Mercedes-Benz EQE 350+ (Electric)',
    vehicleType: 'Electric (EV)',
    totalSeats: 4,
    availableSeats: 3,
    passengers: [],
    costSharingPerTrip: 'Free / Eco-Commute',
    notes: 'Tübingen to Böblingen fast commute. Ideal for software developers heading to the Tech Campus.',
    routeHighlights: ['Tübingen B27', 'Walddorfhäslach', 'Dettenhausen', 'Böblingen Flugfeld'],
    amenities: ['EV Clean Ride', 'Air Quality Plus Filter', 'Podcast Friendly', 'Luggage Space'],
    contactPref: 'chat',
    createdAt: Date.now() - 3600000 * 18
  },
  {
    id: 'ride_5',
    driverId: 'usr_sangeeta',
    driverName: 'Neha Kulkarni',
    driverRole: 'Senior AI / Data Architect',
    driverDepartment: 'PT-THIA',
    driverInitials: 'NK',
    driverRating: 4.88,
    origin: 'Electronic City Phase 1 (Wipro Gate)',
    destination: 'MBRDI Whitefield Campus',
    campus: 'MBRDI Whitefield Hub',
    departureTime: '08:30 AM',
    returnTime: '06:00 PM',
    scheduleType: 'Mon, Wed, Fri',
    vehicleModel: 'Mercedes-Benz GLA 220d',
    vehicleType: 'Diesel / Petrol',
    totalSeats: 4,
    availableSeats: 3,
    passengers: [],
    costSharingPerTrip: 'Split Fuel / Eco-share',
    notes: 'Taking NICE road & Sarjapur outer ring route to avoid Silk Board congestion.',
    routeHighlights: ['Electronic City Toll', 'Hosa Road', 'Sarjapur Junction', 'Whitefield ITPL'],
    amenities: ['Smooth Highway Route', 'Air Conditioned', 'Music Allowed', 'Flexible Pickup'],
    contactPref: 'chat',
    createdAt: Date.now() - 3600000 * 12
  },
  {
    id: 'ride_6',
    driverId: 'usr_rohit',
    driverName: 'Arjun Mehta',
    driverRole: 'Data Engineering Specialist',
    driverDepartment: 'PT-THIS',
    driverInitials: 'AM',
    driverRating: 4.85,
    origin: 'Kothrud / Baner Highway Hub',
    destination: 'MBRDI Pune Powertrain Center',
    campus: 'MBRDI Pune Center',
    departureTime: '08:20 AM',
    returnTime: '05:40 PM',
    scheduleType: 'Daily (Mon–Fri)',
    vehicleModel: 'Mercedes-Benz GLC 300 4MATIC',
    vehicleType: 'Hybrid (PHEV)',
    totalSeats: 4,
    availableSeats: 2,
    passengers: [
      {
        id: 'usr_rashmi',
        name: 'Meera Lakshmanan',
        role: 'Lead UX & In-Cabin AI Specialist',
        department: 'PT-THID',
        initials: 'ML',
        status: 'confirmed'
      }
    ],
    costSharingPerTrip: 'Free / Eco-Commute',
    notes: 'Daily Pune powertrain engineering corridor. Friendly rides with tech discussions.',
    routeHighlights: ['Baner Road', 'Pashan Circle', 'Aundh Ravet BRT', 'Pune Campus Gate 1'],
    amenities: ['Dual Climate Zone', 'Quiet Cabin', 'Apple CarPlay', 'Fast USB-C Charging'],
    contactPref: 'chat',
    createdAt: Date.now() - 3600000 * 8
  }
];

export interface TrainingSeed {
  id: string;
  host: string;
  title: string;
  description: string;
  skills: string[];
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All levels';
  format: 'Virtual' | 'In-person' | 'Hybrid';
  location: string;
  /** Offset from seed time, so the demo always has upcoming sessions. */
  inDays: number;
  startTime: string;
  durationMins: number;
  seatsTotal: number;
  attendees: string[];
}

export const INITIAL_TRAINING_SESSIONS: TrainingSeed[] = [
  {
    id: 'trn_terraform',
    host: 'Arjun Mehta',
    title: 'Terraform Modules That Survive a Second Team',
    description:
      'A hands-on walkthrough of how we structure reusable Terraform modules across MBRDI: versioning, remote state layout, and the review checklist we use before a module is shared org-wide. Bring a laptop — we refactor a real module together in the last 20 minutes.',
    skills: ['Terraform', 'AWS', 'Infrastructure as Code', 'CI/CD'],
    level: 'Intermediate',
    format: 'Hybrid',
    location: 'MBRDI Whitefield · Room 4.12 + Teams',
    inDays: 4,
    startTime: '02:00 PM',
    durationMins: 90,
    seatsTotal: 24,
    attendees: ['Karthik Iyer', 'Ananya Reddy', 'Divya Krishnan', 'Girish Kulkarni']
  },
  {
    id: 'trn_kafka',
    host: 'Neha Kulkarni',
    title: 'Tuning Kafka for Connected-Vehicle Telemetry',
    description:
      'Why our broker latency spikes at fleet scale and what actually fixes it. Covers partition sizing, consumer-group rebalancing, heap configuration and the three dashboards worth alerting on.',
    skills: ['Kafka', 'Distributed Systems', 'Performance Tuning'],
    level: 'Advanced',
    format: 'Virtual',
    location: 'Microsoft Teams',
    inDays: 7,
    startTime: '11:00 AM',
    durationMins: 60,
    seatsTotal: 40,
    attendees: ['Arjun Mehta', 'Nikhil Rao', 'Suresh Pillai']
  },
  {
    id: 'trn_hil',
    host: 'Suresh Pillai',
    title: 'HiL Bench Basics for Software Engineers',
    description:
      'A gentle introduction to hardware-in-the-loop testing for people who have only ever run things in CI. What the rig does, how to read a failing trace, and how to book bench time without blocking the validation team.',
    skills: ['HiL Testing', 'dSPACE', 'Validation', 'AUTOSAR'],
    level: 'Beginner',
    format: 'In-person',
    location: 'MBRDI Whitefield · Validation Lab',
    inDays: 11,
    startTime: '10:00 AM',
    durationMins: 120,
    seatsTotal: 12,
    attendees: ['Tarun Malviya', 'Anjali Desai']
  },
  {
    id: 'trn_llm',
    host: 'Divya Krishnan',
    title: 'Practical Retrieval-Augmented Generation on Internal Docs',
    description:
      'Building a RAG pipeline against Mercedes-internal documentation: chunking strategies that respect engineering docs, embedding choices, evaluation without a labelled set, and the failure modes we hit in the first pilot.',
    skills: ['Python', 'Machine Learning', 'LLM', 'Data Engineering'],
    level: 'Intermediate',
    format: 'Virtual',
    location: 'Microsoft Teams',
    inDays: 14,
    startTime: '04:00 PM',
    durationMins: 75,
    seatsTotal: 50,
    attendees: ['Arjun Mehta', 'Ananya Reddy', 'Kavya Nair', 'Rohan Chauhan', 'Pooja Joshi']
  },
  {
    id: 'trn_k8s',
    host: 'Nikhil Rao',
    title: 'Kubernetes Debugging: From CrashLoopBackOff to Root Cause',
    description:
      'A live-debugging session. We break a cluster on purpose four times and work through each failure with nothing but kubectl and logs — no dashboards allowed.',
    skills: ['Kubernetes', 'Docker', 'Observability', 'Linux'],
    level: 'Intermediate',
    format: 'Hybrid',
    location: 'MBRDI Bangalore · Auditorium B + Teams',
    inDays: 18,
    startTime: '03:30 PM',
    durationMins: 90,
    seatsTotal: 60,
    attendees: ['Girish Kulkarni', 'Harish Menon']
  },
  {
    id: 'trn_functional_safety',
    host: 'Ananya Reddy',
    title: 'ISO 26262 for the Impatient: ASIL Decomposition in Practice',
    description:
      'What ASIL decomposition actually means when you are the one writing the safety case, using a real fuel-cell HARA as the running example.',
    skills: ['ISO 26262', 'Functional Safety', 'HARA', 'Systems Engineering'],
    level: 'Advanced',
    format: 'In-person',
    location: 'MBRDI Whitefield · Room 2.03',
    inDays: -9,
    startTime: '02:00 PM',
    durationMins: 120,
    seatsTotal: 20,
    attendees: ['Suresh Pillai', 'Neha Kulkarni', 'Karthik Iyer']
  }
];


export const INITIAL_COMMUNITIES: CommunityGroup[] = [
  {
    id: 'grp_cloud',
    name: 'Cloud, DevOps & Kubernetes Guild',
    category: 'Tech',
    icon: '☁️',
    description: 'Cross-departmental community for AWS, Azure, Terraform, GitOps, Kubernetes, and enterprise platform engineering.',
    memberCount: 1240,
    isJoined: true,
    activeDiscussions: 38,
    tags: ['AWS', 'Kubernetes', 'Terraform', 'CI/CD', 'Docker']
  },
  {
    id: 'grp_ai',
    name: 'Autonomous AI & LLM Practitioners',
    category: 'Tech',
    icon: '🤖',
    description: 'Discussing generative AI, RAG architectures, computer vision, PyTorch model deployment, and vehicle intelligence.',
    memberCount: 980,
    isJoined: true,
    activeDiscussions: 42,
    tags: ['Python', 'PyTorch', 'LLMs', 'RAG', 'Edge AI']
  },
  {
    id: 'grp_runners',
    name: 'Mercedes-Benz Campus Runners Club',
    category: 'Interests',
    icon: '🏃',
    description: 'Weekly campus lunch runs, 10k marathon prep, trail running in Black Forest, and charity relay teams.',
    memberCount: 430,
    isJoined: false,
    activeDiscussions: 15,
    tags: ['Running', 'Fitness', 'Campus 5k', 'Trail']
  },
  {
    id: 'grp_ev',
    name: 'Electric Mobility & Battery Tech Enthusiasts',
    category: 'Tech',
    icon: '⚡',
    description: 'Deep dives into charging networks, high-voltage battery chemistry, Silicon-anode innovation, and thermal design.',
    memberCount: 860,
    isJoined: false,
    activeDiscussions: 29,
    tags: ['Battery', 'EV Charging', 'Simulink', 'Hardware']
  },
  {
    id: 'grp_women_tech',
    name: 'Women in Tech & Leadership',
    category: 'Professional',
    icon: '👩‍💻',
    description: 'Mentorship, career development sessions, keynote talks, and networking for female engineers and leaders.',
    memberCount: 650,
    isJoined: false,
    activeDiscussions: 21,
    tags: ['Mentorship', 'Leadership', 'Networking', 'Diversity']
  },
  {
    id: 'grp_photography',
    name: 'Automotive & Landscape Photography Guild',
    category: 'Interests',
    icon: '📸',
    description: 'Sharing camera gear reviews, photo excursions, automotive rolling shots, and Lightroom presets.',
    memberCount: 310,
    isJoined: false,
    activeDiscussions: 12,
    tags: ['Photography', 'Sony', 'Canon', 'Lightroom']
  }
];

export const INITIAL_KNOWLEDGE_QUESTIONS: KnowledgeQuestion[] = [
  {
    id: 'kq_1',
    title: 'How are teams implementing private connectivity to AKS with corporate proxy restrictions?',
    details: 'We are trying to connect our microservices running in a spoke VNet to private AKS clusters while passing through our enterprise Zscaler/Firewall proxy. Has anyone solved the dynamic DNS routing and cert injection in standard pods?',
    author: 'Deepak Rana',
    authorRole: 'Battery Systems Architect',
    initials: 'DR',
    tags: ['Kubernetes', 'Azure', 'Networking', 'Security'],
    votes: 24,
    time: '1 day ago',
    timestamp: Date.now() - 86400000,
    hasAcceptedAnswer: true,
    answers: [
      {
        id: 'ans_1',
        author: 'Karthik Iyer',
        role: 'Lead DevOps Engineer',
        initials: 'KI',
        time: '18 hours ago',
        timestamp: Date.now() - 64800000,
        text: `We solved this in the Cloud Foundation Platform using private DNS zones linked directly to the Hub VNet. For certificate trust in pods, we deployed an admission controller webhook that mounts the corporate root CA bundle automatically at pod startup without modifying base Docker images. Here is our internal wiki link: go/cloud/aks-private-proxy`,
        likes: 19,
        isAcceptedAnswer: true
      },
      {
        id: 'ans_2',
        author: 'Vikram Subramanian',
        role: 'Cloud Architect',
        initials: 'VS',
        time: '14 hours ago',
        timestamp: Date.now() - 50400000,
        text: `+1 to Rakesh's approach. Also make sure to configure the \`kubelet\` with \`--resolv-conf\` pointing to CoreDNS forwarders to avoid hairpin DNS timeouts.`,
        likes: 8
      }
    ]
  },
  {
    id: 'kq_2',
    title: 'Best practices for zero-copy ROS2 message serialization in C++ on embedded Linux?',
    details: 'We are observing memory allocation bottlenecks when passing 4K camera frames between ROS2 nodes via CycloneDDS. What zero-copy transport configuration is recommended for vehicle onboard platforms?',
    author: 'Manoj Verma',
    authorRole: 'Lead Perception Engineer',
    initials: 'MV',
    tags: ['C++', 'ROS2', 'Embedded Linux', 'Computer Vision'],
    votes: 18,
    time: '2 days ago',
    timestamp: Date.now() - 172800000,
    hasAcceptedAnswer: true,
    answers: [
      {
        id: 'ans_3',
        author: 'Siddharth Bose',
        role: 'Systems Engineer',
        initials: 'SB',
        time: '1 day ago',
        timestamp: Date.now() - 86400000,
        text: `Use Iceoryx shared memory transport with \`std::unique_ptr<T, Deleter>\`. CycloneDDS has native iceoryx support enabled with \`<SharedMemory><Enable>true</Enable></SharedMemory>\` in your cyclone XML configuration. This eliminates copying completely.`,
        likes: 15,
        isAcceptedAnswer: true
      }
    ]
  }
];

export const INITIAL_CAPABILITY_HEATMAP: CapabilityHeatmapItem[] = [
  { skill: 'AWS Cloud & EKS', demandScore: 92, supplyScore: 84, requestsCount: 142, availableExpertsCount: 118, status: 'Balanced' },
  { skill: 'Generative AI & LLMs', demandScore: 88, supplyScore: 48, requestsCount: 127, availableExpertsCount: 54, status: 'Gap (High Demand, Low Supply)' },
  { skill: 'DevOps & GitOps CI/CD', demandScore: 82, supplyScore: 78, requestsCount: 118, availableExpertsCount: 104, status: 'Balanced' },
  { skill: 'Data Engineering & Kafka', demandScore: 74, supplyScore: 52, requestsCount: 97, availableExpertsCount: 58, status: 'Gap (High Demand, Low Supply)' },
  { skill: 'React & Frontend Telemetry', demandScore: 68, supplyScore: 86, requestsCount: 72, availableExpertsCount: 94, status: 'High Availability' },
  { skill: 'Cybersecurity & Zero-Trust', demandScore: 76, supplyScore: 42, requestsCount: 64, availableExpertsCount: 36, status: 'Gap (High Demand, Low Supply)' },
  { skill: 'AUTOSAR & Embedded C', demandScore: 71, supplyScore: 65, requestsCount: 68, availableExpertsCount: 62, status: 'Balanced' },
  { skill: 'Simulink Thermal Modeling', demandScore: 62, supplyScore: 45, requestsCount: 48, availableExpertsCount: 32, status: 'Gap (High Demand, Low Supply)' },
  { skill: 'HiL Testing & dSPACE', demandScore: 84, supplyScore: 46, requestsCount: 89, availableExpertsCount: 38, status: 'Gap (High Demand, Low Supply)' },
  { skill: 'INCA / CANape ECU Calibration', demandScore: 79, supplyScore: 58, requestsCount: 76, availableExpertsCount: 44, status: 'Gap (High Demand, Low Supply)' },
  { skill: 'ISO 26262 Functional Safety', demandScore: 87, supplyScore: 39, requestsCount: 94, availableExpertsCount: 29, status: 'Gap (High Demand, Low Supply)' }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  // Elena's Manager Notifications (Direct Reports: Rakesh, Arjun)
  {
    id: 'n_elena_1',
    recipientId: 'usr_kalyan',
    recipientRole: 'manager',
    type: 'manager_approval',
    title: 'Manager Approval: Karthik Iyer',
    description: 'Rakesh requested approval to allocate 8h to PT-THIA deployment automation on AWS & EKS.',
    time: '1h ago',
    timestamp: Date.now() - 3600000,
    read: false,
    targetTab: 'manager'
  },
  {
    id: 'n_elena_2',
    recipientId: 'usr_kalyan',
    recipientRole: 'manager',
    type: 'manager_approval',
    title: 'Manager Approval: Arjun Mehta',
    description: 'Arjun requested approval for 6h powertrain Kafka streaming support for PT-THID.',
    time: '3h ago',
    timestamp: Date.now() - 10800000,
    read: false,
    targetTab: 'manager'
  },

  // Clara's Manager Notifications (Direct Reports: Priya, Anand)
  {
    id: 'n_clara_1',
    recipientId: 'usr_swati',
    recipientRole: 'manager',
    type: 'manager_approval',
    title: 'Manager Approval: Ananya Reddy',
    description: 'Anand requested approval for 8h zero-trust VPC architecture assessment with PT-THIT.',
    time: '4h ago',
    timestamp: Date.now() - 14400000,
    read: false,
    targetTab: 'manager'
  },

  // Johannes's Manager Notifications (Direct Reports: Sneha, Vikram, Maya)
  {
    id: 'n_johannes_1',
    recipientId: 'usr_nitin',
    recipientRole: 'manager',
    type: 'manager_approval',
    title: 'Manager Approval: Divya Krishnan',
    description: 'Sneha requested approval for 10h AUTOSAR Classic migration with PT-THIB.',
    time: '2h ago',
    timestamp: Date.now() - 7200000,
    read: false,
    targetTab: 'manager'
  },
  {
    id: 'n_johannes_2',
    recipientId: 'usr_nitin',
    recipientRole: 'manager',
    type: 'manager_approval',
    title: 'Manager Approval: Suresh Pillai',
    description: 'Vikram requested approval for 8h dSPACE HiL test automation with PT-THIC.',
    time: '5h ago',
    timestamp: Date.now() - 18000000,
    read: false,
    targetTab: 'manager'
  },

  // Rakesh's Employee Notifications
  {
    id: 'n_rakesh_1',
    recipientId: 'usr_rakesh',
    recipientRole: 'employee',
    type: 'match_found',
    title: '94% AI Skill Match Found',
    description: 'PT-THIA published a 2-day DevOps requirement matching your AWS & Terraform expertise.',
    time: '2h ago',
    timestamp: Date.now() - 7200000,
    read: false,
    targetTab: 'work',
    targetId: 101
  },
  {
    id: 'n_rakesh_2',
    recipientId: 'usr_rakesh',
    recipientRole: 'employee',
    type: 'feedback_received',
    title: '⭐ 5.0 Feedback Received',
    description: 'Neha Kulkarni (PT-THIA) rated your AKS cluster optimization 5/5: "Super fast response and clean IaC!"',
    time: 'Yesterday',
    timestamp: Date.now() - 86400000,
    read: true,
    targetTab: 'myxchange'
  },
  {
    id: 'n_rakesh_3',
    recipientId: 'usr_rakesh',
    recipientRole: 'employee',
    type: 'community_reply',
    title: 'Accepted Answer in Cloud Guild',
    description: 'Your solution on AKS private DNS was marked as the Accepted Expert Answer by Deepak Rana.',
    time: '2d ago',
    timestamp: Date.now() - 172800000,
    read: true,
    targetTab: 'community'
  },

  // Priya's Employee Notifications
  {
    id: 'n_priya_1',
    recipientId: 'usr_sangeeta',
    recipientRole: 'employee',
    type: 'match_found',
    title: '92% Skill Synergy Detected',
    description: 'Diagnostic copilot pipeline gig is open in PT-THID.',
    time: '1d ago',
    timestamp: Date.now() - 86400000,
    read: false,
    targetTab: 'work',
    targetId: 102
  },

  // Admin System Notifications
  {
    id: 'n_admin_1',
    recipientId: 'usr_naresh',
    recipientRole: 'admin',
    type: 'system_alert',
    title: 'Quarterly Mobility Audit Generated',
    description: '1,248 cross-department collaboration hours logged with 100% manager governance sign-off.',
    time: '1h ago',
    timestamp: Date.now() - 3600000,
    read: false,
    targetTab: 'admin'
  }
];

export const DEPARTMENTS_LIST = [
  'All Departments',
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

export const ALL_SKILLS_TAGS = [
  'All Skills',
  'AWS',
  'Azure',
  'Kubernetes',
  'Terraform',
  'Docker',
  'CI/CD',
  'Python',
  'PyTorch',
  'LLMs',
  'RAG Architecture',
  'React',
  'TypeScript',
  'MATLAB',
  'Simulink',
  'AUTOSAR',
  'Embedded C',
  'C++',
  'Hardware-in-the-Loop',
  'dSPACE',
  'INCA / CANape',
  'ECU Calibration',
  'Motor Control',
  'ISO 26262',
  'Functional Safety',
  'ASIL D',
  'Kafka',
  'Security',
  'Figma',
  'HMI Design'
];

export const INITIAL_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 301,
    type: 'Event',
    title: 'Mercedes-Benz Sindelfingen Tech Talk: AI in Autonomous Perception',
    description: 'Join us at Auditorium 2 or via Teams for an in-depth session on transformer models for real-time camera and LiDAR sensor fusion. Q&A and networking refreshments provided.',
    location: 'Sindelfingen Auditorium 2 & Hybrid Stream',
    dateInfo: 'Thursday, Aug 28 · 16:30 CEST',
    time: '2 hours ago',
    timestamp: Date.now() - 7200000,
    author: 'Dr. Sunita Lal',
    authorRole: 'AI Research Lead',
    initials: 'SL',
    contacted: false,
    bookmarked: false
  },
  {
    id: 302,
    type: 'Notice',
    title: 'New EV Charging Stations Active at Böblingen Tech Hub Building 4',
    description: '16 high-power 22kW charging stalls are now commissioned and live in parking deck P3. Badge authorization required via corporate ID.',
    location: 'Böblingen Campus Deck P3',
    time: '1 day ago',
    timestamp: Date.now() - 86400000,
    author: 'Facility Management',
    authorRole: 'Operations Lead',
    initials: 'FM',
    contacted: false,
    bookmarked: false
  },
  {
    id: 303,
    type: 'Lost & Found',
    title: 'Found: Mercedes-Benz Car Key with AMG Fob in Cafeteria Bldg 12',
    description: 'Found on the high table near the espresso bar around 13:15. Handed over to Reception security desk in Building 12.',
    location: 'Sindelfingen Bldg 12 Reception',
    time: 'Yesterday',
    timestamp: Date.now() - 90000000,
    author: 'Manish Bhatt',
    authorRole: 'Vehicle Test Engineer',
    initials: 'MB',
    contacted: false,
    bookmarked: false
  }
];

export const INITIAL_COMMUNITY_GROUPS = INITIAL_COMMUNITIES;

