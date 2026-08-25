import { useState, useEffect } from 'react';
import { voiceEngine } from '../../lib/VoiceEngine';
import { Volume2, Play, Square, Pause } from 'lucide-react';
import { Settings, Database, User, Palette } from 'lucide-react';
import { useApi } from '../../hooks/useApi';

export function SettingsView() {
  const { clearAll: clearMemories } = useApi('memories');
  const { clearAll: clearTasks } = useApi('planner_tasks');
  const { clearAll: clearGoals } = useApi('goals');
  const { clearAll: clearProjects } = useApi('projects');
  const { clearAll: clearTopics } = useApi('learn_topics');
  const [voiceSettings, setVoiceSettings] = useState(voiceEngine.settings);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  useEffect(() => {
    setVoices(voiceEngine.getVoices());
    const handleVoicesChanged = () => setVoices(voiceEngine.getVoices());
    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
  }, []);

  const updateVoiceSettings = (updates: Partial<typeof voiceEngine.settings>) => {
    voiceEngine.saveSettings(updates);
    setVoiceSettings({ ...voiceEngine.settings });
  };


  const handleFactoryReset = () => {
    if (window.confirm('WARNING: This will permanently delete ALL data (memories, tasks, goals, projects, notes). Are you absolutely sure?')) {
      clearMemories();
      clearTasks();
      clearGoals();
      clearProjects();
      clearTopics();
      alert('All local data cleared successfully.');
    }
  };

  return (
    <div className="flex-1 p-10 overflow-y-auto">
      <h2 className="text-3xl font-bold flex items-center gap-3 mb-8">
        <Settings className="w-8 h-8 text-[#7C3AED]" />
        Settings
      </h2>

      <div className="max-w-2xl space-y-8">
        
        {/* Profile */}
        <section className="bg-[#18181B]/50 p-6 rounded-3xl border border-white/5">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-[#7C3AED]" /> Profile
          </h3>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 flex items-center justify-center text-white text-xl font-bold">
              AC
            </div>
            <div>
              <p className="font-medium text-white text-lg">Ashwin Chhetri</p>
              <p className="text-sm text-[#A1A1AA]">Admin</p>
            </div>
          </div>
        </section>

        
        {/* Voice Settings */}
        <section className="bg-[#18181B]/50 p-6 rounded-3xl border border-white/5">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Volume2 className="w-5 h-5 text-[#7C3AED]" /> Voice (Text-to-Speech)
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">Enable Voice</span>
              <button 
                onClick={() => updateVoiceSettings({ enabled: !voiceSettings.enabled })}
                className={`w-12 h-6 rounded-full transition-colors relative ${voiceSettings.enabled ? 'bg-[#7C3AED]' : 'bg-white/10'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${voiceSettings.enabled ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">Auto-speak responses</span>
              <button 
                onClick={() => updateVoiceSettings({ autoSpeak: !voiceSettings.autoSpeak })}
                className={`w-12 h-6 rounded-full transition-colors relative ${voiceSettings.autoSpeak ? 'bg-[#7C3AED]' : 'bg-white/10'}`}
                disabled={!voiceSettings.enabled}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${voiceSettings.autoSpeak ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>

            <div>
              <label className="text-white font-medium block mb-2">Speech Speed ({voiceSettings.speed.toFixed(1)}x)</label>
              <input 
                type="range" min="0.5" max="2" step="0.1" 
                value={voiceSettings.speed} 
                onChange={(e) => updateVoiceSettings({ speed: parseFloat(e.target.value) })}
                className="w-full accent-[#7C3AED]"
                disabled={!voiceSettings.enabled}
              />
            </div>
            
            <div>
              <label className="text-white font-medium block mb-2">Volume ({(voiceSettings.volume * 100).toFixed(0)}%)</label>
              <input 
                type="range" min="0" max="1" step="0.1" 
                value={voiceSettings.volume} 
                onChange={(e) => updateVoiceSettings({ volume: parseFloat(e.target.value) })}
                className="w-full accent-[#7C3AED]"
                disabled={!voiceSettings.enabled}
              />
            </div>

            <div>
              <label className="text-white font-medium block mb-2">Voice</label>
              <select 
                value={voiceSettings.voiceURI}
                onChange={(e) => updateVoiceSettings({ voiceURI: e.target.value })}
                className="w-full bg-[#18181B] border border-white/10 text-white rounded-xl p-2 outline-none focus:border-[#7C3AED]"
                disabled={!voiceSettings.enabled}
              >
                {voices.map(v => (
                  <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>
                ))}
              </select>
            </div>
            
            <div className="pt-2 flex gap-2">
               <button onClick={() => voiceEngine.speak("Hello. I am Zara. This is how I sound.", true)} disabled={!voiceSettings.enabled} className="flex-1 bg-white/5 hover:bg-white/10 text-white p-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
                 <Play className="w-4 h-4" /> Test Voice
               </button>
               <button onClick={() => voiceEngine.stop()} disabled={!voiceSettings.enabled} className="bg-white/5 hover:bg-white/10 text-white p-2 rounded-xl transition-colors">
                 <Square className="w-4 h-4" />
               </button>
            </div>
          </div>
        </section>
{/* Appearance */}
        <section className="bg-[#18181B]/50 p-6 rounded-3xl border border-white/5">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-[#7C3AED]" /> Appearance
          </h3>
          <p className="text-sm text-[#A1A1AA] mb-4">Zara OS is currently optimized for Dark Mode.</p>
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-[#7C3AED] text-white rounded-xl text-sm border border-[#7C3AED]">Dark Mode</button>
            <button className="px-4 py-2 bg-white/5 text-[#A1A1AA] rounded-xl text-sm border border-white/10 hover:bg-white/10 opacity-50 cursor-not-allowed">Light Mode (Coming Soon)</button>
          </div>
        </section>

        {/* Data Management */}
        <section className="bg-[#18181B]/50 p-6 rounded-3xl border border-white/5">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-red-500">
            <Database className="w-5 h-5" /> Data Management
          </h3>
          <p className="text-sm text-[#A1A1AA] mb-6">Manage your local persistence storage. Warning: These actions are irreversible.</p>
          
          <div className="space-y-3">
            <button 
              onClick={handleFactoryReset}
              className="w-full text-left px-4 py-3 bg-red-500/10 text-red-500 rounded-xl text-sm border border-red-500/20 hover:bg-red-500/20 transition-colors font-medium"
            >
              Factory Reset (Clear All Data)
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
