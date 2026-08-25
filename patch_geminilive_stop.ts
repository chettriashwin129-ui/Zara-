import fs from 'fs';
let content = fs.readFileSync('src/lib/GeminiLiveService.ts', 'utf-8');

const target = `    if (this.state !== 'idle' && this.state !== 'error') {
      this.setState('idle');
    }`;
const injection = `    if (this.state !== 'idle' && this.state !== 'error') {
      this.setState('idle');
      this.onTranscript('', false, true); // flush transcripts
    }`;
content = content.replace(target, injection);

fs.writeFileSync('src/lib/GeminiLiveService.ts', content);
console.log("Patched stopListening");
