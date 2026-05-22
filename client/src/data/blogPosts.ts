export interface BlogPost {
  id: number;
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  read: string;
  featured?: boolean;
  img: string;
  content: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 1,
    slug: "google-l5-blueprint",
    category: "FAANG Prep",
    title: "How I Cracked the Google L5 Loop in 60 Days (Complete Blueprint)",
    excerpt: "A step-by-step breakdown of the exact system I used — mock schedules, resource lists, and the mental frameworks that got me through 6 grueling rounds.",
    author: "Priya M.",
    date: "Dec 12, 2024",
    read: "12 min",
    featured: true,
    img: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1400&q=80",
    content: [
      "Most candidates fail because they prep randomly. My turning point came when I split prep into three lanes: communication, problem solving, and company-fit stories.",
      "For six weeks, I ran mock interviews with strict timers and post-session notes. Every miss became a focused drill for the next day.",
      "The loop is survivable when you stop chasing perfection and start reducing repeat mistakes." 
    ],
  },
  {
    id: 2,
    slug: "behavioral-frameworks-engineers",
    category: "Interview Prep",
    title: "The 5 Behavioral Interview Frameworks Every Engineer Needs",
    excerpt: "STAR is a starting point, not a finish line. Here are the refined frameworks that senior and staff engineers actually use to answer leadership questions.",
    author: "Jordan L.",
    date: "Dec 8, 2024",
    read: "8 min",
    img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1200&q=80",
    content: [
      "Great stories are specific and measurable. Replace generic claims with decision context, constraints, and outcomes.",
      "The strongest answers show judgment under tradeoffs, not just technical execution.",
      "Practice with a rubric so your stories are consistent across different interviewer styles."
    ],
  },
  {
    id: 3,
    slug: "resume-ats-rejections",
    category: "Resume Tips",
    title: "Your Resume Is Getting Rejected Before a Human Reads It — Here's Why",
    excerpt: "73% of resumes are filtered out by ATS before reaching a recruiter. We analyzed 1,200 rejected resumes to find the exact patterns you must avoid.",
    author: "Marcus C.",
    date: "Dec 5, 2024",
    read: "6 min",
    img: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=1200&q=80",
    content: [
      "ATS systems are literal. If your resume doesn't mirror job language, your application rank drops fast.",
      "Structure matters: clear section headers, strong action verbs, and concise quantified impact lines.",
      "Treat your resume like a product spec — readable by machines first, compelling to humans second."
    ],
  },
  {
    id: 4,
    slug: "dp-without-headache",
    category: "Coding",
    title: "Dynamic Programming Explained Without the Headache",
    excerpt: "Most DP tutorials overwhelm you with theory. This guide uses just 7 core patterns and real interview problems to build genuine intuition.",
    author: "Sofia R.",
    date: "Nov 28, 2024",
    read: "15 min",
    img: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80",
    content: [
      "Pattern recognition beats memorization. Once you identify state + transition, the problem becomes tractable.",
      "Write brute force first. Then cache. Then tabulate. This progression prevents dead ends.",
      "Interviews reward clarity of approach more than exotic optimizations."
    ],
  },
  {
    id: 5,
    slug: "negotiate-200k-offer",
    category: "Career Growth",
    title: "Negotiating Your First $200K+ Offer: The Exact Scripts That Work",
    excerpt: "Most candidates leave $15,000–$40,000 on the table by accepting the first offer. Here's the negotiation script used by 2,400 OfferPilot users.",
    author: "Aisha O.",
    date: "Nov 22, 2024",
    read: "10 min",
    img: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=1200&q=80",
    content: [
      "Negotiation is not conflict; it is calibration. Your leverage increases when you present options and timelines clearly.",
      "Anchor on market data, role scope, and competing processes instead of personal need.",
      "Close with mutual upside language: impact, retention, and commitment."
    ],
  },
  {
    id: 6,
    slug: "system-design-rubric",
    category: "Interview Prep",
    title: "System Design Interviews: The Hidden Scoring Rubric",
    excerpt: "Interviewers don't score what you think they score. After interviewing 300+ candidates, here's what actually determines pass vs. fail.",
    author: "Ryan P.",
    date: "Nov 18, 2024",
    read: "11 min",
    img: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80",
    content: [
      "Candidates over-focus on architecture diagrams and under-focus on constraints.",
      "Strong signals include sane defaults, failure mode handling, and scaling rationale.",
      "Narration quality can raise your score even when details are imperfect."
    ],
  },
  {
    id: 7,
    slug: "meta-amazon-google-loops",
    category: "FAANG Prep",
    title: "Meta vs. Amazon vs. Google: How Their Interview Loops Actually Differ",
    excerpt: "Same role, completely different interview cultures. This comparison guide breaks down what each company actually tests and how to adapt.",
    author: "Priya M.",
    date: "Nov 14, 2024",
    read: "9 min",
    img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
    content: [
      "Google emphasizes structured problem solving and consistency.",
      "Meta pushes speed and breadth under pressure.",
      "Amazon heavily probes ownership and decision quality through behavioral depth."
    ],
  },
  {
    id: 8,
    slug: "linkedin-profile-checklist",
    category: "Resume Tips",
    title: "The LinkedIn Profile Optimization Checklist Used by Recruiters",
    excerpt: "12 specific changes to your LinkedIn profile that get you found by inbound recruiters — based on how their search algorithm actually ranks profiles.",
    author: "Marcus C.",
    date: "Nov 10, 2024",
    read: "7 min",
    img: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&w=1200&q=80",
    content: [
      "Headline and top skills are ranking-critical fields.",
      "Project-based proof outperforms abstract statements.",
      "A complete profile with focused keywords outperforms long but generic summaries."
    ],
  },
];

export const BLOG_CATEGORIES = ["All", "Interview Prep", "Resume Tips", "Coding", "FAANG Prep", "Career Growth"];
