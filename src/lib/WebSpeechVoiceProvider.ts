import { VoiceProvider, VoiceInfo, VoiceSettings } from './VoiceProvider';

export class WebSpeechVoiceProvider implements VoiceProvider {
  name = 'Web Speech API';
  isReady = false;
  onReady?: () => void;
  
  private synthesis = window.speechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    this.initVoices();
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = () => {
        this.initVoices();
      };
    }
  }

  private initVoices() {
    this.voices = this.synthesis.getVoices();
    if (this.voices.length > 0) {
      this.isReady = true;
      if (this.onReady) this.onReady();
    }
  }

  getVoices(): VoiceInfo[] {
    return this.voices.map((v) => {
      // Very basic heuristic to find Indian Female voices in default system voices
      const isIndian = v.lang.includes('en-IN') || v.lang.includes('hi-IN');
      const isFemale = v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('lekha'); // common names
      return {
        id: v.voiceURI,
        name: v.name,
        lang: v.lang,
        isIndianFemale: isIndian, // Assume true if Indian for now, or use stronger heuristics if needed
        provider: this.name,
      };
    });
  }

  speak(text: string, settings: VoiceSettings, callbacks: { onStart?: () => void; onEnd?: () => void; onError?: (error: any) => void }) {
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Select Voice
    let selectedVoice: SpeechSynthesisVoice | undefined;
    
    if (settings.voiceURI) {
      selectedVoice = this.voices.find(v => v.voiceURI === settings.voiceURI);
    }
    
    if (!selectedVoice) {
      // Default to Indian female voice
      selectedVoice = this.voices.find(v => (v.lang === 'en-IN' || v.lang === 'hi-IN') && v.name.toLowerCase().includes('female'))
        || this.voices.find(v => v.lang === 'en-IN' || v.lang === 'hi-IN')
        || this.voices.find(v => v.lang === 'en-US' && v.name.toLowerCase().includes('female'))
        || this.voices[0];
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.rate = settings.speakingRate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;
    if (settings.language !== 'auto') {
      utterance.lang = settings.language;
    }

    utterance.onstart = () => {
      if (callbacks.onStart) callbacks.onStart();
    };
    
    utterance.onend = () => {
      this.currentUtterance = null;
      if (callbacks.onEnd) callbacks.onEnd();
    };
    
    utterance.onerror = (e) => {
      this.currentUtterance = null;
      if (callbacks.onError) callbacks.onError(e);
    };

    this.currentUtterance = utterance;
    
    try {
      this.synthesis.speak(utterance);
    } catch (e) {
      if (callbacks.onError) callbacks.onError(e);
    }
  }

  stop() {
    if (this.synthesis.speaking || this.synthesis.pending) {
      this.synthesis.cancel();
    }
    this.currentUtterance = null;
  }

  pause() {
    if (this.synthesis.speaking && !this.synthesis.paused) {
      this.synthesis.pause();
    }
  }

  resume() {
    if (this.synthesis.paused) {
      this.synthesis.resume();
    }
  }
}
