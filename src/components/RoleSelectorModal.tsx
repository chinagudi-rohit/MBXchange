import React, { useState } from 'react';
import { 
  Users, 
  CheckCircle2, 
  Sparkles, 
  MapPin, 
  Building2, 
  ShieldCheck, 
  ArrowRight,
  Star,
  Check,
  FileCheck,
  Shield,
  Layers
} from 'lucide-react';
import { UserAccount, SystemRole } from '../types';

interface RoleSelectorModalProps {
  isModal?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  currentUser: UserAccount;
  allUsers: UserAccount[];
  onSelectTalent: (talent: UserAccount) => void;
}

export const RoleSelectorModal: React.FC<RoleSelectorModalProps> = ({
  isModal = false,
  isOpen = true,
  onClose,
  currentUser,
  allUsers,
  onSelectTalent
}) => {
  const [roleCategory, setRoleCategory] = useState<'all' | SystemRole>('all');

  if (isModal && !isOpen) return null;

  const filteredUsers = allUsers.filter(u => {
    if (roleCategory === 'all') return true;
    return u.systemRole === roleCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="bg-[#14171d] border border-[#21242c] rounded-3xl shadow-2xl max-w-2xl w-full my-8 p-6 sm:p-8 relative overflow-hidden text-slate-300 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#21242c]">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Role-Based Authentication & Gateway</span>
            </div>
            <h2 className="text-xl font-bold text-white">Switch Role & User Persona</h2>
            <p className="text-xs text-slate-400">
              Select an Employee, Manager, or Admin account to test role-specific dashboards and workflows.
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-[#1a1d26] transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Role Filters */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRoleCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              roleCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-[#0c0d10] text-slate-400 hover:text-white border border-[#262a33]'
            }`}
          >
            All Roles ({allUsers.length})
          </button>
          <button
            onClick={() => setRoleCategory('employee')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              roleCategory === 'employee'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-[#0c0d10] text-slate-400 hover:text-white border border-[#262a33]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Employees ({allUsers.filter(u => u.systemRole === 'employee').length})</span>
          </button>
          <button
            onClick={() => setRoleCategory('manager')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              roleCategory === 'manager'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-[#0c0d10] text-slate-400 hover:text-white border border-[#262a33]'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Managers ({allUsers.filter(u => u.systemRole === 'manager').length})</span>
          </button>
          <button
            onClick={() => setRoleCategory('admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              roleCategory === 'admin'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-[#0c0d10] text-slate-400 hover:text-white border border-[#262a33]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrators ({allUsers.filter(u => u.systemRole === 'admin').length})</span>
          </button>
        </div>

        {/* Talent Profiles Grid */}
        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
          {filteredUsers.map((person) => {
            const isCurrent = person.id === currentUser.id;
            return (
              <div
                key={person.id}
                onClick={() => {
                  onSelectTalent(person);
                  if (onClose) onClose();
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 group ${
                  isCurrent
                    ? 'bg-indigo-500/10 border-indigo-500/40 shadow-sm'
                    : 'bg-[#0f1116] border-[#21242c] hover:border-slate-600 hover:bg-[#14171d]'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 text-indigo-400 font-bold text-sm flex items-center justify-center shrink-0 border border-indigo-500/30">
                    {person.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm group-hover:text-indigo-300 transition-colors">
                        {person.name}
                      </span>
                      
                      {person.systemRole === 'admin' && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-bold uppercase">
                          Admin
                        </span>
                      )}
                      {person.systemRole === 'manager' && (
                        <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[9px] font-bold uppercase">
                          Manager
                        </span>
                      )}
                      {person.systemRole === 'employee' && (
                        <span className="px-1.5 py-0.2 rounded bg-slate-500/20 text-slate-300 border border-slate-700 text-[9px] font-bold uppercase">
                          Employee
                        </span>
                      )}

                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" /> Logged In
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-indigo-400 font-medium">
                      {person.role} · <span className="text-slate-400">{person.department}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {person.managerName ? `Manager: ${person.managerName} · ` : ''}Campus: {person.campus}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 flex items-center gap-2">
                  <div className="px-2.5 py-1 rounded-xl bg-[#14171d] border border-[#21242c] text-xs font-mono font-bold text-amber-400">
                    ⭐ {person.contributionScore}
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#21242c]">
          <span className="text-xs text-slate-500">Active user session switches immediately upon selection.</span>
          {onClose && (
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-[#1a1d26] border border-[#262a33] cursor-pointer"
            >
              Done
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
