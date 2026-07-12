import React, { useState } from "react";
import { PreservationSnapshot } from "../types";
import { sha256 } from "../utils/crypto";
import { ShieldCheck, Database, Zap, Sparkles, Check, Download } from "lucide-react";
import { SectionNarrationHeader } from "./SectionNarrationHeader";

interface SnapshotModuleViewProps {
  snapshot: PreservationSnapshot | null;
  onGenerateSnapshot: (snapshot: PreservationSnapshot) => void;
}

export const SnapshotModuleView: React.FC<SnapshotModuleViewProps> = ({
  snapshot,
  onGenerateSnapshot,
}) => {
  // Input states for generating snapshot
  const [modelName, setModelName] = useState("gemini-2.5-pro");
  const [systemPrompt, setSystemPrompt] = useState(
    "You are an autonomous administrative clerk governing the Parallel Life trust fund. Keep detailed logs of all expenditures."
  );
  const [temperature, setTemperature] = useState(0.2);

  // Subsystem toggles (to show conditionally-mandatory fields)
  const [hasMemory, setHasMemory] = useState(true);
  const [hasTools, setHasTools] = useState(true);
  const [hasFunding, setHasFunding] = useState(true);

  // Optional augmentation toggles
  const [includeHistory, setIncludeHistory] = useState(true);
  const [includeEmbeddings, setIncludeEmbeddings] = useState(false);

  const handleCreateSnapshot = () => {
    // Collect snapshot payload
    const basePayload: any = {
      timestamp: new Date().toISOString(),
      modelReference: {
        provider: "Google Cloud",
        modelName,
        temperature,
      },
      activePromptsAndPolicy: {
        systemPrompt,
        safetyFilters: ["HateSpeech:Strict", "Harassment:Strict", "CivicIntegrity:Block"],
        governancePolicyDigest: sha256(systemPrompt + "policy-v1"),
      },
    };

    // Add conditionally-mandatory fields if subsystems exist
    if (hasMemory) {
      basePayload.boundMemoryReferences = {
        vectorDbEndpoint: "https://vector-db.us-central1.gcp.pinecone.io/indexes/parallel-memory-01",
        memoryKeysCount: 1420,
        lastMemorySync: new Date(Date.now() - 3600000).toISOString(),
      };
    }

    if (hasTools) {
      basePayload.toolPermissionProfile = {
        allowedTools: ["gmail_read", "sheets_append", "doc_search"],
        riskLimits: {
          maxSpendingPerTxUsd: 50,
          dailyAggregatedCapUsd: 200,
        },
      };
    }

    if (hasFunding) {
      basePayload.fundingSource = {
        billingAccountMasked: "Stripe-Acc-****-8820",
        reservePoolBalanceUsd: 1500,
      };
    }

    // Add optional augmentation fields
    if (includeHistory || includeEmbeddings) {
      basePayload.optionalAugmentation = {};
      if (includeHistory) {
        basePayload.optionalAugmentation.recentConversationLength = 482;
      }
      if (includeEmbeddings) {
        basePayload.optionalAugmentation.embeddingDimensions = 1536;
      }
      basePayload.optionalAugmentation.environmentDockerTag = "node-18-slim-aistudio-v2.1";
    }

    // Generate static integrity digest of the state payload
    const stringified = JSON.stringify(basePayload, null, 2);
    const integrityDigest = sha256(stringified);

    const completeSnapshot: PreservationSnapshot = {
      ...basePayload,
      integrityDigest,
    };

    onGenerateSnapshot(completeSnapshot);
  };

  return (
    <div className="bg-brand-surface-alt border border-brand-border rounded p-6 space-y-6" id="snapshot-module-card">
      <SectionNarrationHeader sectionId="preservation" />
      <div className="flex items-center justify-between border-b border-brand-border pb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2 font-mono">
            <ShieldCheck className="text-emerald-500 w-4 h-4" /> Snapshot Module
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Freezes the entire active environment and memory layers with standard-enforced schema requirements.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Schema Settings Form */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Configure Snapshot Fields</h3>

          {/* Core Settings */}
          <div className="bg-brand-bg p-4 rounded border border-brand-border space-y-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> (a) Universal Mandatory Fields
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-mono block mb-1">Target AI Model</label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full text-xs bg-brand-surface text-slate-100 border border-brand-border rounded px-2.5 py-1.5 focus:ring-1 focus:ring-brand-accent focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-mono block mb-1">System Prompt / Core Instruction</label>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={3}
                className="w-full text-xs bg-brand-surface text-slate-100 border border-brand-border rounded px-2.5 py-1.5 focus:ring-1 focus:ring-brand-accent focus:outline-none resize-none font-mono"
              />
            </div>
          </div>

          {/* Subsystems Settings */}
          <div className="bg-brand-bg p-4 rounded border border-brand-border space-y-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full" /> (b) Conditionally-Mandatory Subsystems
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed font-mono uppercase">
              Enforced by validator ONLY if the subsystem exists on the running host instance.
            </p>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasMemory}
                  onChange={(e) => setHasMemory(e.target.checked)}
                  className="rounded border-brand-border text-brand-accent focus:ring-brand-accent bg-brand-surface"
                />
                <Database className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono text-[11px]">Include Memory State Refs (e.g. Pinecone)</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasTools}
                  onChange={(e) => setHasTools(e.target.checked)}
                  className="rounded border-brand-border text-brand-accent focus:ring-brand-accent bg-brand-surface"
                />
                <Zap className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono text-[11px]">Include Tool-Permissions Profile</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasFunding}
                  onChange={(e) => setHasFunding(e.target.checked)}
                  className="rounded border-brand-border text-brand-accent focus:ring-brand-accent bg-brand-surface"
                />
                <span className="font-mono text-[11px]">Include Billing & Reserve Funding Refs</span>
              </label>
            </div>
          </div>

          {/* Optional Augmentations */}
          <div className="bg-brand-bg p-4 rounded border border-brand-border space-y-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> (c) Optional Augmentation Fields
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeHistory}
                  onChange={(e) => setIncludeHistory(e.target.checked)}
                  className="rounded border-brand-border text-brand-accent focus:ring-brand-accent bg-brand-surface"
                />
                <span className="font-mono text-[11px]">Include Conversation Context (Recent Logs)</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeEmbeddings}
                  onChange={(e) => setIncludeEmbeddings(e.target.checked)}
                  className="rounded border-brand-border text-brand-accent focus:ring-brand-accent bg-brand-surface"
                />
                <span className="font-mono text-[11px]">Include Fine-tuning Weights/Embedding Refs</span>
              </label>
            </div>
          </div>

          <button
            onClick={handleCreateSnapshot}
            className="w-full bg-brand-accent hover:bg-indigo-500 text-white font-semibold text-xs py-2.5 px-4 rounded transition flex items-center justify-center gap-2 shadow-sm hover:shadow-indigo-500/10"
            id="btn-generate-snapshot"
          >
            <Sparkles className="w-3.5 h-3.5" /> Freeze State & Generate Snapshot
          </button>
        </div>

        {/* JSON Output View */}
        <div className="bg-brand-bg rounded border border-brand-border p-4 flex flex-col h-full min-h-[300px]">
          <div className="flex items-center justify-between border-b border-brand-border pb-2 mb-3">
            <span className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">Preservation Snapshot Payload</span>
            {snapshot && (
              <span className="text-[9px] font-mono uppercase text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 px-2 py-0.5 rounded flex items-center gap-1">
                <Check className="w-3 h-3" /> State Frozen
              </span>
            )}
          </div>

          <div className="flex-1 font-mono text-[10px] text-slate-300 bg-brand-surface-alt/60 p-3 rounded border border-brand-border overflow-auto max-h-[360px] leading-relaxed">
            {snapshot ? (
              <pre className="whitespace-pre-wrap">{JSON.stringify(snapshot, null, 2)}</pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 italic space-y-2 py-10">
                <ShieldCheck className="w-8 h-8 text-slate-700 animate-pulse" />
                <span className="font-mono text-[10px]">Awaiting snapshot trigger...</span>
              </div>
            )}
          </div>

          {snapshot && (
            <div className="mt-3 bg-brand-surface-alt p-2.5 rounded border border-brand-border flex items-center justify-between text-[11px]">
              <div className="truncate pr-4">
                <span className="text-slate-500 block text-[9px] uppercase font-bold font-mono">SHA-256 Integrity Digest</span>
                <span className="font-mono text-emerald-300 truncate block text-[10px]">{snapshot.integrityDigest}</span>
              </div>
              <button
                onClick={() => {
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(snapshot, null, 2));
                  const downloadAnchor = document.createElement("a");
                  downloadAnchor.setAttribute("href", dataStr);
                  downloadAnchor.setAttribute("download", `snapshot-${Date.now()}.json`);
                  document.body.appendChild(downloadAnchor);
                  downloadAnchor.click();
                  downloadAnchor.remove();
                }}
                className="p-1.5 hover:bg-brand-surface text-slate-300 hover:text-white rounded border border-brand-border transition-all duration-150"
                title="Download Snapshot JSON"
                id="btn-download-snapshot"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
