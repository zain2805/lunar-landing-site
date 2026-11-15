import React, { useState } from 'react';
import { CANDIDATE_SITES } from '../../data/lunarSitesData';
import LunarGlobe3D from '../3d/LunarGlobe3D';
import {
  Compass,
  Sun,
  Radio,
  Mountain,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  Thermometer,
  Zap,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import soundManager from '../audio/SoundManager';

export default function DashboardModule({ onSelectSite, onNavigateModule }) {
  const [selectedSiteId, setSelectedSiteId] = useState('site-beta');
  const [hoveredSiteId, setHoveredSiteId] = useState(null);

  const selectedSite = CANDIDATE_SITES.find(s => s.id === selectedSiteId) || CANDIDATE_SITES[0];

  const handleCardClick = (id) => {
    soundManager.playClick();
    setSelectedSiteId(id);
    if (onSelectSite) onSelectSite(id);
  };

  const handleInspectSite = (id) => {
    soundManager.playClick();
    if (onSelectSite) onSelectSite(id);
    if (onNavigateModule) onNavigateModule('explorer');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Mission Objectives & Aerospace Telemetry */}
      <div className="hud-panel p-5 rounded-2xl border-cyan-500/30 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 corner-brackets">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="tracking-widest uppercase">MISSION CONTROL • CANDIDATE SELECTION EVALUATION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-wide">
            LUNAR LANDING SITE NAVIGATOR
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 font-sans">
            Comprehensive multi-parametric assessment of five high-priority Artemis landing candidates situated exclusively in the lunar South Polar region. Sourced from NASA LOLA, LROC, and SPICE ephemerides.
          </p>
        </div>

        {/* Quick telemetry indicators */}
        <div className="flex flex-wrap gap-2 text-xs font-mono">
          <div className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center space-x-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <div>
              <p className="text-[10px] text-slate-400">REFERENCE DATUM</p>
              <p className="text-cyan-300 font-bold">LOLA 5M ME-DATUM</p>
            </div>
          </div>
          <div className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <div>
              <p className="text-[10px] text-slate-400">SOLAR FLUX (1 AU)</p>
              <p className="text-amber-300 font-bold">1,361.0 W/m²</p>
            </div>
          </div>
          <div className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center space-x-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <div>
              <p className="text-[10px] text-slate-400">DSN GOLDSTONE</p>
              <p className="text-emerald-400 font-bold">CARRIER LOCKED</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive 3D Lunar Location Map + Selected Site Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive 3D Lunar Location Map (7 cols) */}
        <div className="lg:col-span-7 hud-panel p-5 rounded-2xl border-cyan-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-3">
            <div className="flex items-center space-x-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-heading font-bold text-white tracking-wider">
                INTERACTIVE LUNAR LOCATION MAP (SOUTH POLE)
              </h2>
            </div>
            <span className="text-[10px] font-mono text-cyan-400/90 px-2.5 py-1 rounded bg-cyan-950/80 border border-cyan-500/30 flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span>CLICK SITE TO ROTATE 360° & ZOOM</span>
            </span>
          </div>

          {/* 3D Lunar Globe with 360-degree rotation and zoom */}
          <div className="h-[380px] sm:h-[440px] w-full rounded-xl overflow-hidden bg-slate-950/80 border border-cyan-500/20 relative">
            <LunarGlobe3D
              selectedSiteId={selectedSiteId}
              onSelectSite={handleCardClick}
              onSiteHover={setHoveredSiteId}
            />

            {/* Quick site tags overlay on 3D globe */}
            <div className="absolute top-3 left-3 flex flex-col space-y-1.5 pointer-events-none text-[11px] font-mono z-10">
              {CANDIDATE_SITES.map((s, idx) => (
                <div
                  key={s.id}
                  className={`px-2.5 py-1 rounded-md border backdrop-blur-md transition-all ${
                    s.id === selectedSiteId
                      ? 'bg-cyan-950/90 border-cyan-400 text-cyan-200 font-bold shadow-glow-cyan'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full inline-block mr-1.5" style={{ backgroundColor: s.terrain.hazardColor }} />
                  {idx + 1}. {s.shortName} ({s.overallScore}/100)
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-3 pt-2 border-t border-slate-800">
            <span>SECTOR: 84°S TO 90°S (POLAR CAP)</span>
            <span className="text-cyan-400">FIVE ARTEMIS HIGH-PRIORITY ZONES</span>
          </div>
        </div>

        {/* Selected Site Spotlight Overview (5 cols) */}
        <div className="lg:col-span-5 hud-panel p-5 rounded-2xl border-cyan-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-4">
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>SPOTLIGHT • {selectedSite.code}</span>
              </span>
              <span
                className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border"
                style={{
                  backgroundColor: `${selectedSite.terrain.hazardColor}15`,
                  color: selectedSite.terrain.hazardColor,
                  borderColor: `${selectedSite.terrain.hazardColor}40`,
                }}
              >
                {selectedSite.summary.verdict}
              </span>
            </div>

            <h3 className="text-2xl font-heading font-extrabold text-white">
              {selectedSite.name}
            </h3>
            <p className="text-xs text-cyan-300 font-mono mt-1">
              {selectedSite.coordinates.latDMS} • {selectedSite.coordinates.lonDMS} • {selectedSite.type}
            </p>
            <p className="text-xs text-slate-300 font-sans mt-3 leading-relaxed">
              {selectedSite.summary.primaryAdvantage}
            </p>

            {/* Scientific Parameters Matrix */}
            <div className="grid grid-cols-2 gap-3 mt-4 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">LOLA ELEVATION</span>
                <span className="text-base font-bold text-white">
                  {selectedSite.coordinates.elevationM > 0 ? `+${selectedSite.coordinates.elevationM} m` : `${selectedSite.coordinates.elevationM} m`}
                </span>
                <span className="text-[10px] text-cyan-400 block mt-0.5">Relief: {selectedSite.coordinates.reliefM} m</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">SOLAR ILLUMINATION</span>
                <span className="text-base font-bold text-amber-300">
                  {selectedSite.solar.annualIlluminationPct}%
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Peak {selectedSite.solar.peakSummerIlluminationPct}%</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">EARTH DIRECT LOS</span>
                <span className="text-base font-bold text-emerald-400">
                  {selectedSite.communication.earthVisibilityPct}%
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Elevation +{selectedSite.communication.avgEarthElevationDeg}°</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">SURFACE SLOPE</span>
                <span className="text-base font-bold text-purple-300">
                  {selectedSite.terrain.avgSlopeDeg}°
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Safe Area: {selectedSite.terrain.safeLandingAreaPct}%</span>
              </div>
            </div>

            {/* Suitability score bar */}
            <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-300 font-bold">AHP SUITABILITY RATING</span>
                <span className="text-cyan-300 font-bold">{selectedSite.overallScore} / 100</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${selectedSite.overallScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Module Action Navigation */}
          <div className="mt-5 flex gap-2">
            <button
              onClick={() => handleInspectSite(selectedSite.id)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-heading font-bold text-xs tracking-wider uppercase flex items-center justify-center space-x-2 transition-all shadow-glow-cyan"
            >
              <span>INSPECT SITE PROFILE</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigateModule('comparison')}
              className="py-2.5 px-3 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-cyan-500/40 text-slate-200 text-xs font-mono transition-all"
            >
              COMPARE 5 SITES
            </button>
          </div>
        </div>
      </div>

      {/* OVERVIEW OF ALL FIVE LUNAR LANDING SITES (South Pole Region) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
          <div>
            <h2 className="text-lg font-heading font-bold text-white tracking-wider flex items-center space-x-2">
              <span>FIVE SOUTH POLAR LANDING SITES OVERVIEW</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-normal">
                ARTEMIS POLAR ZONES
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Click any candidate card to automatically rotate the 3D Moon 360° and zoom into the landing coordinates.
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400/80 hidden sm:inline">
            5 CANDIDATES EVALUATED
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {CANDIDATE_SITES.map((site, index) => {
            const isSelected = site.id === selectedSiteId;
            return (
              <div
                key={site.id}
                onClick={() => handleCardClick(site.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'hud-panel-active bg-slate-900/90 shadow-[0_0_25px_rgba(0,245,212,0.25)] border-cyan-400'
                    : 'hud-panel bg-slate-950/60 border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">
                      SITE 0{index + 1} • {site.code}
                    </span>
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: site.terrain.hazardColor }}
                      title={`Hazard rating: ${site.terrain.landingHazardClassification}`}
                    />
                  </div>

                  <h3 className="text-sm font-heading font-bold text-white leading-tight">
                    {site.name}
                  </h3>
                  <p className="text-[10px] font-mono text-cyan-300/80 mt-1">
                    {site.coordinates.latDMS}
                  </p>

                  <div className="space-y-1.5 mt-3 pt-2 border-t border-slate-800 text-[11px] font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Elevation:</span>
                      <span className="text-white font-bold">{site.coordinates.elevationM > 0 ? `+${site.coordinates.elevationM}m` : `${site.coordinates.elevationM}m`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Illumination:</span>
                      <span className="text-amber-300 font-bold">{site.solar.annualIlluminationPct}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Earth LOS:</span>
                      <span className="text-emerald-400 font-bold">{site.communication.earthVisibilityPct}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Mean Slope:</span>
                      <span className="text-purple-300 font-bold">{site.terrain.avgSlopeDeg}°</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    {site.targetRank === 1 && <Award className="w-3.5 h-3.5 text-amber-400" />}
                    <span className="text-[10px] font-mono text-slate-300 font-bold">
                      RANK #{site.targetRank}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-cyan-300'
                  }`}>
                    {site.overallScore} PTS
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
