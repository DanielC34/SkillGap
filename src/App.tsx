/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import ResumeUpload from "./components/ResumeUpload";
import RadarChart from "./components/RadarChart";
import TimelinePath from "./components/TimelinePath";
import CredentialVault from "./components/CredentialVault";
import InterviewLab from "./components/InterviewLab";
import SalaryTrajectory from "./components/SalaryTrajectory";
import PublicPortfolio from "./components/PublicPortfolio";
import { AnalysisResponse, JobBenchmark, LearningPath, LearningStep, Credential } from "./types";
import { 
  Trophy, Sparkles, RefreshCw, Briefcase, Compass, 
  HelpCircle, Activity, ArrowUpRight, Layers, LogOut, 
  ChevronRight, Database, Shield, Flame, Laptop, FileText,
  KeyRound, ShieldCheck, Award, GraduationCap, Grid, ExternalLink,
  Terminal, Globe, Link, Copy, Check
} from "lucide-react";

export default function App() {
  const [benchmarks, setBenchmarks] = useState<JobBenchmark[]>([]);
  const [activeTab, setActiveTab] = useState<"onboarding" | "pathways" | "credentials" | "interview">("onboarding");
  const [selectedBenchmark, setSelectedBenchmark] = useState<JobBenchmark | null>(null);
  
  // App state
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [verifiedStepIds, setVerifiedStepIds] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  // New features state
  const [isPublicView, setIsPublicView] = useState(false);
  const [publicUsername, setPublicUsername] = useState<string | null>(null);
  const [publicProfile, setPublicProfile] = useState<any | null>(null);
  const [publicProfileError, setPublicProfileError] = useState<string | null>(null);

  const [isProfilePublic, setIsProfilePublic] = useState(false);
  const [customPublicUsername, setCustomPublicUsername] = useState("candidate2026");
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSavingPublicSettings, setIsSavingPublicSettings] = useState(false);

  // 1. Fetch job benchmarks and credentials on mount
  useEffect(() => {
    // Detect public URL paths, e.g. /p/candidate2026
    const path = window.location.pathname;
    if (path.startsWith("/p/")) {
      const parts = path.split("/");
      const username = parts[2] || "";
      if (username.trim()) {
        setIsPublicView(true);
        setPublicUsername(username);
        fetchPublicProfile(username);
        return; // skip subsequent standard loads
      }
    }

    fetchBenchmarks();
    fetchCredentials();
  }, []);

  const fetchPublicProfile = async (username: string) => {
    try {
      const res = await fetch(`/api/p/${username}`);
      const data = await res.json();
      if (data.success && data.profile) {
        setPublicProfile(data.profile);
      } else {
        setPublicProfileError(data.error || "This profile is not listed or set to private.");
      }
    } catch (err) {
      setPublicProfileError("Server linkage aborted. Could not load public workspace.");
    }
  };

  const handleToggleProfilePublic = async (willBePublic: boolean, customSlug: string) => {
    setIsSavingPublicSettings(true);
    try {
      const res = await fetch("/api/profile/toggle-public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: willBePublic, username: customSlug })
      });
      const data = await res.json();
      if (data.success && data.profile) {
        setIsProfilePublic(data.profile.isPublic);
        setCustomPublicUsername(data.profile.username);
        setResetMessage(`Portfolio access settings synced securely.`);
        setTimeout(() => setResetMessage(null), 3000);
      } else {
        setError(data.error || "Failed to update profile settings.");
      }
    } catch (err) {
      setError("Network fault sync profile settings.");
    } finally {
      setIsSavingPublicSettings(false);
    }
  };

  const fetchBenchmarks = async () => {
    try {
      const res = await fetch("/api/benchmarks");
      const data = await res.json();
      if (data.benchmarks) {
        setBenchmarks(data.benchmarks);
        setSelectedBenchmark(data.benchmarks[1] || data.benchmarks[0]);
      }
    } catch (err) {
      console.error("Failed to fetch benchmarks:", err);
    }
  };

  const fetchCredentials = async () => {
    try {
      const res = await fetch("/api/credentials");
      const data = await res.json();
      if (data.credentials) {
        setCredentials(data.credentials);
        const ids = data.credentials.map((c: any) => c.learningStepId).filter(Boolean);
        setVerifiedStepIds(ids);
      }
    } catch (err) {
      console.error("Failed to fetch credentials ledger:", err);
    }
  };

  // 2. Handle Resume Analysis and Pathway Pipeline
  const handleAnalyze = async (resumeText: string, targetRole: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, targetRole })
      });
      
      const data = await response.json();
      if (data.success) {
        setAnalysis(data);
        setLearningPath(data.learningPath);
        // Automatically switch tabs to show insights
        setActiveTab("pathways");
        
        const matched = benchmarks.find(b => b.roleTitle.toLowerCase().includes(targetRole.toLowerCase()));
        if (matched) {
          setSelectedBenchmark(matched);
        }
      } else {
        setError(data.error || "Failed to analyze skill gaps.");
      }
    } catch (err) {
      setError("Server connection failure. Please confirm the full-stack system is active.");
      console.error("Analysis network error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 3. User checks/unchecks curriculum tasks -> Recomputes Real-time Match Score
  const handleToggleStep = (stepId: string) => {
    if (!learningPath) return;

    const updatedSteps = learningPath.steps.map(step => {
      if (step.id === stepId) {
        return { ...step, completed: !step.completed };
      }
      return step;
    });

    const completedCount = updatedSteps.filter(s => s.completed).length;
    const totalSteps = updatedSteps.length;
    
    // Scale match score dynamically with completed steps up to 100!
    const baseScore = learningPath.baseMatchScore;
    const currentScore = totalSteps > 0
      ? Math.min(100, Math.round(baseScore + (completedCount / totalSteps) * (100 - baseScore)))
      : baseScore;

    setLearningPath({
      ...learningPath,
      steps: updatedSteps,
      currentMatchScore: currentScore,
      updatedAt: new Date().toISOString()
    });

    if (updatedSteps.find(s => s.id === stepId && !s.completed)) {
      setVerifiedStepIds(prev => prev.filter(id => id !== stepId));
    }
  };

  // 4. Encrypt & Deploy minted certificates to server Vault
  const handleVerifyStep = async (step: LearningStep) => {
    try {
      const response = await fetch("/api/credentials/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseTitle: step.title,
          provider: step.provider
        })
      });

      const data = await response.json();
      if (data.success) {
        setVerifiedStepIds(prev => [...prev, step.id]);
        fetchCredentials();
      }
    } catch (err) {
      console.error("Credentials mint failure:", err);
    }
  };

  // 5. Add a custom manual credential certified list
  const handleAddCustomCredential = async (title: string, provider: string) => {
    try {
      const response = await fetch("/api/credentials/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseTitle: title,
          provider: provider
        })
      });

      const data = await response.json();
      if (data.success) {
        fetchCredentials();
      }
    } catch (err) {
      console.error("Manual credentials deployment failed:", err);
    }
  };

  // 6. Reset server and local state arrays 
  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to clear your current progress and reset the demo system?")) return;
    try {
      const response = await fetch("/api/reset", { method: "POST" });
      const data = await response.json();
      if (data.success) {
        setAnalysis(null);
        setLearningPath(null);
        setCredentials([]);
        setVerifiedStepIds([]);
        setActiveTab("onboarding");
        setResetMessage("Local state registries and credentials successfully cleaned.");
        setTimeout(() => setResetMessage(null), 4000);
      }
    } catch (err) {
      console.error("Reset endpoint failed:", err);
    }
  };

  // 7. Export summary to a Markdown file
  const handleExportSummary = () => {
    if (!analysis) return;

    const formattedGaps = analysis.skillsMatrix
      .map(s => {
        const gap = s.targetLevel - s.resumeLevel;
        const status = gap > 0 
          ? `⚠️ Gap of ${gap} levels (Current: ${s.resumeLevel}/5 vs Target: ${s.targetLevel}/5)` 
          : `✅ Aligned (Current: ${s.resumeLevel}/5 vs Target: ${s.targetLevel}/5)`;
        return `- **${s.skillName}**: ${status}`;
      })
      .join("\n");

    const formattedSteps = learningPath
      ? learningPath.steps
          .map((s, idx) => {
            return `### Step ${String(idx + 1).padStart(2, "0")}: ${s.title}
- **Provider**: ${s.provider} (${s.cost})
- **Duration**: ${s.duration}
- **Resource Link**: [Access Course](${s.url})
- **Status**: ${s.completed ? "✅ Completed / Verified" : "⏳ Pending"}
- **Description**: ${s.description}`;
          })
          .join("\n\n")
      : "No learning steps recommended yet.";

    const mdContent = `# SkillGap Career Architect Report

## Candidate Profile Summary
- **Target Role**: ${analysis.roleTitle}
- **Dynamic Fit Match Score**: ${learningPath ? learningPath.currentMatchScore : analysis.matchScore}%
- **Base Match Score**: ${learningPath ? learningPath.baseMatchScore : analysis.matchScore}%
- **Report Generated**: ${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}

---

## 📊 Skill Analysis & Gap Tracking Matrix
Compared against the targeted industry benchmark for **${analysis.roleTitle}**:

${formattedGaps}

---

## 🗺️ Curated Free Curriculum Pathway
The following modular path features 100% free courses and official technical documentation, removing subscription/paywall barriers:

${formattedSteps}

---
*Verified securely on the pgvector Career Architecture Sandbox Registry.*
`;

    const blob = new Blob([mdContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const sanitizedRole = analysis.roleTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    link.download = `skillgap-report-${sanitizedRole}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const currentMatchedBenchmark = selectedBenchmark || (benchmarks.length > 0 ? benchmarks[0] : null);

  if (isPublicView) {
    if (publicProfileError) {
      return (
        <div className="min-h-screen w-full bg-[#050505] text-[#ededed] font-sans flex flex-col justify-center items-center p-6 text-center select-none">
          <div className="max-w-md border border-zinc-900 rounded-lg p-6 bg-zinc-950 space-y-4">
            <div className="w-10 h-10 rounded bg-red-950/20 border border-red-900/40 text-red-500 flex items-center justify-center mx-auto font-mono font-bold text-lg">!</div>
            <h1 className="text-sm font-semibold tracking-widest uppercase font-mono text-zinc-100">PROFILES SECURITY LEDGER ERROR</h1>
            <p className="text-xs text-zinc-400 font-mono">{publicProfileError}</p>
            <a href="/" className="text-[10px] inline-block px-4 py-2 bg-white text-black font-semibold uppercase tracking-tight rounded hover:bg-zinc-200 cursor-pointer">
              Return Home
            </a>
          </div>
        </div>
      );
    }
    if (!publicProfile) {
      return (
        <div className="min-h-screen w-full bg-[#050505] text-[#ededed] font-sans flex flex-col justify-center items-center p-6 text-center">
          <div className="space-y-3">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-zinc-500 font-mono tracking-widest uppercase">Fetching Public Portfolio Data...</p>
          </div>
        </div>
      );
    }
    return <PublicPortfolio username={publicUsername || ""} profile={publicProfile} />;
  }

  return (
    <div className="flex h-screen w-full bg-[#050505] text-[#ededed] font-sans overflow-hidden border border-[#262626]">
      
      {/* LEFT MINIMALISED SILICON RAIL SIDEBAR */}
      <aside className="w-16 flex flex-col items-center py-6 gap-8 border-r border-[#1f1f1f] bg-[#0a0a0a] shrink-0">
        <div className="w-8 h-8 rounded bg-white flex items-center justify-center cursor-pointer" onClick={() => setActiveTab("onboarding")} title="Go to home">
          <div className="w-4 h-1 bg-[#050505] rounded-full"></div>
        </div>
        
        <nav className="flex flex-col gap-6 items-center w-full">
          <button 
            onClick={() => setActiveTab("onboarding")}
            className={`w-10 h-10 rounded flex items-center justify-center transition-all duration-150 ${
              activeTab === "onboarding" ? "bg-zinc-900 border border-zinc-800 text-white" : "text-zinc-600 hover:text-zinc-300"
            }`}
            title="Resume Onboarding"
          >
            <Compass className="w-4.5 h-4.5" />
          </button>
          
          <button 
            onClick={() => {
              if (learningPath) setActiveTab("pathways");
              else alert("Complete your Resume Ingestion on Onboarding first to preview pathways!");
            }}
            className={`w-10 h-10 rounded flex items-center justify-center transition-all duration-150 relative ${
              !learningPath ? "opacity-40 cursor-not-allowed" : ""
            } ${
              activeTab === "pathways" ? "bg-zinc-900 border border-zinc-800 text-white" : "text-zinc-600 hover:text-zinc-300"
            }`}
            title="Analysis & Pathways"
          >
            <Activity className="w-4.5 h-4.5" />
            {learningPath && (
              <span className="absolute top-1.5 right-1.5 flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
              </span>
            )}
          </button>
          
          <button 
            onClick={() => setActiveTab("credentials")}
            className={`w-10 h-10 rounded flex items-center justify-center transition-all duration-150 ${
              activeTab === "credentials" ? "bg-zinc-900 border border-zinc-800 text-white" : "text-zinc-600 hover:text-zinc-300"
            }`}
            title="Credential Vault"
          >
            <KeyRound className="w-4.5 h-4.5" />
          </button>

          <button 
            onClick={() => {
              if (analysis) setActiveTab("interview");
              else alert("Complete your Resume Ingestion on Onboarding first to unlock the Interview Simulator!");
            }}
            className={`w-10 h-10 rounded flex items-center justify-center transition-all duration-150 relative ${
              !analysis ? "opacity-40 cursor-not-allowed" : ""
            } ${
              activeTab === "interview" ? "bg-zinc-900 border border-zinc-800 text-white" : "text-zinc-600 hover:text-zinc-300"
            }`}
            title="Interview Lab"
          >
            <Terminal className="w-4.5 h-4.5" />
          </button>
        </nav>

        {/* Database indicator in bottom rail */}
        <div className="mt-auto flex flex-col gap-4 items-center">
          <div className="w-2 h-2 rounded-full bg-emerald-500" title="PostgreSQL Live"></div>
          <button onClick={handleReset} className="p-1.5 text-zinc-600 hover:text-red-400 rounded-sm transition-colors" title="Reset Sandbox Database">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        
        {/* PREMIUM HEADER BAR */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-[#1f1f1f] bg-[#0a0a0a] shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold tracking-tighter uppercase font-mono text-zinc-100">
              SKILLGAP // CAREER ARCHITECT
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-[#1f1f1f] border border-[#333] text-zinc-400 font-mono">
              V1.0.4
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4 text-xs font-mono">
              <span className="text-zinc-500 uppercase tracking-widest text-[10px]">
                Market Sync: <span className="text-emerald-400">Online</span>
              </span>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-500 uppercase tracking-widest text-[10px]">
                Database: <span className="text-zinc-300">pgvector compliant</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#262626] to-[#0a0a0a] border border-[#333] flex items-center justify-center text-[10px] font-mono text-zinc-400 font-bold">
                SG
              </div>
            </div>
          </div>
        </header>

        {/* WORKSPACE CONTENT SCROLL GRID */}
        <div className="flex-1 p-6 overflow-y-auto min-h-0">
          
          {/* Global notices for errors or clears */}
          {error && (
            <div className="mb-4 bg-red-950/20 border border-red-900/40 p-4 rounded text-xs text-red-400 font-mono flex justify-between items-center">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-zinc-500 hover:text-white uppercase text-[9px] font-bold">dismiss</button>
            </div>
          )}
          {resetMessage && (
            <div className="mb-4 bg-zinc-900/40 border border-zinc-800 p-4 rounded text-xs text-zinc-400 font-mono">
              {resetMessage}
            </div>
          )}

          {/* DUAL-STATE BENTO GRID EXPERIENCE */}
          {!analysis ? (
            /* INITIAL STATE BENTO DESIGN GRID (For Resume Onboarding/Ingestion) */
            <div className="grid grid-cols-12 auto-rows-auto gap-4 min-h-full">
              
              {/* Box 1 (col-span-12 lg:col-span-8): Interactive Ingestion Node */}
              <section className="col-span-12 lg:col-span-8 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-5 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-4 border-b border-[#1f1f1f] pb-3">
                  <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono font-bold">
                    [Node-01] RESUME RECONSTRUCTION & INGESTION
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[9.5px] font-mono bg-zinc-900/70 border border-zinc-900 text-zinc-400 uppercase">
                    Await parse...
                  </span>
                </div>
                
                <div className="flex-1">
                  <ResumeUpload 
                    onAnalyze={handleAnalyze}
                    loading={loading}
                    benchmarks={benchmarks}
                  />
                </div>
              </section>

              {/* Box 2 (col-span-12 lg:col-span-4): Match Score Pre-Assessment */}
              <section className="col-span-12 lg:col-span-4 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-5 flex flex-col justify-between min-h-[220px]">
                <div className="flex justify-between items-start">
                  <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono font-bold">
                    Calibrated Fit Score
                  </h3>
                  <span className="text-[10px] text-zinc-600 font-mono">STATIC_NULL</span>
                </div>
                <div className="py-6">
                  <div className="text-6xl font-extralight tracking-tighter text-zinc-700">00<span className="text-2xl text-zinc-800">%</span></div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed mt-2 uppercase font-mono">
                    Awaiting candidate resume input stream. Pick a high-fidelity template sample or upload text file details.
                  </p>
                </div>
                <div className="w-full h-1 bg-[#1f1f1f] rounded-full overflow-hidden">
                  <div className="h-full bg-white w-0"></div>
                </div>
              </section>

              {/* Box 3 (col-span-12 lg:col-span-5): Curated Benchmarks Directory */}
              <section className="col-span-12 lg:col-span-5 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-5 flex flex-col">
                <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono font-bold mb-4">
                  [Node-02] Industry Curations
                </h3>
                <div className="space-y-4 flex-1">
                  {benchmarks.map((b, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setSelectedBenchmark(b)}
                      className={`p-3 rounded border text-xs cursor-pointer transition-all ${
                        currentMatchedBenchmark?.roleTitle === b.roleTitle 
                          ? "bg-[#141416] border-zinc-600 text-white" 
                          : "bg-zinc-950/40 border-zinc-900/60 text-zinc-400 hover:border-zinc-800 hover:bg-zinc-900/20"
                      }`}
                    >
                      <div className="flex justify-between font-bold">
                        <span>{b.roleTitle}</span>
                        <span className="font-mono text-zinc-500 text-[10px]">{b.salaryRange}</span>
                      </div>
                      <div className="text-[10.5px] text-zinc-500 mt-1 line-clamp-1">{b.description}</div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Box 4 (col-span-12 lg:col-span-7): Market Trends Telemetry */}
              <section className="col-span-12 lg:col-span-7 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono font-bold mb-4">
                    [Telemetry] AI Skill Evolution Matrix
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-[#050505] border border-[#1f1f1f] p-4 rounded flex justify-between items-end">
                      <div>
                        <div className="text-3xl font-light tracking-tight text-white">+24.8%</div>
                        <div className="text-[9.5px] uppercase text-zinc-500 font-mono mt-0.5">AI Engine Integration</div>
                      </div>
                      <div className="w-12 h-6 flex items-end gap-0.5">
                        <div className="w-1.5 h-1 bg-zinc-800"></div>
                        <div className="w-1.5 h-3 bg-zinc-700"></div>
                        <div className="w-1.5 h-5 bg-white opacity-40"></div>
                        <div className="w-1.5 h-6 bg-white"></div>
                      </div>
                    </div>

                    <div className="bg-[#050505] border border-[#1f1f1f] p-4 rounded flex justify-between items-end">
                      <div>
                        <div className="text-3xl font-light tracking-tight text-zinc-400">-6.2%</div>
                        <div className="text-[9.5px] uppercase text-zinc-500 font-mono mt-0.5">Legacy Infrastructure</div>
                      </div>
                      <div className="w-12 h-6 flex items-end gap-0.5">
                        <div className="w-1.5 h-6 bg-white opacity-40"></div>
                        <div className="w-1.5 h-4 bg-zinc-700"></div>
                        <div className="w-1.5 h-2.5 bg-zinc-800"></div>
                        <div className="w-1.5 h-1 bg-zinc-900"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-[#0c0c0e] border border-dashed border-[#1f1f1f] rounded text-[11px] leading-relaxed text-zinc-500 font-mono">
                  Silicon architecture is shifting from memory footprint constraints to intelligence latency loops. Job seekers mapped on pgvector databases achieve a 3.4x faster pipeline onboarding velocity.
                </div>
              </section>

              {/* Box 5 (col-span-12): Guidelines Footer Banner */}
              <section className="col-span-12 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-5 flex items-center justify-between">
                <div>
                  <h4 className="text-[11px] font-mono uppercase text-zinc-400 font-bold">Secure Postgres Cryptographical Ledger Enabled</h4>
                  <p className="text-xs text-zinc-500 font-sans mt-0.5">Mock Auth.js active sessions safely encrypt credential records in railway deployment formats.</p>
                </div>
                <div className="text-xs font-mono text-zinc-400 flex items-center gap-4">
                  <span>SANDBOX REGISTRY: ONLINE</span>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                </div>
              </section>

            </div>
          ) : (
            <div className="space-y-6">
              
              {/* TOP HEADER SUB-TABS INTERACTIVE BAR */}
              <div className="flex gap-2 border-b border-[#1f1f1f] pb-3 select-none">
                <button 
                  onClick={() => setActiveTab("pathways")}
                  className={`px-4 py-2 text-xs font-mono font-bold uppercase transition-all duration-150 border-b-2 cursor-pointer ${
                    activeTab === "pathways" ? "border-white text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  📊 Core Dashboard
                </button>
                <button 
                  onClick={() => setActiveTab("credentials")}
                  className={`px-4 py-2 text-xs font-mono font-bold uppercase transition-all duration-150 border-b-2 cursor-pointer ${
                    activeTab === "credentials" ? "border-white text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  🔑 Verified Ledger
                </button>
                <button 
                  onClick={() => setActiveTab("interview")}
                  className={`px-4 py-2 text-xs font-mono font-bold uppercase transition-all duration-150 border-b-2 cursor-pointer ${
                    activeTab === "interview" ? "border-white text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  💻 Interview Lab
                </button>
              </div>

              {activeTab === "interview" ? (
                <div className="max-w-4xl">
                  <InterviewLab 
                    targetRole={analysis.roleTitle} 
                    skillsMatrix={analysis.skillsMatrix} 
                  />
                </div>
              ) : activeTab === "credentials" ? (
                <div className="max-w-4xl">
                  <CredentialVault 
                    credentials={credentials}
                    onAddCustomCredential={handleAddCustomCredential}
                    onResetVault={handleReset}
                  />
                </div>
              ) : (
                /* ACTIVE PROCESSED STATE BENTO DESIGN GRID (For Dynamic Pathways/Feedback) */
                <div className="grid grid-cols-12 auto-rows-auto gap-4">
                  
                  {/* Box 1 (col-span-12 md:col-span-3): Live Match Score percentage */}
                  <section className="col-span-12 md:col-span-3 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-5 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <h2 className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono font-bold">Match Score</h2>
                      <span className="text-[10px] text-emerald-500 bg-emerald-950/20 px-1.5 py-0.5 border border-emerald-900/30 rounded font-mono">
                        +{Math.round((learningPath?.currentMatchScore || 0) - (learningPath?.baseMatchScore || 0))}% dynamic
                      </span>
                    </div>
                    <div className="my-3">
                      <div className="text-6xl font-light tracking-tighter text-white">
                        {learningPath?.currentMatchScore || analysis.matchScore}<span className="text-2xl text-zinc-600">%</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed mt-2">
                        Highly competitive alignment for <br/>
                        <span className="text-white font-semibold font-sans">{analysis.roleTitle}</span>
                      </p>
                    </div>
                    <div className="w-full h-1 bg-[#1f1f1f] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-white opacity-80 transition-all duration-500"
                        style={{ width: `${learningPath?.currentMatchScore || analysis.matchScore}%` }}
                      ></div>
                    </div>
                  </section>

                  {/* Box 2 (col-span-12 md:col-span-6): Live Monospace Logs of Resume Parser */}
                  <section className="col-span-12 md:col-span-6 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-5 flex flex-col justify-between">
                    <div className="flex justify-between items-center pb-2 border-b border-[#1f1f1f]/80">
                      <h3 className="text-[10px] uppercase tracking-widest text-[#ededed]/60 font-mono font-bold">Resume Analysis logs</h3>
                      <span className="text-[9.5px] text-zinc-500 font-mono">parser_engine_v3.ts</span>
                    </div>
                    
                    <div className="flex-1 my-3 font-mono text-[11px] text-zinc-500 space-y-1.5 overflow-hidden">
                      <div className="flex gap-2">
                        <span className="text-zinc-700">01</span>
                        <span>Parsed raw resume stream successfully - Confidence 100%</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-zinc-700">02</span>
                        <span>Extracted skills: {analysis.skillsMatrix.slice(0, 3).map(s => s.skillName).join(", ")}, etc.</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-zinc-700">03</span>
                        <span>Mapped against dynamic target role benchmarks.</span>
                      </div>
                      <div className="flex gap-2 text-zinc-400">
                        <span className="text-zinc-700">04</span>
                        <span>Critical skill gap highlights: {analysis.skillsMatrix.filter(s => s.targetLevel - s.resumeLevel >= 2).length} vectors found.</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#1f1f1f] flex flex-wrap gap-2 justify-between items-center mt-2">
                      <span className="text-[10.5px] text-zinc-400 font-mono truncate max-w-[200px]">Candidate: {analysis.roleTitle}</span>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={handleExportSummary}
                          className="text-[10px] px-3.5 py-1.5 border border-[#1f1f1f] hover:border-zinc-700 bg-transparent text-zinc-300 font-semibold uppercase tracking-tighter rounded transition duration-150 flex items-center gap-1.5 cursor-pointer"
                          title="Export markdown report of current state"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Export Summary
                        </button>
                        <button 
                          onClick={() => {
                            setAnalysis(null);
                            setLearningPath(null);
                            setActiveTab("onboarding");
                          }}
                          className="text-[10px] px-3.5 py-1.5 bg-white text-black font-semibold uppercase tracking-tighter rounded hover:bg-zinc-200 transition duration-150 cursor-pointer"
                        >
                          Ingest Another
                        </button>
                      </div>
                    </div>
                  </section>

                  {/* Box 3 (col-span-12 md:col-span-3): Dynamic Salary Trajectory projection widget */}
                  <SalaryTrajectory 
                    targetRole={analysis.roleTitle}
                    matchScore={learningPath?.currentMatchScore || analysis.matchScore}
                  />

                  {/* Box 4 (col-span-12 md:col-span-4): Public Portfolio Configurator Node */}
                  <section className="col-span-12 md:col-span-4 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-5 flex flex-col justify-between">
                    <div>
                      <h3 className="text-[10px] uppercase tracking-widest text-[#ededed]/60 font-mono font-bold flex items-center gap-1.5 pb-2 border-b border-[#1f1f1f]/85">
                        <Globe className="w-3.5 h-3.5 text-zinc-400" />
                        PORTFOLIO PUBLICITY REGISTRY
                      </h3>
                      <p className="text-[11px] text-zinc-500 font-sans leading-relaxed mt-2.5">
                        Publish your live verified competency matrix, scores, and upskilled certs to invite recruiters.
                      </p>

                      <div className="flex items-center gap-2 bg-[#050505] p-2.5 rounded border border-[#1f1f1f] my-3.5">
                        <input 
                          type="checkbox" 
                          id="portfolio-public-switch"
                          checked={isProfilePublic}
                          disabled={isSavingPublicSettings}
                          onChange={(e) => handleToggleProfilePublic(e.target.checked, customPublicUsername)}
                          className="rounded bg-zinc-900 border-zinc-850 text-white focus:ring-0 focus:outline-none cursor-pointer"
                        />
                        <label htmlFor="portfolio-public-switch" className="text-[11px] font-mono text-zinc-400 select-none cursor-pointer">
                          Enable Public Portfolio
                        </label>
                      </div>

                      {isProfilePublic && (
                        <div className="space-y-3.5 animate-fadeIn">
                          <div className="flex gap-1.5">
                            <input 
                              type="text"
                              value={customPublicUsername}
                              disabled={isSavingPublicSettings}
                              onChange={(e) => setCustomPublicUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                              className="bg-[#050505] border border-zinc-900 focus:border-zinc-700 focus:outline-none rounded px-2 py-1 text-xs text-white font-mono flex-1"
                              placeholder="unique-slug"
                            />
                            <button
                              onClick={() => handleToggleProfilePublic(isProfilePublic, customPublicUsername)}
                              disabled={isSavingPublicSettings}
                              className="bg-white hover:bg-zinc-200 text-black px-3 py-1.5 text-[9.5px] font-mono rounded font-bold uppercase transition-all cursor-pointer"
                            >
                              Sync Slug
                            </button>
                          </div>

                          <div className="p-2 bg-zinc-950 border border-zinc-900 rounded text-[10.5px] font-mono text-zinc-400 flex justify-between items-center select-all gap-1.5">
                            <span className="truncate text-zinc-500">/p/{customPublicUsername}</span>
                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={() => {
                                  const shareUrl = `${window.location.origin}/p/${customPublicUsername}`;
                                  navigator.clipboard.writeText(shareUrl);
                                  setCopiedLink(true);
                                  setTimeout(() => setCopiedLink(false), 2000);
                                }}
                                className="p-1 text-zinc-500 hover:text-white rounded transition-colors"
                                title="Copy full URL"
                              >
                                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                              <a 
                                href={`/p/${customPublicUsername}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 text-zinc-500 hover:text-white rounded transition-colors"
                                title="View portfolio live"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Box 5 (col-span-12 md:col-span-8): Mapped Skills Gaps list (Radar chart replacement/wrapper) */}
                  <section className="col-span-12 md:col-span-8 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-5 flex flex-col justify-between">
                    <RadarChart 
                      skillsMatrix={analysis.skillsMatrix}
                      targetRole={analysis.roleTitle}
                    />
                  </section>

                  {/* Box 6 (col-span-12): Custom Learning Curriculum steps timeline */}
                  <section className="col-span-12 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-5 flex flex-col">
                    {learningPath && (
                      <TimelinePath
                        learningPath={learningPath}
                        onToggleStep={handleToggleStep}
                        onVerifyStep={handleVerifyStep}
                        verifiedStepIds={verifiedStepIds}
                      />
                    )}
                  </section>

                  {/* Box 7 (col-span-12): High Contrast Vercel/Stripe Quick Action Card */}
                  <section 
                    onClick={() => {
                      const firstIncomplete = learningPath?.steps.find(s => !s.completed);
                      if (firstIncomplete) {
                        handleToggleStep(firstIncomplete.id);
                      } else {
                        alert("Complete! All custom curriculum items verified in PostgreSQL vault.");
                      }
                    }}
                    className="col-span-12 bg-white rounded-lg p-5 flex items-center justify-between cursor-pointer group hover:bg-zinc-200 transition-all duration-150 relative overflow-hidden"
                  >
                    <div className="flex flex-col select-none">
                      <h3 className="text-[10px] uppercase tracking-widest text-black/50 font-bold font-mono">
                        Quick Action
                      </h3>
                      <span className="text-sm font-bold text-black mt-1 font-sans">
                        {learningPath?.steps.some(s => !s.completed) ? "Start Next Module" : "Retake Curriculum Pathways"}
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-full border border-black/20 flex items-center justify-center group-hover:border-black/55 transition-colors shrink-0">
                      <ChevronRight className="w-5 h-5 text-black stroke-[2.5]" />
                    </div>
                  </section>

                </div>
              )}
            </div>
          )}

        </div>

      </main>
    </div>
  );
}
