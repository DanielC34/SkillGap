/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SkillGapItem } from "../types";
import { AlertCircle, CheckCircle, ShieldCheck, HelpCircle } from "lucide-react";

interface RadarChartProps {
  skillsMatrix: SkillGapItem[];
  targetRole: string;
}

export default function RadarChart({ skillsMatrix, targetRole }: RadarChartProps) {
  // Identify critical gaps (where Target Level - Resume Level is 2 or more)
  const criticalGaps = skillsMatrix.filter(s => s.targetLevel - s.resumeLevel >= 2);
  const strengths = skillsMatrix.filter(s => s.resumeLevel >= s.targetLevel);
  const minorGaps = skillsMatrix.filter(s => s.targetLevel - s.resumeLevel === 1);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-white uppercase font-mono">
            Resume-to-Market Mapping
          </h3>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">
            Role: <span className="text-zinc-300 font-sans">{targetRole}</span>
          </p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 bg-zinc-700 rounded-full block"></span>
            <span>Target Benchmark</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 bg-white rounded-full block"></span>
            <span>Resume Level</span>
          </div>
        </div>
      </div>

      {/* Main progress bars grid */}
      <div className="space-y-4">
        {skillsMatrix.map((item, index) => {
          const gap = item.targetLevel - item.resumeLevel;
          const isCritical = gap >= 2;
          const isAligned = gap <= 0;

          return (
            <div key={index} className="group space-y-1.5 p-2 hover:bg-zinc-900/30 rounded-md transition duration-150">
              <div className="flex justify-between items-start text-xs">
                <span className="font-semibold text-zinc-200 group-hover:text-white transition-colors">
                  {item.skillName}
                </span>
                <span className="font-mono text-[10px] text-zinc-400">
                  {item.resumeLevel} / {item.targetLevel} <span className="text-zinc-600">Lvl</span>
                </span>
              </div>

              {/* Dynamic bar systems */}
              <div className="relative pt-1">
                {/* Benchmark baseline bar (represented by dark gray) */}
                <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-900 flex relative">
                  {/* Target level bar representation */}
                  <div 
                    className="h-full bg-zinc-800 transition-all duration-500"
                    style={{ width: `${(item.targetLevel / 5) * 100}%` }}
                  />
                  {/* Candidate resume level overlay */}
                  <div 
                    className="absolute top-0 left-0 h-full bg-white transition-all duration-500"
                    style={{ width: `${(item.resumeLevel / 5) * 100}%` }}
                  />
                </div>
              </div>

              {/* Feedback and Comment */}
              <div className="flex justify-between text-[11px] leading-relaxed">
                <p className="text-zinc-500 font-sans flex-1 pr-4">{item.description}</p>
                <div className="font-mono text-[10px] self-end shrink-0">
                  {isAligned ? (
                    <span className="text-zinc-400 bg-zinc-900/60 border border-zinc-800 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <ShieldCheck className="w-2.5 h-2.5 text-zinc-400" />
                      SECURED
                    </span>
                  ) : isCritical ? (
                    <span className="text-red-400 bg-red-950/25 border border-red-900/40 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <AlertCircle className="w-2.5 h-2.5 text-red-500" />
                      -{gap} CRITICAL GAP
                    </span>
                  ) : (
                    <span className="text-zinc-400 bg-zinc-900/70 border border-zinc-800 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <HelpCircle className="w-2.5 h-2.5 text-zinc-500" />
                      -{gap} DEVELOPING
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Structured executive summary panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="border border-zinc-800 bg-zinc-900/20 rounded p-4 space-y-2">
          <h4 className="text-xs uppercase font-mono tracking-wider font-semibold text-zinc-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            Key Skill Gaps ({criticalGaps.length + minorGaps.length})
          </h4>
          {criticalGaps.length > 0 || minorGaps.length > 0 ? (
            <ul className="text-[11px] space-y-1.5 text-zinc-400 leading-relaxed font-sans">
              {criticalGaps.map((g, i) => (
                <li key={i} className="flex items-start gap-1">
                  <span className="text-red-400 mr-1 mt-0.5">•</span>
                  <span><strong>{g.skillName}</strong>: High priority gap. Target requires Level {g.targetLevel} but resume indicates {g.resumeLevel}.</span>
                </li>
              ))}
              {minorGaps.map((g, i) => (
                <li key={i} className="flex items-start gap-1">
                  <span className="text-zinc-500 mr-1 mt-0.5">•</span>
                  <span><strong>{g.skillName}</strong>: Incidental. Requires incremental polishing to reach Level {g.targetLevel}.</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[11px] text-zinc-500 italic">No skill gaps identified. Resume aligns perfectly with the target profile!</p>
          )}
        </div>

        <div className="border border-zinc-800 bg-zinc-900/20 rounded p-4 space-y-2">
          <h4 className="text-xs uppercase font-mono tracking-wider font-semibold text-zinc-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
            Profile Strengths ({strengths.length})
          </h4>
          {strengths.length > 0 ? (
            <ul className="text-[11px] space-y-1.5 text-zinc-400 leading-relaxed font-sans">
              {strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-1">
                  <span className="text-zinc-300 mr-1 mt-0.5">✓</span>
                  <span><strong>{s.skillName}</strong>: Demonstrated proficiency fully satisfies industry expectations.</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[11px] text-zinc-500 italic">No significant overlapping benchmarks found. Start with courses on the timeline below.</p>
          )}
        </div>
      </div>
    </div>
  );
}
