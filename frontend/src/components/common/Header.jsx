import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Mic, MicOff, Radio, Clock, ShieldAlert, Sparkles, Orbit } from 'lucide-react';
import soundManager from '../audio/SoundManager';
import { DATASET_METADATA } from '../../data/lunarSitesData';

export default function Header({ onReplayIntro, activeModule }) {
  const [metSeconds, setMetSeconds] = useState(148290); // Mission Elapsed Time in seconds
  const [isMuted, setIsMuted] = useState(false);
  const [narrationMuted, setNarrationMuted] = useState(false);
  const [showMetadataModal, setShowMetadataModal] = useState(false);

  // MET Clock tick
  useEffect(() => {
    const timer = setInterval(() => {
      setMetSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatMET = (totalSec) => {
    const d = Math.floor(totalSec / 86400);
    const h = Math.floor((totalSec % 86400) / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `T+${String(d).padStart(2, '0')}d ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleMuteToggle = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
    soundManager.playClick();
  };

  const handleNarrationToggle = () => {
    const muted = soundManager.toggleNarration();
    setNarrationMuted(muted);
    soundManager.playClick();
  };

  return (
    <>
      <header className="h-16 border-b border-cyan-500/20 bg-slate-950/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-20 shrink-0 select-none">
        {/* Left: Branding & Mission Badge */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center p-1.5 shadow-glow-cyan border border-cyan-400/40">
              <Orbit className="w-full h-full text-white animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-heading font-extrabold text-sm sm:text-base text-white tracking-wider">
                  NASA MOON TREK
                </span>
                <span className="hidden md:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  LOLA-LROC v2.8
                </span>
              </div>
              <p className="text-[10px] font-mono text-cyan-400/70 tracking-widest uppercase hidden sm:block">
                LUNAR LANDING SITE NAVIGATOR • SOUTH POLAR SECTOR
              </p>
            </div>
          </div>
        </div>

        {/* Center: Mission Elapsed Time (MET) & Subsolar Point Status */}
        <div className="hidden lg:flex items-center space-x-6 text-xs font-mono">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-slate-900/80 border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">MET:</span>
            <span className="text-cyan-300 font-bold tracking-wider">{formatMET(metSeconds)}</span>
          </div>

          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-slate-900/80 border border-slate-800">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-slate-400">DSN GOLDSTONE:</span>
            <span className="text-emerald-400 font-bold">LOCKED (98%)</span>
          </div>

          <button
            onClick={() => setShowMetadataModal(true)}
            className="text-slate-400 hover:text-cyan-300 transition-colors flex items-center space-x-1"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>DATASETS: NASA PDS</span>
          </button>
        </div>

        {/* Right: Audio Controls & Intro Replay */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Narration toggle */}
          <button
            onClick={handleNarrationToggle}
            className={`p-2 rounded-lg border text-xs font-mono transition-all backdrop-blur-md flex items-center space-x-1.5 ${
              narrationMuted
                ? 'border-red-500/30 bg-red-950/30 text-red-400'
                : 'border-cyan-500/30 bg-cyan-950/30 text-cyan-300 hover:border-cyan-400'
            }`}
            title={narrationMuted ? 'Voice Narration Muted' : 'Voice Narration Enabled'}
          >
            {narrationMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            <span className="hidden xl:inline text-[11px]">{narrationMuted ? 'VOICE OFF' : 'VOICE ON'}</span>
          </button>

          {/* Sound Mute Button */}
          <button
            onClick={handleMuteToggle}
            className={`p-2 rounded-lg border text-xs font-mono transition-all backdrop-blur-md flex items-center space-x-1.5 ${
              isMuted
                ? 'border-red-500/30 bg-red-950/30 text-red-400'
                : 'border-cyan-500/30 bg-cyan-950/30 text-cyan-300 hover:border-cyan-400'
            }`}
            title={isMuted ? 'Unmute Audio' : 'Mute Master Audio'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span className="hidden xl:inline text-[11px]">{isMuted ? 'MUTED' : 'AUDIO'}</span>
          </button>

          {/* Replay Cinematic Opening Button */}
          <button
            onClick={() => {
              soundManager.playClick();
              onReplayIntro();
            }}
            className="px-3 py-1.5 rounded-lg border border-cyan-500/40 bg-gradient-to-r from-cyan-950/60 to-blue-950/60 text-cyan-300 hover:text-white hover:border-cyan-400 font-mono text-xs flex items-center space-x-1.5 transition-all shadow-glow-cyan"
            title="Replay Cinematic 3D Opening"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">REPLAY INTRO</span>
          </button>
        </div>
      </header>

      {/* Dataset & Ephemeris Verification Modal */}
      {showMetadataModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-slate-950 border border-cyan-500/40 rounded-xl p-6 shadow-glow-cyan corner-brackets">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-4">
              <h3 className="font-heading font-bold text-lg text-white">
                SCIENTIFIC DATASET PROVENANCE
              </h3>
              <button
                onClick={() => setShowMetadataModal(false)}
                className="text-slate-400 hover:text-white font-mono text-sm"
              >
                ✕ CLOSE
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {DATASET_METADATA.sources.map((src, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-mono font-bold text-cyan-300">{src.name}</h4>
                    <p className="text-[11px] text-slate-400">{src.resolution || src.measurement || src.kernel}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                    {src.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="text-[11px] font-mono text-slate-400 bg-slate-900/50 p-3 rounded border border-slate-800 mb-4">
              <p>• Reference Datum: Mean Earth/Polar Axis (ME) 1,737.4 km Sphere</p>
              <p>• Solar Constant: 1,361.0 W/m² (1 AU Solar Irradiance)</p>
              <p>• SPICE NAIF Ephemeris: de440s Lunar Precision Kernel</p>
            </div>

            <button
              onClick={() => setShowMetadataModal(false)}
              className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-heading text-xs tracking-wider uppercase transition-all"
            >
              ACKNOWLEDGE TELEMETRY
            </button>
          </div>
        </div>
      )}
    </>
  );
}
