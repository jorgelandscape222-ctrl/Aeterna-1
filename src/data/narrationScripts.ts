export interface NarrationScript {
  title: string;
  tourScript: string;
  sectionScript: string;
}

export const NARRATION_SCRIPTS: Record<string, NarrationScript> = {
  triggerDetection: {
    title: "Detecting the Trigger",
    tourScript: "Everything starts here, by watching for signs that an agent's normal support has broken down. Not every problem is the same, so the system sorts each event by type before acting — a missed payment is treated very differently from a confirmed death.",
    sectionScript: "This stage watches for defined events — things like death, incapacity, long inactivity, a lapsed subscription, or a provider lockout — and classifies each one. It weighs how strong the evidence is and can send a challenge before doing anything, so a false alarm doesn't trigger a serious response. Weaker evidence unlocks only cautious actions; stronger evidence unlocks more."
  },
  preservation: {
    title: "Taking the Snapshot",
    tourScript: "Once a real event is confirmed, the system captures the agent's state. This is more than a backup — it's a purpose-built snapshot designed to be verified, governed, and safely restored later.",
    sectionScript: "The snapshot records what makes the agent itself: its model state, memory, behavior rules, tool permissions, and restore instructions, along with an integrity fingerprint. It can be taken right after an event, just before a planned handoff, or on a recurring schedule. Unlike an ordinary export, it's built specifically so a future restore can be checked and trusted."
  },
  continuityBundle: {
    title: "Packaging the Bundle",
    tourScript: "The snapshot is wrapped into a governed package called a continuity bundle. It carries not just the agent's data, but the rules for who may restore it and how.",
    sectionScript: "The bundle bundles several layers together: an identity descriptor, the memory and behavior layers, a tool-binding manifest, a rights-and-governance manifest naming successors and permitted modes, a restore manifest, and an integrity layer of hashes and signatures. Commercial details are an optional add-on layer. Together these make the agent portable and restorable without losing track of who's allowed to do what."
  },
  identityLineage: {
    title: "Identity & Lineage",
    tourScript: "For a restored agent to count as the same agent, its identity has to survive the move. This stage keeps a durable identity that isn't tied to any single provider account, plus a tamper-evident record of its history.",
    sectionScript: "A persistent identifier stays constant through migration, rehosting, and changes of control, kept separate from any one provider. A lineage record stores hashes and signatures — summarized into a compact fingerprint — so anyone can verify that a later instance genuinely descends from a recognized earlier state, rather than being an unrelated or faked copy. Rich data stays in private storage; only the fingerprints need to be anchored."
  },
  governance: {
    title: "Governance & Control",
    tourScript: "Before an agent can run again, control has to move cleanly from the old arrangement to a successor. This stage decides how the agent is allowed to operate next — and holds it safely while that's being sorted out.",
    sectionScript: "The bundle waits in a secure holding state until conditions are met — evidence verified, a successor chosen, disputes resolved, funding confirmed. Then a controller assigns authority and selects an operating mode: memorial, advisory, archival-only, delegated to a supervisor, or — as an illustrative, more ambitious option — a bounded autonomous mode with strict guardrails. If a higher-priority authority appears or a dispute arises, control can be paused, narrowed, or overridden."
  },
  reconstitution: {
    title: "Reconstitution & Validation",
    tourScript: "Now the agent is rebuilt on a new host. Crucially, it doesn't go live immediately — it first has to pass a set of safety checks in a validation stage.",
    sectionScript: "The system checks the substitute host for compatibility, remaps environment references, and reissues credentials in a controlled, narrowed way rather than handing over the originals. The restored agent then sits in a post-reconstitution validation state, where its identity linkage, integrity, signatures, memory access, and tool permissions are all verified. Only after it passes is it promoted into its assigned operating mode."
  },
  funding: {
    title: "Funding Continuity",
    tourScript: "None of this is free, so the design includes a dedicated funding pool set up ahead of time — kept separate from the original account so continuity survives even when normal billing stops.",
    sectionScript: "A continuity reserve is established before any event and funds continuity-specific work: taking snapshots, storage, verification, rehosting, and a limited window of restricted operation afterward. Funds are released in stages against defined thresholds, under custody rules rather than all at once. As an aspirational extension, a continued agent could route some of its own earnings back into the reserve to help sustain itself — always within preset spending and governance limits."
  },
  commercialization: {
    title: "Commercialization & Rights",
    tourScript: "Finally, an optional layer covers what happens if a preserved agent has lasting value. This is strictly rules-based — nothing is sellable just because it exists.",
    sectionScript: "If enabled, a rights layer defines who may authorize a transaction, which transaction types and delivery forms are allowed, any limits on how the agent may be used, and how any proceeds are split. Importantly, the agent is never handed over as raw model weights — access is delivered through controlled means like a hosted, restricted instance. These commercial features are optional modules layered on top of the core continuity system, not the heart of it. Treat the more ambitious economic scenarios as illustrations of what's possible, not guarantees."
  }
};

export const WELCOME_SCRIPT = "Welcome. This is a walkthrough of the Aeterna continuity protocol — a reference design for keeping a trained AI agent alive, recognizable, and under proper control even after the person or account behind it goes away. On screen you'll find each stage of that process, from spotting trouble to safely bringing the agent back. I can guide you through it, or you can explore on your own.";
