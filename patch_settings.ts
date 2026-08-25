import fs from 'fs';
let content = fs.readFileSync('src/components/views/SettingsView.tsx', 'utf-8');

if (!content.includes('import { voiceEngine }')) {
    content = `import { useState, useEffect } from 'react';\nimport { voiceEngine } from '../../lib/VoiceEngine';\nimport { Volume2, Play, Square, Pause } from 'lucide-react';\n` + content;
    
    // Add voice state inside the component
    const target1 = "const { clearAll: clearTopics } = useApi('learn_topics');";
    const injection1 = `
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
`;
    content = content.replace(target1, target1 + injection1);
    
    // Add Voice Settings section
    const target2 = "{/* Appearance */}";
    const injection2 = `
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
                className={\`w-12 h-6 rounded-full transition-colors relative \${voiceSettings.enabled ? 'bg-[#7C3AED]' : 'bg-white/10'}\`}
              >
                <div className={\`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform \${voiceSettings.enabled ? 'translate-x-7' : 'translate-x-1'}\`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">Auto-speak responses</span>
              <button 
                onClick={() => updateVoiceSettings({ autoSpeak: !voiceSettings.autoSpeak })}
                className={\`w-12 h-6 rounded-full transition-colors relative \${voiceSettings.autoSpeak ? 'bg-[#7C3AED]' : 'bg-white/10'}\`}
                disabled={!voiceSettings.enabled}
              >
                <div className={\`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform \${voiceSettings.autoSpeak ? 'translate-x-7' : 'translate-x-1'}\`} />
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
`;
    content = content.replace(target2, injection2 + target2);
    
    fs.writeFileSync('src/components/views/SettingsView.tsx', content);
    console.log("Patched SettingsView.tsx");
} else {
    console.log("Already patched");
}
