// Abstracted Narration Service for AI Continuity Protocol
// Encapsulates browser native SpeechSynthesis API

export interface SpeakOptions {
  voiceURI?: string;
  rate?: number;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

let activeUtterance: SpeechSynthesisUtterance | null = null;

export const narrationService = {
  isSupported(): boolean {
    return typeof window !== "undefined" && !!window.speechSynthesis;
  },

  getVoices(): SpeechSynthesisVoice[] {
    if (!this.isSupported()) return [];
    return window.speechSynthesis.getVoices() || [];
  },

  speak(text: string, options?: SpeakOptions): void {
    if (!this.isSupported()) {
      if (options?.onError) options.onError(new Error("speechSynthesis not supported"));
      return;
    }

    // Cancel any active speech before starting a new one
    this.cancel();

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure voice
      if (options?.voiceURI) {
        const voices = this.getVoices();
        const selectedVoice = voices.find((v) => v.voiceURI === options.voiceURI);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      // Configure playback rate (speed)
      if (options?.rate !== undefined) {
        utterance.rate = options.rate;
      }

      // Event Handlers
      utterance.onend = () => {
        if (activeUtterance === utterance) {
          activeUtterance = null;
        }
        if (options?.onEnd) {
          options.onEnd();
        }
      };

      utterance.onerror = (event) => {
        if (activeUtterance === utterance) {
          activeUtterance = null;
        }
        // ignore error if it was cancelled by the user
        if (event.error !== "interrupted" && options?.onError) {
          options.onError(event);
        }
      };

      activeUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      if (options?.onError) {
        options.onError(error);
      }
    }
  },

  pause(): void {
    if (!this.isSupported()) return;
    window.speechSynthesis.pause();
  },

  resume(): void {
    if (!this.isSupported()) return;
    window.speechSynthesis.resume();
  },

  cancel(): void {
    if (!this.isSupported()) return;
    window.speechSynthesis.cancel();
    activeUtterance = null;
  }
};
