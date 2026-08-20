import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Network, 
  Briefcase, 
  TrendingUp, 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  ChevronRight, 
  ChevronDown, 
  Building2, 
  MapPin, 
  Shield, 
  Key, 
  Clock, 
  BarChart3, 
  RefreshCw, 
  Sparkles, 
  Check, 
  AlertCircle,
  FileCheck,
  Award,
  Layers,
  MessageSquare
} from 'lucide-react';
import { 
  UserAccount, 
  SystemRole, 
  CollaborationRequest, 
  WorkPost, 
  ManagerApprovalItem, 
  MBI_DEPARTMENTS 
} from '../../types';

interface AdminDashboardProps {
  currentUser: UserAccount;
  users: UserAccount[];
  onUpdateUsers: (updated: UserAccount[]) => void;
  onSelectUserForSession: (user: UserAccount) => void;
  collabRequests: CollaborationRequest[];
  workPosts: WorkPost[];
  managerApprovals: ManagerApprovalItem[];
  onOpenCreateUser?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  users,
  onUpdateUsers,
  onSelectUserForSession,
  collabRequests,
  workPosts,
  managerApprovals
}) => {
  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'users' | 'org_tree' | 'collaborations' | 'audit_logs'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState<'all' | SystemRole>('all');
  
  // User Edit / Add Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formSystemRole, setFormSystemRole] = useState<SystemRole>('employee');
  const [formDepartment, setFormDepartment] = useState('PT-THIS');
  const [formCampus, setFormCampus] = useState('MBRDI Bengaluru Hub');
  const [formManagerId, setFormManagerId] = useState('');
  const [formSkills, setFormSkills] = useState('');
  const [formBio, setFormBio] = useState('');

  const managersList = useMemo(() => {
    return users.filter(u => u.systemRole === 'manager' || u.systemRole === 'admin');
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.department.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDept = departmentFilter === 'All' || user.department === departmentFilter;
      const matchesRole = roleFilter === 'all' || user.systemRole === roleFilter;

      return matchesSearch && matchesDept && matchesRole;
    });
  }, [users, searchQuery, departmentFilter, roleFilter]);

  const totalEmployees = users.filter(u => u.systemRole === 'employee').length;
  const totalManagers = users.filter(u => u.systemRole === 'manager').length;
  const totalAdmins = users.filter(u => u.systemRole === 'admin').length;
  const activeCollabCount = collabRequests.filter(r => r.status === 'accepted').length;

  const handleOpenEdit = (user: UserAccount) => {
    setEditingUser(user);
    setIsNewUser(false);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormSystemRole(user.systemRole);
    setFormDepartment(user.department);
    setFormCampus(user.campus || 'MBRDI Bengaluru Hub');
    setFormManagerId(user.managerId || '');
    setFormSkills(user.primarySkills.join(', '));
    setFormBio(user.bio || '');
    setIsEditModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setIsNewUser(true);
    setFormName('');
    setFormEmail('');
    setFormRole('Software Engineer');
    setFormSystemRole('employee');
    setFormDepartment('PT-THIS');
    setFormCampus('MBRDI Bengaluru Hub');
    setFormManagerId(managersList[0]?.id || '');
    setFormSkills('Python, AWS, CI/CD');
    setFormBio('Engineering squad member passionate about high-quality automotive software delivery.');
    setIsEditModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;

    const managerObj = users.find(u => u.id === formManagerId);
    const initials = (formName || 'User')
      .split(' ')
      .filter(Boolean)
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'MB';

    const skillsArray = formSkills
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    if (isNewUser) {
      const newUserId = `usr_${Date.now().toString(36)}`;
      const newUser: UserAccount = {
        id: newUserId,
        name: formName.trim(),
        email: formEmail.trim(),
        role: formRole.trim() || 'Software Engineer',
        systemRole: formSystemRole,
        status: 'active',
        department: formDepartment,
        campus: formCampus,
        initials: initials || 'MB',
        experienceYears: 4,
        primarySkills: skillsArray.length ? skillsArray : ['Automotive Tech', 'Collaboration'],
        interests: ['Cross-Department Innovation', 'Continuous Learning'],
        availableFor: ['Short Gigs', 'Code Reviews', 'Peer Support'],
        typicalAvailability: '4–6 hours/month',
        currentAvailabilityHoursThisWeek: 4,
        contributionScore: 4.80,
        ratingBreakdown: { helping: 4.8, technicalExpertise: 4.8, collaboration: 4.8, reliability: 4.8 },
        badges: [
          { id: `b_${Date.now()}`, name: 'New Contributor', icon: '🚀', description: 'Joined the MBXchange platform', dateEarned: 'Today' }
        ],
        collaborationsCount: 0,
        departmentsSupportedCount: 0,
        peopleHelpedCount: 0,
        hoursContributed: 0,
        bio: formBio,
        managerId: formManagerId || undefined,
        managerName: managerObj?.name || undefined
      };

      const updated = [newUser, ...users];
      onUpdateUsers(updated);
    } else if (editingUser) {
      const updated = users.map(u => {
        if (u.id === editingUser.id) {
          return {
            ...u,
            name: formName.trim(),
            email: formEmail.trim(),
            role: formRole.trim(),
            systemRole: formSystemRole,
            department: formDepartment,
            campus: formCampus,
            managerId: formManagerId || undefined,
            managerName: managerObj?.name || undefined,
            primarySkills: skillsArray.length ? skillsArray : u.primarySkills,
            bio: formBio
          };
        }
        return u;
      });
      onUpdateUsers(updated);
    }

    setIsEditModalOpen(false);
  };

  const handleToggleStatus = (userId: string) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          status: u.status === 'active' ? 'inactive' : 'active'
        } as UserAccount;
      }
      return u;
    });
    onUpdateUsers(updated);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#14171d] via-[#1a1e27] to-[#14171d] border border-amber-500/20 p-6 md:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Platform Administration & Governance</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Enterprise Role & Hierarchy Governance
            </h1>
            <p className="text-xs md:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Manage system permissions, organization reporting lines, cross-department skill sharing, and user accounts across all 10 Mercedes-Benz powertrain & digital departments.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#0c0d10]/80 border border-[#21242c] text-center">
              <span className="text-[11px] font-medium text-slate-400 block">Total Users</span>
              <span className="text-xl font-black text-white font-mono">{users.length}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#0c0d10]/80 border border-[#21242c] text-center">
              <span className="text-[11px] font-medium text-indigo-400 block">Employees</span>
              <span className="text-xl font-black text-indigo-300 font-mono">{totalEmployees}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#0c0d10]/80 border border-[#21242c] text-center">
              <span className="text-[11px] font-medium text-purple-400 block">Managers</span>
              <span className="text-xl font-black text-purple-300 font-mono">{totalManagers}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#0c0d10]/80 border border-[#21242c] text-center">
              <span className="text-[11px] font-medium text-amber-400 block">Admins</span>
              <span className="text-xl font-black text-amber-300 font-mono">{totalAdmins}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-[#21242c] pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveAdminSubTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeAdminSubTab === 'users'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
              : 'text-slate-400 hover:text-white hover:bg-[#14171d]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Accounts & Roles ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminSubTab('org_tree')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeAdminSubTab === 'org_tree'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
              : 'text-slate-400 hover:text-white hover:bg-[#14171d]'
          }`}
        >
          <Network className="w-4 h-4" />
          <span>Reporting Line Hierarchy</span>
        </button>

        <button
          onClick={() => setActiveAdminSubTab('collaborations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeAdminSubTab === 'collaborations'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
              : 'text-slate-400 hover:text-white hover:bg-[#14171d]'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Mobility & Exchange Logs ({collabRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminSubTab('audit_logs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeAdminSubTab === 'audit_logs'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
              : 'text-slate-400 hover:text-white hover:bg-[#14171d]'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>System Audit & Health</span>
        </button>
      </div>

      {/* SUBTAB 1: USER ACCOUNTS & ROLES */}
      {activeAdminSubTab === 'users' && (
        <div className="space-y-4">
          
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#14171d] p-4 rounded-2xl border border-[#21242c]">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by name, email, or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0c0d10] border border-[#262a33] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              {/* Department Filter */}
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#0c0d10] border border-[#262a33] text-xs text-slate-300 focus:outline-none"
              >
                <option value="All">All Departments</option>
                {MBI_DEPARTMENTS.map(d => (
                  <option key={d.code} value={d.code}>{d.code} - {d.focus.substring(0, 30)}...</option>
                ))}
              </select>

              {/* System Role Filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-[#0c0d10] border border-[#262a33] text-xs text-slate-300 focus:outline-none"
              >
                <option value="all">All System Roles</option>
                <option value="employee">Employees Only</option>
                <option value="manager">Managers Only</option>
                <option value="admin">Administrators Only</option>
              </select>
            </div>

            <button
              onClick={handleOpenAdd}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Provision User Account</span>
            </button>
          </div>

          {/* Users Table */}
          <div className="bg-[#14171d] rounded-2xl border border-[#21242c] overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0c0d10] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#21242c]">
                  <tr>
                    <th className="py-3 px-4">User & Identity</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">System Role</th>
                    <th className="py-3 px-4">Reports To (Manager)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Contribution</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#21242c]">
                  {filteredUsers.map((user) => {
                    const isCurrentUser = user.id === currentUser.id;
                    return (
                      <tr key={user.id} className="hover:bg-[#1a1e27] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                              {user.initials}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-sm">{user.name}</span>
                                {isCurrentUser && (
                                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 text-[9px] font-bold border border-amber-500/30">
                                    Current
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400">{user.email}</span>
                              <div className="text-[10px] text-indigo-400 font-medium">{user.role}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-lg bg-[#0c0d10] border border-[#262a33] text-indigo-300 font-mono font-bold">
                            {user.department}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          {user.systemRole === 'admin' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              <ShieldCheck className="w-3 h-3" /> Admin
                            </span>
                          )}
                          {user.systemRole === 'manager' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                              <FileCheck className="w-3 h-3" /> Manager
                            </span>
                          )}
                          {user.systemRole === 'employee' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-500/10 text-slate-300 border border-slate-700">
                              <Users className="w-3 h-3" /> Employee
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          {user.managerName ? (
                            <span className="text-slate-300 font-medium">
                              {user.managerName}
                            </span>
                          ) : (
                            <span className="text-slate-600 italic">None (Root / Executive)</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleToggleStatus(user.id)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                              user.status === 'active'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20'
                            }`}
                          >
                            ● {user.status === 'active' ? 'Active' : 'Inactive'}
                          </button>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="text-amber-400 font-bold font-mono">⭐ {user.contributionScore}</span>
                            <span className="text-[10px] text-slate-500">({user.collaborationsCount} gigs)</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEdit(user)}
                              className="p-1.5 rounded-lg bg-[#0c0d10] hover:bg-[#1f232d] border border-[#262a33] text-slate-400 hover:text-white transition-colors"
                              title="Edit user details & permissions"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onSelectUserForSession(user)}
                              className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold transition-colors cursor-pointer"
                              title="Switch active session into this user"
                            >
                              Impersonate
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: REPORTING LINE HIERARCHY */}
      {activeAdminSubTab === 'org_tree' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-[#14171d] border border-[#21242c]">
            <h3 className="text-sm font-bold text-white mb-1">Organizational Hierarchy & Reporting Structure</h3>
            <p className="text-xs text-slate-400">
              Visualize reporting lines across Mercedes-Benz powertrain and digital engineering squads. Approvals for cross-department mobility are automatically routed along these managerial pathways.
            </p>
          </div>

          {/* Root Executive & Admin Level */}
          <div className="space-y-6">
            <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-[#14171d] to-[#14171d] border border-amber-500/30 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold text-base flex items-center justify-center">
                  MB
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-extrabold uppercase mb-1">
                    <ShieldCheck className="w-3 h-3" /> Platform Head & System Administrator
                  </div>
                  <h4 className="text-base font-bold text-white">Dr. Markus Becker</h4>
                  <p className="text-xs text-slate-400">Head of Enterprise Platform · PT-THIT · Stuttgart & Bengaluru</p>
                </div>
              </div>
            </div>

            {/* Managers & Direct Reports Tree */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {managersList.filter(m => m.systemRole === 'manager').map((mgr) => {
                const directReports = users.filter(u => u.managerId === mgr.id);
                return (
                  <div key={mgr.id} className="rounded-3xl bg-[#14171d] border border-[#21242c] p-5 space-y-4 shadow-xl flex flex-col justify-between">
                    <div>
                      {/* Manager Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-[#21242c]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 font-bold text-sm flex items-center justify-center">
                            {mgr.initials}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">{mgr.name}</div>
                            <div className="text-[11px] text-purple-400 font-medium">{mgr.role}</div>
                            <div className="text-[10px] text-slate-400">{mgr.department} · {mgr.campus}</div>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                          {directReports.length} Reports
                        </span>
                      </div>

                      {/* Direct Reports List */}
                      <div className="mt-4 space-y-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Squad Members & Direct Reports
                        </div>
                        {directReports.map((report) => (
                          <div
                            key={report.id}
                            className="p-2.5 rounded-xl bg-[#0c0d10] border border-[#21242c] flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center shrink-0">
                                {report.initials}
                              </div>
                              <div>
                                <div className="text-xs font-bold text-white">{report.name}</div>
                                <div className="text-[10px] text-slate-400">{report.role} · {report.department}</div>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-[10px] font-mono text-emerald-400 block font-bold">
                                {report.currentAvailabilityHoursThisWeek}h free
                              </span>
                              <span className="text-[9px] text-slate-500">⭐ {report.contributionScore}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenEdit(mgr)}
                      className="w-full py-2 rounded-xl bg-[#1a1e27] hover:bg-[#222733] border border-[#262a33] text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                    >
                      Configure Team & Reporting Line
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: MOBILITY & EXCHANGE LOGS */}
      {activeAdminSubTab === 'collaborations' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#14171d] border border-[#21242c] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white mb-0.5">Cross-Department Engineering Exchanges</h3>
              <p className="text-xs text-slate-400">
                Audited real-time log of collaboration requests and work posts between powertrain departments.
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono">
              {activeCollabCount} Active Engagements
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {collabRequests.map((req) => (
              <div key={req.id} className="p-5 rounded-2xl bg-[#14171d] border border-[#21242c] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-indigo-400">{req.dates} · {req.estimatedHours}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    req.status === 'accepted'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : req.status === 'pending'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {(req.status || 'pending').toUpperCase()}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white">{req.taskTitle}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{req.notes}</p>

                <div className="pt-2 border-t border-[#21242c] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Requester:</span>
                    <span className="font-bold text-white">{req.requesterName} ({req.requesterDepartment})</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Target:</span>
                    <span className="font-bold text-indigo-300">{req.targetTalentName} ({req.targetDepartment})</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 4: AUDIT LOGS & HEALTH */}
      {activeAdminSubTab === 'audit_logs' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-[#14171d] border border-[#21242c] space-y-4">
            <h3 className="text-base font-bold text-white">Platform Health & Telemetry</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[#0c0d10] border border-[#21242c]">
                <span className="text-xs text-slate-400 block mb-1">Runtime Persistence State</span>
                <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> LocalStorage Synced
                </span>
                <p className="text-[11px] text-slate-500 mt-1">Users, messages, bookmarks, and requests actively persisted.</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0c0d10] border border-[#21242c]">
                <span className="text-xs text-slate-400 block mb-1">Security & Access Policy</span>
                <span className="text-sm font-bold text-indigo-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> RBAC Enforced
                </span>
                <p className="text-[11px] text-slate-500 mt-1">Separate dashboards for Employee, Manager, and Admin.</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0c0d10] border border-[#21242c]">
                <span className="text-xs text-slate-400 block mb-1">Connected Departments</span>
                <span className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" /> 10 / 10 Squads Active
                </span>
                <p className="text-[11px] text-slate-500 mt-1">PT-THIA through PT-THIF mapped and online.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* USER EDIT / CREATE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-[#14171d] border border-[#21242c] rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-8 relative overflow-hidden text-slate-300 space-y-6 my-8">
            
            <div className="flex items-center justify-between pb-4 border-b border-[#21242c]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {isNewUser ? 'Provision New User Account' : `Edit Account: ${formName}`}
                  </h3>
                  <p className="text-xs text-slate-400">Configure role permissions and reporting hierarchy</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-500 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0c0d10] border border-[#262a33] text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Corporate Email</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0c0d10] border border-[#262a33] text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Professional Role / Job Title</label>
                  <input
                    type="text"
                    required
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0c0d10] border border-[#262a33] text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">System Access Level</label>
                  <select
                    value={formSystemRole}
                    onChange={(e) => setFormSystemRole(e.target.value as SystemRole)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0c0d10] border border-[#262a33] text-xs text-amber-300 font-bold focus:outline-none"
                  >
                    <option value="employee">Employee (Standard Access)</option>
                    <option value="manager">Manager (Approval & Team Access)</option>
                    <option value="admin">Administrator (Full System Control)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Department</label>
                  <select
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0c0d10] border border-[#262a33] text-xs text-white focus:outline-none"
                  >
                    {MBI_DEPARTMENTS.map(d => (
                      <option key={d.code} value={d.code}>{d.code}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Reporting Line (Manager)</label>
                  <select
                    value={formManagerId}
                    onChange={(e) => setFormManagerId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0c0d10] border border-[#262a33] text-xs text-white focus:outline-none"
                  >
                    <option value="">None / Self-governing</option>
                    {managersList.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Primary Skills (comma-separated)</label>
                <input
                  type="text"
                  value={formSkills}
                  onChange={(e) => setFormSkills(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0c0d10] border border-[#262a33] text-xs text-white focus:outline-none"
                  placeholder="e.g. AWS, Kubernetes, Python, AUTOSAR"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Bio / Profile Description</label>
                <textarea
                  rows={3}
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0c0d10] border border-[#262a33] text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#21242c]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#0c0d10] hover:bg-[#1f232d] text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md"
                >
                  {isNewUser ? 'Create Account' : 'Save Changes'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
