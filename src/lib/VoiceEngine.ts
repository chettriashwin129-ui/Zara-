export class VoiceEngine {
  private synthesis: SpeechSynthesis = window.speechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private queue: string[] = [];
  private onStateChange: ((state: 'idle' | 'speaking' | 'paused') => void) | null = null;
  private voice: SpeechSynthesisVoice | null = null;
  
  public settings = {
    enabled: true,
    autoSpeak: true,
    speed: 1.0,
    volume: 1.0,
    voiceURI: ''
  };

  constructor() {
    this.loadSettings();
    this.initVoices();
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = () => this.initVoices();
    }
  }

  private loadSettings() {
    const saved = localStorage.getItem('zara_voice_settings');
    if (saved) {
      try {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      } catch (e) {}
    }
  }

  public saveSettings(newSettings: Partial<typeof this.settings>) {
    this.settings = { ...this.settings, ...newSettings };
    localStorage.setItem('zara_voice_settings', JSON.stringify(this.settings));
    this.initVoices(); // re-select voice
  }

  public getVoices(): SpeechSynthesisVoice[] {
    return this.synthesis.getVoices();
  }

  private initVoices() {
    const voices = this.getVoices();
    if (voices.length === 0) return;

    if (this.settings.voiceURI) {
      const selected = voices.find(v => v.voiceURI === this.settings.voiceURI);
      if (selected) {
        this.voice = selected;
        return;
      }
    }

    // Default to a female English voice
    const preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha') || (v.lang === 'en-US' && v.name.includes('Female')));
    if (preferredVoice) {
      this.voice = preferredVoice;
      this.settings.voiceURI = preferredVoice.voiceURI;
    } else if (voices.length > 0) {
      this.voice = voices[0];
    }
  }

  public setOnStateChange(cb: (state: 'idle' | 'speaking' | 'paused') => void) {
    this.onStateChange = cb;
  }

  private notifyState(state: 'idle' | 'speaking' | 'paused') {
    if (this.onStateChange) this.onStateChange(state);
  }

  private cleanText(text: string): string {
    return text
      .replace(/\s*\`\`\`[\s\S]*?\`\`\`/g, '') // remove code blocks
      .replace(/[*_#`~>]/g, '')        // remove simple markdown characters
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // preserve link text
      .replace(/\n\s*\n/g, '. ')      // replace double newlines with period
      .replace(/\n/g, '. ')             // replace single newlines with period
      .replace(/\b1\.\s/g, 'First, ')
      .replace(/\b2\.\s/g, 'Second, ')
      .replace(/\b3\.\s/g, 'Third, ')
      .replace(/\b4\.\s/g, 'Fourth, ')
      .replace(/\b5\.\s/g, 'Fifth, ')
      .replace(/\.\s*\./g, '.')       // remove consecutive periods
      .trim();
  }

  private splitIntoChunks(text: string): string[] {
    // Basic sentence splitting by punctuation
    const regex = /([.?!])\s/g;
    const parts = text.split(regex);
    const chunks: string[] = [];
    
    for (let i = 0; i < parts.length; i += 2) {
      const sentence = parts[i];
      const punctuation = parts[i + 1] || '';
      if (sentence.trim()) {
        chunks.push(sentence.trim() + punctuation);
      }
    }
    
    // If no punctuation was found or text is very short, just use the whole text
    if (chunks.length === 0 && text.trim()) {
      chunks.push(text.trim());
    }
    
    return chunks;
  }

  public speak(text: string, force: boolean = false) {
    if (!this.settings.enabled) return;
    if (!force && !this.settings.autoSpeak) return;

    this.stop();
    
    const cleaned = this.cleanText(text);
    if (!cleaned) return;

    this.queue = this.splitIntoChunks(cleaned);
    this.playNext();
  }

  private playNext() {
    if (this.queue.length === 0) {
      this.notifyState('idle');
      return;
    }

    const chunk = this.queue.shift();
    if (!chunk) {
      this.playNext();
      return;
    }

    this.currentUtterance = new SpeechSynthesisUtterance(chunk);
    if (this.voice) {
      this.currentUtterance.voice = this.voice;
    }
    this.currentUtterance.rate = this.settings.speed;
    this.currentUtterance.volume = this.settings.volume;
    
    this.currentUtterance.onstart = () => {
      this.notifyState('speaking');
    };
    
    this.currentUtterance.onend = () => {
      this.currentUtterance = null;
      this.playNext();
    };
    
    this.currentUtterance.onerror = (e) => {
      
      console.error('Speech synthesis error', e);
      window.dispatchEvent(new CustomEvent('zara_tts_failed'));

      this.currentUtterance = null;
      // Do not stop entire queue on one chunk error, try next
      this.playNext();
    };

    try {
      
      // Set a timeout to detect autoplay blocking
      const autoplayCheck = setTimeout(() => {
        if (this.currentUtterance && !this.synthesis.speaking && !this.synthesis.pending) {
           console.warn("Speech blocked by browser.");
           // Dispatch event to show toast
           window.dispatchEvent(new CustomEvent('zara_tts_blocked'));
           this.stop();
        }
      }, 500);

      const oldOnStart = this.currentUtterance.onstart;
      this.currentUtterance.onstart = (e) => {
        clearTimeout(autoplayCheck);
        if (oldOnStart) oldOnStart.call(this.currentUtterance, e as any);
      };

      this.synthesis.speak(this.currentUtterance);

    } catch (e) {
      console.error('Failed to speak', e);
      this.notifyState('idle');
    }
  }

  public stop() {
    this.queue = [];
    if (this.synthesis.speaking || this.synthesis.pending) {
      this.synthesis.cancel();
    }
    this.currentUtterance = null;
    this.notifyState('idle');
  }

  public pause() {
    if (this.synthesis.speaking && !this.synthesis.paused) {
      this.synthesis.pause();
      this.notifyState('paused');
    }
  }

  public resume() {
    if (this.synthesis.paused) {
      this.synthesis.resume();
      this.notifyState('speaking');
    }
  }

  public isSpeaking() {
    return this.synthesis.speaking && !this.synthesis.paused;
  }
}

export const voiceEngine = new VoiceEngine();
