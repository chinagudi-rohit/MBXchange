import React from 'react';
import { Bell, CheckCheck, X, MessageSquare, HandHeart, ShoppingBag, Sparkles } from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onSelectNotification: (item: NotificationItem) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications = [],
  onMarkAllRead,
  onSelectNotification
}) => {
  if (!isOpen) return null;

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadCount = safeNotifications.filter(n => !n.read).length;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'help_offer':
        return <HandHeart className="w-4 h-4 text-indigo-400" />;
      case 'reply':
        return <MessageSquare className="w-4 h-4 text-blue-400" />;
      case 'market_inquiry':
        return <ShoppingBag className="w-4 h-4 text-emerald-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in" onClick={onClose}>
      <div 
        className="w-full max-w-sm mt-14 bg-[#14171d] border border-[#21242c] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-top-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#21242c] bg-[#0f1116]">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-400" />
            <h3 className="font-semibold text-white text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllRead}
                title="Mark all as read"
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-[#1a1d26] transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-white p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="divide-y divide-[#21242c] max-h-96 overflow-y-auto">
          {safeNotifications.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No notifications yet. You're all caught up!
            </div>
          ) : (
            safeNotifications.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectNotification(item)}
                className={`w-full text-left p-3.5 flex items-start gap-3 hover:bg-[#1a1d26] transition-colors cursor-pointer ${
                  !item.read ? 'bg-indigo-500/10' : ''
                }`}
              >
                <div className="p-2 rounded-xl bg-[#0f1116] border border-[#21242c] shrink-0 mt-0.5">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h4 className={`text-xs font-semibold truncate ${!item.read ? 'text-white' : 'text-slate-300'}`}>
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-slate-500 shrink-0">{item.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                {!item.read && (
                  <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-2" />
                )}
              </button>
            ))
          )}
        </div>

        <div className="p-2.5 bg-[#0f1116] border-t border-[#21242c] text-center">
          <p className="text-[11px] text-slate-500">Notifications synced in real-time</p>
        </div>
      </div>
    </div>
  );
};
