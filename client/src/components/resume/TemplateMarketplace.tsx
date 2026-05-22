import React, { useState } from "react";

export interface TemplateConfig {
  key: string;
  name: string;
  category: string;
  description: string;
  headline: string;
  skills: string[];
  accentColor: string;
  fontStyle: "serif" | "sans-serif" | "mono";
  layout: "single" | "double";
  badge?: string;
}

export const RESUME_TEMPLATES: TemplateConfig[] = [
  {
    key: "faang_swe",
    name: "FAANG SWE",
    category: "Engineering",
    description: "Clean single-column for Google, Meta, Amazon. Metrics-heavy format.",
    headline: "Software Engineer | Systems Design & APIs",
    skills: ["TypeScript", "Go", "React", "PostgreSQL", "AWS", "Kubernetes", "System Design", "gRPC"],
    accentColor: "#1d4ed8",
    fontStyle: "sans-serif",
    layout: "single",
    badge: "🔥 Most Popular",
  },
  {
    key: "startup_founder",
    name: "Startup / Founder",
    category: "Business",
    description: "Highlight impact, users reached, revenue. For YC & growth-stage companies.",
    headline: "Founder & Full-Stack Engineer | 0→1 Builder",
    skills: ["Node.js", "React", "Product Strategy", "GTM", "Growth", "Python", "SQL"],
    accentColor: "#7c3aed",
    fontStyle: "sans-serif",
    layout: "single",
  },
  {
    key: "product_company",
    name: "Product Company",
    category: "Engineering",
    description: "Stripe, Notion, Linear style. Emphasizes product thinking + execution.",
    headline: "Software Engineer | Product-Led Teams",
    skills: ["TypeScript", "React", "GraphQL", "PostgreSQL", "Design Systems", "CI/CD"],
    accentColor: "#0891b2",
    fontStyle: "sans-serif",
    layout: "single",
    badge: "✨ New",
  },
  {
    key: "finance_quant",
    name: "Finance / Quant",
    category: "Finance",
    description: "Goldman, JP Morgan, hedge funds. Conservative, metrics-first layout.",
    headline: "Quantitative Analyst | Data & Markets",
    skills: ["Python", "R", "SQL", "Bloomberg", "Excel VBA", "Statistics", "Financial Modeling"],
    accentColor: "#1e3a5f",
    fontStyle: "serif",
    layout: "single",
  },
  {
    key: "designer_ux",
    name: "UX / Product Designer",
    category: "Design",
    description: "Figma-native portfolio-style resume. Showcases process and impact.",
    headline: "Product Designer | Figma & Design Systems",
    skills: ["Figma", "User Research", "Prototyping", "Design Systems", "Accessibility", "Framer"],
    accentColor: "#be185d",
    fontStyle: "sans-serif",
    layout: "double",
  },
  {
    key: "fresher_cs",
    name: "Fresher / CS Graduate",
    category: "Entry Level",
    description: "Maximizes project and education impact for 0-1 year experience profiles.",
    headline: "CS Graduate | Projects & Internships",
    skills: ["JavaScript", "Python", "React", "Data Structures", "Git", "SQL", "Open Source"],
    accentColor: "#059669",
    fontStyle: "sans-serif",
    layout: "single",
    badge: "⭐ For Students",
  },
  {
    key: "ats_minimal",
    name: "ATS Minimal",
    category: "ATS-Safe",
    description: "Plain text-optimized. Maximum ATS parse rate. No tables or graphics.",
    headline: "Software Engineer | Backend & Infrastructure",
    skills: ["Python", "Java", "SQL", "AWS", "Docker", "REST APIs", "Agile"],
    accentColor: "#374151",
    fontStyle: "sans-serif",
    layout: "single",
    badge: "🤖 Highest ATS Score",
  },
  {
    key: "data_scientist",
    name: "Data Scientist / ML",
    category: "Data",
    description: "Research + production ML. For FAANG AI teams and AI startups.",
    headline: "Machine Learning Engineer | AI & Data",
    skills: ["Python", "PyTorch", "TensorFlow", "SQL", "Spark", "Hugging Face", "MLOps", "Statistics"],
    accentColor: "#7c2d12",
    fontStyle: "sans-serif",
    layout: "single",
  },
];

const CATEGORIES = ["All", "Engineering", "Business", "Finance", "Design", "Data", "Entry Level", "ATS-Safe"];

interface Props {
  selected: string;
  onSelect: (template: TemplateConfig) => void;
}

function TemplatePreview({ template }: { template: TemplateConfig }) {
  const accent = template.accentColor;
  const isSerif = template.fontStyle === "serif";

  return (
    <div
      className="w-full bg-white rounded-lg overflow-hidden"
      style={{
        fontFamily: isSerif ? "Georgia, serif" : "system-ui, sans-serif",
        fontSize: "5.5px",
        lineHeight: 1.4,
        padding: "8px",
        minHeight: "120px",
        border: `1px solid ${accent}20`,
      }}
    >
      {/* Name row */}
      <div style={{ borderBottom: `2px solid ${accent}`, paddingBottom: "4px", marginBottom: "5px" }}>
        <div style={{ fontSize: "9px", fontWeight: 700, color: "#111" }}>John Smith</div>
        <div style={{ color: accent, fontWeight: 600, fontSize: "6px" }}>{template.headline}</div>
        <div style={{ color: "#666", fontSize: "5px" }}>john@email.com · github.com/john · linkedin.com/in/john</div>
      </div>
      {/* Skills */}
      <div style={{ marginBottom: "4px" }}>
        <div style={{ fontSize: "5.5px", fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2px" }}>Skills</div>
        <div style={{ color: "#444" }}>{template.skills.slice(0, 5).join(" · ")}</div>
      </div>
      {/* Experience stub */}
      <div>
        <div style={{ fontSize: "5.5px", fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2px" }}>Experience</div>
        <div style={{ fontWeight: 600, color: "#111", fontSize: "6px" }}>Senior Engineer</div>
        <div style={{ color: "#555", fontSize: "5px" }}>Acme Corp · 2022 – Present</div>
        <div style={{ color: "#444", fontSize: "5px", marginTop: "2px" }}>• Reduced API latency by 40% via caching layer</div>
        <div style={{ color: "#444", fontSize: "5px" }}>• Shipped 3 features serving 50K users</div>
      </div>
    </div>
  );
}

export function TemplateMarketplace({ selected, onSelect }: Props) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = RESUME_TEMPLATES.filter(t => {
    const matchCategory = activeCategory === "All" || t.category === activeCategory;
    const matchSearch = !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-4">
      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          className="flex-1 px-3 py-2 rounded-xl border border-[#FFD6E8]/70 bg-white text-sm text-[#1a1a2e] placeholder:text-[#d1a8bf] focus:outline-none focus:ring-2 focus:ring-[#FFB6D9]/60"
          placeholder="Search templates (e.g. FAANG, designer, startup)…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                activeCategory === cat
                  ? "bg-[#FFB6D9] border-[#FFB6D9] text-[#831843]"
                  : "border-[#FFD6E8]/70 text-[#9ca3af] hover:border-[#FFB6D9] hover:text-[#be185d] bg-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map(template => (
          <button
            key={template.key}
            onClick={() => onSelect(template)}
            className={`relative text-left rounded-xl border-2 overflow-hidden transition-all hover:shadow-md group ${
              selected === template.key
                ? "border-[#FFB6D9] shadow-md shadow-[#FFD6E8]/60 ring-2 ring-[#FFB6D9]/30"
                : "border-[#FFD6E8]/60 hover:border-[#FFB6D9]"
            }`}
          >
            {/* Badge */}
            {template.badge && (
              <div className="absolute top-2 right-2 z-10">
                <span className="px-2 py-0.5 rounded-full bg-white border border-[#FFD6E8]/70 text-[10px] font-medium text-[#be185d] shadow-sm">
                  {template.badge}
                </span>
              </div>
            )}

            {/* Preview */}
            <div className="p-2 bg-[#FFF8FC]">
              <TemplatePreview template={template} />
            </div>

            {/* Info */}
            <div className="px-3 py-2.5 bg-white border-t border-[#FFD6E8]/40">
              <p className="text-xs font-semibold text-[#1a1a2e]">{template.name}</p>
              <p className="text-[10px] text-[#9ca3af] mt-0.5 line-clamp-2">{template.description}</p>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#FFF0F7] text-[#be185d] border border-[#FFD6E8]/60 font-medium">
                  {template.category}
                </span>
                {selected === template.key && (
                  <span className="text-[10px] text-[#16a34a] font-semibold">✓ Selected</span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-[#9ca3af] text-sm">
          No templates match "{searchQuery}"
        </div>
      )}
    </div>
  );
}
