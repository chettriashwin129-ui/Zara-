import { useState } from 'react';
import { Sidebar, ViewType } from './components/Sidebar';
import { Header } from './components/Header';
import { RightPanel } from './components/RightPanel';
import { ChatView } from './components/views/ChatView';
import { MemoryView } from './components/views/MemoryView';
import { PlannerView } from './components/views/PlannerView';
import { GoalsView } from './components/views/GoalsView';
import { ProjectsView } from './components/views/ProjectsView';
import { LearnView } from './components/views/LearnView';
import { SettingsView } from './components/views/SettingsView';
import { HomeView } from './components/views/HomeView';
import { AutopilotView } from './components/views/AutopilotView';

export default function App() {
  const [activeView, setActiveView] = useState<ViewType>('Chats');

  return (
    <div className="flex h-screen bg-[#09090B] text-white font-sans overflow-hidden selection:bg-[#7C3AED]/30">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Background Gradients */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#7C3AED]/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <Header />
        
        <div className="flex-1 flex overflow-hidden">
          {/* Main Content Area */}
          
          {activeView === 'Chats' && <ChatView />}
          {activeView === 'Home' && <HomeView setActiveView={setActiveView} />}
          {activeView === 'Memory' && <MemoryView />}
          {activeView === 'Planner' && <PlannerView />}
          {activeView === 'Goals' && <GoalsView />}
          {activeView === 'Projects' && <ProjectsView />}
          {activeView === 'Learn' && <LearnView />}
          {activeView === 'Settings' && <SettingsView />}
          {activeView === 'Autopilot' && <AutopilotView />}
          <RightPanel activeView={activeView} />
        </div>
      </main>
    </div>
  );
}
