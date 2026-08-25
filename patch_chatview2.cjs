const fs = require('fs');
let code = fs.readFileSync('src/components/views/ChatView.tsx', 'utf8');

code = code.replace(/voiceEngine\.current = new GeminiLiveService\([\s\S]*?\n\s*\);/, `
    voiceEngine.current = new GeminiLiveService(
      (state) => setVoiceState(state),
      (text) => {
        // Final transcript
      },
      (error) => {
        addToast(error, 'error');
        setVoiceState('error');
      },
      (interim) => {
        // Interim transcript
      },
      (diagData) => {
        setDiagnostics(diagData);
      }
    );
`);

fs.writeFileSync('src/components/views/ChatView.tsx', code);
