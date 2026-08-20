import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Sparkles, 
  MapPin, 
  Award, 
  Clock, 
  Briefcase, 
  Send, 
  CheckCircle2, 
  Filter, 
  Star,
  ShieldCheck,
  Zap,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { TalentProfile } from '../../types';
import { DEPARTMENTS_LIST, ALL_SKILLS_TAGS } from '../../data/initialData';

interface PeopleSkillsViewProps {
  experts: TalentProfile[];
  onRequestCollaboration: (talent: TalentProfile) => void;
  currentUser: TalentProfile;
}

export const PeopleSkillsView: React.FC<PeopleSkillsViewProps> = ({
  experts = [],
  onRequestCollaboration,
  currentUser
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedSkill, setSelectedSkill] = useState('All Skills');
  const [selectedProfileModal, setSelectedProfileModal] = useState<TalentProfile | null>(null);

  const safeExperts = Array.isArray(experts) ? experts : [];

  const filteredExperts = useMemo(() => {
    return safeExperts.filter((person) => {
      if (selectedDept !== 'All Departments' && person.department !== selectedDept) {
        return false;
      }
      if (selectedSkill !== 'All Skills' && !person.primarySkills.includes(selectedSkill)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = person.name.toLowerCase().includes(q);
        const matchRole = person.role.toLowerCase().includes(q);
        const matchDept = person.department.toLowerCase().includes(q);
        const matchSkills = person.primarySkills.some(s => s.toLowerCase().includes(q));
        const matchInterests = person.interests.some(i => i.toLowerCase().includes(q));
        if (!matchName && !matchRole && !matchDept && !matchSkills && !matchInterests) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => b.contributionScore - a.contributionScore);
  }, [experts, selectedDept, selectedSkill, searchQuery]);

  return (
    <div className="w-full space-y-8 animate-in fade-in">
      
      {/* Top Banner */}
      <div className="bg-[#14171d] border border-[#21242c] rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Internal Capability Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            People & Skills Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
            Discover internal experts based on verified skills, declared availability bandwidth, and cross-department collaboration track record.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-400 shrink-0 bg-[#0f1116] p-4 rounded-2xl border border-[#21242c]">
          <div className="text-center">
            <div className="text-xl font-mono font-bold text-white">{experts.length}</div>
            <div className="text-[10px] text-slate-500">Registered Experts</div>
          </div>
          <div className="h-8 w-px bg-[#262a33]" />
          <div className="text-center">
            <div className="text-xl font-mono font-bold text-emerald-400">100%</div>
            <div className="text-[10px] text-slate-500">Verified MB Staff</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#14171d] border border-[#21242c] rounded-2xl p-4 shadow-xl space-y-3">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Main Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, skill (e.g. AWS, React, Simulink, ROS2), or role..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#21242c] bg-[#0f1116] text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Department Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#21242c] bg-[#0f1116] text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {DEPARTMENTS_LIST.map((dept) => (
                <option key={dept} value={dept} className="bg-[#14171d] text-white">
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Skill Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#21242c] bg-[#0f1116] text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {ALL_SKILLS_TAGS.map((skill) => (
                <option key={skill} value={skill} className="bg-[#14171d] text-white">
                  {skill}
                </option>
              ))}
            </select>
          </div>

        </div>

      </div>

      {/* Grid of Expert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-5">
        {filteredExperts.map((person) => (
          <div
            key={person.id}
            className="bg-[#14171d] border border-[#21242c] hover:border-indigo-500/40 rounded-2xl p-6 shadow-xl transition-all flex flex-col justify-between group space-y-4 relative"
          >
            {/* Header: Initials, Name, Role */}
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-indigo-500/30 text-indigo-400 font-bold text-base flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {person.initials}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
                      {person.name}
                    </h3>
                    <p className="text-xs text-indigo-400 font-semibold leading-tight">
                      {person.role}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate max-w-[180px] mt-0.5">
                      {person.department}
                    </p>
                  </div>
                </div>

                {/* Contribution Score Pill */}
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#0f1116] border border-[#21242c] text-xs font-mono font-bold text-amber-400 shrink-0">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{person.contributionScore}</span>
                </div>
              </div>

              {/* Bio snippet */}
              {person.bio && (
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                  {person.bio}
                </p>
              )}

              {/* Primary Skills */}
              <div className="space-y-1 mb-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                  Primary Skills
                </span>
                <div className="flex flex-wrap gap-1">
                  {person.primarySkills.slice(0, 5).map((skill) => (
                    <span
                      key={skill}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#0f1116] text-slate-300 border border-[#21242c]"
                    >
                      {skill}
                    </span>
                  ))}
                  {person.primarySkills.length > 5 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded text-slate-500">
                      +{person.primarySkills.length - 5}
                    </span>
                  )}
                </div>
              </div>

              {/* Declared Availability */}
              <div className="p-2.5 rounded-xl bg-[#0f1116] border border-[#21242c] text-xs flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Typical Bandwidth:</span>
                </span>
                <strong className="text-white">{person.typicalAvailability}</strong>
              </div>

              {/* Badges strip */}
              {person.badges.length > 0 && (
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-[#21242c]">
                  {person.badges.slice(0, 3).map((badge) => (
                    <span
                      key={badge.id}
                      title={`${badge.name} — ${badge.description}`}
                      className="px-2 py-0.5 rounded-md bg-[#0f1116] text-[10px] text-slate-300 border border-[#21242c] flex items-center gap-1 cursor-default"
                    >
                      <span>{badge.icon}</span>
                      <span className="truncate max-w-[100px]">{badge.name}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions: Full Profile & Request Collaboration */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setSelectedProfileModal(person)}
                className="py-2 px-3 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-[#1a1d26] hover:bg-[#262a33] border border-[#262a33] transition-colors cursor-pointer text-center"
              >
                View Profile
              </button>
              <button
                onClick={() => onRequestCollaboration(person)}
                className="py-2 px-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-md shadow-indigo-500/25 transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
              >
                <Send className="w-3 h-3" />
                <span>Request Help</span>
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Comprehensive Profile Modal */}
      {selectedProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-[#14171d] border border-[#21242c] rounded-3xl shadow-2xl max-w-2xl w-full my-8 p-6 sm:p-8 relative overflow-hidden text-slate-300 space-y-6">
            
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#21242c]">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 font-bold text-2xl flex items-center justify-center">
                  {selectedProfileModal.initials}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedProfileModal.name}</h2>
                  <p className="text-xs text-indigo-400 font-semibold">{selectedProfileModal.role}</p>
                  <p className="text-xs text-slate-400">{selectedProfileModal.department} · {selectedProfileModal.campus}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedProfileModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white bg-[#0f1116] border border-[#21242c]"
              >
                ✕
              </button>
            </div>

            {/* Impact Statistics */}
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-[#0f1116] border border-[#21242c]">
                <div className="text-lg font-bold text-white font-mono">{selectedProfileModal.collaborationsCount}</div>
                <div className="text-[10px] text-slate-400">Gigs Done</div>
              </div>
              <div className="p-3 rounded-2xl bg-[#0f1116] border border-[#21242c]">
                <div className="text-lg font-bold text-white font-mono">{selectedProfileModal.hoursContributed}h</div>
                <div className="text-[10px] text-slate-400">Hours Contributed</div>
              </div>
              <div className="p-3 rounded-2xl bg-[#0f1116] border border-[#21242c]">
                <div className="text-lg font-bold text-white font-mono">{selectedProfileModal.departmentsSupportedCount}</div>
                <div className="text-[10px] text-slate-400">Depts Helped</div>
              </div>
              <div className="p-3 rounded-2xl bg-[#0f1116] border border-[#21242c]">
                <div className="text-lg font-bold text-amber-400 font-mono">⭐ {selectedProfileModal.contributionScore}</div>
                <div className="text-[10px] text-slate-400">Rating</div>
              </div>
            </div>

            {/* Multidimensional Rating Profile */}
            <div className="space-y-2.5 p-4 rounded-2xl bg-[#0f1116] border border-[#21242c]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Contribution Rating Dimensions
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Helping & Empathy</span>
                    <span className="font-bold text-white">{selectedProfileModal.ratingBreakdown.helping} / 5</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#1a1d26] overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${(selectedProfileModal.ratingBreakdown.helping / 5) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Technical Quality</span>
                    <span className="font-bold text-white">{selectedProfileModal.ratingBreakdown.technicalExpertise} / 5</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#1a1d26] overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${(selectedProfileModal.ratingBreakdown.technicalExpertise / 5) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Collaboration</span>
                    <span className="font-bold text-white">{selectedProfileModal.ratingBreakdown.collaboration} / 5</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#1a1d26] overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${(selectedProfileModal.ratingBreakdown.collaboration / 5) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Reliability & Timeliness</span>
                    <span className="font-bold text-white">{selectedProfileModal.ratingBreakdown.reliability} / 5</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#1a1d26] overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${(selectedProfileModal.ratingBreakdown.reliability / 5) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Earned Enterprise Badges
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectedProfileModal.badges.map((badge) => (
                  <div key={badge.id} className="p-2.5 rounded-xl bg-[#0f1116] border border-[#21242c] flex items-start gap-2.5">
                    <span className="text-lg">{badge.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-white">{badge.name}</div>
                      <div className="text-[10px] text-slate-400">{badge.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Action */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#21242c]">
              <button
                onClick={() => setSelectedProfileModal(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const p = selectedProfileModal;
                  setSelectedProfileModal(null);
                  onRequestCollaboration(p);
                }}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/25 flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Request Collaboration / Help</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
