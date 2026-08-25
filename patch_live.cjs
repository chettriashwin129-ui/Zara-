const fs = require('fs');
let code = fs.readFileSync('src/lib/GeminiLiveService.ts', 'utf8');

const replacement = `
export interface VoiceDiagnosticsData {
  browserSupport: boolean;
  micPermission: 'GRANTED' | 'DENIED' | 'UNKNOWN';
  recognitionState: string;
  lastEvent: string;
  lastError: string;
  lastTranscript: string;
}

export type VoiceState = 'idle' | 'listening' | 'processing' | 'error' | 'speaking';

export class GeminiLiveService {
  private ws: WebSocket | null = null;
  private inputAudioCtx: AudioContext | null = null;
  private outputAudioCtx: AudioContext | null = null;
  private micStream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  private state: VoiceState = 'idle';
  private onStateChange: (state: VoiceState) => void;
  private onError: (error: string) => void;
  private onTranscript: (text: string, isFinal: boolean) => void;
  private onDiagnostics?: (data: VoiceDiagnosticsData) => void;
  
  private micPermission: 'GRANTED' | 'DENIED' | 'UNKNOWN' = 'UNKNOWN';
  private lastEvent: string = 'none';
  private lastError: string = 'none';
  private lastTranscript: string = '';

  private nextStartTime: number = 0;

  constructor(
    onStateChange: (state: VoiceState) => void,
    onResult: (text: string) => void, 
    onError: (error: string) => void,
    onInterim?: (text: string) => void,
    onDiagnostics?: (data: VoiceDiagnosticsData) => void
  ) {
    this.onStateChange = onStateChange;
    this.onError = onError;
    this.onDiagnostics = onDiagnostics;
    this.onTranscript = (text, isFinal) => {
      this.lastTranscript = text;
      this.notifyDiagnostics();
      if (isFinal) {
        onResult(text);
      } else if (onInterim) {
        onInterim(text);
      }
    };
    this.notifyDiagnostics();
  }

  private notifyDiagnostics() {
    if (this.onDiagnostics) {
      this.onDiagnostics({
        browserSupport: true,
        micPermission: this.micPermission,
        recognitionState: this.state.toUpperCase(),
        lastEvent: this.lastEvent,
        lastError: this.lastError,
        lastTranscript: this.lastTranscript,
      });
    }
  }

  private setState(newState: VoiceState) {
    this.state = newState;
    this.onStateChange(newState);
    this.notifyDiagnostics();
  }

  async startListening() {
    this.setState('processing');
    this.lastEvent = 'connecting';
    this.notifyDiagnostics();

    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      this.micPermission = 'GRANTED';
    } catch (err) {
      this.micPermission = 'DENIED';
      this.lastError = 'mic-denied';
      this.onError("Zara needs microphone access to talk with you.");
      this.setState('error');
      setTimeout(() => this.setState('idle'), 3000);
      return;
    }
    
    this.notifyDiagnostics();

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.ws = new WebSocket(\`\${protocol}//\${window.location.host}/live\`);

    this.ws.onopen = () => {
      this.lastEvent = 'ws-connected';
      this.setState('listening');
      this.setupAudio();
    };

    this.ws.onmessage = async (event) => {
      const msg = JSON.parse(event.data);
      if (msg.error) {
        this.lastError = msg.error;
        this.onError(msg.error);
        this.stopListening();
        return;
      }
      if (msg.audio) {
        this.lastEvent = 'receiving-audio';
        this.setState('speaking');
        this.playAudioChunk(msg.audio);
      }
      if (msg.interrupted) {
        this.lastEvent = 'interrupted';
        this.stopPlayback();
        this.setState('listening');
      }
      if (msg.transcript) {
        this.onTranscript(msg.transcript.text, msg.transcript.isFinal);
      }
      this.notifyDiagnostics();
    };

    this.ws.onerror = () => {
      this.lastError = 'ws-error';
      this.onError("Zara lost the connection. Trying again...");
      this.stopListening();
    };

    this.ws.onclose = () => {
      this.lastEvent = 'ws-closed';
      this.stopListening();
    };
  }

  private setupAudio() {
    this.inputAudioCtx = new AudioContext({ sampleRate: 16000 });
    this.outputAudioCtx = new AudioContext({ sampleRate: 24000 });
    this.nextStartTime = this.outputAudioCtx.currentTime;

    if (!this.micStream) return;
    this.source = this.inputAudioCtx.createMediaStreamSource(this.micStream);
    this.processor = this.inputAudioCtx.createScriptProcessor(4096, 1, 1);

    this.source.connect(this.processor);
    this.processor.connect(this.inputAudioCtx.destination);

    this.processor.onaudioprocess = (e) => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          let s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        
        // Base64 encode
        const bytes = new Uint8Array(pcm16.buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);
        
        this.ws.send(JSON.stringify({ audio: base64 }));
      }
    };
  }

  private async playAudioChunk(base64: string) {
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

    source.start(this.nextStartTime);
    this.nextStartTime += audioBuffer.duration;
    
    source.onended = () => {
      setTimeout(() => {
        if (this.outputAudioCtx && this.outputAudioCtx.currentTime >= this.nextStartTime - 0.1) {
          if (this.state === 'speaking') {
            this.setState('listening');
          }
        }
      }, 100);
    };
  }

  private stopPlayback() {
    if (this.outputAudioCtx) {
      this.outputAudioCtx.close();
      this.outputAudioCtx = new AudioContext({ sampleRate: 24000 });
      this.nextStartTime = this.outputAudioCtx.currentTime;
    }
  }

  stopListening() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
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
    if (this.outputAudioCtx) {
      this.outputAudioCtx.close();
      this.outputAudioCtx = null;
    }
    if (this.state !== 'idle' && this.state !== 'error') {
      this.setState('idle');
    }
    this.notifyDiagnostics();
  }

  destroy() {
    this.stopListening();
  }
}
`;

code = replacement;
fs.writeFileSync('src/lib/GeminiLiveService.ts', code);
