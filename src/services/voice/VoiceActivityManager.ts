export class VoiceActivityManager {
  private zeroVolumeChunks: number = 0;
  private silenceTimeoutDetected: boolean = false;
  private vadSilenceTimer: any = null;
  
  private onSilenceTimeout: () => void;
  private onHardwareMute: () => void;

  constructor(onSilenceTimeout: () => void, onHardwareMute: () => void) {
    this.onSilenceTimeout = onSilenceTimeout;
    this.onHardwareMute = onHardwareMute;
  }

  resetVadTimer(isListeningOrProcessing: boolean) {
    if (this.vadSilenceTimer) clearTimeout(this.vadSilenceTimer);
    this.vadSilenceTimer = setTimeout(() => {
      if (isListeningOrProcessing) {
        this.onSilenceTimeout();
      }
    }, 20000); // 20 seconds of no transcript or activity
  }

  processAmplitude(maxAmp: number) {
    if (maxAmp === 0) {
      this.zeroVolumeChunks++;
      if (this.zeroVolumeChunks > 40 && !this.silenceTimeoutDetected) { // 40 chunks * 250ms = 10 seconds
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
