import React, { useState } from "react";
import { useNarration } from "../context/NarrationContext";
import { NARRATION_SCRIPTS } from "../data/narrationScripts";
import { Volume2, VolumeX, Eye, EyeOff, Play, Square, FileText } from "lucide-react";

interface SectionNarrationHeaderProps {
  sectionId: string;
}

export const SectionNarrationHeader: React.FC<SectionNarrationHeaderProps> = ({ sectionId }) => {
  const {
    playbackState,
    currentlyNarratedSectionId,
    playSection,
    stop,
    preferences
  } = useNarration();

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const script = NARRATION_SCRIPTS[sectionId];
  if (!script) return null;

  const isCurrent = currentlyNarratedSectionId === sectionId;
  const isPlaying = isCurrent && playbackState === "playing";

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      stop();
    } else {
      playSection(sectionId);
    }
  };

  return (
    <div 
      className="bg-brand-bg/80 border border-brand-border rounded-md p-3.5 space-y-2.5 font-mono mb-4 transition-all"
      id={`section-narration-header-${sectionId}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isPlaying ? "bg-brand-accent animate-pulse" : "bg-slate-700"}`} />
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Audio Assistant / {script.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Play/Stop Button */}
          <button
            onClick={handleTogglePlay}
            className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded transition cursor-pointer select-none uppercase ${
              isPlaying
                ? "bg-rose-950/40 text-rose-400 border border-rose-900 hover:bg-rose-900/30"
                : "bg-brand-surface-alt hover:bg-brand-surface text-brand-accent border border-brand-border/80"
            }`}
            title={isPlaying ? "Stop Explaining" : "Read Aloud"}
          >
            {isPlaying ? (
              <>
                <Square className="w-3 h-3 fill-current" /> Stop explanation
              </>
            ) : (
              <>
                <Volume2 className="w-3 h-3" /> Tap to hear explanation
              </>
            )}
          </button>

          {/* Transcript Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-slate-200 px-2 py-1 rounded border border-brand-border/50 hover:border-slate-500 transition cursor-pointer select-none"
            title="Toggle Transcript Text"
          >
            <FileText className="w-3 h-3" />
            <span>{isOpen ? "Hide Copy" : "Show Copy"}</span>
          </button>
        </div>
      </div>

      {/* Collapsible exact transcript */}
      {isOpen && (
        <div 
          className="p-3 bg-brand-surface rounded border border-brand-border/60 text-[11px] leading-relaxed text-slate-300 font-sans italic"
          id={`transcript-text-${sectionId}`}
        >
          <span className="font-mono text-[9px] uppercase font-bold text-brand-accent tracking-widest block mb-1">
            Exact Spoken Transcript
          </span>
          "{script.sectionScript}"
        </div>
      )}
    </div>
  );
};
