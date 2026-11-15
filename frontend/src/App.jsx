import React, { useState } from 'react';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import CinematicOpening from './components/cinematic/CinematicOpening';
import CinematicRocketDeployment from './components/cinematic/CinematicRocketDeployment';
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
  const [deployingSite, setDeployingSite] = useState(null);

  const handleSelectSite = (siteId) => {
    setSelectedSiteId(siteId);
    setActiveModule('explorer');
  };

  const handleDeployRocket = (siteName) => {
    setDeployingSite(siteName);
  };

  if (showIntro) {
    return <CinematicOpening onComplete={() => setShowIntro(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <Header onReplayIntro={() => setShowIntro(true)} activeModule={activeModule} />
      
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar activeModule={activeModule} onSelectModule={setActiveModule} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 ml-0 md:ml-64 bg-gradient-to-b from-[#050b1a]/40 to-[#030712]">
          {activeModule === 'dashboard' && (
            <DashboardModule 
              onSelectSite={handleSelectSite} 
              onNavigateModule={setActiveModule} 
              onDeploy={handleDeployRocket} 
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
        </main>
      </div>

      {deployingSite && (
        <CinematicRocketDeployment 
          siteName={deployingSite} 
          onComplete={() => setDeployingSite(null)} 
        />
      )}
    </div>
  );
}
