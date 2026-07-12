import React, { useState } from "react";
import { ContinuityState, STATE_LABELS, AuditLog } from "../types";
import { 
  X, Check, Play, Info, Download, AlertTriangle, Sparkles, 
  ChevronRight, ChevronDown, Cpu, ShieldCheck, Database, Layers, Coins
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ProtocolFlowOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  currentState: ContinuityState;
  auditLogs: AuditLog[];
  onStateJump: (state: ContinuityState) => void;
}

interface StateNode {
  id: ContinuityState;
  shortId: string;
  title: string;
  phase: "detection" | "preservation" | "transition" | "reconstitution" | "archive";
  desc: string;
  inputs: string[];
  outputs: string[];
  riskRating: "Low" | "Medium" | "High" | "Critical";
  primaryActor: "Telemetry Pulse" | "AI Agent Daemon" | "Successor / Trustee" | "Sandbox Container";
}

const FLOW_NODES: StateNode[] = [
  // Detection
  {
    id: ContinuityState.S0_HOST_LINKED_ACTIVE,
    shortId: "S0",
    title: "Host-Linked Active",
    phase: "detection",
    desc: "The agent functions normally in its primary host environment. A heartbeat pulse is continuously verified on-chain or on a signed audit log.",
    inputs: ["Developer Credentials", "API Session tokens", "Primary Pulse Signal"],
    outputs: ["Signed Heartbeat log", "Continuous Telemetry block"],
    riskRating: "Low",
    primaryActor: "Telemetry Pulse",
  },
  {
    id: ContinuityState.S1_RISK_DETECTED,
    shortId: "S1",
    title: "Risk Detected",
    phase: "detection",
    desc: "Inactivity watchdogs, social monitors, or secondary heuristic sensors report anomalous lack of heartbeat, suggesting potential host disruption.",
    inputs: ["Heartbeat timeout threshold", "Co-signed heuristic alerts"],
    outputs: ["Continuous risk state flag", "Ping challenge initiation log"],
    riskRating: "Medium",
    primaryActor: "Telemetry Pulse",
  },
  {
    id: ContinuityState.S2_EVIDENCE_PENDING,
    shortId: "S2",
    title: "Evidence Pending",
    phase: "detection",
    desc: "Active reachability challenges are sent. The sentinel counts down the response window. A weighted score of legal and physical evidence is compiled.",
    inputs: ["Weighted evidence criteria", "Challenge-response ping timer"],
    outputs: ["Completed evidence packet", "Timeout expired certificate"],
    riskRating: "High",
    primaryActor: "Telemetry Pulse",
  },
  
  // Preservation
  {
    id: ContinuityState.S3_PRESERVATION_SNAPSHOT_CREATED,
    shortId: "S3",
    title: "Snapshot Created",
    phase: "preservation",
    desc: "The agent memory graph, active parameter configurations, system prompts, and tool access limits are instantly frozen and cryptographically hashed.",
    inputs: ["Active memory vectors", "System prompt profiles", "Authorization limits"],
    outputs: ["Sealed raw snapshot", "Immutable SHA-256 state digest"],
    riskRating: "Medium",
    primaryActor: "AI Agent Daemon",
  },
  {
    id: ContinuityState.S4_CONTINUITY_BUNDLE_GENERATED,
    shortId: "S4",
    title: "Bundle Generated",
    phase: "preservation",
    desc: "The frozen snapshot is compiled with the designated successor credentials, estate trust specifications, restore instructions, and signatures into a unified package.",
    inputs: ["Cryptographic state snapshot", "Governance & successor claims", "Restore manifests"],
    outputs: ["Unified Continuity Bundle file", "Layer-4 Merkle Root digest"],
    riskRating: "Low",
    primaryActor: "AI Agent Daemon",
  },
  {
    id: ContinuityState.S5_ESCROWED_CONTINUITY_STATE,
    shortId: "S5",
    title: "Escrowed State",
    phase: "preservation",
    desc: "The signed Continuity Bundle is registered on the tamper-evident registry (pluggable ledger) and escrowed securely, awaiting valid transition signals.",
    inputs: ["Unified Continuity Bundle", "Trustee verification cert"],
    outputs: ["Ledger block registration record", "Secure escrow storage hook"],
    riskRating: "Low",
    primaryActor: "AI Agent Daemon",
  },

  // Transition
  {
    id: ContinuityState.S6_SUCCESSOR_MODE_SELECTED,
    shortId: "S6",
    title: "Successor Selected",
    phase: "transition",
    desc: "The transition controller evaluates legal claims, probate certifications, or autonomous continuation triggers. An authorized successor or trustee is authenticated.",
    inputs: ["Successor probate co-sign", "Heartbeat timeout expired cert"],
    outputs: ["Authenticated operational mode", "Successor authorization key"],
    riskRating: "High",
    primaryActor: "Successor / Trustee",
  },
  {
    id: ContinuityState.S7_FUNDING_MIGRATION_AUTHORIZED,
    shortId: "S7",
    title: "Funding Authorized",
    phase: "transition",
    desc: "Migration fees, target hosting budgets, or reserved cloud credits are unlocked. The target destination environment specification is finalized and approved.",
    inputs: ["Billing/reserve account allocation", "Target hardware environment spec"],
    outputs: ["Unlocked financial clearance block", "Authorized descent target class"],
    riskRating: "Medium",
    primaryActor: "Successor / Trustee",
  },

  // Reconstitution
  {
    id: ContinuityState.S8_RECONSTITUTED_VALIDATION_STATE,
    shortId: "S8",
    title: "Sandbox Validation",
    phase: "reconstitution",
    desc: "The agent is instantiated inside a secure, sandboxed runtime. Credentials are reissued in a restricted mode and test trial tasks are executed to verify safety.",
    inputs: ["Sealed Continuity Bundle", "Target destination host", "Limited API credentials"],
    outputs: ["Sandbox trial output logs", "Verified integrity digest report"],
    riskRating: "Critical",
    primaryActor: "Sandbox Container",
  },
  {
    id: ContinuityState.S9_CONTINUED_AGENT_INSTANCE,
    shortId: "S9",
    title: "Continued Instance",
    phase: "reconstitution",
    desc: "The sandbox boundary is lifted under successor control. The continued agent assumes live duties. A lineage anchor monitors semantic and tool drift in real-time.",
    inputs: ["Verified sandbox pass report", "Successor operating keys"],
    outputs: ["Live operational telemetry", "State-delta lineage register blocks"],
    riskRating: "Critical",
    primaryActor: "AI Agent Daemon",
  },
  {
    id: ContinuityState.S10_COMMERCIALIZATION_LICENSING_STATE,
    shortId: "S10",
    title: "Commercialization",
    phase: "reconstitution",
    desc: "The agent operates commercial licensing or API calls, routing royalty revenues according to the manifest's waterfall split rules (Successor, Estate, Reserve).",
    inputs: ["Licensing agreement parameters", "API utilization logs"],
    outputs: ["Simulated transaction records", "Waterfall financial payout routing"],
    riskRating: "Medium",
    primaryActor: "AI Agent Daemon",
  },

  // Alternative Hold
  {
    id: ContinuityState.S11_ARCHIVE_DECLINE_HOLD,
    shortId: "S11",
    title: "Archive / Dispute Hold",
    phase: "archive",
    desc: "Continuity procedures are halted, disputed, or quarantined due to conflicting claims, drift violations, or explicit developer/trustee suspension commands.",
    inputs: ["Dispute signal blocks", "Manual developer revocation", "Drift violation trigger"],
    outputs: ["Permanent quarantine state", "State lock flag"],
    riskRating: "High",
    primaryActor: "Successor / Trustee",
  }
];

export const ProtocolFlowOverlay: React.FC<ProtocolFlowOverlayProps> = ({
  isOpen,
  onClose,
  currentState,
  auditLogs,
  onStateJump,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<ContinuityState>(currentState);

  const statesList = Object.values(ContinuityState);
  const currentStateIdx = statesList.indexOf(currentState);

  const selectedNode = FLOW_NODES.find(n => n.id === selectedNodeId) || FLOW_NODES[0];

  const isCompleted = (stateId: ContinuityState) => {
    // Visited if it's strictly prior to current index, or if there's an audit log for it
    const idx = statesList.indexOf(stateId);
    if (idx < currentStateIdx) return true;
    return auditLogs.some(log => log.toState === stateId);
  };

  const isActive = (stateId: ContinuityState) => {
    return currentState === stateId;
  };

  const getPhaseNodes = (phase: string) => {
    return FLOW_NODES.filter(n => n.phase === phase);
  };

  // Phases layout metadata
  const phases = [
    {
      id: "detection",
      title: "1. Detection & Evidence",
      desc: "Telemetry logs, heartbeats, and active verification challenges",
      color: "border-sky-500/20 text-sky-400 bg-sky-950/10",
    },
    {
      id: "preservation",
      title: "2. State Preservation",
      desc: "Memory snapshot captures, bundle generation, and ledger escrow",
      color: "border-indigo-500/20 text-indigo-400 bg-indigo-950/10",
    },
    {
      id: "transition",
      title: "3. Governance & Transition",
      desc: "Successor claims, operating mode selection, and budget unlocking",
      color: "border-amber-500/20 text-amber-400 bg-amber-950/10",
    },
    {
      id: "reconstitution",
      title: "4. Reconstitution & Live",
      desc: "Sandbox validation, active deployment, and commercialized royalty waterfall",
      color: "border-emerald-500/20 text-emerald-400 bg-emerald-950/10",
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="flow-overlay-backdrop">
          {/* Backdrop Blur */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-bg/95 backdrop-blur-md"
          />

          {/* Dialog Panel */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-7xl h-[88vh] bg-brand-surface-alt border border-brand-border rounded-lg shadow-2xl flex flex-col overflow-hidden z-10"
            id="flow-overlay-dialog"
          >
            {/* Overlay Header */}
            <div className="flex items-center justify-between gap-3 border-b border-brand-border px-4 py-3 sm:px-6 sm:py-4 bg-brand-surface">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-brand-accent/10 border border-brand-accent/20 rounded shrink-0">
                  <Sparkles className="w-5 h-5 text-brand-accent" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider font-mono text-white flex flex-wrap items-center gap-2">
                    <span className="truncate">Interactive Protocol State Machine Flow Map</span>
                    <span className="text-[10px] bg-brand-surface border border-brand-border text-brand-accent px-1.5 py-0.5 rounded shrink-0">S0 - S11</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 hidden sm:block">
                    Map tracing continuous lifecycle transitions of the Parallel Life AI Identity continuation standard.
                  </p>
                </div>
              </div>
              
              <button 
                onClick={onClose}
                className="p-2 rounded-full bg-brand-surface border border-brand-border hover:border-brand-accent text-slate-400 hover:text-white transition shrink-0"
                id="btn-close-flow-overlay"
                aria-label="Close protocol map"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Map & Inspector Container */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              
              {/* Left Side: Diagram Canvas */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 border-b lg:border-b-0 lg:border-r border-brand-border bg-brand-bg/40">
                
                {/* Visual flowchart grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  {phases.map((phase) => {
                    const phaseNodes = getPhaseNodes(phase.id);
                    return (
                      <div 
                        key={phase.id} 
                        className={`p-4 rounded border flex flex-col space-y-4 ${phase.color}`}
                        id={`phase-col-${phase.id}`}
                      >
                        {/* Phase Header */}
                        <div>
                          <h4 className="text-[11px] font-bold uppercase tracking-wider font-mono text-white">
                            {phase.title}
                          </h4>
                          <p className="text-[9px] text-slate-400 mt-1 leading-normal font-mono uppercase">
                            {phase.desc}
                          </p>
                        </div>

                        {/* Phase Nodes Stack */}
                        <div className="flex-1 flex flex-col justify-start space-y-3">
                          {phaseNodes.map((node, index) => {
                            const active = isActive(node.id);
                            const done = isCompleted(node.id);
                            const selected = selectedNodeId === node.id;

                            return (
                              <React.Fragment key={node.id}>
                                <div 
                                  onClick={() => setSelectedNodeId(node.id)}
                                  className={`p-3 rounded border text-left cursor-pointer transition-all flex items-start gap-3 relative select-none ${
                                    selected 
                                      ? "ring-1 ring-brand-accent bg-brand-surface border-brand-accent" 
                                      : active
                                      ? "bg-brand-surface border-amber-500 shadow-sm shadow-amber-500/10 animate-pulse"
                                      : done
                                      ? "bg-brand-surface/60 border-emerald-500/50 hover:bg-brand-surface hover:border-emerald-500"
                                      : "bg-brand-surface/30 border-brand-border hover:bg-brand-surface/50 hover:border-slate-500"
                                  }`}
                                  id={`flow-node-${node.shortId}`}
                                >
                                  {/* Bubble marker */}
                                  <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center font-mono text-[10px] font-bold border ${
                                    active
                                      ? "bg-amber-500 border-amber-500 text-slate-900"
                                      : done
                                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                                      : "bg-brand-bg border-brand-border text-slate-500"
                                  }`}>
                                    {done ? <Check className="w-3 h-3" /> : node.shortId}
                                  </div>

                                  <div className="space-y-1 overflow-hidden">
                                    <div className="flex items-center gap-1.5 justify-between">
                                      <span className="font-bold text-[11px] text-slate-200 truncate block">
                                        {node.title}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                                      {node.desc}
                                    </p>
                                    
                                    {/* Small indicator pills */}
                                    <div className="flex gap-1.5 pt-1.5 flex-wrap">
                                      <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                                        active 
                                          ? "bg-amber-500/10 border border-amber-500/30 text-amber-400" 
                                          : done
                                          ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                                          : "bg-slate-800 border border-slate-700/50 text-slate-500"
                                      }`}>
                                        {active ? "ACTIVE" : done ? "COMPLETED" : "PENDING"}
                                      </span>
                                      
                                      {selected && (
                                        <span className="text-[8px] font-mono px-1.5 py-0.5 rounded font-bold bg-brand-accent/20 text-brand-accent border border-brand-accent/30 uppercase">
                                          INSPECTING
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Downward connector arrow inside phase column */}
                                {index < phaseNodes.length - 1 && (
                                  <div className="flex justify-center text-slate-600 h-2 -my-1">
                                    <ChevronDown className="w-4 h-4 text-brand-border" />
                                  </div>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Sub-Branch Phase 5: Alternate Hold State */}
                <div className="p-4 bg-brand-surface-alt border border-brand-border rounded flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-950/40 border border-red-900 rounded">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold font-mono uppercase text-white flex items-center gap-2">
                        Alternative Dispute Highway: <span className="text-red-400">S11 Archive / Dispute Hold</span>
                      </h4>
                      <p className="text-[10px] text-slate-400 max-w-xl">
                        A fallback sentinel hold triggered manually by developer emergency revocation, successor dispute arbitration claims, or extreme semantic drift.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedNodeId(ContinuityState.S11_ARCHIVE_DECLINE_HOLD)}
                    className={`text-xs px-3.5 py-1.5 rounded transition font-mono border font-bold uppercase flex items-center gap-1.5 shrink-0 ${
                      selectedNodeId === ContinuityState.S11_ARCHIVE_DECLINE_HOLD
                        ? "bg-red-900 border-red-800 text-white"
                        : isActive(ContinuityState.S11_ARCHIVE_DECLINE_HOLD)
                        ? "bg-red-950 border-red-500 text-red-400 animate-pulse"
                        : "bg-brand-bg border-brand-border text-slate-400 hover:border-red-900 hover:text-red-400"
                    }`}
                    id="btn-inspect-s11"
                  >
                    Inspect S11 Fallback State
                  </button>
                </div>

              </div>

              {/* Right Side: Inspector Details Panel */}
              <div className="w-full lg:w-96 shrink-0 bg-brand-surface border-t lg:border-t-0 border-brand-border flex flex-col overflow-hidden">
                
                {/* Node Details Header */}
                <div className="p-5 border-b border-brand-border bg-brand-surface-alt/60 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center font-mono font-bold text-brand-accent text-sm">
                      {selectedNode.shortId}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                        State Inspector
                      </h4>
                      <p className="text-[9px] text-brand-accent font-mono uppercase tracking-wider font-bold">
                        Phase: {selectedNode.phase}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[8px] font-mono px-2 py-0.5 rounded font-bold uppercase border ${
                    isActive(selectedNode.id)
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                      : isCompleted(selectedNode.id)
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-slate-800 border-slate-700/50 text-slate-500"
                  }`}>
                    {isActive(selectedNode.id) ? "● CURRENTLY ACTIVE" : isCompleted(selectedNode.id) ? "⛓️ VISITED" : "PENDING"}
                  </span>
                </div>

                {/* Node details body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-slate-100 font-mono uppercase tracking-wider">
                      {selectedNode.title}
                    </h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed pt-1 font-sans">
                      {selectedNode.desc}
                    </p>
                  </div>

                  {/* Metadata Row */}
                  <div className="grid grid-cols-2 gap-3 text-[10px] font-mono border-t border-b border-brand-border py-4">
                    <div>
                      <span className="text-slate-500 block uppercase font-bold text-[8px]">Primary Actor</span>
                      <span className="text-slate-200 mt-0.5 block">{selectedNode.primaryActor}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase font-bold text-[8px]">Transition Hazard</span>
                      <span className={`mt-0.5 block font-bold ${
                        selectedNode.riskRating === "Critical" ? "text-red-500" :
                        selectedNode.riskRating === "High" ? "text-amber-500" :
                        selectedNode.riskRating === "Medium" ? "text-blue-400" : "text-slate-400"
                      }`}>{selectedNode.riskRating}</span>
                    </div>
                  </div>

                  {/* Inputs & Outputs */}
                  <div className="space-y-3 text-[11px]">
                    <div className="space-y-1.5">
                      <span className="text-slate-500 block font-mono font-bold uppercase text-[8px]">Required Transition Inputs:</span>
                      <div className="flex flex-col gap-1">
                        {selectedNode.inputs.map((inp, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-slate-300 font-mono text-[10px] bg-brand-bg p-1.5 rounded border border-brand-border/40">
                            <ChevronRight className="w-3 h-3 text-brand-accent shrink-0" />
                            <span className="truncate">{inp}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-slate-500 block font-mono font-bold uppercase text-[8px]">Resulting Outputs:</span>
                      <div className="flex flex-col gap-1">
                        {selectedNode.outputs.map((out, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-slate-300 font-mono text-[10px] bg-brand-bg p-1.5 rounded border border-brand-border/40">
                            <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                            <span className="truncate">{out}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Manual transition action hook */}
                  <div className="pt-4 border-t border-brand-border">
                    {isActive(selectedNode.id) ? (
                      <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded text-[10px] font-mono text-emerald-400 uppercase text-center font-bold">
                        Currently Engaged State
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          onStateJump(selectedNode.id);
                          onClose();
                        }}
                        className="w-full bg-brand-accent hover:bg-indigo-500 text-white font-mono uppercase tracking-wider font-bold text-xs py-2.5 px-4 rounded transition flex items-center justify-center gap-1.5 shadow-sm shadow-brand-accent/20"
                        id={`btn-jump-to-${selectedNode.shortId}`}
                      >
                        <Play className="w-3.5 h-3.5 fill-white" /> Force State Transition ({selectedNode.shortId})
                      </button>
                    )}
                  </div>
                </div>

                {/* EXPORT / DOWNLOAD APP SOURCE BLOCK */}
                <div className="p-5 border-t border-brand-border bg-brand-surface-alt/80">
                  <h5 className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-semibold block mb-2.5">
                    EXPORT CURRENT PROJECT
                  </h5>
                  <a
                    href="/app.zip"
                    download="ai-continuity-protocol-app.zip"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold uppercase tracking-wider text-xs py-3 px-4 rounded transition flex items-center justify-center gap-2 shadow-sm shadow-emerald-500/15 text-center"
                    id="btn-download-zip-inspector"
                  >
                    <Download className="w-4 h-4" /> Download Project ZIP
                  </a>
                  <span className="text-[9px] text-slate-500 font-mono text-center block mt-1.5 uppercase leading-normal">
                    Includes complete source code & scripts
                  </span>
                </div>

              </div>

            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
