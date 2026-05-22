// src/utils/answerEvaluator.ts
// Offline relevance-aware evaluator (0-10 score)

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "he", "in", "is", "it", "its", "of", "on", "or", "that", "the", "to", "was", "were", "will", "with", "what", "why", "how", "when", "where", "which", "who", "your", "you", "i", "we", "they", "them", "this", "these", "those", "can", "could", "should", "would", "do", "does", "did", "if", "than", "then", "about",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export async function evaluateAnswer(
  questionText: string,
  userAnswer: string,
  expectedDifficulty = "medium"
): Promise<{ score: number; feedback: string }> {
  const answerRaw = (userAnswer || "").trim();
  const answer = answerRaw.toLowerCase();

  if (answerRaw.length < 8) {
    return {
      score: 1,
      feedback: "Answer is too short. Add your approach and key points.",
    };
  }

  if (answer.includes("i don't know") || answer.includes("idk") || answer.includes("not sure")) {
    return {
      score: 2,
      feedback: "You can still score better by sharing a partial approach, assumptions, or related concept.",
    };
  }

  const qTokens = Array.from(new Set(tokenize(questionText)));
  const aTokens = tokenize(answerRaw);
  const aTokenSet = new Set(aTokens);

  const matchedKeywords = qTokens.filter((t) => aTokenSet.has(t)).length;
  const keywordCoverage = qTokens.length ? matchedKeywords / qTokens.length : 0;

  const lengthScore =
    answerRaw.length < 40 ? 0.8 :
    answerRaw.length < 100 ? 1.8 :
    answerRaw.length < 220 ? 2.6 : 3.0;

  const relevanceScore = keywordCoverage * 4.0;

  const structureSignals = ["because", "therefore", "for example", "for instance", "edge case", "tradeoff", "first", "second", "finally", "in short"];
  const structureHits = structureSignals.reduce((acc, phrase) => acc + (answer.includes(phrase) ? 1 : 0), 0);
  const structureScore = clamp(structureHits * 0.35, 0, 1.6);

  const difficultyBoost = expectedDifficulty === "senior" ? 0.25 : expectedDifficulty === "junior" ? -0.1 : 0;

  let rawScore = 1.0 + lengthScore + relevanceScore + structureScore + difficultyBoost;

  const offTopicPenalty = keywordCoverage < 0.15 ? 1.5 : 0;
  const repetitivePenalty = aTokens.length > 0 && new Set(aTokens).size / aTokens.length < 0.35 ? 0.6 : 0;

  rawScore -= offTopicPenalty + repetitivePenalty;

  const score = clamp(Math.round(rawScore), 1, 10);

  let feedback: string;
  if (score <= 3) {
    feedback = "Low relevance. Answer the exact question keywords and explain your approach step-by-step.";
  } else if (score <= 5) {
    feedback = "Partially relevant answer. Add clearer core concepts and one concrete example.";
  } else if (score <= 7) {
    feedback = "Good base answer. Improve with edge cases, trade-offs, and practical implementation details.";
  } else if (score <= 9) {
    feedback = "Strong and relevant answer. Add sharper structure and concise summary for top score.";
  } else {
    feedback = "Excellent, highly relevant and well-structured answer with strong depth.";
  }

  return { score, feedback };
}
