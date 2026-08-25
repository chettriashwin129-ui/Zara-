export class MicrophoneCapture {
  private micStream: MediaStream | null = null;
  private inputAudioCtx: AudioContext | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;

  async init(onAudioProcess: (inputData: Float32Array) => void): Promise<'GRANTED' | 'DENIED'> {
    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      
      this.inputAudioCtx = new AudioContext({ sampleRate: 16000 });
      if (this.inputAudioCtx.state === 'suspended') {
        await this.inputAudioCtx.resume();
      }

      this.source = this.inputAudioCtx.createMediaStreamSource(this.micStream);
      this.processor = this.inputAudioCtx.createScriptProcessor(4096, 1, 1);
      
      this.source.connect(this.processor);
      this.processor.connect(this.inputAudioCtx.destination);
      
      this.processor.onaudioprocess = (e) => {
        onAudioProcess(e.inputBuffer.getChannelData(0));
      };

      return 'GRANTED';
    } catch (err) {
      console.error("Microphone capture failed to start:", err);
      return 'DENIED';
    }
  }

  isContextRunning(): boolean {
    return this.inputAudioCtx?.state === 'running';
  }

  stop() {
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach(t => t.stop());
      this.micStream = null;
    }
    if (this.inputAudioCtx) {
      this.inputAudioCtx.close();
      this.inputAudioCtx = null;
    }
  }
}
