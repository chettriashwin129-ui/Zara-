import { useState, useEffect } from 'react';
import { voiceEngine } from '../../lib/VoiceEngine';
import { Volume2, Play, Square, Pause } from 'lucide-react';
import { Settings, Database, User, Palette } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { VoiceInfo } from '../../lib/VoiceProvider';

export function SettingsView() {
  const { clearAll: clearMemories } = useApi('memories');
  const { clearAll: clearTasks } = useApi('planner_tasks');
  const { clearAll: clearGoals } = useApi('goals');
  const { clearAll: clearProjects } = useApi('projects');
  const { clearAll: clearTopics } = useApi('learn_topics');

  const [voiceSettings, setVoiceSettings] = useState(voiceEngine.settings);
  const [voices, setVoices] = useState<VoiceInfo[]>([]);

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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-[#7C3AED]" /> Voice & Speech (Zara Voice Core)
            </h3>
            <span className="text-xs px-2.5 py-1 bg-[#7C3AED]/20 text-[#7C3AED] rounded-full font-medium">
              Female Indian Hinglish Persona
            </span>
          </div>
          <p className="text-sm text-[#A1A1AA] mb-6">
            Zara uses Gemini Live real-time audio with confirmed female voices tuned for natural Indian English, Hindi, and conversational Hinglish.
          </p>

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-white font-medium block">Enable Voice Features</span>
                <span className="text-xs text-[#A1A1AA]">Enable microphone input and audio playback</span>
              </div>
              <button 
                onClick={() => updateVoiceSettings({ enabled: !voiceSettings.enabled })}
                className={`w-12 h-6 rounded-full transition-colors relative ${voiceSettings.enabled ? 'bg-[#7C3AED]' : 'bg-white/10'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${voiceSettings.enabled ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-white font-medium block">Auto-speak responses</span>
                <span className="text-xs text-[#A1A1AA]">Read assistant text responses automatically</span>
              </div>
              <button 
                onClick={() => updateVoiceSettings({ autoSpeak: !voiceSettings.autoSpeak })}
                className={`w-12 h-6 rounded-full transition-colors relative ${voiceSettings.autoSpeak ? 'bg-[#7C3AED]' : 'bg-white/10'}`}
                disabled={!voiceSettings.enabled}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${voiceSettings.autoSpeak ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>

            <div>
              <label className="text-white font-medium block mb-2">Gemini Live Voice (Female Real-Time Audio)</label>
              <select 
                value={voiceSettings.liveVoice || 'Aoede'}
                onChange={(e) => updateVoiceSettings({ liveVoice: e.target.value })}
                className="w-full bg-[#18181B] border border-white/10 text-white rounded-xl p-2.5 outline-none focus:border-[#7C3AED]"
                disabled={!voiceSettings.enabled}
              >
                <option value="Aoede">Aoede (Zara Female - Warm, Expressive & Conversational) 🇮🇳</option>
                <option value="Kore">Kore (Zara Female - Gentle & Articulate) 🇮🇳</option>
                <option value="Zephyr">Zephyr (Zara Female - Bright & Energetic) 🇮🇳</option>
              </select>
              <p className="text-xs text-[#A1A1AA] mt-1.5">
                Native audio model produces seamless voice responses directly in conversational Hinglish and Indian English without robotic synthesis.
              </p>
            </div>

            <div>
              <label className="text-white font-medium block mb-2">Fallback Web Speech Voice</label>
              <select 
                value={voiceSettings.voiceURI}
                onChange={(e) => updateVoiceSettings({ voiceURI: e.target.value })}
                className="w-full bg-[#18181B] border border-white/10 text-white rounded-xl p-2.5 outline-none focus:border-[#7C3AED]"
                disabled={!voiceSettings.enabled}
              >
                <option value="">Auto (Default Indian / System Female)</option>
                {voices.filter(v => v.provider !== 'Gemini Live Multimodal').map(v => (
                  <option key={v.id} value={v.id}>{v.name} ({v.lang}) {v.isIndianFemale ? '🇮🇳 (Female)' : ''}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white font-medium block mb-2">Speech Speed ({voiceSettings.speakingRate.toFixed(1)}x)</label>
                <input 
                  type="range" min="0.5" max="2" step="0.1" 
                  value={voiceSettings.speakingRate} 
                  onChange={(e) => updateVoiceSettings({ speakingRate: parseFloat(e.target.value) })}
                  className="w-full accent-[#7C3AED]"
                  disabled={!voiceSettings.enabled}
                />
              </div>
              
              <div>
                <label className="text-white font-medium block mb-2">Pitch ({voiceSettings.pitch.toFixed(1)})</label>
                <input 
                  type="range" min="0.5" max="1.5" step="0.1" 
                  value={voiceSettings.pitch} 
                  onChange={(e) => updateVoiceSettings({ pitch: parseFloat(e.target.value) })}
                  className="w-full accent-[#7C3AED]"
                  disabled={!voiceSettings.enabled}
                />
              </div>
            </div>
            
            <div className="pt-2 flex gap-3">
               <button 
                 onClick={() => voiceEngine.speak("Hello Ashwin! Main Zara hoon. Honestly, aaj hum pehle high priority tasks complete kar lete hain, phir project status review karenge.", true)} 
                 disabled={!voiceSettings.enabled} 
                 className="flex-1 bg-[#7C3AED]/20 hover:bg-[#7C3AED]/30 text-[#7C3AED] border border-[#7C3AED]/30 p-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
               >
                 <Play className="w-4 h-4" /> Test Zara Voice (Hinglish Demo)
               </button>
               <button 
                 onClick={() => voiceEngine.stop()} 
                 disabled={!voiceSettings.enabled} 
                 className="bg-white/5 hover:bg-white/10 text-white px-4 py-2.5 rounded-xl transition-colors"
               >
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
