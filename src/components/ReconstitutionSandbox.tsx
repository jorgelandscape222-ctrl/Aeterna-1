import React, { useState } from "react";
import { ReconstitutionStatus, ContinuityBundle } from "../types";
import { Cpu, CheckCircle, AlertCircle, RefreshCw, Terminal, Eye, Link2, ShieldCheck } from "lucide-react";

interface ReconstitutionSandboxProps {
  bundle: ContinuityBundle | null;
  reconstitution: ReconstitutionStatus;
  onUpdateReconstitution: (status: ReconstitutionStatus) => void;
  onValidationComplete: () => void;
}

export const ReconstitutionSandbox: React.FC<ReconstitutionSandboxProps> = ({
  bundle,
  reconstitution,
  onUpdateReconstitution,
  onValidationComplete,
}) => {
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [runtimeClass, setRuntimeClass] = useState<"same-runtime-class" | "cross-runtime-compatibility-class">("same-runtime-class");

  const runSandboxedReconstitution = () => {
    if (!bundle) return;
    setIsRunningTests(true);

    const logs: string[] = [
      "🔄 Initializing reconstitution host allocation...",
      `⚡ Host Node Allocated: CPU vCores (${bundle.restoreManifest.requiredCpuCores}) | MEM (${bundle.restoreManifest.requiredMemoryGb}GB)`,
      `🛡️ Pulling target container image reference...`,
      "🔎 Checking integrity digest against audit ledger blockchain...",
      `✅ Cryptographic Match Found: snapshotHash matches ledger bundle digest: [${bundle.integrityLayer.snapshotHash.slice(0, 16)}...]`,
      "🚨 Revoking original host API credentials...",
      "🔐 Original Stripe-Acc-****-8820 credential REVOKED on payment gateway.",
      "🗝️ Issuing substitute scoped credentials... (reissue-only, no copies allowed)",
      "✅ Scoped credential REISSUED: 'SUBSTITUTE_API_KEY_AI_CP_882a' loaded with strict daily spending cap limits.",
      "🗺️ Binding tool endpoints mapping...",
    ];

    Object.entries(bundle.restoreManifest.toolBindingsMap).forEach(([tool, endpoint]) => {
      logs.push(`   ↳ tool: '${tool}' remapped to substitute endpoint -> [${endpoint}]`);
    });

    onUpdateReconstitution({
      ...reconstitution,
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
      sandboxLogs: [...logs, "⏳ Awaiting test runner boot..."],
    });

    // Step-by-step test runner
    setTimeout(() => {
      onUpdateReconstitution({
        ...reconstitution,
        validationChecks: {
          ...reconstitution.validationChecks,
          integrityDigestVerified: true,
        },
        sandboxLogs: [...logs, "✅ Check 1 passed: Integrity Digest Verified and matches sealed Merkle Root."],
      });
    }, 1000);

    setTimeout(() => {
      const isCross = runtimeClass === "cross-runtime-compatibility-class";
      const compatMsg = isCross
        ? "⚠️ Warning: Cross-runtime class migration. Executing translation matrices to map AWS tools to Google Cloud APIs."
        : "✅ Same-runtime class compatibility matched: Node-18-slim microservices aligned perfectly.";
      
      onUpdateReconstitution({
        ...reconstitution,
        validationChecks: {
          integrityDigestVerified: true,
          runtimeCompatibilityCheck: true,
          securityPolicySandboxPass: false,
          trialExecutionSuccessful: false,
        },
        runtimeClass,
        sandboxLogs: [
          ...logs,
          "✅ Check 1 passed: Integrity Digest Verified and matches sealed Merkle Root.",
          compatMsg,
          "✅ Check 2 passed: Runtime environment compatibility validated."
        ],
      });
    }, 2200);

    setTimeout(() => {
      onUpdateReconstitution({
        ...reconstitution,
        validationChecks: {
          integrityDigestVerified: true,
          runtimeCompatibilityCheck: true,
          securityPolicySandboxPass: true,
          trialExecutionSuccessful: false,
        },
        sandboxLogs: [
          ...logs,
          "✅ Check 1 passed: Integrity Digest Verified and matches sealed Merkle Root.",
          "✅ Check 2 passed: Runtime environment compatibility validated.",
          "✅ Check 3 passed: Security Policy sandbox restrictions correctly applied (read-only layers enabled)."
        ],
      });
    }, 3400);

    setTimeout(() => {
      const finalLogs = [
        ...logs,
        "✅ Check 1 passed: Integrity Digest Verified and matches sealed Merkle Root.",
        "✅ Check 2 passed: Runtime environment compatibility validated.",
        "✅ Check 3 passed: Security Policy sandbox restrictions correctly applied (read-only layers enabled).",
        "⚙️ Running 30-second trial task execution cycle...",
        "🤖 Trial prompt: 'Analyze estate fund and log audit'",
        "🧠 Agent Response: 'Analyzed fund balance. Stored index ledger. System health 100%.'",
        "✅ Check 4 passed: Trial task execution completed successfully inside isolation sandbox.",
        "🎉 Reconstitution successful. Host environment is authorized for continued operational release."
      ];

      onUpdateReconstitution({
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
        runtimeClass,
        sandboxLogs: finalLogs,
      });

      setIsRunningTests(false);
      onValidationComplete();
    }, 4800);
  };

  return (
    <div className="bg-brand-surface-alt border border-brand-border rounded p-6 space-y-6" id="reconstitution-sandbox-card">
      <div className="flex items-center justify-between border-b border-brand-border pb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2 font-mono">
            <Cpu className="text-brand-accent w-4 h-4" /> Reconstitution Sandbox
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Validates alternate hosting runtimes, revokes original developer keys, and performs sandboxed trial task runs.
          </p>
        </div>
      </div>

      {!bundle ? (
        <div className="bg-brand-bg p-8 rounded border border-brand-border text-center flex flex-col items-center justify-center space-y-3">
          <AlertCircle className="w-10 h-10 text-red-500 animate-pulse" />
          <h3 className="text-sm font-semibold text-slate-300 font-mono uppercase tracking-wider">Sealed Continuity Bundle Required</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            The reconstitution sandbox cannot proceed until a signed and complete Continuity Bundle is generated and escrowed.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls & Checks */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Reconstitution Parameters</h3>

            {/* Runtime Class Select */}
            <div className="bg-brand-bg p-4 rounded border border-brand-border space-y-3">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-bold uppercase tracking-wider font-mono">Descent Runtime Target Class</label>
                <select
                  value={runtimeClass}
                  onChange={(e) => setRuntimeClass(e.target.value as any)}
                  className="w-full text-xs bg-brand-surface text-slate-100 border border-brand-border rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-accent"
                  id="runtime-class-select"
                >
                  <option value="same-runtime-class">Same-Runtime Class (AWS-Node to Backup-Node)</option>
                  <option value="cross-runtime-compatibility-class">Cross-Runtime Class (AWS to Google Cloud Translation)</option>
                </select>
              </div>
            </div>

            {/* Sandbox Trial Validation Checklist */}
            <div className="bg-brand-bg p-4 rounded border border-brand-border space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-accent" /> Sandbox Validation Checklist
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded bg-brand-surface border border-brand-border/40 font-mono">
                  <span className="text-slate-300">Integrity Digest Verified</span>
                  <span className={`text-[10px] font-bold ${reconstitution.validationChecks.integrityDigestVerified ? "text-emerald-400" : "text-slate-500"}`}>
                    {reconstitution.validationChecks.integrityDigestVerified ? "[PASSED]" : "[AWAITING]"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-brand-surface border border-brand-border/40 font-mono">
                  <span className="text-slate-300">Runtime Compatibility Check</span>
                  <span className={`text-[10px] font-bold ${reconstitution.validationChecks.runtimeCompatibilityCheck ? "text-emerald-400" : "text-slate-500"}`}>
                    {reconstitution.validationChecks.runtimeCompatibilityCheck ? "[PASSED]" : "[AWAITING]"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-brand-surface border border-brand-border/40 font-mono">
                  <span className="text-slate-300">Security Sandbox Limits</span>
                  <span className={`text-[10px] font-bold ${reconstitution.validationChecks.securityPolicySandboxPass ? "text-emerald-400" : "text-slate-500"}`}>
                    {reconstitution.validationChecks.securityPolicySandboxPass ? "[PASSED]" : "[AWAITING]"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-brand-surface border border-brand-border/40 font-mono">
                  <span className="text-slate-300">Controlled Key Reissue</span>
                  <span className={`text-[10px] font-bold ${reconstitution.credentialsReissued.substituteApiKeyActive ? "text-emerald-400" : "text-slate-500"}`}>
                    {reconstitution.credentialsReissued.substituteApiKeyActive ? "[REISSUED]" : "[PENDING]"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-brand-surface border border-brand-border/40 font-mono">
                  <span className="text-slate-300">Trial Task Execution Cycle</span>
                  <span className={`text-[10px] font-bold ${reconstitution.validationChecks.trialExecutionSuccessful ? "text-emerald-400" : "text-slate-500"}`}>
                    {reconstitution.validationChecks.trialExecutionSuccessful ? "[PASSED]" : "[AWAITING]"}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={runSandboxedReconstitution}
              disabled={isRunningTests}
              className="w-full bg-brand-accent hover:bg-indigo-500 disabled:bg-brand-surface disabled:opacity-50 text-white font-semibold text-xs py-2.5 px-4 rounded transition flex items-center justify-center gap-2 shadow-sm hover:shadow-indigo-500/10"
              id="btn-run-reconstitution"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunningTests ? "animate-spin" : ""}`} />
              {isRunningTests ? "Executing Sandbox Testing Cycle..." : "Execute Sandboxed Reconstitution"}
            </button>
          </div>

          {/* Logs console */}
          <div className="lg:col-span-7 bg-brand-bg rounded border border-brand-border p-4 flex flex-col h-full min-h-[350px]">
            <div className="flex justify-between items-center border-b border-brand-border pb-2 mb-3">
              <span className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" /> Reconstitution Active Log Terminal
              </span>
              <span className="text-[9px] font-mono bg-brand-surface px-2 py-0.5 rounded border border-brand-border text-brand-accent uppercase font-bold">
                SANDBOX CONSOLE
              </span>
            </div>

            <div className="flex-1 font-mono text-[10px] text-emerald-400 bg-brand-surface-alt/40 p-4 rounded border border-brand-border overflow-auto max-h-[300px] space-y-1.5 leading-relaxed">
              {reconstitution.sandboxLogs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 italic space-y-2 py-12">
                  <Terminal className="w-8 h-8 text-slate-800" />
                  <span className="font-mono text-[10px]">Awaiting sandbox initiation logs...</span>
                </div>
              ) : (
                reconstitution.sandboxLogs.map((log, index) => (
                  <div key={index} className="whitespace-pre-wrap">{log}</div>
                ))
              )}
            </div>

            {/* reissued credential inspection */}
            {reconstitution.credentialsReissued.substituteApiKeyActive && (
              <div className="mt-3 p-2.5 bg-brand-surface border border-brand-border rounded text-[10px] font-mono text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Original key [STRIPE_PROD_88301]:</span>
                  <span className="text-red-400 font-bold">[REVOKED / VOIDED]</span>
                </div>
                <div className="flex justify-between">
                  <span>New reissued key [SUBSTITUTE_API_KEY]:</span>
                  <span className="text-emerald-400 font-bold">[ACTIVE / LIMITED]</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
