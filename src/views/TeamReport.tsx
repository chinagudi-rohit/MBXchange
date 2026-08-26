import React, { useEffect, useState } from 'react';
import { FileBarChart, Download, Building2, Users, ShieldCheck } from 'lucide-react';
import { useStore } from '../lib/store';
import { api } from '../lib/api';
import { Card, Avatar, Chip, Select, Button, EmptyState, RowSkeleton } from '../components/ui';

interface Person {
  id: string; name: string; initials: string; role: string; department: string;
  avatarUrl: string; tier: string;
  availableHoursWeek: number; hoursConsumed: number; hoursContributed: number;
  engagements: number; departmentsSupported: number; badges: number;
  openRequests: number; activeEngagements: number; trainingsBooked: number;
}

interface ReportData {
  scope: 'organisation' | 'department' | 'manager';
  department: string;
  managerId: string;
  isAdmin: boolean;
  people: Person[];
  totals: Record<string, number>;
  byDepartment: Array<{ department: string; engagements: number; hours: number }>;
  topSkills: Array<{ skill: string; mentions: number }>;
  filters: { managers: Array<{ id: string; name: string; department: string }>; departments: string[] };
}

/** Turn the roster into a CSV the viewer can open in Excel. */
function toCsv(people: Person[]): string {
  const head = [
    'Name', 'Role', 'Department', 'Tier', 'Declared hours/week', 'Hours committed',
    'Hours contributed', 'Engagements', 'Departments reached', 'Badges',
    'Open requests', 'Active engagements', 'Trainings booked'
  ];
  const rows = people.map((p) => [
    p.name, p.role, p.department, p.tier, p.availableHoursWeek, p.hoursConsumed,
    p.hoursContributed, p.engagements, p.departmentsSupported, p.badges,
    p.openRequests, p.activeEngagements, p.trainingsBooked
  ]);
  // Quote every field and double any embedded quotes — names and roles can
  // legitimately contain commas.
  const esc = (v: unknown) => `"${String(v).replace(/"/g, '""')}"`;
  return [head, ...rows].map((r) => r.map(esc).join(',')).join('\n');
}

export function TeamReport() {
  const s = useStore();
  const [data, setData] = useState<ReportData | null>(null);
  const [scope, setScope] = useState<'organisation' | 'department' | 'manager'>(
    s.user?.systemRole === 'admin' ? 'organisation' : 'manager'
  );
  const [department, setDepartment] = useState(s.user?.department || '');
  const [managerId, setManagerId] = useState(s.user?.id || '');

  const isAdmin = s.user?.systemRole === 'admin';

  useEffect(() => {
    setData(null);
    const qs = new URLSearchParams({ scope });
    if (scope === 'department') qs.set('department', department);
    if (scope === 'manager') qs.set('managerId', managerId);
    api.get(`/reports?${qs}`).then(setData);
  }, [scope, department, managerId]);

  const download = () => {
    if (!data) return;
    const blob = new Blob([toCsv(data.people)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mbxchange-report-${data.scope}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const headline = data ? [
    { label: 'People', value: data.totals.people },
    { label: 'Hours contributed', value: `${data.totals.hoursContributed}h` },
    { label: 'Engagements', value: data.totals.engagements },
    { label: 'Badges earned', value: data.totals.badges },
    { label: 'Declared bandwidth', value: `${data.totals.declaredHours}h/wk` },
    { label: 'In flight', value: data.totals.activeEngagements }
  ] : [];

  const maxDeptHours = Math.max(1, ...(data?.byDepartment || []).map((d) => d.hours));

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
        <div>
          <h2 className="text-sm font-semibold text-ink flex items-center gap-1.5">
            <FileBarChart className="w-4 h-4 text-primary-text" /> Team report
          </h2>
          <p className="text-xs text-ink-2 mt-0.5">
            {isAdmin
              ? 'Pull a report organisation-wide, by department, or for one manager’s team'
              : 'Everyone who reports to you, and what they have been doing across the org'}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={download} disabled={!data || data.people.length === 0}>
          <Download className="w-3.5 h-3.5" /> Export CSV
        </Button>
      </div>

      {/* Admins choose the cut; a manager has exactly one and the server
          enforces it regardless of what the client asks for. */}
      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3">
          <Select value={scope} onChange={(e) => setScope(e.target.value as any)} aria-label="Report scope">
            <option value="organisation">Organisation-wide</option>
            <option value="department">By department</option>
            <option value="manager">By manager</option>
          </Select>
          {scope === 'department' && (
            <Select value={department} onChange={(e) => setDepartment(e.target.value)} aria-label="Department">
              {(data?.filters.departments || []).map((d) => <option key={d}>{d}</option>)}
            </Select>
          )}
          {scope === 'manager' && (
            <Select value={managerId} onChange={(e) => setManagerId(e.target.value)} aria-label="Manager">
              {(data?.filters.managers || []).map((m) => (
                <option key={m.id} value={m.id}>{m.name} · {m.department}</option>
              ))}
            </Select>
          )}
        </div>
      )}

      {!isAdmin && (
        <p className="text-xs text-ink-3 mb-3 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          Scoped to your own reports — managers cannot pull other teams.
        </p>
      )}

      {!data ? (
        <RowSkeleton count={5} />
      ) : data.people.length === 0 ? (
        <EmptyState title="Nobody in this scope" hint="Pick a different department or manager." />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-2.5">
            {headline.map((k) => (
              <Card key={k.label} className="p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-3">{k.label}</p>
                <p className="text-xl font-bold tracking-tight text-ink mt-1.5 leading-none tabular-nums">{k.value}</p>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-3 mb-3 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Where this group's help went
              </h3>
              {data.byDepartment.length === 0 ? (
                <p className="text-xs text-ink-3">No completed cross-department work yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {data.byDepartment.map((d) => (
                    <div key={d.department} className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-ink-2 w-20 shrink-0 truncate">{d.department}</span>
                      <div className="flex-1 h-2.5 rounded-full bg-surface-2 overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${(d.hours / maxDeptHours) * 100}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-ink w-12 text-right tabular-nums">{d.hours}h</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-3 mb-3">
                What they get asked for
              </h3>
              {data.topSkills.length === 0 ? (
                <p className="text-xs text-ink-3">No tagged engagements yet.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {data.topSkills.map((sk) => (
                    <span key={sk.skill} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-soft text-primary-text text-xs font-semibold">
                      {sk.skill}
                      <span className="opacity-70">×{sk.mentions}</span>
                    </span>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <Card className="overflow-x-auto">
            <table className="w-full text-xs min-w-[52rem]">
              <thead>
                <tr className="text-left text-ink-3 border-b border-line">
                  {['Person', 'Tier', 'Declared', 'Committed', 'Contributed', 'Gigs', 'Depts', 'Badges', 'Open', 'Active', 'Trainings'].map((h) => (
                    <th key={h} className="font-semibold uppercase tracking-wide px-3 py-2.5 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.people.map((p) => {
                  const over = p.hoursConsumed > p.availableHoursWeek;
                  return (
                    <tr key={p.id}>
                      <td className="px-3 py-2.5">
                        <span className="flex items-center gap-2 min-w-0">
                          <Avatar initials={p.initials} size="sm" name={p.name} src={p.avatarUrl} />
                          <span className="min-w-0">
                            <span className="block font-semibold text-ink truncate">{p.name}</span>
                            <span className="block text-ink-3 truncate">{p.role}</span>
                          </span>
                        </span>
                      </td>
                      <td className="px-3 py-2.5"><Chip>{p.tier}</Chip></td>
                      <td className="px-3 py-2.5 tabular-nums text-ink-2">{p.availableHoursWeek}h</td>
                      {/* Over-committed people are the reason a manager opens
                          this table at all, so they are called out. */}
                      <td className={`px-3 py-2.5 tabular-nums font-semibold ${over ? 'text-red' : 'text-ink-2'}`}>
                        {p.hoursConsumed}h
                      </td>
                      <td className="px-3 py-2.5 tabular-nums text-ink">{p.hoursContributed}h</td>
                      <td className="px-3 py-2.5 tabular-nums text-ink-2">{p.engagements}</td>
                      <td className="px-3 py-2.5 tabular-nums text-ink-2">{p.departmentsSupported}</td>
                      <td className="px-3 py-2.5 tabular-nums text-ink-2">{p.badges}</td>
                      <td className="px-3 py-2.5 tabular-nums text-ink-2">{p.openRequests}</td>
                      <td className="px-3 py-2.5 tabular-nums text-ink-2">{p.activeEngagements}</td>
                      <td className="px-3 py-2.5 tabular-nums text-ink-2">{p.trainingsBooked}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </section>
  );
}
