/* =====================================================
   RESUME SUMMARY — FINAL STABLE VERSION
   RULES:
   - Input text ALREADY normalized by resumeParser
   - cleanResumeText() YAHAN USE NAHI HOTA
===================================================== */

export interface ResumeSummary {
  name: string;
  email: string;
  phone: string;
  github: string;
  linkedin: string;
  address: string;
}

/* ================================
   REGEX
================================ */
const EMAIL_REGEX = /[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}/i;
const GITHUB_REGEX = /https?:\/\/(www\.)?github\.com\/[A-Za-z0-9_.-]+/i;
const LINKEDIN_REGEX = /https?:\/\/(www\.)?linkedin\.com\/[A-Za-z0-9\-_/]+/i;

/* ================================
   PHONE (International)
================================ */
const HEADER_LINES = 10;

// Matches international formats: +1-800-555-1234, +91 98765 43210, (555) 867-5309, etc.
const PHONE_REGEX = /(\+?\d{1,3}[\s\-.]?)?([\s\-.]?\(?\d{2,4}\)?[\s\-.]?\d{3,4}[\s\-.]?\d{3,4})/g;

function extractPhone(text: string): string {
  if (!text) return "";
  const matches = text.match(PHONE_REGEX) ?? [];
  // Prefer longer matches (more likely to be real phone numbers)
  const cleaned = matches
    .map(m => m.trim())
    .filter(m => m.replace(/\D/g, "").length >= 7)
    .sort((a, b) => b.length - a.length);
  return cleaned[0] ?? "";
}

/* ================================
   NAME (STRICT HUMAN)
================================ */
function detectName(lines: string[]): string {
  for (const line of lines.slice(0, HEADER_LINES)) {
    if (
      /^[A-Z][a-z]+(\s[A-Z][a-z]+)+$/.test(line) &&
      !/\d/.test(line)
    ) {
      return line;
    }
  }
  return "";
}

/* ================================
   LOCATION (OPTIONAL)
================================ */
function detectLocation(lines: string[]): string {
  for (const line of lines.slice(0, 15)) {
    if (/[A-Za-z]+,\s*[A-Za-z]+/.test(line)) {
      return line;
    }
  }
  return "";
}

/* ================================
   MAIN EXPORT
================================ */
export function extractResumeSummary(text: string): ResumeSummary {
  const lines = text
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  return {
    name: detectName(lines),
    email: text.match(EMAIL_REGEX)?.[0] ?? "",
    phone: extractPhone(lines.slice(0, HEADER_LINES).join(" ")),
    github: text.match(GITHUB_REGEX)?.[0] ?? "",
    linkedin: text.match(LINKEDIN_REGEX)?.[0] ?? "",
    address: detectLocation(lines),
  };
}
