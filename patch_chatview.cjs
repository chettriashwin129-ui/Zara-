const fs = require('fs');
let code = fs.readFileSync('src/components/views/ChatView.tsx', 'utf8');

code = code.replace(/import { SpeechRecognitionService, VoiceDiagnosticsData } from '\.\.\/\.\.\/lib\/SpeechRecognitionService';/, "import { GeminiLiveService, VoiceState } from '../../lib/GeminiLiveService';");

code = code.replace(/const voiceEngine = useRef<SpeechRecognitionService \| null>\(null\);/, "const voiceEngine = useRef<GeminiLiveService | null>(null);");

code = code.replace(/voiceEngine\.current = new SpeechRecognitionService\([\s\S]*?\n\s*\);/, `
    voiceEngine.current = new GeminiLiveService(
      (state) => setVoiceState(state),
      (text) => {
        // This is for live transcript streaming (if needed)
        // Since Gemini Live responds natively, we might not need to push it to the chat via TTS,
        // but we can show it on the UI if we want.
      },
      (error) => {
        addToast(error, 'error');
        setVoiceState('error');
      },
      (interim) => {
        // Handle interim transcript if we have it
      }
    );
`);

// The stop/start logic for voice engine needs to be adapted
code = code.replace(/if \(voiceEngine\.current\.isListening\(\)\) {[\s\S]*?}/, `
        if (voiceState === 'listening' || voiceState === 'speaking' || voiceState === 'processing') {
          voiceEngine.current.stopListening();
        } else {
          voiceEngine.current.startListening();
        }
`);

fs.writeFileSync('src/components/views/ChatView.tsx', code);
