import { useState } from "react";
import { Terminal, Send, CheckCircle2, ChevronRight, MessageSquare, AlertCircle, Sparkles } from "lucide-react";
import { InterviewQuestion } from "../types";

interface InterviewLabProps {
  targetRole: string;
  skillsMatrix: any[];
}

interface ChatRecord {
  question: string;
  answer: string;
  score: number;
  suggestions: string;
  comparisonWithGaps: string;
  skillFocused: string;
}

export default function InterviewLab({ targetRole, skillsMatrix }: InterviewLabProps) {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [currentAnswer, setCurrentAnswer] = useState<string>("");
  const [history, setHistory] = useState<ChatRecord[]>([]);
  
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Start generation on demand
  const handleStartLab = async () => {
    setLoadingQuestions(true);
    setError(null);
    try {
      const res = await fetch("/api/interview/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole, skillsMatrix })
      });
      const data = await res.json();
      if (data.success && data.questions) {
        setQuestions(data.questions);
        setCurrentIdx(0);
        setHistory([]);
      } else {
        setError(data.error || "Failed to load interactive questions.");
      }
    } catch (err) {
      setError("Failed to synchronize with interview generation server.");
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleNextAnswer = async () => {
    if (!currentAnswer.trim()) return;
    setSubmittingAnswer(true);
    setError(null);
    const activeQuestion = questions[currentIdx];

    try {
      const res = await fetch("/api/interview/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: activeQuestion.question,
          answer: currentAnswer,
          skillFocused: activeQuestion.skillFocused,
          targetRole
        })
      });
      const data = await res.json();
      if (data.success && data.feedback) {
        setHistory(prev => [...prev, {
          question: activeQuestion.question,
          answer: currentAnswer,
          score: data.feedback.score,
          suggestions: data.feedback.suggestions,
          comparisonWithGaps: data.feedback.comparisonWithGaps,
          skillFocused: activeQuestion.skillFocused
        }]);
        setCurrentAnswer("");
        setCurrentIdx(prev => prev + 1);
      } else {
        setError(data.error || "Failed secure evaluation check.");
      }
    } catch (err) {
      setError("Analytics evaluation network failure. Verify server connection.");
    } finally {
      setSubmittingAnswer(false);
    }
  };

  // Render initialization menu if no questions yet
  if (questions.length === 0) {
    return (
      <div className="bg-[#0c0c0e] border border-zinc-800 rounded-lg p-6 space-y-6 flex flex-col justify-center items-center text-center py-12">
        <div className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center bg-zinc-950 text-zinc-400">
          <Terminal className="w-5 h-5" />
        </div>
        <div className="space-y-2 max-w-md">
          <h3 className="text-sm font-semibold text-white tracking-widest uppercase font-mono">
            [INTERVIEW SIMULATION LAB // PRIMARY GATEWAY]
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed font-sans">
            Ready to test your technical competency with challenging, realistic screener scenarios? 
            We will custom-generate 5 targeted questions focusing directly on your identified skill gaps for <span className="text-white font-medium">{targetRole}</span>.
          </p>
        </div>
        <button
          onClick={handleStartLab}
          disabled={loadingQuestions}
          className="text-[10px] cursor-pointer px-5 py-2.5 bg-white text-black font-semibold uppercase tracking-tighter rounded hover:bg-zinc-200 disabled:opacity-40 transition duration-150 flex items-center gap-2"
        >
          {loadingQuestions ? (
            <>
              <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              Compiling Challenging Vectors...
            </>
          ) : (
            <>
              <Terminal className="w-3 h-3" />
              Initialize Screener Session
            </>
          )}
        </button>
      </div>
    );
  }

  // Render completed summary Dashboard once 5 questions are parsed
  if (currentIdx >= questions.length) {
    const avgScore = Math.round(history.reduce((sum, item) => sum + item.score, 0) / history.length);
    return (
      <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-6 space-y-6">
        <div className="border-b border-zinc-900 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-white uppercase font-mono flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Screener Performance Matrix
            </h3>
            <p className="text-xs text-zinc-500 font-sans mt-0.5">Summary of challenging technical gates evaluated.</p>
          </div>
          <button
            onClick={handleStartLab}
            className="text-[9px] cursor-pointer px-3 py-1.5 border border-zinc-800 text-zinc-300 font-bold uppercase tracking-tight rounded hover:bg-zinc-900 transition-colors"
          >
            Restart Interview Lab
          </button>
        </div>

        {/* Global summary stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#0c0c0e] border border-zinc-800 p-4 rounded flex items-center justify-between">
            <div>
              <div className="text-[10px] text-zinc-500 uppercase font-mono">LAB AGGREGATE FIT</div>
              <div className="text-3xl font-light tracking-tight text-white mt-1">
                {avgScore}<span className="text-sm text-zinc-600">%</span>
              </div>
            </div>
            <div className={`px-2.5 py-1 rounded text-[10px] font-mono border ${
              avgScore >= 80 
                ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-400" 
                : avgScore >= 60 
                  ? "bg-zinc-900 border-zinc-800 text-zinc-400" 
                  : "bg-red-950/20 border-red-900/40 text-red-400"
            }`}>
              {avgScore >= 80 ? "ROLE SECURED" : avgScore >= 60 ? "DEVELOPMENT ACTIVE" : "DEVELOPMENT ESSENTIAL"}
            </div>
          </div>
          <div className="bg-[#0c0c0e] border border-zinc-800 p-4 rounded-lg flex flex-col justify-center">
            <div className="text-[10px] text-zinc-500 uppercase font-mono">SCENARIOS PASSED</div>
            <div className="text-lg font-mono text-zinc-300 mt-1 uppercase">
              {history.length} / 5 Questions Evaluated
            </div>
          </div>
        </div>

        {/* Actionable Feedback Timeline layout */}
        <div className="space-y-4">
          <h4 className="text-[10.5px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Evaluation Breakdown Ledger:</h4>
          
          <div className="divide-y divide-zinc-900 space-y-4">
            {history.map((record, index) => (
              <div key={index} className="pt-4 first:pt-0 space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-mono text-zinc-400">
                      {index + 1}
                    </span>
                    <span className="text-xs font-semibold text-white truncate max-w-[240px]">
                      {record.skillFocused}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    record.score >= 80 ? "border-emerald-900/30 text-emerald-400" : "border-zinc-800 text-zinc-400"
                  }`}>
                    SCORE: {record.score}/100
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed italic border-l border-zinc-800 pl-3">
                  Q: {record.question}
                </p>
                <div className="bg-[#0c0c0e] border border-zinc-900 p-3 rounded space-y-2">
                  <div className="text-xs font-mono text-zinc-300">
                    <span className="text-zinc-650 font-bold mr-1.5">ANS:</span>
                    {record.answer}
                  </div>
                  <div className="text-[11px] leading-relaxed text-zinc-400 flex flex-col gap-1 border-t border-zinc-900 pt-2 font-sans">
                    <div className="text-white font-mono text-[10px] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-zinc-500 shrink-0" />
                      SUGGESTIONS & REMEDIATIONS:
                    </div>
                    <span>{record.suggestions}</span>
                    <span className="text-[10.5px] text-zinc-500 font-mono mt-1 font-sans">{record.comparisonWithGaps}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activeQuestion = questions[currentIdx];

  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-5 space-y-5">
      <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
        <div>
          <h3 className="text-xs font-semibold tracking-tight text-white uppercase font-mono flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-zinc-500" />
            Interview Simulator
          </h3>
          <p className="text-[10px] text-zinc-500 font-sans mt-0.5">Screener Session: Evaluating current competence.</p>
        </div>
        <span className="text-[10px] font-mono bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-zinc-400">
          Q: {currentIdx + 1} / {questions.length}
        </span>
      </div>

      {error && (
        <div className="bg-red-950/20 border border-red-900/40 p-3 rounded text-[10.5px] text-red-400 font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Terminal View */}
      <div className="bg-[#0c0c0e] border border-zinc-800 rounded-md p-4 space-y-3 font-mono">
        <div className="flex items-center justify-between text-[9px] text-zinc-600 border-b border-zinc-900 pb-1.5 select-none">
          <span>SECURE SCREENER CONTEXT CHANNEL v1.02</span>
          <span>ONLINE</span>
        </div>

        <div className="space-y-2">
          <div className="text-zinc-600 flex items-center gap-1.5 text-[10.5px] select-none">
            <span>root@skillgap-lab:~$</span>
            <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-850 text-zinc-400 text-[9px]">
              {activeQuestion.skillFocused} Competency Screen
            </span>
          </div>
          <p className="text-xs text-white leading-relaxed font-semibold pl-2">
            &quot;{activeQuestion.question}&quot;
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block">Candidate Answer:</label>
        <textarea
          value={currentAnswer}
          onChange={(e) => setCurrentAnswer(e.target.value)}
          placeholder="Detailed typing of technical workflow tradeoffs, system choices, or remediation code..."
          rows={4}
          disabled={submittingAnswer}
          className="w-full bg-[#070708] border border-zinc-800 focus:border-zinc-500 focus:outline-none rounded p-3 text-xs text-white placeholder-zinc-700 font-sans transition-all leading-relaxed"
        />
        <p className="text-[9.5px] text-zinc-600 font-mono select-none">
          Tip: Answers with robust logic, framework awareness, and trade-off depth receive premium competency scores.
        </p>
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={handleNextAnswer}
          disabled={submittingAnswer || !currentAnswer.trim()}
          className="text-[10px] cursor-pointer px-4 py-2 bg-white disabled:bg-zinc-800 text-black disabled:text-zinc-600 font-bold uppercase tracking-tight rounded transition-all duration-150 flex items-center gap-1.5"
        >
          {submittingAnswer ? (
            <>
              <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              Evaluating Score...
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              Submit and Assess
            </>
          )}
        </button>
      </div>
    </div>
  );
}
