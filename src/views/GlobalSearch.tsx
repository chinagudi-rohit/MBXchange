import React, { useEffect, useMemo, useState } from 'react';
import { Search, Briefcase, UserRound, X } from 'lucide-react';
import { useStore } from '../lib/store';
import { Avatar, Chip, StatusBadge } from '../components/ui';

export function GlobalSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const s = useStore();
  const [q, setQ] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        // toggled by parent via its own state; simulate by dispatching Escape when open
      }
      if (e.key === 'Escape' && open) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => { if (open) setQ(''); }, [open]);

  const ql = q.trim().toLowerCase();
  const results = useMemo(() => {
    if (!ql) return { posts: [], people: [] };
    return {
      posts: s.posts.filter((p) =>
        p.title.toLowerCase().includes(ql) || p.tags.some((t) => t.toLowerCase().includes(ql))
      ).slice(0, 5),
      people: s.users.filter((u) =>
        u.id !== s.user?.id && (u.name.toLowerCase().includes(ql) || u.primarySkills.some((sk) => sk.toLowerCase().includes(ql)))
      ).slice(0, 5)
    };
  }, [ql, s.posts, s.users, s.user]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-[2px] flex items-start justify-center pt-[12vh] px-4 anim-fade-in"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog" aria-modal="true" aria-label="Global search"
    >
      <div className="w-full max-w-xl bg-surface rounded-2xl shadow-pop anim-pop-in overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-line">
          <Search className="w-4.5 h-4.5 text-ink-3 shrink-0" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search opportunities, people, skills…"
            className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-3 focus:outline-none"
          />
          <button onClick={onClose} aria-label="Close search" className="p-1.5 rounded-lg text-ink-3 hover:text-ink hover:bg-surface-2">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-2">
          {!ql && (
            <p className="text-xs text-ink-3 text-center py-8">Type to search across MBXchange</p>
          )}
          {ql && results.posts.length === 0 && results.people.length === 0 && (
            <p className="text-xs text-ink-3 text-center py-8">No matches for “{q}”</p>
          )}

          {results.posts.length > 0 && (
            <div className="mb-2">
              <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink-3">Work opportunities</p>
              {results.posts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { s.setTab('work'); s.setOpenWorkId(p.id); onClose(); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-2 text-left"
                >
                  <span className="w-8 h-8 rounded-xl bg-primary-soft text-primary-text flex items-center justify-center shrink-0">
                    <Briefcase className="w-4 h-4" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold text-ink truncate">{p.title}</span>
                    <span className="block text-xs text-ink-3">{p.department} · {p.effortHours || p.duration}</span>
                  </span>
                  <StatusBadge status={p.status} />
                </button>
              ))}
            </div>
          )}

          {results.people.length > 0 && (
            <div>
              <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink-3">People</p>
              {results.people.map((u) => (
                <button
                  key={u.id}
                  onClick={() => { s.setTab('people'); onClose(); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-2 text-left"
                >
                  <Avatar initials={u.initials} size="md" name={u.name} />
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold text-ink truncate">{u.name}</span>
                    <span className="block text-xs text-ink-3 truncate">{u.role} · {u.department}</span>
                  </span>
                  <Chip tone="primary">{u.availableHoursWeek}h/wk</Chip>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
