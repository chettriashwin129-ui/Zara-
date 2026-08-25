import { ViewType } from '../Sidebar';

interface HomeViewProps {
  setActiveView: (view: ViewType) => void;
}

export function HomeView({ setActiveView }: HomeViewProps) {
  return (
    <div className="flex-1 p-10 overflow-y-auto">
      <h2 className="text-3xl font-bold mb-6">Welcome Back, Ashwin</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          className="bg-[#18181B]/50 p-6 rounded-3xl border border-white/5 cursor-pointer hover:border-[#7C3AED]/50 transition-colors"
          onClick={() => setActiveView('Chats')}
        >
          <h3 className="text-lg font-semibold mb-2">Continue Conversation</h3>
          <p className="text-[#A1A1AA] text-sm">Pick up where you left off with Zara AI.</p>
        </div>
        
        <div 
          className="bg-[#18181B]/50 p-6 rounded-3xl border border-white/5 cursor-pointer hover:border-[#7C3AED]/50 transition-colors"
          onClick={() => setActiveView('Planner')}
        >
          <h3 className="text-lg font-semibold mb-2">Today's Focus</h3>
          <p className="text-[#A1A1AA] text-sm">Review your tasks and schedule.</p>
        </div>
        
        <div 
          className="bg-[#18181B]/50 p-6 rounded-3xl border border-white/5 cursor-pointer hover:border-[#7C3AED]/50 transition-colors"
          onClick={() => setActiveView('Projects')}
        >
          <h3 className="text-lg font-semibold mb-2">Active Projects</h3>
          <p className="text-[#A1A1AA] text-sm">Check progress on Zara AI Platform.</p>
        </div>
      </div>
    </div>
  );
}
