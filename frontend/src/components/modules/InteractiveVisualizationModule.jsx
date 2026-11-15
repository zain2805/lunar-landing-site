import React, { useState } from 'react';
import { CANDIDATE_SITES, LUNAR_CONSTANTS } from '../../data/lunarSitesData';
import LunarTerrain3D from '../3d/LunarTerrain3D';
import {
  Layers,
  Sun,
  Radio,
  Eye,
  Sliders,
  Maximize2,
  Compass,
  MapPin,
  Ruler,
  TrendingUp,
  Activity,
  Sparkles,
} from 'lucide-react';
import soundManager from '../audio/SoundManager';

export default function InteractiveVisualizationModule() {
  const [selectedSiteId, setSelectedSiteId] = useState('site-beta');
  const [activeLayer, setActiveLayer] = useState('elevation');
  const [measurementMode, setMeasurementMode] = useState(false);
  const [measurePointA, setMeasurePointA] = useState('Touchdown Center');
  const [measurePointB, setMeasurePointB] = useState('PSR Cold Trap Rim');

  const site = CANDIDATE_SITES.find(s => s.id === selectedSiteId) || CANDIDATE_SITES[0];

  const handleSelectSite = (id) => {
    soundManager.playClick();
    setSelectedSiteId(id);
  };

  const handleLayerChange = (layer) => {
    soundManager.playClick();
    setActiveLayer(layer);
  };

  return (
    <div className="space-y-6">
      {/* Module Title & Site Switcher for all 5 sites */}
      <div className="hud-panel p-5 rounded-2xl border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="tracking-widest uppercase">MODULE 08 • FULL-SANDBOX 3D VISUALIZATION ENGINE</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white tracking-wide">
            INTERACTIVE 3D LUNAR ENVIRONMENT SANDBOX
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1 font-sans">
            Full-fidelity scientific visualization sandbox. Explore real-time solar illumination transitions, slope gradient heatmaps, Earth line-of-sight vectors, and topographic cross-sections.
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

      {/* Main 3D Viewport Sandbox with Full Controls */}
      <div className="hud-panel p-5 rounded-2xl border-cyan-500/30 space-y-4">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-500/20 pb-3">
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono text-white font-bold tracking-wider">
              SANDBOX RENDERER: {site.name.toUpperCase()}
            </span>
          </div>

          {/* Scientific Layer Selector */}
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="text-slate-400 hidden sm:inline">DATA LAYER:</span>
            {['elevation', 'slope', 'illumination'].map(layer => (
              <button
                key={layer}
                onClick={() => handleLayerChange(layer)}
                className={`px-3 py-1.5 rounded-lg border uppercase transition-all ${
                  activeLayer === layer
                    ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-glow-cyan'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {layer}
              </button>
            ))}

            {/* Measurement tool toggle */}
            <button
              onClick={() => {
                soundManager.playClick();
                setMeasurementMode(!measurementMode);
              }}
              className={`px-3 py-1.5 rounded-lg border flex items-center space-x-1.5 transition-all ${
                measurementMode
                  ? 'bg-purple-600 text-white font-bold border-purple-400 shadow-glow-purple'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Ruler className="w-3.5 h-3.5" />
              <span>RULER</span>
            </button>
          </div>
        </div>

        {/* 3D Terrain Viewport */}
        <div className="h-[420px] sm:h-[480px] w-full rounded-xl overflow-hidden relative">
          <LunarTerrain3D site={site} activeLayer={activeLayer} onLayerChange={setActiveLayer} />

          {/* Interactive Ruler Overlay if enabled */}
          {measurementMode && (
            <div className="absolute top-4 right-4 z-20 max-w-xs p-4 rounded-xl bg-slate-950/90 border border-purple-500/50 shadow-glow-purple text-xs font-mono backdrop-blur-md corner-brackets">
              <div className="flex items-center space-x-2 text-purple-300 font-bold border-b border-purple-500/30 pb-2 mb-2">
                <Ruler className="w-4 h-4 text-purple-400" />
                <span>TERRAIN DISTANCE TOOL</span>
              </div>
              <div className="space-y-2 text-slate-300">
                <p>Point A: <strong>{measurePointA}</strong> (0 km)</p>
                <p>Point B: <strong>{measurePointB}</strong> (+{site.science.traverseDistanceToPSRKm} km)</p>
                <div className="p-2 rounded bg-purple-950/40 border border-purple-500/30 text-purple-200">
                  <p>• Geodesic Distance: <strong>{site.science.traverseDistanceToPSRKm} km</strong></p>
                  <p>• Elevation Change (Δz): <strong>-{site.coordinates.reliefM} m</strong></p>
                  <p>• Average Gradient: <strong>{(site.coordinates.reliefM / (site.science.traverseDistanceToPSRKm * 1000) * 100).toFixed(1)}%</strong></p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Surface Telemetry Readout */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono pt-2">
          <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">CENTER COORDINATES</span>
            <span className="text-white font-bold">{site.coordinates.latDMS}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">LOLA TOPOGRAPHIC RELIEF</span>
            <span className="text-cyan-300 font-bold">+{site.coordinates.reliefM} m</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">ILLUMINATION STABILITY</span>
            <span className="text-amber-300 font-bold">{(site.solar.illuminationStabilityIndex * 100).toFixed(0)}%</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">VOLATILE ACCESS PROXIMITY</span>
            <span className="text-emerald-400 font-bold">{site.science.traverseDistanceToPSRKm} km</span>
          </div>
        </div>
      </div>
    </div>
  );
}
