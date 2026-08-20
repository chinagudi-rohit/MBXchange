import React, { useState, useMemo } from 'react';
import { 
  X, 
  Send, 
  MessageSquare, 
  Search, 
  Sparkles, 
  Check, 
  CheckCheck, 
  User, 
  Building2, 
  Briefcase, 
  ShoppingBag, 
  ArrowLeft 
} from 'lucide-react';
import { UserAccount, DirectMessage } from '../types';

interface DirectMessagesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  allUsers: UserAccount[];
  messages: DirectMessage[];
  onSendMessage: (recipientId: string, text: string, contextTitle?: string, contextType?: any) => void;
  onMarkConversationRead: (recipientId: string) => void;
  selectedUserId?: string;
}

export const DirectMessagesDrawer: React.FC<DirectMessagesDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  allUsers,
  messages,
  onSendMessage,
  onMarkConversationRead,
  selectedUserId
}) => {
  const [activePartnerId, setActivePartnerId] = useState<string | null>(selectedUserId || null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Set active partner if changed from props
  React.useEffect(() => {
    if (selectedUserId) {
      setActivePartnerId(selectedUserId);
      onMarkConversationRead(selectedUserId);
    }
  }, [selectedUserId]);

  // Compute conversations list
  const conversations = useMemo(() => {
    const partnerMap = new Map<string, { partner: UserAccount; lastMessage: DirectMessage; unreadCount: number }>();

    // Scan all messages involving currentUser
    messages.forEach((msg) => {
      let partnerId: string | null = null;
      if (msg.senderId === currentUser.id) {
        partnerId = msg.recipientId;
      } else if (msg.recipientId === currentUser.id) {
        partnerId = msg.senderId;
      }

      if (!partnerId) return;

      const partnerUser = allUsers.find(u => u.id === partnerId);
      if (!partnerUser) return;

      const isUnread = msg.recipientId === currentUser.id && !msg.read;

      if (!partnerMap.has(partnerId)) {
        partnerMap.set(partnerId, {
          partner: partnerUser,
          lastMessage: msg,
          unreadCount: isUnread ? 1 : 0
        });
      } else {
        const existing = partnerMap.get(partnerId)!;
        if (msg.timestamp > existing.lastMessage.timestamp) {
          existing.lastMessage = msg;
        }
        if (isUnread) {
          existing.unreadCount += 1;
        }
      }
    });

    // Also include any users matching search query even if no messages yet
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      allUsers
        .filter(u => u.id !== currentUser.id && (u.name.toLowerCase().includes(q) || u.department.toLowerCase().includes(q) || u.role.toLowerCase().includes(q)))
        .forEach(u => {
          if (!partnerMap.has(u.id)) {
            partnerMap.set(u.id, {
              partner: u,
              lastMessage: {
                id: 'draft',
                senderId: currentUser.id,
                senderName: currentUser.name,
                senderInitials: currentUser.initials,
                senderRole: currentUser.role,
                recipientId: u.id,
                recipientName: u.name,
                recipientInitials: u.initials,
                recipientRole: u.role,
                text: 'Start a new conversation...',
                timestamp: 0,
                time: '',
                read: true
              },
              unreadCount: 0
            });
          }
        });
    }

    return Array.from(partnerMap.values()).sort((a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp);
  }, [messages, currentUser.id, allUsers, searchQuery]);

  const activePartner = allUsers.find(u => u.id === activePartnerId);

  const activeThread = useMemo(() => {
    if (!activePartnerId) return [];
    return messages.filter(
      m => (m.senderId === currentUser.id && m.recipientId === activePartnerId) ||
           (m.senderId === activePartnerId && m.recipientId === currentUser.id)
    ).sort((a, b) => a.timestamp - b.timestamp);
  }, [messages, currentUser.id, activePartnerId]);

  if (!isOpen) return null;

  const handleSelectPartner = (partnerId: string) => {
    setActivePartnerId(partnerId);
    onMarkConversationRead(partnerId);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activePartnerId) return;

    onSendMessage(activePartnerId, messageText.trim());
    setMessageText('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-sm animate-in fade-in flex justify-end">
      <div className="w-full max-w-2xl bg-[#0c0d10] border-l border-[#21242c] h-full overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-right duration-200 text-slate-300">
        
        {/* Header */}
        <div className="p-4 bg-[#14171d] border-b border-[#21242c] flex items-center justify-between">
          <div className="flex items-center gap-3">
            {activePartnerId && (
              <button
                onClick={() => setActivePartnerId(null)}
                className="p-1.5 rounded-xl hover:bg-[#1a1d26] text-slate-400 hover:text-white md:hidden"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {activePartner ? activePartner.name : 'Internal Direct Messenger'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {activePartner ? `${activePartner.role} · ${activePartner.department}` : 'Peer-to-peer engineering collaboration'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#1a1d26] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Layout */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Sidebar: Conversations list */}
          <div className={`w-full md:w-72 border-r border-[#21242c] bg-[#101217] flex flex-col ${activePartnerId ? 'hidden md:flex' : 'flex'}`}>
            
            {/* Search Input */}
            <div className="p-3 border-b border-[#21242c]">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Find colleague to message..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#0c0d10] border border-[#262a33] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#1a1d26]">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  No conversations found. Search for a colleague above.
                </div>
              ) : (
                conversations.map(({ partner, lastMessage, unreadCount }) => {
                  const isSelected = activePartnerId === partner.id;
                  return (
                    <div
                      key={partner.id}
                      onClick={() => handleSelectPartner(partner.id)}
                      className={`p-3 cursor-pointer transition-colors flex items-center gap-3 ${
                        isSelected
                          ? 'bg-[#181c24] border-l-2 border-indigo-500'
                          : 'hover:bg-[#14171d]'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-500/30">
                        {partner.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white truncate">{partner.name}</span>
                          <span className="text-[9px] text-slate-500 font-mono">{lastMessage.time}</span>
                        </div>
                        <div className="text-[10px] text-indigo-400 truncate">{partner.department}</div>
                        <p className={`text-[11px] truncate mt-0.5 ${unreadCount > 0 ? 'text-white font-bold' : 'text-slate-400'}`}>
                          {lastMessage.text}
                        </p>
                      </div>
                      {unreadCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* Right Main Area: Active Chat Thread */}
          <div className={`flex-1 flex flex-col bg-[#0c0d10] ${!activePartnerId ? 'hidden md:flex' : 'flex'}`}>
            {activePartner ? (
              <>
                {/* Active Partner Info Strip */}
                <div className="px-4 py-2 bg-[#14171d] border-b border-[#21242c] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{activePartner.name}</span>
                    <span className="text-slate-400">· {activePartner.role}</span>
                    <span className="px-1.5 py-0.2 rounded bg-[#0c0d10] text-[10px] font-mono text-indigo-300 border border-[#262a33]">
                      {activePartner.department}
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-400">● Available</span>
                </div>

                {/* Messages Stream */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {activeThread.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                      <MessageSquare className="w-8 h-8 text-slate-600 mb-2" />
                      <p className="text-xs">No previous messages with {activePartner.name}.</p>
                      <p className="text-[11px] text-slate-600 mt-1">Send a message below to initiate cross-squad collaboration.</p>
                    </div>
                  ) : (
                    activeThread.map((msg) => {
                      const isMe = msg.senderId === currentUser.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          {msg.contextTitle && (
                            <span className="text-[10px] text-indigo-400 mb-1 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 font-mono">
                              Ref: {msg.contextTitle}
                            </span>
                          )}
                          <div
                            className={`max-w-md p-3 rounded-2xl text-xs leading-relaxed ${
                              isMe
                                ? 'bg-indigo-600 text-white rounded-br-xs'
                                : 'bg-[#181c24] text-slate-200 border border-[#262a33] rounded-bl-xs'
                            }`}
                          >
                            {msg.text}
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-[9px] text-slate-500 font-mono">
                            <span>{msg.time}</span>
                            {isMe && (
                              <CheckCheck className={`w-3 h-3 ${msg.read ? 'text-indigo-400' : 'text-slate-600'}`} />
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Composer */}
                <form onSubmit={handleSend} className="p-3 bg-[#14171d] border-t border-[#21242c] flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Message ${activePartner.name}...`}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-[#0c0d10] border border-[#262a33] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!messageText.trim()}
                    className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-all cursor-pointer shrink-0 shadow-md"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <MessageSquare className="w-12 h-12 text-slate-700 mb-3" />
                <h4 className="text-sm font-bold text-slate-300">Select a Colleague to Chat</h4>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Connect directly with experts across powertrain and software departments.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
