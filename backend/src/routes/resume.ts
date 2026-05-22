import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import OpenAI from "openai";

import { prisma } from "../db";
import { extractResumeText } from "../utils/resumeParser";
import { analyzeATS } from "../utils/atsScorer";
import { buildInsights } from "../utils/resumeInsights";
import { extractResumeSummary } from "../utils/resumeSummary";

const router = Router();

/* ===============================
   UPLOAD CONFIG
================================ */
const uploadsDir = path.join(process.cwd(), "src", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  dest: uploadsDir,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".pdf", ".docx", ".txt"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOCX, and TXT files are accepted."));
    }
  },
});

/* ===============================
   OPENAI CLIENT (lazy init)
================================ */
function getOpenAI(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

/* ===============================
   UPLOAD & ANALYZE RESUME
================================ */
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    const resumeText = await extractResumeText(req.file.path);
    const jdSkills: string[] = req.body.jdSkills
      ? JSON.parse(req.body.jdSkills)
      : [];

    const atsAnalysis = analyzeATS(resumeText, jdSkills);
    const summary = extractResumeSummary(resumeText);
    const insights = buildInsights(resumeText, atsAnalysis, jdSkills);

    const resume = await prisma.resume.create({
      data: {
        filename: req.file.originalname || req.file.filename,
        text: resumeText,
        atsScore: atsAnalysis.score,
      },
    });

    return res.json({
      success: true,
      resumeId: resume.id,
      filename: resume.filename,
      text: resumeText,
      wordCount: atsAnalysis.wordCount,
      summary,
      atsScore: atsAnalysis.score,
      detectedSkills: atsAnalysis.detectedSkills,
      missingSections: atsAnalysis.missingSections,
      suggestions: atsAnalysis.suggestions,
      sectionStatus: atsAnalysis.sections,
      breakdown: atsAnalysis.breakdown,
      keywordsNeeded: atsAnalysis.keywordsNeeded,
      insights,
    });
  } catch (err: any) {
    console.error("RESUME UPLOAD ERROR:", err);
    return res.status(500).json({ success: false, error: err.message || "Resume upload failed" });
  }
});

/* ===============================
   ANALYZE RAW TEXT
================================ */
router.post("/analyze-text", async (req, res) => {
  try {
    const { text, jdSkills } = req.body || {};

    if (!text || typeof text !== "string" || text.trim().length < 10) {
      return res.status(400).json({ success: false, error: "Provide valid resume text to analyze." });
    }

    const skills: string[] = Array.isArray(jdSkills) ? jdSkills : [];
    const atsAnalysis = analyzeATS(text, skills);
    const summary = extractResumeSummary(text);
    const insights = buildInsights(text, atsAnalysis, skills);

    return res.json({
      success: true,
      text,
      wordCount: atsAnalysis.wordCount,
      summary,
      atsScore: atsAnalysis.score,
      detectedSkills: atsAnalysis.detectedSkills,
      missingSections: atsAnalysis.missingSections,
      suggestions: atsAnalysis.suggestions,
      sectionStatus: atsAnalysis.sections,
      breakdown: atsAnalysis.breakdown,
      keywordsNeeded: atsAnalysis.keywordsNeeded,
      insights,
    });
  } catch (err: any) {
    console.error("RESUME ANALYZE TEXT ERROR:", err);
    return res.status(500).json({ success: false, error: err.message || "Text analysis failed" });
  }
});

/* ===============================
   ANALYZE JOB DESCRIPTION
================================ */
router.post("/analyze-jd", async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text || typeof text !== "string" || text.trim().length < 20) {
      return res.status(400).json({ success: false, error: "Provide a valid job description." });
    }

    const openai = getOpenAI();

    let requiredSkills: string[] = [];
    let keywords: string[] = [];
    let role = "";

    if (openai) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a technical recruiter expert. Extract structured information from job descriptions.",
            },
            {
              role: "user",
              content: `Extract from this job description:
1. requiredSkills: array of specific technical skills (max 15)
2. keywords: array of important role/domain keywords (max 10)
3. role: inferred job title (1-3 words)

Job Description:
${text.slice(0, 3000)}

Return ONLY valid JSON: {"requiredSkills": [...], "keywords": [...], "role": "..."}`,
            },
          ],
          max_tokens: 400,
          temperature: 0,
        });

        const rawJson = completion.choices[0]?.message?.content?.trim() ?? "{}";
        const parsed = JSON.parse(rawJson.replace(/```json|```/g, "").trim());
        requiredSkills = parsed.requiredSkills ?? [];
        keywords = parsed.keywords ?? [];
        role = parsed.role ?? "";
      } catch {
        // fall through to regex
      }
    }

    // Regex fallback
    if (requiredSkills.length === 0) {
      const techPattern =
        /\b(react|vue|angular|node|express|python|java|typescript|javascript|golang|rust|kubernetes|docker|aws|gcp|azure|sql|postgres|mongodb|redis|graphql|rest|git|ci\/cd|jenkins|terraform|next\.?js|fastapi|django|spring|kafka|rabbitmq)\b/gi;
      const matches = text.match(techPattern) ?? [];
      requiredSkills = [...new Set(matches.map(m => m.toLowerCase()))].slice(0, 15);
      const lines = text.split("\n").filter(l => l.trim().length > 10);
      const roleMatch = lines[0]?.match(/^([A-Z][^.|]{3,50})/)?.[1]?.trim() ?? "Software Engineer";
      role = roleMatch;
      keywords = requiredSkills.slice(0, 10);
    }

    return res.json({ success: true, requiredSkills, keywords, role });
  } catch (err: any) {
    console.error("JD ANALYZE ERROR:", err);
    return res.status(500).json({ success: false, error: err.message || "JD analysis failed" });
  }
});

/* ===============================
   MATCH RESUME VS JD
================================ */
router.post("/match", async (req, res) => {
  try {
    const { resumeText, jdSkills } = req.body || {};

    if (!resumeText || !Array.isArray(jdSkills)) {
      return res.status(400).json({ success: false, error: "resumeText and jdSkills are required." });
    }

    const lowerResume = (resumeText as string).toLowerCase();
    const present = (jdSkills as string[]).filter(s => lowerResume.includes(s.toLowerCase()));
    const missing = (jdSkills as string[]).filter(s => !lowerResume.includes(s.toLowerCase()));
    const matchPct = jdSkills.length > 0 ? Math.round((present.length / jdSkills.length) * 100) : 0;

    const atsAnalysis = analyzeATS(resumeText, jdSkills);
    const insights = buildInsights(resumeText, atsAnalysis, jdSkills);

    return res.json({
      success: true,
      matchPercent: matchPct,
      presentSkills: present,
      missingSkills: missing,
      atsScore: atsAnalysis.score,
      breakdown: atsAnalysis.breakdown,
      insights,
    });
  } catch (err: any) {
    console.error("RESUME MATCH ERROR:", err);
    return res.status(500).json({ success: false, error: err.message || "Match failed" });
  }
});

/* ===============================
   AI BULLET REWRITER
================================ */
router.post("/rewrite-bullet", async (req, res) => {
  try {
    const { bullet, context } = req.body || {};
    if (!bullet || typeof bullet !== "string" || bullet.trim().length < 3) {
      return res.status(400).json({ success: false, error: "bullet text is required." });
    }

    const openai = getOpenAI();

    if (!openai) {
      const actionVerbs = ["Engineered", "Architected", "Optimized", "Delivered", "Implemented", "Reduced", "Increased", "Automated"];
      const verb = actionVerbs[Math.floor(Math.random() * actionVerbs.length)];
      const stripped = bullet.replace(/^(worked on|was responsible for|helped|assisted with|did|made)\s*/i, "");
      return res.json({
        success: true,
        original: bullet,
        rewritten: `${verb} ${stripped.charAt(0).toLowerCase()}${stripped.slice(1)}`,
        aiUsed: false,
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a professional resume writer for FAANG and top tech companies. Rewrite resume bullets to be impactful, quantified, and ATS-optimized. Use strong action verbs. Return ONLY the rewritten bullet, no commentary.",
        },
        {
          role: "user",
          content: `Rewrite this resume bullet point to be stronger and more impactful:\n\n"${bullet}"${context ? `\n\nContext: ${context}` : ""}`,
        },
      ],
      max_tokens: 150,
      temperature: 0.4,
    });

    const rewritten = completion.choices[0]?.message?.content?.trim() ?? bullet;
    return res.json({ success: true, original: bullet, rewritten, aiUsed: true });
  } catch (err: any) {
    console.error("REWRITE BULLET ERROR:", err);
    return res.status(500).json({ success: false, error: err.message || "Rewrite failed" });
  }
});

/* ===============================
   AI SUMMARY GENERATOR
================================ */
router.post("/generate-summary", async (req, res) => {
  try {
    const { experience, skills, targetRole } = req.body || {};

    if (!skills) {
      return res.status(400).json({ success: false, error: "skills are required." });
    }

    const openai = getOpenAI();
    const skillList = Array.isArray(skills) ? skills.join(", ") : skills;

    if (!openai) {
      return res.json({
        success: true,
        summary: `Results-driven ${targetRole || "software engineer"} with expertise in ${skillList}. Proven track record of delivering high-quality software solutions with a focus on performance, scalability, and reliability.`,
        aiUsed: false,
      });
    }

    const experienceSummary = Array.isArray(experience)
      ? experience.map((e: any) => `${e.role} at ${e.company} (${e.start}–${e.end}): ${(e.bullets ?? []).join("; ")}`).join("\n")
      : (experience ?? "");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a professional resume writer. Write a concise 2-3 sentence professional summary for a resume. It should be impactful, ATS-optimized, and free of first-person pronouns. Return ONLY the summary text.",
        },
        {
          role: "user",
          content: `Write a professional summary for a ${targetRole || "software engineer"} with:\n\nExperience:\n${experienceSummary}\n\nKey skills: ${skillList}`,
        },
      ],
      max_tokens: 200,
      temperature: 0.5,
    });

    const summary = completion.choices[0]?.message?.content?.trim() ?? "";
    return res.json({ success: true, summary, aiUsed: true });
  } catch (err: any) {
    console.error("GENERATE SUMMARY ERROR:", err);
    return res.status(500).json({ success: false, error: err.message || "Summary generation failed" });
  }
});

export default router;
