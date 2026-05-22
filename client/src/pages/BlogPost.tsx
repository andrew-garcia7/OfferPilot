import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, Clock } from "lucide-react";
import Footer from "../components/landing/Footer";
import { BLOG_POSTS } from "../data/blogPosts";

export default function BlogPost() {
  const { slug } = useParams();
  const post = BLOG_POSTS.find((item) => item.slug === slug);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--theme-bg)", color: "var(--theme-text)", paddingTop: "80px" }}>
      <section className="relative h-[62vh] min-h-90 w-full overflow-hidden">
        <img src={post.img} alt={post.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-linear-to-b from-black/30 via-black/40 to-[#0F0F14]" />
        <Link
          to="/blog"
          className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-black/35 px-3 py-2 text-sm text-white/90 backdrop-blur-sm transition hover:bg-black/50 md:left-7 md:top-7"
        >
          <ArrowLeft size={15} /> Back to blog
        </Link>
      </section>

      <article className="mx-auto max-w-4xl px-6 pb-20 pt-8">
        <span className="mb-3 inline-flex rounded-full border border-[#6366F1]/40 bg-[#6366F1]/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#A5B4FC]">
          {post.category}
        </span>
        <h1 className="mb-4 text-4xl font-black leading-tight text-white">{post.title}</h1>
        <div className="mb-10 flex items-center gap-4 text-sm text-white/45">
          <span>{post.author}</span>
          <span>•</span>
          <span>{post.date}</span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <Clock size={14} /> {post.read}
          </span>
        </div>

        <div className="space-y-6 text-[15px] leading-8 text-white/75">
          {post.content.map((paragraph, idx) => (
            <p key={`${post.slug}-${idx}`}>{paragraph}</p>
          ))}
        </div>
      </article>
      <Footer />
    </div>
  );
}
