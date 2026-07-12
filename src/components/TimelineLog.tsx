import React, { useEffect, useRef } from "react";
import { ContinuityState, STATE_LABELS, AuditLog } from "../types";
import { Database, ShieldCheck, Check, Server, Network, History } from "lucide-react";

interface TimelineLogProps {
  currentState: ContinuityState;
  auditLogs: AuditLog[];
  ledgerType: "Centralized DB + Signed Log" | "Decentralized DLT Node";
  onUpdateLedgerType: (type: "Centralized DB + Signed Log" | "Decentralized DLT Node") => void;
  onStateJump: (state: ContinuityState) => void;
}

export const TimelineLog: React.FC<TimelineLogProps> = ({
  currentState,
  auditLogs,
  ledgerType,
  onUpdateLedgerType,
  onStateJump,
}) => {
  const statesList = Object.values(ContinuityState);
  const activeStateRef = useRef<HTMLDivElement>(null);

  // On mobile, the 12-state strip is wider than the viewport (min-w-[960px] inside
  // an overflow-x-auto container). Auto-scroll the active state into view whenever
  // it changes so the person isn't left looking at S0 while the system has already
  // progressed to, say, S8 off-screen to the right.
  useEffect(() => {
    activeStateRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [currentState]);

  return (
    <div className="space-y-6" id="timeline-log-card">
      {/* 12-State FSM Progress Bar */}
      <div className="bg-brand-surface-alt border border-brand-border rounded p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-border pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2 font-mono">
              <History className="text-brand-accent w-4 h-4" /> Continuity State Machine Protocol (S0 - S11)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Current active operational state: <span className="font-mono text-brand-accent font-bold">{currentState} {STATE_LABELS[currentState].title}</span>
            </p>
          </div>

          {/* Pluggable registry switcher */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 uppercase font-mono font-bold">Pluggable Registry:</span>
            <div className="bg-brand-bg p-1 rounded border border-brand-border flex gap-1 text-[10px]">
              <button
                onClick={() => onUpdateLedgerType("Centralized DB + Signed Log")}
                className={`px-2.5 py-1 rounded transition-all duration-150 font-mono text-[9px] uppercase font-bold flex items-center gap-1 ${
                  ledgerType === "Centralized DB + Signed Log"
                    ? "bg-brand-surface text-brand-accent border border-brand-border"
                    : "text-slate-500 hover:text-slate-300 border border-transparent"
                }`}
                id="ledger-toggle-centralized"
              >
                <Server className="w-2.5 h-2.5" /> Database + Sign
              </button>
              <button
                onClick={() => onUpdateLedgerType("Decentralized DLT Node")}
                className={`px-2.5 py-1 rounded transition-all duration-150 font-mono text-[9px] uppercase font-bold flex items-center gap-1 ${
                  ledgerType === "Decentralized DLT Node"
                    ? "bg-brand-surface text-brand-accent border border-brand-border"
                    : "text-slate-500 hover:text-slate-300 border border-transparent"
                }`}
                id="ledger-toggle-decentralized"
              >
                <Network className="w-2.5 h-2.5" /> Blockchain / DLT
              </button>
            </div>
          </div>
        </div>

        {/* 12-state horizontal grid or scroller */}
        <div className="overflow-x-auto scroll-thin pb-2 -mx-2 px-2">
          <div className="flex min-w-[960px] justify-between items-center relative">
            {/* connecting line */}
            <div className="absolute top-[18px] left-[20px] right-[20px] h-[2px] bg-brand-border -z-0" />
            
            {statesList.map((state, idx) => {
              const label = STATE_LABELS[state];
              const isActive = currentState === state;
              const isPast = statesList.indexOf(currentState) > idx;

              return (
                <div
                  key={state}
                  ref={isActive ? activeStateRef : undefined}
                  onClick={() => onStateJump(state)}
                  className="flex flex-col items-center flex-1 relative z-10 cursor-pointer group"
                  title={`${state}: ${label.title} - Click to jump manually`}
                  id={`timeline-state-${state}`}
                >
                  {/* indicator bubble */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all border-2 ${
                      isActive
                        ? "bg-brand-accent border-brand-accent text-white scale-110 shadow-lg shadow-brand-accent/20"
                        : isPast
                        ? "bg-brand-bg border-emerald-500 text-emerald-400 hover:bg-brand-surface"
                        : "bg-brand-bg border-brand-border text-slate-500 hover:border-slate-600 hover:text-slate-300"
                    }`}
                  >
                    {isPast ? <Check className="w-4 h-4" /> : state}
                  </div>
                  
                  {/* state title label */}
                  <span
                    className={`text-[9px] mt-2 font-mono uppercase tracking-wider block text-center truncate max-w-[80px] ${
                      isActive ? "text-brand-accent font-bold" : "text-slate-500 group-hover:text-slate-300"
                    }`}
                  >
                    {label.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected State details bubble */}
        <div className="bg-brand-bg border border-brand-border p-3.5 rounded text-xs leading-relaxed flex items-start gap-3">
          <div className="p-2 bg-brand-surface border border-brand-border rounded text-brand-accent font-mono font-bold">
            {currentState}
          </div>
          <div>
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] font-mono">{STATE_LABELS[currentState].title}</h4>
            <p className="text-slate-400 text-[11px] mt-0.5">{STATE_LABELS[currentState].desc}</p>
          </div>
        </div>
      </div>

      {/* Append-Only Cryptographic Audit Log Ledger */}
      <div className="bg-brand-surface-alt border border-brand-border rounded p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-brand-border pb-3">
          <div>
            <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Database className="w-3.5 h-3.5 text-emerald-500" /> Tamper-Evident Audit Log Ledger ({ledgerType})
            </h4>
            <p className="text-[10px] text-slate-500">
              Each state transition compiles a hash linked to the previous log entry, forming an unalterable registry.
            </p>
          </div>
          <span className="text-[9px] font-mono uppercase bg-emerald-950/20 text-emerald-400 border border-emerald-900/30 px-2.5 py-0.5 rounded flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Registry Authenticated
          </span>
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {auditLogs.length === 0 ? (
            <p className="text-slate-600 text-xs italic text-center py-6">No registry records logged yet.</p>
          ) : (
            [...auditLogs].reverse().map((log, index) => (
              <div
                key={log.id}
                className="bg-brand-bg p-3 rounded border border-brand-border font-mono text-[10px] text-slate-300 space-y-1.5 hover:bg-brand-surface/40 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <span className="text-emerald-400 font-bold">BLOCK #{auditLogs.length - index}</span>
                  <span className="text-slate-500 text-[9px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-400">
                  <div>
                    <span className="text-[8px] text-slate-600 block uppercase">State Transition</span>
                    <span className="text-slate-300 font-semibold">{log.fromState} ➔ {log.toState}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-600 block uppercase">Authorization Evidence Reference</span>
                    <span className="text-slate-300 truncate block">{log.evidenceReference}</span>
                  </div>
                </div>
                <div className="text-[9px] text-slate-400 leading-normal">
                  <span className="text-[8px] text-slate-600 block uppercase">Transition Cause Payload</span>
                  {log.triggerEvent}
                </div>
                <div className="flex justify-between border-t border-brand-border pt-1.5 text-[8.5px] text-slate-600">
                  <span>Linked Hash Block Reference:</span>
                  <span className="text-emerald-500 truncate max-w-[150px]" title={log.hash}>{log.hash}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
