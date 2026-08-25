const fs = require('fs');
let code = fs.readFileSync('src/components/views/ChatView.tsx', 'utf8');

code = code.replace(/import { GeminiLiveService, VoiceState } from '\.\.\/\.\.\/lib\/GeminiLiveService';/g, "import { GeminiLiveService, VoiceState, VoiceDiagnosticsData } from '../../lib/GeminiLiveService';");
code = code.replace(/addToast\(error, 'error'\);/g, "setErrorMsg(error);");
code = code.replace(/voiceEngine\.current\?\.speak\(data\.reply\);/g, "");
code = code.replace(/voiceEngine\.current\.reset\(\);/g, "");

fs.writeFileSync('src/components/views/ChatView.tsx', code);
