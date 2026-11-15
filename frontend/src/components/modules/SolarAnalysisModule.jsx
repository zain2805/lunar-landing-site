import React, { useState, useEffect } from 'react';
import { CANDIDATE_SITES, LUNAR_CONSTANTS } from '../../data/lunarSitesData';
import {
  calculateSolarAngles,
  calculateSolarPower,
  calculateBatteryRequirement,
  calculateSurfaceTemp,
} from '../../data/scientificCalculations';
import CinematicRocketDeployment from '../cinematic/CinematicRocketDeployment';
import {
  Sun,
  BatteryCharging,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  TrendingUp,
  Clock,
  Layers,
  Sparkles,
  Rocket,
  CheckCircle2,
} from 'lucide-react';
import soundManager from '../audio/SoundManager';

export default function SolarAnalysisModule() {
  const [selectedSiteId, setSelectedSiteId] = useState('site-beta');
  const [simHour, setSimHour] = useState(180); // 0 to 708.7 hours
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(5);
  const [arrayAreaM2, setArrayAreaM2] = useState(30);
  const [arrayEfficiency, setArrayEfficiency] = useState(28); // %
  const [isDeployingRocket, setIsDeployingRocket] = useState(false);
  const [calculationDone, setCalculationDone] = useState(true);

  const site = CANDIDATE_SITES.find(s => s.id === selectedSiteId) || CANDIDATE_SITES[0];

  // Dynamic calculations
  const solarAngles = calculateSolarAngles(site.coordinates.latitude, 1.35, simHour);
  const powerOutputWatts = calculateSolarPower(arrayAreaM2, arrayEfficiency / 100, solarAngles.incidenceDeg, true);
  const batteryRequirementKWh = calculateBatteryRequirement(1.5, site.solar.longestDarknessDurationHours, 0.8);
  const surfaceThermal = calculateSurfaceTemp(solarAngles.elevationDeg);

  // Synodic Simulation playback loop
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setSimHour(prev => {
          const next = prev + playbackSpeed * 0.1;
          return next > LUNAR_CONSTANTS.SYNODIC_MONTH_HOURS ? 0 : next;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  const handleSiteSelect = (id) => {
    soundManager.playClick();
    setSelectedSiteId(id);
  };

  const handleTriggerCalculation = () => {
    soundManager.playClick();
    setIsDeployingRocket(true);
  };

  const handleRocketComplete = () => {
    setIsDeployingRocket(false);
    setCalculationDone(true);
  };

  // Generate 24 timeline sampling points for graphs
  const timelinePoints = [];
  const totalSteps = 24;
  for (let i = 0; i < totalSteps; i++) {
    const hr = (i / totalSteps) * LUNAR_CONSTANTS.SYNODIC_MONTH_HOURS;
    const angles = calculateSolarAngles(site.coordinates.latitude, 1.35, hr);
    const pWatts = calculateSolarPower(arrayAreaM2, arrayEfficiency / 100, angles.incidenceDeg, true);
    timelinePoints.push({ hour: hr, elevation: angles.elevationDeg, power: pWatts });
  }

  return (
    <div className="space-y-6">
      {/* Cinematic Rocket Animation Modal if active */}
      {isDeployingRocket && (
        <CinematicRocketDeployment
          siteName={site.name}
          onComplete={handleRocketComplete}
        />
      )}

      {/* Module Title & Site Selection Header */}
      <div className="hud-panel p-5 rounded-2xl border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
            <Sun className="w-4 h-4 text-amber-400" />
            <span className="tracking-widest uppercase">MODULE 03 • SOLAR & ENERGY FLUX ARCHITECTURE</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white tracking-wide">
            SOLAR ILLUMINATION & POWER ANALYSIS
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1 font-sans">
            Rigorous astronomical solar incidence modeling across the 708.7-hour synodic lunar cycle. Evaluates solar array yields, peak shadows, and cryogenic battery sizing.
          </p>
        </div>

        {/* Site Switcher for all 5 sites */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
          {CANDIDATE_SITES.map(s => {
            const isSelected = s.id === selectedSiteId;
            return (
              <button
                key={s.id}
                onClick={() => handleSiteSelect(s.id)}
                className={`px-3 py-2 rounded-xl border text-xs font-mono transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-glow-amber'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:text-white hover:border-amber-500/40'
                }`}
              >
                {s.shortName}
              </button>
            );
          })}
        </div>
      </div>

      {/* ROCKET DEPLOYMENT & CALCULATION ACTION BAR */}
      <div className="hud-panel p-4 rounded-xl border-amber-500/30 bg-gradient-to-r from-amber-950/20 via-slate-950/80 to-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-400">
            <Rocket className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-heading font-bold text-white tracking-wider">
              CINEMATIC ROCKET & SOLAR COMPONENT DEPLOYMENT
            </h3>
            <p className="text-xs text-slate-300 font-sans">
              Deploy lander photovoltaic arrays and calculate synodic sunlight availability and darkness periods for <strong className="text-amber-300">{site.shortName}</strong>.
            </p>
          </div>
        </div>

        <button
          onClick={handleTriggerCalculation}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-heading font-extrabold text-xs tracking-wider uppercase flex items-center justify-center space-x-2 transition-all shadow-glow-amber transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Sparkles className="w-4 h-4 fill-slate-950" />
          <span>CALCULATE SOLAR BUDGET (CINEMATIC)</span>
        </button>
      </div>

      {/* 8 Scientific Calculation KPI Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Solar Incidence Angle */}
        <div className="p-4 rounded-xl hud-panel border-cyan-500/20">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">1. SOLAR INCIDENCE ANGLE (θi)</span>
          <span className="text-xl sm:text-2xl font-bold font-heading text-amber-300">
            {solarAngles.incidenceDeg}°
          </span>
          <span className="text-[11px] font-mono text-slate-400 block mt-1">Normal to local horizontal</span>
        </div>

        {/* 2. Solar Elevation Angle */}
        <div className="p-4 rounded-xl hud-panel border-cyan-500/20">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">2. SOLAR ELEVATION (α☉)</span>
          <span className="text-xl sm:text-2xl font-bold font-heading text-cyan-300">
            {solarAngles.elevationDeg > 0 ? `+${solarAngles.elevationDeg}°` : `${solarAngles.elevationDeg}°`}
          </span>
          <span className="text-[11px] font-mono text-slate-400 block mt-1">
            Status: {solarAngles.isDaylight ? 'ILLUMINATED' : 'SHADOWED'}
          </span>
        </div>

        {/* 3 & 4. Sunlight & Darkness Duration */}
        <div className="p-4 rounded-xl hud-panel border-cyan-500/20">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">3 & 4. DURATION RATIO</span>
          <span className="text-xl sm:text-2xl font-bold font-heading text-white">
            {site.solar.sunlightDurationHours}h / {site.solar.longestDarknessDurationHours}h
          </span>
          <span className="text-[11px] font-mono text-amber-400 block mt-1">Light vs Max Eclipse Shadow</span>
        </div>

        {/* 5. Solar Illumination Percentage */}
        <div className="p-4 rounded-xl hud-panel border-cyan-500/20">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">5. ILLUMINATION FRACTION</span>
          <span className="text-xl sm:text-2xl font-bold font-heading text-emerald-400">
            {site.solar.annualIlluminationPct}%
          </span>
          <span className="text-[11px] font-mono text-slate-400 block mt-1">Annual persistent sunlight</span>
        </div>

        {/* 6. Solar Panel Energy Generation */}
        <div className="p-4 rounded-xl hud-panel border-cyan-500/20">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">6. CURRENT ARRAY OUTPUT</span>
          <span className="text-xl sm:text-2xl font-bold font-heading text-amber-300">
            {(powerOutputWatts / 1000).toFixed(2)} kW
          </span>
          <span className="text-[11px] font-mono text-slate-400 block mt-1">
            {arrayAreaM2}m² @ {arrayEfficiency}% eff.
          </span>
        </div>

        {/* 7. Battery Storage Requirement */}
        <div className="p-4 rounded-xl hud-panel border-cyan-500/20">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">7. REQUIRED BATTERY (kWh)</span>
          <span className="text-xl sm:text-2xl font-bold font-heading text-purple-300">
            {batteryRequirementKWh} kWh
          </span>
          <span className="text-[11px] font-mono text-slate-400 block mt-1">1.5kW base load survival</span>
        </div>

        {/* 8. Solar Flux Irradiance */}
        <div className="p-4 rounded-xl hud-panel border-cyan-500/20">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">8. SOLAR FLUX (1 AU)</span>
          <span className="text-xl sm:text-2xl font-bold font-heading text-cyan-300">
            {LUNAR_CONSTANTS.SOLAR_CONSTANT_W_M2} W/m²
          </span>
          <span className="text-[11px] font-mono text-slate-400 block mt-1">Direct solar irradiance</span>
        </div>

        {/* Surface Radiative Temp */}
        <div className="p-4 rounded-xl hud-panel border-cyan-500/20">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">REGOLITH EQUILIBRIUM TEMP</span>
          <span className="text-xl sm:text-2xl font-bold font-heading text-slate-200">
            {surfaceThermal.tempKelvin} K ({surfaceThermal.tempCelsius}°C)
          </span>
          <span className="text-[11px] font-mono text-slate-400 block mt-1">Stefan-Boltzmann model</span>
        </div>
      </div>

      {/* Interactive Time-Based Synodic Simulation Scrubber */}
      <div className="hud-panel p-5 rounded-2xl border-cyan-500/30 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-heading font-bold text-white tracking-wider">
              TIME-BASED SYNODIC SIMULATION SCRUBBER (708.7 HOURS)
            </h3>
          </div>

          {/* Scrubber Playback Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => { setIsPlaying(!isPlaying); soundManager.playClick(); }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center space-x-1.5 transition-all ${
                isPlaying
                  ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                  : 'bg-cyan-500/20 border-cyan-400 text-cyan-300 hover:bg-cyan-500/30'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'PAUSE' : 'PLAY SIM'}</span>
            </button>

            <button
              onClick={() => { setSimHour(0); soundManager.playClick(); }}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              title="Reset to Lunar Sunrise (Hour 0)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300"
            >
              <option value="1">1x Speed</option>
              <option value="5">5x Speed</option>
              <option value="20">20x Speed</option>
            </select>
          </div>
        </div>

        {/* Synodic Cycle Progress Bar & Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">
              SYNODIC PHASE TIME: <strong className="text-cyan-300">{simHour.toFixed(1)} hrs</strong> / {LUNAR_CONSTANTS.SYNODIC_MONTH_HOURS} hrs (~29.53 Earth Days)
            </span>
            <span className="text-amber-400 font-bold">
              SOLAR ELEVATION: {solarAngles.elevationDeg > 0 ? `+${solarAngles.elevationDeg}°` : `${solarAngles.elevationDeg}°`}
            </span>
          </div>

          <input
            type="range"
            min="0"
            max={LUNAR_CONSTANTS.SYNODIC_MONTH_HOURS}
            step="0.5"
            value={simHour}
            onChange={(e) => setSimHour(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-950 rounded-lg"
          />

          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>HOUR 0 (LUNAR DAWN)</span>
            <span>HOUR 177 (NOON PEAK)</span>
            <span>HOUR 354 (LUNAR DUSK)</span>
            <span>HOUR 531 (MIDNIGHT)</span>
            <span>HOUR 708.7 (CYCLE END)</span>
          </div>
        </div>
      </div>

      {/* Sunlight vs Darkness Graphs & Solar Power Generation Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SVG Power Curve (8 cols) */}
        <div className="lg:col-span-8 hud-panel p-5 rounded-2xl border-cyan-500/30">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-heading font-bold text-white tracking-wider">
                POWER GENERATION PROFILE OVER LUNAR DAY (WATTS)
              </h3>
            </div>
            <span className="text-xs font-mono text-amber-300">
              PEAK: {((arrayAreaM2 * (arrayEfficiency / 100) * LUNAR_CONSTANTS.SOLAR_CONSTANT_W_M2) / 1000).toFixed(1)} kW
            </span>
          </div>

          {/* Interactive SVG Chart */}
          <div className="h-64 w-full relative flex items-end">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 700 220">
              {/* Baseline grids */}
              <line x1="0" y1="50" x2="700" y2="50" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="0" y1="110" x2="700" y2="110" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="0" y1="170" x2="700" y2="170" stroke="#1e293b" strokeDasharray="3 3" />

              {/* Area path */}
              <path
                d={`M 0 220 ${timelinePoints.map((pt, idx) => {
                  const x = (idx / (timelinePoints.length - 1)) * 700;
                  const y = 200 - (pt.power / 12000) * 160;
                  return `L ${x} ${Math.max(20, y)}`;
                }).join(' ')} L 700 220 Z`}
                fill="url(#solarGrad)"
                opacity="0.3"
              />

              {/* Line path */}
              <path
                d={`M 0 ${200 - (timelinePoints[0].power / 12000) * 160} ${timelinePoints.map((pt, idx) => {
                  const x = (idx / (timelinePoints.length - 1)) * 700;
                  const y = 200 - (pt.power / 12000) * 160;
                  return `L ${x} ${Math.max(20, y)}`;
                }).join(' ')}`}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
              />

              {/* Current simHour scrub line */}
              <line
                x1={(simHour / LUNAR_CONSTANTS.SYNODIC_MONTH_HOURS) * 700}
                y1="10"
                x2={(simHour / LUNAR_CONSTANTS.SYNODIC_MONTH_HOURS) * 700}
                y2="220"
                stroke="#00f5d4"
                strokeWidth="2"
              />
              <circle
                cx={(simHour / LUNAR_CONSTANTS.SYNODIC_MONTH_HOURS) * 700}
                cy={Math.max(20, 200 - (powerOutputWatts / 12000) * 160)}
                r="5"
                fill="#00f5d4"
              />

              <defs>
                <linearGradient id="solarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2 border-t border-slate-800 pt-2">
            <span>HOUR 0h (SUNRISE)</span>
            <span>HOUR 354h (TRANSITION)</span>
            <span>HOUR 708.7h (FULL SYNODIC)</span>
          </div>
        </div>

        {/* Solar Array Sizing Calculator (4 cols) */}
        <div className="lg:col-span-4 hud-panel p-5 rounded-2xl border-cyan-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 border-b border-cyan-500/20 pb-3 mb-4">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-heading font-bold text-white tracking-wider">
                SOLAR ARRAY SIZING CALCULATOR
              </h3>
            </div>

            <div className="space-y-4">
              {/* Array Area Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">SOLAR ARRAY AREA (m²):</span>
                  <strong className="text-cyan-300">{arrayAreaM2} m²</strong>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="2"
                  value={arrayAreaM2}
                  onChange={(e) => setArrayAreaM2(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              {/* Cell Efficiency Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">CELL EFFICIENCY (%):</span>
                  <strong className="text-cyan-300">{arrayEfficiency}% (GaAs 3-Junction)</strong>
                </div>
                <input
                  type="range"
                  min="15"
                  max="35"
                  step="1"
                  value={arrayEfficiency}
                  onChange={(e) => setArrayEfficiency(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              {/* Recalculated Output Box */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Peak Array Power:</span>
                  <span className="text-amber-300 font-bold">
                    {((arrayAreaM2 * (arrayEfficiency / 100) * LUNAR_CONSTANTS.SOLAR_CONSTANT_W_M2) / 1000).toFixed(2)} kW
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Daily Energy Yield:</span>
                  <span className="text-emerald-400 font-bold">
                    {((arrayAreaM2 * (arrayEfficiency / 100) * LUNAR_CONSTANTS.SOLAR_CONSTANT_W_M2 * (site.solar.annualIlluminationPct / 100) * 24) / 1000).toFixed(1)} kWh/day
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Battery Required ({site.solar.longestDarknessDurationHours}h dark):</span>
                  <span className="text-purple-300 font-bold">{batteryRequirementKWh} kWh</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400">
            *Includes horizontal polar tracking and 1.5 kW continuous life support margin.
          </div>
        </div>
      </div>
    </div>
  );
}
