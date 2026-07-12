import React, { useState } from "react";
import { LineageAnchor, StateDeltaRecord, DriftBaseline } from "../types";
import { calculateProvenDescent, calculateFidelity, computeDeltaLineageHash } from "../utils/crypto";
import { Fingerprint, GitBranch, ShieldAlert, CheckCircle, Plus, Zap, AlertOctagon, RotateCcw } from "lucide-react";

interface IdentityLineageViewProps {
  lineage: LineageAnchor;
  drift: DriftBaseline;
  systemPrompt: string;
  onUpdateLineage: (lineage: LineageAnchor) => void;
  onUpdateDrift: (drift: DriftBaseline) => void;
}

export const IdentityLineageView: React.FC<IdentityLineageViewProps> = ({
  lineage,
  drift,
  systemPrompt,
  onUpdateLineage,
  onUpdateDrift,
}) => {
  const [newDeltaDesc, setNewDeltaDesc] = useState("");
  const [newDeltaType, setNewDeltaType] = useState<"memory_append" | "policy_tweak" | "tool_binding_change">("memory_append");
  
  // Custom prompt representing post-transfer adaptation (used to calculate fidelity)
  const [adaptedPrompt, setAdaptedPrompt] = useState(systemPrompt);

  const handleAddDelta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeltaDesc) return;

    // Get preceding hash
    const prevHash = lineage.stateDeltaHistory.length > 0
      ? lineage.stateDeltaHistory[lineage.stateDeltaHistory.length - 1].lineageHash
      : lineage.canonicalTransferState.initialMemoryHash;

    const changes = {
      type: newDeltaType,
      description: newDeltaDesc,
    };

    // calculate lineage chaining hash: sha256(prevHash + stable-stringified changes)
    const lineageHash = computeDeltaLineageHash(prevHash, changes);

    const newRecord: StateDeltaRecord = {
      deltaId: "delta-" + Date.now().toString().slice(-6),
      timestamp: new Date().toISOString(),
      authorizedBy: "Governance Controller / Sarah Jenkins",
      changes,
      lineageHash,
    };

    const updatedHistory = [...lineage.stateDeltaHistory, newRecord];
    const provenDescent = calculateProvenDescent(lineage.canonicalTransferState.initialMemoryHash, updatedHistory);
    const fidelity = calculateFidelity(lineage.canonicalTransferState.baseModelReference, adaptedPrompt, updatedHistory.length);

    onUpdateLineage({
      ...lineage,
      provenDescentMetric: provenDescent,
      fidelityMetric: fidelity,
      stateDeltaHistory: updatedHistory,
    });

    setNewDeltaDesc("");
  };

  // Simulate a tampering event to show Proven Descent dropping!
  const simulateTampering = () => {
    if (lineage.stateDeltaHistory.length === 0) return;
    
    // Tamper with the lineageHash of the last record
    const tamperedHistory = lineage.stateDeltaHistory.map((item, index) => {
      if (index === lineage.stateDeltaHistory.length - 1) {
        return {
          ...item,
          lineageHash: "0000000_TAMPERED_HASH_BAD_SIGNATURE_000000",
        };
      }
      return item;
    });

    const provenDescent = calculateProvenDescent(lineage.canonicalTransferState.initialMemoryHash, tamperedHistory);

    onUpdateLineage({
      ...lineage,
      provenDescentMetric: provenDescent,
      stateDeltaHistory: tamperedHistory,
    });
  };

  const handleResetLineageChain = () => {
    onUpdateLineage({
      ...lineage,
      provenDescentMetric: 1.0,
      fidelityMetric: 1.0,
      stateDeltaHistory: [],
    });
  };

  // Adjust prompt or action drift sliders
  const adjustPromptDrift = (val: number) => {
    const isTriggered = val > drift.allowedPromptDrift || drift.currentActionDrift > drift.allowedActionDrift;
    onUpdateDrift({
      ...drift,
      currentPromptDrift: val,
      isTriggeredFallback: isTriggered,
    });
  };

  const adjustActionDrift = (val: number) => {
    const isTriggered = drift.currentPromptDrift > drift.allowedPromptDrift || val > drift.allowedActionDrift;
    onUpdateDrift({
      ...drift,
      currentActionDrift: val,
      isTriggeredFallback: isTriggered,
    });
  };

  const handleResetDrift = () => {
    onUpdateDrift({
      ...drift,
      currentPromptDrift: 0.12,
      currentActionDrift: 0.15,
      isTriggeredFallback: false,
    });
  };

  return (
    <div className="bg-brand-surface-alt border border-brand-border rounded p-6 space-y-6" id="identity-lineage-card">
      <div className="flex items-center justify-between border-b border-brand-border pb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2 font-mono">
            <Fingerprint className="text-brand-accent w-4 h-4" /> Persistent Identity & Lineage
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Proves valid descent from the original host's canonical state and implements drift-triggered auto-fallback controls.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-brand-bg p-4 rounded border border-brand-border flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-mono">Identity Continuity (Proven Descent)</span>
            <div className="text-2xl font-bold font-mono text-brand-accent">
              {(lineage.provenDescentMetric * 100).toFixed(0)}%
            </div>
            <p className="text-[10px] text-slate-500 font-mono">Cryptographic audit proof chain integrity.</p>
          </div>
          <div className="p-2.5 rounded-full bg-brand-surface border border-brand-border">
            <Fingerprint className="w-5 h-5 text-brand-accent" />
          </div>
        </div>

        <div className="bg-brand-bg p-4 rounded border border-brand-border flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-mono">Behavioral Fidelity</span>
            <div className="text-2xl font-bold font-mono text-emerald-400">
              {(lineage.fidelityMetric * 100).toFixed(0)}%
            </div>
            <p className="text-[10px] text-slate-500 font-mono">Behavioral closeness to canonical transfer state.</p>
          </div>
          <div className="p-2.5 rounded-full bg-brand-surface border border-brand-border">
            <GitBranch className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Canonical Baseline & Drift Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-brand-bg p-4 rounded border border-brand-border space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Canonical Transfer State Anchor</h3>
            <div className="grid grid-cols-2 gap-2.5 text-[11px] font-mono">
              <div className="p-2 bg-brand-surface rounded border border-brand-border">
                <span className="text-slate-500 block uppercase text-[9px] font-bold">Base Model Ref</span>
                <span className="text-slate-200">{lineage.canonicalTransferState.baseModelReference}</span>
              </div>
              <div className="p-2 bg-brand-surface rounded border border-brand-border">
                <span className="text-slate-500 block uppercase text-[9px] font-bold">Version Anchor</span>
                <span className="text-slate-200">{lineage.canonicalTransferState.version}</span>
              </div>
            </div>
            <div className="text-[11px] font-mono bg-brand-surface p-2.5 rounded border border-brand-border">
              <span className="text-slate-500 block uppercase text-[9px] font-bold">Initial Memory State Hash</span>
              <span className="text-slate-300 truncate block text-[10px]">{lineage.canonicalTransferState.initialMemoryHash}</span>
            </div>
          </div>

          {/* Drift fallback monitoring */}
          <div className="bg-brand-bg p-4 rounded border border-brand-border space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500" /> Drift Baseline Fallback Controls
              </h3>
              {drift.isTriggeredFallback && (
                <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-red-950 text-red-400 border border-red-900 flex items-center gap-1 font-bold">
                  <AlertOctagon className="w-2.5 h-2.5 animate-pulse" /> FALLBACK ACTIVE
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed font-mono uppercase">
              If adaptation drifts beyond acceptable parameters, automated fallback suspends spending caps, restricts tools, and freezes modification.
            </p>

            <div className="space-y-3.5 pt-1">
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-slate-400">Prompt Semantic Drift:</span>
                  <span className={`font-mono font-bold ${drift.currentPromptDrift > drift.allowedPromptDrift ? "text-red-400" : "text-slate-300"}`}>
                    {drift.currentPromptDrift.toFixed(2)} / Threshold: {drift.allowedPromptDrift.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={drift.currentPromptDrift}
                  onChange={(e) => adjustPromptDrift(parseFloat(e.target.value))}
                  className="w-full h-1 bg-brand-surface rounded appearance-none cursor-pointer accent-brand-accent"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-slate-400">Tool Action Divergence:</span>
                  <span className={`font-mono font-bold ${drift.currentActionDrift > drift.allowedActionDrift ? "text-red-400" : "text-slate-300"}`}>
                    {drift.currentActionDrift.toFixed(2)} / Threshold: {drift.allowedActionDrift.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={drift.currentActionDrift}
                  onChange={(e) => adjustActionDrift(parseFloat(e.target.value))}
                  className="w-full h-1 bg-brand-surface rounded appearance-none cursor-pointer accent-brand-accent"
                />
              </div>
            </div>

            {drift.isTriggeredFallback ? (
              <div className="p-3 bg-red-950/40 border border-red-900/60 rounded text-[11px] text-red-300 space-y-1.5 font-mono">
                <span className="font-bold flex items-center gap-1 uppercase tracking-wider">
                  <AlertOctagon className="w-3.5 h-3.5" /> Drift Exceeded — Automated Safe-State Restrictions:
                </span>
                <ul className="list-disc pl-4 space-y-0.5 text-[10px] text-red-400">
                  <li>Compute spending capped at $0.00/day</li>
                  <li>Autonomous tool use suspended (read-only mode)</li>
                  <li>Memory writes locked to prevent reinforcement loop</li>
                </ul>
                <button
                  onClick={handleResetDrift}
                  className="mt-1 w-full flex items-center justify-center gap-1 text-[10px] bg-red-900/40 hover:bg-red-900 text-white py-1.5 px-2.5 rounded border border-red-800 transition font-bold uppercase"
                  id="btn-reset-drift"
                >
                  <RotateCcw className="w-3 h-3" /> Restore Prior Validated State
                </button>
              </div>
            ) : (
              <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded text-[11px] text-emerald-400 flex items-center gap-2 font-mono">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Adaptation parameters within bounds. Auto-fallback idle.</span>
              </div>
            )}
          </div>
        </div>

        {/* State-Delta Cryptographic Register */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Lineage Chained State-Delta Records</h3>
            {lineage.stateDeltaHistory.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={simulateTampering}
                  className="text-[9px] bg-amber-950/60 hover:bg-amber-900 border border-amber-900 text-amber-300 px-2 py-0.5 rounded transition font-mono font-bold"
                  id="btn-simulate-tampering"
                >
                  Simulate Tampering
                </button>
                <button
                  onClick={handleResetLineageChain}
                  className="text-[9px] bg-brand-surface hover:bg-brand-surface-alt border border-brand-border text-slate-300 px-2 py-0.5 rounded transition font-mono font-bold"
                  id="btn-reset-lineage"
                >
                  Clear History
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {lineage.stateDeltaHistory.length === 0 ? (
              <p className="text-slate-500 text-xs italic text-center py-10 border border-dashed border-brand-border rounded">
                No approved evolution deltas logged yet.
              </p>
            ) : (
              [...lineage.stateDeltaHistory].reverse().map((delta, idx) => {
                // verify link correctness
                const expectedPrevHash = idx === lineage.stateDeltaHistory.length - 1
                  ? lineage.canonicalTransferState.initialMemoryHash
                  : lineage.stateDeltaHistory[lineage.stateDeltaHistory.length - 1 - idx - 1].lineageHash;
                const isCorrect = delta.lineageHash === computeDeltaLineageHash(expectedPrevHash, delta.changes);

                return (
                  <div
                    key={delta.deltaId}
                    className={`p-3 rounded border text-xs space-y-1.5 transition-colors ${
                      isCorrect ? "bg-brand-bg border-brand-border" : "bg-red-950/20 border-red-900"
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-slate-400 font-bold">{delta.deltaId}</span>
                      <span className={`text-[8px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                        isCorrect ? "bg-brand-surface border-brand-border text-slate-400" : "bg-red-900 border-red-800 text-red-200"
                      }`}>
                        {isCorrect ? "⛓️ Chain Valid" : "🚨 Bad Hash: Link Broken"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-bold font-mono">Change Description</span>
                      <p className="text-slate-200 text-[11px] leading-snug">{delta.changes.description}</p>
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                      <span>Auth: {delta.authorizedBy}</span>
                      <span>{new Date(delta.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="pt-1.5 border-t border-brand-border/60 text-[9px] text-slate-500 font-mono flex justify-between">
                      <span>Chained Hash:</span>
                      <span className={`truncate max-w-[140px] ${isCorrect ? "text-slate-400" : "text-red-400 font-bold"}`}>{delta.lineageHash}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Add a manual delta */}
          <form onSubmit={handleAddDelta} className="bg-brand-bg p-3 rounded border border-brand-border space-y-2">
            <div className="text-[10px] uppercase font-bold tracking-wider font-mono text-slate-400">Log Post-Transfer Delta Change</div>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={newDeltaType}
                onChange={(e) => setNewDeltaType(e.target.value as any)}
                className="text-[10px] bg-brand-surface text-slate-100 border border-brand-border rounded px-2 py-1 focus:outline-none font-mono"
              >
                <option value="memory_append">Memory Append</option>
                <option value="policy_tweak">Policy Adjustment</option>
                <option value="tool_binding_change">Tool Remapping</option>
              </select>
              <button
                type="submit"
                className="flex items-center justify-center gap-1 text-[10px] bg-brand-accent hover:bg-indigo-500 text-white py-1 px-2.5 rounded transition font-mono font-bold uppercase shadow-sm"
              >
                <Plus className="w-3 h-3" /> Commit Signed Change
              </button>
            </div>
            <input
              type="text"
              placeholder="e.g. Appended 14 vector references about successor Sarah..."
              value={newDeltaDesc}
              onChange={(e) => setNewDeltaDesc(e.target.value)}
              className="w-full text-xs bg-brand-surface text-slate-100 border border-brand-border rounded px-2.5 py-1.5 focus:ring-1 focus:ring-brand-accent focus:outline-none"
            />
          </form>
        </div>
      </div>
    </div>
  );
};
