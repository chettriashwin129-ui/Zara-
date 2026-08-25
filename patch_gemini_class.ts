import fs from 'fs';
let content = fs.readFileSync('src/lib/GeminiLiveService.ts', 'utf-8');

// 1. Add class properties
const targetProps = `  private serverMessagesReceived: number = 0;`;
const injectionProps = `  private serverMessagesReceived: number = 0;
  private audioResponsesReceived: number = 0;
  private zeroVolumeChunks: number = 0;
  private silenceTimeoutDetected: boolean = false;
  private vadSilenceTimer: any = null;
  private activeSources: AudioBufferSourceNode[] = [];`;
content = content.replace(targetProps, injectionProps);

// 2. Add resetVadTimer method
const targetMethod = `  private notifyDiagnostics() {`;
const injectionMethod = `  private resetVadTimer() {
    if (this.vadSilenceTimer) clearTimeout(this.vadSilenceTimer);
    this.vadSilenceTimer = setTimeout(() => {
      if (this.state === 'listening' || this.state === 'processing') {
        this.onError("Zara hasn't heard anything. Voice mode ending.");
        this.stopListening();
      }
    }, 20000); // 20 seconds of no transcript or activity
  }

  private notifyDiagnostics() {`;
content = content.replace(targetMethod, injectionMethod);

// 3. Fix constructor and onTranscript signatures
const targetConstructor = `  private onTranscript: (text: string, isFinal: boolean) => void;
  private onDiagnostics?: (data: VoiceDiagnosticsData) => void;
  
  private micPermission: 'GRANTED' | 'DENIED' | 'UNKNOWN' = 'UNKNOWN';`;

const injectionConstructor = `  private onTranscript: (text: string, isModel: boolean, isTurnComplete?: boolean) => void;
  private onInterim: (text: string) => void;
  private onDiagnostics?: (data: VoiceDiagnosticsData) => void;
  
  private micPermission: 'GRANTED' | 'DENIED' | 'UNKNOWN' = 'UNKNOWN';`;
content = content.replace(targetConstructor, injectionConstructor);

const targetInit = `  constructor(
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
  }`;

const injectionInit = `  constructor(
    onStateChange: (state: VoiceState) => void,
    onTranscript: (text: string, isModel: boolean, isTurnComplete?: boolean) => void,
    onError: (error: string) => void,
    onInterim: (text: string) => void,
    onDiagnostics?: (data: VoiceDiagnosticsData) => void
  ) {
    this.onStateChange = onStateChange;
    this.onTranscript = onTranscript;
    this.onError = onError;
    this.onInterim = onInterim;
    this.onDiagnostics = onDiagnostics;
    this.notifyDiagnostics();
  }`;
content = content.replace(targetInit, injectionInit);

fs.writeFileSync('src/lib/GeminiLiveService.ts', content);
console.log("Patched GeminiLiveService class definition");
