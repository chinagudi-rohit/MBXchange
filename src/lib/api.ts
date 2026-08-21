/** Typed fetch client for the MBXchange API. */

let authToken: string | null = localStorage.getItem('mbx_token');

export function setToken(token: string | null) {
  authToken = token;
  if (token) localStorage.setItem('mbx_token', token);
  else localStorage.removeItem('mbx_token');
}

export function getToken() {
  return authToken;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T = any>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  let data: any = null;
  try { data = await res.json(); } catch { /* empty body */ }
  if (!res.ok) {
    throw new ApiError(res.status, data?.error || `Request failed (${res.status})`);
  }
  return data as T;
}

export const api = {
  get: <T = any>(path: string) => request<T>('GET', path),
  post: <T = any>(path: string, body?: unknown) => request<T>('POST', path, body),
  patch: <T = any>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  del: <T = any>(path: string) => request<T>('DELETE', path)
};

// ---- Shared shapes used across the app ----

export interface User {
  id: string;
  email: string;
  name: string;
  initials: string;
  role: string;
  systemRole: 'employee' | 'manager' | 'admin';
  status: string;
  department: string;
  campus: string;
  specialisation: string;
  experienceYears: number;
  primarySkills: string[];
  interests: string[];
  availableFor: string[];
  typicalAvailability: string;
  availableHoursWeek: number;
  contributionScore: number;
  ratingBreakdown: Record<string, number>;
  badges: Array<{ id: string; name: string; icon: string; description: string; dateEarned: string }>;
  collaborationsCount: number;
  departmentsSupported: number;
  peopleHelped: number;
  hoursContributed: number;
  bio: string;
  managerId: string | null;
  mustChangePassword: boolean;
}

export interface WorkPost {
  id: string;
  title: string;
  department: string;
  team: string;
  status: 'Open' | 'In Progress' | 'Completed' | 'Cancelled';
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  duration: string;
  effortHours: string;
  effortMin: number;
  effortMax: number;
  location: string;
  approvalRequired: boolean;
  seats: number;
  seatsFilled: number;
  tags: string[];
  authorId: string | null;
  authorName: string;
  authorRole: string;
  authorInitials: string;
  description: string;
  whyOpportunity: string;
  editedAt: string | null;
  createdAt: string;
  commentCount: number;
  myApplication?: { id: string; status: string } | null;
}

export interface Application {
  id: string;
  postId: string;
  groupId: string;
  applicantId: string;
  submittedBy: string;
  managerId: string | null;
  note: string;
  commitment: string;
  status: 'awaiting_registration' | 'pending' | 'approved' | 'rejected' | 'withdrawn';
  aiRecommendation: string;
  aiReason: string;
  managerNotes: string;
  editedAt: string | null;
  decidedAt: string | null;
  createdAt: string;
  postTitle: string;
  postDepartment: string;
  postStatus: string;
  postEffort: string;
  postDuration: string;
  applicantName: string;
  applicantInitials: string;
  applicantDepartment: string;
  applicantRole: string;
  applicantAvailableHours: number;
  applicantTypicalAvailability: string;
  submittedByName: string;
  managerName: string | null;
}

export interface CollabRequest {
  id: string;
  requester_id: string;
  target_id: string;
  task_title: string;
  estimated_hours: string;
  dates: string;
  notes: string;
  status: string;
  edited_at: string | null;
  created_at: string;
  targetName: string;
  targetInitials: string;
  targetDepartment: string;
  requesterName: string;
  requesterInitials: string;
  requesterDepartment: string;
}

export interface Listing {
  id: string;
  listingType: string;
  title: string;
  price: number;
  currency: string;
  isFree: boolean;
  category: string;
  condition: string;
  location: string;
  sellerId: string | null;
  sellerName: string;
  sellerRole: string;
  sellerInitials: string;
  description: string;
  specs: Record<string, string>;
  sold: boolean;
  eventDate: string | null;
  ticketQuantity: number | null;
  createdAt: string;
}

export interface CarpoolTrip {
  id: string;
  driverId: string;
  direction: 'to_office' | 'from_office';
  origin: string;
  destination: string;
  campus: string;
  departureTime: string;
  days: string[];
  vehicleModel: string;
  vehicleType: string;
  seatsTotal: number;
  seatsBooked: number;
  costPerRide: string;
  womenOnly: boolean;
  notes: string;
  amenities: string[];
  status: string;
  createdAt: string;
  driverName: string;
  driverRole: string;
  driverDepartment: string;
  driverInitials: string;
  iAmBooked: boolean;
  riders: Array<{ name: string; initials: string; department: string }>;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  description: string;
  targetTab: string | null;
  targetId: string | null;
  read: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  text: string;
  contextType: string;
  contextTitle: string;
  read: boolean;
  createdAt: string;
}

export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const secs = Math.floor((Date.now() - then) / 1000);
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}
