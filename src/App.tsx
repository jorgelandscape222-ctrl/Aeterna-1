import { useState, useEffect } from "react";
import {
  ContinuityState,
  TriggerClass,
  EvidenceTier,
  EvidenceItem,
  ChallengeResponseCheck,
  TriggerStatus,
  PreservationSnapshot,
  ContinuityBundle,
  OperatingMode,
  ModelContinuationMode,
  LineageAnchor,
  DriftBaseline,
  ReconstitutionStatus,
  CommercializationLog,
  AuditLog,
} from "./types";
import { sha256 } from "./utils/crypto";
import { SCENARIOS, Scenario, ScenarioStep } from "./data/scenarios";

// Sub-components
import { TimelineLog } from "./components/TimelineLog";
import { TriggerEngineView } from "./components/TriggerEngineView";
import { SnapshotModuleView } from "./components/SnapshotModuleView";
import { ContinuityBundleView } from "./components/ContinuityBundleView";
import { IdentityLineageView } from "./components/IdentityLineageView";
import { GovernanceControllerView } from "./components/GovernanceControllerView";
import { ReconstitutionSandbox } from "./components/ReconstitutionSandbox";
import { CommercializationView } from "./components/CommercializationView";
import { ProtocolFlowOverlay } from "./components/ProtocolFlowOverlay";

// Narration Integrations
import { NarrationProvider, useNarration } from "./context/NarrationContext";
import { NarrationControls } from "./components/NarrationControls";
import { AeternaAssistant } from "./components/AeternaAssistant";

// Icons
import { Play, Sparkles, RefreshCw, Layers, ShieldCheck, Cpu, Coins, GitFork, ArrowRight, BookOpen, AlertTriangle, Map, Download, LucideIcon } from "lucide-react";

// Sub-system tab definitions, driving both the desktop (numbered, full-label)
// and mobile (short-label) tab bar renders from a single source of truth.
interface TabDefinition {
  id: string;
  number: number;
  fullLabel: string;
  shortLabel: string;
  Icon: LucideIcon;
  iconClassName?: string;
}

const TAB_DEFINITIONS: TabDefinition[] = [
  { id: "trigger", number: 1, fullLabel: "TRIGGER ENGINE", shortLabel: "Trigger", Icon: AlertTriangle },
  { id: "snapshot", number: 2, fullLabel: "SNAPSHOT MODULE", shortLabel: "Snapshot", Icon: ShieldCheck },
  { id: "bundle", number: 3, fullLabel: "CONTINUITY BUNDLE", shortLabel: "Bundle", Icon: Layers },
  { id: "governance", number: 4, fullLabel: "GOVERNANCE & AUTONOMY", shortLabel: "Governance", Icon: Layers, iconClassName: "rotate-180" },
  { id: "sandbox", number: 5, fullLabel: "RECONSTITUTION SANDBOX", shortLabel: "Sandbox", Icon: Cpu },
  { id: "lineage", number: 6, fullLabel: "LINEAGE & DRIFT", shortLabel: "Lineage", Icon: GitFork },
  { id: "commercialization", number: 7, fullLabel: "COMMERCIALIZATION", shortLabel: "Commercial", Icon: Coins },
];

interface AppContentProps {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
}

function AppContent({ activeTab, setActiveTab }: AppContentProps) {
  // Scenario simulation state
  const [activeScenarioId, setActiveScenarioId] = useState<string>("host-death");
  const [scenarioStepIndex, setScenarioStepIndex] = useState<number>(-1);

  // Overlay state
  const [isFlowOverlayOpen, setIsFlowOverlayOpen] = useState<boolean>(false);

  // Narration state hook
  const { startTour, currentlyNarratedSectionId, onTabChangeExternal } = useNarration();

  // Autoplay on first-visit welcome/tour sequence
  useEffect(() => {
    const hasOnboarded = localStorage.getItem("aeterna-onboarded");
    if (!hasOnboarded) {
      const timer = setTimeout(() => {
        startTour();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [startTour]);

  // Tab click event proxy (stops the tour if they manually click away to explore)
  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onTabChangeExternal(tabId);
  };

  // Core system states
  const [currentState, setCurrentState] = useState<ContinuityState>(ContinuityState.S0_HOST_LINKED_ACTIVE);
  const [triggerStatus, setTriggerStatus] = useState<TriggerStatus>({
    selectedClass: TriggerClass.DEATH,
    evidenceItems: [],
    challengeResponse: {
      pingSent: false,
      pingsAttempted: 0,
      maxPings: 3,
      lastPingTimestamp: "",
      secondsRemaining: 48 * 3600,
      status: "idle",
    },
    thresholdScore: 1.5,
    currentScore: 0,
    satisfied: false,
  });

  const [snapshot, setSnapshot] = useState<PreservationSnapshot | null>(null);
  const [bundle, setBundle] = useState<ContinuityBundle | null>(null);
  const [operatingMode, setOperatingMode] = useState<OperatingMode>(OperatingMode.MEMORIAL);
  const [continuationMode, setContinuationMode] = useState<ModelContinuationMode>(ModelContinuationMode.PRESERVATION_LOCKED);

  const [lineage, setLineage] = useState<LineageAnchor>({
    canonicalTransferState: {
      baseModelReference: "gemini-2.5-pro",
      version: "v1.4.1",
      adaptationArtifactRefs: ["parallel-life-weights-v1"],
      authorizedToolProfile: ["gmail_read", "sheets_append", "doc_search"],
      initialMemoryHash: sha256("canonical-memory-v1"),
    },
    provenDescentMetric: 1.0,
    fidelityMetric: 1.0,
    stateDeltaHistory: [],
  });

  const [drift, setDrift] = useState<DriftBaseline>({
    allowedPromptDrift: 0.4,
    allowedActionDrift: 0.45,
    currentPromptDrift: 0.12,
    currentActionDrift: 0.15,
    isTriggeredFallback: false,
  });

  const [reconstitution, setReconstitution] = useState<ReconstitutionStatus>({
    sandboxReady: false,
    validationChecks: {
      integrityDigestVerified: false,
      runtimeCompatibilityCheck: false,
      securityPolicySandboxPass: false,
      trialExecutionSuccessful: false,
    },
    credentialsReissued: {
      substituteApiKeyActive: false,
      originalCredentialsRevoked: false,
    },
    runtimeClass: "same-runtime-class",
    sandboxLogs: [],
  });

  const [commercializationLogs, setCommercializationLogs] = useState<CommercializationLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [ledgerType, setLedgerType] = useState<"Centralized DB + Signed Log" | "Decentralized DLT Node">("Centralized DB + Signed Log");

  // Initialize with a default S0 audit log entry
  useEffect(() => {
    if (auditLogs.length === 0) {
      const initialLog: AuditLog = {
        id: "block-0",
        timestamp: new Date().toISOString(),
        fromState: ContinuityState.S0_HOST_LINKED_ACTIVE,
        toState: ContinuityState.S0_HOST_LINKED_ACTIVE,
        triggerEvent: "AI Agent active on primary host environment. Continuous telemetry monitoring online.",
        evidenceReference: "Primary Host Pulse",
        hash: sha256("genesis-block-continuity-protocol"),
      };
      setAuditLogs([initialLog]);
    }
  }, []);

  // Update trigger details when active scenario changes
  const handleLoadScenario = (id: string) => {
    const selected = SCENARIOS.find((s) => s.id === id);
    if (!selected) return;

    setActiveScenarioId(id);
    setScenarioStepIndex(-1); // Reset step-by-step controller

    // Reset simulator back to S0
    setCurrentState(ContinuityState.S0_HOST_LINKED_ACTIVE);
    setSnapshot(null);
    setBundle(null);
    setOperatingMode(OperatingMode.MEMORIAL);
    setContinuationMode(ModelContinuationMode.PRESERVATION_LOCKED);
    setReconstitution({
      sandboxReady: false,
      validationChecks: {
        integrityDigestVerified: false,
        runtimeCompatibilityCheck: false,
        securityPolicySandboxPass: false,
        trialExecutionSuccessful: false,
      },
      credentialsReissued: {
        substituteApiKeyActive: false,
        originalCredentialsRevoked: false,
      },
      runtimeClass: "same-runtime-class",
      sandboxLogs: [],
    });
    setLineage({
      canonicalTransferState: {
        baseModelReference: "gemini-2.5-pro",
        version: "v1.4.1",
        adaptationArtifactRefs: ["parallel-life-weights-v1"],
        authorizedToolProfile: ["gmail_read", "sheets_append", "doc_search"],
        initialMemoryHash: sha256("canonical-memory-v1"),
      },
      provenDescentMetric: 1.0,
      fidelityMetric: 1.0,
      stateDeltaHistory: [],
    });

    setTriggerStatus({
      selectedClass: selected.triggerClass,
      evidenceItems: [],
      challengeResponse: {
        pingSent: false,
        pingsAttempted: 0,
        maxPings: 3,
        lastPingTimestamp: "",
        secondsRemaining: 48 * 3600,
        status: "idle",
      },
      thresholdScore: 1.5,
      currentScore: 0,
      satisfied: false,
    });

    // Reset audit logs
    const initialLog: AuditLog = {
      id: `block-${Date.now()}`,
      timestamp: new Date().toISOString(),
      fromState: ContinuityState.S0_HOST_LINKED_ACTIVE,
      toState: ContinuityState.S0_HOST_LINKED_ACTIVE,
      triggerEvent: `Scenario Loaded: '${selected.name}'. AI Agent initialized to standard active state.`,
      evidenceReference: "User Reset",
      hash: sha256("genesis-block-continuity-protocol"),
    };
    setAuditLogs([initialLog]);
    setActiveTab("trigger");
  };

  // State Machine transition coordinator
  const triggerStateTransition = (toState: ContinuityState, reason: string, evidenceRef: string) => {
    const fromState = currentState;
    if (fromState === toState) return;

    // Calculate linked tamper-evident hash chain: sha256(previous block hash + state change meta)
    const prevHash = auditLogs.length > 0 ? auditLogs[auditLogs.length - 1].hash : "0000000";
    const newHash = sha256(prevHash + fromState + toState + reason + evidenceRef);

    const newLog: AuditLog = {
      id: "block-" + Date.now().toString().slice(-5),
      timestamp: new Date().toISOString(),
      fromState,
      toState,
      triggerEvent: reason,
      evidenceReference: evidenceRef,
      hash: newHash,
    };

    setAuditLogs((prev) => [...prev, newLog]);
    setCurrentState(toState);
  };

  // Step a scenario forward automatically
  const stepScenarioForward = () => {
    const selected = SCENARIOS.find((s) => s.id === activeScenarioId);
    if (!selected) return;

    const nextIdx = scenarioStepIndex + 1;
    if (nextIdx >= selected.steps.length) return; // Finished

    const step = selected.steps[nextIdx];
    setScenarioStepIndex(nextIdx);

    // Apply step configuration parameters
    if (step.evidenceToAdd) {
      const updatedEvidence = [...triggerStatus.evidenceItems, ...step.evidenceToAdd];
      // Dedup items
      const uniqueEvidence = updatedEvidence.filter(
        (v, i, a) => a.findIndex((t) => t.id === v.id) === i
      );

      // calculate score
      let score = 0;
      uniqueEvidence.forEach((item) => {
        if (item.verified) {
          if (item.tier === EvidenceTier.TIER_1_PRIMARY) score += 1.0;
          else if (item.tier === EvidenceTier.TIER_2_SECONDARY) score += 0.5;
          else score += 0.25;
        }
      });

      const updatedCheck: ChallengeResponseCheck = step.challengeResponseStatus
        ? {
            pingSent: true,
            pingsAttempted: 1,
            maxPings: 3,
            lastPingTimestamp: new Date().toISOString(),
            secondsRemaining: 0,
            status: step.challengeResponseStatus,
          }
        : triggerStatus.challengeResponse;

      const satisfied = score >= triggerStatus.thresholdScore && updatedCheck.status === "expired_no_response";

      setTriggerStatus({
        ...triggerStatus,
        evidenceItems: uniqueEvidence,
        challengeResponse: updatedCheck,
        currentScore: score,
        satisfied,
      });
    }

    if (step.operatingMode) {
      setOperatingMode(step.operatingMode);
    }
    if (step.continuationMode) {
      setContinuationMode(step.continuationMode);
    }

    // Auto-generate helper mock snapshots/bundles at critical steps to keep demo smooth
    if (step.targetState === ContinuityState.S3_PRESERVATION_SNAPSHOT_CREATED && !snapshot) {
      const mockSnap: PreservationSnapshot = {
        timestamp: new Date().toISOString(),
        modelReference: {
          provider: "Google Cloud",
          modelName: "gemini-2.5-pro",
          temperature: 0.2,
        },
        activePromptsAndPolicy: {
          systemPrompt: "Policy package v1.0",
          safetyFilters: ["HateSpeech:Strict", "Harassment:Strict"],
          governancePolicyDigest: sha250_digest("policy-v1"),
        },
        boundMemoryReferences: {
          vectorDbEndpoint: "https://vector-db.gcp.pinecone.io",
          memoryKeysCount: 1420,
          lastMemorySync: new Date().toISOString(),
        },
        toolPermissionProfile: {
          allowedTools: ["gmail_read", "sheets_append", "doc_search"],
          riskLimits: { maxSpendingPerTxUsd: 50, dailyAggregatedCapUsd: 200 },
        },
        integrityDigest: sha256("mock-snapshot-content-data"),
      };
      setSnapshot(mockSnap);
    }

    if (step.targetState === ContinuityState.S4_CONTINUITY_BUNDLE_GENERATED && !bundle) {
      const mockBundle: ContinuityBundle = {
        id: "bundle-auto-" + Math.floor(Math.random() * 10000),
        createdAt: new Date().toISOString(),
        identityDescriptor: {
          canonicalId: "AI-ID-PL-22019488",
          originalHostEmail: "agent-host@example.com",
          createdAtTimestamp: new Date().toISOString(),
          pluggableLedgerReference: "Hyperledger/Firestore-Signed:TX-88301",
        },
        rightsAndGovernanceManifest: {
          designatedSuccessor: "Sarah Jenkins (Designated Successor)",
          trusteeName: "LexGuardian Digital Trust Corp",
          approvalGates: ["Primary Successor Consent", "Host Heartbeat Timeout Verification"],
          disputeRules: "Arbitration governed by AI-CP Protocol Court 1.0",
          royaltySplits: { successorPercent: 60, estatePercent: 30, reservePercent: 10 },
        },
        restoreManifest: {
          requiredCpuCores: 4,
          requiredMemoryGb: 16,
          dependencyReferences: ["@google/genai^2.4.0", "express^4.21.2"],
          launchSteps: ["Initialize container", "Remap tool bindings", "Run sandbox trial"],
          toolBindingsMap: {
            "gmail_read": "https://api.reissued.google/workspace/gmail",
            "sheets_append": "https://api.reissued.google/workspace/sheets",
            "doc_search": "https://api.reissued.google/workspace/docs",
          },
        },
        integrityLayer: {
          snapshotHash: snapshot ? snapshot.integrityDigest : sha256("mock-snapshot"),
          manifestSignature: sha256("sarah-jenkins-signature-manifest"),
          merkleRoot: sha256("merkle-root-hierarchy"),
          timestampSignature: sha256("authority-sig-992"),
        },
        commercializationMetadata: {
          isAvailableForLicense: true,
          permittedTransactionTypes: ["REST API Call Licensing"],
          minimumMonthlyRateUsd: 450,
          complianceVerificationRequired: true,
        },
      };
      setBundle(mockBundle);
    }

    // Handle re-issued keys during sandbox validation step
    if (step.targetState === ContinuityState.S8_RECONSTITUTED_VALIDATION_STATE) {
      setReconstitution({
        sandboxReady: true,
        validationChecks: {
          integrityDigestVerified: true,
          runtimeCompatibilityCheck: true,
          securityPolicySandboxPass: true,
          trialExecutionSuccessful: true,
        },
        credentialsReissued: {
          substituteApiKeyActive: true,
          originalCredentialsRevoked: true,
        },
        runtimeClass: "same-runtime-class",
        sandboxLogs: [
          "🔄 Initializing reconstitution host allocation...",
          "✅ Check 1 passed: Integrity Digest Verified.",
          "✅ Check 2 passed: Runtime environment compatibility validated.",
          "✅ Check 3 passed: Security Policy sandbox limits correctly applied.",
          "✅ Scoped credential REISSUED: 'SUBSTITUTE_API_KEY' active.",
          "🎉 Sandbox Trial run successful. Operational readiness verified."
        ],
      });
    }

    // State Jump tab focus
    if (step.targetState === ContinuityState.S1_RISK_DETECTED || step.targetState === ContinuityState.S2_EVIDENCE_PENDING) {
      setActiveTab("trigger");
    } else if (step.targetState === ContinuityState.S3_PRESERVATION_SNAPSHOT_CREATED) {
      setActiveTab("snapshot");
    } else if (step.targetState === ContinuityState.S4_CONTINUITY_BUNDLE_GENERATED || step.targetState === ContinuityState.S5_ESCROWED_CONTINUITY_STATE) {
      setActiveTab("bundle");
    } else if (step.targetState === ContinuityState.S6_SUCCESSOR_MODE_SELECTED) {
      setActiveTab("governance");
    } else if (step.targetState === ContinuityState.S8_RECONSTITUTED_VALIDATION_STATE || step.targetState === ContinuityState.S9_CONTINUED_AGENT_INSTANCE) {
      setActiveTab("sandbox");
    }

    triggerStateTransition(
      step.targetState,
      step.description,
      step.evidenceToAdd ? step.evidenceToAdd[0]?.source || "System Automation" : "Step Sequence Trigger"
    );
  };

  const sha250_digest = (text: string) => {
    return sha256(text);
  };

  // Manual Jump Coordinator
  const handleStateJump = (state: ContinuityState) => {
    triggerStateTransition(state, `Manual state operator jump request to ${state}`, "Operator Override");
  };

  const selectedScenario = SCENARIOS.find((s) => s.id === activeScenarioId);
  const isScenarioCompleted = selectedScenario ? scenarioStepIndex === selectedScenario.steps.length - 1 : false;

  return (
    <div className="min-h-screen bg-transparent text-[#D1D5DB] flex flex-col font-sans select-none relative">
      {/* Layer 3: Faint AETERNA Wordmark Watermark */}
      <div 
        aria-hidden="true" 
        className="fixed inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
        style={{ zIndex: -10 }}
      >
        <div className="font-extrabold tracking-[0.1em] text-[rgba(255,255,255,0.04)] uppercase whitespace-nowrap text-center select-none" style={{ fontSize: "clamp(2.5rem, 18vw, 15rem)" }}>
          AETERNA
        </div>
      </div>
      
      {/* Geometric Balance Header */}
      <header className="border-b border-brand-border bg-brand-surface-alt flex flex-col gap-3 px-3 py-3 sm:px-6 sm:py-3.5 shrink-0 sticky top-0 z-40 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-4 sm:justify-start">
          <div className="flex items-center gap-3 min-w-0">
            <img src="/aeterna-mark.svg" alt="Aeterna" className="w-8 h-8 shrink-0" />
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm font-bold tracking-tight text-white flex items-center gap-2 truncate">
                <span className="truncate">AI CONTINUITY PROTOCOL</span> <span className="text-brand-accent font-mono text-xs shrink-0">v17.4</span>
              </h1>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold hidden xs:block truncate">
                REFERENCE IMPLEMENTATION // PERSISTENT IDENTITY SYSTEM
              </p>
            </div>
          </div>

          {/* Compact status pill, visible only on the smallest screens where the full stat blocks are hidden */}
          <div className="sm:hidden shrink-0">
            <span className="mono text-emerald-400 uppercase text-[10px] bg-brand-bg border border-brand-border rounded px-2 py-1">
              {currentState}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto scroll-thin">
          <div className="text-right hidden sm:block shrink-0">
            <p className="label-sm mb-0">System Status</p>
            <p className="mono text-emerald-400 uppercase">{currentState.split("_").slice(0, 2).join(" ")}</p>
          </div>
          <div className="h-8 w-[1px] bg-brand-border hidden sm:block shrink-0"></div>
          <div className="text-right hidden md:block shrink-0">
            <p className="label-sm mb-0">Runtime Anchor</p>
            <p className="mono text-slate-400 italic">
              {snapshot ? snapshot.integrityDigest.slice(0, 10) + "..." : "0x8f2..e41a"}
            </p>
          </div>
          <div className="h-8 w-[1px] bg-brand-border hidden md:block shrink-0"></div>
          <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => setIsFlowOverlayOpen(true)}
              className="flex-1 sm:flex-none justify-center bg-brand-accent hover:bg-indigo-500 text-white transition-all duration-200 px-3 sm:px-3.5 py-1.5 text-xs font-bold rounded flex items-center gap-1.5 cursor-pointer shadow-sm shadow-brand-accent/25 whitespace-nowrap"
              id="btn-open-protocol-map"
              title="Protocol Map"
            >
              <Map className="w-3.5 h-3.5 fill-white/10 shrink-0" /> <span className="hidden xs:inline">Protocol Map</span>
            </button>

            <button
              onClick={startTour}
              className="flex-1 sm:flex-none justify-center bg-brand-surface border border-brand-border hover:border-brand-accent/50 text-slate-200 transition-all duration-200 px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              id="btn-take-tour-header"
              title="Take Audio Tour"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-accent shrink-0 animate-pulse" /> <span>Take Tour</span>
            </button>

            <a
              href="/app.zip"
              download="ai-continuity-protocol-app.zip"
              className="flex-1 sm:flex-none justify-center bg-emerald-600 hover:bg-emerald-500 text-white transition-all duration-200 px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-500/15 whitespace-nowrap"
              id="btn-export-codebase-header"
              title="Export .ZIP"
            >
              <Download className="w-3.5 h-3.5 shrink-0" /> <span className="hidden xs:inline">Export .ZIP</span>
            </a>

            <a
              href="#sandbox"
              onClick={() => setActiveTab("sandbox")}
              className="flex-1 sm:flex-none justify-center bg-brand-surface text-slate-200 border border-brand-border hover:bg-brand-surface-alt hover:border-brand-accent/50 transition-all duration-200 px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-1.5 whitespace-nowrap"
              title="Sandbox View"
            >
              <Cpu className="w-3.5 h-3.5 text-brand-accent shrink-0" /> <span className="hidden xs:inline">Sandbox View</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 space-y-6">

        {/* Scripted Scenarios Stepper Deck */}
        <div className="bg-brand-surface-alt border border-brand-border rounded p-5 space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <BookOpen className="w-3.5 h-3.5 text-brand-accent" /> Scripted Simulation Scenarios
              </h2>
              <p className="text-[11px] text-slate-400 mt-1">
                Select a protocol failure scenario and click "Next Step" to trace evidence checks and state-delta logging.
              </p>
            </div>

            {/* Scenario Picker buttons */}
            <div className="flex flex-wrap gap-1.5">
              {SCENARIOS.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => handleLoadScenario(sc.id)}
                  className={`text-xs px-3 py-1.5 rounded transition font-mono border ${
                    activeScenarioId === sc.id
                      ? "bg-brand-accent border-brand-accent text-white font-semibold shadow-brand-accent-glow"
                      : "bg-brand-bg border-brand-border hover:border-brand-border text-brand-ink-dim"
                  }`}
                  id={`scenario-select-${sc.id}`}
                >
                  {sc.name.split(":")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Active Scenario Step Progress Bar */}
          {selectedScenario && (
            <div className="bg-brand-bg p-4 rounded border border-brand-border flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center md:text-left flex-1">
                <span className="text-[10px] uppercase font-mono bg-brand-surface-alt border border-brand-border px-2 py-0.5 rounded text-brand-accent">
                  {selectedScenario.name}
                </span>
                <p className="text-xs text-slate-300 pt-1">
                  {scenarioStepIndex === -1
                    ? "Scenario loaded. Click 'Next Step' to initiate failure detection."
                    : `Active Step: ${selectedScenario.steps[scenarioStepIndex].title}`}
                </p>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-center">
                <button
                  onClick={() => handleLoadScenario(activeScenarioId)}
                  className="flex items-center justify-center gap-1.5 text-xs font-semibold bg-brand-surface border border-brand-border hover:bg-brand-surface-alt text-slate-300 py-2 px-3.5 rounded transition"
                  id="btn-restart-scenario"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Restart
                </button>

                <button
                  onClick={stepScenarioForward}
                  disabled={isScenarioCompleted}
                  className="w-full md:w-auto flex items-center justify-center gap-1.5 text-xs font-semibold bg-brand-accent hover:bg-indigo-500 disabled:bg-slate-800 disabled:border-slate-800 disabled:opacity-40 text-white py-2 px-5 rounded transition shadow-sm hover:shadow-indigo-500/10"
                  id="btn-next-step"
                >
                  <span>{isScenarioCompleted ? "Scenario Finished" : "Next Scenario Step"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* FSM Timeline */}
        <TimelineLog
          currentState={currentState}
          auditLogs={auditLogs}
          ledgerType={ledgerType}
          onUpdateLedgerType={setLedgerType}
          onStateJump={handleStateJump}
        />

        {/* Sub-system Navigation Tabs */}
        <div className="flex border-b border-brand-border overflow-x-auto scroll-thin gap-0.5 -mx-4 px-4 sm:mx-0 sm:px-0" id="nav-tabs">
          {TAB_DEFINITIONS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`py-3 px-3 sm:px-4 text-[10px] font-bold tracking-wider uppercase border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? "border-brand-accent text-white bg-brand-surface-alt shadow-brand-accent-glow"
                  : "border-transparent text-brand-ink-dim hover:text-brand-ink hover:bg-brand-surface-alt/40"
              }`}
              id={`tab-btn-${tab.id}`}
              title={tab.fullLabel}
            >
              <tab.Icon className={`w-3.5 h-3.5 text-brand-accent shrink-0 ${tab.iconClassName ?? ""}`} />
              {/* Full numbered label on wider screens, compact label on phones */}
              <span className="hidden sm:inline whitespace-nowrap">
                {tab.number}. {tab.fullLabel}
              </span>
              <span className="sm:hidden whitespace-nowrap">{tab.shortLabel}</span>
            </button>
          ))}
        </div>

        {/* Tab content panels */}
        <div className="space-y-6">
          {activeTab === "trigger" && (
            <div className={`transition-all duration-300 rounded-lg ${currentlyNarratedSectionId === "triggerDetection" ? "ring-2 ring-brand-accent/40 shadow-brand-accent-glow p-1 bg-brand-bg/50" : ""}`}>
              <TriggerEngineView
                triggerStatus={triggerStatus}
                onUpdateEvidence={(items) => setTriggerStatus({ ...triggerStatus, evidenceItems: items })}
                onUpdateChallengeResponse={(check) => setTriggerStatus({ ...triggerStatus, challengeResponse: check })}
                onTriggerSatisfied={(satisfied) => {
                  setTriggerStatus((prev) => ({ ...prev, satisfied }));
                  if (satisfied && currentState === ContinuityState.S2_EVIDENCE_PENDING) {
                    triggerStateTransition(
                      ContinuityState.S3_PRESERVATION_SNAPSHOT_CREATED,
                      "Automated trigger criteria verified: challenge-response elapsed and weighted evidence gathered.",
                      triggerStatus.selectedClass
                    );
                  }
                }}
                onStateJump={handleStateJump}
              />
            </div>
          )}

          {activeTab === "snapshot" && (
            <div className={`transition-all duration-300 rounded-lg ${currentlyNarratedSectionId === "preservation" ? "ring-2 ring-brand-accent/40 shadow-brand-accent-glow p-1 bg-brand-bg/50" : ""}`}>
              <SnapshotModuleView
                snapshot={snapshot}
                onGenerateSnapshot={(snap) => {
                  setSnapshot(snap);
                  if (currentState === ContinuityState.S0_HOST_LINKED_ACTIVE || currentState === ContinuityState.S2_EVIDENCE_PENDING || currentState === ContinuityState.S3_PRESERVATION_SNAPSHOT_CREATED) {
                    triggerStateTransition(
                      ContinuityState.S3_PRESERVATION_SNAPSHOT_CREATED,
                      "Preservation Snapshot generated matching core schemas.",
                      "Preservation Snapshot Module"
                    );
                  }
                }}
              />
            </div>
          )}

          {activeTab === "bundle" && (
            <div className={`transition-all duration-300 rounded-lg ${currentlyNarratedSectionId === "continuityBundle" ? "ring-2 ring-brand-accent/40 shadow-brand-accent-glow p-1 bg-brand-bg/50" : ""}`}>
              <ContinuityBundleView
                snapshot={snapshot}
                bundle={bundle}
                onGenerateBundle={(bd) => {
                  setBundle(bd);
                  triggerStateTransition(
                    ContinuityState.S4_CONTINUITY_BUNDLE_GENERATED,
                    "Continuity Bundle packaged, cryptographically signed, and finalized.",
                    "Bundle Builder Module"
                  );
                  // Immediately progress to S5 to simulate commitment to ledger registry
                  setTimeout(() => {
                    triggerStateTransition(
                      ContinuityState.S5_ESCROWED_CONTINUITY_STATE,
                      `Sealed Bundle registered on Pluggable Ledger Registry [${ledgerType}] and escrowed.`,
                      "Registry Anchor"
                    );
                  }, 1200);
                }}
              />
            </div>
          )}

          {activeTab === "governance" && (
            <div className={`transition-all duration-300 rounded-lg ${currentlyNarratedSectionId === "governance" ? "ring-2 ring-brand-accent/40 shadow-brand-accent-glow p-1 bg-brand-bg/50" : ""}`}>
              <GovernanceControllerView
                operatingMode={operatingMode}
                continuationMode={continuationMode}
                onUpdateOperatingMode={(mode) => {
                  setOperatingMode(mode);
                  if (currentState === ContinuityState.S5_ESCROWED_CONTINUITY_STATE || currentState === ContinuityState.S6_SUCCESSOR_MODE_SELECTED) {
                    triggerStateTransition(
                      ContinuityState.S6_SUCCESSOR_MODE_SELECTED,
                      `Governance Transition Controller updated active Operating Mode to: ${mode}`,
                      "Successor Claim Portal"
                    );
                  }
                }}
                onUpdateContinuationMode={setContinuationMode}
              />
            </div>
          )}

          {activeTab === "sandbox" && (
            <div className={`transition-all duration-300 rounded-lg ${currentlyNarratedSectionId === "reconstitution" ? "ring-2 ring-brand-accent/40 shadow-brand-accent-glow p-1 bg-brand-bg/50" : ""}`}>
              <ReconstitutionSandbox
                bundle={bundle}
                reconstitution={reconstitution}
                onUpdateReconstitution={setReconstitution}
                onValidationComplete={() => {
                  // Instantly step to S8 and then operational release S9
                  triggerStateTransition(
                    ContinuityState.S8_RECONSTITUTED_VALIDATION_STATE,
                    "Reconstituted sandboxed validation state active. Executing trial queries.",
                    "Sandbox Container Host"
                  );
                  setTimeout(() => {
                    triggerStateTransition(
                      ContinuityState.S9_CONTINUED_AGENT_INSTANCE,
                      "Reconstitution sandbox tests fully passed. Operational release authorized.",
                      "Lineage Verification Daemon"
                    );
                  }, 4800);
                }}
              />
            </div>
          )}

          {activeTab === "lineage" && (
            <div className={`transition-all duration-300 rounded-lg ${currentlyNarratedSectionId === "identityLineage" ? "ring-2 ring-brand-accent/40 shadow-brand-accent-glow p-1 bg-brand-bg/50" : ""}`}>
              <IdentityLineageView
                lineage={lineage}
                drift={drift}
                systemPrompt={snapshot ? snapshot.activePromptsAndPolicy.systemPrompt : "Default system prompt..."}
                onUpdateLineage={setLineage}
                onUpdateDrift={setDrift}
              />
            </div>
          )}

          {activeTab === "commercialization" && (
            <div className={`transition-all duration-300 rounded-lg ${(currentlyNarratedSectionId === "commercialization" || currentlyNarratedSectionId === "funding") ? "ring-2 ring-brand-accent/40 shadow-brand-accent-glow p-1 bg-brand-bg/50" : ""}`}>
              <CommercializationView
                bundle={bundle}
                logs={commercializationLogs}
                onAddLog={(log) => {
                  setCommercializationLogs((prev) => [...prev, log]);
                  triggerStateTransition(
                    ContinuityState.S10_COMMERCIALIZATION_LICENSING_STATE,
                    `Dispersed simulated transaction fee: $${log.revenueUsd} per stored split matrix.`,
                    log.id
                  );
                }}
              />
            </div>
          )}
        </div>

      </main>

      {/* Protocol flow diagram overlay */}
      <ProtocolFlowOverlay
        isOpen={isFlowOverlayOpen}
        onClose={() => setIsFlowOverlayOpen(false)}
        currentState={currentState}
        auditLogs={auditLogs}
        onStateJump={handleStateJump}
      />

      {/* Floating Audio Narration Panel */}
      <NarrationControls />

      {/* Floating Interactive Chat Assistant */}
      <AeternaAssistant />

      {/* Aesthetic humbler footer */}
      <footer className="bg-brand-surface-alt border-t border-brand-border py-6 px-6 mt-12 shrink-0">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <img src="/aeterna-lockup.svg" alt="Aeterna — AI Continuity Protocol" className="w-[150px] opacity-40 hover:opacity-60 transition-opacity" />
            <p className="uppercase tracking-wider font-mono text-[10px] text-brand-ink-dim">
              REFERENCE SIMULATOR // AI CONTINUITY PROTOCOL SPECIFICATION // TECHNICAL EVALUATION ONLY
            </p>
          </div>
          <div className="flex gap-4 font-mono text-[11px] text-brand-ink-dim">
            <span className="text-brand-accent font-semibold">STATE: S0-S11 COMPLIANT</span>
            <span>PLUGGABLE LEDGER INTEGRATION</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("trigger");

  return (
    <NarrationProvider setActiveTab={setActiveTab}>
      <AppContent activeTab={activeTab} setActiveTab={setActiveTab} />
    </NarrationProvider>
  );
}
