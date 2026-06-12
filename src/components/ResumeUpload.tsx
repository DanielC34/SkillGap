/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { SAMPLE_RESUMES } from "../data/mockResumes";
import { Upload, ArrowRight, FileText, ChevronDown, Check, Zap } from "lucide-react";

interface ResumeUploadProps {
  onAnalyze: (resumeText: string, targetRole: string) => void;
  loading: boolean;
  benchmarks: Array<{ roleTitle: string; salaryRange: string; marketDemand: string }>;
}

export default function ResumeUpload({ onAnalyze, loading, benchmarks }: ResumeUploadProps) {
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("AI / Machine Learning Engineer");
  const [selectedSampleIndex, setSelectedSampleIndex] = useState<number | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleSelectSample = (index: number) => {
    setSelectedSampleIndex(index);
    setResumeText(SAMPLE_RESUMES[index].text);
    setTargetRole(SAMPLE_RESUMES[index].roleTarget);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setResumeText(event.target.result as string);
          setSelectedSampleIndex(null);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setResumeText(event.target.result as string);
          setSelectedSampleIndex(null);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim() || !targetRole.trim()) return;
    onAnalyze(resumeText, targetRole);
  };

  return (
    <div id="resume-upload-section" className="space-y-4">
      <div className="space-y-4">
        
        {/* Quick Sample Selector */}
        <div className="mb-5">
          <label className="block text-xs font-medium text-zinc-400 mb-2 font-mono">
            PRESS TO LOAD A HIGH-FIDELITY SAMPLE CASE:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {SAMPLE_RESUMES.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSample(idx)}
                className={`text-left p-3 rounded-md border text-xs transition duration-150 ${
                  selectedSampleIndex === idx
                    ? "border-zinc-300 bg-zinc-900 text-white font-medium"
                    : "border-[#1f1f1f] bg-[#050505] text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                }`}
              >
                <div className="font-semibold text-white/90 font-sans truncate">{sample.name}</div>
                <div className="text-[10px] text-zinc-500 mt-1 truncate">Target: {sample.roleTarget}</div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target Role input & benchmark hints */}
          <div>
            <label className="block text-xs font-semibold uppercase text-zinc-400 mb-2 font-mono tracking-wider">
              Target Career Role
            </label>
            <div className="relative">
              <input
                type="text"
                value={targetRole}
                onChange={(e) => {
                  setTargetRole(e.target.value);
                  setSelectedSampleIndex(null);
                }}
                placeholder="e.g. AI / Machine Learning Engineer"
                required
                className="w-full bg-[#050505] border border-[#1f1f1f] rounded-md py-2.5 px-3.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#333] font-sans transition-colors"
              />
            </div>
            
            {/* Quick Helper presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[10px] text-zinc-500 self-center font-mono uppercase mr-1">Suggested Targets:</span>
              {benchmarks.map((b, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setTargetRole(b.roleTitle);
                    setSelectedSampleIndex(null);
                  }}
                  className="text-[10px] bg-[#050505] hover:bg-zinc-900/50 border border-[#1f1f1f] hover:border-zinc-700 text-zinc-400 rounded px-2 py-0.5 font-mono"
                >
                  {b.roleTitle}
                </button>
              ))}
            </div>
          </div>

          {/* Paste or Drag Zone */}
          <div>
            <label className="block text-xs font-semibold uppercase text-zinc-400 mb-2 font-mono tracking-wider">
              Resume Text or Upload Data
            </label>
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`relative border border-dashed rounded-md p-5 transition-all text-center ${
                dragActive
                  ? "border-zinc-400 bg-zinc-900/40"
                  : "border-[#1f1f1f] bg-[#050505] hover:bg-zinc-900/20"
              }`}
            >
              {resumeText ? (
                <div className="text-left">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-zinc-400 font-mono flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-zinc-400" />
                      STAGED RESUME DATA ({resumeText.length} CHARS)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setResumeText("");
                        setSelectedSampleIndex(null);
                      }}
                      className="text-[10px] text-red-400 hover:text-red-300 font-mono uppercase"
                    >
                      Clear text
                    </button>
                  </div>
                  <textarea
                    value={resumeText}
                    onChange={(e) => {
                      setResumeText(e.target.value);
                      setSelectedSampleIndex(null);
                    }}
                    rows={6}
                    className="w-full bg-[#050505] border border-[#1f1f1f] rounded p-2.5 text-xs text-zinc-400 focus:outline-none focus:border-[#333] font-mono leading-relaxed"
                  />
                </div>
              ) : (
                <div className="py-4 cursor-pointer">
                  <input
                    type="file"
                    id="resume-file-input"
                    accept=".txt,.md"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  <label htmlFor="resume-file-input" className="cursor-pointer space-y-2 block">
                    <div className="flex justify-center">
                      <Upload className="w-8 h-8 text-zinc-600 stroke-[1.5]" />
                    </div>
                    <div className="text-sm font-medium text-zinc-300 font-sans">
                      Drag & Drop resume.txt or <span className="text-zinc-100 underline decoration-zinc-600">browse file</span>
                    </div>
                    <div className="text-xs text-zinc-500 font-mono">
                      (Plain text format recommended, or paste your text directly)
                    </div>
                  </label>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !resumeText.trim() || !targetRole.trim()}
            className="w-full relative flex items-center justify-center gap-2 bg-white text-black font-sans text-xs uppercase tracking-wider font-semibold py-3 px-4 rounded-md transition duration-150 disabled:bg-zinc-800 disabled:text-zinc-600 hover:bg-zinc-200"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Evaluating Skill Gaps with Gemini AI...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Initialize SkillGap Analysis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
