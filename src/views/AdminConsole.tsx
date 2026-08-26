import React, { useEffect, useState } from 'react';
import {
  Users, UserPlus, ClipboardList, ScrollText, KeyRound, Eye, Copy, RefreshCw, CheckCircle2
} from 'lucide-react';
import { useStore } from '../lib/store';
import { api, timeAgo, type User } from '../lib/api';
import {
  Button, Card, Chip, Avatar, Modal, Field, TextInput, Select, StatusBadge, EmptyState, RowSkeleton
} from '../components/ui';



const DEPARTMENTS = ['PT-THIA', 'PT-THIS', 'PT-THIT', 'PT-THID', 'PT-THIE', 'PT-THIM', 'PT-THIP', 'PT-THIG', 'PT-THIC', 'PT-THIF'];

function TempPasswordReveal({ email, password, onDone }: { email: string; password: string; onDone: () => void }) {
  const s = useStore();
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-green-soft/60 border border-green/30">
        <p className="flex items-center gap-1.5 text-sm font-normal text-green"><CheckCircle2 className="w-4 h-4" /> Account created</p>
        <p className="text-xs text-ink-2 mt-1">
          Share these credentials with the employee over a secure channel. They can change the password after signing in.
        </p>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between p-3 rounded-xl bg-surface-2">
          <span className="text-xs font-semibold text-ink-2">Email</span>
          <span className="text-xs font-mono font-semibold text-ink">{email}</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-surface-2">
          <span className="text-xs font-semibold text-ink-2">Temporary password</span>
          <span className="flex items-center gap-2">
            <span className="text-sm font-mono font-semibold text-primary-text">{password}</span>
            <button
              onClick={() => { navigator.clipboard.writeText(password); s.toast('info', 'Password copied'); }}
              aria-label="Copy password" className="p-1.5 rounded-lg text-ink-3 hover:text-ink hover:bg-line"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </span>
        </div>
      </div>
      <p className="text-xs text-ink-3">This password is shown only once — it is stored hashed.</p>
      <div className="flex justify-end">
        <Button onClick={onDone}>Done</Button>
      </div>
    </div>
  );
}

export function AdminConsole() {
  const s = useStore();
  const [section, setSection] = useState<'overview' | 'users' | 'registrations' | 'audit'>('overview');
  const [overview, setOverview] = useState<any>(null);
  const [regRequests, setRegRequests] = useState<any[] | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [userDept, setUserDept] = useState('All');
  const [userRole, setUserRole] = useState('All');
  const [userStatus, setUserStatus] = useState('All');
  const [completeReg, setCompleteReg] = useState<any>(null);
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', role: '', systemRole: 'employee', department: DEPARTMENTS[0],
    campus: '', managerId: '', availableHoursWeek: '6'
  });

  const [allUsers, setAllUsers] = useState<User[]>([]);

  const load = async () => {
    const [ov, reg, us] = await Promise.all([
      api.get('/admin/overview'),
      api.get('/admin/registration-requests'),
      api.get('/users?includeInactive=true')
    ]);
    setOverview(ov);
    setRegRequests(reg.requests);
    setAllUsers(us.users);
  };
  useEffect(() => { load(); }, []);

  const allManagers = s.users.filter((u) => u.systemRole === 'manager' || u.systemRole === 'admin');
  // Approvals route to someone who owns the employee's department, so the
  // picker offers that department's managers first. Anything else is a
  // deliberate cross-department exception the admin has to opt into.
  const [anyDeptManager, setAnyDeptManager] = useState(false);
  const deptManagers = allManagers.filter((m) => m.department === form.department);
  const managers = anyDeptManager || deptManagers.length === 0 ? allManagers : deptManagers;

  const roster = allUsers.length ? allUsers : s.users;

  const roleCounts = {
    employee: roster.filter((u) => u.systemRole === 'employee').length,
    manager: roster.filter((u) => u.systemRole === 'manager').length,
    admin: roster.filter((u) => u.systemRole === 'admin').length
  };

  const visibleUsers = roster.filter((u) => {
    if (userDept !== 'All' && u.department !== userDept) return false;
    if (userRole !== 'All' && u.systemRole !== userRole) return false;
    if (userStatus !== 'All' && u.status !== userStatus) return false;
    if (userQuery) {
      const ql = userQuery.toLowerCase();
      if (!u.name.toLowerCase().includes(ql) && !u.email.toLowerCase().includes(ql)) return false;
    }
    return true;
  });
  const pendingReg = (regRequests || []).filter((r) => r.status === 'pending');

  const openCreate = () => {
    setForm({ name: '', email: '', role: '', systemRole: 'employee', department: DEPARTMENTS[0], campus: '', managerId: '', availableHoursWeek: '6' });
    setCreated(null);
    setCreateOpen(true);
  };

  const submitCreate = async () => {
    if (!form.name.trim() || !form.email.trim()) { s.toast('error', 'Name and email required'); return; }
    setBusy(true);
    try {
      const { user, tempPassword } = await api.post('/users', {
        ...form,
        managerId: form.managerId || undefined,
        availableHoursWeek: Number(form.availableHoursWeek) || 0
      });
      setCreated({ email: user.email, password: tempPassword });
      await s.loadUsers();
      s.toast('success', 'Account created', user.name);
    } catch (e: any) {
      s.toast('error', 'Could not create account', e.message);
    } finally {
      setBusy(false);
    }
  };

  const openCompleteReg = (r: any) => {
    setCompleteReg(r);
    setCreated(null);
    setForm({
      name: r.subjectKind === 'manager' && r.subjectName.startsWith('Manager of') ? '' : r.subjectName,
      email: r.subjectEmail || '',
      role: r.subjectRole || (r.subjectKind === 'manager' ? 'Engineering Manager' : ''),
      systemRole: r.subjectKind === 'manager' ? 'manager' : 'employee',
      department: r.subjectDepartment || r.forUserDepartment || DEPARTMENTS[0],
      campus: '', managerId: '', availableHoursWeek: '6'
    });
  };

  const submitCompleteReg = async () => {
    if (!completeReg) return;
    if (!form.name.trim() || !form.email.trim()) { s.toast('error', 'Name and email required'); return; }
    setBusy(true);
    try {
      const { user, tempPassword } = await api.post(`/admin/registration-requests/${completeReg.id}/complete`, {
        ...form,
        managerId: form.managerId || undefined
      });
      setCreated({ email: user.email, password: tempPassword });
      await Promise.all([load(), s.loadUsers()]);
      s.toast('success', 'Registration completed', 'Waiting requests have been routed automatically.');
    } catch (e: any) {
      s.toast('error', 'Could not complete registration', e.message);
    } finally {
      setBusy(false);
    }
  };

  const resetPassword = async (u: User) => {
    const { tempPassword } = await api.post(`/users/${u.id}/reset-password`);
    setCreated({ email: u.email, password: tempPassword });
    s.toast('success', 'Password reset', `${u.name} must use the new temporary password.`);
  };

  const toggleActive = async (u: User) => {
    await api.patch(`/users/${u.id}`, { status: u.status === 'active' ? 'inactive' : 'active' });
    await Promise.all([s.loadUsers(), load()]);
    s.toast('info', u.status === 'active' ? 'Account deactivated' : 'Account reactivated', u.name);
  };

  const sections = [
    { id: 'overview' as const, label: 'Overview', icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'users' as const, label: 'Users', icon: <Users className="w-4 h-4" /> },
    { id: 'registrations' as const, label: `Registrations${pendingReg.length ? ` (${pendingReg.length})` : ''}`, icon: <UserPlus className="w-4 h-4" /> },
    { id: 'audit' as const, label: 'Audit Log', icon: <ScrollText className="w-4 h-4" /> }
  ];

  return (
    <div className="anim-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Admin Console</h1>
          <p className="text-xs text-ink-2 mt-0.5">Accounts, registrations, governance and platform insight</p>
        </div>
        <Button variant="ghost" size="sm" onClick={load} aria-label="Refresh"><RefreshCw className="w-4 h-4" /></Button>
      </div>

      <div className="flex gap-1.5 mb-6 panel shadow-card p-1 rounded-xl w-fit flex-wrap">
        {sections.map((sec) => (
          <button
            key={sec.id} onClick={() => setSection(sec.id)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              section === sec.id ? 'bg-primary text-on-primary' : 'text-ink-2 hover:text-ink'
            }`}
          >
            {sec.icon} {sec.label}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {section === 'overview' && (
        overview ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                ['Active users', overview.stats.users],
                ['Open requirements', overview.stats.openPosts],
                ['Pending approvals', overview.stats.pendingApprovals],
                ['Pending registrations', overview.stats.awaitingRegistration],
                ['Approved engagements', overview.stats.approvedThisMonth],
                ['Active carpool trips', overview.stats.activeTrips],
                ['Upcoming trainings', overview.stats.upcomingTrainings]
              ].map(([label, value]) => (
                <Card key={label as string} className="p-4">
                  <p className="text-2xl font-medium text-ink">{value as number}</p>
                  <p className="text-xs font-medium text-ink-2 mt-0.5">{label}</p>
                </Card>
              ))}
            </div>
            <Card className="p-7">
              <h3 className="text-sm font-semibold text-ink mb-4">Requirements by department</h3>
              <div className="space-y-2.5">
                {overview.departmentLoad.map((d: any) => {
                  const max = Math.max(...overview.departmentLoad.map((x: any) => x.posts));
                  return (
                    <div key={d.department} className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-ink-2 w-20 shrink-0">{d.department}</span>
                      <div className="flex-1 h-2.5 rounded-full bg-surface-2 overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${(d.posts / max) * 100}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-ink w-6 text-right">{d.posts}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        ) : <RowSkeleton count={5} />
      )}

      {/* ── Users ── */}
      {section === 'users' && (
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-4">
            <TextInput
              placeholder="Search name or email…"
              value={userQuery} onChange={(e) => setUserQuery(e.target.value)}
              className="!w-60"
            />
            <Select value={userDept} onChange={(e) => setUserDept(e.target.value)} className="!w-44" aria-label="Filter by department">
              <option value="All">All departments</option>
              {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </Select>
            <Select value={userRole} onChange={(e) => setUserRole(e.target.value)} className="!w-40" aria-label="Filter by role">
              <option value="All">All roles</option>
              <option value="employee">Employees ({roleCounts.employee})</option>
              <option value="manager">Managers ({roleCounts.manager})</option>
              <option value="admin">Admins ({roleCounts.admin})</option>
            </Select>
            <Select value={userStatus} onChange={(e) => setUserStatus(e.target.value)} className="!w-36" aria-label="Filter by status">
              <option value="All">Any status</option>
              <option value="active">Active</option>
              <option value="inactive">Deactivated</option>
            </Select>
            <span className="flex-1" />
            <Button onClick={openCreate}><UserPlus className="w-4 h-4" /> Create Account</Button>
          </div>
          <p className="text-xs text-ink-3 mb-2">
            Showing <b className="text-ink-2">{visibleUsers.length}</b> of {roster.length} accounts
          </p>
          <p className="lg:hidden text-xs text-ink-3 mb-2">Swipe the table sideways to see all columns →</p>
          <Card className="overflow-x-auto relative">
            <table className="w-full text-left min-w-[640px]">
              <thead>
                <tr className="border-b border-line">
                  {['User', 'Role', 'Department', 'Manager', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleUsers.map((u) => {
                  const mgr = s.users.find((m) => m.id === u.managerId);
                  return (
                    <tr key={u.id} className="border-b border-line/60 last:border-0 hover:bg-surface-2/50">
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2.5">
                          <Avatar initials={u.initials} size="sm" name={u.name} />
                          <span className="min-w-0">
                            <span className="block text-xs font-semibold text-ink truncate">{u.name}</span>
                            <span className="block text-xs text-ink-3 truncate">{u.email}</span>
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Chip tone={u.systemRole !== 'employee' ? 'primary' : 'default'}>{u.systemRole}</Chip>
                      </td>
                      <td className="px-4 py-3 text-xs text-ink-2">{u.department}</td>
                      <td className="px-4 py-3 text-xs text-ink-2">
                        {mgr?.name || <span className="text-violet font-semibold">— none —</span>}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={u.status === 'active' ? 'approved' : 'withdrawn'} /></td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1">
                          {u.id !== s.user?.id && (
                            <>
                              <button title="Sign in as (audit-logged)" aria-label={`View as ${u.name}`}
                                onClick={() => s.impersonate(u.id)}
                                className="p-1.5 rounded-lg text-ink-3 hover:text-primary-text hover:bg-primary-soft">
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button title="Reset password" aria-label={`Reset password for ${u.name}`}
                                onClick={() => resetPassword(u)}
                                className="p-1.5 rounded-lg text-ink-3 hover:text-amber hover:bg-amber-soft">
                                <KeyRound className="w-3.5 h-3.5" />
                              </button>
                              <button title={u.status === 'active' ? 'Deactivate' : 'Reactivate'}
                                aria-label={`${u.status === 'active' ? 'Deactivate' : 'Reactivate'} ${u.name}`}
                                onClick={() => toggleActive(u)}
                                className="p-1.5 rounded-lg text-ink-3 hover:text-red hover:bg-red-soft text-xs font-bold">
                                {u.status === 'active' ? '⏻' : '↺'}
                              </button>
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* ── Registrations ── */}
      {section === 'registrations' && (
        regRequests === null ? <RowSkeleton count={3} /> : (
          <div className="space-y-3">
            {regRequests.length === 0 && (
              <EmptyState title="No registration requests" hint="When applications hit unregistered people or managers, they queue here." />
            )}
            {regRequests.map((r) => (
              <Card key={r.id} className="p-4.5 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="w-9 h-9 rounded-xl bg-violet-soft text-violet flex items-center justify-center shrink-0">
                      <UserPlus className="w-4.5 h-4.5" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-normal text-ink">
                        {r.subjectName} <span className="text-ink-3 font-medium">· {r.subjectKind} registration</span>
                      </p>
                      <p className="text-xs text-ink-2 mt-0.5 leading-relaxed">{r.note}</p>
                      <p className="text-xs text-ink-3 mt-1">
                        Requested by {r.requestedByName} · {timeAgo(r.createdAt)}
                        {r.postTitle && <> · for “{r.postTitle.slice(0, 50)}”</>}
                      </p>
                    </div>
                  </div>
                  {r.status === 'pending' ? (
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" variant="secondary" onClick={async () => {
                        await api.post(`/admin/registration-requests/${r.id}/dismiss`);
                        load();
                        s.toast('info', 'Request dismissed');
                      }}>Dismiss</Button>
                      <Button size="sm" onClick={() => openCompleteReg(r)}>Complete Setup</Button>
                    </div>
                  ) : (
                    <StatusBadge status={r.status === 'completed' ? 'approved' : 'withdrawn'} />
                  )}
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {/* ── Audit ── */}
      {section === 'audit' && (
        overview ? (
          <Card className="divide-y divide-line/60">
            {overview.auditTail.map((a: any, i: number) => (
              <div key={i} className="flex items-center gap-3 px-4.5 px-5 py-3">
                <Chip tone="primary">{a.action}</Chip>
                <span className="text-xs text-ink-2 flex-1 min-w-0 truncate">{a.subject}</span>
                <span className="text-xs text-ink-3 shrink-0">{a.actorName || 'system'} · {timeAgo(a.createdAt)}</span>
              </div>
            ))}
            {overview.auditTail.length === 0 && <EmptyState title="No audit entries" />}
          </Card>
        ) : <RowSkeleton count={5} />
      )}

      {/* Create account modal */}
      <Modal
        open={createOpen} onClose={() => setCreateOpen(false)} wide
        title="Create Account"
        subtitle="Only admins create accounts — a temporary password is generated to hand to the employee"
        footer={created ? undefined : (
          <>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={submitCreate} disabled={busy}>{busy ? 'Creating…' : 'Create & Generate Password'}</Button>
          </>
        )}
      >
        {created ? (
          <TempPasswordReveal email={created.email} password={created.password} onDone={() => setCreateOpen(false)} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full name" required>
              <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Corporate email" required>
              <TextInput type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label="Job title / role">
              <TextInput value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="QA / Test Engineer" />
            </Field>
            <Field label="System role">
              <Select value={form.systemRole} onChange={(e) => setForm({ ...form, systemRole: e.target.value })}>
                <option value="employee">employee</option>
                <option value="manager">manager</option>
                <option value="admin">admin</option>
              </Select>
            </Field>
            <Field label="Department">
              <Select
                value={form.department}
                onChange={(e) => {
                  // Changing department invalidates a manager from the old one.
                  const dept = e.target.value;
                  const stillValid = allManagers.some((m) => m.id === form.managerId && m.department === dept);
                  setForm({ ...form, department: dept, managerId: stillValid ? form.managerId : '' });
                  setAnyDeptManager(false);
                }}
              >
                {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </Select>
            </Field>
            <Field
              label="Manager"
              hint={
                deptManagers.length === 0
                  ? `No manager is registered for ${form.department} yet — showing all departments.`
                  : anyDeptManager
                    ? 'Showing managers from every department.'
                    : `Managers in ${form.department}`
              }
            >
              <Select value={form.managerId} onChange={(e) => setForm({ ...form, managerId: e.target.value })}>
                <option value="">— none yet —</option>
                {managers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}{m.department !== form.department ? ` (${m.department})` : ''}
                  </option>
                ))}
              </Select>
              {deptManagers.length > 0 && (
                <button
                  type="button"
                  onClick={() => setAnyDeptManager((v) => !v)}
                  className="mt-1.5 text-xs font-semibold text-primary-text hover:underline underline-offset-2"
                >
                  {anyDeptManager
                    ? `Only show ${form.department} managers`
                    : 'Choose a manager from another department'}
                </button>
              )}
            </Field>
            <Field label="Campus">
              <TextInput value={form.campus} onChange={(e) => setForm({ ...form, campus: e.target.value })} placeholder="Primary office or campus" />
            </Field>
            <Field label="Weekly bandwidth (hours)">
              <TextInput type="number" min={0} value={form.availableHoursWeek}
                onChange={(e) => setForm({ ...form, availableHoursWeek: e.target.value })} />
            </Field>
          </div>
        )}
      </Modal>

      {/* Complete registration modal */}
      <Modal
        open={!!completeReg} onClose={() => setCompleteReg(null)} wide
        title="Complete Registration"
        subtitle={completeReg ? `Requested by ${completeReg.requestedByName} — waiting requests route automatically once done` : ''}
        footer={created ? undefined : (
          <>
            <Button variant="secondary" onClick={() => setCompleteReg(null)}>Cancel</Button>
            <Button onClick={submitCompleteReg} disabled={busy}>{busy ? 'Creating…' : 'Register & Route Requests'}</Button>
          </>
        )}
      >
        {created ? (
          <TempPasswordReveal email={created.email} password={created.password} onDone={() => setCompleteReg(null)} />
        ) : (
          <div className="space-y-4">
            {completeReg && (
              <p className="text-xs text-ink-2 bg-surface-2 rounded-xl px-3.5 py-2.5 leading-relaxed">{completeReg.note}</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full name" required>
                <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>
              <Field label="Corporate email" required>
                <TextInput type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Field>
              <Field label="Job title / role">
                <TextInput value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
              </Field>
              <Field label="System role">
                <Select value={form.systemRole} onChange={(e) => setForm({ ...form, systemRole: e.target.value })}>
                  <option value="employee">employee</option>
                  <option value="manager">manager</option>
                </Select>
              </Field>
              <Field label="Department">
                <Select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                  {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                </Select>
              </Field>
              {completeReg?.subjectKind === 'employee' && (
                <Field label="Their manager" hint="Needed to route the waiting application">
                  <Select value={form.managerId} onChange={(e) => setForm({ ...form, managerId: e.target.value })}>
                    <option value="">— select manager —</option>
                    {managers.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.department})</option>)}
                  </Select>
                </Field>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
