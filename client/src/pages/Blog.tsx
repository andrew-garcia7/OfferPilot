import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Clock, BookOpen, ArrowRight, TrendingUp } from "lucide-react";
import Footer from "../components/landing/Footer";
import { BLOG_CATEGORIES, BLOG_POSTS } from "../data/blogPosts";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=75";

export default function Blog() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("All");
  const [readProgress, setReadProgress] = useState(0);
  const [openingSlug, setOpeningSlug] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setReadProgress(total > 0 ? (scrolled / total) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const featured = BLOG_POSTS.find((p) => p.featured) ?? BLOG_POSTS[0];
  const rest = BLOG_POSTS.filter((p) =>
    !p.featured &&
    (active === "All" || p.category === active) &&
    (p.title.toLowerCase().includes(query.toLowerCase()) || p.excerpt.toLowerCase().includes(query.toLowerCase()))
  );

  const openArticle = (slug: string) => {
    setOpeningSlug(slug);
    window.setTimeout(() => {
      navigate(`/blog/${slug}`);
      setOpeningSlug(null);
    }, 180);
  };

  return (
    <div className="op-dark-page op-blog-page min-h-screen" style={{ backgroundColor: "#0F0F14", color: "#F1F5F9", paddingTop: "80px" }}>
      {/* Reading progress bar */}
      <div className="reading-progress" style={{ transform: `scaleX(${readProgress / 100})` }} />

      {/* ← Back / ✕ Close nav */}
      <div className="flex items-center justify-between max-w-6xl mx-auto px-6 py-3">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm font-medium transition-colors" style={{ color: "rgba(255,255,255,0.4)" }} onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.85)")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back
        </button>
        <button onClick={() => navigate("/")} className="w-7 h-7 rounded-full flex items-center justify-center transition-colors" style={{ color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.06)" }} onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>

      {/* Full-bleed featured hero */}
      <section className="relative overflow-hidden" style={{ minHeight: "520px" }}>
        {/* Real photo background */}
        <img
          src={featured.img}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
          onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] opacity-15" />
        <div className="op-blog-hero-overlay absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(15,15,20,0.26) 0%, rgba(15,15,20,0.58) 60%, #0F0F14 100%)" }} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-15"
            style={{ background: "radial-gradient(ellipse, #6366F1 0%, transparent 60%)", transform: "translate(30%, -30%)" }} />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-16">
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="op-blog-hero-copy rounded-3xl p-4 sm:p-6 md:p-7">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1.5 rounded-full text-xs font-bold text-white uppercase tracking-widest"
                style={{ background: "rgba(99,102,241,0.4)", border: "1px solid rgba(99,102,241,0.5)" }}>Featured</span>
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>{featured.category}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-5 max-w-3xl tracking-tight" style={{ textShadow: "0 2px 10px rgba(15,23,42,0.28)" }}>
              {featured.title}
            </h1>
            <p className="text-lg text-white/70 max-w-2xl leading-relaxed mb-8" style={{ textShadow: "0 1px 8px rgba(15,23,42,0.22)" }}>{featured.excerpt}</p>
            <div className="flex items-center gap-5 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: "rgba(99,102,241,0.5)" }}>{featured.author.split(" ").map(w => w[0]).join("")}</div>
                <div>
                  <div className="text-sm font-semibold text-white">{featured.author}</div>
                  <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{featured.date}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                <Clock size={14} />{featured.read} read
              </div>
              <button
                onClick={() => openArticle(featured.slug)}
                className="ml-auto flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", boxShadow: "0 8px 24px rgba(99,102,241,0.35)" }}>
                Read article <ArrowRight size={14} />
              </button>
            </div>
            </div>
          </motion.div>

          {/* Search + stats bar */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.3)" }} />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search articles…"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: "var(--theme-surface)", border: "1px solid var(--theme-border)", color: "var(--theme-text)" }} />
            </div>
            <div className="flex items-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              <TrendingUp size={13} />
              <span>8 articles · Updated weekly</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="max-w-6xl mx-auto px-6 pt-8 pb-6">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-2">
          <h2 className="text-lg font-bold text-white">All Articles</h2>
          <div className="flex flex-wrap gap-2">
            {BLOG_CATEGORIES.map(c => (
            <button key={c} onClick={() => setActive(c)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={active === c
                ? { background: "color-mix(in srgb, #6366F1 16%, var(--theme-surface))", border: "1px solid rgba(99,102,241,0.45)", color: "#6366F1" }
                : { background: "var(--theme-surface)", border: "1px solid var(--theme-border)", color: "var(--theme-text)" }}>
              {c}
            </button>
          ))}
          </div>
        </div>
      </section>

      {/* Article grid */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {rest.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => openArticle(post.slug)}
              className="relative rounded-2xl overflow-hidden group cursor-pointer transition-all duration-300 hover:-translate-y-1.5"
              style={{ background: "var(--theme-surface)", border: "1px solid var(--theme-border)" }}>
              <div className="h-56 overflow-hidden relative">
                <img
                  src={post.img}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.07]"
                  loading="lazy"
                  onError={(e) => {
                    const el = e.currentTarget as HTMLImageElement;
                    el.src = FALLBACK_IMG;
                  }}
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(22,22,31,0.6) 0%, transparent 60%)" }} />
                <span className="absolute bottom-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-lg text-white"
                  style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)" }}>{post.category}</span>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-white text-[15px] leading-snug mb-2 group-hover:text-[#818CF8] transition-colors">{post.title}</h3>
                <p className="text-xs text-white/40 leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-white/25">
                  <span>{post.author} · {post.date}</span>
                  <div className="flex items-center gap-1"><Clock size={11} />{post.read}</div>
                </div>
              </div>

              {openingSlug === post.slug && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.22, 0] }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute inset-0 bg-gradient-to-r from-[#6366F1]/10 via-white/12 to-[#8B5CF6]/10"
                />
              )}
            </motion.div>
          ))}
        </div>
        {rest.length === 0 && (
          <div className="text-center py-20 text-white/30">No articles match your search.</div>
        )}
      </section>

      {/* Newsletter */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.06))" }} />
          <div className="absolute bottom-0 right-0 w-[500px] h-[400px] rounded-full opacity-10"
            style={{ background: "radial-gradient(ellipse, #8B5CF6 0%, transparent 70%)", transform: "translate(20%, 30%)" }} />
        </div>
        <div className="relative max-w-xl mx-auto text-center">
          <BookOpen size={28} className="mx-auto mb-4" style={{ color: "rgba(99,102,241,0.6)" }} />
          <h2 className="text-3xl font-bold text-white mb-2">Get weekly career insights</h2>
          <p className="text-white/40 text-sm mb-8">Join 12,000+ subscribers. Interview tips, salary data, and career intel — straight to your inbox.</p>
          <div className="flex gap-3">
            <input placeholder="your@email.com"
              className="flex-1 px-4 py-3.5 rounded-xl text-sm outline-none"
              style={{ background: "var(--theme-surface)", border: "1px solid var(--theme-border)", color: "var(--theme-text)" }} />
            <button className="px-6 py-3.5 rounded-xl text-sm font-bold text-white flex items-center gap-1.5 shrink-0 transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", boxShadow: "0 8px 24px rgba(99,102,241,0.3)" }}>
              Subscribe <ArrowRight size={14} />
            </button>
          </div>
          <p className="text-white/20 text-xs mt-4">No spam. Unsubscribe any time.</p>
        </div>
      </section>
      <Footer />
    </div>
  );
}
