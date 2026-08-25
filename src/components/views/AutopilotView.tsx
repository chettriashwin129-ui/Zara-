import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { Automation, AutomationLog } from '../../types';
import { Zap, Activity, Plus, Trash2, Clock, CheckCircle2, PauseCircle, PlayCircle } from 'lucide-react';

export function AutopilotView() {
  const { data: automations, fetchAll: mutateAutomations } = useApi<Automation>('automations');
  const { data: logs, fetchAll: mutateLogs } = useApi<AutomationLog>('automation_logs');
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAuto, setNewAuto] = useState({ name: '', trigger: 'daily', condition: '', action: '' });
  const [autopilotActive, setAutopilotActive] = useState(true);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuto.name || !newAuto.action) return;
    
    await fetch('/api/automations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAuto)
    }).catch(err => console.error(err));
    
    await fetch('/api/automation_logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `Created automation: ${newAuto.name}` })
    }).catch(err => console.error(err));
    
    setNewAuto({ name: '', trigger: 'daily', condition: '', action: '' });
    setShowAddForm(false);
    mutateAutomations();
    mutateLogs();
  };

  const handleDelete = async (id: string, name: string) => {
    await fetch(`/api/automations/${id}`, { method: 'DELETE' }).catch(err => console.error(err));
    await fetch('/api/automation_logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `Deleted automation: ${name}` })
    }).catch(err => console.error(err));
    mutateAutomations();
    mutateLogs();
  };
  
  const clearHistory = async () => {
    await fetch('/api/automation_logs', { method: 'DELETE' }).catch(err => console.error(err));
    mutateLogs();
  };

  return (
    <div className="flex-1 overflow-y-auto p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Zap className="w-8 h-8 text-[#7C3AED]" />
              Automation Center
            </h1>
            <p className="text-[#A1A1AA]">Manage Zara's proactive behaviors and routines.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setAutopilotActive(!autopilotActive)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors border ${
                autopilotActive 
                  ? 'bg-[#18181B] border-[#7C3AED]/30 text-[#7C3AED] hover:bg-[#7C3AED]/10' 
                  : 'bg-[#18181B] border-white/10 text-[#A1A1AA] hover:bg-white/5'
              }`}
            >
              {autopilotActive ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
              {autopilotActive ? 'Pause Autopilot' : 'Resume Autopilot'}
            </button>
            <button 
              onClick={() => setShowAddForm(true)}
              className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Automation
            </button>
          </div>
        </div>

        {showAddForm && (
          <form onSubmit={handleAdd} className="bg-[#18181B] border border-white/5 p-6 rounded-2xl space-y-4">
            <h3 className="text-lg font-semibold border-b border-white/5 pb-4">Create Automation</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-[#A1A1AA] uppercase tracking-wider">Name</label>
                <input 
                  type="text" 
                  className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#7C3AED]/50" 
                  value={newAuto.name}
                  onChange={e => setNewAuto({...newAuto, name: e.target.value})}
                  placeholder="e.g. Morning Summary"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-[#A1A1AA] uppercase tracking-wider">Trigger</label>
                <select 
                  className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#7C3AED]/50"
                  value={newAuto.trigger}
                  onChange={e => setNewAuto({...newAuto, trigger: e.target.value})}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="one-time">One-Time</option>
                  <option value="context">Context Change</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-[#A1A1AA] uppercase tracking-wider">Condition (Optional)</label>
              <input 
                type="text" 
                className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#7C3AED]/50" 
                value={newAuto.condition}
                onChange={e => setNewAuto({...newAuto, condition: e.target.value})}
                placeholder="e.g. Only on weekdays"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-[#A1A1AA] uppercase tracking-wider">Action</label>
              <input 
                type="text" 
                className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#7C3AED]/50" 
                value={newAuto.action}
                onChange={e => setNewAuto({...newAuto, action: e.target.value})}
                placeholder="e.g. Generate and display morning priority list"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-sm font-medium text-[#A1A1AA] hover:text-white"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="bg-white text-black px-4 py-2 rounded-xl text-sm font-semibold hover:bg-white/90"
              >
                Create Rule
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#A1A1AA]" />
              Active Rules
            </h2>
            
            {automations.length === 0 ? (
              <p className="text-[#A1A1AA] text-sm">No automations configured yet.</p>
            ) : (
              <div className="space-y-3">
                {automations.map(auto => (
                  <div key={auto.id} className="bg-[#18181B] border border-white/5 p-4 rounded-2xl flex items-center justify-between group">
                    <div>
                      <h3 className="font-medium mb-1">{auto.name}</h3>
                      <div className="flex gap-3 text-xs text-[#A1A1AA]">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {auto.trigger}</span>
                        {auto.condition && <span>• {auto.condition}</span>}
                        <span>• {auto.action}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDelete(auto.id, auto.name)}
                      className="text-[#A1A1AA] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#A1A1AA]" />
                Zara Activity
              </h2>
              {logs.length > 0 && (
                <button 
                  onClick={clearHistory}
                  className="text-xs text-[#A1A1AA] hover:text-white transition-colors"
                >
                  Clear History
                </button>
              )}
            </div>
            <div className="bg-[#18181B] border border-white/5 p-4 rounded-2xl space-y-3 h-[400px] overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-xs text-[#A1A1AA]">No recent autopilot activity.</p>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#7C3AED] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-white/90">{log.message}</p>
                      <span className="text-[10px] text-[#A1A1AA]">{new Date(log.created_at).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
