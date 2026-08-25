import fs from 'fs';
let content = fs.readFileSync('src/lib/GeminiLiveService.ts', 'utf-8');

const targetPlayback = `  private stopPlayback() {
    if (this.outputAudioCtx) {
      this.outputAudioCtx.close();
      this.outputAudioCtx = new AudioContext({ sampleRate: 24000 });
      this.nextStartTime = this.outputAudioCtx.currentTime;
    }
  }`;

const injectionPlayback = `  private stopPlayback() {
    this.activeSources.forEach(source => {
      try { source.stop(); } catch(e) {}
    });
    this.activeSources = [];
    if (this.outputAudioCtx) {
      this.nextStartTime = this.outputAudioCtx.currentTime;
    }
  }`;

content = content.replace(targetPlayback, injectionPlayback);

const targetState = `  private outputAudioCtx: AudioContext | null = null;
  private nextStartTime: number = 0;`;

const injectionState = `  private outputAudioCtx: AudioContext | null = null;
  private nextStartTime: number = 0;
  private activeSources: AudioBufferSourceNode[] = [];`;

content = content.replace(targetState, injectionState);

const targetPlay = `    source.connect(this.outputAudioCtx.destination);
    if (this.nextStartTime < this.outputAudioCtx.currentTime) {
      this.nextStartTime = this.outputAudioCtx.currentTime + 0.05;
    }
    source.start(this.nextStartTime);
    this.nextStartTime += audioBuffer.duration;
    
    source.onended = () => {`;

const injectionPlay = `    source.connect(this.outputAudioCtx.destination);
    if (this.nextStartTime < this.outputAudioCtx.currentTime) {
      this.nextStartTime = this.outputAudioCtx.currentTime + 0.05;
    }
    this.activeSources.push(source);
    source.start(this.nextStartTime);
    this.nextStartTime += audioBuffer.duration;
    
    source.onended = () => {
      this.activeSources = this.activeSources.filter(s => s !== source);`;

content = content.replace(targetPlay, injectionPlay);

fs.writeFileSync('src/lib/GeminiLiveService.ts', content);
console.log("Patched stopPlayback");
