export interface VoiceSettings {
  enabled: boolean;
  autoSpeak: boolean;
  provider: 'gemini-live' | 'webspeech';
  liveVoice: string; // 'Aoede' | 'Kore' | 'Zephyr'
  voiceURI: string;
  language: string;
  speakingRate: number;
  pitch: number;
  volume: number;
}

export const defaultVoiceSettings: VoiceSettings = {
  enabled: true,
  autoSpeak: true,
  provider: 'gemini-live',
  liveVoice: 'Aoede', // Default to confirmed Female voice
  voiceURI: '',
  language: 'auto',
  speakingRate: 1.0,
  pitch: 1.0,
  volume: 1.0,
};

export interface VoiceInfo {
  id: string;
  name: string;
  lang: string;
  gender?: 'female' | 'male';
  isIndianFemale?: boolean;
  provider: string;
  description?: string;
}

export const GEMINI_LIVE_VOICES: VoiceInfo[] = [
  {
    id: 'Aoede',
    name: 'Aoede (Zara Female - Warm & Conversational)',
    lang: 'en-IN / hi-IN',
    gender: 'female',
    isIndianFemale: true,
    provider: 'Gemini Live Multimodal',
    description: 'Natural female conversational voice with fluent Hindi & Hinglish support'
  },
  {
    id: 'Kore',
    name: 'Kore (Zara Female - Gentle & Articulate)',
    lang: 'en-IN / hi-IN',
    gender: 'female',
    isIndianFemale: true,
    provider: 'Gemini Live Multimodal',
    description: 'Clear, gentle female voice for focused sessions'
  },
  {
    id: 'Zephyr',
    name: 'Zephyr (Zara Female - Bright & Energetic)',
    lang: 'en-IN / hi-IN',
    gender: 'female',
    isIndianFemale: true,
    provider: 'Gemini Live Multimodal',
    description: 'Bright and energetic tone for dynamic discussions'
  }
];

export interface VoiceProvider {
  name: string;
  isReady: boolean;
  onReady?: () => void;
  getVoices(): VoiceInfo[];
  speak(text: string, settings: VoiceSettings, callbacks: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: any) => void;
  }): void;
  stop(): void;
  pause(): void;
  resume(): void;
}
