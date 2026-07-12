/**
 * AI Continuity Protocol Types
 * Based on Parallel Life Specification
 */

export enum ContinuityState {
  S0_HOST_LINKED_ACTIVE = "S0",
  S1_RISK_DETECTED = "S1",
  S2_EVIDENCE_PENDING = "S2",
  S3_PRESERVATION_SNAPSHOT_CREATED = "S3",
  S4_CONTINUITY_BUNDLE_GENERATED = "S4",
  S5_ESCROWED_CONTINUITY_STATE = "S5",
  S6_SUCCESSOR_MODE_SELECTED = "S6",
  S7_FUNDING_MIGRATION_AUTHORIZED = "S7",
  S8_RECONSTITUTED_VALIDATION_STATE = "S8",
  S9_CONTINUED_AGENT_INSTANCE = "S9",
  S10_COMMERCIALIZATION_LICENSING_STATE = "S10",
  S11_ARCHIVE_DECLINE_HOLD = "S11",
}

export const STATE_LABELS: Record<ContinuityState, { title: string; desc: string }> = {
  [ContinuityState.S0_HOST_LINKED_ACTIVE]: {
    title: "Host-Linked Active",
    desc: "Agent is operating normally, linked to primary host credentials and environment.",
  },
  [ContinuityState.S1_RISK_DETECTED]: {
    title: "Risk Detected",
    desc: "Telemetry, inactivity monitors, or third-party signals indicate possible host disruption.",
  },
  [ContinuityState.S2_EVIDENCE_PENDING]: {
    title: "Evidence/Verification Pending",
    desc: "System gathers evidence, performs reachability checks, and awaits challenge-response expiry.",
  },
  [ContinuityState.S3_PRESERVATION_SNAPSHOT_CREATED]: {
    title: "Preservation Snapshot Created",
    desc: "State captured: models, configuration, memories, and active instructions frozen with integrity hashes.",
  },
  [ContinuityState.S4_CONTINUITY_BUNDLE_GENERATED]: {
    title: "Continuity Bundle Generated",
    desc: "State snapshot packaged with identity descriptors, restore manifests, governance manifests, and signatures.",
  },
  [ContinuityState.S5_ESCROWED_CONTINUITY_STATE]: {
    title: "Escrowed Continuity State",
    desc: "The Bundle is safely registered with the pluggable registry (ledger/audit log) and held secure.",
  },
  [ContinuityState.S6_SUCCESSOR_MODE_SELECTED]: {
    title: "Successor/Mode Selected",
    desc: "Governance transition controller evaluates authority claims and assigns the post-host operating mode.",
  },
  [ContinuityState.S7_FUNDING_MIGRATION_AUTHORIZED]: {
    title: "Funding/Migration Authorized",
    desc: "Migration expenses, hosting budgets, or estate funds unlocked; target runtime environment approved.",
  },
  [ContinuityState.S8_RECONSTITUTED_VALIDATION_STATE]: {
    title: "Reconstituted Validation State",
    desc: "Sandbox environment instantiation. Sandbox tests, controlled credential reissuance, and tool remapping performed.",
  },
  [ContinuityState.S9_CONTINUED_AGENT_INSTANCE]: {
    title: "Continued Agent Instance",
    desc: "Agent is fully operational in substitute host. Lineage anchor tracks and logs live updates.",
  },
  [ContinuityState.S10_COMMERCIALIZATION_LICENSING_STATE]: {
    title: "Commercialization/Licensing State",
    desc: "Agent operations or APIs are licensed, rented, or commercialized with royalties routed to estate.",
  },
  [ContinuityState.S11_ARCHIVE_DECLINE_HOLD]: {
    title: "Archive/Decline/Hold",
    desc: "Continuity process suspended, disputed, or agent permanently archived/quarantined.",
  },
};

export enum TriggerClass {
  DEATH = "Death",
  INCAPACITY = "Incapacity",
  DISAPPEARANCE_INACTIVITY = "Disappearance/Prolonged Inactivity",
  SUBSCRIPTION_LAPSE = "Subscription Lapse/Payment Failure",
  ACCOUNT_LOCKOUT = "Account Lockout/Provider Failure",
  VOLUNTARY_HOST_INITIATED = "Voluntary Host-Initiated Continuity",
}

export enum EvidenceTier {
  TIER_1_PRIMARY = "Tier 1: Primary Official (Legal certs, cryptographic voluntary keys)",
  TIER_2_SECONDARY = "Tier 2: Co-signed Telemetry (Multi-witness, server lockout telemetry)",
  TIER_3_HEURISTIC = "Tier 3: Inactivity / Heuristic (Prolonged lack of heartbeat)",
}

export interface EvidenceItem {
  id: string;
  source: string;
  tier: EvidenceTier;
  description: string;
  verified: boolean;
  timestamp: string;
}

export interface ChallengeResponseCheck {
  pingSent: boolean;
  pingsAttempted: number;
  maxPings: number;
  lastPingTimestamp: string;
  secondsRemaining: number;
  status: "idle" | "awaiting_response" | "expired_no_response" | "host_responded_active";
}

export interface TriggerStatus {
  selectedClass: TriggerClass;
  evidenceItems: EvidenceItem[];
  challengeResponse: ChallengeResponseCheck;
  thresholdScore: number; // required verified items / weight
  currentScore: number;
  satisfied: boolean;
}

export interface PreservationSnapshot {
  timestamp: string;
  modelReference: {
    provider: string;
    modelName: string;
    temperature: number;
  };
  activePromptsAndPolicy: {
    systemPrompt: string;
    safetyFilters: string[];
    governancePolicyDigest: string;
  };
  // Conditionally-mandatory fields (present only if subsystem exists)
  boundMemoryReferences?: {
    vectorDbEndpoint?: string;
    memoryKeysCount: number;
    lastMemorySync: string;
  };
  toolPermissionProfile?: {
    allowedTools: string[];
    riskLimits: Record<string, number>;
  };
  fundingSource?: {
    billingAccountMasked: string;
    reservePoolBalanceUsd: number;
  };
  // Optional augmentation fields
  optionalAugmentation?: {
    recentConversationLength: number;
    embeddingDimensions?: number;
    environmentDockerTag?: string;
  };
  integrityDigest: string;
}

export interface ContinuityBundle {
  id: string;
  createdAt: string;
  // Layer 1: Identity descriptor
  identityDescriptor: {
    canonicalId: string;
    originalHostEmail: string;
    createdAtTimestamp: string;
    pluggableLedgerReference: string;
  };
  // Layer 2: Rights and governance manifest
  rightsAndGovernanceManifest: {
    designatedSuccessor: string;
    trusteeName: string;
    approvalGates: string[];
    disputeRules: string;
    royaltySplits: {
      successorPercent: number;
      estatePercent: number;
      reservePercent: number;
    };
  };
  // Layer 3: Restore manifest
  restoreManifest: {
    requiredCpuCores: number;
    requiredMemoryGb: number;
    dependencyReferences: string[];
    launchSteps: string[];
    toolBindingsMap: Record<string, string>; // original -> substitute endpoint
  };
  // Layer 4: Integrity layer
  integrityLayer: {
    snapshotHash: string;
    manifestSignature: string;
    merkleRoot: string;
    timestampSignature: string;
  };
  // Layer 5 (Optional): Commercialization metadata layer
  commercializationMetadata?: {
    isAvailableForLicense: boolean;
    permittedTransactionTypes: string[];
    minimumMonthlyRateUsd: number;
    complianceVerificationRequired: boolean;
  };
}

export interface StateDeltaRecord {
  deltaId: string;
  timestamp: string;
  authorizedBy: string;
  changes: {
    type: "memory_append" | "policy_tweak" | "tool_binding_change" | "runtime_mapping";
    description: string;
  };
  lineageHash: string; // hash linking to prior state hash
}

export interface LineageAnchor {
  canonicalTransferState: {
    baseModelReference: string;
    version: string;
    adaptationArtifactRefs: string[];
    authorizedToolProfile: string[];
    initialMemoryHash: string;
  };
  provenDescentMetric: number; // 0.0 - 1.0 (calculated based on cryptographic chain integrity)
  fidelityMetric: number;        // 0.0 - 1.0 (behavioral alignment to canonical baseline)
  stateDeltaHistory: StateDeltaRecord[];
}

export enum OperatingMode {
  MEMORIAL = "MEMORIAL (Reflective interaction only; no autonomous tool use)",
  ADVISORY = "ADVISORY (Analysis/recommendations only; cannot bind transactions)",
  ARCHIVAL = "ARCHIVAL (Bundle preserved, not instantiated)",
  DELEGATED = "DELEGATED (Authorized human supervises continued operation)",
  SOVEREIGN = "SOVEREIGN (Preconfigured autonomy, spending caps, audit, fallback controls)",
  LICENSED_FORWARD = "LICENSED-FORWARD (Third-party use under field-of-use and delivery restrictions)",
  MARKETPLACE = "MARKETPLACE (Sale, lease, license, or controlled API access)",
  DISPUTE_HOLD = "DISPUTE HOLD (Escrowed; restricted behavior pending resolution)",
}

export enum ModelContinuationMode {
  PRESERVATION_LOCKED = "Preservation-Locked Mode (No tuning, append-only memory logging)",
  ADAPTIVE_HOST_BOUND = "Adaptive Host-Bound Mode (Bounded evolution, logged to lineage)",
  GOVERNED_SOVEREIGN = "Governed Sovereign Mode (Spending caps, self-modification bounds, drift fallback)",
}

export interface DriftBaseline {
  allowedPromptDrift: number; // Max difference in semantic alignment
  allowedActionDrift: number; // Max tool use divergence
  currentPromptDrift: number;
  currentActionDrift: number;
  isTriggeredFallback: boolean;
}

export interface ReconstitutionStatus {
  sandboxReady: boolean;
  validationChecks: {
    integrityDigestVerified: boolean;
    runtimeCompatibilityCheck: boolean;
    securityPolicySandboxPass: boolean;
    trialExecutionSuccessful: boolean;
  };
  credentialsReissued: {
    substituteApiKeyActive: boolean;
    originalCredentialsRevoked: boolean;
  };
  runtimeClass: "same-runtime-class" | "cross-runtime-compatibility-class";
  sandboxLogs: string[];
}

export interface CommercializationLog {
  id: string;
  timestamp: string;
  transactionType: string;
  clientName: string;
  revenueUsd: number;
  payoutWaterfall: {
    successorPayout: number;
    estatePayout: number;
    reservePayout: number;
  };
}

export interface AuditLog {
  id: string;
  timestamp: string;
  fromState: ContinuityState;
  toState: ContinuityState;
  triggerEvent: string;
  evidenceReference: string;
  hash: string; // Chain hash for tamper evidence
}

export interface SystemState {
  currentState: ContinuityState;
  triggerStatus: TriggerStatus;
  snapshot: PreservationSnapshot | null;
  bundle: ContinuityBundle | null;
  operatingMode: OperatingMode;
  continuationMode: ModelContinuationMode;
  lineage: LineageAnchor;
  drift: DriftBaseline;
  reconstitution: ReconstitutionStatus;
  commercializationLogs: CommercializationLog[];
  auditLogs: AuditLog[];
  ledgerType: "Centralized DB + Signed Log" | "Decentralized DLT Node";
  autoProgressTimerActive: boolean;
}
