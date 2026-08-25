const fs = require('fs');
let code = fs.readFileSync('src/components/views/ChatView.tsx', 'utf8');

if (!code.includes('const [zaraTranscript, setZaraTranscript] = useState')) {
  code = code.replace(/const \[input, setInput\] = useState\(''\);/, "const [input, setInput] = useState('');\n  const [zaraTranscript, setZaraTranscript] = useState('');");
}

code = code.replace(/voiceEngine\.current = new GeminiLiveService\([\s\S]*?\n\s*\);/, `
    voiceEngine.current = new GeminiLiveService(
      (state) => {
        setVoiceState(state);
        if (state === 'idle') {
          setZaraTranscript('');
        }
      },
      (text) => {
        // Final transcript (Zara's text)
        setZaraTranscript(prev => prev + text);
      },
      (error) => {
        addToast(error, 'error');
        setVoiceState('error');
      },
      (interim) => {
        // Interim transcript (User's text)
        setInput(interim);
      },
      (diagData) => {
        setDiagnostics(diagData);
      }
    );
`);

// Now add the zara transcript visual to the UI
const targetVisual = `{voiceState !== 'idle' && (`;
const replaceVisual = `{zaraTranscript && voiceState !== 'idle' && (
                  <div className="absolute -top-20 left-4 text-xs font-medium text-emerald-400 bg-[#18181B] px-4 py-2 rounded-2xl border border-emerald-500/30 shadow-lg max-w-sm truncate">
                     {zaraTranscript}
                  </div>
                )}
                {voiceState !== 'idle' && (`;

code = code.replace(targetVisual, replaceVisual);

fs.writeFileSync('src/components/views/ChatView.tsx', code);
