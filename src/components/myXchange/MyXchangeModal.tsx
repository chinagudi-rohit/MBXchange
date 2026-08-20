import React, { useState } from 'react';
import { 
  Award, 
  Star, 
  Briefcase, 
  Clock, 
  Users, 
  Layers, 
  CheckCircle2, 
  Sparkles, 
  Edit3, 
  Zap, 
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { TalentProfile } from '../../types';

interface MyXchangeProps {
  currentUser: TalentProfile;
  onUpdateAvailability: (hours: number, text: string) => void;
}

export const MyXchangeView: React.FC<MyXchangeProps> = ({
  currentUser,
  onUpdateAvailability
}) => {
  const [isEditingBandwidth, setIsEditingBandwidth] = useState(false);
  const [bandwidthHours, setBandwidthHours] = useState(currentUser.currentAvailabilityHoursThisWeek);
  const [bandwidthNotes, setBandwidthNotes] = useState(currentUser.typicalAvailability);

  const pastGigs = [
    { project: 'AWS EKS OIDC & GitHub Actions Migration', department: 'Finance Technology', hours: 8, rating: 5.0, date: 'Feb 2026', feedback: 'Exceptional Terraform modularization! Zero pipeline downtime.' },
    { project: 'Connected Telemetry Kafka Cluster Tuning', department: 'Connected Services', hours: 6, rating: 5.0, date: 'Jan 2026', feedback: 'Reduced broker latency by 45% with optimal heap configurations.' },
    { project: 'Autonomous Track LiDAR Telemetry CI/CD', department: 'Autonomous Driving', hours: 8, rating: 4.8, date: 'Dec 2025', feedback: 'Great pairing on GitHub Actions runners with GPU pass-through.' },
    { project: 'Private DNS & Cert Webhook for AKS', department: 'Battery Systems', hours: 4, rating: 5.0, date: 'Nov 2025', feedback: 'Answered our blocker and unblocked 12 engineers in 2 hours.' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      
      {/* Profile Card Header */}
      <div className="bg-[#14171d] border border-[#21242c] rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-extrabold text-3xl flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-indigo-400/30 shrink-0">
            {currentUser.initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{currentUser.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Verified Staff
              </span>
            </div>
            <p className="text-xs sm:text-sm text-indigo-400 font-semibold mt-0.5">{currentUser.role} · {currentUser.department}</p>
            <p className="text-xs text-slate-400 mt-0.5">{currentUser.campus} · {currentUser.experienceYears}+ years experience</p>
          </div>
        </div>

        {/* Contribution Score Box (Section 8 of Blueprint) */}
        <div className="p-5 rounded-2xl bg-[#0f1116] border border-[#21242c] text-center min-w-[180px]">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block">
            Contribution Score
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-mono flex items-center justify-center gap-1.5 mt-1">
            <Star className="w-7 h-7 fill-amber-400 text-amber-400" />
            <span>{currentUser.contributionScore}</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Based on 23 peer evaluations</span>
        </div>
      </div>

      {/* Impact Statistics Cards (Section 8 & 22) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#14171d] border border-[#21242c] shadow-lg text-center">
          <div className="text-3xl font-extrabold text-white font-mono">{currentUser.collaborationsCount}</div>
          <div className="text-xs text-slate-400 font-semibold mt-1">Gigs Completed</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Across 7 departments</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#14171d] border border-[#21242c] shadow-lg text-center">
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">{currentUser.hoursContributed} h</div>
          <div className="text-xs text-slate-400 font-semibold mt-1">Hours Contributed</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Approved by managers</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#14171d] border border-[#21242c] shadow-lg text-center">
          <div className="text-3xl font-extrabold text-indigo-400 font-mono">{currentUser.departmentsSupportedCount}</div>
          <div className="text-xs text-slate-400 font-semibold mt-1">Departments Supported</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Finance, AD, EV, Connected</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#14171d] border border-[#21242c] shadow-lg text-center">
          <div className="text-3xl font-extrabold text-blue-400 font-mono">{currentUser.peopleHelpedCount}</div>
          <div className="text-xs text-slate-400 font-semibold mt-1">Colleagues Helped</div>
          <div className="text-[10px] text-slate-500 mt-0.5">1-on-1 & Guild Q&A</div>
        </div>
      </div>

      {/* Declared Bandwidth Manager */}
      <div className="p-6 rounded-3xl bg-[#14171d] border border-[#21242c] shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Zap className="w-5 h-5 text-emerald-400" />
            <span>Declared Monthly Collaboration Bandwidth</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Tell the MBXchange matching engine how many hours you are available to support other squads.
          </p>
        </div>

        {isEditingBandwidth ? (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={bandwidthNotes}
              onChange={(e) => setBandwidthNotes(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#0f1116] border border-[#21242c] text-white text-xs font-medium focus:outline-none"
              placeholder="e.g. 6–8 hours/month"
            />
            <button
              onClick={() => {
                onUpdateAvailability(bandwidthHours, bandwidthNotes);
                setIsEditingBandwidth(false);
              }}
              className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500"
            >
              Save
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-xl bg-[#0f1116] border border-[#21242c] text-xs font-mono font-bold text-emerald-400">
              {currentUser.typicalAvailability}
            </span>
            <button
              onClick={() => setIsEditingBandwidth(true)}
              className="p-2 rounded-xl bg-[#1a1d26] hover:bg-[#262a33] text-slate-300 hover:text-white border border-[#262a33]"
              title="Edit Availability"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Badges and Reputation Dimensions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Badges */}
        <div className="p-6 rounded-3xl bg-[#14171d] border border-[#21242c] shadow-xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-400" />
            Your Reputation Badges ({currentUser.badges.length})
          </h3>
          <div className="space-y-3">
            {currentUser.badges.map((badge) => (
              <div key={badge.id} className="p-3.5 rounded-2xl bg-[#0f1116] border border-[#21242c] flex items-center gap-3.5">
                <span className="text-2xl">{badge.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{badge.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{badge.dateEarned}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contribution Score Breakdown */}
        <div className="p-6 rounded-3xl bg-[#14171d] border border-[#21242c] shadow-xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" />
            Multi-Dimensional Feedback Profile
          </h3>
          
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1 font-semibold">
                <span>Helping & Mentorship</span>
                <span className="text-indigo-400 font-mono">4.8 / 5.0</span>
              </div>
              <div className="h-2 rounded-full bg-[#0f1116] overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '96%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1 font-semibold">
                <span>Technical Expertise</span>
                <span className="text-indigo-400 font-mono">4.9 / 5.0</span>
              </div>
              <div className="h-2 rounded-full bg-[#0f1116] overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '98%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1 font-semibold">
                <span>Cross-Team Collaboration</span>
                <span className="text-indigo-400 font-mono">4.7 / 5.0</span>
              </div>
              <div className="h-2 rounded-full bg-[#0f1116] overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '94%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1 font-semibold">
                <span>Reliability & Timeliness</span>
                <span className="text-indigo-400 font-mono">4.9 / 5.0</span>
              </div>
              <div className="h-2 rounded-full bg-[#0f1116] overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '98%' }} />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Recent Completed Collaborations & Feedback Log */}
      <div className="p-6 rounded-3xl bg-[#14171d] border border-[#21242c] shadow-xl space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-indigo-400" />
          Recent Micro-Gigs & Peer Reviews
        </h3>

        <div className="space-y-3">
          {pastGigs.map((gig, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-[#0f1116] border border-[#21242c] space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                <div>
                  <span className="font-bold text-white text-sm">{gig.project}</span>
                  <span className="text-slate-400 block text-[11px] mt-0.5">{gig.department} · {gig.hours} hours contributed ({gig.date})</span>
                </div>
                <div className="flex items-center gap-1 font-mono font-bold text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{gig.rating.toFixed(1)} / 5.0</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 italic bg-[#14171d] p-2.5 rounded-xl border border-[#21242c]">
                "{gig.feedback}"
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
