import { BrainCircuit, CheckCircle2, FolderKanban, FileText, Zap, Activity } from 'lucide-react';
import { ViewType } from './Sidebar';
import { useApi } from '../hooks/useApi';
import { DbMemory, DbProject, DbTask, AutopilotSuggestion } from '../types';

interface RightPanelProps {
  activeView: ViewType;
}

export function RightPanel({ activeView }: RightPanelProps) {
  const { data: memories } = useApi<DbMemory>('memories');
  const { data: projects } = useApi<DbProject>('projects');
  const { data: tasks } = useApi<DbTask>('planner_tasks');
  const { data: suggestions, fetchAll: mutateSuggestions } = useApi<AutopilotSuggestion>('autopilot_suggestions');
  
  const activeProject = projects.find(p => p.active) || projects[0];

  const handleAction = async (id: string, action: string) => {
    // In a full implementation, this would route to different views based on action
    await fetch(`/api/autopilot_suggestions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'accepted' })
    }).catch(err => console.error(err));
    
    await fetch('/api/automation_logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `User approved automation: ${action}` })
    }).catch(err => console.error(err));
    mutateSuggestions();
  };
  
  const handleDismiss = async (id: string) => {
    await fetch(`/api/autopilot_suggestions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'dismissed' })
    }).catch(err => console.error(err));
    mutateSuggestions();
  };

  return (
    <aside className="w-80 h-full bg-[#18181B]/30 border-l border-white/5 flex-col hidden lg:flex overflow-y-auto">
      <div className="p-6 space-y-8">
        
        {/* Dynamic Context Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-[#7C3AED]" />
            <h2 className="text-sm font-semibold text-white">Zara Brain</h2>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-[#18181B] rounded-full border border-white/5">
            <span className="text-[10px] font-medium text-[#A1A1AA]">Zara Autopilot <span className="text-[#22C55E]">● Active</span></span>
          </div>
        </div>

        {/* ⚡ Autopilot Suggestions */}
        {suggestions.length > 0 && (
          <section className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#7C3AED]/20 to-transparent blur-xl rounded-2xl pointer-events-none"></div>
            <h3 className="text-xs font-semibold text-[#7C3AED] uppercase tracking-wider flex items-center gap-2 mb-3 relative z-10">
              <Zap className="w-3.5 h-3.5" />
              ZARA ACTION
            </h3>
            <p className="text-xs text-[#A1A1AA] mb-3 relative z-10">Recommended:</p>
            <div className="space-y-3 relative z-10">
              {suggestions.map((sug) => (
                <div key={sug.id} className="bg-gradient-to-br from-[#18181B] to-[#18181B]/80 border border-[#7C3AED]/30 p-4 rounded-2xl shadow-lg">
                  <p className="text-sm text-white/90 font-medium mb-1">{sug.title}</p>
                  <p className="text-xs text-[#A1A1AA] mb-4">"{sug.reason}"</p>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleAction(sug.id, sug.action)}
                      className="flex-1 bg-white hover:bg-white/90 text-black text-xs font-semibold py-2 rounded-lg transition-colors text-center"
                    >
                      {sug.action.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </button>
                    <button 
                      onClick={() => handleDismiss(sug.id)}
                      className="px-3 py-2 text-xs font-medium text-[#A1A1AA] hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* AI Memory - Show in Chats, Home, Memory */}
        {['Home', 'Chats', 'Memory', 'Settings'].includes(activeView) && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider flex items-center gap-2">
                <BrainCircuit className="w-3.5 h-3.5" />
                Active Context
              </h3>
              <span className="w-2 h-2 rounded-full bg-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
            </div>
            <div className="space-y-2">
              {memories.slice(0, 3).map((memory) => (
                <div key={memory.id} className="bg-[#18181B] border border-white/5 p-3 rounded-2xl hover:border-white/10 transition-colors">
                  <p className="text-sm text-white/90 mb-1">{memory.category}</p>
                  <p className="text-xs text-[#A1A1AA]">{memory.content}</p>
                </div>
              ))}
              {memories.length === 0 && (
                <p className="text-xs text-[#A1A1AA]">No memories available.</p>
              )}
            </div>
          </section>
        )}

        {/* Today's Goals & Planner - Show in Home, Planner, Goals */}
        {['Home', 'Planner', 'Goals', 'Projects'].includes(activeView) && (
          <section>
            <h3 className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Focus Actions
            </h3>
            <div className="space-y-3">
              {tasks.slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-center gap-3 group">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${task.completed ? 'bg-[#7C3AED] border-[#7C3AED]' : 'border-white/20 group-hover:border-white/50'}`}>
                    {task.completed ? <CheckCircle2 className="w-3 h-3 text-white" /> : null}
                  </div>
                  <span className={`text-sm ${task.completed ? 'text-[#A1A1AA] line-through' : 'text-white/90'}`}>{task.title}</span>
                </div>
              ))}
              {tasks.length === 0 && <p className="text-xs text-[#A1A1AA]">No active tasks.</p>}
            </div>
          </section>
        )}

        {/* Current Project - Show everywhere except settings */}
        {activeView !== 'Settings' && (
          <section>
            <h3 className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider flex items-center gap-2 mb-4">
              <FolderKanban className="w-3.5 h-3.5" />
              Current Project
            </h3>
            <div className="bg-gradient-to-br from-[#7C3AED]/10 to-[#4F46E5]/10 border border-[#7C3AED]/20 p-4 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#7C3AED]/20 blur-2xl rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
              {activeProject ? (
                <>
                  <h4 className="text-sm font-semibold text-white mb-1">{activeProject.title}</h4>
                  <p className="text-xs text-[#A1A1AA] mb-3">{activeProject.progress}% completed</p>
                  <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] rounded-full" style={{ width: `${activeProject.progress}%` }}></div>
                  </div>
                </>
              ) : (
                <p className="text-xs text-[#A1A1AA]">No active project.</p>
              )}
            </div>
          </section>
        )}

        {/* Quick Actions */}
        <section>
          <h3 className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider flex items-center gap-2 mb-4">
            <Zap className="w-3.5 h-3.5" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <button className="bg-[#18181B] border border-white/5 p-3 rounded-xl hover:bg-white/5 transition-all text-left group">
              <FileText className="w-4 h-4 text-[#A1A1AA] mb-2 group-hover:text-[#7C3AED] transition-colors" />
              <span className="text-xs font-medium text-white/90">New Note</span>
            </button>
            <button className="bg-[#18181B] border border-white/5 p-3 rounded-xl hover:bg-white/5 transition-all text-left group">
              <Zap className="w-4 h-4 text-[#A1A1AA] mb-2 group-hover:text-[#7C3AED] transition-colors" />
              <span className="text-xs font-medium text-white/90">Automate</span>
            </button>
          </div>
        </section>
      </div>
    </aside>
  );
}
