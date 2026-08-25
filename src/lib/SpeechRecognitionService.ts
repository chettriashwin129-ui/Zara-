
export type VoiceState = 'idle' | 'listening' | 'processing' | 'error' | 'speaking';

export interface VoiceDiagnosticsData {
  browserSupport: boolean;
  micPermission: 'GRANTED' | 'DENIED' | 'UNKNOWN';
  recognitionState: string;
  lastEvent: string;
  lastError: string;
  lastTranscript: string;
}

export class SpeechRecognitionService {
  private recognition: any = null;
  private synthesis: SpeechSynthesis = window.speechSynthesis;
  private state: VoiceState = 'idle';
  private onStateChange: (state: VoiceState) => void;
  private onResult: (text: string) => void;
  private onError: (error: string) => void;
  private onInterim?: (text: string) => void;
  private onDiagnostics?: (data: VoiceDiagnosticsData) => void;

  private micPermission: 'GRANTED' | 'DENIED' | 'UNKNOWN' = 'UNKNOWN';
  private lastEvent: string = 'none';
  private lastError: string = 'none';
  private lastTranscript: string = '';
  private lastInterimTranscript: string = '';
  private finalTranscriptReceived: string = '';
  private hasFinalResult: boolean = false;

  constructor(
    onStateChange: (state: VoiceState) => void,
    onResult: (text: string) => void,
    onError: (error: string) => void,
    onInterim?: (text: string) => void,
    onDiagnostics?: (data: VoiceDiagnosticsData) => void
  ) {
    this.onStateChange = onStateChange;
    this.onResult = onResult;
    this.onError = onError;
    this.onInterim = onInterim;
    this.onDiagnostics = onDiagnostics;

    this.notifyDiagnostics();
  }

  private isBrowserSupported(): boolean {
    return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  private notifyDiagnostics() {
    if (this.onDiagnostics) {
      this.onDiagnostics({
        browserSupport: this.isBrowserSupported(),
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

  private logDev(msg: string, ...args: any[]) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[ZARA VOICE] ${msg}`, ...args);
    }
  }

  async startListening() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      const msg = "Voice input isn't supported in this browser. You can still use Zara by typing.";
      this.lastError = "SpeechRecognition unavailable";
      this.onError(msg);
      this.notifyDiagnostics();
      return;
    }

    // Stop speaking if currently active
    this.stopSpeaking();

    // Prevent duplicate recognition sessions
    this.stopListeningSession();

    // 8. MICROPHONE PERMISSION CHECK
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.micPermission = 'GRANTED';
        // Immediately stop all acquired tracks to release mic
        stream.getTracks().forEach((track) => track.stop());
      } catch (err: any) {
        this.logDev('error: Microphone permission check failed');
        this.micPermission = 'DENIED';
        this.lastError = 'not-allowed';
        this.onError("Microphone access is blocked.");
        this.setState('error');
        this.notifyDiagnostics();
        setTimeout(() => {
          if (this.state === 'error') this.setState('idle');
        }, 3000);
        return;
      }
    }

    // Create fresh SpeechRecognition instance
    this.recognition = new SpeechRecognition();
    this.recognition.lang = "en-US";
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;

    this.finalTranscriptReceived = '';
    this.lastInterimTranscript = '';
    this.hasFinalResult = false;

    // Attach all event handlers
    this.recognition.onstart = () => {
      this.logDev('start');
      this.lastEvent = 'onstart';
      this.micPermission = 'GRANTED';
      this.setState('listening');
    };

    this.recognition.onaudiostart = () => {
      this.logDev('audio started');
      this.lastEvent = 'onaudiostart';
      this.notifyDiagnostics();
    };

    this.recognition.onsoundstart = () => {
      this.logDev('sound started');
      this.lastEvent = 'onsoundstart';
      this.notifyDiagnostics();
    };

    this.recognition.onspeechstart = () => {
      this.logDev('speech started');
      this.lastEvent = 'onspeechstart';
      this.notifyDiagnostics();
    };

    this.recognition.onresult = (event: any) => {
      this.logDev('result received');
      this.lastEvent = 'onresult';
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (interimTranscript) {
        this.logDev(`interim transcript: ${interimTranscript}`);
        this.lastInterimTranscript = interimTranscript.trim();
        if (this.onInterim) {
          this.onInterim(interimTranscript);
        }
      }

      if (finalTranscript) {
        this.logDev(`final transcript: ${finalTranscript}`);
        this.finalTranscriptReceived = finalTranscript.trim();
        this.hasFinalResult = true;
        this.lastTranscript = finalTranscript.trim();
      }

      this.notifyDiagnostics();
    };

    this.recognition.onspeechend = () => {
      this.logDev('speech ended');
      this.lastEvent = 'onspeechend';
      this.notifyDiagnostics();
    };

    this.recognition.onsoundend = () => {
      this.logDev('sound ended');
      this.lastEvent = 'onsoundend';
      this.notifyDiagnostics();
    };

    this.recognition.onaudioend = () => {
      this.logDev('audio ended');
      this.lastEvent = 'onaudioend';
      this.notifyDiagnostics();
    };

    this.recognition.onerror = (event: any) => {
      const errCode = event.error || 'unknown';
      this.logDev(`error: ${errCode}`);
      this.lastEvent = 'onerror';
      this.lastError = errCode;

      let errorMsg = `Speech recognition error: ${errCode}`;

      switch (errCode) {
        case 'not-allowed':
          this.micPermission = 'DENIED';
          errorMsg = "Microphone access is blocked.";
          break;
        case 'service-not-allowed':
          errorMsg = "Speech recognition service is not allowed in this browser.";
          break;
        case 'no-speech':
          // Sometimes no-speech fires even if we have some interim text that we can use
          if (this.lastInterimTranscript) {
            this.logDev("Ignoring 'no-speech' because we have interim transcript.");
            return; // Ignore no-speech if we got something
          }
          errorMsg = "Didn't catch that — try again.";
          break;
        case 'audio-capture':
          errorMsg = "No microphone was detected. Please check your hardware.";
          break;
        case 'network':
          errorMsg = "Network connection lost. Speech recognition requires an active internet connection. Please check your network and try again.";
          break;
        case 'aborted':
          errorMsg = "Speech recognition aborted.";
          break;
      }

      // If aborted, just idle silently. Otherwise, show user error message.
      if (errCode === 'aborted') {
        this.setState('idle');
      } else {
        this.onError(errorMsg);
        this.setState('error');
      }

      this.notifyDiagnostics();

      setTimeout(() => {
        if (this.state === 'error') {
          this.setState('idle');
        }
      }, 3000);
    };

    this.recognition.onend = () => {
      this.logDev('recognition ended');
      this.lastEvent = 'onend';

      if (this.hasFinalResult && this.finalTranscriptReceived) {
        this.setState('processing');
        this.onResult(this.finalTranscriptReceived);
      } else if (this.lastInterimTranscript && this.state !== 'error') {
        // Fallback to interim transcript
        this.logDev('falling back to interim transcript');
        this.setState('processing');
        this.onResult(this.lastInterimTranscript);
      } else if (this.state === 'listening') {
        // No final transcript received
        this.onError("I didn't catch that. Please try again.");
        this.setState('idle');
      } else if (this.state !== 'error') {
        this.setState('idle');
      }

      this.notifyDiagnostics();
    };

    try {
      this.recognition.start();
    } catch (e: any) {
      this.logDev('failed to start recognition:', e);
      this.lastError = e.message || String(e);
      this.onError(`Failed to start recognition: ${e.message || String(e)}`);
      this.setState('error');
      this.notifyDiagnostics();
      setTimeout(() => {
        if (this.state === 'error') this.setState('idle');
      }, 3000);
    }
  }

  private stopListeningSession() {
    if (this.recognition) {
      try {
        this.recognition.onstart = null;
        this.recognition.onaudiostart = null;
        this.recognition.onsoundstart = null;
        this.recognition.onspeechstart = null;
        this.recognition.onresult = null;
        this.recognition.onspeechend = null;
        this.recognition.onsoundend = null;
        this.recognition.onaudioend = null;
        this.recognition.onerror = null;
        this.recognition.onend = null;
        this.recognition.stop();
      } catch (_) {}
      this.recognition = null;
    }
  }

  stopListening() {
    this.stopListeningSession();
    if (this.state === 'listening' || this.state === 'processing') {
      this.setState('idle');
    }
  }

  reset() {
    this.stopListeningSession();
    if (this.synthesis && this.synthesis.speaking) {
      try { this.synthesis.cancel(); } catch (_) {}
    }
    this.setState('idle');
  }

  speak(text: string) {
    if (!this.synthesis) {
      return;
    }

    this.stopSpeaking();
    this.stopListening();

    const cleanText = text.replace(/[*_#]/g, '').replace(/\[.*?\]\(.*?\)/g, '').replace(/```[\s\S]*?```/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);

    const voices = this.synthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha') || (v.lang === 'en-US' && v.name.includes('Female')));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      this.setState('speaking');
    };

    utterance.onend = () => {
      this.setState('idle');
    };

    utterance.onerror = () => {
      this.setState('idle');
    };

    this.synthesis.speak(utterance);
  }

  stopSpeaking() {
    if (this.synthesis && this.synthesis.speaking) {
      this.synthesis.cancel();
      this.setState('idle');
    }
  }

  isListening() {
    return this.state === 'listening';
  }

  isSpeaking() {
    return this.state === 'speaking';
  }

  destroy() {
    this.stopListeningSession();
    this.stopSpeaking();
  }

  getState() {
    return this.state;
  }
}

