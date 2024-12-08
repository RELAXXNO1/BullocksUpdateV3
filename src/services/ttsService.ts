import { useState, useEffect } from 'react';

export class TTSService {
  private static instance: TTSService;
  private synthesis: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private preferredVoice: SpeechSynthesisVoice | null = null;

  private constructor() {
    this.synthesis = window.speechSynthesis;
    this.loadVoices();
  }

  public static getInstance(): TTSService {
    if (!TTSService.instance) {
      TTSService.instance = new TTSService();
    }
    return TTSService.instance;
  }

  private loadVoices(): void {
    // Get available voices
    const loadVoicesHandler = () => {
      this.voices = this.synthesis.getVoices();
      
      // Find a natural-sounding English female voice
      this.preferredVoice = this.voices.find(
        voice => 
          voice.lang.startsWith('en') && 
          voice.name.toLowerCase().includes('female') &&
          !voice.name.toLowerCase().includes('microsoft')
      ) || this.voices.find(
        voice => 
          voice.lang.startsWith('en') &&
          !voice.name.toLowerCase().includes('microsoft')
      ) || this.voices[0];
    };

    // Chrome requires a callback for getting voices
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = loadVoicesHandler;
    }

    loadVoicesHandler();
  }

  public speak(text: string, rate: number = 1, pitch: number = 1): void {
    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set speech properties
    utterance.voice = this.preferredVoice;
    utterance.rate = rate;  // Speed of speech (0.1 to 10)
    utterance.pitch = pitch;  // Pitch of voice (0 to 2)
    utterance.volume = 1;  // Volume (0 to 1)

    // Speak the text
    this.synthesis.speak(utterance);
  }

  public stop(): void {
    this.synthesis.cancel();
  }

  public isPaused(): boolean {
    return this.synthesis.paused;
  }

  public isSpeaking(): boolean {
    return this.synthesis.speaking;
  }

  public pause(): void {
    this.synthesis.pause();
  }

  public resume(): void {
    this.synthesis.resume();
  }
}

// React hook for using TTS
export const useTTS = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const ttsService = TTSService.getInstance();

  useEffect(() => {
    const checkStatus = setInterval(() => {
      setIsSpeaking(ttsService.isSpeaking());
      setIsPaused(ttsService.isPaused());
    }, 100);

    return () => {
      clearInterval(checkStatus);
      ttsService.stop();
    };
  }, []);

  const speak = (text: string, rate?: number, pitch?: number) => {
    ttsService.speak(text, rate, pitch);
  };

  const stop = () => {
    ttsService.stop();
  };

  const pause = () => {
    ttsService.pause();
  };

  const resume = () => {
    ttsService.resume();
  };

  return { speak, stop, pause, resume, isSpeaking, isPaused };
};
