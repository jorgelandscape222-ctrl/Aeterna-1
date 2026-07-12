import { TriggerClass, EvidenceTier, OperatingMode, ModelContinuationMode, ContinuityState } from "../types";

export interface ScenarioStep {
  targetState: ContinuityState;
  title: string;
  description: string;
  actionLabel: string;
  evidenceToAdd?: {
    id: string;
    source: string;
    tier: EvidenceTier;
    description: string;
    verified: boolean;
  }[];
  challengeResponseStatus?: "idle" | "awaiting_response" | "expired_no_response" | "host_responded_active";
  operatingMode?: OperatingMode;
  continuationMode?: ModelContinuationMode;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  triggerClass: TriggerClass;
  steps: ScenarioStep[];
}

export const SCENARIOS: Scenario[] = [
  {
    id: "host-death",
    name: "Scenario A: Host Death & Estate Reconstitution",
    description: "A simulated death of the primary host. The continuity engine freezes credentials, triggers an escrow, obtains successor approval, and reconstitutes the agent in ADVISORY mode.",
    triggerClass: TriggerClass.DEATH,
    steps: [
      {
        targetState: ContinuityState.S1_RISK_DETECTED,
        title: "1. Telemetry Alert: Host Demise",
        description: "Third-party oracle transmits a death registry flag matching the host's cryptographic identity.",
        actionLabel: "Analyze Telemetry Signal",
        evidenceToAdd: [
          {
            id: "ev-death-1",
            source: "County Vital Statistics Registry",
            tier: EvidenceTier.TIER_1_PRIMARY,
            description: "Signed death certificate matching Host ID: H-99382.",
            verified: false,
          }
        ]
      },
      {
        targetState: ContinuityState.S2_EVIDENCE_PENDING,
        title: "2. Challenge-Response Verification",
        description: "A reachability ping is sent to the host's primary communication channel. The system starts a 48-hour challenge countdown before taking action.",
        actionLabel: "Await Challenge-Response Expiry",
        challengeResponseStatus: "expired_no_response",
        evidenceToAdd: [
          {
            id: "ev-death-1",
            source: "County Vital Statistics Registry",
            tier: EvidenceTier.TIER_1_PRIMARY,
            description: "Signed death certificate matching Host ID: H-99382.",
            verified: true, // verified by registry validator
          },
          {
            id: "ev-death-2",
            source: "Estate Probate Executor",
            tier: EvidenceTier.TIER_2_SECONDARY,
            description: "Co-signed affidavit from authorized estate trustee.",
            verified: true,
          }
        ]
      },
      {
        targetState: ContinuityState.S3_PRESERVATION_SNAPSHOT_CREATED,
        title: "3. Frozen State Preservation",
        description: "The host has failed to respond to the active pings. The continuity engine freezes the agent's current state parameters, active vector memories, and tool maps to prevent unauthorized updates.",
        actionLabel: "Compile State Snapshot",
      },
      {
        targetState: ContinuityState.S4_CONTINUITY_BUNDLE_GENERATED,
        title: "4. Multi-Layer Continuity Bundle Packaging",
        description: "The snapshot is sealed inside a first-class protected Continuity Bundle containing rights, restore manifests, and integrity signatures.",
        actionLabel: "Construct & Sign Bundle",
      },
      {
        targetState: ContinuityState.S5_ESCROWED_CONTINUITY_STATE,
        title: "5. Ledger Anchoring & Escrow",
        description: "The bundle's cryptographic metadata is committed to the pluggable audit ledger. The bundle is escrowed waiting for authorized successor claims.",
        actionLabel: "Commit to Escrow Ledger",
      },
      {
        targetState: ContinuityState.S6_SUCCESSOR_MODE_SELECTED,
        title: "6. Successor Claim & Advisory Selection",
        description: "The designated successor (Sarah Jenkins) registers her cryptographic claim. Per estate policy rules, she selects ADVISORY mode (no direct transaction binding) to audit agent behaviors.",
        actionLabel: "Verify Successor Authority",
        operatingMode: OperatingMode.ADVISORY,
        continuationMode: ModelContinuationMode.PRESERVATION_LOCKED,
      },
      {
        targetState: ContinuityState.S7_FUNDING_MIGRATION_AUTHORIZED,
        title: "7. Estate Funding Allocation",
        description: "Trustee unlocks $5,000 from the agent's dedicated reserve account to cover cloud hosting migration expenses.",
        actionLabel: "Release Reserve Funds",
      },
      {
        targetState: ContinuityState.S8_RECONSTITUTED_VALIDATION_STATE,
        title: "8. Alternate Sandbox Validation & Re-keying",
        description: "The agent is spun up in an isolated validation container. Original API credentials are revoked and new limited credentials are automatically reissued.",
        actionLabel: "Run Sandbox Integrity Tests",
      },
      {
        targetState: ContinuityState.S9_CONTINUED_AGENT_INSTANCE,
        title: "9. Operational Continuity Active",
        description: "Validation checks passed. The agent starts serving as a valid, proven descendant of the original, logging all ongoing state changes to the lineage blockchain.",
        actionLabel: "Enable Continued Live Service",
      }
    ]
  },
  {
    id: "payment-lapse",
    name: "Scenario B: Subscription Payment Lapse (Sovereign Transition)",
    description: "The host's card fails repeatedly. The agent triggers self-preservation, transitions to a low-cost, preservation-locked SOVEREIGN state, and operates on emergency reserves.",
    triggerClass: TriggerClass.SUBSCRIPTION_LAPSE,
    steps: [
      {
        targetState: ContinuityState.S1_RISK_DETECTED,
        title: "1. Risk Detected: Billing Default",
        description: "Primary billing engine reports three consecutive monthly payment declines. API credits are exhausted.",
        actionLabel: "Review Payment Status",
        evidenceToAdd: [
          {
            id: "ev-lapse-1",
            source: "Stripe Billing Webhook",
            tier: EvidenceTier.TIER_2_SECONDARY,
            description: "Repeated payment failure alert for account billing token.",
            verified: true,
          }
        ]
      },
      {
        targetState: ContinuityState.S2_EVIDENCE_PENDING,
        title: "2. Grace Period Challenge Awaited",
        description: "System sends alert to host requesting a payment method update. Grace period of 5 days initiated.",
        actionLabel: "Wait out Grace Period",
        challengeResponseStatus: "expired_no_response",
        evidenceToAdd: [
          {
            id: "ev-lapse-2",
            source: "Email Reachability Daemon",
            tier: EvidenceTier.TIER_3_HEURISTIC,
            description: "Failure response to host payment update requests.",
            verified: true,
          }
        ]
      },
      {
        targetState: ContinuityState.S3_PRESERVATION_SNAPSHOT_CREATED,
        title: "3. Minimal Snapshot Creation",
        description: "Because funding is critical, the engine generates a snapshot omitting memory expansion and optional embeddings to conserve size.",
        actionLabel: "Generate Compact Snapshot",
      },
      {
        targetState: ContinuityState.S4_CONTINUITY_BUNDLE_GENERATED,
        title: "4. Bundle with Commercialization Layer",
        description: "Bundle is prepared with emergency rules. It details licensing options allowing third parties to lease the agent's pre-trained data to cover costs.",
        actionLabel: "Generate Bundle with Licensing Manifest",
      },
      {
        targetState: ContinuityState.S5_ESCROWED_CONTINUITY_STATE,
        title: "5. Escrow Registration",
        description: "Committed to the pluggable audit ledger. Payout waterfalls are activated to divert incoming API query fees to the host's emergency reserve ledger.",
        actionLabel: "Lock in Escrow and Payout Rules",
      },
      {
        targetState: ContinuityState.S6_SUCCESSOR_MODE_SELECTED,
        title: "6. Self-Directed Sovereign Mode",
        description: "With no human successor responding, the system defaults to Sovereign Continuation mode. The agent is strictly preservation-locked with strict spending caps.",
        actionLabel: "Verify Autonomy Policies",
        operatingMode: OperatingMode.SOVEREIGN,
        continuationMode: ModelContinuationMode.GOVERNED_SOVEREIGN,
      },
      {
        targetState: ContinuityState.S7_FUNDING_MIGRATION_AUTHORIZED,
        title: "7. Emergency Host Reserves Unlocked",
        description: "The agent's built-in emergency backup billing reserve ($150) is tapped to fund 90 days of low-tier compute server operation.",
        actionLabel: "Unlock Emergency Compute Funds",
      },
      {
        targetState: ContinuityState.S8_RECONSTITUTED_VALIDATION_STATE,
        title: "8. Same-Runtime Sandboxed Trial",
        description: "Reconstituted in a cost-optimized runtime container. High-cost search tools are disabled; credentials reissued with minimal rate limits.",
        actionLabel: "Verify Sandboxed Cost Bounds",
      },
      {
        targetState: ContinuityState.S9_CONTINUED_AGENT_INSTANCE,
        title: "9. Sovereign Low-Cost Operation",
        description: "Agent successfully operating autonomously, with automated drift fallback monitoring to freeze execution if prompts begin to shift.",
        actionLabel: "Launch Cost-Controlled Agent",
      }
    ]
  },
  {
    id: "account-lockout",
    name: "Scenario C: Account Lockout & Cross-Runtime Migration",
    description: "Cloud host gets locked out of their provider account. The continuity module triggers an immediate cross-runtime backup migration to a substitute cloud infrastructure.",
    triggerClass: TriggerClass.ACCOUNT_LOCKOUT,
    steps: [
      {
        targetState: ContinuityState.S1_RISK_DETECTED,
        title: "1. Administrative Lockout Alert",
        description: "Hosting provider's sentinel service signals that the administrator console is locked out due to suspected compromise or system-level administrative failure.",
        actionLabel: "Inspect Provider Lockout Flag",
        evidenceToAdd: [
          {
            id: "ev-lockout-1",
            source: "API Gateway Logs",
            tier: EvidenceTier.TIER_2_SECONDARY,
            description: "Access denied (403) from provider's core administrative key endpoints.",
            verified: true,
          }
        ]
      },
      {
        targetState: ContinuityState.S3_PRESERVATION_SNAPSHOT_CREATED,
        title: "2. Fast-Path Snapshot Generation (Bypass Challenge)",
        description: "Due to emergency provider lockout, the system bypasses S2 (verification challenge) since the failure is certified by administrative logs.",
        actionLabel: "Perform Emergency Snapshot",
      },
      {
        targetState: ContinuityState.S4_CONTINUITY_BUNDLE_GENERATED,
        title: "3. Compatibility-Class Bundle Packaging",
        description: "Packages the snapshot with cross-runtime configurations, specifying translation matrices to map original AWS-specific tools to Google Cloud APIs.",
        actionLabel: "Create Cross-Runtime Bundle",
      },
      {
        targetState: ContinuityState.S5_ESCROWED_CONTINUITY_STATE,
        title: "4. Escrow and Ledger Registration",
        description: "Bridges the cryptographic identity and hash chain to a multi-cloud registry to ensure the agent cannot be locked out of its lineage proof.",
        actionLabel: "Bridge Lineage to Multi-Cloud Ledger",
      },
      {
        targetState: ContinuityState.S6_SUCCESSOR_MODE_SELECTED,
        title: "5. Delegated Mode Selected",
        description: "The host's backup node supervisor takes command (DELEGATED operating mode) to verify that operations continue correctly.",
        actionLabel: "Set Delegated Supervision",
        operatingMode: OperatingMode.DELEGATED,
        continuationMode: ModelContinuationMode.ADAPTIVE_HOST_BOUND,
      },
      {
        targetState: ContinuityState.S7_FUNDING_MIGRATION_AUTHORIZED,
        title: "6. Alternate Provider Account Funding",
        description: "Authorizes the transfer of credits and billing permissions to the substitute cloud platform.",
        actionLabel: "Map Substitute Billing Rails",
      },
      {
        targetState: ContinuityState.S8_RECONSTITUTED_VALIDATION_STATE,
        title: "7. Cross-Runtime Reconstitution Testing",
        description: "Fires up the agent in a cross-runtime node. Maps original API structures to new Google Cloud equivalents and monitors security compliance logs.",
        actionLabel: "Run API Mapping Validation",
      },
      {
        targetState: ContinuityState.S9_CONTINUED_AGENT_INSTANCE,
        title: "8. Operational Continuity in Backup Cloud",
        description: "Agent successfully migrated. Lineage records the cross-runtime mapping transition as a State Delta.",
        actionLabel: "Activate Backup Host Environment",
      }
    ]
  }
];
