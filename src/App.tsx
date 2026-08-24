import React, { useState } from 'react';
import {
  Home, Briefcase, Users, ListChecks, Compass, ShieldCheck, Settings2, BarChart3,
  Bell, MessageSquare, Bookmark, Sun, Moon, LogOut, KeyRound, ChevronDown, Search,
  UserRound, X, PanelLeftClose, PanelLeftOpen, Menu, Plus, Zap, Award
} from 'lucide-react';
import { StoreProvider, useStore, type MainTab } from './lib/store';
import { Toasts, Avatar, MercedesStar } from './components/ui';
import { LoginScreen } from './views/LoginScreen';
import { ForcePasswordChange } from './views/ForcePasswordChange';
import { HomeDashboard } from './views/HomeDashboard';
import { WorkExchange, WorkFormModal } from './views/WorkExchange';
import { PeopleView } from './views/PeopleView';
import { MyRequests } from './views/MyRequests';
import { InsightsView } from './views/InsightsView';
import { Achievements } from './views/Achievements';
import { BeyondWork } from './views/BeyondWork';
import { ManagerInbox } from './views/ManagerInbox';
import { AdminConsole } from './views/AdminConsole';
import { MessagesDrawer } from './views/MessagesDrawer';
import { NotificationsPanel } from './views/NotificationsPanel';
import { SavedDrawer } from './views/SavedDrawer';
import { ProfileDrawer } from './views/ProfileDrawer';
import { GlobalSearch } from './views/GlobalSearch';

/**
 * Brand mark — Mercedes-Benz three-pointed star on a black tile.
 * Geometric rendition; swap in the official asset from the brand portal
 * before any external-facing release.
 */
function LogoMark({ size = 'md' }: { size?: 'md' | 'lg' }) {
  const cls = size === 'lg' ? 'w-12 h-12 rounded-2xl' : 'w-10 h-10 rounded-xl';
  return (
    <span
      className={`${cls} relative shrink-0 flex items-center justify-center bg-black shadow-card overflow-hidden`}
      aria-hidden="true"
    >
      <MercedesStar className="w-[82%] h-[82%]" />
    </span>
  );
}

/** Wordmark with the pivotal X tinted to match the logo box. */
function WordMark() {
  return (
    <span className="text-sm font-semibold text-ink tracking-tight">
      MB<span className="text-primary-text">X</span>change
    </span>
  );
}

const TAGLINE = 'Connect · Collaborate · Contribute';

function Shell() {
  const s = useStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        s.toggleSidebar();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [s]);

  if (s.booting) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="bg-mesh" />
        <div className="w-8 h-8 rounded-full border-2 border-line-strong border-t-primary animate-spin" />
      </div>
    );
  }

  if (!s.user) return <><div className="bg-mesh" /><LoginScreen /></>;

  // A temporary password gets you exactly one screen: the one that replaces it.
  // Impersonating admins are exempt — they are not the account's owner.
  if (s.user.mustChangePassword && !s.impersonating) return <ForcePasswordChange />;

  const navItems: Array<{ id: MainTab; label: string; hint: string; icon: React.ReactNode; badge?: number; show: boolean }> = [
    { id: 'home', label: 'Home', hint: 'Matches, activity & quick actions', icon: <Home className="w-4.5 h-4.5" />, show: true },
    { id: 'work', label: 'Opportunities', hint: 'Projects & PoCs beyond your day job', icon: <Briefcase className="w-4.5 h-4.5" />, show: true },
    { id: 'people', label: 'People & Skills', hint: 'Skill directory & collaboration', icon: <Users className="w-4.5 h-4.5" />, show: true },
    { id: 'requests', label: 'My Requests', hint: 'Everything you sent and received', icon: <ListChecks className="w-4.5 h-4.5" />, show: true },
    { id: 'achievements', label: 'Achievements', hint: 'Tier, milestones & recognition', icon: <Award className="w-4.5 h-4.5" />, show: true },
    { id: 'insights', label: 'Insights', hint: 'Skill heatmap & org analytics', icon: <BarChart3 className="w-4.5 h-4.5" />, show: true },
    { id: 'beyond', label: 'Beyond Work', hint: 'Marketplace, carpool & communities', icon: <Compass className="w-4.5 h-4.5" />, show: true },
    {
      id: 'manager', label: 'Approvals', hint: 'Capacity-checked team requests', icon: <ShieldCheck className="w-4.5 h-4.5" />,
      badge: s.counts.pendingApprovals, show: s.user.systemRole === 'manager' || s.user.systemRole === 'admin'
    },
    { id: 'admin', label: 'Admin Console', hint: 'Accounts, registrations & audit', icon: <Settings2 className="w-4.5 h-4.5" />, show: s.user.systemRole === 'admin' }
  ];

  // Five slots is the most that stays tappable on a 375px screen, so the tab bar
  // carries the four most-used destinations and hands the rest to the drawer.
  const hasAlerts = s.counts.unreadNotifications > 0 || s.counts.unreadMessages > 0 ||
    (s.counts.pendingApprovals > 0 && s.user.systemRole !== 'employee');
  const bottomNavItems: Array<{ id: string; label: string; icon: React.ReactNode; isMenu?: boolean; dot?: boolean }> = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'work', label: 'Work', icon: <Briefcase className="w-5 h-5" /> },
    { id: 'people', label: 'People', icon: <Users className="w-5 h-5" /> },
    { id: 'requests', label: 'Requests', icon: <ListChecks className="w-5 h-5" /> },
    { id: 'menu', label: 'Menu', icon: <Menu className="w-5 h-5" />, isMenu: true, dot: hasAlerts }
  ];

  const collapsed = s.sidebarCollapsed;

  /**
   * Post / Request — the platform's primary action, so it sits at the top of
   * the navigation on every surface rather than only on the home page.
   */
  const CreateMenu = ({ onNavigate, mini = false }: { onNavigate?: () => void; mini?: boolean }) => (
    <div className="relative">
      <button
        onClick={() => setCreateMenuOpen((v) => !v)}
        aria-expanded={createMenuOpen}
        aria-haspopup="menu"
        title={mini ? 'Post / Request' : undefined}
        className={
          mini
            ? 'mx-auto w-11 h-11 flex items-center justify-center rounded-2xl bg-primary text-on-primary shadow-card hover:bg-primary-strong transition-colors'
            : 'w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold shadow-card hover:bg-primary-strong transition-colors'
        }
      >
        <Plus className="w-4.5 h-4.5 shrink-0" />
        {!mini && <span>Post / Request</span>}
      </button>

      {createMenuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setCreateMenuOpen(false)} />
          <div
            role="menu"
            className={`absolute z-50 mt-2 w-64 panel-overlay rounded-2xl shadow-pop p-1.5 anim-pop-in ${
              mini ? 'left-full top-0 ml-2' : 'left-0 right-0 top-full'
            }`}
          >
            <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink-3">Create</p>
            {[
              {
                label: 'Post a requirement', hint: 'Ask another squad for help',
                icon: <Briefcase className="w-4 h-4" />, tone: 'bg-primary-soft text-primary-text',
                run: () => s.setCreateWorkOpen(true)
              },
              {
                label: 'Offer bandwidth', hint: 'List hours and skills you can lend',
                icon: <Zap className="w-4 h-4" />, tone: 'bg-green-soft text-green',
                run: () => { s.setTab('work'); s.setBeyondSection('market'); window.dispatchEvent(new CustomEvent('mbx:offer-bandwidth')); }
              },
              {
                label: 'Offer a ride', hint: 'Share your commute',
                icon: <Compass className="w-4 h-4" />, tone: 'bg-violet-soft text-violet',
                run: () => { s.setTab('beyond'); s.setBeyondSection('carpool'); }
              },
              {
                label: 'List an item', hint: 'Sell or give away equipment',
                icon: <Bookmark className="w-4 h-4" />, tone: 'bg-amber-soft text-amber',
                run: () => { s.setTab('beyond'); s.setBeyondSection('market'); }
              }
            ].map((a) => (
              <button
                key={a.label}
                role="menuitem"
                onClick={() => { setCreateMenuOpen(false); a.run(); onNavigate?.(); }}
                className="w-full flex items-start gap-2.5 px-3 py-2 rounded-xl hover:bg-surface-2 text-left transition-colors"
              >
                <span className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${a.tone}`}>{a.icon}</span>
                <span className="min-w-0">
                  <span className="block text-xs font-semibold text-ink">{a.label}</span>
                  <span className="block text-xs text-ink-3 mt-0.5">{a.hint}</span>
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );

  const NavLinks = ({ onNavigate, mini = false }: { onNavigate?: () => void; mini?: boolean }) => (
    <nav className="flex flex-col gap-1" aria-label="Primary">
      {navItems.filter((n) => n.show).map((n) => {
        const active = s.tab === n.id;
        return (
          <button
            key={n.id}
            onClick={() => { s.setTab(n.id); onNavigate?.(); }}
            aria-current={active ? 'page' : undefined}
            title={mini ? n.label : undefined}
            className={
              mini
                // Collapsed: a single square tile, no edge marker — keeps the rail tidy
                ? `relative mx-auto w-11 h-11 flex items-center justify-center rounded-2xl transition-colors duration-200 ${
                    active
                      ? 'bg-primary text-on-primary shadow-card'
                      : 'text-ink-2 hover:bg-surface-2 hover:text-ink'
                  }`
                : `relative flex items-center gap-3 pl-3.5 pr-3 py-2 rounded-xl text-sm font-semibold transition-colors duration-200 ${
                    active ? 'bg-primary-soft text-primary-text' : 'text-ink-2 hover:bg-surface-2 hover:text-ink'
                  }`
            }
          >
            {active && !mini && (
              <span className="absolute left-1 top-2.5 bottom-2.5 w-1 rounded-full bg-primary" />
            )}
            <span className="shrink-0">{n.icon}</span>
            {!mini && (
              <span className="flex-1 min-w-0 text-left">
                <span className="block truncate">{n.label}</span>
                <span className={`block text-xs font-medium truncate mt-0.5 ${active ? 'text-primary-text/70' : 'text-ink-3'}`}>
                  {n.hint}
                </span>
              </span>
            )}
            {!!n.badge && (
              mini ? (
                <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 px-1 rounded-full bg-red text-on-red text-xs font-semibold flex items-center justify-center ring-2 ring-(--surface-solid)">
                  {n.badge}
                </span>
              ) : (
                <span className="min-w-5 h-5 px-1 rounded-full bg-primary text-on-primary text-xs font-semibold flex items-center justify-center">
                  {n.badge}
                </span>
              )
            )}
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-dvh">
      <div className="bg-mesh" />

      {/* Impersonation banner */}
      {s.impersonating && (
        <div className="sticky top-0 z-40 glass border-b border-line text-amber text-xs font-semibold px-4 py-2 flex items-center justify-center gap-3">
          <span>Viewing as {s.user.name} — actions are audit-logged</span>
          <button onClick={() => s.stopImpersonating()} className="underline underline-offset-2 hover:opacity-80">
            Return to admin
          </button>
        </div>
      )}

      {/* ── Top bar: brand left · search centred · actions hard right ── */}
      <header className="sticky top-0 z-30 glass border-b border-line">
        <div className="relative flex items-center justify-between gap-3 px-3 sm:px-4 h-16">
          {/* Left cluster */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              className="lg:hidden p-2 rounded-xl text-ink-2 hover:bg-surface-2 transition-colors"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={s.toggleSidebar}
              className="hidden lg:flex p-2 rounded-xl text-ink-2 hover:bg-surface-2 transition-colors"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-expanded={!collapsed}
              title={`${collapsed ? 'Expand' : 'Collapse'} sidebar (⌘\\)`}
            >
              {collapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>
            <button onClick={() => s.setTab('home')} className="flex items-center gap-2.5">
              <LogoMark />
              <span className="hidden sm:block text-left leading-tight">
                <span className="flex items-center gap-1.5">
                  <WordMark />
                  <span className="text-[9px] font-semibold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded bg-primary-soft text-primary-text border border-primary/25">
                    Internal
                  </span>
                </span>
                <span className="hidden xl:block text-xs text-ink-3 font-medium">{TAGLINE}</span>
              </span>
            </button>
          </div>

          {/* Centre: search — absolutely centred on the viewport, independent
              of how wide the left/right clusters are */}
          <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 w-full max-w-md xl:max-w-lg justify-center pointer-events-none">
            <button
              onClick={() => setSearchOpen(true)}
              className="pointer-events-auto w-full flex items-center gap-2.5 px-4 py-2.5 rounded-2xl
                glass shadow-card text-ink-3 text-sm hover:text-ink-2 transition-colors"
            >
              <Search className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left truncate">Search opportunities, people, listings…</span>
              <kbd className="text-xs font-semibold border border-line-strong rounded-md px-1.5 py-0.5 shrink-0">⌘K</kbd>
            </button>
          </div>

          {/* Right cluster — pinned to the far right */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setSearchOpen(true)}
              className="lg:hidden p-2 rounded-xl text-ink-2 hover:bg-surface-2"
              aria-label="Search"
            >
              <Search className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={s.toggleDark}
              className="p-2 rounded-xl text-ink-2 hover:bg-surface-2 transition-colors"
              aria-label={s.dark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={s.dark ? 'Light mode' : 'Dark mode'}
            >
              {s.dark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
            <button
              onClick={() => s.setSavedOpen(true)}
              className="p-2 rounded-xl text-ink-2 hover:bg-surface-2 relative transition-colors"
              aria-label="Saved items"
            >
              <Bookmark className="w-4.5 h-4.5" />
              {s.saved.length > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-0.5 rounded-full bg-primary text-on-primary text-xs font-semibold flex items-center justify-center">
                  {s.saved.length}
                </span>
              )}
            </button>
            <button
              onClick={() => { s.setMessagePartnerId(null); s.setMessagesOpen(true); }}
              className="p-2 rounded-xl text-ink-2 hover:bg-surface-2 relative transition-colors"
              aria-label="Messages"
            >
              <MessageSquare className="w-4.5 h-4.5" />
              {s.counts.unreadMessages > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-0.5 rounded-full bg-red text-on-red text-xs font-semibold flex items-center justify-center">
                  {s.counts.unreadMessages}
                </span>
              )}
            </button>
            <button
              onClick={() => s.setNotificationsOpen(true)}
              className="p-2 rounded-xl text-ink-2 hover:bg-surface-2 relative transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4.5 h-4.5" />
              {s.counts.unreadNotifications > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-0.5 rounded-full bg-red text-on-red text-xs font-semibold flex items-center justify-center">
                  {s.counts.unreadNotifications}
                </span>
              )}
            </button>

            <div className="relative ml-1">
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-1.5 p-1 pr-2 rounded-2xl hover:bg-surface-2 transition-colors"
                aria-haspopup="menu" aria-expanded={userMenuOpen}
              >
                <Avatar initials={s.user.initials} name={s.user.name} src={s.user.avatarUrl} />
                <ChevronDown className="w-3.5 h-3.5 text-ink-3" />
              </button>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 z-50 w-60 panel-overlay rounded-2xl shadow-pop p-2 anim-pop-in">
                    <div className="px-3 py-2.5 border-b border-line mb-1">
                      <p className="text-sm font-normal text-ink truncate">{s.user.name}</p>
                      <p className="text-xs text-ink-2 truncate">{s.user.role} · {s.user.department}</p>
                      <p className="text-xs text-ink-3 mt-0.5 uppercase font-semibold tracking-wide">{s.user.systemRole}</p>
                    </div>
                    <button
                      onClick={() => { s.setProfileOpen(true); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-ink-2 hover:bg-surface-2 hover:text-ink"
                    >
                      <UserRound className="w-4 h-4" /> My Profile & Bandwidth
                    </button>
                    <button
                      onClick={() => { s.setProfileOpen(true); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-ink-2 hover:bg-surface-2 hover:text-ink"
                    >
                      <KeyRound className="w-4 h-4" /> Change Password
                    </button>
                    <button
                      onClick={() => { s.logout(); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-red hover:bg-red-soft"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop sidebar — collapsible */}
        <aside
          className={`hidden lg:flex flex-col shrink-0 sticky top-16 h-[calc(100dvh-4rem)] overflow-y-auto
            glass border-r border-line py-4 transition-[width,padding] duration-300 ease-out ${
            collapsed ? 'w-[4.5rem] px-2.5 items-center' : 'w-60 px-3'
          }`}
        >
          <div className={collapsed ? 'mb-3' : 'mb-4'}>
            <CreateMenu mini={collapsed} />
          </div>
          <NavLinks mini={collapsed} />

          {collapsed ? (
            <button
              onClick={() => s.setProfileOpen(true)}
              title={`Weekly bandwidth: ${s.user.availableHoursWeek}h`}
              className="mt-5 w-11 h-11 rounded-2xl bg-surface-2 flex flex-col items-center justify-center hover:bg-primary-soft transition-colors"
            >
              <span className="text-sm font-semibold text-ink leading-none">{s.user.availableHoursWeek}</span>
              <span className="text-xs text-ink-3 font-bold">hrs</span>
            </button>
          ) : (
            <div className="mt-5 mx-1 p-3.5 rounded-2xl bg-surface-2">
              <p className="text-xs font-medium text-ink-2 mb-1">Weekly bandwidth</p>
              <p className="text-xl font-semibold text-ink">{s.user.availableHoursWeek}h</p>
              <p className="text-xs text-ink-3">{s.user.typicalAvailability || 'declared availability'}</p>
              <button
                onClick={() => s.setProfileOpen(true)}
                className="mt-2 text-xs font-medium text-ink-2 hover:text-ink hover:underline underline-offset-2"
              >
                Update →
              </button>
            </div>
          )}
        </aside>

        {/* Mobile nav drawer */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden anim-fade-in">
            <div className="absolute inset-0 bg-black/35" onClick={() => setMobileNavOpen(false)} />
            <aside className="absolute left-0 top-0 h-full w-72 panel-overlay p-4 shadow-pop">
              <div className="flex items-center justify-between mb-4">
                <span className="flex items-center gap-2.5">
                  <LogoMark />
                  <WordMark />
                </span>
                <button onClick={() => setMobileNavOpen(false)} aria-label="Close navigation" className="p-2 rounded-xl text-ink-3 hover:bg-surface-2">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
              <div className="mb-4">
                <CreateMenu onNavigate={() => setMobileNavOpen(false)} />
              </div>
              <NavLinks onNavigate={() => setMobileNavOpen(false)} />
            </aside>
          </div>
        )}

        {/* Main content — fluid: fills the viewport at any width, no side gutters.
            Extra bottom padding below lg clears the fixed mobile tab bar. */}
        <main className="flex-1 min-w-0 w-full px-4 sm:px-6 lg:px-10 2xl:px-12 py-8 sm:py-10 pb-28 lg:pb-10">
          {s.tab === 'home' && <HomeDashboard />}
          {s.tab === 'work' && <WorkExchange />}
          {s.tab === 'people' && <PeopleView />}
          {s.tab === 'requests' && <MyRequests />}
          {s.tab === 'achievements' && <Achievements />}
          {s.tab === 'insights' && <InsightsView />}
          {s.tab === 'beyond' && <BeyondWork />}
          {s.tab === 'manager' && <ManagerInbox />}
          {s.tab === 'admin' && <AdminConsole />}
        </main>
      </div>

      {/* Fixed tab bar — phones and tablets only; the sidebar takes over at lg */}
      <nav
        aria-label="Primary"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 glass border-t border-line pb-[env(safe-area-inset-bottom)]"
      >
        <div className="flex items-stretch justify-around max-w-lg mx-auto px-1.5 py-1">
          {bottomNavItems.map((n) => {
            const active = !n.isMenu && s.tab === n.id;
            return (
              <button
                key={n.id}
                onClick={() => {
                  if (n.isMenu) { setMobileNavOpen(true); return; }
                  s.setTab(n.id as MainTab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                aria-current={active ? 'page' : undefined}
                className={`relative flex-1 flex flex-col items-center justify-center gap-1 py-1.5 rounded-xl transition-colors min-h-[52px] ${
                  active ? 'text-primary-text' : 'text-ink-3 hover:text-ink-2'
                }`}
              >
                {active && <span aria-hidden="true" className="absolute inset-x-1.5 inset-y-0.5 rounded-xl bg-primary-soft -z-10" />}
                <span className="relative">
                  {n.icon}
                  {n.dot && (
                    <span aria-hidden="true" className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-primary ring-2 ring-surface" />
                  )}
                </span>
                <span className="text-[10px] font-semibold leading-none tracking-tight">{n.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Overlays */}
      <WorkFormModal open={s.createWorkOpen} onClose={() => { s.setCreateWorkOpen(false); s.loadPosts(); }} />
      <MessagesDrawer />
      <NotificationsPanel />
      <SavedDrawer />
      <ProfileDrawer />
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      <Toasts toasts={s.toasts} onDismiss={s.dismissToast} />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
