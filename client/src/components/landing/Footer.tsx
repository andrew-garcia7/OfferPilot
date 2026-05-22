import { Link, useNavigate } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown, Loader2, MapPin } from "lucide-react";
import { BLOG_POSTS } from "../../data/blogPosts";

// Inline SVG social icons (lucide-react v1.x dropped brand icons)
const IconLinkedIn  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>;
const IconTwitter   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l16 16M4 20L20 4"/></svg>;
const IconGitHub    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.185 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.021C22 6.484 17.522 2 12 2z"/></svg>;
const IconYouTube   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#0F0F14"/></svg>;
const IconInstagram = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
  }),
};

/* ── FAQ ──────────────────────────────────────────── */
const FAQS = [
  { q: "Is OfferPilot free to start?",                        a: "Yes. The free tier gives you 5 mock interviews per month, a full resume ATS scan, and JD matching — no credit card required." },
  { q: "How realistic are the mock interviews?",              a: "Very. Our AI is trained on real interview patterns from 200+ top tech companies. It adapts questions based on your answers, just like a real interviewer, and uses GPT-4 for instant detailed feedback." },
  { q: "Can I prepare for a specific company?",               a: "Absolutely. We have company-specific question banks for Google, Amazon, Microsoft, Meta, Netflix, Stripe, Airbnb, and dozens more — updated quarterly." },
  { q: "How does the resume ATS scorer work?",                a: "We analyze your resume across 6 categories: Skills Match, Experience, Projects, Education, Formatting, and Keywords — then give exact improvement steps ranked by point impact." },
  { q: "What coding languages does the simulator support?",   a: "20+ languages including JavaScript, Python, Java, C++, Go, Rust, TypeScript and more. JavaScript/Python have live execution; all others get AI-powered analysis and complexity feedback." },
  { q: "Can I cancel my subscription anytime?",               a: "Absolutely. No contracts, no lock-in. Cancel anytime from your account settings with one click. Pro-rated refunds available within 30 days." },
];

const FOOTER_POSTS = BLOG_POSTS.slice(0, 3);

/* ── Salary calc ──────────────────────────────────── */
const ROLES = ["Software Engineer", "Product Manager", "Data Scientist", "DevOps Engineer", "Engineering Manager"];
const TIERS = ["Startup", "Mid-size", "FAANG / Big Tech"];
const POPULAR_LOCS = [
  "San Francisco", "New York", "Seattle", "Austin", "Remote", "London", "Berlin", "Toronto", "Vancouver",
  "Dublin", "Paris", "Amsterdam", "Singapore", "Tokyo", "Sydney", "Bangalore", "Hyderabad", "Dubai",
  "Madrid", "Sao Paulo", "Cape Town", "Mexico City", "Warsaw", "Jakarta",
];

const INDIA_IT_LOCS = [
  "Bengaluru", "Bangalore", "Hyderabad", "Pune", "Mumbai", "Navi Mumbai", "Thane", "Chennai",
  "Gurugram", "Gurgaon", "Noida", "Greater Noida", "Delhi", "New Delhi", "Faridabad", "Ghaziabad",
  "Kolkata", "Ahmedabad", "Gandhinagar", "Vadodara", "Jaipur", "Indore", "Bhopal", "Nagpur",
  "Kochi", "Coimbatore", "Trivandrum", "Thiruvananthapuram", "Mysuru", "Mysore", "Mangaluru",
  "Bhubaneswar", "Chandigarh", "Mohali", "Visakhapatnam", "Vijayawada", "Lucknow", "Kanpur", "Surat",
  "Nashik", "Patna", "Raipur", "Dehradun", "Jodhpur", "Udaipur",
];

const SALARY_MAP: Record<string, [number, number]> = {
  "Software Engineer-San Francisco-FAANG / Big Tech": [180, 260],
  "Software Engineer-New York-FAANG / Big Tech":       [165, 240],
  "Software Engineer-Seattle-FAANG / Big Tech":        [170, 250],
  default: [100, 180],
};

function SalaryCalc() {
  const [role, setRole]  = useState(ROLES[0]);
  const [loc,  setLoc]   = useState("San Francisco");
  const [locInput, setLocInput] = useState("San Francisco");
  const [locOpen, setLocOpen] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [locSuggestions, setLocSuggestions] = useState<string[]>([...INDIA_IT_LOCS, ...POPULAR_LOCS].slice(0, 10));
  const [tier, setTier]  = useState(TIERS[2]);
  const locBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOutsideClick = (event: MouseEvent) => {
      if (!locBoxRef.current) return;
      if (!locBoxRef.current.contains(event.target as Node)) {
        setLocOpen(false);
      }
    };
    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, []);

  useEffect(() => {
    const query = locInput.trim();
    const lowered = query.toLowerCase();
    const localMatches = [...INDIA_IT_LOCS, ...POPULAR_LOCS]
      .filter((item, idx, arr) => arr.indexOf(item) === idx)
      .filter((item) => item.toLowerCase().includes(lowered));

    const mergeAndLimit = (primary: string[], secondary: string[], limit = 12) => {
      const merged = [...primary, ...secondary].filter((item, idx, arr) => arr.indexOf(item) === idx);
      return merged.slice(0, limit);
    };

    if (query.length < 2) {
      const quick = mergeAndLimit(localMatches, [...INDIA_IT_LOCS, ...POPULAR_LOCS], 10);
      setLocSuggestions(quick.length ? quick : mergeAndLimit(INDIA_IT_LOCS, POPULAR_LOCS, 10));
      setLocLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        setLocLoading(true);
        const res = await fetch(
          `https://api.teleport.org/api/cities/?search=${encodeURIComponent(query)}&limit=12`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error("Location search failed");
        const data = await res.json();
        const raw = data?._embedded?.["city:search-results"] ?? [];
        const next = raw
          .map((item: { matching_full_name?: string }) => item.matching_full_name?.trim() ?? "")
          .filter(Boolean)
          .slice(0, 12);
        const combined = mergeAndLimit(localMatches, next, 12);
        setLocSuggestions(combined.length ? combined : mergeAndLimit(INDIA_IT_LOCS, POPULAR_LOCS, 10));
      } catch {
        if (!controller.signal.aborted) {
          setLocSuggestions(localMatches.length ? localMatches.slice(0, 12) : mergeAndLimit(INDIA_IT_LOCS, POPULAR_LOCS, 10));
        }
      } finally {
        if (!controller.signal.aborted) setLocLoading(false);
      }
    }, 260);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [locInput]);

  const chooseLocation = (value: string) => {
    setLoc(value);
    setLocInput(value);
    setLocOpen(false);
  };

  const key  = `${role}-${loc}-${tier}`;
  const range = SALARY_MAP[key] ?? SALARY_MAP["default"];
  const mid   = Math.round((range[0] + range[1]) / 2);

  return (
    <div className="bg-[#16161F] border border-white/[0.07] rounded-3xl p-8 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-[0.15em] bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/25">
          Salary Calculator
        </span>
        <h3 className="text-2xl font-extrabold text-white mt-3 mb-1 tracking-[-0.02em]">What should you be earning?</h3>
        <p className="text-white/40 text-sm">Get a real-time estimate based on role, location, and company tier.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div>
          <label className="block text-[11px] text-white/30 font-bold uppercase tracking-wide mb-1.5">Role</label>
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            className="w-full bg-[#0F0F14] border border-white/10 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#6366F1]/50 appearance-none cursor-pointer"
          >
            {ROLES.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        <div ref={locBoxRef} className="relative">
          <label className="block text-[11px] text-white/30 font-bold uppercase tracking-wide mb-1.5">Location</label>
          <div className="relative">
            <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
            <input
              value={locInput}
              onFocus={() => setLocOpen(true)}
              onChange={(e) => {
                setLocInput(e.target.value);
                setLocOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const first = locSuggestions[0] || locInput.trim();
                  if (first) chooseLocation(first);
                }
              }}
              placeholder="Type any city, region, or place"
              className="w-full bg-[#0F0F14] border border-white/10 text-white text-sm rounded-xl pl-9 pr-9 py-2.5 focus:outline-none focus:border-[#6366F1]/50"
            />
            {locLoading && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 animate-spin" />}
          </div>

          {locOpen && (
            <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 rounded-2xl border border-white/14 bg-[#0C0D16]/95 p-2 shadow-2xl shadow-black/55 backdrop-blur-md">
              <div className="max-h-62 overflow-y-auto pr-1">
                {locSuggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      chooseLocation(item);
                    }}
                    className="w-full rounded-xl px-3 py-2 text-left text-sm text-white/82 transition hover:bg-[#6366F1]/18 hover:text-white"
                  >
                    {item}
                  </button>
                ))}
                {!locLoading && locSuggestions.length === 0 && (
                  <div className="px-3 py-2 text-xs text-white/45">No places found. Press Enter to use your text.</div>
                )}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-[11px] text-white/30 font-bold uppercase tracking-wide mb-1.5">Company Tier</label>
          <select
            value={tier}
            onChange={e => setTier(e.target.value)}
            className="w-full bg-[#0F0F14] border border-white/10 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#6366F1]/50 appearance-none cursor-pointer"
          >
            {TIERS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between bg-[#6366F1]/10 border border-[#6366F1]/20 rounded-2xl px-6 py-5 mb-5">
        <div>
          <div className="text-xs text-white/30 font-medium mb-1">Estimated Total Comp</div>
          <div className="text-4xl font-black text-white tracking-[-0.03em]">${mid}K</div>
          <div className="text-xs text-white/40 mt-1">Range: ${range[0]}K – ${range[1]}K</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-white/30 mb-1">Percentile</div>
          <div className="text-2xl font-black text-[#10B981]">73rd</div>
          <div className="text-[10px] text-white/30 mt-1">of all applicants</div>
        </div>
      </div>

      <Link to="/resume-optimizer"
        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-bold text-white text-sm bg-linear-to-r from-[#6366F1] to-[#8B5CF6] hover:shadow-lg hover:shadow-[#6366F1]/30 transition-all"
      >
        Optimize my resume for this salary level <ArrowRight size={16} />
      </Link>
    </div>
  );
}

/* ── CTA Banner ───────────────────────────────────── */
function CTABanner() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-3xl overflow-hidden px-10 py-16 text-center mx-6 lg:mx-16 max-w-5xl xl:mx-auto"
      style={{ background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)" }}
    >
      {/* blobs */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#0F0F14]/25 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="text-sm font-bold text-white/60 uppercase tracking-[0.15em] mb-4">Land the offer. Own the process.</div>
        <h2 className="text-3xl lg:text-5xl font-extrabold text-white mb-4 tracking-[-0.03em]">
          Your dream offer is one practice session away.
        </h2>
        <p className="text-white/65 mb-10 max-w-xl mx-auto text-base">
          Join 12,000+ engineers who prep smarter and land faster with OfferPilot.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link to="/register"
              className="flex items-center gap-2 px-8 py-4 bg-white text-[#6366F1] font-extrabold rounded-2xl shadow-xl hover:bg-white/90 transition-all text-sm"
            >
              Get Started Free <ArrowRight size={16} />
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link to="/new"
              className="flex items-center gap-2 px-8 py-4 bg-white/15 hover:bg-white/22 text-white font-semibold rounded-2xl border border-white/25 transition-all text-sm"
            >
              Try a Mock Interview
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Footer ───────────────────────────────────────── */
const FOOTER_COLS = [
  {
    head: "Product",
    links: [
      { label: "Mock Interviews",  to: "/new" },
      { label: "Resume Builder",   to: "/resume" },
      { label: "Coding Lab",       to: "/coding" },
      { label: "JD Matcher",       to: "/new" },
      { label: "Career Roadmap",   to: "/new" },
      { label: "ATS Analyzer",     to: "/resume" },
    ],
  },
  {
    head: "Company",
    links: [
      { label: "About",            to: "/about" },
      { label: "Careers",          to: "/about" },
      { label: "Blog",             to: "/blog" },
      { label: "Press",            to: "/about" },
      { label: "Changelog",        to: "/blog" },
    ],
  },
  {
    head: "Legal",
    links: [
      { label: "Privacy Policy",   to: "/privacy" },
      { label: "Terms of Service", to: "/terms" },
      { label: "Cookie Policy",    to: "/privacy" },
      { label: "Security",         to: "/about" },
    ],
  },
];

const SOCIAL = [
  { icon: IconLinkedIn,  label: "LinkedIn",  hover: "hover:text-[#0A66C2] hover:-translate-y-[3px]" },
  { icon: IconTwitter,   label: "X/Twitter", hover: "hover:text-white hover:rotate-[15deg]" },
  { icon: IconGitHub,    label: "GitHub",    hover: "hover:text-white hover:scale-[1.2]" },
  { icon: IconYouTube,   label: "YouTube",   hover: "hover:text-[#FF0000] hover:scale-[1.1]" },
  { icon: IconInstagram, label: "Instagram", hover: "hover:text-[#E1306C]" },
];

export default function Footer() {
  const navigate = useNavigate();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [email, setEmail] = useState("");
  const [subbed, setSubbed] = useState(false);
  const [openingSlug, setOpeningSlug] = useState<string | null>(null);

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const openBlogPost = (slug: string) => {
    setOpeningSlug(slug);
    window.setTimeout(() => {
      navigate(`/blog/${slug}`);
      setOpeningSlug(null);
    }, 180);
  };

  return (
    <div className="op-footer">
      {/* ── Salary Calc ────────────────────────────── */}
      <section className="py-16 px-0">
        <SalaryCalc />
      </section>

      {/* ── FAQ ────────────────────────────────────── */}
      <section className="py-20 px-6 lg:px-16">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-12"
          >
            <span className="px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-[0.15em] bg-[#6366F1]/15 text-[#8B5CF6] border border-[#6366F1]/25">FAQ</span>
            <h2 className="text-4xl font-extrabold text-white mt-5 mb-2 tracking-[-0.02em]">
              Got <span className="gradient-text">questions?</span>
            </h2>
          </motion.div>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                className="bg-[#16161F] border border-white/6 rounded-2xl overflow-hidden"
              >
                <button
                  className="w-full px-6 py-5 flex items-center justify-between text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-semibold text-sm text-white/85 pr-4">{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`text-white/30 transition-transform duration-200 shrink-0 ${openFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-sm text-white/45 leading-[1.75]">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Blog Strip ─────────────────────────────── */}
      <section className="py-16 px-6 lg:px-16 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-extrabold text-white tracking-[-0.02em]">From the blog</h3>
            <Link to="/blog" className="text-sm text-[#8B5CF6] hover:text-white transition link-sweep">View all →</Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {FOOTER_POSTS.map((post, i) => (
              <motion.div
                key={post.slug}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => openBlogPost(post.slug)}
                className="relative block bg-[#16161F] border border-white/6 rounded-2xl p-6 hover:border-[#6366F1]/30 transition-all group cursor-pointer overflow-hidden"
              >
                <img
                  src={post.img}
                  alt={post.title}
                  className="mb-4 h-28 w-full rounded-xl border border-white/10 object-cover"
                  loading="lazy"
                />
                <span className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#8B5CF6]">{post.category}</span>
                <h4 className="mb-2 text-sm font-bold leading-normal text-white/80 transition-colors group-hover:text-white">{post.title}</h4>
                <span className="text-[11px] text-white/30">{post.author} · {post.read}</span>

                <AnimatePresence>
                  {openingSlug === post.slug && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 0.24, 0] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute inset-0 bg-linear-to-r from-[#6366F1]/10 via-white/15 to-[#8B5CF6]/10"
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────── */}
      <section className="py-16">
        <CTABanner />
      </section>

      {/* ── FOOTER ─────────────────────────────────── */}
      <motion.footer
        ref={ref}
        initial="hidden"
        animate={inView ? "show" : "hidden"}
        className="border-t border-white/6 pt-16 pb-8 px-8 lg:px-16 mt-8"
        style={{ backgroundColor: "var(--theme-bg)" }}
      >
        {/* Newsletter bar */}
        <motion.div variants={fadeUp}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-12 border-b border-white/6 mb-12"
        >
          <div>
            <div className="text-base font-extrabold text-white tracking-[-0.01em] mb-1">Stay in the loop</div>
            <div className="text-sm text-white/35">Career tips, new features, interview insights — weekly. No spam.</div>
          </div>
          {subbed ? (
            <div className="flex items-center gap-2 text-sm text-[#10B981] font-semibold">
              ✓ You're subscribed!
            </div>
          ) : (
            <div className="flex gap-2 w-full sm:w-auto">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="flex-1 sm:w-60 px-4 py-3 bg-[#16161F] border border-white/10 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#6366F1]/50"
              />
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => { if (email) setSubbed(true); }}
                className="px-5 py-3 bg-linear-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5558e8] hover:to-[#7c3aed] rounded-xl text-sm font-bold text-white transition-all shadow-lg shadow-[#6366F1]/25"
              >
                Subscribe
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* 4-col grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-10 mb-14">
          {/* Brand col */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
                <defs>
                  <linearGradient id="footerLogoGrad" x1="0" y1="36" x2="36" y2="0" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#4F46E5"/>
                    <stop offset="100%" stopColor="#8B5CF6"/>
                  </linearGradient>
                </defs>
                <rect width="36" height="36" rx="9" fill="url(#footerLogoGrad)"/>
                <ellipse cx="18" cy="5" rx="12" ry="5" fill="white" fillOpacity="0.1"/>
                {/* Blade UP — arrow */}
                <line x1="18" y1="20" x2="18" y2="10" stroke="white" strokeWidth="2.6" strokeLinecap="round"/>
                <polyline points="15.2,13 18,10 20.8,13" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                {/* Blade down-right */}
                <line x1="18" y1="20" x2="26.5" y2="25.5" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeOpacity="0.55"/>
                {/* Blade down-left */}
                <line x1="18" y1="20" x2="9.5" y2="25.5" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeOpacity="0.55"/>
                {/* Hub */}
                <circle cx="18" cy="20" r="3" fill="white" fillOpacity="0.97"/>
                <circle cx="18" cy="20" r="1.3" fill="url(#footerLogoGrad)"/>
              </svg>
              <span className="font-extrabold text-lg text-white tracking-[-0.02em]">
                Offer<span style={{ background: "linear-gradient(135deg,#818CF8,#A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Pilot</span>
              </span>
            </div>
            <p className="text-sm text-white/35 leading-[1.7] max-w-xs mb-6">
              Land the offer. Own the process.
              AI-powered interview prep, resume optimization, and career coaching in one platform.
            </p>
            {/* Social icons */}
            <div className="flex gap-3">
              {SOCIAL.map(({ icon: Icon, label, hover }) => (
                <motion.a
                  key={label}
                  href="#"
                  aria-label={label}
                  whileHover={{ scale: 1.1 }}
                  className={`op-social-icon w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-white/35 transition-all ${hover}`}
                >
                  <Icon size={16} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link cols */}
          {FOOTER_COLS.map(col => (
            <div key={col.head}>
              <div className="text-[11px] font-extrabold text-white/25 uppercase tracking-[0.18em] mb-4">{col.head}</div>
              <ul className="space-y-2.5">
                {col.links.map(link => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="op-footer-link text-sm text-white/45 hover:text-white transition-colors link-sweep"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/20">© 2025 OfferPilot, Inc. — All rights reserved.</p>
          <p className="text-xs text-white/20">Made with ✦ by the OfferPilot team</p>
        </div>
      </motion.footer>
    </div>
  );
}
