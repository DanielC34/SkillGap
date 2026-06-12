import { useEffect, useState } from "react";
import { TrendingUp, Award, DollarSign, Target, Sparkles } from "lucide-react";

interface SalaryTrajectoryProps {
  targetRole: string;
  matchScore: number;
}

interface MarketRecord {
  roleTitle: string;
  medianSalary: number;
  growthRate: number;
  baseSalary: number;
}

export default function SalaryTrajectory({ targetRole, matchScore }: SalaryTrajectoryProps) {
  const [marketRecord, setMarketRecord] = useState<MarketRecord | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const loadMarketData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/market-data?roleTitle=${encodeURIComponent(targetRole)}`);
        const data = await res.json();
        if (active && data.success && data.marketRecord) {
          setMarketRecord(data.marketRecord);
        }
      } catch (err) {
        console.error("Failed to fetch market data:", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadMarketData();
    return () => {
      active = false;
    };
  }, [targetRole]);

  if (loading || !marketRecord) {
    return (
      <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-5 animate-pulse space-y-3">
        <div className="h-2.5 bg-zinc-800 rounded w-1/3"></div>
        <div className="h-8 bg-zinc-900 rounded"></div>
        <div className="h-3 bg-zinc-800 rounded w-2/3"></div>
      </div>
    );
  }

  // Calculate dynamic salaries on a sliding scale corresponding to Match Score progress
  const baseSal = marketRecord.baseSalary;
  const potentialSal = marketRecord.medianSalary;
  
  // Current dynamic value rises directly as matchScore reaches 100
  const factor = Math.max(0, Math.min(100, matchScore)) / 100;
  const currentVal = Math.round(baseSal + factor * (potentialSal - baseSal));
  const increaseEstimation = Math.max(12000, potentialSal - baseSal);

  // Growth percentages
  const parsedGrowthPercentage = Math.round(marketRecord.growthRate * 100);

  return (
    <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-5 flex flex-col justify-between space-y-4">
      <div className="flex justify-between items-start border-b border-[#1f1f1f] pb-2">
        <div>
          <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono font-bold">
            Projected Market Value & Trajectory
          </h3>
          <p className="text-[10.5px] text-zinc-400 font-medium font-mono uppercase mt-0.5">
            Role: {marketRecord.roleTitle}
          </p>
        </div>
        <span className="text-[10px] text-emerald-500 bg-emerald-950/20 px-2 py-0.5 border border-emerald-900/30 rounded font-mono">
          +{parsedGrowthPercentage}% Demand Growth
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-[9.5px] text-zinc-500 uppercase font-mono tracking-wider">Current Market Value:</div>
          <div className="text-2xl font-light tracking-tight text-zinc-400 mt-1">
            ${currentVal.toLocaleString()}<span className="text-xs text-zinc-600">/yr</span>
          </div>
        </div>
        <div>
          <div className="text-[9.5px] text-emerald-555 uppercase font-mono tracking-wider text-emerald-500">Upskilled Potential:</div>
          <div className="text-2xl font-semibold tracking-tight text-white mt-1">
            ${potentialSal.toLocaleString()}<span className="text-xs text-zinc-500">/yr</span>
          </div>
        </div>
      </div>

      {/* Visual Horizontal Stack Selector Grid */}
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] text-zinc-600 font-mono">
          <span>Baseline (${baseSal.toLocaleString()})</span>
          <span>Upskilled Master (${potentialSal.toLocaleString()})</span>
        </div>
        
        <div className="h-3.5 bg-zinc-950 rounded border border-zinc-900 relative p-0.5 overflow-hidden">
          {/* Potential fill limit indicator */}
          <div className="h-full bg-zinc-900/80 rounded" style={{ width: "100%" }}></div>
          {/* Current Dynamic Level Progress Bar */}
          <div 
            className="h-full bg-emerald-500 opacity-80 rounded absolute left-0.5 top-0.5 transition-all duration-500"
            style={{ width: `calc(${factor * 100}% - 4px)` }}
          ></div>
        </div>
      </div>

      <div className="p-3 bg-[#0c0c0e] border border-dashed border-[#1f1f1f] rounded text-[11px] leading-relaxed text-zinc-400 font-mono flex items-start gap-2">
        <Sparkles className="w-4.5 h-4.5 text-zinc-500 shrink-0 mt-0.5" />
        <div>
          Completing this pathway is estimated to increase your market value by{" "}
          <span className="text-[#ededed] font-semibold">${increaseEstimation.toLocaleString()}/year</span>.
        </div>
      </div>
    </div>
  );
}
