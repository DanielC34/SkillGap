/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LearningPath, LearningStep } from "../types";
import { Check, ExternalLink, Play, BookOpen, Trophy, Compass } from "lucide-react";

interface TimelinePathProps {
  learningPath: LearningPath;
  onToggleStep: (stepId: string) => void;
  onVerifyStep: (step: LearningStep) => void;
  verifiedStepIds: string[];
}

export default function TimelinePath({ learningPath, onToggleStep, onVerifyStep, verifiedStepIds }: TimelinePathProps) {
  const steps = learningPath.steps;
  const completedCount = steps.filter(s => s.completed).length;
  const totalCount = steps.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Progress header dashboard card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900/35 border border-zinc-800/80 rounded-md p-4">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-white uppercase font-mono flex items-center gap-1.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white"></span>
            Dynamic Learning Pathway
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Bridge your technical gaps. Complete modules to scale your real-time match score.
          </p>
        </div>
        <div className="shrink-0 text-right w-full sm:w-auto">
          <div className="flex justify-between sm:justify-end items-baseline gap-1.5">
            <span className="text-xs font-mono text-zinc-500 font-medium">PROGRESS:</span>
            <span className="text-lg font-mono font-semibold text-white">{completedCount}/{totalCount} Courses</span>
          </div>
          <div className="w-full sm:w-40 bg-zinc-950 h-1.5 rounded-full overflow-hidden mt-1.5 border border-zinc-900">
            <div 
              className="bg-white h-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Interactive vertical timeline */}
      <div className="relative pl-6 space-y-6">
        {/* Continuous line connectors */}
        <div className="absolute top-2 bottom-2 left-2.5 w-[1px] bg-zinc-800" />

        {steps.map((step, index) => {
          const isCompleted = step.completed;
          const isVerified = verifiedStepIds.includes(step.id);

          return (
            <div key={index} className="relative group">
              {/* Vertical node tracker */}
              <div 
                onClick={() => onToggleStep(step.id)}
                className={`absolute -left-[22.5px] top-1.5 w-4.5 h-4.5 rounded-full border-2 cursor-pointer flex items-center justify-center transition-all duration-150 ${
                  isCompleted 
                    ? "bg-white border-white scale-110" 
                    : "bg-[#0c0c0e] border-zinc-800 hover:border-zinc-500"
                }`}
              >
                {isCompleted && <Check className="w-2.5 h-2.5 text-black stroke-[3]" />}
              </div>

              {/* Card wrapper */}
              <div className={`p-4 border rounded-md transition duration-150 ${
                isCompleted 
                  ? "bg-zinc-900/25 border-zinc-700/60" 
                  : "bg-zinc-950/40 border-zinc-800/80 hover:border-zinc-700"
              }`}>
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">
                        {step.provider}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-900 px-1.5 py-0.5 rounded">
                        {step.duration}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-900 px-1.5 py-0.5 rounded">
                        {step.cost}
                      </span>
                    </div>

                    <h4 className={`text-sm font-semibold tracking-tight transition-colors ${
                      isCompleted ? "text-zinc-200 line-through" : "text-white"
                    }`}>
                      {step.title}
                    </h4>
                  </div>
                  
                  {/* Status checklist trigger */}
                  <div className="flex gap-1.5 self-end sm:self-start">
                    <button
                      type="button"
                      onClick={() => onToggleStep(step.id)}
                      className={`text-[10px] px-2.5 py-1 rounded border font-mono font-medium transition duration-150 ${
                        isCompleted
                          ? "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700"
                          : "bg-white text-black border-white hover:bg-zinc-200"
                      }`}
                    >
                      {isCompleted ? "MARK INCOMPLETE" : "COMPLETE COURSE"}
                    </button>
                    
                    <a
                      href={step.url}
                      target="_blank"
                      referrerPolicy="no-referrer"
                      className="p-1 px-1.5 rounded border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                      title="Launch Class Materials"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed font-sans mt-2">
                  {step.description}
                </p>

                {/* Secure verify action nested neatly inside step card */}
                {isCompleted && (
                  <div className="flex justify-between items-center bg-zinc-950 border border-zinc-900 rounded p-2.5 mt-3 animate-fade-in">
                    <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-zinc-500" />
                      CREDENTIAL ISSUANCE READY
                    </span>
                    {isVerified ? (
                      <span className="text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-950/20 px-2 py-0.5 border border-emerald-900/30 rounded">
                        ✓ VERIFIED IN SECURE VAULT
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onVerifyStep(step)}
                        className="text-[10.5px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-white font-mono px-2.5 py-0.5 rounded transition duration-150"
                      >
                        ENCRYPT & DEPLOY TO VAULT
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-[11px] font-mono text-zinc-500 bg-zinc-950/50 p-3 rounded border border-zinc-900/60 text-center">
        Note: Completed course modules trigger dynamic algorithmic recalibration, scaling your target roles score in real-time.
      </div>
    </div>
  );
}
