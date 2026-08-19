import { LanguageCode } from '../types/farming';
import { SUPPORTED_LANGUAGES } from '../data/i18n';

// Speech Recognition & Text to Speech Assistant for Indian Languages

interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
  };
}

export class VoiceAssistant {
  private recognition: any = null;
  private isListening = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
      }
    }
  }

  public isSupported(): boolean {
    return Boolean(this.recognition);
  }

  public startListening(
    langCode: LanguageCode,
    onResult: (transcript: string) => void,
    onError: (err: any) => void,
    onEnd: () => void
  ) {
    if (!this.recognition) {
      onError(new Error('Speech recognition is not supported in this browser. Please type or open in a browser supporting Web Speech API.'));
      return;
    }

    const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === langCode);
    const locale = langObj ? langObj.speechLocale : 'hi-IN';

    this.recognition.lang = locale;

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      onError(event.error || event);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onEnd();
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.warn('Recognition start caught error:', e);
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
    }
  }

  public speak(text: string, langCode: LanguageCode, onEnd?: () => void) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    window.speechSynthesis.cancel(); // Stop any prior speech

    // Clean markdown symbols for natural speech
    const cleanText = text
      .replace(/[#*`_~]/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .slice(0, 450); // limit spoken length for comfort

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === langCode);
    utterance.lang = langObj ? langObj.speechLocale : 'hi-IN';
    utterance.rate = 0.95; // Slightly slower for clarity in rural terms
    utterance.pitch = 1.0;

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const voiceAssistant = new VoiceAssistant();
