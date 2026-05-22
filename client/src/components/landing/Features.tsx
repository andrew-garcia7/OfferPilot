import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Check, FileText, Mic, Code2, Target, Map } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
  }),
};

/* ── individual feature data ──────────────────────── */
const FEATURES = [
  {
    tag: "RESUME",
    headline: "Your resume, ATS-optimized in seconds.",
    sub: "Upload once. Get a full ATS breakdown with per-category scores, keyword gap analysis, and one-click improvements.",
    bullets: ["Real-time ATS scoring", "Keyword gap analysis", "40+ premium templates", "PDF / DOCX export"],
    icon: FileText,
    gradient: "from-[#6366F1] to-[#8B5CF6]",
    mockup: "resume",
  },
  {
    tag: "INTERVIEWS",
    headline: "Practice interviews that feel real.",
    sub: "Role-specific AI interview sessions that adapt to your answers. GPT-4 feedback with filler word analysis and instant scoring.",
    bullets: ["Role-specific question banks", "GPT-4 instant feedback", "Filler word + pacing analysis", "Full session replay"],
    icon: Mic,
    gradient: "from-[#EC4899] to-[#8B5CF6]",
    mockup: "interview",
  },
  {
    tag: "CODING",
    headline: "Ace the coding round, every time.",
    sub: "In-browser Monaco editor. 800+ LeetCode-style problems. Company question banks and step-by-step solution walkthroughs.",
    bullets: ["800+ curated problems", "Solution walkthroughs", "Company question banks", "Complexity analysis"],
    icon: Code2,
    gradient: "from-[#10B981] to-[#6366F1]",
    mockup: "coding",
  },
  {
    tag: "JD MATCHER",
    headline: "Know your fit before you apply.",
    sub: "Paste any job description. Get a semantic match score, keyword diff, rewrite suggestions, and salary prediction instantly.",
    bullets: ["Semantic keyword match", "One-click rewrite suggestions", "Salary prediction", "One-click resume export"],
    icon: Target,
    gradient: "from-[#F59E0B] to-[#EC4899]",
    mockup: "jd",
  },
  {
    tag: "ROADMAP",
    headline: "Your personalized path to L5 and beyond.",
    sub: "AI-generated week-by-week plan based on 50K+ real career transitions. Track streaks, hit milestones, level up.",
    bullets: ["50K+ career transition paths", "Week-by-week action plan", "Streak tracking", "Milestone celebrations"],
    icon: Map,
    gradient: "from-[#8B5CF6] to-[#10B981]",
    mockup: "roadmap",
  },
];

/* ── dashboard mockup visuals ─────────────────────── */
function ResumeMockup() {
  return (
    <div className="bg-[#16161F] rounded-2xl border border-white/8 overflow-hidden h-72">
      {/* top bar */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/6">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
        <span className="ml-3 text-xs text-white/30">offerpilot.ai/resume</span>
      </div>
      <div className="p-5 grid grid-cols-5 gap-4 h-full">
        {/* gauge */}
        <div className="col-span-2 flex flex-col items-center justify-center">
          <div className="relative w-20 h-20 mb-2">
            <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
              <circle cx="40" cy="40" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7"/>
              <circle cx="40" cy="40" r="28" fill="none" stroke="#10B981" strokeWidth="7" strokeLinecap="round"
                strokeDasharray="176" strokeDashoffset="28"/>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-black text-[#10B981]">94</span>
            </div>
          </div>
          <span className="text-[11px] text-white/40 font-medium">ATS Score</span>
        </div>
        {/* bars */}
        <div className="col-span-3 space-y-2.5 pt-2">
          {[["Skills","94%","#6366F1"],["Keywords","88%","#8B5CF6"],["Experience","81%","#10B981"],["Format","97%","#F59E0B"]].map(([l,p,c]) => (
            <div key={l}>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-white/40">{l}</span>
                <span className="font-bold" style={{color:c}}>{p}</span>
              </div>
              <div className="h-1 bg-white/6 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{width:p,backgroundColor:c}}/>
              </div>
            </div>
          ))}
        </div>
        {/* chips */}
        <div className="col-span-5 flex flex-wrap gap-1.5">
          {["+ React (+6 pts)","+ Quantify impact (+4 pts)","+ Match JD skills (+8 pts)"].map(t=>(
            <span key={t} className="px-2.5 py-1 rounded-full bg-[#6366F1]/15 border border-[#6366F1]/30 text-[10px] font-medium text-[#8B5CF6]">{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function InterviewMockup() {
  return (
    <div className="bg-[#16161F] rounded-2xl border border-white/8 overflow-hidden h-72">
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/6">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/60"/>
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60"/>
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/60"/>
        <span className="ml-3 text-xs text-white/30">Interview Simulator</span>
        <div className="ml-auto flex items-center gap-1.5 text-[10px] text-[#10B981] font-semibold">
          <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"/>REC
        </div>
      </div>
      <div className="p-5 space-y-3">
        {/* AI question bubble */}
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-[10px] font-bold text-white shrink-0">AI</div>
          <div className="bg-white/5 rounded-xl rounded-tl-none px-3 py-2.5 text-[12px] text-white/70 leading-relaxed max-w-xs">
            Tell me about a time you resolved a conflict within your engineering team.
          </div>
        </div>
        {/* User response */}
        <div className="flex items-start gap-2.5 flex-row-reverse">
          <div className="w-7 h-7 rounded-full bg-[#10B981]/20 flex items-center justify-center text-[10px] font-bold text-[#10B981] shrink-0">You</div>
          <div className="bg-[#6366F1]/15 rounded-xl rounded-tr-none px-3 py-2.5 text-[12px] text-white/70 leading-relaxed max-w-xs">
            In my last role, we had a disagreement about the API design...
          </div>
        </div>
        {/* score */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-white/30">Live score</span>
          <div className="flex items-center gap-1">
            {[1,2,3,4].map(i=><div key={i} className="w-1.5 h-4 bg-[#10B981] rounded-sm" style={{height:`${8+i*4}px`}}/>)}
            <span className="text-xs font-bold text-[#10B981] ml-1">8.7</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CodingMockup() {
  return (
    <div className="bg-[#16161F] rounded-2xl border border-white/8 overflow-hidden h-72">
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/6">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/60"/>
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60"/>
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/60"/>
        <div className="flex gap-3 ml-3">
          <span className="text-[11px] text-[#8B5CF6] font-semibold border-b border-[#8B5CF6] pb-0.5">solution.py</span>
          <span className="text-[11px] text-white/30">output</span>
        </div>
        <span className="ml-auto text-[10px] text-[#10B981] font-bold bg-[#10B981]/10 px-2 py-0.5 rounded-full">Medium</span>
      </div>
      <div className="p-4 font-mono text-[11px] space-y-0.5 text-white/60">
        <div><span className="text-[#8B5CF6]">def</span> <span className="text-[#6366F1]">two_sum</span>(nums, target):</div>
        <div className="pl-4"><span className="text-white/30">    </span>seen = {"{}"}</div>
        <div className="pl-4"><span className="text-[#8B5CF6]">    for</span> i, n <span className="text-[#8B5CF6]">in</span> enumerate(nums):</div>
        <div className="pl-8"><span className="text-[#8B5CF6]">        if</span> target - n <span className="text-[#8B5CF6]">in</span> seen:</div>
        <div className="pl-12"><span className="text-[#8B5CF6]">            return</span> [seen[target - n], i]</div>
        <div className="pl-8">seen[n] = i</div>
      </div>
      <div className="mx-4 mt-1 p-3 bg-[#10B981]/8 border border-[#10B981]/20 rounded-xl">
        <div className="flex items-center gap-2 text-[11px] text-[#10B981] font-semibold mb-1">
          <Check size={12}/> All 3 test cases passed · O(n) time · O(n) space
        </div>
        <div className="text-[10px] text-white/30">Runtime 99ms · Beats 94.2% of solutions</div>
      </div>
    </div>
  );
}

function JDMockup() {
  return (
    <div className="bg-[#16161F] rounded-2xl border border-white/8 overflow-hidden h-72 p-5">
      <div className="grid grid-cols-2 gap-4 h-full">
        <div className="space-y-2">
          <div className="text-[10px] text-white/30 uppercase tracking-wide font-bold mb-2">Your Resume</div>
          {["React","TypeScript","Node.js","AWS","GraphQL"].map((s,i)=>(
            <div key={s} className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium ${i < 3 ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/20" : "bg-white/5 text-white/40 border border-white/8"}`}>
              {s} {i<3 && "✓"}
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <div className="text-[10px] text-white/30 uppercase tracking-wide font-bold mb-2">JD Requires</div>
          {["React","TypeScript","Node.js","Redis","Kubernetes"].map((s,i)=>(
            <div key={s} className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium ${i<3 ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/20" : "bg-[#EF4444]/10 text-[#EF4444]/80 border border-[#EF4444]/20"}`}>
              {s} {i>=3 && "← add"}
            </div>
          ))}
        </div>
        <div className="col-span-2 flex items-center justify-between bg-[#6366F1]/10 rounded-xl px-4 py-2.5 border border-[#6366F1]/20">
          <span className="text-xs font-bold text-white/60">Overall Match</span>
          <span className="text-xl font-black text-[#8B5CF6]">91%</span>
        </div>
      </div>
    </div>
  );
}

function RoadmapMockup() {
  const steps = [
    { label: "Resume polish",    done: true  },
    { label: "DSA fundamentals", done: true  },
    { label: "System Design",    done: false },
    { label: "Mock Interviews",  done: false },
    { label: "Apply & track",    done: false },
  ];
  return (
    <div className="bg-[#16161F] rounded-2xl border border-white/8 overflow-hidden h-72 p-5">
      <div className="text-[11px] text-white/30 uppercase tracking-wide font-bold mb-4">Your 8-week roadmap</div>
      <div className="relative">
        <div className="absolute left-3.5 top-0 bottom-0 w-px bg-white/8" />
        <div className="space-y-4">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-4 relative z-10">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                step.done ? "bg-[#10B981]" : "bg-[#16161F] border border-white/15"
              }`}>
                {step.done ? <Check size={13} className="text-white"/> : <span className="text-[10px] text-white/30 font-bold">{i+1}</span>}
              </div>
              <span className={`text-sm font-medium ${step.done ? "text-white/80 line-through decoration-white/20" : "text-white/50"}`}>{step.label}</span>
              {i === 2 && <span className="ml-auto text-[10px] font-bold text-[#6366F1] bg-[#6366F1]/10 px-2 py-0.5 rounded-full">This week</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const MOCKUPS: Record<string, React.ReactNode> = {
  resume:    <ResumeMockup />,
  interview: <InterviewMockup />,
  coding:    <CodingMockup />,
  jd:        <JDMockup />,
  roadmap:   <RoadmapMockup />,
};

function FeatureRow({ feature, index }: { feature: typeof FEATURES[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const isEven = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } } }}
      className={`flex flex-col ${isEven ? "lg:flex-row" : "lg:flex-row-reverse"} items-center gap-12 lg:gap-16 py-16 border-b border-white/[0.05] last:border-0`}
    >
      {/* Text */}
      <div className="flex-1 min-w-0">
        <motion.div variants={fadeUp} custom={0}>
          <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold tracking-[0.15em] bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent border border-white/10 uppercase`}>
            {feature.tag}
          </span>
        </motion.div>
        <motion.h2 variants={fadeUp} custom={1}
          className="text-3xl lg:text-4xl font-extrabold text-white mt-4 mb-4 leading-[1.15] tracking-[-0.02em]"
        >
          {feature.headline}
        </motion.h2>
        <motion.p variants={fadeUp} custom={2}
          className="text-white/50 text-base leading-[1.75] mb-8"
        >
          {feature.sub}
        </motion.p>
        <motion.ul variants={fadeUp} custom={3} className="space-y-3">
          {feature.bullets.map((b, i) => (
            <li key={i} className="flex items-center gap-3 text-sm text-white/70">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center bg-gradient-to-br ${feature.gradient} shrink-0`}>
                <Check size={11} className="text-white" />
              </div>
              {b}
            </li>
          ))}
        </motion.ul>
      </div>

      {/* Mockup */}
      <motion.div variants={fadeUp} custom={1}
        whileHover={{ scale: 1.02 }}
        className="flex-1 w-full min-w-0 max-w-lg"
      >
        {MOCKUPS[feature.mockup]}
      </motion.div>
    </motion.div>
  );
}

export default function Features() {
  return (
    <section id="features" className="py-20 px-6 lg:px-16 max-w-6xl mx-auto">
      <div className="text-center mb-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-[0.15em] bg-[#6366F1]/15 text-[#8B5CF6] border border-[#6366F1]/25">
            Platform
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white mt-5 mb-4 tracking-[-0.02em]">
            Everything you need,{" "}
            <span className="gradient-text">nothing you don't.</span>
          </h2>
          <p className="text-white/45 max-w-xl mx-auto text-base leading-[1.75]">
            Five AI-powered tools. One platform. Designed to take you from application to offer.
          </p>
        </motion.div>
      </div>

      {FEATURES.map((f, i) => (
        <FeatureRow key={f.tag} feature={f} index={i} />
      ))}
    </section>
  );
}
