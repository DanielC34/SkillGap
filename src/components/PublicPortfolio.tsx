import { Award, ShieldCheck, Compass, Terminal, Cpu } from "lucide-react";
import { SkillGapItem, Credential } from "../types";
import RadarChart from "./RadarChart";

interface PublicPortfolioProps {
  username: string;
  profile: {
    name: string;
    targetRole: string;
    matchScore: number;
    skillsMatrix: SkillGapItem[];
    verifiedCredentials: Credential[];
  };
}

export default function PublicPortfolio({ username, profile }: PublicPortfolioProps) {
  return (
    <div className="min-h-screen w-full bg-[#050505] text-[#ededed] font-sans p-6 sm:p-12 border border-[#262626] flex flex-col justify-between space-y-12">
      
      {/* 1. Header Navigation */}
      <header className="flex justify-between items-center border-b border-[#1f1f1f] pb-6">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded bg-white flex items-center justify-center text-[10px] font-bold text-black font-mono">
            SG
          </span>
          <span className="text-xs font-bold tracking-widest font-mono text-zinc-100 uppercase">
            SKILLGAP // PUBLIC PORTFOLIO
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 bg-zinc-950 px-2.5 py-1 border border-zinc-900 rounded">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          VERIFIED BY CANDIDATE REGISTRY
        </div>
      </header>

      {/* 2. Main Hero Presentation */}
      <section className="space-y-4 max-w-4xl py-6 select-none">
        <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-zinc-500">
          PROVEN COMPETENCY MAPPING FOR:
        </span>
        <h1 className="text-4xl sm:text-6xl font-light tracking-tighter text-white">
          {profile.name}
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-mono text-zinc-400">
          <span className="text-white font-semibold text-sm">{profile.targetRole}</span>
          <span className="text-zinc-700">|</span>
          <span>Target Alignment Score:</span>
          <span className="text-[14px] font-bold text-white bg-zinc-900 px-2 py-0.5 border border-zinc-850 rounded">
            {profile.matchScore}%
          </span>
        </div>
      </section>

      {/* 3. Bento Grid of Competencies & Credentials */}
      <div className="grid grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Skills Progress Matrix */}
        <div className="col-span-12 lg:col-span-7 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-6">
          <RadarChart 
            skillsMatrix={profile.skillsMatrix}
            targetRole={profile.targetRole}
          />
        </div>

        {/* Right Column: Verified Credentials */}
        <div className="col-span-12 lg:col-span-5 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-6 space-y-6">
          <div className="border-b border-[#1f1f1f] pb-3">
            <h3 className="text-xs font-semibold tracking-tight text-white uppercase font-mono flex items-center gap-1.5">
              <Award className="w-4.5 h-4.5 text-zinc-400" />
              Verified Credentials Vault
            </h3>
            <p className="text-[11px] text-zinc-500 font-sans mt-0.5">
              Cryptographically signed upskilled certs.
            </p>
          </div>

          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
            {profile.verifiedCredentials.length > 0 ? (
              profile.verifiedCredentials.map((cred) => (
                <div key={cred.id} className="p-3 bg-zinc-950/50 border border-zinc-900 rounded space-y-2 hover:border-zinc-800 transition-colors">
                  <div className="flex justify-between items-start gap-3">
                    <h4 className="text-xs font-bold text-zinc-100 font-sans leading-snug">
                      {cred.courseTitle}
                    </h4>
                    <span className="text-[9.5px] font-mono shrink-0 bg-emerald-950/20 text-emerald-400 px-2 py-0.5 border border-emerald-900/30 rounded">
                      VERIFIED
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                    <span>{cred.provider}</span>
                    <span>{new Date(cred.verifiedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="text-[9.5px] font-mono text-zinc-600 bg-zinc-900/40 p-1.5 rounded truncate select-all">
                    SIG // {cred.txHash}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 border border-zinc-900/60 rounded text-center py-12 space-y-2">
                <Cpu className="w-8 h-8 text-zinc-700 mx-auto" />
                <p className="text-xs text-zinc-500 italic">No validated milestones registered yet.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 4. Footer Banner Info */}
      <footer className="border-t border-[#1f1f1f] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500 shrink-0">
        <div>
          <span>RECONSTRUCTED SECURELY ON SKILLGAP CORE CLOUD APPLET</span>
        </div>
        <a 
          href="/" 
          className="text-[10px] px-3.5 py-1.5 bg-white text-black font-semibold uppercase tracking-tighter rounded hover:bg-zinc-200 transition duration-150 flex items-center gap-1.5 cursor-pointer"
        >
          <Compass className="w-3.5 h-3.5" />
          Map Your Career At SkillGap
        </a>
      </footer>

    </div>
  );
}
