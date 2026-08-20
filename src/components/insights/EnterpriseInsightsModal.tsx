import React from 'react';
import { 
  TrendingUp, 
  Layers, 
  Zap, 
  Users, 
  BarChart3, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles,
  ArrowUpRight,
  PieChart,
  Building2,
  Brain,
  Server,
  Cloud,
  Cpu,
  Wrench,
  Gauge,
  ShieldCheck
} from 'lucide-react';
import { CapabilityHeatmapItem, MBI_DEPARTMENTS } from '../../types';
import { INITIAL_CAPABILITY_HEATMAP } from '../../data/initialData';

interface EnterpriseInsightsProps {
  heatmapData?: CapabilityHeatmapItem[];
}

export const EnterpriseInsightsView: React.FC<EnterpriseInsightsProps> = ({
  heatmapData = INITIAL_CAPABILITY_HEATMAP
}) => {
  const getDeptIcon = (iconName: string) => {
    switch (iconName) {
      case 'Brain': return <Brain className="w-4 h-4 text-purple-400" />;
      case 'Server': return <Server className="w-4 h-4 text-indigo-400" />;
      case 'Cloud': return <Cloud className="w-4 h-4 text-blue-400" />;
      case 'BarChart3': return <BarChart3 className="w-4 h-4 text-cyan-400" />;
      case 'Cpu': return <Cpu className="w-4 h-4 text-emerald-400" />;
      case 'Wrench': return <Wrench className="w-4 h-4 text-amber-400" />;
      case 'Layers': return <Layers className="w-4 h-4 text-rose-400" />;
      case 'CheckCircle2': return <CheckCircle2 className="w-4 h-4 text-teal-400" />;
      case 'Gauge': return <Gauge className="w-4 h-4 text-orange-400" />;
      case 'ShieldCheck': return <ShieldCheck className="w-4 h-4 text-red-400" />;
      default: return <Building2 className="w-4 h-4 text-slate-400" />;
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      
      {/* Top Banner */}
      <div className="bg-[#14171d] border border-[#21242c] rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Workforce & Capability Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Enterprise Capability & Skill Gap Heatmap
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
            Real-time organizational intelligence on cross-department skill demand vs. internal capacity supply across Mercedes-Benz.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-300">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Updated continuously from active gig telemetry</span>
        </div>
      </div>

      {/* High Level KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-[#14171d] border border-[#21242c] shadow-lg">
          <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Collaborations</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-1">1,248</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +24% this quarter
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#14171d] border border-[#21242c] shadow-lg">
          <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Hours Contributed</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-1">7,842 h</div>
          <div className="text-[11px] text-slate-400 mt-1">Peer engineering time</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#14171d] border border-[#21242c] shadow-lg">
          <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Active Depts</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-1">18 / 22</div>
          <div className="text-[11px] text-slate-400 mt-1">Cross-silo exchange</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#14171d] border border-[#21242c] shadow-lg">
          <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Active Contributors</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-1">623</div>
          <div className="text-[11px] text-slate-400 mt-1">Engineers & Leads</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#14171d] border border-[#21242c] shadow-lg col-span-2 lg:col-span-1">
          <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Average Rating</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono mt-1">⭐ 4.82</div>
          <div className="text-[11px] text-slate-400 mt-1">Based on peer reviews</div>
        </div>
      </div>

      {/* Enterprise Capability Heatmap Table (Section 24 of Blueprint) */}
      <div className="bg-[#14171d] border border-[#21242c] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#21242c]">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              Enterprise Capability Demand vs. Supply
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparison between requested departmental support and registered internal talent capacity.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-indigo-400 font-semibold">
              <span className="w-3 h-3 rounded bg-indigo-500 inline-block" />
              Demand (Open Requests)
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
              Supply (Available Experts)
            </span>
          </div>
        </div>

        {/* Heatmap Rows */}
        <div className="space-y-4">
          {heatmapData.map((item) => (
            <div
              key={item.skill}
              className="p-4 rounded-2xl bg-[#0f1116] border border-[#21242c] space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-white text-sm">{item.skill}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    item.status.includes('Gap')
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : item.status.includes('High Availability')
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                  <span>Requests: <strong className="text-indigo-400 font-bold">{item.requestsCount}</strong></span>
                  <span>·</span>
                  <span>Available Staff: <strong className="text-emerald-400 font-bold">{item.availableExpertsCount}</strong></span>
                </div>
              </div>

              {/* Demand vs Supply Visual Bars */}
              <div className="space-y-1.5 text-xs">
                {/* Demand Bar */}
                <div className="flex items-center gap-3">
                  <span className="w-16 text-slate-500 text-[10px] uppercase font-bold tracking-wider">Demand</span>
                  <div className="flex-1 h-2 rounded-full bg-[#1a1d26] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all"
                      style={{ width: `${item.demandScore}%` }}
                    />
                  </div>
                  <span className="w-10 text-right font-mono font-bold text-indigo-300">{item.demandScore}%</span>
                </div>

                {/* Supply Bar */}
                <div className="flex items-center gap-3">
                  <span className="w-16 text-slate-500 text-[10px] uppercase font-bold tracking-wider">Supply</span>
                  <div className="flex-1 h-2 rounded-full bg-[#1a1d26] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
                      style={{ width: `${item.supplyScore}%` }}
                    />
                  </div>
                  <span className="w-10 text-right font-mono font-bold text-emerald-300">{item.supplyScore}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Strategic Takeaways Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-[#14171d] border border-[#21242c] space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <ShieldAlert className="w-4 h-4" />
            <span>Identified Capability Gaps (Target for Upskilling)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            High cross-department demand for <strong>Generative AI & LLMs (+37%)</strong>, <strong>ISO 26262 ASIL D Safety</strong>, and <strong>Hardware-in-the-Loop (HiL) Testing</strong> exceeds available staff bandwidth. Recommending targeted internal bootcamps and mentoring cohorts via MBXchange guilds.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#14171d] border border-[#21242c] space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>High Reuse & External Hiring Avoided</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong>React UI Telemetry</strong>, <strong>INCA / CANape ECU Calibration</strong>, and <strong>AWS Cloud Migration</strong> cohorts fulfilled 94% of project requirements through internal micro-gigs, saving an estimated <strong>140+ contractor consulting days</strong> this quarter.
          </p>
        </div>
      </div>

      {/* Mercedes-Benz PT-TH Department Directory */}
      <div className="bg-[#14171d] border border-[#21242c] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#21242c]">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-400" />
              Mercedes-Benz PT-TH Organizational Units Directory ({MBI_DEPARTMENTS.length} Squads)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Active engineering divisions collaborating on the MBXchange talent marketplace.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MBI_DEPARTMENTS.map((dept) => (
            <div
              key={dept.code}
              className="p-5 rounded-2xl bg-[#0f1116] border border-[#21242c] hover:border-slate-700 transition-all space-y-2.5 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${dept.badgeBg} ${dept.textColor} border ${dept.borderColor} flex items-center gap-1.5`}>
                    {getDeptIcon(dept.icon)}
                    {dept.code}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    {dept.shortName}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white leading-snug">
                  {dept.name}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {dept.focus}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
