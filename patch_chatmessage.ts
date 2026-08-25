import fs from 'fs';
let content = fs.readFileSync('src/components/ChatMessage.tsx', 'utf-8');

if (!content.includes('voiceEngine')) {
    content = `import { voiceEngine } from '../lib/VoiceEngine';\nimport { Volume2 } from 'lucide-react';\n` + content;
    
    const target = `<Copy className="w-3.5 h-3.5" />\n              Copy\n            </button>`;
    const injection = `<Copy className="w-3.5 h-3.5" />\n              Copy\n            </button>\n            <button onClick={() => voiceEngine.speak(msg.content, true)} className="p-1.5 text-[#A1A1AA] hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium" aria-label="Play Zara response">\n              <Volume2 className="w-3.5 h-3.5" />\n              Play\n            </button>`;
    
    content = content.replace(target, injection);

    fs.writeFileSync('src/components/ChatMessage.tsx', content);
    console.log("Patched ChatMessage.tsx");
} else {
    console.log("Already patched");
}
