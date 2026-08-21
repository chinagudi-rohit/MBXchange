import React, { useMemo, useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Search } from 'lucide-react';
import { useStore } from '../lib/store';
import { api, timeAgo } from '../lib/api';
import { Drawer, Avatar, TextInput, EmptyState } from '../components/ui';

export function MessagesDrawer() {
  const s = useStore();
  const [query, setQuery] = useState('');
  const [text, setText] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const partnerId = s.messagePartnerId;
  const me = s.user?.id;

  // Conversation list: latest message per partner
  const conversations = useMemo(() => {
    const byPartner = new Map<string, { last: any; unread: number }>();
    for (const m of s.messages) {
      const pid = m.senderId === me ? m.recipientId : m.senderId;
      const entry = byPartner.get(pid) || { last: m, unread: 0 };
      if (new Date(m.createdAt).getTime() >= new Date(entry.last.createdAt).getTime()) entry.last = m;
      if (m.recipientId === me && !m.read) entry.unread += 1;
      byPartner.set(pid, entry);
    }
    return [...byPartner.entries()]
      .map(([pid, v]) => ({ partnerId: pid, ...v, user: s.users.find((u) => u.id === pid) }))
      .filter((c) => c.user)
      .sort((a, b) => new Date(b.last.createdAt).getTime() - new Date(a.last.createdAt).getTime());
  }, [s.messages, s.users, me]);

  const thread = useMemo(() => {
    if (!partnerId) return [];
    return s.messages
      .filter((m) => (m.senderId === me && m.recipientId === partnerId) || (m.senderId === partnerId && m.recipientId === me))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [s.messages, partnerId, me]);

  const partner = s.users.find((u) => u.id === partnerId);

  useEffect(() => {
    if (s.messagesOpen && partnerId) {
      api.post('/messages/read', { partnerId }).then(() => s.loadMessages());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.messagesOpen, partnerId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [thread.length, s.messagesOpen]);

  const send = async () => {
    if (!text.trim() || !partnerId) return;
    await api.post('/messages', { recipientId: partnerId, text });
    setText('');
    await s.loadMessages();
  };

  const candidates = query
    ? s.users.filter((u) => u.id !== me && u.name.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : [];

  return (
    <Drawer
      open={s.messagesOpen}
      onClose={() => { s.setMessagesOpen(false); s.setMessagePartnerId(null); }}
      title={partner ? partner.name : 'Messages'}
      subtitle={partner ? `${partner.role} · ${partner.department}` : 'Direct messages with colleagues'}
      width="max-w-md"
    >
      {!partnerId ? (
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-line">
            <div className="relative">
              <Search className="w-4 h-4 text-ink-3 absolute left-3 top-1/2 -translate-y-1/2" />
              <TextInput
                value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Start a new conversation…" className="!pl-9"
              />
            </div>
            {candidates.length > 0 && (
              <div className="mt-2 space-y-1">
                {candidates.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => { s.setMessagePartnerId(u.id); setQuery(''); }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-surface-2 text-left"
                  >
                    <Avatar initials={u.initials} size="sm" />
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold text-ink truncate">{u.name}</span>
                      <span className="block text-xs text-ink-3 truncate">{u.role}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <EmptyState title="No conversations yet" hint="Search a colleague above to start chatting." />
            ) : (
              conversations.map((c) => (
                <button
                  key={c.partnerId}
                  onClick={() => s.setMessagePartnerId(c.partnerId)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-2 text-left border-b border-line/60"
                >
                  <Avatar initials={c.user!.initials} name={c.user!.name} />
                  <span className="flex-1 min-w-0">
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-ink truncate">{c.user!.name}</span>
                      <span className="text-xs text-ink-3 shrink-0">{timeAgo(c.last.createdAt)}</span>
                    </span>
                    <span className="block text-xs text-ink-3 truncate mt-0.5">
                      {c.last.senderId === me ? 'You: ' : ''}{c.last.text}
                    </span>
                  </span>
                  {c.unread > 0 && (
                    <span className="min-w-5 h-5 px-1 rounded-full bg-primary text-on-primary text-xs font-semibold flex items-center justify-center shrink-0">
                      {c.unread}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <button
            onClick={() => s.setMessagePartnerId(null)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-ink-2 hover:text-ink border-b border-line shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> All conversations
          </button>
          <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3">
            {thread.map((m) => {
              const mine = m.senderId === me;
              return (
                <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] min-w-0 ${mine ? 'items-end' : 'items-start'} flex flex-col`}>
                    {m.contextTitle && (
                      <span className="text-xs font-semibold text-primary-text bg-primary-soft rounded-md px-2 py-0.5 mb-1 truncate max-w-full">
                        Re: {m.contextTitle}
                      </span>
                    )}
                    <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                      mine ? 'bg-primary text-on-primary rounded-br-md' : 'bg-surface-2 text-ink rounded-bl-md'
                    }`}>
                      {m.text}
                    </div>
                    <span className="text-xs text-ink-3 mt-1">{timeAgo(m.createdAt)}</span>
                  </div>
                </div>
              );
            })}
            {thread.length === 0 && (
              <p className="text-xs text-ink-3 text-center py-8">No messages yet — say hello 👋</p>
            )}
            <div ref={endRef} />
          </div>
          <div className="p-3.5 border-t border-line shrink-0">
            <div className="flex gap-2">
              <TextInput
                value={text} onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder={`Message ${partner?.name?.split(' ')[0] || ''}…`}
              />
              <button
                onClick={send} disabled={!text.trim()}
                aria-label="Send message"
                className="shrink-0 w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center disabled:opacity-40 hover:bg-primary-strong transition-colors active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}
