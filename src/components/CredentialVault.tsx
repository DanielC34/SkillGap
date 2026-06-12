/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Credential } from "../types";
import { ShieldCheck, Plus, Clock, KeyRound, Award, RefreshCw, Trash } from "lucide-react";

interface CredentialVaultProps {
  credentials: Credential[];
  onAddCustomCredential: (title: string, provider: string) => void;
  onResetVault: () => void;
}

export default function CredentialVault({ credentials, onAddCustomCredential, onResetVault }: CredentialVaultProps) {
  const [courseTitle, setCourseTitle] = useState("");
  const [provider, setProvider] = useState("Coursera");
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle.trim() || !provider.trim()) return;
    onAddCustomCredential(courseTitle, provider);
    setCourseTitle("");
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-3">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-white uppercase font-mono flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-zinc-400" />
            Verified Credential Vault
          </h3>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">
            Encrypted secure ledger • PostgreSQL pgvector schema integration
          </p>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="text-[10px] bg-white text-black font-semibold uppercase tracking-wider py-1.5 px-3 rounded-md hover:bg-zinc-200 transition duration-150 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            MANUAL ADD
          </button>
          
          <button
            type="button"
            onClick={onResetVault}
            className="text-[10px] bg-transparent border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-700 py-1.5 px-3 rounded-md transition duration-150 flex items-center gap-1"
            title="Reset vault demo state"
          >
            <RefreshCw className="w-3 h-3" />
            RESET DEMO
          </button>
        </div>
      </div>

      {/* Manual verification addition form drawer */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="p-4 bg-zinc-950 border border-zinc-900 rounded-md space-y-3 animate-fade-in">
          <div className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">
            Add Existing Micro-Credential Certification
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Course Title</label>
              <input
                type="text"
                required
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                placeholder="e.g. Prompt Engineering with Llama3"
                className="w-full bg-[#070709] border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-600"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Provider Authority</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full bg-[#070709] border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-600"
              >
                <option value="Coursera">Coursera</option>
                <option value="Udemy">Udemy</option>
                <option value="YouTube Authority">YouTube Certification</option>
                <option value="edX">edX</option>
                <option value="AWS Academy">AWS Academy</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-[10px] bg-transparent hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 px-2.5 py-1 rounded text-zinc-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-[10px] bg-white text-black font-semibold px-2.5 py-1 rounded hover:bg-zinc-200"
            >
              Secure & Verify
            </button>
          </div>
        </form>
      )}

      {/* Verified credentials grid */}
      {credentials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {credentials.map((cred, i) => (
            <div key={i} className="border border-zinc-800/80 bg-zinc-950/50 hover:bg-zinc-900/10 p-4 rounded-md space-y-3 relative group transition duration-150">
              <div className="flex justify-between items-start gap-4">
                <div className="flex gap-2.5">
                  <div className="shrink-0 w-8 h-8 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold tracking-tight text-white leading-snug">
                      {cred.courseTitle}
                    </h4>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5 uppercase">
                      Issuer: <span className="text-zinc-300">{cred.provider}</span>
                    </p>
                  </div>
                </div>
                <span className="text-[9.5px] font-mono text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 rounded px-1.5 py-0.5 flex items-center gap-1 shrink-0">
                  <ShieldCheck className="w-3 h-3" />
                  VERIFIED
                </span>
              </div>

              {/* Cryptographical verification signatures for Linear / Stripe aesthetic */}
              <div className="border-t border-zinc-900/80 pt-2.5 space-y-1">
                <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                  <span>DEPLOYMENT SIGNATURE:</span>
                  <span className="text-zinc-400 truncate max-w-[160px]" title={cred.txHash}>
                    {cred.txHash}
                  </span>
                </div>
                <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                  <span>COMPLETED AT:</span>
                  <span className="text-zinc-400 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {new Date(cred.verifiedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-zinc-800 p-8 rounded text-center text-zinc-500 space-y-2">
          <Award className="w-9 h-9 text-zinc-700 mx-auto stroke-[1.25]" />
          <p className="text-xs font-semibold font-mono uppercase text-zinc-400">Vault Ledger is Empty</p>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Staged and completed courses from the pathway above can be encrypted and minted here as verified credentials.
          </p>
        </div>
      )}
    </div>
  );
}
