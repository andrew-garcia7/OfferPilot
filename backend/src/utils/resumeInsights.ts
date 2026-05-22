import { ATSAnalysis } from "./atsScorer";
import { extractResumeSummary } from "./resumeSummary";

export interface InsightGroup {
  title: string;
  severity: "high" | "medium" | "low";
  items: string[];
}

export function buildInsights(text: string, analysis: ATSAnalysis, jdSkills: string[] = []): InsightGroup[] {
  const summary = extractResumeSummary(text);

  const groups: InsightGroup[] = [];

  // Missing sections — highest priority
  if (analysis.missingSections.length > 0) {
    groups.push({
      title: "Missing Sections",
      severity: "high",
      items: analysis.missingSections,
    });
  }

  // JD skill gaps (when JD is provided)
  if (jdSkills.length > 0) {
    const lowerText = text.toLowerCase();
    const missingJdSkills = jdSkills.filter(s => !lowerText.includes(s.toLowerCase()));
    if (missingJdSkills.length > 0) {
      groups.push({
        title: "Skills Missing for This Job",
        severity: "high",
        items: missingJdSkills.slice(0, 8).map(s => `Add "${s}" to your skills or experience bullets`),
      });
    }
  }

  // Keyword gaps from role inference
  if (analysis.keywordsNeeded.length > 0) {
    groups.push({
      title: "Missing Role Keywords",
      severity: "medium",
      items: analysis.keywordsNeeded.slice(0, 6).map(kw => `Incorporate keyword: "${kw}"`),
    });
  }

  // Contact & links
  const contactIssues: string[] = [];
  if (!summary.email) contactIssues.push("Add a professional email address to your header.");
  if (!summary.phone) contactIssues.push("Add a phone number with country code.");
  if (!summary.linkedin) contactIssues.push("Include your LinkedIn profile URL.");
  if (!summary.github) contactIssues.push("Add your GitHub profile link for technical credibility.");
  if (contactIssues.length > 0) {
    groups.push({ title: "Contact & Links", severity: "medium", items: contactIssues });
  }

  // Impact quantification
  const hasMetrics = /(\d+%|\d+x|\$[\d,]+|[0-9]+ (users|requests|ms|seconds|hours|days|clients))/i.test(text);
  if (!hasMetrics) {
    groups.push({
      title: "Add Measurable Impact",
      severity: "low",
      items: [
        "Quantify results: e.g., 'Reduced load time by 40%' or 'Served 10,000+ users'.",
        "Include performance improvements, accuracy gains, or revenue influenced.",
        "Use numbers, percentages, or scale metrics in every bullet point.",
      ],
    });
  }

  // Word count quality
  const wc = analysis.wordCount;
  if (wc < 300) {
    groups.push({
      title: "Resume Too Short",
      severity: "medium",
      items: [`Only ${wc} words detected. Expand experience and project bullets to 400-800 words.`],
    });
  } else if (wc > 1100) {
    groups.push({
      title: "Resume Too Long",
      severity: "low",
      items: [`${wc} words detected. Condense to 1 page / 400-800 words for most roles.`],
    });
  }

  return groups.filter(g => g.items.length > 0);
}
