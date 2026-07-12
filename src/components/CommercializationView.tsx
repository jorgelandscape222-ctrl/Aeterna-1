import React, { useState } from "react";
import { ContinuityBundle, CommercializationLog } from "../types";
import { Coins, CheckCircle, AlertTriangle, Play, HelpCircle, DollarSign, ArrowRight } from "lucide-react";
import { SectionNarrationHeader } from "./SectionNarrationHeader";

interface CommercializationViewProps {
  bundle: ContinuityBundle | null;
  logs: CommercializationLog[];
  onAddLog: (log: CommercializationLog) => void;
}

export const CommercializationView: React.FC<CommercializationViewProps> = ({
  bundle,
  logs,
  onAddLog,
}) => {
  const [simulatedRevenue, setSimulatedRevenue] = useState(250);
  const [selectedClient, setSelectedClient] = useState("Acme Corp Research Lab");
  const [selectedTxType, setSelectedTxType] = useState("REST API Call Licensing");

  const handleSimulateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bundle) return;

    // Split percentages from bundle governance manifest
    const splits = bundle.rightsAndGovernanceManifest.royaltySplits;
    const successorSplit = splits.successorPercent / 100;
    const estateSplit = splits.estatePercent / 100;
    const reserveSplit = (100 - splits.successorPercent - splits.estatePercent) / 100;

    const successorPayout = simulatedRevenue * successorSplit;
    const estatePayout = simulatedRevenue * estateSplit;
    const reservePayout = simulatedRevenue * reserveSplit;

    const newLog: CommercializationLog = {
      id: "tx-" + Math.floor(Math.random() * 90000 + 10000),
      timestamp: new Date().toISOString(),
      transactionType: selectedTxType,
      clientName: selectedClient,
      revenueUsd: simulatedRevenue,
      payoutWaterfall: {
        successorPayout,
        estatePayout,
        reservePayout,
      },
    };

    onAddLog(newLog);
  };

  // Eligibility screening check
  const isEligible = bundle !== null && bundle.rightsAndGovernanceManifest.designatedSuccessor !== "";

  return (
    <div className="bg-brand-surface-alt border border-brand-border rounded p-6 space-y-6" id="commercialization-card">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
        <SectionNarrationHeader sectionId="funding" />
        <SectionNarrationHeader sectionId="commercialization" />
      </div>
      <div className="flex items-center justify-between border-b border-brand-border pb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2 font-mono">
            <Coins className="text-brand-accent w-4 h-4" /> Commercialization & Payout Waterfalls
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Rules-based royalty router and compliance screening portal operating strictly under successor-approved parameters.
          </p>
        </div>
        <span className="px-2.5 py-1 bg-brand-surface text-slate-300 font-mono text-[9px] rounded border border-brand-border flex items-center gap-1.5 font-bold uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5" /> Aspirational Routing Only
        </span>
      </div>

      <div className="p-4 bg-brand-bg/60 border border-brand-border rounded space-y-2 text-xs text-slate-300 leading-relaxed font-mono">
        <p className="font-bold flex items-center gap-1 text-brand-accent uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 text-brand-accent shrink-0" /> Architectural Disclaimer
        </p>
        <p className="text-[10px] text-slate-400">
          This module is designed strictly as a rules-and-payout-routing simulation engine, not an autonomous agent business. It proves that royalty splits, compliance filters, and licensable transaction constraints can be compiled and enforced programmatically under human estate supervision.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Compliance Screening & Simulation Form */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Rights Eligibility Screening</h3>

          {/* Verification checklist */}
          <div className="bg-brand-bg p-4 rounded border border-brand-border space-y-3.5">
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Bundle Signature Validation</span>
                <span className={`text-[10px] font-bold ${bundle ? "text-emerald-400" : "text-slate-600"}`}>
                  {bundle ? "VALID SIGNATURE" : "NOT FOUND"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Designated Successor Verified</span>
                <span className={`text-[10px] font-bold ${isEligible ? "text-emerald-400" : "text-slate-600"}`}>
                  {isEligible ? "Sarah Jenkins" : "NOT COMPLETED"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Trustee Probate Co-Sign Cert</span>
                <span className={`text-[10px] font-bold ${bundle ? "text-emerald-400" : "text-slate-600"}`}>
                  {bundle ? "CO-SIGNED APPROVED" : "NOT FOUND"}
                </span>
              </div>
            </div>

            {isEligible ? (
              <div className="p-2.5 bg-emerald-950/30 border border-emerald-900/60 rounded text-[10px] font-mono uppercase font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Eligibility Passed: Listing Allowed</span>
              </div>
            ) : (
              <div className="p-2.5 bg-red-950/30 border border-red-900/60 rounded text-[10px] font-mono uppercase font-bold text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>Eligibility Failed: Create bundle first</span>
              </div>
            )}
          </div>

          {/* Simulate revenue form */}
          {isEligible && (
            <form onSubmit={handleSimulateTransaction} className="bg-brand-bg p-4 rounded border border-brand-border space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Simulate Revenue Influx</h4>
              
              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-mono uppercase">Licensee / Customer</label>
                <input
                  type="text"
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full text-xs bg-brand-surface text-slate-100 border border-brand-border rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1 font-mono uppercase">Transaction Type</label>
                  <select
                    value={selectedTxType}
                    onChange={(e) => setSelectedTxType(e.target.value)}
                    className="w-full text-[10px] bg-brand-surface text-slate-100 border border-brand-border rounded px-2 py-1.5 focus:outline-none font-mono"
                  >
                    <option value="REST API Call Licensing">REST API Call</option>
                    <option value="Full Node Lease">Full Node Lease</option>
                    <option value="Joint Venture Retraining">Retraining License</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1 font-mono uppercase">Revenue Amount ($)</label>
                  <input
                    type="number"
                    value={simulatedRevenue}
                    onChange={(e) => setSimulatedRevenue(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full text-xs bg-brand-surface text-slate-100 border border-brand-border rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-accent"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-brand-accent hover:bg-indigo-500 text-white font-semibold text-xs py-2.5 px-4 rounded transition flex items-center justify-center gap-1.5 font-mono uppercase tracking-wider shadow-sm"
                id="btn-simulate-royalty"
              >
                <Play className="w-3.5 h-3.5" /> Execute Royalty Payout Split
              </button>
            </form>
          )}
        </div>

        {/* Ledger logs & Split visuals */}
        <div className="lg:col-span-7 bg-brand-bg rounded border border-brand-border p-4 flex flex-col h-full min-h-[350px]">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 mb-3 border-b border-brand-border font-mono">
            Royalty Ledger & Waterfall Routing Logs
          </h3>

          <div className="flex-1 space-y-4">
            {/* Visual breakdown of current bundle splits */}
            {bundle && (
              <div className="p-3 bg-brand-surface rounded border border-brand-border space-y-2 text-xs">
                <div className="text-[10px] text-slate-400 font-bold font-mono uppercase">Active Split Rules from Governance Manifest:</div>
                <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
                  <div className="p-2 bg-brand-bg rounded border border-brand-border text-center">
                    <span className="text-brand-accent font-bold block">{bundle.rightsAndGovernanceManifest.royaltySplits.successorPercent}%</span>
                    <span className="text-slate-500 text-[8px] uppercase font-bold">Successor Sarah</span>
                  </div>
                  <div className="p-2 bg-brand-bg rounded border border-brand-border text-center">
                    <span className="text-emerald-400 font-bold block">{bundle.rightsAndGovernanceManifest.royaltySplits.estatePercent}%</span>
                    <span className="text-slate-500 text-[8px] uppercase font-bold">Host Estate</span>
                  </div>
                  <div className="p-2 bg-brand-bg rounded border border-brand-border text-center">
                    <span className="text-yellow-400 font-bold block">
                      {100 - bundle.rightsAndGovernanceManifest.royaltySplits.successorPercent - bundle.rightsAndGovernanceManifest.royaltySplits.estatePercent}%
                    </span>
                    <span className="text-slate-500 text-[8px] uppercase font-bold">Self-Reserve</span>
                  </div>
                </div>
              </div>
            )}

            {/* Logs table */}
            <div className="overflow-x-auto scroll-thin">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-brand-border text-slate-500 text-[9px] uppercase font-mono font-bold">
                    <th className="py-2">TX ID</th>
                    <th className="py-2">Client / License Type</th>
                    <th className="py-2 text-right">Rev</th>
                    <th className="py-2 text-right">Successor</th>
                    <th className="py-2 text-right">Estate</th>
                    <th className="py-2 text-right">Reserve</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/40 font-mono text-[10px]">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center italic text-slate-600 font-mono">
                        No transactions simulated yet.
                      </td>
                    </tr>
                  ) : (
                    [...logs].reverse().map((log) => (
                      <tr key={log.id} className="text-slate-300 hover:bg-brand-surface/40">
                        <td className="py-2 text-slate-500 font-semibold">{log.id}</td>
                        <td className="py-2">
                          <span className="block text-slate-200">{log.clientName}</span>
                          <span className="block text-[9px] text-slate-500 font-mono uppercase">{log.transactionType}</span>
                        </td>
                        <td className="py-2 text-right text-brand-accent font-bold">${log.revenueUsd.toFixed(2)}</td>
                        <td className="py-2 text-right text-indigo-400">${log.payoutWaterfall.successorPayout.toFixed(2)}</td>
                        <td className="py-2 text-right text-emerald-400">${log.payoutWaterfall.estatePayout.toFixed(2)}</td>
                        <td className="py-2 text-right text-yellow-400">${log.payoutWaterfall.reservePayout.toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
