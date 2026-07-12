import React, { useState } from "react";
import { ContinuityBundle, PreservationSnapshot } from "../types";
import { sha256, calculateMerkleRoot } from "../utils/crypto";
import { FolderGit2, Fingerprint, Gavel, HelpCircle, Key, Percent, CheckCircle, AlertTriangle, Coins } from "lucide-react";
import { SectionNarrationHeader } from "./SectionNarrationHeader";

interface ContinuityBundleViewProps {
  snapshot: PreservationSnapshot | null;
  bundle: ContinuityBundle | null;
  onGenerateBundle: (bundle: ContinuityBundle) => void;
}

export const ContinuityBundleView: React.FC<ContinuityBundleViewProps> = ({
  snapshot,
  bundle,
  onGenerateBundle,
}) => {
  const [successorName, setSuccessorName] = useState("Sarah Jenkins (Designated Successor)");
  const [trusteeName, setTrusteeName] = useState("LexGuardian Digital Trust Corp");
  const [disputeRules, setDisputeRules] = useState("Arbitration governed by AI-CP Protocol Court 1.0");
  const [successorSplit, setSuccessorSplit] = useState(60);
  const [estateSplit, setEstateSplit] = useState(30);
  const [reserveSplit, setReserveSplit] = useState(10);

  const [activeTab, setActiveTab] = useState<number>(0);

  const handleAssembleBundle = () => {
    if (!snapshot) return;

    // Layer 4: Generate hashes, signatures and Merkle root of layers
    const layer1Hash = sha256("identity-descriptor-" + snapshot.integrityDigest);
    const layer2Hash = sha256(`rights-${successorName}-${trusteeName}-${successorSplit}-${estateSplit}`);
    const layer3Hash = sha256("restore-manifest-requirements");
    const layer5Hash = sha256("commercialization-metadata-v1");

    const merkleRoot = calculateMerkleRoot([layer1Hash, layer2Hash, layer3Hash, snapshot.integrityDigest, layer5Hash]);

    const assembled: ContinuityBundle = {
      id: "bundle-" + sha256(snapshot.integrityDigest).slice(0, 12),
      createdAt: new Date().toISOString(),
      
      // Layer 1: Identity descriptor
      identityDescriptor: {
        canonicalId: "AI-ID-PL-22019488",
        originalHostEmail: "jorgelandscape222@gmail.com",
        createdAtTimestamp: new Date(Date.now() - 31536000000).toISOString(), // 1 year ago
        pluggableLedgerReference: "Hyperledger/Firestore-Signed:TX-88301",
      },

      // Layer 2: Rights and governance manifest
      rightsAndGovernanceManifest: {
        designatedSuccessor: successorName,
        trusteeName,
        approvalGates: ["Primary Successor Consent", "Trustee Legal Probate Co-sign", "Host Heartbeat Timeout Verification"],
        disputeRules,
        royaltySplits: {
          successorPercent: successorSplit,
          estatePercent: estateSplit,
          reservePercent: reserveSplit,
        },
      },

      // Layer 3: Restore manifest
      restoreManifest: {
        requiredCpuCores: 4,
        requiredMemoryGb: 16,
        dependencyReferences: ["@google/genai^2.4.0", "express^4.21.2", "react^19.0.1"],
        launchSteps: [
          "Load Docker container node-18-slim-aistudio-v2.1",
          "Inject certified environment variables",
          "Initialize alternate key remapping client",
          "Verify state-lineage descent anchor",
          "Execute 30-second isolated mock sandbox trial",
        ],
        toolBindingsMap: {
          "gmail_read": "https://api.reissued.google/workspace/gmail",
          "sheets_append": "https://api.reissued.google/workspace/sheets",
          "doc_search": "https://api.reissued.google/workspace/docs",
        },
      },

      // Layer 4: Integrity layer
      integrityLayer: {
        snapshotHash: snapshot.integrityDigest,
        manifestSignature: sha256(successorName + disputeRules),
        merkleRoot,
        timestampSignature: sha256(new Date().toISOString() + "authority-sig-992"),
      },

      // Layer 5: Optional Commercialization Layer
      commercializationMetadata: {
        isAvailableForLicense: true,
        permittedTransactionTypes: ["REST API Call Licensing", "Full Node Lease", "Joint Venture Retraining"],
        minimumMonthlyRateUsd: 450,
        complianceVerificationRequired: true,
      },
    };

    onGenerateBundle(assembled);
  };

  const layers = [
    {
      title: "Layer 1: Identity Descriptor",
      icon: <Fingerprint className="w-4 h-4 text-sky-400" />,
      desc: "Decouples the agent's unique identity record from any single provider, linking to persistent legal/digital registers.",
    },
    {
      title: "Layer 2: Rights & Governance Manifest",
      icon: <Gavel className="w-4 h-4 text-emerald-400" />,
      desc: "Governs post-host actions, specifies successor priorities, dispute mechanisms, and estate royalty split payouts.",
    },
    {
      title: "Layer 3: Restore Manifest",
      icon: <FolderGit2 className="w-4 h-4 text-indigo-400" />,
      desc: "Specifies target CPU/Memory environments, software dependency matches, and remapped alternate tool binds.",
    },
    {
      title: "Layer 4: Cryptographic Integrity Layer",
      icon: <Key className="w-4 h-4 text-amber-400" />,
      desc: "Anchors the entire bundle with a Merkle tree root hash and digital authority signatures, ensuring non-repudiation.",
    },
    {
      title: "Layer 5: Commercialization Metadata",
      icon: <Coins className="w-4 h-4 text-purple-400" />,
      desc: "Bridges the agent's rights into authorized business-model listing options and routing metrics.",
    },
  ];

  return (
    <div className="bg-brand-surface-alt border border-brand-border rounded p-6 space-y-6" id="continuity-bundle-card">
      <SectionNarrationHeader sectionId="continuityBundle" />
      <div className="flex items-center justify-between border-b border-brand-border pb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2 font-mono">
            <FolderGit2 className="text-brand-accent w-4 h-4" /> Continuity Bundle Packaging
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Builds a comprehensive, self-contained, escrowable and signed artifact containing structural recovery manifests.
          </p>
        </div>
      </div>

      {!snapshot ? (
        <div className="bg-brand-bg p-8 rounded border border-brand-border text-center flex flex-col items-center justify-center space-y-3">
          <AlertTriangle className="w-10 h-10 text-amber-500 animate-pulse" />
          <h3 className="text-sm font-semibold text-slate-300 font-mono uppercase tracking-wider">Preservation Snapshot Required First</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            You must first generate a frozen snapshot in the Snapshot Module before the Continuity Bundle can be packaged.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Packaging Form Parameters */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Seal Governance & Rights Manifest</h3>

            <div className="bg-brand-bg p-4 rounded border border-brand-border space-y-3.5">
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-mono block mb-1">Designated Successor</label>
                <input
                  type="text"
                  value={successorName}
                  onChange={(e) => setSuccessorName(e.target.value)}
                  className="w-full text-xs bg-brand-surface text-slate-100 border border-brand-border rounded px-2.5 py-1.5 focus:ring-1 focus:ring-brand-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase font-mono block mb-1">Estate Legal Trustee</label>
                <input
                  type="text"
                  value={trusteeName}
                  onChange={(e) => setTrusteeName(e.target.value)}
                  className="w-full text-xs bg-brand-surface text-slate-100 border border-brand-border rounded px-2.5 py-1.5 focus:ring-1 focus:ring-brand-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase font-mono block mb-1">Dispute Jurisdiction Court</label>
                <input
                  type="text"
                  value={disputeRules}
                  onChange={(e) => setDisputeRules(e.target.value)}
                  className="w-full text-xs bg-brand-surface text-slate-100 border border-brand-border rounded px-2.5 py-1.5 focus:ring-1 focus:ring-brand-accent focus:outline-none"
                />
              </div>

              {/* Royalty Waterfall split sliders */}
              <div className="space-y-2 border-t border-brand-border pt-3">
                <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider font-mono">
                  <Percent className="w-3 h-3 text-brand-accent" /> Royalty Split Waterfall (%)
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Sarah Jenkins (Successor):</span>
                    <span>{successorSplit}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={successorSplit}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setSuccessorSplit(val);
                      setEstateSplit(Math.max(0, 100 - val - reserveSplit));
                    }}
                    className="w-full h-1 bg-brand-surface rounded appearance-none cursor-pointer accent-brand-accent"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Host Estate / Trust Fund:</span>
                    <span>{estateSplit}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={estateSplit}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setEstateSplit(val);
                      setSuccessorSplit(Math.max(0, 100 - val - reserveSplit));
                    }}
                    className="w-full h-1 bg-brand-surface rounded appearance-none cursor-pointer accent-brand-accent"
                  />
                </div>

                <div className="flex justify-between text-[10px] text-slate-500 font-mono italic">
                  <span>Reserved Self-Sovereign Funding:</span>
                  <span>{100 - successorSplit - estateSplit}%</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleAssembleBundle}
              className="w-full bg-brand-accent hover:bg-indigo-500 text-white font-semibold text-xs py-2.5 px-4 rounded transition flex items-center justify-center gap-2 shadow-sm hover:shadow-indigo-500/10"
              id="btn-package-bundle"
            >
              <CheckCircle className="w-4 h-4" /> Assemble & Cryptographically Sign Bundle
            </button>
          </div>

          {/* Bundle Explorer */}
          <div className="lg:col-span-7 bg-brand-bg rounded border border-brand-border p-4 flex flex-col min-h-[350px]">
            <div className="flex justify-between items-center border-b border-brand-border pb-2 mb-3">
              <span className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">Bundle Manifest Inspector</span>
              {bundle && (
                <span className="text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-900 px-2.5 py-0.5 rounded">
                  ID: {bundle.id}
                </span>
              )}
            </div>

            {bundle ? (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                {/* 5-layer folder tab selection */}
                <div className="grid grid-cols-5 gap-1.5 bg-brand-surface-alt p-1.5 rounded border border-brand-border">
                  {layers.map((layer, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTab(index)}
                      className={`py-2 px-1 rounded text-center flex flex-col items-center justify-center transition-all ${
                        activeTab === index
                          ? "bg-brand-surface border border-brand-border text-brand-accent"
                          : "hover:bg-brand-surface/40 text-slate-500"
                      }`}
                      title={layer.title}
                      id={`bundle-tab-${index}`}
                    >
                      {layer.icon}
                      <span className="text-[8px] mt-1 hidden md:inline truncate max-w-full font-mono font-bold">
                        Layer {index + 1}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Tab content view */}
                <div className="bg-brand-surface-alt/40 border border-brand-border p-3.5 rounded flex-1 min-h-[220px] flex flex-col justify-between space-y-3 mt-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 font-mono uppercase tracking-wider">
                      {layers[activeTab].icon} {layers[activeTab].title}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{layers[activeTab].desc}</p>
                  </div>

                  <div className="bg-brand-bg p-2.5 rounded border border-brand-border font-mono text-[9px] text-slate-300 overflow-auto max-h-[160px] flex-1">
                    {activeTab === 0 && (
                      <pre>{JSON.stringify(bundle.identityDescriptor, null, 2)}</pre>
                    )}
                    {activeTab === 1 && (
                      <pre>{JSON.stringify(bundle.rightsAndGovernanceManifest, null, 2)}</pre>
                    )}
                    {activeTab === 2 && (
                      <pre>{JSON.stringify(bundle.restoreManifest, null, 2)}</pre>
                    )}
                    {activeTab === 3 && (
                      <pre>{JSON.stringify(bundle.integrityLayer, null, 2)}</pre>
                    )}
                    {activeTab === 4 && (
                      <pre>{JSON.stringify(bundle.commercializationMetadata, null, 2)}</pre>
                    )}
                  </div>
                </div>

                {/* Merkle cryptographic root verification */}
                <div className="bg-brand-surface-alt p-2 rounded border border-brand-border mt-2 flex items-center justify-between text-[10px]">
                  <div>
                    <span className="text-slate-500 block text-[8px] uppercase font-bold tracking-wider font-mono">Merkle Aggregate Digest</span>
                    <span className="font-mono text-brand-accent font-semibold">{bundle.integrityLayer.merkleRoot}</span>
                  </div>
                  <span className="text-[9px] text-indigo-300 font-mono bg-brand-bg border border-brand-border px-2 py-0.5 rounded flex items-center gap-1 font-bold uppercase">
                    <CheckCircle className="w-3 h-3 text-brand-accent" /> Signed Escrowable Bundle
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 italic space-y-2 py-10 flex-1">
                <FolderGit2 className="w-8 h-8 text-slate-700 animate-pulse" />
                <span className="font-mono text-[10px]">Configure properties and click sign button above...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
