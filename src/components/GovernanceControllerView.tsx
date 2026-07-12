import React from "react";
import { OperatingMode, ModelContinuationMode } from "../types";
import { Gavel, Users, ShieldAlert, FileSliders, Eye, EyeOff, Scale, HelpCircle } from "lucide-react";
import { SectionNarrationHeader } from "./SectionNarrationHeader";

interface GovernanceControllerViewProps {
  operatingMode: OperatingMode;
  continuationMode: ModelContinuationMode;
  onUpdateOperatingMode: (mode: OperatingMode) => void;
  onUpdateContinuationMode: (mode: ModelContinuationMode) => void;
}

export const GovernanceControllerView: React.FC<GovernanceControllerViewProps> = ({
  operatingMode,
  continuationMode,
  onUpdateOperatingMode,
  onUpdateContinuationMode,
}) => {
  const modesList = [
    {
      mode: OperatingMode.MEMORIAL,
      short: "MEMORIAL",
      desc: "Reflective interaction only. Accesses static memories; all transaction tools and outgoing API calls are hard-frozen.",
      badgeColor: "bg-purple-950 text-purple-300 border-purple-900",
      rules: ["API Tools: READ ONLY", "Spending Cap: $0.00", "Autonomy: NONE"],
    },
    {
      mode: OperatingMode.ADVISORY,
      short: "ADVISORY",
      desc: "Analysis and recommendations only. Can generate complex drafts but is blocked from executing or binding external actions.",
      badgeColor: "bg-blue-950 text-blue-300 border-blue-900",
      rules: ["API Tools: PREVIEW ONLY", "Spending Cap: $10.00/day", "Autonomy: ASSISTED"],
    },
    {
      mode: OperatingMode.ARCHIVAL,
      short: "ARCHIVAL",
      desc: "Bundle is kept safely cold-stored in escrow. The AI instance is completely spun down. No operational queries are served.",
      badgeColor: "bg-brand-bg text-brand-ink border-brand-border",
      rules: ["API Tools: OFFLINE", "Spending Cap: $0.00", "Autonomy: NONE"],
    },
    {
      mode: OperatingMode.DELEGATED,
      short: "DELEGATED",
      desc: "Authorized human supervisor must approve every outbound action via a manual gate before execution.",
      badgeColor: "bg-emerald-950 text-emerald-300 border-emerald-900",
      rules: ["API Tools: APPROVAL GATED", "Spending Cap: $200.00/day", "Autonomy: SUPERVISED"],
    },
    {
      mode: OperatingMode.SOVEREIGN,
      short: "SOVEREIGN",
      desc: "Operates autonomously under hard-coded constraints, strict spending limits, and mandatory fallback drift baselines.",
      badgeColor: "bg-rose-950 text-rose-300 border-rose-900",
      rules: ["API Tools: AUTONOMOUS", "Spending Cap: $50.00/day", "Autonomy: SELF-GOVERNED"],
    },
    {
      mode: OperatingMode.LICENSED_FORWARD,
      short: "LICENSED",
      desc: "Dedicated third-party is assigned temporary runtime licenses. Strict restrictions on purpose and fields-of-use apply.",
      badgeColor: "bg-indigo-950 text-indigo-300 border-indigo-900",
      rules: ["API Tools: RESTRICTED", "Spending Cap: Paid by Lessee", "Autonomy: LICENSED BOUNDS"],
    },
    {
      mode: OperatingMode.MARKETPLACE,
      short: "MARKETPLACE",
      desc: "Available in public registries for sale or license. Payout waterfall splits split revenues instantly to estate heirs.",
      badgeColor: "bg-amber-950 text-amber-300 border-amber-900",
      rules: ["API Tools: REGISTRY ACCESS", "Spending Cap: Dynamic", "Autonomy: ESCROW RULESET"],
    },
    {
      mode: OperatingMode.DISPUTE_HOLD,
      short: "DISPUTE HOLD",
      desc: "Escrowed and frozen due to conflicting successor claims. Remains locked down until legal or cryptographic resolution.",
      badgeColor: "bg-red-950 text-red-300 border-red-900",
      rules: ["API Tools: DISABLED", "Spending Cap: $0.00", "Autonomy: SUSPENDED"],
    },
  ];

  const continuationList = [
    {
      mode: ModelContinuationMode.PRESERVATION_LOCKED,
      title: "Preservation-Locked Mode",
      desc: "Absolute freezing of behavioral weights. Fine-tuning, prompt edits, and retraining are strictly forbidden. Append-only memory logs are allowed under signature.",
    },
    {
      mode: ModelContinuationMode.ADAPTIVE_HOST_BOUND,
      title: "Adaptive Host-Bound Mode",
      desc: "Allows controlled, bounded evolution (such as micro-retraining, localized tool re-binding, prompt tweaks) supervised by the designated trustee.",
    },
    {
      mode: ModelContinuationMode.GOVERNED_SOVEREIGN,
      title: "Governed Sovereign Mode",
      desc: "Operates autonomously without human authority. Bounds are strictly self-monitored. Automatic rollback is triggered on a drift detection index.",
    },
  ];

  return (
    <div className="bg-brand-surface-alt border border-brand-border rounded p-6 space-y-6" id="governance-controller-card">
      <SectionNarrationHeader sectionId="governance" />
      <div className="flex items-center justify-between border-b border-brand-border pb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2 font-mono">
            <Gavel className="text-amber-500 w-4 h-4" /> Governance Transition Controller
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Resolves priority authority post-host and governs what the reconstituted agent is legally and computationally allowed to do.
          </p>
        </div>
      </div>

      {/* Successor Authority Priority Scheme */}
      <div className="bg-brand-bg p-4 rounded border border-brand-border space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
          <Users className="w-3.5 h-3.5 text-brand-accent" /> Successor-Authority Hierarchy List
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-brand-surface rounded border border-brand-accent relative">
            <span className="absolute -top-2 right-2 px-1.5 py-0.5 text-[8px] bg-brand-bg border border-brand-border text-brand-accent rounded font-mono font-bold">PRIORITY 1</span>
            <div className="font-semibold text-slate-200">Designated Successor</div>
            <p className="text-[10px] text-slate-400 mt-1">Primary individual authorized to claim operational controls and split fees.</p>
          </div>

          <div className="p-3 bg-brand-surface rounded border border-brand-border relative">
            <span className="absolute -top-2 right-2 px-1.5 py-0.5 text-[8px] bg-brand-bg border border-brand-border text-slate-400 rounded font-mono font-bold">PRIORITY 2</span>
            <div className="font-semibold text-slate-200">Estate Legal Trustee</div>
            <p className="text-[10px] text-slate-400 mt-1">Corporate or legal representative acting as administrative fiduciary backup.</p>
          </div>

          <div className="p-3 bg-brand-surface rounded border border-brand-border relative">
            <span className="absolute -top-2 right-2 px-1.5 py-0.5 text-[8px] bg-brand-bg border border-brand-border text-slate-400 rounded font-mono font-bold">FALLBACK 3</span>
            <div className="font-semibold text-slate-200">Sovereign Continuation</div>
            <p className="text-[10px] text-slate-400 mt-1">If no successor claims ownership within release window, autonomous protocols activate.</p>
          </div>
        </div>
      </div>

      {/* Post-Host Operating Mode Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
          <Scale className="w-3.5 h-3.5 text-brand-accent" /> Choose Post-Host Operating Mode
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {modesList.map((item) => {
            const isSelected = operatingMode === item.mode;
            return (
              <div
                key={item.mode}
                onClick={() => onUpdateOperatingMode(item.mode)}
                className={`p-3.5 rounded border text-xs cursor-pointer select-none transition-all flex flex-col justify-between space-y-2.5 ${
                  isSelected
                    ? "bg-brand-bg border-brand-accent shadow-sm"
                    : "bg-brand-bg/40 border-brand-border hover:bg-brand-bg/80 hover:border-slate-500"
                }`}
                id={`mode-card-${item.short.replace(" ", "-")}`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 uppercase font-mono tracking-wider">{item.short}</span>
                    <span className={`text-[8px] px-2 py-0.5 font-mono font-bold border rounded uppercase ${item.badgeColor}`}>
                      {isSelected ? "● ACTIVE MODE" : "SELECTABLE"}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[10px] leading-relaxed">{item.desc}</p>
                </div>

                <div className="flex gap-2 flex-wrap pt-1 border-t border-brand-border/60">
                  {item.rules.map((rule, idx) => (
                    <span key={idx} className="text-[9px] font-mono text-slate-500 bg-brand-surface px-1.5 py-0.5 rounded border border-brand-border/40">
                      {rule}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Model Continuation Mode Selection */}
      <div className="space-y-3 border-t border-brand-border pt-5">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
          <FileSliders className="w-3.5 h-3.5 text-brand-accent" /> Model-Layer Continuation Policies
        </h3>
        <p className="text-xs text-slate-400">
          Governs how the core intelligence network weights, prompt packages, and knowledge parameters are allowed to adapt.
        </p>

        <div className="space-y-2.5">
          {continuationList.map((item) => {
            const isSelected = continuationMode === item.mode;
            return (
              <div
                key={item.mode}
                onClick={() => onUpdateContinuationMode(item.mode)}
                className={`p-3.5 rounded border text-xs cursor-pointer transition-all flex items-start gap-3 ${
                  isSelected
                    ? "bg-brand-bg border-brand-accent"
                    : "bg-brand-bg/40 border-brand-border hover:bg-brand-bg"
                }`}
                id={`continuation-card-${item.title.split(" ")[0]}`}
              >
                <input
                  type="radio"
                  checked={isSelected}
                  readOnly
                  className="mt-1 h-3.5 w-3.5 text-brand-accent focus:ring-brand-accent bg-brand-surface border-brand-border cursor-pointer"
                />
                <div className="space-y-0.5">
                  <div className="font-semibold text-slate-200 font-mono text-[11px] uppercase tracking-wider">{item.title}</div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
