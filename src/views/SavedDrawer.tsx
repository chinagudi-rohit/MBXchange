import React, { useEffect, useState } from 'react';
import { Briefcase, GraduationCap, Car, UsersRound } from 'lucide-react';
import { useStore } from '../lib/store';
import { api } from '../lib/api';
import { Drawer, EmptyState, SaveButton, StatusBadge } from '../components/ui';

export function SavedDrawer() {
  const s = useStore();
  const [trainings, setTrainings] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [community, setCommunity] = useState<any[]>([]);

  useEffect(() => {
    if (!s.savedOpen) return;
    api.get('/trainings').then((d) => setTrainings(d.trainings));
    api.get('/carpool/trips').then((d) => setTrips(d.trips));
    api.get('/community').then((d) => setCommunity(d.posts));
  }, [s.savedOpen]);

  const savedWork = s.posts.filter((p) => s.isSaved('work', p.id));
  const savedTrainings = trainings.filter((t) => s.isSaved('training', t.id));
  const savedTrips = trips.filter((t) => s.isSaved('carpool', t.id));
  const savedCommunity = community.filter((c) => s.isSaved('community', c.id));
  const total = savedWork.length + savedTrainings.length + savedTrips.length + savedCommunity.length;

  const Section = ({ icon, title, children, count }: any) => count === 0 ? null : (
    <div className="px-4 py-3">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-3 mb-2">
        {icon} {title} ({count})
      </p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );

  return (
    <Drawer
      open={s.savedOpen} onClose={() => s.setSavedOpen(false)}
      title="Saved Items" subtitle={`${total} item${total !== 1 ? 's' : ''} across MBXchange`}
      width="max-w-md"
    >
      {total === 0 ? (
        <EmptyState title="Nothing saved yet" hint="Tap the bookmark on any opportunity, session or ride to keep it here." />
      ) : (
        <div className="divide-y divide-line/60">
          <Section icon={<Briefcase className="w-3.5 h-3.5" />} title="Work opportunities" count={savedWork.length}>
            {savedWork.map((p) => (
              <div key={p.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-2">
                <button
                  className="flex-1 min-w-0 text-left"
                  onClick={() => { s.setTab('work'); s.setOpenWorkId(p.id); s.setSavedOpen(false); }}
                >
                  <p className="text-xs font-medium text-ink truncate">{p.title}</p>
                  <p className="text-xs text-ink-3">{p.department} · {p.effortHours || p.duration}</p>
                </button>
                <StatusBadge status={p.status} />
                <SaveButton saved onToggle={() => s.toggleSaved('work', p.id)} />
              </div>
            ))}
          </Section>
          <Section icon={<GraduationCap className="w-3.5 h-3.5" />} title="Learning sessions" count={savedTrainings.length}>
            {savedTrainings.map((t) => (
              <div key={t.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-2">
                <button
                  className="flex-1 min-w-0 text-left"
                  onClick={() => { s.setTab('learning'); s.setSavedOpen(false); }}
                >
                  <p className="text-xs font-medium text-ink truncate">{t.title}</p>
                  <p className="text-xs text-ink-3">{t.level} · {t.hostName}</p>
                </button>
                <SaveButton saved onToggle={() => s.toggleSaved('training', t.id)} />
              </div>
            ))}
          </Section>
          <Section icon={<Car className="w-3.5 h-3.5" />} title="Carpool trips" count={savedTrips.length}>
            {savedTrips.map((t) => (
              <div key={t.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-2">
                <button
                  className="flex-1 min-w-0 text-left"
                  onClick={() => { s.setTab('beyond'); s.setBeyondSection('carpool'); s.setSavedOpen(false); }}
                >
                  <p className="text-xs font-medium text-ink truncate">{t.origin} → {t.destination}</p>
                  <p className="text-xs text-ink-3">{t.direction === 'to_office' ? 'Morning' : 'Evening'} · {t.departureTime} · {t.driverName}</p>
                </button>
                <SaveButton saved onToggle={() => s.toggleSaved('carpool', t.id)} />
              </div>
            ))}
          </Section>
          <Section icon={<UsersRound className="w-3.5 h-3.5" />} title="Community posts" count={savedCommunity.length}>
            {savedCommunity.map((c) => (
              <div key={c.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-2">
                <button
                  className="flex-1 min-w-0 text-left"
                  onClick={() => { s.setTab('beyond'); s.setBeyondSection('community'); s.setSavedOpen(false); }}
                >
                  <p className="text-xs font-medium text-ink truncate">{c.title}</p>
                  <p className="text-xs text-ink-3">{c.type} · {c.authorName}</p>
                </button>
                <SaveButton saved onToggle={() => s.toggleSaved('community', c.id)} />
              </div>
            ))}
          </Section>
        </div>
      )}
    </Drawer>
  );
}
