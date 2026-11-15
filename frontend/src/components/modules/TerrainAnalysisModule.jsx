import React, { useState } from 'react';
import { CANDIDATE_SITES } from '../../data/lunarSitesData';
import LunarTerrain3D from '../3d/LunarTerrain3D';
import {
  Mountain,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Thermometer,
  Layers,
  CircleDot,
  Gauge,
  Sliders,
  TrendingDown,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import soundManager from '../audio/SoundManager';

export default function TerrainAnalysisModule() {
  const [selectedSiteId, setSelectedSiteId] = useState('site-beta');
  const [activeLayer, setActiveLayer] = useState('slope');
  const [safetySlopeThreshold, setSafetySlopeThreshold] = useState(8.0); // degrees

  const site = CANDIDATE_SITES.find(s => s.id === selectedSiteId) || CANDIDATE_SITES[0];

  const handleSelectSite = (id) => {
    soundManager.playClick();
    setSelectedSiteId(id);
  };

  const passesSafety = site.terrain.avgSlopeDeg <= safetySlopeThreshold;

  return (
    <div className="space-y-6">
      {/* Module Title & Site Switcher for all 5 sites */}
      <div className="hud-panel p-5 rounded-2xl border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
            <Mountain className="w-4 h-4 text-purple-400" />
            <span className="tracking-widest uppercase">MODULE 05 • TOPOGRAPHY, SLOPE & LANDING SAFETY</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white tracking-wide">
            TERRAIN & LANDING HAZARD ANALYSIS
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1 font-sans">
            High-resolution LOLA laser altimetry and LROC morphometric analysis. Evaluates micro-topography slope angles, surface roughness Hurst exponents, boulder distributions, and safe landing zones.
          </p>
        </div>

        {/* 5 Sites Switcher */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
          {CANDIDATE_SITES.map(s => {
            const isSelected = s.id === selectedSiteId;
            return (
              <button
                key={s.id}
                onClick={() => handleSelectSite(s.id)}
                className={`px-3 py-2 rounded-xl border text-xs font-mono transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-purple-600 text-white font-bold border-purple-400 shadow-glow-purple'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:text-white hover:border-purple-500/40'
                }`}
              >
                {s.shortName}
              </button>
            );
          })}
        </div>
      </div>

      {/* 10 Scientific Calculation KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* 1. Terrain Elevation */}
        <div className="p-3.5 rounded-xl hud-panel border-cyan-500/20">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">1. LOLA ELEVATION</span>
          <span className="text-lg sm:text-xl font-bold font-heading text-white">
            {site.coordinates.elevationM > 0 ? `+${site.coordinates.elevationM} m` : `${site.coordinates.elevationM} m`}
          </span>
          <span className="text-[10px] font-mono text-cyan-300 block mt-0.5">Relief: {site.coordinates.reliefM} m</span>
        </div>

        {/* 2. Surface Slope */}
        <div className="p-3.5 rounded-xl hud-panel border-cyan-500/20">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">2. SURFACE SLOPE</span>
          <span className="text-lg sm:text-xl font-bold font-heading text-purple-300">
            {site.terrain.avgSlopeDeg}° (Max {site.terrain.maxSlopeInLandingZoneDeg}°)
          </span>
          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">5m RMS: {site.terrain.rmsSlope5mDeg}°</span>
        </div>

        {/* 3. Surface Roughness */}
        <div className="p-3.5 rounded-xl hud-panel border-cyan-500/20">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">3. ROUGHNESS HURST</span>
          <span className="text-lg sm:text-xl font-bold font-heading text-cyan-300">
            {site.terrain.surfaceRoughnessHurst}
          </span>
          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">Fractal dimension D</span>
        </div>

        {/* 4. Crater Detection */}
        <div className="p-3.5 rounded-xl hud-panel border-cyan-500/20">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">4. CRATER DENSITY</span>
          <span className="text-lg sm:text-xl font-bold font-heading text-amber-300">
            {site.terrain.craterDensityPerKm2} / km²
          </span>
          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">Diameter D &gt; 20m</span>
        </div>

        {/* 5. Crater Hazard Analysis */}
        <div className="p-3.5 rounded-xl hud-panel border-cyan-500/20">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">5. CRATER HAZARD</span>
          <span className="text-lg sm:text-xl font-bold font-heading text-white">
            {site.terrain.craterDensityPerKm2 < 10 ? 'LOW' : site.terrain.craterDensityPerKm2 < 14 ? 'MODERATE' : 'SEVERE'}
          </span>
          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">Ejecta blanket coverage</span>
        </div>

        {/* 6. Boulder Detection */}
        <div className="p-3.5 rounded-xl hud-panel border-cyan-500/20">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">6. BOULDER COUNT</span>
          <span className="text-lg sm:text-xl font-bold font-heading text-amber-400">
            {site.terrain.boulderDensityPer100m2} / 100m²
          </span>
          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">Boulders &gt; 0.5m</span>
        </div>

        {/* 7. Safe Landing Area Calculation */}
        <div className="p-3.5 rounded-xl hud-panel border-cyan-500/20">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">7. SAFE LANDING AREA</span>
          <span className="text-lg sm:text-xl font-bold font-heading text-emerald-400">
            {site.terrain.safeLandingAreaPct}%
          </span>
          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">Within 100m ellipse</span>
        </div>

        {/* 8. Surface Temperature */}
        <div className="p-3.5 rounded-xl hud-panel border-cyan-500/20">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">8. TEMPERATURE EXTREMES</span>
          <span className="text-lg sm:text-xl font-bold font-heading text-cyan-300">
            {site.thermal.minTempK} K to {site.thermal.maxTempK} K
          </span>
          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">{site.thermal.minTempC}°C to {site.thermal.maxTempC}°C</span>
        </div>

        {/* 9. Thermal Suitability */}
        <div className="p-3.5 rounded-xl hud-panel border-cyan-500/20">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">9. THERMAL STRESS</span>
          <span className="text-lg sm:text-xl font-bold font-heading text-purple-300">
            {site.thermal.thermalSuitabilityScore} / 100
          </span>
          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">ΔT = {site.thermal.diurnalThermalCycleRangeDeltaK} K cycle</span>
        </div>

        {/* 10. Landing Safety Rating */}
        <div className="p-3.5 rounded-xl hud-panel border-cyan-500/20">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">10. LANDING SAFETY RATING</span>
          <span
            className="text-lg sm:text-xl font-bold font-heading"
            style={{ color: site.terrain.hazardColor }}
          >
            {site.terrain.landingHazardClassification}
          </span>
          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">Flight Safety Gate: {passesSafety ? 'PASSED' : 'VIOLATION'}</span>
        </div>
      </div>

      {/* Main Grid: Interactive 3D Terrain + Slope Safety Gate Interlock */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 3D Interactive Terrain Mesh with Layer Toggles (8 cols) */}
        <div className="lg:col-span-8 hud-panel p-5 rounded-2xl border-cyan-500/30">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-500/20 pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-heading font-bold text-white tracking-wider">
                3D ELEVATION & SLOPE VISUALIZATION ({site.shortName.toUpperCase()})
              </h3>
            </div>

            {/* Layer Toggles */}
            <div className="flex items-center space-x-1.5 bg-slate-950/80 p-1 rounded-lg border border-slate-800 text-xs font-mono">
              {['slope', 'elevation', 'illumination'].map(layer => (
                <button
                  key={layer}
                  onClick={() => { setActiveLayer(layer); soundManager.playClick(); }}
                  className={`px-3 py-1 rounded transition-all uppercase ${
                    activeLayer === layer
                      ? 'bg-purple-600 text-white font-bold shadow-glow-purple'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {layer}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[380px] w-full rounded-xl overflow-hidden relative">
            <LunarTerrain3D site={site} activeLayer={activeLayer} onLayerChange={setActiveLayer} />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-3 pt-2 border-t border-slate-800">
            <span>DRAG TO ROTATE • SCROLL TO ZOOM</span>
            <span className="text-purple-300">ACTIVE LAYER: {activeLayer.toUpperCase()} HEATMAP</span>
          </div>
        </div>

        {/* Landing Safety Screening Interlock Panel (4 cols) */}
        <div className="lg:col-span-4 hud-panel p-5 rounded-2xl border-cyan-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 border-b border-cyan-500/20 pb-3 mb-4">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-heading font-bold text-white tracking-wider">
                LANDING SAFETY CRITICAL GATE
              </h3>
            </div>

            {/* Interactive Safety Slope Threshold Slider */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">MAX ALLOWABLE SLOPE THRESHOLD:</span>
                <strong className="text-cyan-300">{safetySlopeThreshold.toFixed(1)}°</strong>
              </div>
              <input
                type="range"
                min="5"
                max="15"
                step="0.5"
                value={safetySlopeThreshold}
                onChange={(e) => setSafetySlopeThreshold(parseFloat(e.target.value))}
                className="w-full accent-purple-400"
              />

              {/* Live Safety Gate Status Badge */}
              <div className={`p-4 rounded-xl border flex items-center space-x-3 transition-all ${
                passesSafety
                  ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                  : 'bg-red-950/70 border-red-500/40 text-red-300'
              }`}>
                {passesSafety ? <CheckCircle2 className="w-6 h-6 shrink-0" /> : <XCircle className="w-6 h-6 shrink-0" />}
                <div>
                  <h4 className="font-heading font-bold text-xs uppercase tracking-wider">
                    {passesSafety ? 'SAFETY CRITERIA PASSED' : 'SLOPE THRESHOLD EXCEEDED'}
                  </h4>
                  <p className="text-[11px] font-mono mt-0.5">
                    {site.shortName} average slope is {site.terrain.avgSlopeDeg}°, {passesSafety ? 'safely below' : 'exceeding'} the {safetySlopeThreshold}° limit.
                  </p>
                </div>
              </div>

              {/* Safety Breakdown */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Crater Obstacle Risk:</span>
                  <span className="text-amber-300 font-bold">{site.terrain.craterDensityPerKm2} / km²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Boulder Distribution:</span>
                  <span className="text-amber-300 font-bold">{site.terrain.boulderDensityPer100m2} / 100m²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Safe Landing Area:</span>
                  <span className="text-emerald-400 font-bold">{site.terrain.safeLandingAreaPct}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Bearing Strength:</span>
                  <span className="text-white font-bold">{site.terrain.bearingStrengthKPa} kPa</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400">
            {site.summary.criticalSafetyCheck}
          </div>
        </div>
      </div>
    </div>
  );
}
