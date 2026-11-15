import React, { useState } from 'react';
import { CANDIDATE_SITES } from '../../data/lunarSitesData';
import { computeSuitabilityScore } from '../../data/scientificCalculations';
import {
  GitCompare,
  Sliders,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Info,
} from 'lucide-react';
import soundManager from '../audio/SoundManager';

export default function ComparisonEngineModule() {
  // Customizable Weights for MCDA / AHP
  const [weights, setWeights] = useState({
    solar: 0.22,
    comms: 0.20,
    slope: 0.25,
    boulders: 0.15,
    thermal: 0.10,
    waterIce: 0.08,
  });

  // Recompute scores dynamically with user weights
  const scoredSites = CANDIDATE_SITES.map(site => {
    const res = computeSuitabilityScore(site, weights);
    return {
      ...site,
      dynamicScore: res.weightedScore,
      safetyGated: res.safetyGated,
      safetyViolations: res.safetyViolations,
      breakdown: res.breakdown,
    };
  }).sort((a, b) => b.dynamicScore - a.dynamicScore);

  const bestCandidate = scoredSites[0]; // Malapert Mountain

  const handleWeightChange = (key, val) => {
    soundManager.playClick();
    setWeights(prev => ({ ...prev, [key]: parseFloat(val) }));
  };

  // 15 Parameter Comparative Tradeoff Matrix Definition
  const PARAMETERS_15 = [
    { label: '1. Coordinates (Lat, Lon)', getVal: s => `${s.coordinates.latitude}°, ${s.coordinates.longitude}°`, bestId: null },
    { label: '2. LOLA Elevation (m)', getVal: s => `${s.coordinates.elevationM > 0 ? '+' : ''}${s.coordinates.elevationM} m`, bestId: 'site-beta' },
    { label: '3. Solar Illumination (%)', getVal: s => `${s.solar.annualIlluminationPct}% (Peak ${s.solar.peakSummerIlluminationPct}%)`, bestId: 'site-alpha' },
    { label: '4. Sunlight Duration (hrs)', getVal: s => `${s.solar.sunlightDurationHours} hrs / 708.7h`, bestId: 'site-alpha' },
    { label: '5. Max Darkness Period (hrs)', getVal: s => `${s.solar.longestDarknessDurationHours} hrs (shorter is better)`, bestId: 'site-alpha' },
    { label: '6. Daily Solar Energy (kWh)', getVal: s => `${s.solar.dailyEnergyOutputKWh} kWh/day`, bestId: 'site-alpha' },
    { label: '7. Earth Visibility Direct LOS (%)', getVal: s => `${s.communication.earthVisibilityPct}%`, bestId: 'site-beta' },
    { label: '8. Longest Comms Blackout (hrs)', getVal: s => `${s.communication.longestBlackoutHours} hrs`, bestId: 'site-beta' },
    { label: '9. Mean Surface Slope (°)', getVal: s => `${s.terrain.avgSlopeDeg}° (Max ${s.terrain.maxSlopeInLandingZoneDeg}°)`, bestId: 'site-beta' },
    { label: '10. Surface Roughness (Hurst H)', getVal: s => `${s.terrain.surfaceRoughnessHurst}`, bestId: 'site-beta' },
    { label: '11. Crater Hazards (per km²)', getVal: s => `${s.terrain.craterDensityPerKm2} / km²`, bestId: 'site-beta' },
    { label: '12. Safe Landing Area (100m ellipse)', getVal: s => `${s.terrain.safeLandingAreaPct}%`, bestId: 'site-beta' },
    { label: '13. Surface Temperature Range', getVal: s => `${s.thermal.minTempK} K to ${s.thermal.maxTempK} K`, bestId: 'site-beta' },
    { label: '14. Thermal Suitability Score', getVal: s => `${s.thermal.thermalSuitabilityScore} / 100`, bestId: 'site-beta' },
    { label: '15. Overall Mission Verdict', getVal: s => s.summary.verdict, bestId: 'site-beta' },
  ];

  return (
    <div className="space-y-6">
      {/* Title & Overview Header */}
      <div className="hud-panel p-5 rounded-2xl border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
            <GitCompare className="w-4 h-4 text-cyan-400" />
            <span className="tracking-widest uppercase">MODULE 06 • FIVE CANDIDATE COMPARATIVE MATRIX</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white tracking-wide">
            FIVE-SITE COMPARISON ENGINE
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1 font-sans">
            Rigorous side-by-side trade-off analysis comparing all five South Polar locations across 15 scientific, environmental, and operational parameters.
          </p>
        </div>

        {/* Best Candidate Badge */}
        <div className="px-4 py-2.5 rounded-xl bg-cyan-950/90 border border-cyan-400 text-right shadow-glow-cyan">
          <span className="text-[10px] font-mono text-cyan-400 block uppercase font-bold">BEST CANDIDATE IDENTIFIED</span>
          <span className="text-sm font-heading font-extrabold text-white flex items-center space-x-1.5 mt-0.5">
            <Award className="w-4 h-4 text-amber-400" />
            <span>{bestCandidate.shortName} ({bestCandidate.dynamicScore} PTS)</span>
          </span>
        </div>
      </div>

      {/* Dynamic Weight Adjuster Bar */}
      <div className="hud-panel p-4 rounded-xl border-cyan-500/20">
        <div className="flex items-center space-x-2 text-xs font-mono text-cyan-300 mb-3">
          <Sliders className="w-3.5 h-3.5" />
          <span className="font-bold uppercase">DYNAMIC MULTI-CRITERIA DECISION WEIGHTING (AHP MODEL)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
          <div>
            <div className="flex justify-between text-[11px] text-slate-300 mb-1">
              <span>SOLAR ILLUM:</span>
              <strong className="text-amber-300">{(weights.solar * 100).toFixed(0)}%</strong>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.40"
              step="0.05"
              value={weights.solar}
              onChange={(e) => handleWeightChange('solar', e.target.value)}
              className="w-full accent-amber-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-slate-300 mb-1">
              <span>EARTH COMMS:</span>
              <strong className="text-cyan-300">{(weights.comms * 100).toFixed(0)}%</strong>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.40"
              step="0.05"
              value={weights.comms}
              onChange={(e) => handleWeightChange('comms', e.target.value)}
              className="w-full accent-cyan-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-slate-300 mb-1">
              <span>TERRAIN SLOPE:</span>
              <strong className="text-purple-300">{(weights.slope * 100).toFixed(0)}%</strong>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.40"
              step="0.05"
              value={weights.slope}
              onChange={(e) => handleWeightChange('slope', e.target.value)}
              className="w-full accent-purple-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-slate-300 mb-1">
              <span>BOULDERS:</span>
              <strong className="text-emerald-300">{(weights.boulders * 100).toFixed(0)}%</strong>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.30"
              step="0.05"
              value={weights.boulders}
              onChange={(e) => handleWeightChange('boulders', e.target.value)}
              className="w-full accent-emerald-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-slate-300 mb-1">
              <span>THERMAL ENV:</span>
              <strong className="text-blue-300">{(weights.thermal * 100).toFixed(0)}%</strong>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.25"
              step="0.05"
              value={weights.thermal}
              onChange={(e) => handleWeightChange('thermal', e.target.value)}
              className="w-full accent-blue-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-slate-300 mb-1">
              <span>VOLATILE ICE:</span>
              <strong className="text-pink-300">{(weights.waterIce * 100).toFixed(0)}%</strong>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.25"
              step="0.05"
              value={weights.waterIce}
              onChange={(e) => handleWeightChange('waterIce', e.target.value)}
              className="w-full accent-pink-400"
            />
          </div>
        </div>
      </div>

      {/* WHY MALAPERT MOUNTAIN IS THE BEST CANDIDATE (EVIDENCE-BASED EXPLANATION) */}
      <div className="hud-panel p-5 rounded-2xl border-cyan-400/50 bg-gradient-to-r from-cyan-950/40 via-slate-950/80 to-slate-900/60 corner-brackets">
        <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 font-bold mb-2">
          <Award className="w-4 h-4 text-amber-400" />
          <span>EVIDENCE-BASED RECOMMENDATION RATIONALE</span>
        </div>
        <h3 className="text-xl font-heading font-extrabold text-white">
          Why {bestCandidate.name} Is Evaluated As The Best Landing Site
        </h3>
        <p className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed mt-2 max-w-4xl">
          Based on multi-criteria decision analysis of LOLA altimetry, LROC boulder maps, and SPICE line-of-sight geometry across all five candidate landing zones:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-emerald-400 font-bold block mb-1">1. UNSURPASSED EARTH LINE-OF-SIGHT</span>
            <p className="text-slate-300 font-sans">
              Achieves <strong>93.8% continuous direct Earth visibility</strong> (compared to 82.5% for Shackleton and 79.4% for de Gerlache), with only 44h maximum blackout, eliminating early mission dependence on dedicated orbital relay satellites.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-purple-400 font-bold block mb-1">2. BENIGN TOPOGRAPHY & MAXIMUM SAFE AREA</span>
            <p className="text-slate-300 font-sans">
              Plateau slopes average only <strong>6.2°</strong> (well below the 8.0° landing safety limit), offering an expansive <strong>89.4% safe touchdown area</strong> within the 100m ellipse, unlike steep rim crests (12.8° slope at Shackleton).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-amber-400 font-bold block mb-1">3. ROBUST SOLAR & THERMAL VIABILITY</span>
            <p className="text-slate-300 font-sans">
              High <strong>78.6% annual illumination</strong> paired with short 54h eclipse shadows reduces cryogenic battery mass requirements to 81 kWh, significantly reducing total lander payload mass.
            </p>
          </div>
        </div>
      </div>

      {/* 15-PARAMETER SIDE-BY-SIDE COMPARISON TABLE ACROSS ALL 5 SITES */}
      <div className="hud-panel p-5 rounded-2xl border-cyan-500/30 overflow-hidden">
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-4">
          <h3 className="text-sm font-heading font-bold text-white tracking-wider">
            COMPLETE 15-PARAMETER SCIENTIFIC COMPARISON MATRIX
          </h3>
          <span className="text-xs font-mono text-cyan-400">
            5 SITES • NASA DATASETS
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400">
                <th className="p-3 bg-slate-950/60 sticky left-0 z-10">SCIENTIFIC PARAMETER</th>
                {CANDIDATE_SITES.map((site) => (
                  <th
                    key={site.id}
                    className={`p-3 text-center transition-all ${
                      site.id === bestCandidate.id ? 'bg-cyan-950/50 text-cyan-300 font-bold' : ''
                    }`}
                  >
                    <div>{site.shortName}</div>
                    <div className="text-[9px] text-slate-500 font-normal">RANK #{site.targetRank}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {PARAMETERS_15.map((param, pIdx) => (
                <tr key={pIdx} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-3 font-semibold text-slate-300 bg-slate-950/60 sticky left-0 z-10 whitespace-nowrap">
                    {param.label}
                  </td>
                  {CANDIDATE_SITES.map((site) => {
                    const val = param.getVal(site);
                    const isBest = param.bestId === site.id;
                    const isWinner = site.id === bestCandidate.id;
                    return (
                      <td
                        key={site.id}
                        className={`p-3 text-center whitespace-nowrap ${
                          isWinner ? 'bg-cyan-950/20' : ''
                        } ${isBest ? 'text-emerald-300 font-bold' : 'text-slate-300'}`}
                      >
                        {val}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {/* Overall Score Row */}
              <tr className="bg-slate-900/80 font-bold">
                <td className="p-3 text-white sticky left-0 z-10 bg-slate-900">
                  OVERALL AHP SCORE
                </td>
                {CANDIDATE_SITES.map((site) => {
                  const isTop = site.id === bestCandidate.id;
                  return (
                    <td
                      key={site.id}
                      className={`p-3 text-center text-sm ${
                        isTop ? 'text-amber-400 font-extrabold text-base' : 'text-slate-300'
                      }`}
                    >
                      {site.overallScore} / 100
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
