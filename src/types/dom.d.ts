/// <reference types="dom" />
/// <reference lib="dom" />

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResult[];
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  isConfidenceFinal: boolean;
  transcript: string;
}

interface SpeechRecognition {
  grammars: any;
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxResults: number;
  minConfidence: number;
  onaudiostart: any;
  onaudioend: any;
  onmark: any;
  onnomatch: any;
  onresult: any;
  onerror: any;
  onstart: any;
  onend: any;
  start(): void;
  stop(): void;
  AbortController: any;
}
