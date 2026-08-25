import fs from 'fs';
let content = fs.readFileSync('src/lib/VoiceEngine.ts', 'utf8');

content = content.replace(
  '  startListening() {',
  '  async startListening() {'
);

content = content.replace(
  "    try {\n      if (this.state !== 'listening') {\n        this.recognition.start();\n      }\n    } catch (e: any) {",
  `    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (mediaErr) {
          console.warn("getUserMedia failed, falling back to recognition.start directly", mediaErr);
        }
      }
      if (this.state !== 'listening') {
        this.recognition.start();
      }
    } catch (e: any) {`
);

fs.writeFileSync('src/lib/VoiceEngine.ts', content);
