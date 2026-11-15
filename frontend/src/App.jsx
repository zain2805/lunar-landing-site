import React, { useState } from 'react';
import CinematicOpening from './components/cinematic/CinematicOpening';
import Header from './components/common/Header';
import Sidebar, { MODULES } from './components/common/Sidebar';
import Astronaut3D from './components/common/Astronaut3D';
import soundManager from './components/audio/SoundManager';

// 8 Main Website Modules
import DashboardModule from './components/modules/DashboardModule';
import SiteExplorerModule from './components/modules/SiteExplorerModule';
import SolarAnalysisModule from './components/modules/SolarAnalysisModule';
import CommunicationAnalysisModule from './components/modules/CommunicationAnalysisModule';
import TerrainAnalysisModule from './components/modules/TerrainAnalysisModule';
import ComparisonEngineModule from './components/modules/ComparisonEngineModule';
import AIRecommendationModule from './components/modules/AIRecommendationModule';
import InteractiveVisualizationModule from './components/modules/InteractiveVisualizationModule';

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [activeModule, setActiveModule] = useState('dashboard');
  const [selectedSiteId, setSelectedSiteId] = useState('site-beta');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [backendStatus] = useState('ONLINE');

  // Handle module navigation
  const handleSelectModule = (moduleId) => {
    setActiveModule(moduleId);
    setSidebarOpen(false);
  };

  // Replay the cinematic opening
  const handleReplayIntro = () => {
    setShowIntro(true);
  };

  // When cinematic intro completes
  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans select-none antialiased relative overflow-hidden">
      {/* REQUIREMENT 10: REAL 3D FLOATING ASTRONAUT (BIG MAN) THROUGHOUT WEBSITE */}
      <Astronaut3D />

      {/* REQUIREMENT 1: 360° SOLAR SYSTEM CINEMATIC OPENING */}
      {showIntro ? (
        <CinematicOpening onComplete={handleIntroComplete} />
      ) : (
        /* MAIN DASHBOARD & 8 SCIENTIFIC MODULES */
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-20">
          {/* Top Aerospace Header */}
          <Header
            onReplayIntro={handleReplayIntro}
            activeModule={activeModule}
            backendStatus={backendStatus}
          />

          {/* Main Layout Area: Navigation Sidebar + Module Content */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Sidebar Navigation */}
            <Sidebar
              activeModule={activeModule}
              onSelectModule={handleSelectModule}
              isOpen={sidebarOpen}
              onToggleOpen={() => setSidebarOpen(!sidebarOpen)}
            />

            {/* Mobile Sidebar Backdrop */}
            {sidebarOpen && (
              <div
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm md:hidden"
              />
            )}

            {/* Main Content Workspace */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-grid-bg custom-scrollbar relative">
              {/* Mobile Sidebar Toggle Button */}
              <div className="md:hidden flex items-center justify-between pb-4 mb-2 border-b border-cyan-500/20">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-slate-900/80 text-xs font-mono text-cyan-300 flex items-center space-x-2"
                >
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span>OPEN MODULE MENU</span>
                </button>

                <span className="text-[11px] font-mono text-slate-400">
                  {MODULES.find(m => m.id === activeModule)?.label}
                </span>
              </div>

              {/* Module Routing Engine */}
              {activeModule === 'dashboard' && (
                <DashboardModule
                  onSelectSite={(id) => setSelectedSiteId(id)}
                  onNavigateModule={handleSelectModule}
                />
              )}

              {activeModule === 'explorer' && (
                <SiteExplorerModule initialSiteId={selectedSiteId} />
              )}

              {activeModule === 'solar' && (
                <SolarAnalysisModule />
              )}

              {activeModule === 'communication' && (
                <CommunicationAnalysisModule />
              )}

              {activeModule === 'terrain' && (
                <TerrainAnalysisModule />
              )}

              {activeModule === 'comparison' && (
                <ComparisonEngineModule />
              )}

              {activeModule === 'recommendation' && (
                <AIRecommendationModule />
              )}

              {activeModule === 'visualization' && (
                <InteractiveVisualizationModule />
              )}

              {/* Mission Footer */}
              <footer className="mt-12 pt-6 border-t border-cyan-500/10 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-500 gap-2">
                <div>
                  LUNAR LANDING SITE NAVIGATOR • SOUTH POLAR SECTOR
                </div>
                <div className="flex items-center space-x-3">
                  <span>NASA PDS & LOLA 5M DEM</span>
                  <span>•</span>
                  <span>EPHEMERIS DE440S</span>
                  <span>•</span>
                  <span className="text-emerald-400">
                    STATUS: OPERATIONAL
                  </span>
                </div>
              </footer>
            </main>
          </div>
        </div>
      )}
    </div>
  );
}
