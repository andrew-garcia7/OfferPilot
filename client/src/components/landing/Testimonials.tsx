import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Rahul M.",
    role: "SWE → Google L4",
    salary: "$183K",
    avatar: "RM",
    avatarImg: 33,
    color: "from-[#6366F1] to-[#8B5CF6]",
    quote: "Landed in 6 weeks. The mock interview simulator knew exactly which Google SWE questions to prep. I walked in calm because I'd done it 20× already.",
    ats: "ATS 54 → 96",
  },
  {
    name: "Aisha K.",
    role: "SDE → Amazon",
    salary: "$171K",
    avatar: "AK",
    avatarImg: 47,
    color: "from-[#10B981] to-[#6366F1]",
    quote: "My resume scored 54 on first upload. Followed every suggestion. Re-scanned at 96. Got 3 callbacks that week. The ATS analyzer is a cheat code.",
    ats: "ATS 96/100",
  },
  {
    name: "Dev P.",
    role: "Eng → Meta E4",
    salary: "$195K",
    avatar: "DP",
    avatarImg: 15,
    color: "from-[#EC4899] to-[#8B5CF6]",
    quote: "The AI mock interviews were eerily identical to Meta's actual loop. I'd practiced the STAR format so many times it felt automatic by interview day.",
    ats: "Interview 9.2",
  },
  {
    name: "Sara T.",
    role: "SWE → Microsoft",
    salary: "$168K",
    avatar: "ST",
    avatarImg: 53,
    color: "from-[#F59E0B] to-[#EC4899]",
    quote: "The career roadmap kept me sane. Week-by-week plan, streak tracking, everything. I didn't have to think about what to study — just execute.",
    ats: "Hired in 5 wks",
  },
  {
    name: "Arjun S.",
    role: "Backend → Stripe",
    salary: "$178K",
    avatar: "AS",
    avatarImg: 12,
    color: "from-[#8B5CF6] to-[#10B981]",
    quote: "JD Matcher is an absolute cheat code. Pasted the Stripe JD, saw I was missing 4 keywords, rewrote two bullet points — got the call 3 days later.",
    ats: "JD Match 94%",
  },
  {
    name: "Mei L.",
    role: "SWE → Airbnb",
    salary: "$172K",
    avatar: "ML",
    avatarImg: 44,
    color: "from-[#6366F1] to-[#EC4899]",
    quote: "I had 3 FAANG offers at once. Used OfferPilot for resume optimization and coding prep across all of them simultaneously. Worth every penny.",
    ats: "3 FAANG offers",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
  }),
};

export default function Testimonials() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.section
      ref={ref}
      id="testimonials"
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      className="py-24 px-6 lg:px-16"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div variants={fadeUp} className="text-center mb-16">
          <span className="px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-[0.15em] bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/25">
            Success Stories
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white mt-5 mb-4 tracking-[-0.02em]">
            Real people.{" "}
            <span className="gradient-text">Real offers.</span>
          </h2>
          <p className="text-white/45 max-w-lg mx-auto text-base">
            Engineers who prepped on OfferPilot and landed jobs at their dream companies.
          </p>
        </motion.div>

        {/* Masonry grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              variants={fadeUp}
              custom={i * 0.5}
              whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(99,102,241,0.2)" }}
              className="break-inside-avoid mb-5 bg-[#16161F] border border-white/[0.07] rounded-2xl p-6 relative transition-all cursor-default"
              style={{ borderLeft: "2px solid", borderLeftColor: i % 3 === 0 ? "#6366F1" : i % 3 === 1 ? "#10B981" : "#EC4899" }}
            >
              {/* badge */}
              <div className="absolute top-5 right-5">
                <span className="text-[10px] font-bold bg-white/5 text-white/40 px-2.5 py-1 rounded-full border border-white/8">
                  {t.ats}
                </span>
              </div>

              {/* avatar + name */}
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={`https://i.pravatar.cc/150?img=${t.avatarImg}`}
                  alt={t.name}
                  className="w-10 h-10 rounded-xl object-cover"
                  loading="lazy"
                />
                <div>
                  <div className="text-sm font-bold text-white">{t.name}</div>
                  <div className="text-[11px] font-semibold text-[#8B5CF6]">{t.role}</div>
                </div>
              </div>

              {/* quote */}
              <p className="text-sm text-white/60 leading-[1.7] mb-4">"{t.quote}"</p>

              {/* bottom */}
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, k) => (
                    <Star key={k} size={11} className="text-[#F59E0B] fill-[#F59E0B]" />
                  ))}
                </div>
                <span className="text-xs font-extrabold text-[#10B981]">{t.salary}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
