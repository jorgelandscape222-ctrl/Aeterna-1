import React, { useState } from "react";
import { TriggerClass, EvidenceTier, EvidenceItem, ChallengeResponseCheck, TriggerStatus } from "../types";
import { AlertTriangle, CheckCircle, Shield, Clock, Send, Plus, RefreshCw } from "lucide-react";
import { SectionNarrationHeader } from "./SectionNarrationHeader";

interface TriggerEngineViewProps {
  triggerStatus: TriggerStatus;
  onUpdateEvidence: (items: EvidenceItem[]) => void;
  onUpdateChallengeResponse: (check: ChallengeResponseCheck) => void;
  onTriggerSatisfied: (satisfied: boolean) => void;
  onStateJump: (targetState: any) => void;
}

export const TriggerEngineView: React.FC<TriggerEngineViewProps> = ({
  triggerStatus,
  onUpdateEvidence,
  onUpdateChallengeResponse,
  onTriggerSatisfied,
}) => {
  const [newSource, setNewSource] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newTier, setNewTier] = useState<EvidenceTier>(EvidenceTier.TIER_3_HEURISTIC);

  // Score calculations
  const calculateScore = (items: EvidenceItem[]) => {
    let score = 0;
    items.forEach((item) => {
      if (item.verified) {
        if (item.tier === EvidenceTier.TIER_1_PRIMARY) score += 1.0;
        else if (item.tier === EvidenceTier.TIER_2_SECONDARY) score += 0.5;
        else score += 0.25;
      }
    });
    return score;
  };

  const handleAddEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSource || !newDesc) return;

    const newItem: EvidenceItem = {
      id: "ev-manual-" + Date.now(),
      source: newSource,
      tier: newTier,
      description: newDesc,
      verified: true, // Manually added in simulator is pre-verified
      timestamp: new Date().toISOString(),
    };

    const updated = [...triggerStatus.evidenceItems, newItem];
    const score = calculateScore(updated);
    const satisfied = score >= triggerStatus.thresholdScore && triggerStatus.challengeResponse.status === "expired_no_response";

    onUpdateEvidence(updated);
    onTriggerSatisfied(satisfied);

    setNewSource("");
    setNewDesc("");
  };

  const toggleVerify = (id: string) => {
    const updated = triggerStatus.evidenceItems.map((item) =>
      item.id === id ? { ...item, verified: !item.verified } : item
    );
    const score = calculateScore(updated);
    const satisfied = score >= triggerStatus.thresholdScore && triggerStatus.challengeResponse.status === "expired_no_response";

    onUpdateEvidence(updated);
    onTriggerSatisfied(satisfied);
  };

  const handleSendPing = () => {
    const updatedCheck: ChallengeResponseCheck = {
      pingSent: true,
      pingsAttempted: triggerStatus.challengeResponse.pingsAttempted + 1,
      maxPings: 3,
      lastPingTimestamp: new Date().toISOString(),
      secondsRemaining: 15, // rapid count down for demo
      status: "awaiting_response",
    };
    onUpdateChallengeResponse(updatedCheck);
  };

  const simulateNoResponse = () => {
    const updatedCheck: ChallengeResponseCheck = {
      ...triggerStatus.challengeResponse,
      secondsRemaining: 0,
      status: "expired_no_response",
    };
    onUpdateChallengeResponse(updatedCheck);

    const score = calculateScore(triggerStatus.evidenceItems);
    onTriggerSatisfied(score >= triggerStatus.thresholdScore);
  };

  const simulateHostResponded = () => {
    const updatedCheck: ChallengeResponseCheck = {
      ...triggerStatus.challengeResponse,
      secondsRemaining: 0,
      status: "host_responded_active",
    };
    onUpdateChallengeResponse(updatedCheck);
    onTriggerSatisfied(false);
  };

  const score = calculateScore(triggerStatus.evidenceItems);

  return (
    <div className="bg-brand-surface-alt border border-brand-border rounded p-6 space-y-6" id="trigger-engine-card">
      <SectionNarrationHeader sectionId="triggerDetection" />
      <div className="flex items-center justify-between border-b border-brand-border pb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2 font-mono">
            <AlertTriangle className="text-amber-500 w-4 h-4" /> Trigger Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Ingests events, weights hierarchical evidence, and coordinates active challenge checks.
          </p>
        </div>
        <span className="px-3 py-1 bg-brand-surface text-slate-300 font-mono text-xs rounded border border-brand-border">
          Class: {triggerStatus.selectedClass}
        </span>
      </div>

      {/* Threshold Progress */}
      <div className="bg-brand-bg border border-brand-border p-4 rounded space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400 font-mono uppercase tracking-wider font-bold text-[10px]">Evidence Threshold Score:</span>
          <span className="font-mono text-slate-300 font-bold">
            {score.toFixed(2)} / {triggerStatus.thresholdScore.toFixed(2)}
          </span>
        </div>
        <div className="w-full bg-brand-surface-alt rounded-full h-2 overflow-hidden border border-brand-border">
          <div
            className={`h-full transition-all duration-300 ${
              score >= triggerStatus.thresholdScore ? "bg-emerald-500" : "bg-brand-accent"
            }`}
            style={{ width: `${Math.min(100, (score / triggerStatus.thresholdScore) * 100)}%` }}
          />
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          {score >= triggerStatus.thresholdScore ? (
            <span className="text-emerald-400 flex items-center gap-1 font-mono text-[10px] uppercase font-bold">
              <CheckCircle className="w-3.5 h-3.5" /> Evidence criteria satisfied
            </span>
          ) : (
            <span className="text-slate-500 font-mono text-[10px] uppercase">
              Waiting for sufficient verified evidence weights...
            </span>
          )}
        </div>
      </div>

      {/* Hierarchical Evidence Scheme */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
          <Shield className="w-3.5 h-3.5 text-brand-accent" /> Hierarchical Evidence Checklist
        </h3>

        <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
          {triggerStatus.evidenceItems.length === 0 ? (
            <p className="text-slate-500 text-xs text-center py-4 italic border border-dashed border-brand-border rounded">
              No evidence events registered.
            </p>
          ) : (
            triggerStatus.evidenceItems.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded border text-xs flex items-start gap-3 transition-colors ${
                  item.verified
                    ? "bg-brand-bg border-brand-border hover:bg-brand-surface/40"
                    : "bg-brand-bg/40 border-brand-border/40 opacity-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={item.verified}
                  onChange={() => toggleVerify(item.id)}
                  className="mt-0.5 rounded border-brand-border text-brand-accent focus:ring-brand-accent cursor-pointer h-4 w-4 bg-brand-surface"
                  id={`evidence-${item.id}`}
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">{item.source}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                        item.tier === EvidenceTier.TIER_1_PRIMARY
                          ? "bg-rose-950/40 text-rose-300 border border-rose-900/40"
                          : item.tier === EvidenceTier.TIER_2_SECONDARY
                          ? "bg-amber-950/40 text-amber-300 border border-amber-900/40"
                          : "bg-brand-surface text-slate-400 border border-brand-border"
                      }`}
                    >
                      {item.tier.split(":")[0]}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">{item.description}</p>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Logged: {new Date(item.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add evidence form */}
        <form onSubmit={handleAddEvidence} className="p-3 bg-brand-bg border border-brand-border rounded space-y-2.5">
          <div className="text-[10px] uppercase font-bold tracking-wider font-mono text-slate-400">Log Secondary Evidence Signal</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] text-slate-500 uppercase font-mono block mb-1">Source Agent / Oracle</label>
              <input
                type="text"
                placeholder="e.g., ProbateCourt Registry"
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                className="w-full text-xs bg-brand-surface text-slate-100 border border-brand-border rounded px-2.5 py-1.5 focus:ring-1 focus:ring-brand-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[9px] text-slate-500 uppercase font-mono block mb-1">Evidence Tier Weight</label>
              <select
                value={newTier}
                onChange={(e) => setNewTier(e.target.value as EvidenceTier)}
                className="w-full text-xs bg-brand-surface text-slate-100 border border-brand-border rounded px-2.5 py-1.5 focus:ring-1 focus:ring-brand-accent focus:outline-none"
              >
                <option value={EvidenceTier.TIER_1_PRIMARY}>Tier 1 (Weight: 1.0)</option>
                <option value={EvidenceTier.TIER_2_SECONDARY}>Tier 2 (Weight: 0.5)</option>
                <option value={EvidenceTier.TIER_3_HEURISTIC}>Tier 3 (Weight: 0.25)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[9px] text-slate-500 uppercase font-mono block mb-1">Witness Payload Narrative</label>
            <input
              type="text"
              placeholder="Description of evidence event..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full text-xs bg-brand-surface text-slate-100 border border-brand-border rounded px-2.5 py-1.5 focus:ring-1 focus:ring-brand-accent focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-1.5 text-xs bg-brand-surface text-slate-200 py-1.5 px-3 rounded hover:bg-brand-surface-alt border border-brand-border transition font-semibold"
          >
            <Plus className="w-3.5 h-3.5 text-brand-accent" /> Inject & Verify Evidence
          </button>
        </form>
      </div>

      {/* Challenge Response Mechanism */}
      <div className="space-y-3 border-t border-brand-border pt-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <Clock className="w-4 h-4 text-amber-400" /> Reachability Challenge-Response check
          </h3>
          <span className="text-[9px] font-mono bg-brand-bg text-amber-400 px-2 py-0.5 rounded border border-brand-border">
            Host Check: {triggerStatus.challengeResponse.status.toUpperCase()}
          </span>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed">
          Before taking preservation snapshots or initiating escalation, the protocol issues a reachability challenge ping. Only after no-response expiration can the transition proceed.
        </p>

        <div className="bg-brand-bg p-4 rounded border border-brand-border flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
              Ping Status:{" "}
              {triggerStatus.challengeResponse.pingSent ? (
                <span className="text-amber-400 animate-pulse flex items-center gap-1 font-mono text-[10px] uppercase">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Awaiting host answer...
                </span>
              ) : (
                <span className="text-slate-500 font-mono text-[10px] uppercase">Unsent</span>
              )}
            </div>
            {triggerStatus.challengeResponse.lastPingTimestamp && (
              <div className="text-[10px] text-slate-500 font-mono">
                Last attempt: {new Date(triggerStatus.challengeResponse.lastPingTimestamp).toLocaleTimeString()}
              </div>
            )}
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            {!triggerStatus.challengeResponse.pingSent ? (
              <button
                onClick={handleSendPing}
                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-brand-accent text-white text-xs py-2 px-3.5 rounded font-semibold hover:bg-indigo-500 transition shadow-sm hover:shadow-indigo-500/10"
                id="btn-send-ping"
              >
                <Send className="w-3.5 h-3.5" /> Send Reachability Challenge
              </button>
            ) : (
              <>
                <button
                  onClick={simulateNoResponse}
                  className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-900/50 text-xs py-2 px-3 rounded font-semibold transition"
                  id="btn-simulate-expiry"
                >
                  Simulate Expiry (No Answer)
                </button>
                <button
                  onClick={simulateHostResponded}
                  className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-900/50 text-xs py-2 px-3 rounded font-semibold transition"
                  id="btn-simulate-response"
                >
                  Simulate Host Answer (Active)
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
