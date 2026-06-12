/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SkillGapItem {
  skillName: string;
  resumeLevel: number; // 0 - 5
  targetLevel: number; // 0 - 5
  description: string;
}

export interface LearningStep {
  id: string;
  title: string;
  provider: string; // e.g. "Coursera", "Udemy", "YouTube", "edX"
  duration: string; // e.g. "6 hours", "3 weeks"
  cost: string; // e.g. "Free", "$29", "Subscription"
  url: string;
  description: string;
  completed: boolean;
}

export interface LearningPath {
  id: string;
  userId: string;
  targetRole: string;
  baseMatchScore: number;
  currentMatchScore: number;
  steps: LearningStep[];
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  rawResumeText: string;
  skills: string[];
}

export interface Credential {
  id: string;
  userId: string;
  courseTitle: string;
  provider: string;
  verifiedAt: string;
  txHash?: string; // Mock verification signature for Vercel/Web3 style
  learningStepId?: string;
}

export interface JobBenchmark {
  roleTitle: string;
  category: string;
  requiredSkills: string[];
  description: string;
  marketDemand: "High" | "Medium" | "Very High";
  salaryRange: string;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  skillFocused: string;
}

export interface InterviewFeedback {
  score: number;
  suggestions: string;
  comparisonWithGaps: string;
}

export interface PublicProfile {
  username: string;
  isPublic: boolean;
  name: string;
  targetRole: string;
  matchScore: number;
  skillsMatrix: SkillGapItem[];
  verifiedCredentials: Credential[];
}

export interface AnalysisResponse {
  success: boolean;
  matchScore: number;
  roleTitle: string;
  skillsMatrix: SkillGapItem[];
  learningPath: LearningPath;
}
