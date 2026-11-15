import React from 'react';
import {
  LayoutDashboard,
  Compass,
  Sun,
  Radio,
  Mountain,
  GitCompare,
  Cpu,
  Layers,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import soundManager from '../audio/SoundManager';

export const MODULES = [
  {
    id: 'dashboard',
    number: '01',
    label: 'DASHBOARD',
    shortTitle: 'Overview',
    description: 'Mission overview & landing sites',
    icon: LayoutDashboard,
    badge: 'OVERVIEW',
  },
  {
    id: 'explorer',
    number: '02',
    label: 'SITE EXPLORER',
    shortTitle: 'Explorer',
    description: 'Detailed site inspection & DEM',
    icon: Compass,
    badge: 'LOLA 3D',
  },
  {
    id: 'solar',
    number: '03',
    label: 'SOLAR ANALYSIS',
    shortTitle: 'Solar',
    description: 'Illumination & power calculations',
    icon: Sun,
    badge: '708.7H',
  },
  {
    id: 'communication',
    number: '04',
    label: 'COMMUNICATION',
    shortTitle: 'Comms',
    description: 'Earth line-of-sight & DSN delays',
    icon: Radio,
    badge: '1.28S LOS',
  },
  {
    id: 'terrain',
    number: '05',
    label: 'TERRAIN ANALYSIS',
    shortTitle: 'Terrain',
    description: 'Slope, roughness & crater hazards',
    icon: Mountain,
    badge: 'HAZARDS',
  },
  {
    id: 'comparison',
    number: '06',
    label: 'COMPARISON ENGINE',
    shortTitle: 'Compare',
    description: '14-parameter scientific matrix',
    icon: GitCompare,
    badge: '14 METRICS',
  },
  {
    id: 'recommendation',
    number: '07',
    label: 'AI RECOMMENDATION',
    shortTitle: 'AI Ranking',
    description: 'Explainable AHP scoring & safety gates',
    icon: Cpu,
    badge: 'AHP MODEL',
  },
  {
    id: 'visualization',
    number: '08',
    label: 'INTERACTIVE 3D',
    shortTitle: 'Visualizer',
    description: 'Sandbox 3D surface & simulation',
    icon: Layers,
    badge: 'SANDBOX',
  },
];

export default function Sidebar({ activeModule, onSelectModule, isOpen, onToggleOpen }) {
  const handleSelect = (id) => {
    soundManager.playClick();
    onSelectModule(id);
  };

  return (
    <aside
      className={`fixed md:static inset-y-0 left-0 z-30 w-72 bg-slate-950/95 md:bg-slate-950/80 backdrop-blur-xl border-r border-cyan-500/20 flex flex-col transition-transform duration-300 select-none ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping-slow shadow-glow-cyan" />
          <span className="font-heading font-bold text-xs tracking-widest text-slate-200 uppercase">
            MISSION MODULES
          </span>
        </div>
        <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
          8 OF 8 ACTIVE
        </span>
      </div>

      {/* Navigation Modules List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
        {MODULES.map((mod) => {
          const Icon = mod.icon;
          const isActive = activeModule === mod.id;

          return (
            <button
              key={mod.id}
              onClick={() => handleSelect(mod.id)}
              className={`w-full text-left p-3 rounded-xl border transition-all duration-200 group relative flex items-center justify-between ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-950/80 via-blue-950/60 to-slate-900 border-cyan-400/80 shadow-[0_0_20px_rgba(0,245,212,0.25)] text-white'
                  : 'bg-slate-900/40 hover:bg-slate-900/80 border-slate-800/80 hover:border-cyan-500/40 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div
                  className={`p-2 rounded-lg border transition-all ${
                    isActive
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-glow-cyan'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 group-hover:text-cyan-400 group-hover:border-cyan-500/30'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono text-cyan-400/80 font-bold">
                      {mod.number}
                    </span>
                    <span
                      className={`text-xs font-heading font-bold tracking-wider truncate ${
                        isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'
                      }`}
                    >
                      {mod.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5 font-sans">
                    {mod.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                <span
                  className={`hidden sm:inline-block text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                    isActive
                      ? 'bg-cyan-400/20 text-cyan-200 border-cyan-400/50'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  {mod.badge}
                </span>
                <ChevronRight
                  className={`w-3.5 h-3.5 transition-transform ${
                    isActive ? 'text-cyan-400 translate-x-0.5' : 'text-slate-600 group-hover:text-slate-400'
                  }`}
                />
              </div>

              {/* Active left indicator strip */}
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-cyan-400 rounded-r shadow-glow-cyan" />
              )}
            </button>
          );
        })}
      </div>

      {/* Sidebar Footer: Telemetry & Safety Status */}
      <div className="p-3 border-t border-cyan-500/20 bg-slate-950">
        <div className="p-2.5 rounded-lg border border-cyan-500/20 bg-slate-900/60 flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300">SAFETY INTERLOCK:</span>
          </div>
          <span className="text-emerald-400 font-bold">NOMINAL</span>
        </div>
      </div>
    </aside>
  );
}
