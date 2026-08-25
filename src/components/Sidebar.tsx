import { Home, MessageSquare, Brain, Calendar, Target, Folder, BookOpen, Settings, User, Zap } from 'lucide-react';

export type ViewType = 'Home' | 'Chats' | 'Memory' | 'Planner' | 'Goals' | 'Projects' | 'Learn' | 'Settings' | 'Autopilot';

interface SidebarProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
}

export function Sidebar({ activeView, setActiveView }: SidebarProps) {
  const navItems: { icon: any; label: ViewType; customIcon?: boolean }[] = [
    { icon: Home, label: 'Home' },
    { icon: MessageSquare, label: 'Chats' },
    { icon: Brain, label: 'Memory' },
    { icon: Calendar, label: 'Planner' },
    { icon: Target, label: 'Goals' },
    { icon: Folder, label: 'Projects' },
    { icon: BookOpen, label: 'Learn' },
    { icon: Zap, label: 'Autopilot' },
  ];

  return (
    <aside className="w-64 h-full bg-[#18181B]/50 backdrop-blur-xl border-r border-white/5 flex flex-col z-20 flex-shrink-0 hidden md:flex">
      {/* Logo & Branding */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] flex items-center justify-center shadow-lg shadow-[#7C3AED]/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/20 blur-md transform translate-y-[-50%] translate-x-[-50%] rounded-full"></div>
          <span className="font-bold text-white tracking-tighter relative z-10 text-lg">ZA</span>
        </div>
        <div>
          <h1 className="font-semibold text-[15px] leading-tight tracking-tight text-white">Zara AI</h1>
          <p className="text-[11px] text-[#A1A1AA] font-medium tracking-wide">OS VERSION 2.0</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item, idx) => {
          const isActive = activeView === item.label;
          return (
            <button
              key={idx}
              onClick={() => setActiveView(item.label)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-[#7C3AED]/10 text-[#7C3AED]'
                  : 'text-[#A1A1AA] hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className={`w-4 h-4 ${isActive ? 'text-[#7C3AED]' : 'text-[#A1A1AA] group-hover:text-white'}`} />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 space-y-2 border-t border-white/5">
        <button 
          onClick={() => setActiveView('Settings')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
            activeView === 'Settings'
              ? 'bg-[#7C3AED]/10 text-[#7C3AED]'
              : 'text-[#A1A1AA] hover:bg-white/5 hover:text-white'
          }`}
        >
          <Settings className={`w-4 h-4 ${activeView === 'Settings' ? 'text-[#7C3AED]' : 'text-[#A1A1AA] group-hover:text-white'}`} />
          <span className="text-sm font-medium">Settings</span>
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#A1A1AA] hover:bg-white/5 hover:text-white transition-all duration-200 group">
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 flex items-center justify-center text-white text-[10px] font-bold">
            AC
          </div>
          <span className="text-sm font-medium">Ashwin Chhetri</span>
        </button>
      </div>
    </aside>
  );
}
