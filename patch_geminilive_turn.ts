import fs from 'fs';
let content = fs.readFileSync('src/lib/GeminiLiveService.ts', 'utf-8');

const target = `      if (msg.interrupted) {
        this.lastEvent = 'interrupted';
        this.stopPlayback();
        this.setState('listening');
      }`;
const injection = `      if (msg.interrupted) {
        this.lastEvent = 'interrupted';
        this.stopPlayback();
        this.setState('listening');
      }
      if (msg.turnComplete) {
        this.lastEvent = 'turnComplete';
        // We can notify the caller that the turn is complete
        this.onTranscript('', false, true); // (text, isModel, isTurnComplete)
      }`;

content = content.replace(target, injection);

// Also modify the callback signature
const targetSig = `constructor(
    private onStateChange: (state: VoiceState) => void,
    private onTranscript: (text: string, isModel: boolean) => void,
    private onError: (error: string) => void,
    private onInterim: (text: string) => void,
    private onDiagnostics: (data: VoiceDiagnosticsData) => void
  ) {`;
const injectionSig = `constructor(
    private onStateChange: (state: VoiceState) => void,
    private onTranscript: (text: string, isModel: boolean, isTurnComplete?: boolean) => void,
    private onError: (error: string) => void,
    private onInterim: (text: string) => void,
    private onDiagnostics: (data: VoiceDiagnosticsData) => void
  ) {`;
content = content.replace(targetSig, injectionSig);

fs.writeFileSync('src/lib/GeminiLiveService.ts', content);
console.log("Patched GeminiLiveService turnComplete");
