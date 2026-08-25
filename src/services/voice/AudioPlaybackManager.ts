export class AudioPlaybackManager {
  private outputAudioCtx: AudioContext | null = null;
  private nextStartTime: number = 0;
  private activeSources: AudioBufferSourceNode[] = [];
  private onPlaybackEnded: () => void;

  constructor(onPlaybackEnded: () => void) {
    this.onPlaybackEnded = onPlaybackEnded;
  }

  init() {
    if (!this.outputAudioCtx) {
      this.outputAudioCtx = new AudioContext({ sampleRate: 24000 });
      this.nextStartTime = this.outputAudioCtx.currentTime;
    }
  }

  playAudioChunk(base64: string) {
    if (!this.outputAudioCtx) return;
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const pcm16 = new Int16Array(bytes.buffer);
    const audioBuffer = this.outputAudioCtx.createBuffer(1, pcm16.length, 24000);
    const channelData = audioBuffer.getChannelData(0);
    for (let i = 0; i < pcm16.length; i++) {
      channelData[i] = pcm16[i] / 32768.0;
    }
    const source = this.outputAudioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.outputAudioCtx.destination);
    
    if (this.nextStartTime < this.outputAudioCtx.currentTime) {
      this.nextStartTime = this.outputAudioCtx.currentTime + 0.05;
    }
    
    this.activeSources.push(source);
    source.start(this.nextStartTime);
    this.nextStartTime += audioBuffer.duration;
    
    source.onended = () => {
      this.activeSources = this.activeSources.filter(s => s !== source);
      setTimeout(() => {
        if (this.outputAudioCtx && this.outputAudioCtx.currentTime >= this.nextStartTime - 0.1) {
          this.onPlaybackEnded();
        }
      }, 100);
    };
  }

  stopPlayback() {
    this.activeSources.forEach(source => {
      try { source.stop(); } catch(e) {}
    });
    this.activeSources = [];
    if (this.outputAudioCtx) {
      this.nextStartTime = this.outputAudioCtx.currentTime;
    }
  }

  destroy() {
    this.stopPlayback();
    if (this.outputAudioCtx) {
      this.outputAudioCtx.close();
      this.outputAudioCtx = null;
    }
  }
}
