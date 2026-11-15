import React, { useState } from 'react';
import { CANDIDATE_SITES } from '../../data/lunarSitesData';
import LunarTerrain3D from '../3d/LunarTerrain3D';
import {
  Compass,
  MapPin,
  Mountain,
  Sun,
  Radio,
  Layers,
  Thermometer,
  ShieldCheck,
  Zap,
  Info,
  Maximize2,
  CheckCircle2,
  Target,
  FileText,
} from 'lucide-react';
import soundManager from '../audio/SoundManager';

export default function SiteExplorerModule({ initialSiteId = 'site-beta' }) {
  const [selectedSiteId, setSelectedSiteId] = useState(initialSiteId);
  const [activeLayer, setActiveLayer] = useState('elevation');
  const [activeTab, setActiveTab] = useState('terrain'); // 'terrain', 'imagery', 'elevation_profile'

  const site = CANDIDATE_SITES.find(s => s.id === selectedSiteId) || CANDIDATE_SITES[0];

  const handleSelect = (id) => {
    soundManager.playClick();
    setSelectedSiteId(id);
  };

  return (
    <div className="space-y-6">
      {/* Site Selector Bar for all 5 sites */}
      <div className="hud-panel p-4 rounded-2xl border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Compass className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="text-base font-heading font-bold text-white tracking-wider">
              SITE EXPLORER • CANDIDATE RECONNAISSANCE
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              Select any of the five South Polar landing zones to inspect high-resolution digital elevation models and geologic profiles.
            </p>
          </div>
        </div>

        {/* 5 Site Buttons */}
        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {CANDIDATE_SITES.map((s, idx) => {
            const isSelected = s.id === selectedSiteId;
            return (
              <button
                key={s.id}
                onClick={() => handleSelect(s.id)}
                className={`px-3 py-2 rounded-xl border text-xs font-mono transition-all flex items-center space-x-2 whitespace-nowrap ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-glow-cyan'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-cyan-500/40 hover:text-white'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: isSelected ? '#030712' : s.terrain.hazardColor }}
                />
                <span>{s.shortName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: 3D Interactive Terrain + Detailed Telemetry Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 3D Terrain & Surface Imagery Viewport (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="hud-panel p-5 rounded-2xl border-cyan-500/30">
            {/* Viewport Header & Tab Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-500/20 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <Mountain className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-heading font-bold text-white tracking-wider">
                  SURFACE OBSERVATION VIEWPORT • {site.name.toUpperCase()}
                </h3>
              </div>

              {/* View tabs */}
              <div className="flex items-center space-x-1.5 bg-slate-950/80 p-1 rounded-lg border border-slate-800 text-xs font-mono">
                <button
                  onClick={() => { setActiveTab('terrain'); soundManager.playClick(); }}
                  className={`px-2.5 py-1 rounded transition-all ${
                    activeTab === 'terrain' ? 'bg-cyan-500 text-slate-950 font-bold shadow-glow-cyan' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  3D TERRAIN
                </button>
                <button
                  onClick={() => { setActiveTab('imagery'); soundManager.playClick(); }}
                  className={`px-2.5 py-1 rounded transition-all ${
                    activeTab === 'imagery' ? 'bg-cyan-500 text-slate-950 font-bold shadow-glow-cyan' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  LROC IMAGERY
                </button>
                <button
                  onClick={() => { setActiveTab('elevation_profile'); soundManager.playClick(); }}
                  className={`px-2.5 py-1 rounded transition-all ${
                    activeTab === 'elevation_profile' ? 'bg-cyan-500 text-slate-950 font-bold shadow-glow-cyan' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  CROSS-SECTION
                </button>
              </div>
            </div>

            {/* Viewport Content */}
            {activeTab === 'terrain' && (
              <div>
                <LunarTerrain3D site={site} activeLayer={activeLayer} onLayerChange={setActiveLayer} />
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-3 pt-2 border-t border-slate-800">
                  <span>ORBIT: DRAG TO ROTATE • SCROLL TO TILT</span>
                  <span className="text-cyan-400">DEM MESH RESOLUTION: 5m / GRID POINT</span>
                </div>
              </div>
            )}

            {activeTab === 'imagery' && (
              <div className="space-y-3">
                <div className="relative h-[380px] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center p-4">
                  {/* Simulated LROC NAC High-Res Orthomosaic */}
                  <div
                    className="w-full h-full rounded-lg relative overflow-hidden"
                    style={{
                      backgroundImage: `radial-gradient(circle at 60% 40%, rgba(200, 210, 230, 0.25), rgba(15, 23, 42, 0.95)), 
                        repeating-radial-gradient(circle at 35% 65%, rgba(100, 116, 139, 0.4) 0px, transparent 15px, rgba(15, 23, 42, 0.6) 30px)`,
                      backgroundColor: '#1e293b',
                    }}
                  >
                    {/* Reticle Overlay */}
                    <div className="absolute inset-0 border border-cyan-500/20 pointer-events-none space-grid-bg" />
                    
                    {/* Target landing ellipse marker */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-dashed border-cyan-400 rounded-full w-44 h-32 flex items-center justify-center bg-cyan-500/10 backdrop-blur-[1px]">
                      <div className="w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
                      <span className="text-[10px] font-mono text-cyan-300 font-bold tracking-widest bg-slate-950/80 px-2 py-0.5 rounded border border-cyan-500/40">
                        100m TARGET ELLIPSE
                      </span>
                    </div>

                    {/* Identified boulder tags */}
                    <div className="absolute top-[28%] left-[62%] px-2 py-1 rounded bg-slate-950/90 border border-amber-500/50 text-[10px] font-mono text-amber-300 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                      <span>BOULDER CLUSTER (1.2m)</span>
                    </div>

                    <div className="absolute bottom-[24%] left-[22%] px-2 py-1 rounded bg-slate-950/90 border border-cyan-500/50 text-[10px] font-mono text-cyan-300">
                      <span>TOUCHDOWN BEACON TARGET</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>SCALE: 0.5 METER / PIXEL</span>
                  <span className="text-emerald-400">LROC NAC ORTHOMOSAIC VERIFIED</span>
                </div>
              </div>
            )}

            {activeTab === 'elevation_profile' && (
              <div className="space-y-4">
                <div className="h-[360px] p-4 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col justify-between">
                  <div className="flex justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-2">
                    <span>TRANSECT CROSS-SECTION PROFILE (NORTH-SOUTH 10 KM)</span>
                    <span className="text-cyan-300">PEAK: {Math.max(...site.terrain.elevationProfile)} m</span>
                  </div>

                  {/* SVG Elevation Cross Section */}
                  <div className="h-56 w-full flex items-end">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 600 200">
                      <defs>
                        <linearGradient id="elevGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00f5d4" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#00f5d4" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Reference line */}
                      <line x1="0" y1="180" x2="600" y2="180" stroke="#334155" strokeDasharray="4 4" />

                      {/* Transect polygon */}
                      {(() => {
                        const prof = site.terrain.elevationProfile;
                        const minE = Math.min(...prof) - 200;
                        const maxE = Math.max(...prof) + 200;
                        const range = Math.max(1, maxE - minE);

                        const points = prof.map((val, idx) => {
                          const x = (idx / (prof.length - 1)) * 600;
                          const y = 180 - ((val - minE) / range) * 150;
                          return `${x},${y}`;
                        }).join(' ');

                        return (
                          <g>
                            <polygon points={`0,180 ${points} 600,180`} fill="url(#elevGrad)" />
                            <polyline points={points} fill="none" stroke="#00f5d4" strokeWidth="2.5" />
                            {prof.map((val, idx) => {
                              const x = (idx / (prof.length - 1)) * 600;
                              const y = 180 - ((val - minE) / range) * 150;
                              return (
                                <g key={idx}>
                                  <circle cx={x} cy={y} r="4" fill="#00f5d4" />
                                  <text x={x} y={y - 8} fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="JetBrains Mono">
                                    {val}m
                                  </text>
                                </g>
                              );
                            })}
                          </g>
                        );
                      })()}
                    </svg>
                  </div>

                  <div className="flex justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800 pt-2">
                    <span>-5.0 km (Approach Corridor)</span>
                    <span className="text-cyan-300">0.0 km (Touchdown Center)</span>
                    <span>+5.0 km (Traverse Corridor)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Site Profile & Scientific Metrics (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="hud-panel p-5 rounded-2xl border-cyan-500/30 space-y-4">
            <div className="border-b border-cyan-500/20 pb-3">
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                CANDIDATE GEOLOGIC PROFILE
              </span>
              <h3 className="text-2xl font-heading font-extrabold text-white mt-1">
                {site.name}
              </h3>
              <p className="text-xs font-mono text-cyan-300 mt-0.5">
                {site.designation} • {site.type}
              </p>
            </div>

            {/* Geological Summary */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 font-bold">
                <FileText className="w-3.5 h-3.5" />
                <span>GEOLOGICAL APPRAISAL</span>
              </div>
              <p className="text-xs text-slate-200 font-sans leading-relaxed">
                {site.tagline}. Situated at {site.coordinates.latDMS}, this region represents a top-tier target for landing safety and resource prospecting.
              </p>
              <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400">
                • Regolith Depth: <strong className="text-white">{site.terrain.regolithDepthM} m</strong><br/>
                • Soil Bearing Strength: <strong className="text-white">{site.terrain.bearingStrengthKPa} kPa</strong>
              </div>
            </div>

            {/* Key Exploration Parameters */}
            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Annual Solar Illumination:</span>
                <span className="text-amber-300 font-bold">{site.solar.annualIlluminationPct}% ({site.solar.sunlightDurationHours}h)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Earth Direct Line-of-Sight:</span>
                <span className="text-emerald-400 font-bold">{site.communication.earthVisibilityPct}%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Mean Landing Slope:</span>
                <span className="text-purple-300 font-bold">{site.terrain.avgSlopeDeg}° (Max {site.terrain.maxSlopeInLandingZoneDeg}°)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Safe Ellipse Area (100m):</span>
                <span className="text-cyan-300 font-bold">{site.terrain.safeLandingAreaPct}%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Distance to Volatile Cold Trap:</span>
                <span className="text-white font-bold">{site.science.traverseDistanceToPSRKm} km</span>
              </div>
            </div>

            {/* Verdict notice */}
            <div className="p-3 rounded-xl bg-cyan-950/50 border border-cyan-500/30 text-xs font-mono">
              <span className="text-cyan-400 font-bold block mb-1">MISSION VERDICT:</span>
              <p className="text-slate-200 font-sans">{site.summary.primaryAdvantage}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
