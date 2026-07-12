import React, { useState } from "react";
import { useNarration, TOUR_STEPS } from "../context/NarrationContext";
import { 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  VolumeX, 
  Headphones, 
  ChevronUp, 
  ChevronDown, 
  SkipForward, 
  SkipBack, 
  Sparkles,
  Volume1,
  MessageSquare
} from "lucide-react";

export const NarrationControls: React.FC = () => {
  const {
    playbackState,
    currentlyNarratedSectionId,
    currentlyNarratedText,
    isTourActive,
    tourStepIndex,
    voices,
    preferences,
    isSupported,
    pause,
    resume,
    stop,
    startTour,
    skipTour,
    nextTourStep,
    prevTourStep,
    updatePreferences
  } = useNarration();

  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showTranscript, setShowTranscript] = useState<boolean>(true);

  if (!isSupported) return null; // Gracefully hide completely if speechSynthesis is not supported

  const isPlaying = playbackState === "playing";
  const isPaused = playbackState === "paused";
  const isStopped = playbackState === "idle";

  // Filter voices to english/system languages for better UX, or let them pick all
  const englishVoices = voices.filter(v => v.lang.startsWith("en")) || [];
  const displayVoices = englishVoices.length > 0 ? englishVoices : voices;

  return (
    <div 
      className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 max-w-[360px] xs:max-w-[400px] w-[calc(100vw-2rem)] select-none font-mono"
      id="narration-floating-container"
    >
      {/* 1. Subtitle/Transcript Sub-panel (Expander Caption Box) */}
      {showTranscript && currentlyNarratedText && !isStopped && (
        <div 
          className="w-full bg-slate-900/95 border border-brand-accent/40 rounded p-3 text-xs leading-relaxed text-slate-100 shadow-2xl backdrop-blur-md animate-fade-in"
          id="narration-transcript-panel"
        >
          <div className="flex items-center justify-between border-b border-brand-border/60 pb-1.5 mb-1.5">
            <span className="text-[10px] uppercase font-bold text-brand-accent tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-ping" />
              {isTourActive ? `Tour Step ${tourStepIndex + 1} of 8` : "Audio Narration"}
            </span>
            <button 
              onClick={() => setShowTranscript(false)}
              className="text-[9px] text-slate-500 hover:text-slate-300 font-bold uppercase cursor-pointer"
            >
              Hide Captions
            </button>
          </div>
          <p className="font-sans text-slate-200 antialiased italic">
            "{currentlyNarratedText}"
          </p>
        </div>
      )}

      {/* 2. Floating Controller Body */}
      <div 
        className={`bg-brand-surface border rounded-lg shadow-2xl transition-all duration-300 backdrop-blur-md overflow-hidden w-full ${
          isTourActive ? "border-brand-accent/50" : "border-brand-border"
        }`}
        id="narration-controls-card"
      >
        {/* Toggle Bar / Header */}
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-brand-surface-alt px-3.5 py-2.5 flex items-center justify-between cursor-pointer border-b border-brand-border/60"
        >
          <div className="flex items-center gap-2">
            <Headphones className={`w-4 h-4 text-brand-accent ${isPlaying ? "animate-bounce" : ""}`} />
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {isTourActive ? "CONTINUITY TOUR" : "GUIDED AUDIO"}
              </span>
              {isTourActive && (
                <span className="text-[9px] text-brand-accent block font-bold leading-none mt-0.5">
                  STEP {tourStepIndex + 1} OF 8
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Mute Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                updatePreferences({ muted: !preferences.muted });
              }}
              className={`p-1.5 rounded hover:bg-brand-surface/80 text-slate-400 hover:text-white transition cursor-pointer`}
              title={preferences.muted ? "Unmute" : "Mute"}
            >
              {preferences.muted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
          </div>
        </div>

        {/* Collapsible Content */}
        {isExpanded && (
          <div className="p-3.5 space-y-3 bg-brand-surface/90">
            {/* Tour Controls Progress Bar */}
            {isTourActive && (
              <div className="space-y-1.5 border-b border-brand-border/40 pb-2.5">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 font-bold uppercase">
                    {TOUR_STEPS[tourStepIndex]?.title || "Walkthrough"}
                  </span>
                  <button 
                    onClick={skipTour}
                    className="text-rose-400 hover:text-rose-300 font-bold uppercase cursor-pointer text-[9px]"
                  >
                    Skip Tour
                  </button>
                </div>
                {/* Progress bar */}
                <div className="h-1 bg-brand-bg rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-accent transition-all duration-300"
                    style={{ width: `${((tourStepIndex + 1) / TOUR_STEPS.length) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Playback Button Deck */}
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1">
                {/* Skip Back */}
                {isTourActive && (
                  <button
                    onClick={prevTourStep}
                    disabled={tourStepIndex <= 0}
                    className="p-1.5 bg-brand-bg hover:bg-brand-surface-alt border border-brand-border hover:border-slate-600 rounded text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                    title="Previous Stage"
                  >
                    <SkipBack className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Play / Pause */}
                {isStopped ? (
                  <button
                    onClick={startTour}
                    className="flex items-center gap-1 text-xs font-bold bg-brand-accent hover:bg-indigo-500 text-white px-3 py-1.5 rounded transition cursor-pointer shadow-sm shadow-brand-accent/20"
                    title="Start Tour"
                  >
                    <Play className="w-3 h-3 fill-current" /> Play Tour
                  </button>
                ) : (
                  <>
                    {isPlaying ? (
                      <button
                        onClick={pause}
                        className="flex items-center gap-1 text-xs font-bold bg-brand-bg border border-brand-border hover:bg-brand-surface-alt text-slate-200 px-3 py-1.5 rounded transition cursor-pointer"
                        title="Pause"
                      >
                        <Pause className="w-3 h-3 fill-current" /> Pause
                      </button>
                    ) : (
                      <button
                        onClick={resume}
                        className="flex items-center gap-1 text-xs font-bold bg-brand-accent hover:bg-indigo-500 text-white px-3 py-1.5 rounded transition cursor-pointer"
                        title="Resume"
                      >
                        <Play className="w-3 h-3 fill-current" /> Resume
                      </button>
                    )}
                  </>
                )}

                {/* Stop */}
                {!isStopped && (
                  <button
                    onClick={stop}
                    className="p-1.5 bg-brand-bg hover:bg-brand-surface-alt border border-brand-border hover:border-slate-600 rounded text-rose-400 transition cursor-pointer"
                    title="Stop Narration"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                  </button>
                )}

                {/* Skip Forward */}
                {isTourActive && (
                  <button
                    onClick={nextTourStep}
                    disabled={tourStepIndex >= TOUR_STEPS.length - 1}
                    className="p-1.5 bg-brand-bg hover:bg-brand-surface-alt border border-brand-border hover:border-slate-600 rounded text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                    title="Next Stage"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Utility Toggles */}
              <div className="flex gap-1">
                {currentlyNarratedText && isStopped && (
                  <button
                    onClick={() => setShowTranscript(!showTranscript)}
                    className={`p-1.5 rounded text-slate-400 hover:text-white transition cursor-pointer ${
                      showTranscript ? "bg-brand-accent/20 text-brand-accent" : ""
                    }`}
                    title="Toggle Subtitle Transcript"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`text-[10px] font-bold px-2 py-1 border rounded transition cursor-pointer font-mono ${
                    showSettings 
                      ? "bg-brand-accent border-brand-accent text-white" 
                      : "bg-brand-bg border-brand-border hover:border-slate-600 text-slate-400"
                  }`}
                >
                  Configure
                </button>
              </div>
            </div>

            {/* Voice & Speed Configuration Subpanel */}
            {showSettings && (
              <div className="bg-brand-bg p-3 rounded border border-brand-border/60 space-y-2.5 text-[10px] animate-fade-in">
                {/* Voice picker */}
                <div className="space-y-1">
                  <label className="text-slate-500 font-bold uppercase tracking-wider block">Voice Engine</label>
                  <select
                    value={preferences.voiceURI}
                    onChange={(e) => updatePreferences({ voiceURI: e.target.value })}
                    className="w-full bg-brand-surface text-slate-200 border border-brand-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-accent text-[9px] font-mono leading-tight"
                  >
                    {displayVoices.map((voice) => (
                      <option key={voice.voiceURI} value={voice.voiceURI}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Speed rate control slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-500 font-bold uppercase tracking-wider">
                    <span>Narration Speed</span>
                    <span className="text-brand-accent font-semibold">{preferences.rate}x</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-mono">0.75x</span>
                    <input
                      type="range"
                      min="0.75"
                      max="1.5"
                      step="0.05"
                      value={preferences.rate}
                      onChange={(e) => updatePreferences({ rate: parseFloat(e.target.value) })}
                      className="flex-1 accent-brand-accent h-1 bg-brand-surface rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-slate-500 font-mono">1.5x</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Tour launcher on clean/idle state */}
            {isStopped && (
              <button
                onClick={startTour}
                className="w-full py-1.5 px-3 bg-brand-surface-alt border border-brand-border hover:border-brand-accent/50 text-slate-300 hover:text-white rounded text-[10px] font-bold uppercase flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-accent" /> Play Architectural Walkthrough
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
