// Deterministic ATS scoring — transparent, explainable, impact-driven

export interface SectionPresence {
  hasSkills: boolean;
  hasExperience: boolean;
  hasEducation: boolean;
  hasProjects: boolean;
  hasContact: boolean;
  hasLinks: boolean;
}

/**
 * Each category in the breakdown now includes:
 * - score / max
 * - why: human explanation of WHY they got this score
 * - improvements: specific actions + point gain
 */
export interface ScoreCategory {
  score: number;
  max: number;
  why: string;
  improvements: ScoreImprovement[];
}

export interface ScoreImprovement {
  action: string;   // e.g. "Add React, AWS, Docker to your Skills section"
  impact: number;   // e.g. +8
  priority: "high" | "medium" | "low";
}

// 6-category breakdown: skills(25) + experience(20) + projects(15) + education(10) + formatting(15) + keywords(15) = 100
export interface ScoreBreakdown {
  skillsMatch: number;      // 0–25
  roleRelevance: number;    // 0–20 (kept as "experience quality" alias for backend compat)
  experience: number;       // 0–20
  education: number;        // 0–15
  projectsLinks: number;    // 0–10
  lengthQuality: number;    // 0–5
  contactQuality: number;   // 0–5
}

export interface ScoreBreakdownDetail {
  skillsMatch: ScoreCategory;
  experience: ScoreCategory;
  projects: ScoreCategory;
  education: ScoreCategory;
  formatting: ScoreCategory;
  keywords: ScoreCategory;
}

export interface ATSAnalysis {
  score: number;
  breakdown: ScoreBreakdown;
  breakdownDetail: ScoreBreakdownDetail;
  improvements: ScoreImprovement[];  // top 6 improvements sorted by impact
  detectedSkills: string[];
  role: string;
  keywordsNeeded: string[];
  missingSections: string[];
  suggestions: string[];
  sections: SectionPresence;
  wordCount: number;
}

const TECHNICAL_KEYWORDS = [
  "javascript",
  "typescript",
  "python",
  "java",
  "react",
  "node",
  "express",
  "sql",
  "mongodb",
  "postgres",
  "aws",
  "docker",
  "kubernetes",
  "git",
  "graphql",
  "rest",
  "ci/cd",
  "testing",
  "jest",
  "cypress",
  "html",
  "css",
  "tailwind",
  "next",
  "vue",
  "angular",
  "data",
  "analytics",
  "ml",
  "machine learning",
  "pandas",
  "numpy",
  "spark",
  "cloud",
  "microservices",
  "design system",
  "api",
  "serverless",
];

const ROLE_KEYWORDS: Record<string, string[]> = {
  software_engineer: ["software engineer", "full stack", "backend", "frontend", "api", "system design", "scalable"],
  frontend_developer: ["frontend", "ui", "ux", "react", "typescript", "javascript", "css", "tailwind", "accessibility"],
  backend_developer: ["backend", "api", "microservices", "node", "express", "database", "sql", "scalability"],
  data_analyst: ["data analyst", "analytics", "sql", "python", "tableau", "dashboard", "insights", "visualization"],
  student: ["student", "intern", "fresher", "graduate", "college", "university", "bachelor"],
};

const SECTION_KEYWORDS = {
  skills: ["skills", "technical skills", "technologies", "tools", "expertise"],
  // EXPERIENCE = Internship | Work Experience | Professional Experience
  experience: [
    "experience",
    "work experience",
    "work history",
    "employment",
    "professional experience",
    "career",
    "internship",
    "internships",
  ],
  // EDUCATION = Education | Academic Background
  education: ["education", "academic background", "academic", "university", "college", "degree", "bachelor", "master"],
  // PROJECTS = Projects | Personal Projects
  projects: ["projects", "personal projects", "project experience", "open source", "portfolio"],
  links: ["github", "linkedin", "portfolio", "website"],
};

const EMAIL_REGEX = /[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}/i;
// Allow international prefixes like +91 as well as US-style formats
const PHONE_REGEX = /(\+?\d{1,4}[-.\s()]*)?((\d{3}[-.\s()]?\d{3}[-.\s()]?\d{4})|(\d{4}[-.\s()]?\d{3}[-.\s()]?\d{3}))/;
const GITHUB_REGEX = /github\.com\/[A-Za-z0-9_.-]+/i;
const LINKEDIN_REGEX = /linkedin\.com\/[A-Za-z0-9\-_/]+/i;

export function cleanResumeText(text: string): string {
  if (!text) return "";
  const stripped = text
    .replace(/%PDF[^\n]*/g, "")
    .replace(/obj\s+\d+/g, "")
    .replace(/endobj/g, "")
    .replace(/stream[\s\S]*?endstream/g, "")
    .replace(/xref[\s\S]*?trailer/g, "")
    .replace(/\/Type\s*\/[^\s]+/g, "")
    .replace(/\/Filter\s*\/[^\s]+/g, "")
    .replace(/\/Length\s+\d+/g, "")
    .replace(/[^\w\s@.\-+()/:,']/g, " ");

  return stripped
    .replace(/\r\n/g, "\n")
    .replace(/([a-z0-9,:;])\n(?!\n)/gi, "$1 ")
    .replace(/(\w)-\n(\w)/g, "$1$2")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function detectSkills(text: string): string[] {
  const lowerText = text.toLowerCase();
  const found = new Set<string>();

  for (const keyword of TECHNICAL_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      found.add(keyword);
    }
  }

  const skillsMatch = text.match(/(?:skills?|technologies?|tools?)[:\s]+([^\n]+)/i);
  if (skillsMatch) {
    const skillsText = skillsMatch[1];
    const skillsList = skillsText
      .split(/[,;|•\-\n]/)
      .map(s => s.trim())
      .filter(s => s.length > 1);
    skillsList.forEach(s => found.add(s.toLowerCase()));
  }

  return Array.from(found).slice(0, 30).map(s => s.replace(/\b\w/g, c => c.toUpperCase()));
}

function detectSections(text: string): SectionPresence {
  const lower = text.toLowerCase();

  const hasSkills = SECTION_KEYWORDS.skills.some(kw => lower.includes(kw));

  // EXPERIENCE: header keywords or lines mixing verbs, orgs and dates
  const hasExperienceHeader = SECTION_KEYWORDS.experience.some(kw => lower.includes(kw));
  const hasYearRange = /(?:20\d{2}|19\d{2}).{0,20}(present|current|20\d{2}|19\d{2})/i.test(text);
  const hasExperience = hasExperienceHeader || hasYearRange;

  // EDUCATION: header equivalents + degree keywords
  const hasEducationHeader = SECTION_KEYWORDS.education.some(kw => lower.includes(kw));
  const hasDegree = /\b(b\.?sc|b\.?tech|bachelor|master|m\.tech|b\.e\.|m\.e\.|degree)\b/i.test(text);
  const hasEducation = hasEducationHeader || hasDegree;

  // PROJECTS: header equivalents or lines starting with project-style labels
  const hasProjects =
    SECTION_KEYWORDS.projects.some(kw => lower.includes(kw)) ||
    /\b(project|hackathon|case study)\b/i.test(text);

  const hasContact = EMAIL_REGEX.test(text) || PHONE_REGEX.test(text);
  const hasLinks =
    GITHUB_REGEX.test(text) ||
    LINKEDIN_REGEX.test(text) ||
    SECTION_KEYWORDS.links.some(kw => lower.includes(kw));

  return { hasSkills, hasExperience, hasEducation, hasProjects, hasContact, hasLinks };
}

function inferRole(text: string): { role: string; matched: number; missingKeywords: string[] } {
  const lower = text.toLowerCase();
  let bestRole = "software_engineer";
  let bestScore = -1;
  let missing: string[] = [];

  for (const [role, keywords] of Object.entries(ROLE_KEYWORDS)) {
    const matches = keywords.filter(kw => lower.includes(kw)).length;
    if (matches > bestScore) {
      bestScore = matches;
      bestRole = role;
      missing = keywords.filter(kw => !lower.includes(kw)).slice(0, 6);
    }
  }

  return { role: bestRole, matched: bestScore, missingKeywords: missing };
}

function buildSuggestions(sections: SectionPresence, wordCount: number, missingKeywords: string[], detectedSkills: string[]): string[] {
  const suggestions: string[] = [];
  if (!sections.hasSkills) suggestions.push("Add a clearly titled Skills section with 8-15 targeted keywords.");
  if (!sections.hasExperience) suggestions.push("Include a Work Experience section with quantifiable bullet points.");
  if (!sections.hasEducation) suggestions.push("Add an Education section with degree and graduation year.");
  if (!sections.hasContact) suggestions.push("Add both email and phone number in the header for quick contact.");
  if (!sections.hasProjects) suggestions.push("Add 1-2 Projects with outcomes and links if available.");
  if (!sections.hasLinks) suggestions.push("Include LinkedIn and GitHub URLs for ATS parsers and recruiters.");

  if (wordCount < 320) suggestions.push("Expand impact statements; aim for 400-800 words for completeness.");
  else if (wordCount > 1100) suggestions.push("Condense wording; keep resume concise (400-800 words ideal).");

  const missingSkillCount = Math.max(0, 6 - detectedSkills.length);
  if (missingSkillCount > 0) {
    suggestions.push(`Add ~${missingSkillCount} more hard skills relevant to your target role.`);
  }

  if (missingKeywords.length) {
    suggestions.push(`Incorporate missing role keywords: ${missingKeywords.slice(0, 4).join(", ")}.`);
  }

  return Array.from(new Set(suggestions)).slice(0, 8);
}

/* ─────────────────────────────────────────────────────────────────
   NEW: transparent per-category scoring with explanations
───────────────────────────────────────────────────────────────── */

function scoreSkillsCategory(detected: string[], jdSkills: string[]): ScoreCategory {
  const MAX = 25;
  const improvements: ScoreImprovement[] = [];

  if (jdSkills.length > 0) {
    const lowerDetected = detected.map(s => s.toLowerCase());
    const missing = jdSkills.filter(s => !lowerDetected.some(d => d.includes(s.toLowerCase())));
    const present = jdSkills.filter(s => lowerDetected.some(d => d.includes(s.toLowerCase())));
    const ratio = present.length / jdSkills.length;
    const score = Math.round(ratio * MAX);

    if (missing.length > 0) {
      const top = missing.slice(0, 5);
      const gain = Math.round(((Math.min(3, missing.length) / jdSkills.length)) * MAX);
      improvements.push({
        action: `Add ${top.join(", ")} to your Skills section`,
        impact: Math.min(gain, MAX - score),
        priority: missing.length > 5 ? "high" : "medium",
      });
    }
    if (present.length < 5 && jdSkills.length > 0) {
      improvements.push({
        action: "Expand your Skills section to cover more JD requirements",
        impact: Math.min(8, MAX - score),
        priority: "high",
      });
    }

    return {
      score,
      max: MAX,
      why: score >= 20
        ? `You match ${present.length}/${jdSkills.length} JD skills — strong keyword alignment.`
        : score >= 12
        ? `You match ${present.length}/${jdSkills.length} JD skills. Add ${missing.slice(0, 3).join(", ")} to boost this.`
        : `Only ${present.length}/${jdSkills.length} JD skills detected. Recruiters scan for exact keywords.`,
      improvements,
    };
  }

  // No JD: score by raw count
  const count = detected.length;
  const score = count >= 15 ? 25 : count >= 10 ? 21 : count >= 7 ? 17 : count >= 4 ? 12 : count >= 2 ? 7 : count >= 1 ? 4 : 0;
  const needed = Math.max(0, 10 - count);
  if (needed > 0) {
    improvements.push({ action: `Add ${needed} more hard skills (e.g. frameworks, tools, languages)`, impact: Math.min(10, MAX - score), priority: "high" });
  }
  return {
    score,
    max: MAX,
    why: count >= 10
      ? `${count} skills detected — good breadth for ATS parsing.`
      : `Only ${count} skills detected. ATS systems scan for skill density. Add more.`,
    improvements,
  };
}

function scoreExperienceCategory(hasExperience: boolean, text: string): ScoreCategory {
  const MAX = 20;
  const improvements: ScoreImprovement[] = [];

  if (!hasExperience) {
    return {
      score: 0,
      max: MAX,
      why: "No Work Experience or Internship section detected. This is the #1 ATS signal.",
      improvements: [
        { action: "Add a Work Experience / Internship section", impact: 14, priority: "high" },
        { action: "Use bullet points with action verbs (Built, Designed, Reduced…)", impact: 4, priority: "high" },
        { action: "Include metrics: % improvement, users served, time saved", impact: 4, priority: "medium" },
      ],
    };
  }

  const bulletLines = text.split("\n").filter(l => /^[-•*]/.test(l.trim()));
  const hasMetrics = /(\d+%|\d+x|\$[\d,]+|\d+\s*(users|requests|ms|seconds|minutes|hours|clients|transactions|revenue))/i.test(text);
  const hasActionVerbs = /\b(built|designed|developed|led|improved|reduced|increased|launched|created|automated|optimized|managed|delivered|shipped)\b/i.test(text);

  let score = 0;
  if (bulletLines.length >= 6 && hasMetrics) score = 20;
  else if (bulletLines.length >= 6) score = 17;
  else if (bulletLines.length >= 3) score = 13;
  else score = 9;

  const why = hasMetrics
    ? `Experience section detected with ${bulletLines.length} bullet points and measurable metrics — recruiters love this.`
    : `Experience detected but ${bulletLines.length === 0 ? "no bullet points found" : "missing measurable metrics"}. Numbers = credibility.`;

  if (!hasMetrics) improvements.push({ action: "Add measurable metrics to bullets (e.g. 'reduced load time by 40%')", impact: 5, priority: "high" });
  if (!hasActionVerbs) improvements.push({ action: "Start bullets with strong action verbs (Built, Launched, Reduced…)", impact: 3, priority: "medium" });
  if (bulletLines.length < 4) improvements.push({ action: "Add 4-6 strong bullet points per role", impact: 4, priority: "high" });

  return { score, max: MAX, why, improvements };
}

function scoreProjectsCategory(hasProjects: boolean, hasLinks: boolean, text: string): ScoreCategory {
  const MAX = 15;
  const improvements: ScoreImprovement[] = [];

  let score = 0;
  if (hasProjects) {
    const projectLines = text.split("\n").filter(l => /project|hackathon|case study/i.test(l));
    score += projectLines.length >= 3 ? 8 : 5;
  }
  if (hasLinks) score += 4;
  if (/github\.com/i.test(text)) score += 3;
  score = Math.min(MAX, score);

  const why = !hasProjects
    ? "No Projects section found. Projects demonstrate real-world skills to ATS and recruiters."
    : !hasLinks
    ? "Projects found but no GitHub/portfolio links. Links let recruiters verify your work."
    : `Projects and links detected — good signal for technical roles.`;

  if (!hasProjects) improvements.push({ action: "Add a Projects section with 2-3 personal or open-source projects", impact: 8, priority: "high" });
  if (!hasLinks) improvements.push({ action: "Add GitHub profile and project repository links", impact: 4, priority: "medium" });
  if (hasProjects && !/\b(deployed|live|production|demo)\b/i.test(text)) {
    improvements.push({ action: "Mention if projects are live/deployed (e.g. 'Deployed on Vercel')", impact: 2, priority: "low" });
  }

  return { score, max: MAX, why, improvements };
}

function scoreEducationCategory(hasEducation: boolean, text: string): ScoreCategory {
  const MAX = 10;
  const improvements: ScoreImprovement[] = [];

  if (!hasEducation) {
    return {
      score: 0,
      max: MAX,
      why: "No Education section detected. Required by most ATS systems to pass initial screening.",
      improvements: [
        { action: "Add Education section with degree, school, and graduation year", impact: 8, priority: "high" },
        { action: "Include GPA or percentage if above 7.5 CGPA / 75%", impact: 2, priority: "medium" },
      ],
    };
  }

  const hasGpa = /\b(CGPA|GPA|percentage|%)/i.test(text);
  const hasYear = /\b(20\d{2}|19\d{2})\b/.test(text);
  let score = hasGpa && hasYear ? 10 : hasGpa || hasYear ? 8 : 6;

  if (!hasGpa) improvements.push({ action: "Add GPA/CGPA if ≥ 7.5 (strengthens academic signal)", impact: 2, priority: "low" });
  if (!hasYear) improvements.push({ action: "Add graduation year to your degree entry", impact: 2, priority: "medium" });

  return {
    score,
    max: MAX,
    why: hasGpa
      ? "Education with GPA detected — good for early-career and academic roles."
      : "Education section detected. Adding GPA and clear graduation year improves parsing.",
    improvements,
  };
}

function scoreFormattingCategory(sections: SectionPresence, wordCount: number, text: string): ScoreCategory {
  const MAX = 15;
  const improvements: ScoreImprovement[] = [];

  let score = 0;

  // Contact completeness
  const hasEmail = EMAIL_REGEX.test(text);
  const hasPhone = PHONE_REGEX.test(text);
  const hasLinkedIn = LINKEDIN_REGEX.test(text);
  const hasGithub = GITHUB_REGEX.test(text);

  if (hasEmail) score += 3;
  if (hasPhone) score += 2;
  if (hasLinkedIn) score += 3;
  if (hasGithub) score += 2;

  // Word count appropriateness
  if (wordCount >= 300 && wordCount <= 900) score += 3;
  else if (wordCount >= 200 && wordCount < 300) score += 1;

  // Section presence bonus
  const sectionCount = [sections.hasSkills, sections.hasExperience, sections.hasEducation, sections.hasProjects].filter(Boolean).length;
  if (sectionCount >= 4) score += 2;

  score = Math.min(MAX, score);

  if (!hasEmail) improvements.push({ action: "Add your email address in the header", impact: 3, priority: "high" });
  if (!hasPhone) improvements.push({ action: "Add a phone number to the header", impact: 2, priority: "high" });
  if (!hasLinkedIn) improvements.push({ action: "Add your LinkedIn profile URL", impact: 3, priority: "medium" });
  if (!hasGithub) improvements.push({ action: "Add your GitHub profile URL", impact: 2, priority: "medium" });
  if (wordCount < 300) improvements.push({ action: "Expand your resume — aim for 350-700 words", impact: 3, priority: "medium" });
  if (wordCount > 900) improvements.push({ action: "Condense your resume — keep it under 700 words", impact: 2, priority: "low" });

  const why = score >= 12
    ? "Strong formatting: contact details, links, and good length detected."
    : score >= 8
    ? "Formatting is decent but missing some contact details or links."
    : "Weak formatting — missing contact info, links, or proper structure.";

  return { score, max: MAX, why, improvements };
}

function scoreKeywordsCategory(detectedSkills: string[], jdSkills: string[], text: string, role: string): ScoreCategory {
  const MAX = 10;
  const improvements: ScoreImprovement[] = [];
  const lowerText = text.toLowerCase();

  if (jdSkills.length > 0) {
    const present = jdSkills.filter(s => lowerText.includes(s.toLowerCase()));
    const missing = jdSkills.filter(s => !lowerText.includes(s.toLowerCase()));
    const ratio = present.length / jdSkills.length;
    const score = Math.round(ratio * MAX);

    if (missing.length > 0) {
      improvements.push({
        action: `Add missing JD keywords: ${missing.slice(0, 4).join(", ")}`,
        impact: Math.min(6, MAX - score),
        priority: "high",
      });
    }

    return {
      score,
      max: MAX,
      why: present.length === jdSkills.length
        ? "All JD keywords found in resume — excellent keyword match."
        : `${present.length}/${jdSkills.length} JD keywords matched. Missing: ${missing.slice(0, 3).join(", ")}.`,
      improvements,
    };
  }

  // No JD: use role keywords
  const roleKeys = ROLE_KEYWORDS[role] || ROLE_KEYWORDS.software_engineer;
  const matched = roleKeys.filter(kw => lowerText.includes(kw));
  const missing = roleKeys.filter(kw => !lowerText.includes(kw));
  const score = Math.round((matched.length / roleKeys.length) * MAX);

  if (missing.length > 0) {
    improvements.push({
      action: `Add role-specific keywords: ${missing.slice(0, 4).join(", ")}`,
      impact: Math.min(5, MAX - score),
      priority: "medium",
    });
  }
  improvements.push({
    action: "Upload a Job Description to get exact keyword gap analysis",
    impact: 0,
    priority: "low",
  });

  return {
    score,
    max: MAX,
    why: score >= 7
      ? `Good keyword alignment with ${role.replace(/_/g, " ")} roles.`
      : `Low keyword alignment — paste a Job Description for exact match analysis.`,
    improvements,
  };
}

export function analyzeATS(text: string, jdSkills: string[] = []): ATSAnalysis {
  const cleanedText = cleanResumeText(text);
  const wordCount = cleanedText ? cleanedText.split(/\s+/).length : 0;

  const emptyBreakdown: ScoreBreakdown = {
    skillsMatch: 0, roleRelevance: 0, experience: 0,
    education: 0, projectsLinks: 0, lengthQuality: 0, contactQuality: 0,
  };

  if (!cleanedText || cleanedText.length < 50) {
    const emptyDetail: ScoreBreakdownDetail = {
      skillsMatch: { score: 0, max: 25, why: "No resume text extracted.", improvements: [] },
      experience: { score: 0, max: 20, why: "No resume text extracted.", improvements: [] },
      projects: { score: 0, max: 15, why: "No resume text extracted.", improvements: [] },
      education: { score: 0, max: 10, why: "No resume text extracted.", improvements: [] },
      formatting: { score: 0, max: 15, why: "No resume text extracted.", improvements: [] },
      keywords: { score: 0, max: 10, why: "No resume text extracted.", improvements: [] },
    };
    return {
      score: 0, breakdown: emptyBreakdown, breakdownDetail: emptyDetail, improvements: [],
      detectedSkills: [], role: "software_engineer", keywordsNeeded: [],
      missingSections: ["Skills", "Experience", "Education", "Contact Info"],
      suggestions: ["Resume text could not be extracted cleanly. Try re-exporting as PDF or DOCX."],
      sections: { hasSkills: false, hasExperience: false, hasEducation: false, hasProjects: false, hasContact: false, hasLinks: false },
      wordCount,
    };
  }

  const sections = detectSections(cleanedText);
  const detectedSkills = detectSkills(cleanedText);
  const { role, matched, missingKeywords } = inferRole(cleanedText);

  // Compute all 6 transparent categories
  const skillsCat = scoreSkillsCategory(detectedSkills, jdSkills);
  const expCat = scoreExperienceCategory(sections.hasExperience, cleanedText);
  const projCat = scoreProjectsCategory(sections.hasProjects, sections.hasLinks, cleanedText);
  const eduCat = scoreEducationCategory(sections.hasEducation, cleanedText);
  const fmtCat = scoreFormattingCategory(sections, wordCount, cleanedText);
  const kwCat = scoreKeywordsCategory(detectedSkills, jdSkills, cleanedText, role);

  // Map to legacy breakdown (for backward compat with existing frontend)
  // New total = 25+20+15+10+15+10 = 95 → normalize to 100
  const rawTotal = skillsCat.score + expCat.score + projCat.score + eduCat.score + fmtCat.score + kwCat.score;
  const maxPossible = 25 + 20 + 15 + 10 + 15 + 10; // 95

  const breakdown: ScoreBreakdown = {
    skillsMatch: skillsCat.score,
    roleRelevance: kwCat.score * 2,         // scale kw(0-10) → 0-20 for legacy radar
    experience: expCat.score,
    education: eduCat.score,
    projectsLinks: projCat.score,
    lengthQuality: Math.round((fmtCat.score / 15) * 5),
    contactQuality: Math.round((fmtCat.score / 15) * 5),
  };

  const breakdownDetail: ScoreBreakdownDetail = {
    skillsMatch: skillsCat,
    experience: expCat,
    projects: projCat,
    education: eduCat,
    formatting: fmtCat,
    keywords: kwCat,
  };

  // Collect and sort all improvements by impact
  const allImprovements: ScoreImprovement[] = [
    ...skillsCat.improvements,
    ...expCat.improvements,
    ...projCat.improvements,
    ...eduCat.improvements,
    ...fmtCat.improvements,
    ...kwCat.improvements,
  ]
    .filter(i => i.impact > 0)
    .sort((a, b) => {
      const pa = a.priority === "high" ? 3 : a.priority === "medium" ? 2 : 1;
      const pb = b.priority === "high" ? 3 : b.priority === "medium" ? 2 : 1;
      return pb - pa || b.impact - a.impact;
    })
    .slice(0, 7);

  const totalScore = Math.round((rawTotal / maxPossible) * 100 * 10) / 10;

  const missingSections: string[] = [];
  if (!sections.hasSkills) missingSections.push("Skills");
  if (!sections.hasExperience) missingSections.push("Experience / Internship");
  if (!sections.hasEducation) missingSections.push("Education / Academic Background");
  if (!sections.hasProjects) missingSections.push("Projects");
  if (!sections.hasContact) missingSections.push("Contact Details");
  if (!sections.hasLinks) missingSections.push("Links (GitHub / LinkedIn)");

  const suggestions = buildSuggestions(sections, wordCount, missingKeywords, detectedSkills);

  return {
    score: Math.min(100, totalScore),
    breakdown,
    breakdownDetail,
    improvements: allImprovements,
    detectedSkills,
    role,
    keywordsNeeded: missingKeywords,
    missingSections,
    suggestions,
    sections,
    wordCount,
  };
}
