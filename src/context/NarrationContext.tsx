import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { narrationService, SpeakOptions } from "../utils/narrationService";
import { NARRATION_SCRIPTS, WELCOME_SCRIPT } from "../data/narrationScripts";

export interface NarrationPreferences {
  muted: boolean;
  voiceURI: string;
  rate: number;
}

export interface TourStep {
  id: string; // script id
  tabId: string; // tab to auto-focus
  title: string;
}

export const TOUR_STEPS: TourStep[] = [
  { id: "triggerDetection", tabId: "trigger", title: "Detecting the Trigger" },
  { id: "preservation", tabId: "snapshot", title: "Taking the Snapshot" },
  { id: "continuityBundle", tabId: "bundle", title: "Packaging the Bundle" },
  { id: "identityLineage", tabId: "lineage", title: "Identity & Lineage" },
  { id: "governance", tabId: "governance", title: "Governance & Control" },
  { id: "reconstitution", tabId: "sandbox", title: "Reconstitution & Validation" },
  { id: "funding", tabId: "commercialization", title: "Funding Continuity" },
  { id: "commercialization", tabId: "commercialization", title: "Commercialization & Rights" }
];

interface NarrationContextType {
  playbackState: "idle" | "playing" | "paused";
  currentlyNarratedSectionId: string | null;
  currentlyNarratedText: string | null;
  isTourActive: boolean;
  tourStepIndex: number;
  voices: SpeechSynthesisVoice[];
  preferences: NarrationPreferences;
  isSupported: boolean;
  
  playWelcome: () => void;
  playSection: (id: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  startTour: () => void;
  skipTour: () => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  updatePreferences: (prefs: Partial<NarrationPreferences>) => void;
  onTabChangeExternal: (tabId: string) => void;
}

const NarrationContext = createContext<NarrationContextType | undefined>(undefined);

export const NarrationProvider: React.FC<{ children: React.ReactNode; setActiveTab: (tabId: string) => void }> = ({
  children,
  setActiveTab
}) => {
  const isSupported = narrationService.isSupported();

  // Load preferences from localStorage with fallback defaults
  const [preferences, setPreferencesState] = useState<NarrationPreferences>(() => {
    try {
      const saved = localStorage.getItem("aeterna-narration-prefs");
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          muted: typeof parsed.muted === "boolean" ? parsed.muted : false,
          voiceURI: typeof parsed.voiceURI === "string" ? parsed.voiceURI : "",
          rate: typeof parsed.rate === "number" ? parsed.rate : 1.0
        };
      }
    } catch (e) {
      console.warn("Failed to load narration preferences", e);
    }
    return { muted: false, voiceURI: "", rate: 1.0 };
  });

  const [playbackState, setPlaybackState] = useState<"idle" | "playing" | "paused">("idle");
  const [currentlyNarratedSectionId, setCurrentlyNarratedSectionId] = useState<string | null>(null);
  const [currentlyNarratedText, setCurrentlyNarratedText] = useState<string | null>(null);
  const [isTourActive, setIsTourActive] = useState<boolean>(false);
  const [tourStepIndex, setTourStepIndex] = useState<number>(-1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const tourStepIndexRef = useRef(tourStepIndex);
  const isTourActiveRef = useRef(isTourActive);
  const preferencesRef = useRef(preferences);

  // Keep refs in sync for callback access
  useEffect(() => {
    tourStepIndexRef.current = tourStepIndex;
  }, [tourStepIndex]);

  useEffect(() => {
    isTourActiveRef.current = isTourActive;
  }, [isTourActive]);

  useEffect(() => {
    preferencesRef.current = preferences;
  }, [preferences]);

  // Load available voices
  useEffect(() => {
    if (!isSupported) return;

    const updateVoices = () => {
      const available = narrationService.getVoices();
      setVoices(available);
      
      // Select a default voice if none saved
      setPreferencesState((prev) => {
        if (!prev.voiceURI && available.length > 0) {
          // Prefer google/natural voices, or default to the first English/system voice
          const prefVoice = available.find(v => v.lang.includes("en") && v.name.toLowerCase().includes("google")) 
            || available.find(v => v.lang.includes("en"))
            || available[0];
          return { ...prev, voiceURI: prefVoice ? prefVoice.voiceURI : "" };
        }
        return prev;
      });
    };

    updateVoices();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [isSupported]);

  // Save preferences to localStorage whenever they change
  const updatePreferences = useCallback((newPrefs: Partial<NarrationPreferences>) => {
    setPreferencesState((prev) => {
      const updated = { ...prev, ...newPrefs };
      localStorage.setItem("aeterna-narration-prefs", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Stop any active speech
  const stop = useCallback(() => {
    narrationService.cancel();
    setPlaybackState("idle");
    setCurrentlyNarratedSectionId(null);
    setCurrentlyNarratedText(null);
    setIsTourActive(false);
    setTourStepIndex(-1);
  }, []);

  const pause = useCallback(() => {
    if (playbackState === "playing") {
      narrationService.pause();
      setPlaybackState("paused");
    }
  }, [playbackState]);

  const resume = useCallback(() => {
    if (playbackState === "paused") {
      narrationService.resume();
      setPlaybackState("playing");
    }
  }, [playbackState]);

  // General speech wrapper respecting user preferences
  const speakText = useCallback((
    text: string, 
    sectionId: string, 
    onEndCallback?: () => void
  ) => {
    setCurrentlyNarratedSectionId(sectionId);
    setCurrentlyNarratedText(text);

    if (preferencesRef.current.muted) {
      setPlaybackState("playing");
      // If muted, we simulate speaking visually and wait for a simulated read duration
      // (approx 45 chars per second, with a minimum of 4 seconds so the text remains readable)
      const durationMs = Math.max(4000, (text.length / 45) * 1000);
      const timer = setTimeout(() => {
        setPlaybackState("idle");
        if (onEndCallback) onEndCallback();
      }, durationMs);

      return () => clearTimeout(timer);
    }

    setPlaybackState("playing");
    narrationService.speak(text, {
      voiceURI: preferencesRef.current.voiceURI,
      rate: preferencesRef.current.rate,
      onEnd: () => {
        setPlaybackState("idle");
        if (onEndCallback) onEndCallback();
      },
      onError: (err) => {
        console.error("TTS speech error", err);
        setPlaybackState("idle");
        // Proceed on error so the tour doesn't get permanently stuck
        if (onEndCallback) onEndCallback();
      }
    });

    return () => {};
  }, []);

  // Forward declarations for tour control
  const executeTourStep = useCallback((stepIdx: number) => {
    if (stepIdx < 0 || stepIdx >= TOUR_STEPS.length) {
      stop();
      // Mark tour as completed
      localStorage.setItem("aeterna-tour-dismissed", "true");
      localStorage.setItem("aeterna-onboarded", "true");
      return;
    }

    setTourStepIndex(stepIdx);
    const step = TOUR_STEPS[stepIdx];
    
    // Auto-advance the UI tab
    setActiveTab(step.tabId);

    const script = NARRATION_SCRIPTS[step.id];
    if (!script) {
      stop();
      return;
    }

    speakText(script.tourScript, step.id, () => {
      // Delay slightly before moving to the next step for conversational pacing
      setTimeout(() => {
        if (isTourActiveRef.current && tourStepIndexRef.current === stepIdx) {
          executeTourStep(stepIdx + 1);
        }
      }, 1500);
    });
  }, [setActiveTab, speakText, stop]);

  const startTour = useCallback(() => {
    stop();
    setIsTourActive(true);
    setTourStepIndex(-1);
    
    // First play the welcome message, then kick off step 0
    speakText(WELCOME_SCRIPT, "welcome", () => {
      setTimeout(() => {
        if (isTourActiveRef.current) {
          executeTourStep(0);
        }
      }, 1200);
    });
  }, [stop, speakText, executeTourStep]);

  const playWelcome = useCallback(() => {
    stop();
    speakText(WELCOME_SCRIPT, "welcome");
  }, [stop, speakText]);

  const playSection = useCallback((id: string) => {
    // Avoid double-narrating the same section twice in a row
    if (currentlyNarratedSectionId === id && playbackState === "playing") {
      return;
    }

    stop();
    const script = NARRATION_SCRIPTS[id];
    if (script) {
      speakText(script.sectionScript, id);
    }
  }, [stop, speakText, currentlyNarratedSectionId, playbackState]);

  const skipTour = useCallback(() => {
    stop();
    localStorage.setItem("aeterna-tour-dismissed", "true");
    localStorage.setItem("aeterna-onboarded", "true");
  }, [stop]);

  const nextTourStep = useCallback(() => {
    if (!isTourActive) return;
    executeTourStep(tourStepIndex + 1);
  }, [isTourActive, tourStepIndex, executeTourStep]);

  const prevTourStep = useCallback(() => {
    if (!isTourActive || tourStepIndex <= 0) return;
    executeTourStep(tourStepIndex - 1);
  }, [isTourActive, tourStepIndex, executeTourStep]);

  // Handle external tab change manually made by user.
  // If user navigates away while tour is active, cancel the tour
  // to prioritize their self-guided exploration.
  const onTabChangeExternal = useCallback((tabId: string) => {
    if (isTourActive) {
      const currentStep = TOUR_STEPS[tourStepIndex];
      if (currentStep && currentStep.tabId !== tabId) {
        stop();
      }
    }
  }, [isTourActive, tourStepIndex, stop]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      narrationService.cancel();
    };
  }, []);

  return (
    <NarrationContext.Provider
      value={{
        playbackState,
        currentlyNarratedSectionId,
        currentlyNarratedText,
        isTourActive,
        tourStepIndex,
        voices,
        preferences,
        isSupported,
        playWelcome,
        playSection,
        pause,
        resume,
        stop,
        startTour,
        skipTour,
        nextTourStep,
        prevTourStep,
        updatePreferences,
        onTabChangeExternal
      }}
    >
      {children}
    </NarrationContext.Provider>
  );
};

export const useNarration = () => {
  const context = useContext(NarrationContext);
  if (context === undefined) {
    throw new Error("useNarration must be used within a NarrationProvider");
  }
  return context;
};
