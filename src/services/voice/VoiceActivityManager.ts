export class VoiceActivityManager {
  private zeroVolumeChunks: number = 0;
  private silenceTimeoutDetected: boolean = false;
  private vadSilenceTimer: any = null;
  
  private onSilenceTimeout: () => void;
  private onHardwareMute: () => void;
  private getState: () => string;

  constructor(onSilenceTimeout: () => void, onHardwareMute: () => void, getState: () => string) {
    this.onSilenceTimeout = onSilenceTimeout;
    this.onHardwareMute = onHardwareMute;
    this.getState = getState;
  }

  resetVadTimer() {
    if (this.vadSilenceTimer) clearTimeout(this.vadSilenceTimer);
    this.vadSilenceTimer = setTimeout(() => {
      const state = this.getState();
      if (state === 'listening' || state === 'processing') {
        this.onSilenceTimeout();
      }
    }, 20000); // 20 seconds of no transcript or activity
  }

  processAmplitude(maxAmp: number) {
    if (maxAmp === 0) {
      this.zeroVolumeChunks++;
      if (this.zeroVolumeChunks > 80 && !this.silenceTimeoutDetected) { // 80 chunks * 250ms = 20 seconds
        this.silenceTimeoutDetected = true;
        this.onHardwareMute();
      }
    } else {
      this.zeroVolumeChunks = 0;
    }
  }

  resetState() {
    this.zeroVolumeChunks = 0;
    this.silenceTimeoutDetected = false;
    if (this.vadSilenceTimer) {
      clearTimeout(this.vadSilenceTimer);
      this.vadSilenceTimer = null;
    }
  }
}
