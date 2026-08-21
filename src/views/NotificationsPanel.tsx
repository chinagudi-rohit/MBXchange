import React from 'react';
import { CheckCheck, Trash2, Bell, ShieldCheck, Sparkles, MessageSquare, UserPlus, Star } from 'lucide-react';
import { useStore, type MainTab } from '../lib/store';
import { api, timeAgo } from '../lib/api';
import { Drawer, Button, EmptyState } from '../components/ui';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  manager_approval: <ShieldCheck className="w-4 h-4 text-primary" />,
  match_found: <Sparkles className="w-4 h-4 text-violet" />,
  direct_message: <MessageSquare className="w-4 h-4 text-blue" />,
  collab_request: <UserPlus className="w-4 h-4 text-primary" />,
  registration_request: <UserPlus className="w-4 h-4 text-violet" />,
  feedback_received: <Star className="w-4 h-4 text-amber" />,
  reply: <MessageSquare className="w-4 h-4 text-blue" />,
  community_reply: <MessageSquare className="w-4 h-4 text-green" />,
  help_offer: <Sparkles className="w-4 h-4 text-green" />
};

export function NotificationsPanel() {
  const s = useStore();
  const unread = s.notifications.filter((n) => !n.read).length;

  const markAllRead = async () => {
    await api.post('/notifications/read-all');
    await s.loadNotifications();
    s.toast('info', 'All notifications marked as read');
  };

  const clearAll = async () => {
    await api.del('/notifications');
    await s.loadNotifications();
    s.toast('info', 'Notifications cleared', 'Your notification list is now empty.');
  };

  const openItem = async (n: any) => {
    if (!n.read) {
      await api.post(`/notifications/${n.id}/read`);
      s.loadNotifications();
    }
    if (n.targetTab) {
      const tab = (['home', 'work', 'people', 'requests', 'insights', 'beyond', 'manager', 'admin'].includes(n.targetTab)
        ? n.targetTab : n.targetTab === 'myxchange' ? 'requests' : n.targetTab === 'community' || n.targetTab === 'marketplace' || n.targetTab === 'carpool' ? 'beyond' : 'home') as MainTab;
      s.setTab(tab);
      if (tab === 'work' && n.targetId) s.setOpenWorkId(n.targetId);
      s.setNotificationsOpen(false);
    }
  };

  return (
    <Drawer
      open={s.notificationsOpen}
      onClose={() => s.setNotificationsOpen(false)}
      title="Notifications"
      subtitle={unread > 0 ? `${unread} unread` : 'You are all caught up'}
      width="max-w-md"
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-line">
        <Button size="sm" variant="secondary" onClick={markAllRead} disabled={unread === 0}>
          <CheckCheck className="w-3.5 h-3.5" /> Mark all read
        </Button>
        <Button size="sm" variant="danger" onClick={clearAll} disabled={s.notifications.length === 0}>
          <Trash2 className="w-3.5 h-3.5" /> Clear all
        </Button>
      </div>

      {s.notifications.length === 0 ? (
        <EmptyState title="No notifications" hint="Approvals, matches and replies will show up here." />
      ) : (
        <div>
          {s.notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => openItem(n)}
              className={`w-full flex items-start gap-3 px-4 py-3.5 text-left border-b border-line/60 transition-colors hover:bg-surface-2 ${
                !n.read ? 'bg-primary-soft/30' : ''
              }`}
            >
              <span className="w-8 h-8 rounded-xl bg-surface-2 flex items-center justify-center shrink-0 mt-0.5">
                {TYPE_ICONS[n.type] || <Bell className="w-4 h-4 text-ink-3" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className={`text-sm truncate ${!n.read ? 'font-bold text-ink' : 'font-semibold text-ink-2'}`}>{n.title}</span>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                </span>
                <span className="block text-xs text-ink-3 mt-0.5 leading-relaxed">{n.description}</span>
                <span className="block text-[10px] text-ink-3 mt-1">{timeAgo(n.createdAt)}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </Drawer>
  );
}
