import { MicrophoneCapture } from './MicrophoneCapture';
import { AudioPlaybackManager } from './AudioPlaybackManager';
import { VoiceActivityManager } from './VoiceActivityManager';
import { LiveSessionManager } from './LiveSessionManager';
import { AudioEncoder } from './AudioEncoder';

export interface VoiceDiagnosticsData {
  browserSupport: boolean;
  micPermission: 'GRANTED' | 'DENIED' | 'UNKNOWN';
  micTrack: 'LIVE' | 'STOPPED';
  liveConnection: 'CONNECTING' | 'CONNECTED' | 'CLOSED';
  audioContextState: 'RUNNING' | 'SUSPENDED' | 'CLOSED';
  audioChunksCaptured: number;
  audioChunksSent: number;
  serverMessagesReceived: number;
  audioResponsesReceived: number;
  recognitionState: string;
  lastEvent: string;
  lastError: string;
  lastTranscript: string;
}

export type VoiceState = 'idle' | 'listening' | 'processing' | 'error' | 'speaking';

export class LiveVoiceEngine {
  private micCapture = new MicrophoneCapture();
  private playback: AudioPlaybackManager;
  private activity: VoiceActivityManager;
  private session: LiveSessionManager;

  private state: VoiceState = 'idle';
  private onStateChange: (state: VoiceState) => void;
  private onTranscript: (text: string, isModel: boolean, isTurnComplete?: boolean) => void;
  private onError: (error: string) => void;
  private onInterim: (text: string) => void;
  private onDiagnostics?: (data: VoiceDiagnosticsData) => void;

  private micPermission: 'GRANTED' | 'DENIED' | 'UNKNOWN' = 'UNKNOWN';
  private lastEvent: string = 'none';
  private lastError: string = 'none';
  private lastTranscript: string = '';
  private audioChunksCaptured: number = 0;

  constructor(
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

    this.playback = new AudioPlaybackManager(() => {
      if (this.state === 'speaking') {
        this.setState('listening');
      }
    });

    this.activity = new VoiceActivityManager(
      () => {
        // Silence timeout
        this.onError("Zara hasn't heard anything. Voice mode ending.");
        this.stopListening();
      },
      () => {
        // Hardware mute
        this.onError("Zara couldn't access the voice stream. Please try again.");
        this.stopListening();
      }
    );

    this.session = new LiveSessionManager({
      onOpen: () => {
        this.lastEvent = 'ws-connected';
        if (this.micCapture.isContextRunning()) {
          this.setState('listening');
        } else {
          this.lastError = 'audio-context-suspended';
          this.onError("Microphone capture failed to start.");
          this.setState('error');
        }
      },
      onAudio: (base64) => {
        this.activity.resetVadTimer(this.state === 'listening' || this.state === 'processing');
        this.lastEvent = 'receiving-audio';
        this.setState('speaking');
        this.playback.playAudioChunk(base64);
      },
      onInterrupted: () => {
        this.lastEvent = 'interrupted';
        this.playback.stopPlayback();
        this.setState('listening');
      },
      onTurnComplete: () => {
        this.lastEvent = 'turnComplete';
        this.onTranscript('', false, true); // (text, isModel, isTurnComplete)
      },
      onTranscript: (text, isModel) => {
        this.lastTranscript = text;
        this.activity.resetVadTimer(this.state === 'listening' || this.state === 'processing');
        this.notifyDiagnostics();
        this.onTranscript(text, isModel);
      },
      onInterimTranscript: (text) => {
        this.activity.resetVadTimer(this.state === 'listening' || this.state === 'processing');
        this.onInterim(text);
      },
      onError: (msg) => {
        this.lastError = 'server-error';
        this.onError(msg);
        this.setState('error');
        this.stopListening();
      }
    });

    this.notifyDiagnostics();
  }

  private setState(newState: VoiceState) {
    this.state = newState;
    this.onStateChange(newState);
    this.notifyDiagnostics();
  }

  private notifyDiagnostics() {
    if (!this.onDiagnostics) return;
    this.onDiagnostics({
      browserSupport: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      micPermission: this.micPermission,
      micTrack: this.state !== 'idle' && this.state !== 'error' ? 'LIVE' : 'STOPPED',
      liveConnection: this.session.isConnected() ? 'CONNECTED' : (this.state !== 'idle' && this.state !== 'error' ? 'CONNECTING' : 'CLOSED'),
      audioContextState: this.micCapture.isContextRunning() ? 'RUNNING' : 'CLOSED',
      audioChunksCaptured: this.audioChunksCaptured,
      audioChunksSent: this.session.audioChunksSent,
      serverMessagesReceived: this.session.serverMessagesReceived,
      audioResponsesReceived: this.session.audioResponsesReceived,
      recognitionState: this.state.toUpperCase(),
      lastEvent: this.lastEvent,
      lastError: this.lastError,
      lastTranscript: this.lastTranscript
    });
  }

  async startListening() {
    this.setState('processing');
    this.lastEvent = 'connecting';
    this.audioChunksCaptured = 0;
    this.activity.resetState();
    
    this.playback.init();
    this.notifyDiagnostics();

    const permission = await this.micCapture.init((inputData) => {
      this.audioChunksCaptured++;
      if (this.session.isConnected()) {
        const { base64, maxAmp } = AudioEncoder.encodeFloat32ToPCM16Base64(inputData);
        this.activity.processAmplitude(maxAmp);
        this.session.sendAudioChunk(base64);
      }
    });

    this.micPermission = permission;
    if (permission === 'DENIED') {
      this.lastError = 'mic-denied';
      this.onError("Microphone access denied. Please allow microphone permissions.");
      this.setState('error');
      return;
    }

    this.session.connect();
    this.activity.resetVadTimer(true);
  }

  getState(): VoiceState {
    return this.state;
  }

  stopSpeaking() {
    this.playback.stopPlayback();
    if (this.state === 'speaking') {
      this.setState('listening');
    }
  }

  stopListening() {
    this.session.disconnect();
    this.micCapture.stop();
    this.playback.destroy();
    this.activity.resetState();

    if (this.state !== 'idle' && this.state !== 'error') {
      this.setState('idle');
      this.onTranscript('', false, true); // flush transcripts
    }
    
    this.notifyDiagnostics();
  }

  destroy() {
    this.stopListening();
  }
}
