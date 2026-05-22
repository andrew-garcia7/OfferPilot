export type ATSSeverity = "high" | "medium" | "low";

// Must match backend ScoreBreakdown field names exactly
export interface ATSBreakdown {
  skillsMatch: number;     // 0-25
  roleRelevance: number;   // 0-20
  experience: number;      // 0-20
  education: number;       // 0-15
  projectsLinks: number;   // 0-10
  lengthQuality: number;   // 0-5
  contactQuality: number;  // 0-5
}

/* ── New transparent scoring types ── */
export interface ScoreImprovement {
  action: string;
  impact: number;
  priority: "high" | "medium" | "low";
}

export interface ScoreCategory {
  score: number;
  max: number;
  why: string;
  improvements: ScoreImprovement[];
}

export interface ScoreBreakdownDetail {
  skillsMatch: ScoreCategory;
  experience: ScoreCategory;
  projects: ScoreCategory;
  education: ScoreCategory;
  formatting: ScoreCategory;
  keywords: ScoreCategory;
}

export interface ATSSectionStatus {
  hasSkills: boolean;
  hasExperience: boolean;
  hasEducation: boolean;
  hasProjects: boolean;
  hasContact: boolean;
  hasLinks: boolean;
}

export interface ResumeSummary {
  name: string;
  email: string;
  phone: string;
  github: string;
  linkedin: string;
  address: string;
}

export interface InsightGroup {
  title: string;
  severity: ATSSeverity;
  items: string[];
}

export interface JDAnalysis {
  requiredSkills: string[];
  keywords: string[];
  role: string;
}

export interface MatchResult {
  matchPercent: number;
  presentSkills: string[];
  missingSkills: string[];
  atsScore: number;
  breakdown: ATSBreakdown;
  breakdownDetail?: ScoreBreakdownDetail;
  improvements?: ScoreImprovement[];
  insights: InsightGroup[];
}

export interface ATSReport {
  success?: boolean;
  atsScore: number;
  filename?: string;
  text: string;
  summary: ResumeSummary;
  wordCount: number;
  detectedSkills: string[];
  missingSections: string[];
  suggestions: string[];
  sectionStatus: ATSSectionStatus;
  breakdown: ATSBreakdown;
  breakdownDetail?: ScoreBreakdownDetail;
  improvements?: ScoreImprovement[];
  keywordsNeeded: string[];
  insights: InsightGroup[];
  resumeId?: number;
}

export interface ExperienceItem {
  role: string;
  company: string;
  start: string;
  end: string;
  bullets: string[];
}

export interface EducationItem {
  school: string;
  degree: string;
  start: string;
  end: string;
  details: string;
}

export interface ProjectItem {
  name: string;
  link: string;
  description: string;
  bullets: string[];
}

export interface BuilderState {
  personal: {
    name: string;
    email: string;
    phone: string;
    location: string;
    headline: string;
    summary: string;
    linkedin: string;
    github: string;
  };
  skills: string[];
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
}

export interface ResumeDraftMeta {
  id?: number;
  title: string;
  payload: BuilderState;
  templateKey: string;
  atsScore?: number;
  updatedAt?: string;
}

export interface ResumeVersion {
  id: number;
  label: string;
  atsScore?: number;
  createdAt: string;
}
