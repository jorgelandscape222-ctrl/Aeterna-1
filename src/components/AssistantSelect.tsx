import React from "react";

interface AssistantSelectProps {
  onSelect: (open: boolean) => void;
}

export const AssistantSelect: React.FC<AssistantSelectProps> = ({ onSelect }) => {
  return (
    <div className="relative w-full min-h-screen bg-brand-bg text-brand-ink flex flex-col items-center justify-center overflow-hidden font-sans select-none px-4 py-8">
      {/* Small Aeterna mark at top */}
      <div className="flex flex-col items-center mb-10 text-center animate-fade-in" id="assistant-select-header">
        <div className="w-16 h-16 mb-4 relative" id="assistant-select-logo">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none" className="w-full h-full">
            <defs>
              <linearGradient id="aeternaAssistAccent" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#818CF8"/>
                <stop offset="100%" stopColor="#6366F1"/>
              </linearGradient>
            </defs>
            <path d="M60 8 L105 34 L105 86 L60 112 L15 86 L15 34 Z" stroke="url(#aeternaAssistAccent)" strokeWidth="4" strokeLinejoin="round"/>
            <path d="M44 86 L60 40 L76 86" stroke="url(#aeternaAssistAccent)" strokeWidth="8.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M52 68 L68 68" stroke="url(#aeternaAssistAccent)" strokeWidth="8.5" strokeLinecap="round"/>
            <circle cx="60" cy="98" r="4.5" fill="#818CF8"/>
          </svg>
        </div>
        <span className="text-xs font-mono tracking-[0.25em] text-brand-accent uppercase font-bold">
          AI ASSISTANT
        </span>
      </div>

      {/* Choice Container */}
      <div 
        className="relative flex flex-col items-center p-8 bg-brand-surface border border-brand-border rounded-xl shadow-2xl max-w-md w-full text-center z-10 animate-cover-fade"
        id="assistant-choice-card"
      >
        <div className="w-12 h-12 rounded-full bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent mb-5 animate-pulse">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
          </svg>
        </div>

        <h3 className="text-xl font-bold text-white tracking-wide mb-2 uppercase font-mono">
          Load AI Assistant?
        </h3>
        <p className="text-xs text-brand-ink-dim leading-relaxed mb-6">
          The Aeterna assistant can guide you through the protocol specification, answer technical questions, and help explain continuity stages in real time.
          <span className="block mt-2 text-[10px] text-brand-ink-dim/70">
            You can always launch it later from the bottom-left of the dashboard.
          </span>
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full" id="assistant-choice-buttons">
          <button
            onClick={() => onSelect(true)}
            className="flex-1 relative px-5 py-3 bg-brand-accent hover:bg-indigo-500 text-white font-mono text-xs font-bold uppercase tracking-widest rounded transition-all duration-300 shadow-lg shadow-brand-accent/25 hover:shadow-brand-accent/40 cursor-pointer hover:-translate-y-0.5"
            id="btn-assistant-yes"
          >
            YES, OPEN IT
          </button>
          <button
            onClick={() => onSelect(false)}
            className="flex-1 relative px-5 py-3 bg-brand-surface-alt hover:bg-brand-border/40 border border-brand-border text-brand-ink-dim hover:text-white font-mono text-xs font-bold uppercase tracking-widest rounded transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
            id="btn-assistant-no"
          >
            NO, NOT NOW
          </button>
        </div>
      </div>

      {/* Decorative specifications watermark */}
      <div className="absolute bottom-6 text-[9px] font-mono text-brand-ink-dim opacity-30 uppercase pointer-events-none" aria-hidden="true">
        Aeterna Core Companion Layer
      </div>
    </div>
  );
};
