import fs from "fs";
import path from "path";
import pdf from "pdf-parse";
import mammoth from "mammoth";
import { htmlToText } from "html-to-text";

type FileKind = "pdf" | "docx" | "txt";

function detectFileKind(filePath: string): FileKind {
  const ext = path.extname(filePath || "").toLowerCase();
  if (ext === ".pdf") return "pdf";
  if (ext === ".docx") return "docx";
  return "txt";
}

/**
 * REMOVE PDF INTERNAL GARBAGE (critical)
 */
function hardPdfClean(text: string): string {
  return text
    .replace(/%PDF[\s\S]*?endstream/gi, " ")
    .replace(/endobj|xref|trailer|startxref/gi, " ")
    .replace(/\b(obj|kids|ref|stream)\b/gi, " ")
    .replace(/\/[A-Za-z0-9#]+/g, " ")
    .replace(/[^\w@\n.+\-:/ ]/g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

/**
 * COLUMN → LINE NORMALIZATION
 */
function normalizeLayout(text: string): string {
  return text
    .replace(/\s*\|\s*/g, "\n")
    .replace(/[•\u2022]/g, "\n- ")
    .replace(/(\S) {2,}(\S)/g, "$1\n$2")
    .replace(
      /(?:^|\n)\s*(Email|Phone|LinkedIn|GitHub|Contact)\s*[:\-]/gi,
      "\n$1: "
    )
    .trim();
}

export async function extractResumeText(filePath: string): Promise<string> {
  try {
    const buffer = fs.readFileSync(filePath);
    const kind = detectFileKind(filePath);

    if (kind === "pdf") {
      const parsed = await pdf(buffer);
      return normalizeLayout(hardPdfClean(parsed.text || ""));
    }

    if (kind === "docx") {
      const raw = await mammoth.extractRawText({ buffer });
      return normalizeLayout(raw.value || "");
    }

    return normalizeLayout(buffer.toString("utf-8"));
  } catch (err) {
    console.error("resumeParser error:", err);
    return "";
  }
}
