export interface Experience {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  gradDate: string;
}

export interface Project {
  id: string;
  name: string;
  url: string;
  description: string;
}

export interface Reference {
  id: string;
  name: string;
  company: string;
  title: string;
  email: string;
  phone: string;
}

export interface UserData {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  targetRole: string;
  customTargetRole: string;
  technicalSkills: string[];
  softSkills: string[];
  experience: Experience[];
  education: Education[];
  projects: Project[];
  references: Reference[];
  signature?: string;
}

export interface AiSuggestion {
  skills: string[];
  experience: string[];
  certifications: string[];
  projects: string[];
}

export interface Company {
  name: string;
  domain: string;
}

export interface CareerStep {
  role: string;
  description: string;
  skillsToDevelop: string[];
  companies: Company[];
}

export interface AiResult {
  score: number;
  summary: string;
  suggestions: AiSuggestion;
  careerRoadmap: CareerStep[];
  generatedResume: string;
}

export interface ConversationTurn {
  speaker: 'user' | 'ai';
  text: string;
}

export interface InterviewFeedback {
  overallScore: number;
  overallSummary: string;
  answerAnalysis: {
    question: string;
    answer: string;
    feedback: string;
  }[];
}