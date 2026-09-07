import { VoiceProvider, VoiceSettings, defaultVoiceSettings, VoiceInfo, GEMINI_LIVE_VOICES } from './VoiceProvider';
import { WebSpeechVoiceProvider } from './WebSpeechVoiceProvider';

export class VoiceEngine {
  private provider: VoiceProvider;
  private queue: string[] = [];
  private onStateChange: ((state: 'idle' | 'speaking' | 'paused') => void) | null = null;
  private isCurrentlySpeaking = false;
  private currentTimeout: any = null;

  public settings: VoiceSettings = { ...defaultVoiceSettings };

  constructor() {
    this.provider = new WebSpeechVoiceProvider();
    this.loadSettings();
    
    this.provider.onReady = () => {
      // Setup default voice if needed
    };
  }

  private loadSettings() {
    const saved = localStorage.getItem('zara_voice_settings_v3');
    if (saved) {
      try {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      } catch (e) {}
    }
  }

  public saveSettings(newSettings: Partial<VoiceSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    localStorage.setItem('zara_voice_settings_v3', JSON.stringify(this.settings));
  }

  public getVoices(): VoiceInfo[] {
    const webVoices = this.provider.getVoices();
    return [...GEMINI_LIVE_VOICES, ...webVoices];
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
      this.isCurrentlySpeaking = false;
      this.notifyState('idle');
      return;
    }

    const chunk = this.queue.shift();
    if (!chunk) {
      this.playNext();
      return;
    }

    this.isCurrentlySpeaking = true;

    // Autoplay blocked check
    if (this.currentTimeout) clearTimeout(this.currentTimeout);
    this.currentTimeout = setTimeout(() => {
      // If it hasn't started in 500ms, it might be blocked
      if (this.isCurrentlySpeaking) {
        console.warn("Speech possibly blocked by browser.");
        window.dispatchEvent(new CustomEvent('zara_tts_blocked'));
        this.stop();
      }
    }, 500);

    this.provider.speak(chunk, this.settings, {
      onStart: () => {
        if (this.currentTimeout) clearTimeout(this.currentTimeout);
        this.notifyState('speaking');
      },
      onEnd: () => {
        this.isCurrentlySpeaking = false;
        this.playNext();
      },
      onError: (e) => {
        if (this.currentTimeout) clearTimeout(this.currentTimeout);
        console.warn('Speech synthesis error from provider', e);
        window.dispatchEvent(new CustomEvent('zara_tts_failed'));
        this.isCurrentlySpeaking = false;
        this.playNext(); // try next chunk
      }
    });
  }

  public stop() {
    this.queue = [];
    this.isCurrentlySpeaking = false;
    if (this.currentTimeout) clearTimeout(this.currentTimeout);
    this.provider.stop();
    this.notifyState('idle');
  }

  public pause() {
    this.provider.pause();
    this.notifyState('paused');
  }

  public resume() {
    this.provider.resume();
    this.notifyState('speaking');
  }

  public isSpeaking() {
    return this.isCurrentlySpeaking;
  }
}

export const voiceEngine = new VoiceEngine();
