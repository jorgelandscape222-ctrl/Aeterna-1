import React from "react";

interface ModeSelectProps {
  onSelect: (mode: 'scenario' | 'dashboard') => void;
}

export const ModeSelect: React.FC<ModeSelectProps> = ({ onSelect }) => {
  return (
    <div className="relative w-full min-h-screen bg-brand-bg text-brand-ink flex flex-col items-center justify-center overflow-hidden font-sans select-none px-4 py-8">
      {/* Small Aeterna mark at top */}
      <div className="flex flex-col items-center mb-10 text-center animate-fade-in" id="mode-select-header">
        <div className="w-16 h-16 mb-4 relative" id="mode-select-logo">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none" className="w-full h-full">
            <defs>
              <linearGradient id="aeternaModeAccent" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#818CF8"/>
                <stop offset="100%" stopColor="#6366F1"/>
              </linearGradient>
            </defs>
            <path d="M60 8 L105 34 L105 86 L60 112 L15 86 L15 34 Z" stroke="url(#aeternaModeAccent)" strokeWidth="4" strokeLinejoin="round"/>
            <path d="M44 86 L60 40 L76 86" stroke="url(#aeternaModeAccent)" strokeWidth="8.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M52 68 L68 68" stroke="url(#aeternaModeAccent)" strokeWidth="8.5" strokeLinecap="round"/>
            <circle cx="60" cy="98" r="4.5" fill="#818CF8"/>
          </svg>
        </div>
        <span className="text-xs font-mono tracking-[0.25em] text-brand-accent uppercase font-bold">
          SELECT MODE
        </span>
      </div>

      {/* Mode Selection Cards Container */}
      <div 
        className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl z-10 animate-cover-fade"
        id="mode-cards-container"
      >
        {/* Scenario mode */}
        <button
          onClick={() => onSelect('scenario')}
          className="group relative flex flex-col items-center text-center p-8 bg-brand-surface hover:bg-brand-surface/80 border border-brand-border hover:border-brand-accent/60 rounded-xl transition-all duration-300 shadow-xl hover:shadow-brand-accent/10 cursor-pointer hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-brand-accent"
          id="btn-mode-scenario"
        >
          {/* Subtle decoration accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-accent to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-xl" />
          
          <div className="w-12 h-12 rounded-lg bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent mb-5 group-hover:scale-110 transition-transform duration-300">
            {/* Visual scenario icon */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-.621-.504-1.125-1.125-1.125H9.75M8.25 21a2.25 2.25 0 0 1-2.25-2.25V6.75A2.25 2.25 0 0 1 8.25 4.5h1.5a1.125 1.125 0 0 1 1.02.684l.664 1.66A1.125 1.125 0 0 0 12.47 7.5h3.03A2.25 2.25 0 0 1 17.75 9.75V18.75a2.25 2.25 0 0 1-2.25 2.25H8.25Z" />
            </svg>
          </div>

          <h3 className="text-lg font-bold text-white tracking-wider mb-2 font-mono uppercase group-hover:text-brand-accent transition-colors">
            Scripted Scenario
          </h3>
          <p className="text-xs text-brand-ink-dim leading-relaxed">
            Guided walkthrough of a protocol failure, step by step.
          </p>
        </button>

        {/* Dashboard mode */}
        <button
          onClick={() => onSelect('dashboard')}
          className="group relative flex flex-col items-center text-center p-8 bg-brand-surface hover:bg-brand-surface/80 border border-brand-border hover:border-brand-accent/60 rounded-xl transition-all duration-300 shadow-xl hover:shadow-brand-accent/10 cursor-pointer hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-brand-accent"
          id="btn-mode-dashboard"
        >
          {/* Subtle decoration accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-brand-accent opacity-0 group-hover:opacity-100 transition-opacity rounded-t-xl" />
          
          <div className="w-12 h-12 rounded-lg bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent mb-5 group-hover:scale-110 transition-transform duration-300">
            {/* Visual dashboard icon */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
            </svg>
          </div>

          <h3 className="text-lg font-bold text-white tracking-wider mb-2 font-mono uppercase group-hover:text-brand-accent transition-colors">
            Explore Dashboard
          </h3>
          <p className="text-xs text-brand-ink-dim leading-relaxed">
            Browse the eight protocol stages at your own pace.
          </p>
        </button>
      </div>

      {/* Decorative Specifications Lineage Indicator Footer */}
      <div className="absolute bottom-6 text-[9px] font-mono text-brand-ink-dim opacity-30 uppercase pointer-events-none" aria-hidden="true">
        Aeterna Core Configuration Router
      </div>
    </div>
  );
};
