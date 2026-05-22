// src/utils/questionPlanner.ts
// Fallback question planner (NO API KEY REQUIRED)

type QuestionBank = Record<string, Record<string, string[]>>;

// =====================
// QUESTION BANK
// =====================
const QUESTION_BANK: QuestionBank = {
  technical: {
    junior: [
      "What is JavaScript?",
      "Explain var, let and const.",
      "What is hoisting?",
      "What is a closure?",
      "What is the DOM?",
      "Difference between == and ===",
      "What are callbacks?"
    ],
    medium: [
      "Explain event loop in JavaScript.",
      "What are promises?",
      "Explain async/await.",
      "What is prototypal inheritance?",
      "Explain call, apply, bind.",
      "What is debouncing?",
      "What is throttling?"
    ],
    senior: [
      "Explain JavaScript engine internals.",
      "How does garbage collection work?",
      "Explain memory leaks.",
      "Design a scalable frontend architecture.",
      "How does browser rendering work?"
    ]
  },

  hr: {
    junior: [
      "Tell me about yourself.",
      "What are your strengths?",
      "Why should we hire you?"
    ],
    senior: [
      "How do you handle conflict in a team?",
      "Describe a leadership challenge you faced.",
      "How do you mentor juniors?"
    ]
  }
};

// =====================
// SHUFFLE HELPER (Fisher-Yates)
// =====================
function shuffle<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// =====================
// MAIN EXPORT FUNCTION
// =====================
export async function generateQuestionPlan(
  category: string,
  level: string,
  resumeText: string = "",
  count: number = 4
): Promise<string[]> {

  const pool =
    QUESTION_BANK[category]?.[level] ||
    QUESTION_BANK["technical"]["junior"];

  return shuffle(pool).slice(0, count);
}
