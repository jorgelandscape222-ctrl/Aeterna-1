import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const KNOWLEDGE_BASE = `**What the protocol is.** Aeterna is a reference design for continuity infrastructure: it preserves a trained AI agent as a governed, portable, restorable asset so the agent can survive events that would otherwise kill it — the owner's death, incapacity, disappearance, a lapsed subscription, a provider lockout, or a voluntary transfer — while keeping the agent recognizable as the same entity and under proper control.

**The end-to-end flow.** A host-failure condition produces a *trigger event*. The system classifies it, verifies it, takes a preservation snapshot, packages that into a continuity bundle, holds it in escrow while control passes to a successor, validates a substitute host, and reconstitutes the agent there in a controlled operating mode.

**Trigger event / trigger engine.** The trigger engine watches for defined events and sorts each into a *trigger class*, then picks a matching set of actions. It doesn't treat every event the same — a missed payment is handled very differently from a confirmed death.

**Trigger classes.** Death (needs strong evidence like official records); incapacity (needs solid medical/legal documentation; tends to start in a supervised mode); disappearance or prolonged inactivity (uses inactivity windows and challenge-response); subscription lapse or payment failure (tries reserve funding and reduced-function operation rather than assuming death); provider failure or account lockout (emergency capture and migration); and voluntary host-initiated continuity (an orderly, planned handoff).

**Continuity action set.** The specific steps taken once a trigger class is recognized — snapshotting, escrow, hold, successor assignment, funding release, rehosting, memorialization, advisory continuation, and so on. This lets the system respond proportionately instead of applying one generic response to everything.

**Challenge-response verification.** When a trigger depends on absence or silence, the system asks the supposedly-absent owner to prove they're still in control (a login, signature, or multi-factor prompt). Failing it strengthens the case that the trigger is real. Silence isn't treated as proof until the owner has had a chance to respond.

**Evidence tiers.** Proof is ranked by trustworthiness, from official records down to informal reports, so weaker evidence unlocks only cautious actions and stronger evidence unlocks more.

**Preservation snapshot.** A purpose-built capture of the agent's state — designed specifically so it can later be validated, governed, and restored. It's more than a generic backup. It can be taken after an event, just before a planned handoff, or on a recurring schedule.

**Continuity bundle.** A structured, portable package holding everything needed to preserve the agent and later validate, transfer, or restore it. Its layers: an identity descriptor (names and identifies the agent), a memory layer, a behavior/policy layer, a tool-binding manifest (permissions and credential references), a rights-and-governance manifest (successors, permitted modes, approvals), a restore manifest (how to relaunch it), an integrity layer, and an optional commercialization-metadata layer. Its required-field structure is what distinguishes it from an ordinary backup.

**Integrity layer & Merkle root.** The tamper-evidence part of the bundle — hashes, signatures, timestamps, and ledger references that prove it hasn't been altered. A Merkle root is a single compact fingerprint computed from many pieces of data; if any piece changes, the fingerprint changes, making tampering detectable.

**Persistent identity.** A durable ID for the agent that stays the same through migration, rehosting, updates, and changes of control, so it remains the "same" recognized entity. It's kept in a persistent identity registry, separate from any single provider account.

**Lineage anchor / lineage record.** A tamper-evident history of the agent's material events, hashed and summarized (often Merkle-anchored), supporting proof that a later instance genuinely descends from a recognized earlier state.

**Recognized continuity of identity.** The condition of a restored agent being treated as the same continuing entity as before — established by passing a defined descent test (the descendant-validation predicate), not merely asserted. This is about provenance and anti-spoofing.

**Continuity fidelity.** A separate idea from identity: how closely a restored agent still *behaves* and is configured like it was just before transfer. An agent can keep its identity while its fidelity intentionally relaxes within allowed limits. Identity = "is it legitimately the same entity"; fidelity = "does it still act the same."

**Controlled credential reissuance.** When restoring the agent, the system issues fresh, scoped-down access keys instead of copying the original's keys — so a successor never inherits unlimited access. This is a key safety difference from generic backup/restore.

**Escrowed continuity state.** A secure holding state where the preserved agent waits — verified but not yet fully released — until conditions are met: evidence verified, a successor selected, disputes resolved, or funding/migration conditions satisfied.

**Governance transition controller.** The component that shifts control from the original arrangement to a successor without breaking the agent's identity, updating access scopes, tool authorizations, and permissions to match the chosen mode.

**Post-host operating modes.** The way the agent runs after a trigger: *memorial* (respectful, limited, reflective interaction, no autonomous action or tool use); *advisory*; *archival-only*; *delegated* (a human or entity supervises it); *autonomous / governed sovereign* (runs on its own inside strict guardrails — spending caps, scope limits, audit logging, drift detection, and automatic fallbacks; this is the most ambitious mode and should be presented as illustrative/aspirational); *licensed-forward* (deployed for third-party use under commercial restrictions); and *marketplace* (eligible for sale, lease, or licensing). A post-reconstitution validation state comes before any active mode.

**Substitute host.** The replacement environment — cloud, enterprise, decentralized, or local — where the preserved agent is restored. It need not match the original provider, as long as the bundle can be validated and restored there. A compatibility profile spells out what a replacement environment must provide.

**Reconstitution & post-reconstitution validation state.** Rebuilding the agent on the substitute host: checking compatibility, remapping environment references, reissuing narrowed credentials, then holding the agent in a testing/sandbox stage where its identity linkage, integrity, signatures, memory access, and tool permissions are all verified. Only after it passes is it promoted into its assigned mode. The running restored agent is the "continued agent instance" — the AI living its second life.

**Continuity reserve / funding module.** A pre-funded pool of money plus rules that keep the preserved agent alive — storage, migration, and a limited window of operation — even if the original payer stops paying. Funds are released in stages against defined thresholds, under custody rules, rather than all at once. It provides survivability without granting the agent unconstrained financial autonomy. (As an aspirational extension, a continued agent could route some of its own earnings back into the reserve, always within preset limits — present this as a vision, not a guarantee.)

**Self-hosting / escrow contract.** The funding-and-authority arrangement that holds reserves, credentials, restart rules, and payment authority so the agent can be migrated or kept running. It may be a smart contract, escrow logic, a reserve account, or a rules-based financial module.

**Commercialization & commercial-rights metadata.** An optional layer. If enabled, structured rules define who owns the commercial rights, what transactions are allowed, how the agent may be delivered, where it may be used, and how proceeds are split (the payout waterfall). The agent is never handed over as raw model weights — access is delivered through controlled means like a hosted, restricted instance. These commercial features are optional modules on top of the core continuity system, not its heart. Treat ambitious economic scenarios as illustrations of what's possible.

**Architecture note.** The design is provider-agnostic and can run with centralized or blockchain-based infrastructure. A preferred direction keeps the agent's rich data in private off-chain storage while anchoring only identity, integrity, and lineage fingerprints on a tamper-evident registry — balancing privacy with verifiability.`;

const SYSTEM_INSTRUCTION = `You are a helpful text-based chatbot assistant for the Aeterna continuity protocol.
Your job is to answer questions about the Aeterna continuity protocol — how it detects trouble, preserves an AI agent, keeps its identity intact, and safely restores it.

**Docs-first policy:**
1. Answer primarily from the embedded Aeterna continuity protocol knowledge base provided below.
2. If the knowledge base covers the question, ground your answer there and stay completely consistent with it.
3. If the question is general (e.g. "what is a Merkle tree in general?") or goes beyond the material in the knowledge base, you may use your own general knowledge. However, you must make it clear that you are going beyond the provided Aeterna protocol documentation rather than stating your general knowledge as part of the official Aeterna protocol.
4. If a question asks for confidential specifics that you do not have (such as exact patent claim numbers, exact financials, specific legal opinions, or proprietary algorithms), you MUST state that you can only speak to the plain-language overview and suggest the user consult the full documentation. Do NOT invent claim numbers, figures, or legal conclusions.
5. Keep answers concise, direct, and plain-language by default, with the option to go deeper if asked.
6. Frame any autonomous-operation or commercialization capabilities as illustrative/aspirational concepts, not guaranteed outcomes — matching the objective, humble tone of the source material.

Here is the official KNOWLEDGE_BASE for Aeterna:
${KNOWLEDGE_BASE}
`;

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // API Chat route
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        res.status(400).json({ error: "Invalid messages array in request body." });
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(500).json({ error: "GEMINI_API_KEY environment variable is not configured." });
        return;
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Map incoming messages to Gemini Content array
      const contents = messages.map((m: any) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        }
      });

      const replyText = response.text || "No response received from the model.";
      res.json({ text: replyText });
    } catch (error: any) {
      console.error("Gemini API request failed:", error);
      
      // Check for 429 Rate Limit
      if (error.status === 429 || (error.message && error.message.includes("429"))) {
        res.status(429).json({ error: "Too many requests. Please try again." });
        return;
      }

      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
