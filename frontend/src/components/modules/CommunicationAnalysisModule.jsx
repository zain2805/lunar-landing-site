import React, { useState } from 'react';
import { CANDIDATE_SITES, LUNAR_CONSTANTS } from '../../data/lunarSitesData';
import {
  calculateEarthVisibility,
  calculateSignalDelay,
} from '../../data/scientificCalculations';
import {
  Radio,
  Wifi,
  WifiOff,
  Clock,
  Layers,
  Globe,
  Satellite,
  Activity,
  Sliders,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import soundManager from '../audio/SoundManager';

export default function CommunicationAnalysisModule() {
  const [selectedSiteId, setSelectedSiteId] = useState('site-beta');
  const [librationProgress, setLibrationProgress] = useState(0.4);
  const [customDistanceKm, setCustomDistanceKm] = useState(384400);

  const site = CANDIDATE_SITES.find(s => s.id === selectedSiteId) || CANDIDATE_SITES[0];

  // Dynamic libration calculations
  const libLat = Math.sin(librationProgress * Math.PI * 2) * LUNAR_CONSTANTS.MAX_LIBRATION_LAT_DEG;
  const libLon = Math.cos(librationProgress * Math.PI * 2) * LUNAR_CONSTANTS.MAX_LIBRATION_LON_DEG;
  const earthGeom = calculateEarthVisibility(site.coordinates.latitude, site.coordinates.longitude, libLat, libLon);
  const signalDelays = calculateSignalDelay(customDistanceKm);

  const handleSelectSite = (id) => {
    soundManager.playClick();
    setSelectedSiteId(id);
  };

  return (
    <div className="space-y-6">
      {/* Title & Site Selector for all 5 sites */}
      <div className="hud-panel p-5 rounded-2xl border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
            <Radio className="w-4 h-4 text-cyan-400" />
            <span className="tracking-widest uppercase">MODULE 04 • EARTH LINE-OF-SIGHT & TELECOMMUNICATIONS</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white tracking-wide">
            EARTH COMMUNICATION & DSN ANALYSIS
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1 font-sans">
            Evaluates direct line-of-sight (LOS) to Earth, lunar libration oscillations, radio signal propagation latency, and Deep Space Network (DSN) ground tracking coverage.
          </p>
        </div>

        {/* Site Switcher */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
          {CANDIDATE_SITES.map(s => {
            const isSelected = s.id === selectedSiteId;
            return (
              <button
                key={s.id}
                onClick={() => handleSelectSite(s.id)}
                className={`px-3 py-2 rounded-xl border text-xs font-mono transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-glow-cyan'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:text-white hover:border-cyan-500/40'
                }`}
              >
                {s.shortName}
              </button>
            );
          })}
        </div>
      </div>

      {/* 8 Required Scientific Calculation Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Earth Elevation Angle */}
        <div className="p-4 rounded-xl hud-panel border-cyan-500/20">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">1. EARTH ELEVATION (α⊕)</span>
          <span className="text-xl sm:text-2xl font-bold font-heading text-cyan-300">
            {earthGeom.earthElevationDeg > 0 ? `+${earthGeom.earthElevationDeg}°` : `${earthGeom.earthElevationDeg}°`}
          </span>
          <span className="text-[11px] font-mono text-slate-400 block mt-1">Above local terrain horizon</span>
        </div>

        {/* 2. Earth Visibility */}
        <div className="p-4 rounded-xl hud-panel border-cyan-500/20">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">2. DIRECT LOS STATUS</span>
          <span className={`text-xl sm:text-2xl font-bold font-heading ${earthGeom.isDirectLOS ? 'text-emerald-400' : 'text-red-400'}`}>
            {earthGeom.isDirectLOS ? 'DIRECT LINK ACTIVE' : 'OCCULTED / BLOCKED'}
          </span>
          <span className="text-[11px] font-mono text-slate-400 block mt-1">
            {earthGeom.isDirectLOS ? 'Unobstructed line-of-sight' : 'Terrain masking detected'}
          </span>
        </div>

        {/* 3. Availability Percentage */}
        <div className="p-4 rounded-xl hud-panel border-cyan-500/20">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">3. TOTAL AVAILABILITY (%)</span>
          <span className="text-xl sm:text-2xl font-bold font-heading text-white">
            {site.communication.earthVisibilityPct}%
          </span>
          <span className="text-[11px] font-mono text-cyan-400 block mt-1">Annual uninterrupted link</span>
        </div>

        {/* 4. Longest Blackout Period */}
        <div className="p-4 rounded-xl hud-panel border-cyan-500/20">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">4. LONGEST BLACKOUT</span>
          <span className="text-xl sm:text-2xl font-bold font-heading text-amber-300">
            {site.communication.longestBlackoutHours} hrs
          </span>
          <span className="text-[11px] font-mono text-slate-400 block mt-1">During southern libration dip</span>
        </div>

        {/* 5. One-Way Propagation Delay */}
        <div className="p-4 rounded-xl hud-panel border-cyan-500/20">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">5. 1-WAY LIGHT TIME</span>
          <span className="text-xl sm:text-2xl font-bold font-heading text-cyan-300">
            {signalDelays.oneWaySec} s ({signalDelays.oneWayMs} ms)
          </span>
          <span className="text-[11px] font-mono text-slate-400 block mt-1">c = 299,792.458 km/s</span>
        </div>

        {/* 6. Round-Trip Propagation Delay */}
        <div className="p-4 rounded-xl hud-panel border-cyan-500/20">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">6. ROUND-TRIP PING (RTT)</span>
          <span className="text-xl sm:text-2xl font-bold font-heading text-purple-300">
            {signalDelays.roundTripSec} s ({signalDelays.roundTripMs} ms)
          </span>
          <span className="text-[11px] font-mono text-slate-400 block mt-1">2x Earth-Moon distance</span>
        </div>

        {/* 7. Libration Oscillation */}
        <div className="p-4 rounded-xl hud-panel border-cyan-500/20">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">7. OPTICAL LIBRATION</span>
          <span className="text-xl sm:text-2xl font-bold font-heading text-white">
            Lat: {libLat.toFixed(1)}° | Lon: {libLon.toFixed(1)}°
          </span>
          <span className="text-[11px] font-mono text-slate-400 block mt-1">27.3-day sidereal cycle</span>
        </div>

        {/* 8. Bandwidth Capacity */}
        <div className="p-4 rounded-xl hud-panel border-cyan-500/20">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">KA-BAND BANDWIDTH</span>
          <span className="text-xl sm:text-2xl font-bold font-heading text-emerald-400">
            {site.communication.bandwidthCapabilityMbps} Mbps
          </span>
          <span className="text-[11px] font-mono text-slate-400 block mt-1">To 70m DSN dish</span>
        </div>
      </div>

      {/* CINEMATIC VISUALIZATIONS: Earth-Moon Direct Line-of-Sight Diagram + Communication Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cinematic Earth-Moon Link Diagram (6 cols) */}
        <div className="lg:col-span-6 hud-panel p-5 rounded-2xl border-cyan-500/30 flex flex-col justify-between">
          <div className="border-b border-cyan-500/20 pb-3 mb-4">
            <h3 className="text-sm font-heading font-bold text-white tracking-wider flex items-center space-x-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              <span>CINEMATIC EARTH-MOON LINE-OF-SIGHT GEOMETRY</span>
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Simulated radio carrier path between South Pole lander and Earth Deep Space Network ground antennas.
            </p>
          </div>

          {/* Visual Link Scene */}
          <div className="h-56 rounded-xl bg-slate-950/90 border border-slate-800 relative overflow-hidden flex items-center justify-between px-8">
            <div className="absolute inset-0 space-grid-bg opacity-20 pointer-events-none" />

            {/* Earth Orb */}
            <div className="relative flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-700 via-sky-400 to-emerald-400 shadow-[0_0_35px_rgba(56,189,248,0.5)] border border-cyan-300 relative overflow-hidden flex items-center justify-center">
                <span className="text-[10px] font-heading font-extrabold text-slate-950">EARTH</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-300 mt-2 font-bold">DSN 70m STATIONS</span>
            </div>

            {/* Pulsing Signal Wave */}
            <div className="flex-1 px-4 relative flex items-center justify-center">
              <div className="w-full h-0.5 bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 shadow-glow-cyan relative">
                {/* Moving Signal Packet */}
                <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-glow-cyan animate-pulse-slow left-1/2 -translate-x-1/2" />
              </div>
              <div className="absolute text-[10px] font-mono text-cyan-300 top-3 bg-slate-950/90 px-2 py-0.5 rounded border border-cyan-500/30">
                1-WAY DELAY: {signalDelays.oneWaySec} s
              </div>
            </div>

            {/* Moon South Pole Orb */}
            <div className="relative flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-slate-700 via-slate-400 to-slate-200 shadow-[0_0_25px_rgba(255,255,255,0.3)] border border-slate-400 relative overflow-hidden flex items-center justify-center">
                <span className="text-[9px] font-heading font-extrabold text-slate-950">MOON</span>
              </div>
              <span className="text-[10px] font-mono text-amber-300 mt-2 font-bold">{site.shortName}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-3 pt-2 border-t border-slate-800">
            <span>LINK DISTANCE: {customDistanceKm.toLocaleString()} km</span>
            <span className={earthGeom.isDirectLOS ? 'text-emerald-400' : 'text-red-400'}>
              LOS STATUS: {earthGeom.isDirectLOS ? 'DIRECT LINK MAINTAINED' : 'OCCULTED BY MOUNTAIN HORIZON'}
            </span>
          </div>
        </div>

        {/* Communication Windows & Blackouts Timeline (6 cols) */}
        <div className="lg:col-span-6 hud-panel p-5 rounded-2xl border-cyan-500/30 flex flex-col justify-between">
          <div className="border-b border-cyan-500/20 pb-3 mb-4">
            <h3 className="text-sm font-heading font-bold text-white tracking-wider flex items-center space-x-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>COMMUNICATION WINDOWS & BLACKOUT TIMELINE</span>
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Calculates line-of-sight availability windows vs libration-induced blackout periods across the synodic month.
            </p>
          </div>

          {/* Timeline Bar Track */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1.5">
                <span>SYNODIC COMMUNICATION WINDOW PROFILE:</span>
                <span className="text-emerald-400 font-bold">{site.communication.earthVisibilityPct}% AVAILABILITY</span>
              </div>

              {/* Segmented Timeline */}
              <div className="w-full h-8 rounded-lg bg-slate-950 border border-slate-800 p-1 flex gap-1">
                {/* 10 Visual time segments reflecting site's actual availability */}
                {Array.from({ length: 10 }).map((_, i) => {
                  const isBlocked = (i === 4 || i === 5) && site.communication.earthVisibilityPct < 85;
                  return (
                    <div
                      key={i}
                      className={`flex-1 rounded-sm flex items-center justify-center text-[9px] font-mono font-bold transition-all ${
                        isBlocked
                          ? 'bg-amber-950/80 border border-amber-500/40 text-amber-300'
                          : 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
                      }`}
                      title={isBlocked ? 'Libration Blackout Window' : 'Direct Line-of-Sight Window'}
                    >
                      {isBlocked ? 'DIP' : 'LOS'}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>DAY 0 (ORBIT ENTRY)</span>
                <span>DAY 14 (MID-CYCLE DIP)</span>
                <span>DAY 29.5 (CYCLE RESET)</span>
              </div>
            </div>

            {/* Summary statistics */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-2">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">COMMUNICATION WINDOW</span>
                <span className="text-lg font-bold text-emerald-400">
                  {((site.communication.earthVisibilityPct / 100) * LUNAR_CONSTANTS.SYNODIC_MONTH_HOURS).toFixed(1)} hrs
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Continuous direct contact</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">MAX BLACKOUT PERIOD</span>
                <span className="text-lg font-bold text-amber-400">
                  {site.communication.longestBlackoutHours} hrs
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Maximum occultation span</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-3 pt-2 border-t border-slate-800">
            <span>RELAY DEPENDENCY: {site.communication.occultationRisk}</span>
          </div>
        </div>
      </div>

      {/* Polar Azimuth-Elevation Radar Skyplot + DSN Network Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Skyplot (7 cols) */}
        <div className="lg:col-span-7 hud-panel p-5 rounded-2xl border-cyan-500/30">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-heading font-bold text-white tracking-wider">
                EARTH SKYPLOT • HORIZON ELEVATION MASK ({site.shortName.toUpperCase()})
              </h3>
            </div>
            <span className="text-xs font-mono text-cyan-300">
              POLAR RADAR PROJECTION
            </span>
          </div>

          {/* SVG Radar Polar Skyplot */}
          <div className="h-72 w-full flex items-center justify-center relative">
            <svg className="w-64 h-64 overflow-visible" viewBox="0 0 300 300">
              <circle cx="150" cy="150" r="130" fill="none" stroke="#1e293b" strokeWidth="2" />
              <circle cx="150" cy="150" r="90" fill="none" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="3 3" />
              <circle cx="150" cy="150" r="45" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />

              <line x1="20" y1="150" x2="280" y2="150" stroke="#1e293b" strokeWidth="1" />
              <line x1="150" y1="20" x2="150" y2="280" stroke="#1e293b" strokeWidth="1" />

              <text x="154" y="25" fill="#64748b" fontSize="9" fontFamily="JetBrains Mono">+10° (High)</text>
              <text x="154" y="65" fill="#64748b" fontSize="9" fontFamily="JetBrains Mono">+5°</text>
              <text x="154" y="108" fill="#64748b" fontSize="9" fontFamily="JetBrains Mono">0° (Horizon)</text>
              <text x="154" y="145" fill="#64748b" fontSize="9" fontFamily="JetBrains Mono">Zenith</text>

              <line x1="150" y1="150" x2="270" y2="150" stroke="#00f5d4" strokeWidth="1.5" opacity="0.4" className="animate-radar-sweep origin-center" />

              {/* Earth position marker */}
              {(() => {
                const elev = Math.max(-5, Math.min(10, earthGeom.earthElevationDeg));
                const rad = 130 - (elev / 10) * 85;
                const angleRad = (libLon / 8) * Math.PI;
                const ex = 150 + Math.sin(angleRad) * rad;
                const ey = 150 - Math.cos(angleRad) * rad;

                return (
                  <g>
                    <circle cx={ex} cy={ey} r="14" fill="#00d2ff" opacity="0.2" className="animate-ping-slow" />
                    <circle cx={ex} cy={ey} r="7" fill="#00d2ff" stroke="#ffffff" strokeWidth="1.5" />
                    <text x={ex + 12} y={ey + 4} fill="#00f5d4" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">
                      EARTH ({earthGeom.earthElevationDeg}°)
                    </text>
                  </g>
                );
              })()}
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2 border-t border-slate-800 pt-2">
            <span>SUB-EARTH MERIDIAN TRACKING</span>
            <span className={earthGeom.isDirectLOS ? 'text-emerald-400' : 'text-red-400'}>
              LOS STATUS: {earthGeom.isDirectLOS ? 'CLEAR HORIZON' : 'TERRAIN OCCULTATION'}
            </span>
          </div>
        </div>

        {/* Deep Space Network (DSN) 70m Ground Stations (5 cols) */}
        <div className="lg:col-span-5 hud-panel p-5 rounded-2xl border-cyan-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 border-b border-cyan-500/20 pb-3 mb-4">
              <Satellite className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-heading font-bold text-white tracking-wider">
                NASA DEEP SPACE NETWORK (DSN)
              </h3>
            </div>

            <div className="space-y-3">
              {site.communication.dsnStations.map((station, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <div>
                      <h4 className="text-xs font-mono font-bold text-white">{station.name}</h4>
                      <p className="text-[10px] text-slate-400">70m Parabolic Dish</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        station.status === 'ACTIVE'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          : station.status === 'STANDBY'
                          ? 'bg-blue-950 text-blue-400 border border-blue-500/30'
                          : 'bg-red-950 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {station.status}
                    </span>
                    <p className="text-[10px] font-mono text-cyan-300 mt-1">SNR: {station.signalQuality}%</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Libration Scrubber */}
            <div className="mt-5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">LIBRATION PHASE (27.3d cycle):</span>
                <span className="text-cyan-300 font-bold">{(librationProgress * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={librationProgress}
                onChange={(e) => setLibrationProgress(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400">
            {site.communication.lineOfSightAvailability}
          </div>
        </div>
      </div>
    </div>
  );
}
