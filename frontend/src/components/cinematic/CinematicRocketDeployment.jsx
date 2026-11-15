import React, { useEffect, useState } from 'react';
import soundManager from '../audio/SoundManager';
import { Sparkles, Zap, Radio, Sun, CheckCircle2 } from 'lucide-react';

export default function CinematicRocketDeployment({ siteName, onComplete }) {
  const [stage, setStage] = useState(1);
  // 1: Ignition & approach, 2: Fairing jettison, 3: Solar array deployment, 4: Telemetry lock & calculation

  useEffect(() => {
    // Play rocket thrust sound
    soundManager.playRocketThrust();

    const t1 = setTimeout(() => {
      setStage(2);
      soundManager.playServoDeploy();
    }, 1200);

    const t2 = setTimeout(() => {
      setStage(3);
      soundManager.playServoDeploy();
    }, 2400);

    const t3 = setTimeout(() => {
      setStage(4);
      soundManager.playCalculationComplete();
    }, 3800);

    const t4 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 4600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-[#020617]/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 overflow-hidden select-none">
      {/* Dynamic Starfield backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,44,80,0.5)_0%,rgba(2,6,23,0.95)_70%)] pointer-events-none" />
      <div className="absolute inset-0 space-grid-bg opacity-30 pointer-events-none" />

      {/* Top Telemetry Feed */}
      <div className="relative z-10 max-w-xl w-full flex items-center justify-between border-b border-cyan-500/30 pb-3 mb-6 text-xs font-mono text-cyan-400">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="tracking-widest uppercase">SOLAR BUDGET CALCULATION ENGINE</span>
        </div>
        <span className="text-amber-300">TARGET: {siteName?.toUpperCase()}</span>
      </div>

      {/* Center Cinematic Rocket Stage Container */}
      <div className="relative z-10 w-80 h-96 flex items-center justify-center">
        {/* Rocket Body */}
        <div className="relative flex flex-col items-center">
          {/* High-Gain Antenna Dish (Deploys in stage 3 & 4) */}
          <div
            className={`w-12 h-6 border-t-2 border-l-2 border-r-2 border-cyan-400 rounded-t-full mb-1 transition-all duration-700 ${
              stage >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
            }`}
          >
            <div className="w-0.5 h-4 bg-cyan-300 mx-auto" />
          </div>

          {/* Nosecone / Avionics Module */}
          <div className="w-16 h-20 bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400 clip-nosecone flex items-center justify-center relative shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            {/* Viewport Window */}
            <div className="w-4 h-4 rounded-full bg-cyan-400/90 border border-slate-700 shadow-glow-cyan" />
          </div>

          {/* Service Module & Hull */}
          <div className="w-20 h-36 bg-gradient-to-r from-slate-600 via-slate-200 to-slate-700 rounded-md relative flex items-center justify-center border-x border-cyan-500/40">
            {/* Hull thermal details */}
            <div className="absolute inset-1 border border-cyan-500/20 rounded pointer-events-none" />
            <div className="text-[9px] font-mono font-bold text-slate-800 tracking-widest -rotate-90">
              LUNAR-HLS
            </div>

            {/* LEFT SOLAR ARRAY (Deploys in stage 3 & 4) */}
            <div
              className={`absolute top-6 right-full origin-right transition-all duration-1000 flex items-center ${
                stage >= 3 ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
              }`}
            >
              <div className="w-6 h-1 bg-cyan-400" />
              <div className="w-28 h-20 rounded border border-cyan-300 bg-gradient-to-r from-cyan-900 to-blue-950 p-1 flex flex-col justify-between shadow-[0_0_25px_rgba(0,245,212,0.4)]">
                {/* Photovoltaic cell grid lines */}
                <div className="w-full h-full grid grid-cols-4 grid-rows-3 gap-0.5 bg-blue-900/60 p-0.5">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="bg-cyan-400/20 border border-cyan-400/40 rounded-sm" />
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT SOLAR ARRAY (Deploys in stage 3 & 4) */}
            <div
              className={`absolute top-6 left-full origin-left transition-all duration-1000 flex items-center ${
                stage >= 3 ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
              }`}
            >
              <div className="w-28 h-20 rounded border border-cyan-300 bg-gradient-to-r from-blue-950 to-cyan-900 p-1 flex flex-col justify-between shadow-[0_0_25px_rgba(0,245,212,0.4)]">
                <div className="w-full h-full grid grid-cols-4 grid-rows-3 gap-0.5 bg-blue-900/60 p-0.5">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="bg-cyan-400/20 border border-cyan-400/40 rounded-sm" />
                  ))}
                </div>
              </div>
              <div className="w-6 h-1 bg-cyan-400" />
            </div>
          </div>

          {/* Engine Fairing & Nozzle */}
          <div className="w-14 h-8 bg-gradient-to-r from-slate-800 to-slate-900 clip-nozzle relative flex justify-center">
            {/* Rocket Thruster Flame Plume */}
            <div className="absolute top-full w-8 h-24 bg-gradient-to-b from-amber-200 via-orange-500 to-transparent rounded-full filter blur-[2px] animate-pulse-slow" />
            <div className="absolute top-full w-4 h-16 bg-gradient-to-b from-white via-cyan-300 to-transparent rounded-full" />
          </div>
        </div>
      </div>

      {/* Live Stage Progress Indicator */}
      <div className="relative z-10 max-w-md w-full bg-slate-950/90 border border-cyan-500/40 p-4 rounded-xl shadow-glow-cyan text-xs font-mono space-y-2 mt-4 corner-brackets">
        <div className="flex items-center justify-between text-cyan-300 font-bold border-b border-cyan-500/20 pb-1.5">
          <span>COMPONENT DEPLOYMENT TELEMETRY</span>
          <span className="text-amber-400">STAGE {stage} OF 4</span>
        </div>

        <div className="space-y-1 text-[11px]">
          <div className={`flex items-center space-x-2 ${stage >= 1 ? 'text-emerald-400' : 'text-slate-500'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span>1. ATTITUDE STABILIZATION & VECTOR ACQUISITION</span>
          </div>
          <div className={`flex items-center space-x-2 ${stage >= 2 ? 'text-emerald-400' : 'text-slate-500'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span>2. PAYLOAD THERMAL SHIELD SEPARATION</span>
          </div>
          <div className={`flex items-center space-x-2 ${stage >= 3 ? 'text-emerald-400' : 'text-slate-500'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span>3. BIFACIAL ULTRA-FLEX SOLAR WINGS UNFOLDING (30m²)</span>
          </div>
          <div className={`flex items-center space-x-2 ${stage >= 4 ? 'text-cyan-300 font-bold' : 'text-slate-500'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
            <span>4. COMPUTING SYNODIC ENERGY BUDGET & SUNLIGHT HOURS</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
          <div
            className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full transition-all duration-700"
            style={{ width: `${(stage / 4) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
