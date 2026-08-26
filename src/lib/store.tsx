import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api, setToken, getToken, ApiError, type User, type WorkPost, type Notification, type Message, type TierDef } from './api';

export type MainTab = 'home' | 'work' | 'people' | 'requests' | 'achievements' | 'insights' | 'learning' | 'beyond' | 'manager' | 'admin';

export interface Toast {
  id: string;
  kind: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface Store {
  // auth
  user: User | null;
  impersonating: boolean;
  realUserName?: string;
  booting: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
  impersonate: (userId: string) => Promise<void>;
  stopImpersonating: () => Promise<void>;

  // navigation
  tab: MainTab;
  setTab: (t: MainTab) => void;
  openWorkId: string | null;
  setOpenWorkId: (id: string | null) => void;
  beyondSection: 'carpool' | 'community';
  setBeyondSection: (s: 'carpool' | 'community') => void;

  // global data
  users: User[];
  /** Admin-editable tier ladder — components read each tier's 3D artifact from it. */
  tiers: TierDef[];
  posts: WorkPost[];
  notifications: Notification[];
  messages: Message[];
  saved: Array<{ itemType: string; itemId: string }>;
  counts: { unreadNotifications: number; unreadMessages: number; pendingApprovals: number };
  loadUsers: () => Promise<void>;
  loadTiers: () => Promise<void>;
  loadPosts: () => Promise<void>;
  loadNotifications: () => Promise<void>;
  loadMessages: () => Promise<void>;
  loadSaved: () => Promise<void>;
  toggleSaved: (itemType: string, itemId: string) => Promise<boolean>;
  isSaved: (itemType: string, itemId: string) => boolean;

  // ui
  toasts: Toast[];
  toast: (kind: Toast['kind'], title: string, message?: string) => void;
  dismissToast: (id: string) => void;
  dark: boolean;
  toggleDark: () => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  messagesOpen: boolean;
  setMessagesOpen: (v: boolean) => void;
  messagePartnerId: string | null;
  setMessagePartnerId: (id: string | null) => void;
  notificationsOpen: boolean;
  setNotificationsOpen: (v: boolean) => void;
  savedOpen: boolean;
  setSavedOpen: (v: boolean) => void;
  profileOpen: boolean;
  setProfileOpen: (v: boolean) => void;
  /** Global "post a requirement" composer, reachable from the nav anywhere. */
  createWorkOpen: boolean;
  setCreateWorkOpen: (v: boolean) => void;
}

const Ctx = createContext<Store>(null as any);
export const useStore = () => useContext(Ctx);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [impersonating, setImpersonating] = useState(false);
  const [realUserName, setRealUserName] = useState<string | undefined>();
  const [booting, setBooting] = useState(true);

  const [tab, setTabState] = useState<MainTab>('home');
  const [openWorkId, setOpenWorkId] = useState<string | null>(null);
  const [beyondSection, setBeyondSection] = useState<'carpool' | 'community'>('carpool');

  const [users, setUsers] = useState<User[]>([]);
  const [tiers, setTiers] = useState<TierDef[]>([]);
  const [posts, setPosts] = useState<WorkPost[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [saved, setSaved] = useState<Array<{ itemType: string; itemId: string }>>([]);
  const [counts, setCounts] = useState({ unreadNotifications: 0, unreadMessages: 0, pendingApprovals: 0 });

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [dark, setDark] = useState(() => localStorage.getItem('mbx_theme') === 'dark');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('mbx_sidebar') === 'collapsed');
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [messagePartnerId, setMessagePartnerId] = useState<string | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [createWorkOpen, setCreateWorkOpen] = useState(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('mbx_theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    localStorage.setItem('mbx_sidebar', sidebarCollapsed ? 'collapsed' : 'expanded');
  }, [sidebarCollapsed]);

  const toast = useCallback((kind: Toast['kind'], title: string, message?: string) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev.slice(-3), { id, kind, title, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4200);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const loadUsers = useCallback(async () => {
    const { users } = await api.get('/users');
    setUsers(users);
  }, []);

  const loadTiers = useCallback(async () => {
    try {
      const { tiers } = await api.get('/recognition/config');
      setTiers(tiers);
    } catch { /* the ladder is decorative here; failure must not block boot */ }
  }, []);

  const loadPosts = useCallback(async () => {
    const { posts } = await api.get('/work-posts');
    setPosts(posts);
  }, []);

  const loadNotifications = useCallback(async () => {
    const { notifications } = await api.get('/notifications');
    setNotifications(notifications);
  }, []);

  const loadMessages = useCallback(async () => {
    const { messages } = await api.get('/messages');
    setMessages(messages);
  }, []);

  const loadSaved = useCallback(async () => {
    const { saved } = await api.get('/saved');
    setSaved(saved);
  }, []);

  const loadCounts = useCallback(async () => {
    try {
      const c = await api.get('/sync');
      setCounts(c);
    } catch { /* polling failure is non-fatal */ }
  }, []);

  const bootstrap = useCallback(async () => {
    await Promise.all([loadUsers(), loadTiers(), loadPosts(), loadNotifications(), loadMessages(), loadSaved(), loadCounts()]);
  }, [loadUsers, loadTiers, loadPosts, loadNotifications, loadMessages, loadSaved, loadCounts]);

  // Session restore on mount
  useEffect(() => {
    (async () => {
      if (!getToken()) { setBooting(false); return; }
      try {
        const me = await api.get('/me');
        setUser(me.user);
        setImpersonating(!!me.impersonating);
        setRealUserName(me.realUser?.name);
        await bootstrap();
      } catch (err) {
        // Only a genuine "your session is invalid" response should sign the
        // user out. A network blip or the dev server mid-restart must not
        // silently wipe an otherwise-valid token — that would permanently
        // log the user out on their next refresh for no reason of their own.
        if (err instanceof ApiError && err.status === 401) {
          setToken(null);
        }
      } finally {
        setBooting(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Light polling (~20s) while logged in
  useEffect(() => {
    if (!user) return;
    pollRef.current = setInterval(async () => {
      const before = counts;
      try {
        const c = await api.get('/sync');
        setCounts(c);
        if (c.unreadNotifications !== before.unreadNotifications) loadNotifications();
        if (c.unreadMessages !== before.unreadMessages) loadMessages();
      } catch { /* offline blip */ }
    }, 20000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [user, counts, loadNotifications, loadMessages]);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user } = await api.post('/auth/login', { email, password });
    setToken(token);
    setUser(user);
    setImpersonating(false);
    setRealUserName(undefined);
    setTabState('home');
    await bootstrap();
  }, [bootstrap]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setImpersonating(false);
    setUsers([]); setTiers([]); setPosts([]); setNotifications([]); setMessages([]); setSaved([]);
    setTabState('home');
  }, []);

  const refreshMe = useCallback(async () => {
    const me = await api.get('/me');
    setUser(me.user);
  }, []);

  const impersonate = useCallback(async (userId: string) => {
    const { token, user: target } = await api.post('/auth/impersonate', { userId });
    setToken(token);
    setUser(target);
    setImpersonating(true);
    setTabState('home');
    await bootstrap();
    toast('info', 'Viewing as ' + target.name, 'All actions are audit-logged.');
  }, [bootstrap, toast]);

  const stopImpersonating = useCallback(async () => {
    const { token, user: real } = await api.post('/auth/stop-impersonation');
    setToken(token);
    setUser(real);
    setImpersonating(false);
    setRealUserName(undefined);
    setTabState('admin');
    await bootstrap();
  }, [bootstrap]);

  const setTab = useCallback((t: MainTab) => {
    setTabState(t);
    setOpenWorkId(null);
    window.scrollTo({ top: 0 });
  }, []);

  const toggleSaved = useCallback(async (itemType: string, itemId: string) => {
    const { saved: nowSaved } = await api.post('/saved/toggle', { itemType, itemId });
    setSaved((prev) => nowSaved
      ? [...prev, { itemType, itemId: String(itemId) }]
      : prev.filter((s) => !(s.itemType === itemType && s.itemId === String(itemId))));
    return nowSaved;
  }, []);

  const isSaved = useCallback((itemType: string, itemId: string) =>
    saved.some((s) => s.itemType === itemType && s.itemId === String(itemId)), [saved]);

  const value: Store = {
    user, impersonating, realUserName, booting, login, logout, refreshMe, impersonate, stopImpersonating,
    tab, setTab, openWorkId, setOpenWorkId, beyondSection, setBeyondSection,
    users, tiers, posts, notifications, messages, saved, counts,
    loadUsers, loadTiers, loadPosts, loadNotifications, loadMessages, loadSaved, toggleSaved, isSaved,
    toasts, toast, dismissToast, dark, toggleDark: () => setDark((d) => !d),
    sidebarCollapsed, toggleSidebar: () => setSidebarCollapsed((c) => !c),
    messagesOpen, setMessagesOpen, messagePartnerId, setMessagePartnerId,
    notificationsOpen, setNotificationsOpen, savedOpen, setSavedOpen, profileOpen, setProfileOpen,
    createWorkOpen, setCreateWorkOpen
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
