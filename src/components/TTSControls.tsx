import { useEffect, useState } from 'react';
import { voiceEngine } from '../lib/VoiceEngine';
import { Volume2, Play, Square, Pause, PlayCircle } from 'lucide-react';

export function TTSControls() {
  const [state, setState] = useState<'idle' | 'speaking' | 'paused'>('idle');

  useEffect(() => {
    voiceEngine.setOnStateChange(setState);
    return () => voiceEngine.setOnStateChange(() => {});
  }, []);

  if (state === 'idle') return null;

  return (
    <div className="absolute top-4 right-4 z-50 bg-[#18181B] border border-[#7C3AED]/30 shadow-lg rounded-full px-4 py-2 flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
      <div className="flex items-center gap-2 text-[#7C3AED] font-medium text-sm">
        <Volume2 className="w-4 h-4 animate-pulse" />
        Speaking...
      </div>
      <div className="flex items-center gap-1 border-l border-white/10 pl-3">
        {state === 'speaking' ? (
          <button onClick={() => voiceEngine.pause()} className="p-1.5 hover:bg-white/10 rounded-full text-white transition-colors" aria-label="Pause Zara speaking">
            <Pause className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={() => voiceEngine.resume()} className="p-1.5 hover:bg-white/10 rounded-full text-white transition-colors" aria-label="Resume Zara speaking">
            <Play className="w-4 h-4" />
          </button>
        )}
        <button onClick={() => voiceEngine.stop()} className="p-1.5 hover:bg-white/10 rounded-full text-white transition-colors" aria-label="Stop Zara speaking">
          <Square className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
