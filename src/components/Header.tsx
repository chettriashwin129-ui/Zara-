import { Search, Bell, Command, ChevronDown } from 'lucide-react';

export function Header() {
  return (
    <header className="h-16 border-b border-white/5 bg-[#09090B]/50 backdrop-blur-xl flex items-center justify-between px-6 z-10 flex-shrink-0">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-white tracking-tight">Good evening, Ashwin.</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-[#18181B] border border-white/5 px-3 py-1.5 rounded-full text-[#A1A1AA] hover:border-white/10 transition-colors cursor-pointer">
          <Search className="w-4 h-4" />
          <span className="text-xs font-medium px-2">Search anything...</span>
          <div className="flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded text-[10px] font-bold">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-[#A1A1AA] hover:text-white transition-colors rounded-full hover:bg-white/5">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#7C3AED] rounded-full border border-[#09090B]"></span>
        </button>

        <div className="w-px h-6 bg-white/10 mx-1"></div>

        {/* Model Selector / Settings */}
        <button className="flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full transition-colors border border-white/5">
          <div className="w-2 h-2 rounded-full bg-[#22C55E]"></div>
          Zara Prime
          <ChevronDown className="w-4 h-4 text-[#A1A1AA]" />
        </button>
      </div>
    </header>
  );
}
