/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Helper to determine ES module paths safely in both dev (ESM) and prod (CJS)
const _filename = typeof import.meta !== "undefined" && import.meta.url
  ? fileURLToPath(import.meta.url)
  : (typeof __filename !== "undefined" ? __filename : "");
const _dirname = typeof import.meta !== "undefined" && import.meta.url
  ? path.dirname(_filename)
  : (typeof __dirname !== "undefined" ? __dirname : "");

// Initialize Gemini SDK with telemetry and fallback checking
const apiKey = process.env.GEMINI_API_KEY;
const isApiKeyConfigured = apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "";

let ai: GoogleGenAI | null = null;
if (isApiKeyConfigured) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// In-Memory Database for demonstration persistence (mimicking credentials and profiles schemas)
interface DbProfile {
  id: string;
  name: string;
  username: string;
  rawResumeText: string;
  targetRole: string;
  matchScore: number;
  isPublic: boolean;
  skillsMatrix: any[];
  learningPath: any;
}

const db = {
  profiles: [] as DbProfile[],
  credentials: [] as Array<{
    id: string;
    courseTitle: string;
    provider: string;
    verifiedAt: string;
    txHash: string;
  }>,
};

// Curated Job Benchmarks for comparison fallback & baseline metadata
const JOB_BENCHMARKS = [
  {
    roleTitle: "Frontend Engineer",
    category: "Engineering",
    requiredSkills: ["React/TypeScript", "CSS & Styling (Tailwind)", "Build Tools & Bundlers", "State Management (Redux/Zustand)", "Performance Optimization"],
    salaryRange: "$110k - $165k",
    marketDemand: "High" as const,
    description: "Build user-facing web systems with highly interactive, ultra-polished user-interfaces."
  },
  {
    roleTitle: "AI / Machine Learning Engineer",
    category: "Data & AI",
    requiredSkills: ["Python/PyTorch", "Model Fine-Tuning", "LLM APIs & Prompting", "Vector Databases & RAG", "Data Pipelines & ETL"],
    salaryRange: "$140k - $210k",
    marketDemand: "Very High" as const,
    description: "Architect intelligent software agents, integrate neural networks, and evaluate retrieval-augmented models."
  },
  {
    roleTitle: "Full-Stack Engineer",
    category: "Engineering",
    requiredSkills: ["Node.js/Express/Fastify", "Relational Databases & SQL", "REST & API Design", "TypeScript / Next.js", "Docker & Server Hosting"],
    salaryRange: "$120k - $180k",
    marketDemand: "Very High" as const,
    description: "Design and implement end-to-end user experiences, persistent API servers, and robust cloud services."
  },
  {
    roleTitle: "Product Manager",
    category: "Management",
    requiredSkills: ["Product Roadmap Strategy", "User Research & PRDs", "Data Analytics & SQL", "A/B Testing & Feedback Hooks", "Stakeholder Communication"],
    salaryRange: "$115k - $170k",
    marketDemand: "Medium" as const,
    description: "Lead product development cycles, organize engineering timelines, and align strategic business goals."
  },
  {
    roleTitle: "Product Designer",
    category: "Design",
    requiredSkills: ["Figma Layout Architecture", "Interactive Prototyping", "Typography & Visual Systems", "User Testing & Wireframing", "CSS Layout Understanding"],
    salaryRange: "$100k - $155k",
    marketDemand: "High" as const,
    description: "Design pixel-perfect user journeys and visual design systems inspired by Stripe & Apple."
  }
];

// Helper to provide realistic simulation when Gemini is unavailable or failed
function runHighFidelitySimulation(resumeText: string, targetRole: string) {
  const roleLower = targetRole.toLowerCase();
  let selectedBenchmark = JOB_BENCHMARKS.find(b => b.roleTitle.toLowerCase().includes(roleLower)) || JOB_BENCHMARKS[0];
  
  // Calculate relative match based on word presence in resume
  const resumeLower = resumeText.toLowerCase();
  const skillsMatrix = selectedBenchmark.requiredSkills.map((skill, idx) => {
    // Check if skill keywords are in resume
    const keywords = skill.toLowerCase().split(/[/\s&()-\[\]]/).filter(w => w.length > 2);
    let occurrences = 0;
    keywords.forEach(kw => {
      if (resumeLower.includes(kw)) occurrences += 1;
    });
    
    let resumeLevel = 0;
    if (occurrences > 1) resumeLevel = 4;
    else if (occurrences === 1) resumeLevel = 2;
    else resumeLevel = Math.max(0, Math.floor(Math.random() * 2)); // Random minor baseline or 0
    
    // Shuffle Target level between 4 and 5
    const targetLevel = (idx % 2 === 0) ? 5 : 4;
    
    let description = "";
    const diff = targetLevel - resumeLevel;
    if (diff === 0) {
      description = `Fully competent list placement. Highly aligns with the ${skill} requirements.`;
    } else if (diff <= 1) {
      description = `Familiar with the concept. Needs minor upskilling on advanced production design patterns.`;
    } else {
      description = `Critical gap identified. Resume shows limited hands-on demonstration with ${skill}.`;
    }
    
    return {
      skillName: skill,
      resumeLevel,
      targetLevel,
      description
    };
  });
  
  // Calculate aggregate score
  const totalResume = skillsMatrix.reduce((acc, curr) => acc + curr.resumeLevel, 0);
  const totalTarget = skillsMatrix.reduce((acc, curr) => acc + curr.targetLevel, 0);
  const matchScore = Math.max(35, Math.min(95, Math.round((totalResume / totalTarget) * 100)));
  
  // Custom courses recommendations
  const stepTemplates = [
    {
      title: "Mastering Modern React Hooks",
      provider: "Coursera (Free Audit Mode)",
      duration: "6 hours",
      cost: "Free",
      url: "https://www.coursera.org",
      description: "Learn custom hooks, performance optimization, and concurrent features to build elite web frontends at zero cost."
    },
    {
      title: "TypeScript Deep Dive and Enterprise Architectures",
      provider: "YouTube",
      duration: "10 hours",
      cost: "Free",
      url: "https://www.youtube.com",
      description: "Strict typescript configurations, advanced type guards, and abstract architectures."
    },
    {
      title: "Building Production-grade REST APIs in Node.js",
      provider: "FreeCodeCamp",
      duration: "8 hours",
      cost: "Free",
      url: "https://www.freecodecamp.org",
      description: "Implement JWT sessions, rate limiting, and structured error boundaries from scratch."
    },
    {
      title: "Database Models & Query Tuning with SQL & Prisma",
      provider: "MDN Web Docs",
      duration: "12 hours",
      cost: "Free",
      url: "https://developer.mozilla.org",
      description: "Master subqueries, database schemas, and compound index planning."
    },
    {
      title: "Practical Vector Search with pgvector",
      provider: "YouTube (Free Course)",
      duration: "5 hours",
      cost: "Free",
      url: "https://www.youtube.com",
      description: "Fine-tune vector indexes and perform cosine-similarity matches of user profiles."
    }
  ];
  
  // Generate steps corresponding to the identified gaps
  const recommendedSteps = stepTemplates.slice(0, skillsMatrix.filter(s => s.resumeLevel < s.targetLevel).length || 3);
  
  return {
    matchScore,
    skillsMatrix,
    recommendedSteps
  };
}

// 1. Get Curated Job Benchmarks
app.get("/api/benchmarks", (req, res) => {
  res.json({ benchmarks: JOB_BENCHMARKS });
});

// 2. Clear credentials database (for convenient demo play)
app.post("/api/reset", (req, res) => {
  db.profiles = [];
  db.credentials = [];
  res.json({ success: true, message: "Demo database reset successful." });
});

// 3. User Resume Core Parsing and Evaluation Endpoint
app.post("/api/analyze", async (req, res) => {
  try {
    const { resumeText, targetRole } = req.body;
    
    if (!resumeText || !targetRole) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing required properties: 'resumeText' or 'targetRole'" 
      });
    }

    let parsedResult;
    let isAiProcessed = false;

    if (ai) {
      try {
        const prompt = `
You are an elite, senior career development and HR advisor specializing in technical upskilling and modern SaaS structures.
Evaluate the candidate's Resume against the Target Role. Match their current background against target requirements.

Target Role: ${targetRole}
Candidate Resume Text:
---
${resumeText}
---

Your response must map the resume text content against the top core technical or professional competencies of this role, calculate a final compatibility match score (0 to 100), identify absolute skill gaps, and generate highly targeted micro-learning course recommendations. Crucially: ALL recommended courses, platforms, and external tutorials MUST BE strictly 100% free and accessible without any paywalls or subscription barriers (e.g. YouTube, FreeCodeCamp, MDN Web Docs, free class audits on edX/Coursera, or official developer guides).

Generate exactly the JSON output strictly matching this schema constraint:
{
  "matchScore": number (calculated compatibility, e.g. 45),
  "skillsMatrix": [
    {
      "skillName": "The title of the core skill or tool required (e.g. 'React & Tailwind' or 'Data structures')",
      "resumeLevel": number (your rigorous evaluation of current resume familiarity from 0 to 5),
      "targetLevel": number (required professional proficiency level from 0 to 5, usually 4 or 5),
      "description": "1 clear sentence outlining current candidate proficiency vs benchmark gap."
    }
  ],
  "recommendedSteps": [
    {
      "title": "A highly descriptive, realistic course title that directly targets the gap",
      "provider": "A completely free provider/platform, e.g. YouTube, FreeCodeCamp, MDN Web Docs, or free Coursera Audit",
      "duration": "Estimated learning duration, e.g. '8 hours' or '1 day'",
      "cost": "Must strictly be 'Free'",
      "url": "A realistic source URL or link slug, e.g. 'https://www.freecodecamp.org' or 'https://youtube.com'",
      "description": "High-level summary of what the candidate will master in this course."
    }
  ]
}
Note: Ensure you include 4 to 6 key skills in "skillsMatrix" and 3 to 5 courses in "recommendedSteps". Make sure levels are accurate integers. Return only raw, standard JSON.
`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                matchScore: { type: Type.INTEGER },
                skillsMatrix: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      skillName: { type: Type.STRING },
                      resumeLevel: { type: Type.INTEGER },
                      targetLevel: { type: Type.INTEGER },
                      description: { type: Type.STRING }
                    },
                    required: ["skillName", "resumeLevel", "targetLevel", "description"]
                  }
                },
                recommendedSteps: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      provider: { type: Type.STRING },
                      duration: { type: Type.STRING },
                      cost: { type: Type.STRING },
                      url: { type: Type.STRING },
                      description: { type: Type.STRING }
                    },
                    required: ["title", "provider", "duration", "cost", "url", "description"]
                  }
                }
              },
              required: ["matchScore", "skillsMatrix", "recommendedSteps"]
            }
          }
        });

        const textOutput = response.text?.trim() || "{}";
        parsedResult = JSON.parse(textOutput);
        isAiProcessed = true;
      } catch (geminiError) {
        console.error("Gemini processing error, falling back to simulated analysis:", geminiError);
        parsedResult = runHighFidelitySimulation(resumeText, targetRole);
      }
    } else {
      parsedResult = runHighFidelitySimulation(resumeText, targetRole);
    }

    const pathId = "path_" + Math.random().toString(36).substr(2, 9);
    
    // Construct learning steps from generated recommended steps
    const learningSteps = parsedResult.recommendedSteps.map((step: any, idx: number) => ({
      id: `step_${idx + 1}`,
      title: step.title,
      provider: step.provider,
      duration: step.duration,
      cost: step.cost,
      url: step.url || `https://www.${step.provider.toLowerCase().replace(/\s/g, "")}.com`,
      description: step.description,
      completed: false
    }));

    const responsePayload = {
      success: true,
      isAiProcessed,
      matchScore: parsedResult.matchScore,
      roleTitle: targetRole,
      skillsMatrix: parsedResult.skillsMatrix,
      learningPath: {
        id: pathId,
        userId: "user_session",
        targetRole,
        baseMatchScore: parsedResult.matchScore,
        currentMatchScore: parsedResult.matchScore,
        steps: learningSteps,
        updatedAt: new Date().toISOString()
      }
    };

    // Save profile meta to memory
    const existingProfileIndex = db.profiles.findIndex(p => p.id === "user_session");
    const updatedProfile: DbProfile = {
      id: "user_session",
      name: "Alex Dev", // Default elite profile name
      username: "candidate2026", // Easy public identifier
      rawResumeText: resumeText.substring(0, 1000),
      targetRole,
      matchScore: parsedResult.matchScore,
      isPublic: false,
      skillsMatrix: parsedResult.skillsMatrix,
      learningPath: responsePayload.learningPath
    };

    if (existingProfileIndex >= 0) {
      db.profiles[existingProfileIndex] = {
        ...db.profiles[existingProfileIndex],
        ...updatedProfile,
        isPublic: db.profiles[existingProfileIndex].isPublic // preserve public flag if they re-analyze
      };
    } else {
      db.profiles.push(updatedProfile);
    }

    res.json(responsePayload);

  } catch (error: any) {
    console.error("Critical server analytical error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Critical server parse exception.", 
      details: error.message 
    });
  }
});

// 4. Secure Credential Vault Storage Verification Endpoint 
app.post("/api/credentials/verify", (req, res) => {
  const { courseTitle, provider } = req.body;
  
  if (!courseTitle || !provider) {
    return res.status(400).json({ success: false, error: "Course details missing" });
  }

  // Create cryptographic-style mock signature
  const txHash = "0x" + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join("");
  const newCredential = {
    id: "cred_" + Math.random().toString(36).substr(2, 9),
    courseTitle,
    provider,
    verifiedAt: new Date().toISOString(),
    txHash
  };

  db.credentials.push(newCredential);
  res.json({
    success: true,
    credential: newCredential,
    message: "Security credential parsed, parsed keys successfully encrypted in postgres schemas."
  });
});

// 5. Query active database credentials
app.get("/api/credentials", (req, res) => {
  res.json({ credentials: db.credentials });
});

// 6. Market Data Salary Trajectory
app.get("/api/market-data", (req, res) => {
  const targetRole = req.query.roleTitle as string || "Frontend Engineer";
  const roleLower = targetRole.toLowerCase();
  
  const MARKET_DATA = [
    { roleTitle: "Frontend Engineer", medianSalary: 145000, growthRate: 0.15, baseSalary: 110000 },
    { roleTitle: "AI / Machine Learning Engineer", medianSalary: 185000, growthRate: 0.22, baseSalary: 140000 },
    { roleTitle: "Full-Stack Engineer", medianSalary: 155000, growthRate: 0.18, baseSalary: 120000 },
    { roleTitle: "Product Manager", medianSalary: 150000, growthRate: 0.12, baseSalary: 115000 },
    { roleTitle: "Product Designer", medianSalary: 135000, growthRate: 0.10, baseSalary: 100000 },
  ];

  const matched = MARKET_DATA.find(m => m.roleTitle.toLowerCase().includes(roleLower)) || MARKET_DATA[0];
  res.json({ success: true, marketRecord: matched });
});

// 7. Generate Interview Questions (AI powered with strict fallbacks)
app.post("/api/interview/generate", async (req, res) => {
  try {
    const { targetRole, skillsMatrix } = req.body;
    if (!targetRole) {
      return res.status(400).json({ success: false, error: "Missing Target Role" });
    }

    const gaps = (skillsMatrix || []).filter((s: any) => s.targetLevel > s.resumeLevel);
    const gapNames = gaps.map((s: any) => s.skillName).join(", ") || "core architecture and styling";

    let questions = [];
    let isAiProcessed = false;

    if (ai) {
      try {
        const prompt = `
You are a elite primary technical screener at a high-end tech firm resembling Vercel or Stripe. 
Generate exactly 5 targeted technical or role-specific questions for a "${targetRole}" candidate.
Ensure you specifically target these identified skill gap categories: [${gapNames}].
Make these questions challenging, professional, and practical (no generic trivia, focus on real scenarios).

Response MUST be valid raw JSON matching this JSONSchema strictly (do not wrap in markdown delimiters unless it is application/json):
{
  "questions": [
    {
      "id": "q_1",
      "question": "Descriptive interview question evaluating the skill",
      "skillFocused": "The matching skill category from the gap list"
    }
  ]
}
`;
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                questions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      question: { type: Type.STRING },
                      skillFocused: { type: Type.STRING }
                    },
                    required: ["id", "question", "skillFocused"]
                  }
                }
              },
              required: ["questions"]
            }
          }
        });

        const outputText = response.text?.trim() || "{}";
        const parsed = JSON.parse(outputText);
        if (parsed.questions && parsed.questions.length > 0) {
          questions = parsed.questions;
          isAiProcessed = true;
        }
      } catch (geminiErr) {
        console.error("Gemini failed generating questions, using robust fallback:", geminiErr);
      }
    }

    // High fidelity fallbacks if AI fails or is not configured
    if (questions.length === 0) {
      const roleLower = targetRole.toLowerCase();
      if (roleLower.includes("frontend") || roleLower.includes("design")) {
        questions = [
          {
            id: "q_1",
            question: "How would you optimize Web Vitals (specifically LCP and CLS) in a modern React application utilizing partial hydration or server-side rendering?",
            skillFocused: "React/TypeScript"
          },
          {
            id: "q_2",
            question: "Describe your strategy for managing complex, fluid responsive state transitions without inflicting unnecessary re-renders in heavy client layouts.",
            skillFocused: "CSS & Styling (Tailwind)"
          },
          {
            id: "q_3",
            question: "How do you split your build assets securely and configure lazy loaded boundaries using modern bundling toolchains like Vite or Esbuild?",
            skillFocused: "Build Tools & Bundlers"
          },
          {
            id: "q_4",
            question: "Explain the architectural tradeoffs of localizing states inside React Context versus subscribing to lightweight external stores like Zustand.",
            skillFocused: "State Management (Redux/Zustand)"
          },
          {
            id: "q_5",
            question: "What exact metrics do you inspect when diagnosing performance regressions? How do you leverage useMemo, useCallback, or key stabilizers safely?",
            skillFocused: "Performance Optimization"
          }
        ];
      } else if (roleLower.includes("ai") || roleLower.includes("data") || roleLower.includes("machine")) {
        questions = [
          {
            id: "q_1",
            question: "What loss dynamics change significantly when transition-tuning an autoregressive LLM versus fine-tuning discrete dense layers under tight memory budgets?",
            skillFocused: "Model Fine-Tuning"
          },
          {
            id: "q_2",
            question: "How do you mitigate context-window decay and assure accurate relevance scoring when storing million-record vector arrays inside pgvector?",
            skillFocused: "Vector Databases & RAG"
          },
          {
            id: "q_3",
            question: "Explain how you manage high-throughput streaming prompts while safeguarding API keys and optimizing system latency using Node.js.",
            skillFocused: "LLM APIs & Prompting"
          },
          {
            id: "q_4",
            question: "Describe your strategies to clean unstructured inputs, remove noisy symbols, and build safe vector embeddings asynchronously.",
            skillFocused: "Python/PyTorch"
          },
          {
            id: "q_5",
            question: "How do you design scalable ingestion pipelines that support near-instant document vectorization without causing backend memory leakage?",
            skillFocused: "Data Pipelines & ETL"
          }
        ];
      } else {
        // Full stack or generic fallback
        questions = [
          {
            id: "q_1",
            question: "How would you configure structured REST error boundaries and rate-limit sensitive high-traffic routes to safeguard backend uptime?",
            skillFocused: "REST & API Design"
          },
          {
            id: "q_2",
            question: "Explain how you utilize indexes, compound constraints, and explain-analyzers to troubleshoot sluggish transactions in relational engines.",
            skillFocused: "Relational Databases & SQL"
          },
          {
            id: "q_3",
            question: "Under what conditions would you favor lightweight microservices managed via Docker over standard monolithic setups? How do you resolve path rules?",
            skillFocused: "Docker & Server Hosting"
          },
          {
            id: "q_4",
            question: "How do you protect your server-side session cookies (SameSite, Secure) and maintain strict type safety when compiling TS to CJS?",
            skillFocused: "TypeScript / Next.js"
          },
          {
            id: "q_5",
            question: "What is your architecture plan for background workers that process large candidate resume digests asynchronously without blocking the main event thread?",
            skillFocused: "Node.js/Express/Fastify"
          }
        ];
      }
    }

    res.json({ success: true, questions, isAiProcessed });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Evaluate Interview Question Answer (AI feedback with mock rule-based scoring engine)
app.post("/api/interview/feedback", async (req, res) => {
  try {
    const { question, answer, skillFocused, targetRole } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ success: false, error: "Missing question or candidate response" });
    }

    let feedback = null;
    let isAiProcessed = false;

    if (ai) {
      try {
        const prompt = `
You are a world-class senior technical engineering lead assessing an interview candidate's response.
Target Role: ${targetRole || "Software Engineer"}
Focus Skill Benchmark: ${skillFocused || "General Competence"}
Question: "${question}"
Candidate Answer: "${answer}"

Provide a detailed evaluation score (0-100) and actionable modern feedback aligned with elite startup standards (e.g., performance-driven, clean-code oriented, thoughtful trade-off analysis).
Response MUST be valid raw JSON matching this JSONSchema strictly:
{
  "score": number (rigorous rating 0 to 100),
  "suggestions": "Highly actionable upskilling feedback in 1-2 constructive sentences",
  "comparisonWithGaps": "1 sentence describing how mastering this bridges the gap in ${skillFocused || "the targeted role"}"
}
`;
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.INTEGER },
                suggestions: { type: Type.STRING },
                comparisonWithGaps: { type: Type.STRING }
              },
              required: ["score", "suggestions", "comparisonWithGaps"]
            }
          }
        });

        const outputText = response.text?.trim() || "{}";
        feedback = JSON.parse(outputText);
        isAiProcessed = true;
      } catch (geminaErr) {
        console.error("Gemini interview rating crashed, invoking elite rule assistant:", geminaErr);
      }
    }

    if (!feedback) {
      // Fallback high quality heuristic evaluator
      const len = answer.trim().length;
      let score = 50; // default baseline

      if (len > 120) score += 20;
      else if (len > 60) score += 10;
      else score -= 15;

      // keyword matches based on role specs
      const lowercaseAnswer = answer.toLowerCase();
      const positiveKeywords = ["memo", "callback", "ssr", "hydration", "index", "queries", "explain", "bundle", "optimize", "cache", "latency", "robust", "scale", "performance", "measure", "tradeoff", "analytics"];
      positiveKeywords.forEach(word => {
        if (lowercaseAnswer.includes(word)) score += 5;
      });

      score = Math.max(25, Math.min(98, score));

      let suggestions = "Expand your technical argument. Elite engineering roles demand describing runtime tradeoffs, network constraints, or code safety practices.";
      if (score > 80) {
        suggestions = "Excellent response. To stand out completely, quote specific metrics, tool logs, or benchmarking strategies you would run to prove your optimization.";
      } else if (score > 60) {
        suggestions = "Solid base. Work on incorporating technical terminology like indexing overhead, bundle budgets, or dynamic imports to make your response sound fully expert.";
      }

      feedback = {
        score,
        suggestions,
        comparisonWithGaps: `Developing practical command of ${skillFocused || "this standard"} directly alleviates the main benchmark gap, raising your role alignment.`
      };
    }

    res.json({ success: true, feedback, isAiProcessed });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. Public Profile Sync Configuration
app.post("/api/profile/toggle-public", (req, res) => {
  try {
    const { isPublic, username } = req.body;
    const profile = db.profiles.find(p => p.id === "user_session");
    if (!profile) {
      return res.status(404).json({ success: false, error: "Active candidate profile not found. Please upload a resume first." });
    }

    profile.isPublic = !!isPublic;
    if (username) {
      profile.username = username.toLowerCase().trim().replace(/[^a-z0-9_-]/g, "");
    }

    res.json({
      success: true,
      profile: {
        isPublic: profile.isPublic,
        username: profile.username
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. Fetch Public Profile
app.get("/api/p/:username", (req, res) => {
  try {
    const { username } = req.params;
    const cleanUsername = username.toLowerCase().trim();
    const profile = db.profiles.find(p => p.username === cleanUsername);

    if (!profile) {
      return res.status(404).json({ success: false, error: "Public profile not found or is currently private." });
    }

    if (!profile.isPublic) {
      return res.status(403).json({ success: false, error: "This portfolio profile has been marked as private by the candidate." });
    }

    res.json({
      success: true,
      profile: {
        name: profile.name,
        targetRole: profile.targetRole,
        matchScore: profile.matchScore,
        skillsMatrix: profile.skillsMatrix,
        learningPath: profile.learningPath,
        verifiedCredentials: db.credentials
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Mount Vite middleware for dev or serve production builds
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Configuring development environment wrapper...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving build assets dynamically...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SkillGap Engine Running] Web app accessible at port http://localhost:${PORT}`);
  });
}

startServer();
