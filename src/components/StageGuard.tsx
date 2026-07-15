import React from "react";
import { AlertCircle } from "lucide-react";
import { Requirement } from "../data/prerequisites";

interface StageGuardProps {
  requirement: Requirement;
  onCta: () => void;
}

export const StageGuard: React.FC<StageGuardProps> = ({ requirement, onCta }) => {
  return (
    <div className="bg-brand-bg p-8 rounded border border-brand-border text-center flex flex-col items-center justify-center space-y-4">
      <AlertCircle className="w-10 h-10 text-brand-accent animate-pulse" />
      <h3 className="text-sm font-semibold text-slate-300 font-mono uppercase tracking-wider">
        {requirement.title}
      </h3>
      <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
        {requirement.message}
      </p>
      <button
        type="button"
        onClick={onCta}
        className="bg-brand-accent hover:bg-indigo-500 text-white font-semibold text-xs py-2 px-4 rounded transition duration-200 cursor-pointer shadow-sm hover:shadow-indigo-500/10 font-mono uppercase tracking-wider"
      >
        {requirement.ctaLabel}
      </button>
    </div>
  );
};
