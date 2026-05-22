import React, { useMemo, useState } from "react";
import { BuilderState, ExperienceItem, EducationItem, ProjectItem, ATSReport } from "../../types/resume";
import { BulletRewriter } from "./BulletRewriter";
import { API } from "../../api";

/* ─── Helpers ──────────────────────────────────────────────────── */

export function builderToText(state: BuilderState): string {
  const p = state.personal;
  const lines: string[] = [
    p.name, p.headline, p.summary,
    [p.email, p.phone, p.location].filter(Boolean).join(" | "),
    [p.linkedin, p.github].filter(Boolean).join("  "),
    `Skills: ${state.skills.join(", ")}`,
    "Experience:",
    ...state.experience.map(e => `${e.role} at ${e.company} (${e.start} – ${e.end})\n${e.bullets.join("; ")}`),
    "Education:",
    ...state.education.map(e => `${e.degree} – ${e.school} (${e.start}–${e.end}) ${e.details}`),
    "Projects:",
    ...state.projects.map(p2 => `${p2.name}${p2.link ? ` (${p2.link})` : ""}: ${p2.description}. ${p2.bullets.join("; ")}`),
  ];
  return lines.filter(Boolean).join("\n");
}

/* ─── Templates ──────────────────────────────────────────────────── */

const TEMPLATES = [
  { key: "software_engineer",  name: "SWE",      headline: "Software Engineer | Full-Stack",         skills: ["TypeScript","Node.js","React","PostgreSQL","AWS","CI/CD"] },
  { key: "frontend_developer", name: "Frontend",  headline: "Frontend Developer | Design Systems",    skills: ["React","TypeScript","Next.js","Tailwind","Accessibility","Testing"] },
  { key: "backend_developer",  name: "Backend",   headline: "Backend Developer | APIs & Systems",     skills: ["Node.js","Express","PostgreSQL","Redis","Docker","gRPC"] },
  { key: "data_analyst",       name: "Data",      headline: "Data Analyst | Insights & BI",           skills: ["SQL","Python","Tableau","Power BI","Statistics","ETL"] },
  { key: "student",            name: "Fresher",   headline: "CS Graduate | Internships & Projects",   skills: ["JavaScript","Data Structures","Git","Algorithms","Open Source"] },
];

/* ─── Resume Preview HTML ─────────────────────────────────────────── */

function ResumePreviewPanel({ state, templateKey }: { state: BuilderState; templateKey: string }) {
  const p = state.personal;
  const template = TEMPLATES.find(t => t.key === templateKey) ?? TEMPLATES[0];
  const accentColor = templateKey === "frontend_developer" ? "#0ea5e9"
    : templateKey === "data_analyst" ? "#10b981"
    : templateKey === "student" ? "#8b5cf6"
    : "#4f46e5";

  return (
    <div
      id="resume-preview"
      className="bg-white text-gray-900 rounded-lg overflow-auto"
      style={{ fontFamily: "'Georgia', serif", fontSize: "11px", lineHeight: "1.5", padding: "28px 32px", minHeight: "560px" }}
    >
      {/* Header */}
      <div style={{ borderBottom: `2px solid ${accentColor}`, paddingBottom: "10px", marginBottom: "14px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700, margin: 0, color: "#111" }}>{p.name || "Your Name"}</h1>
        <p style={{ fontSize: "12px", color: accentColor, fontWeight: 600, margin: "2px 0" }}>{p.headline || template.headline}</p>
        <p style={{ color: "#555", fontSize: "10px", margin: "4px 0 0" }}>
          {[p.email, p.phone, p.location, p.linkedin, p.github].filter(Boolean).join("  ·  ")}
        </p>
      </div>

      {/* Summary */}
      {p.summary && (
        <Section title="Summary" accent={accentColor}>
          <p style={{ color: "#444", margin: 0 }}>{p.summary}</p>
        </Section>
      )}

      {/* Experience */}
      {state.experience.length > 0 && state.experience.some(e => e.role || e.company) && (
        <Section title="Experience" accent={accentColor}>
          {state.experience.filter(e => e.role || e.company).map((e, i) => (
            <div key={i} style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong style={{ color: "#111" }}>{e.role}</strong>
                <span style={{ color: "#666", fontSize: "10px" }}>{e.start} – {e.end}</span>
              </div>
              <p style={{ color: "#555", margin: "1px 0 4px", fontSize: "10px" }}>{e.company}</p>
              <ul style={{ margin: 0, paddingLeft: "16px" }}>
                {e.bullets.filter(Boolean).map((b, j) => (
                  <li key={j} style={{ color: "#444", marginBottom: "2px" }}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </Section>
      )}

      {/* Projects */}
      {state.projects.length > 0 && state.projects.some(p2 => p2.name) && (
        <Section title="Projects" accent={accentColor}>
          {state.projects.filter(p2 => p2.name).map((p2, i) => (
            <div key={i} style={{ marginBottom: "9px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong style={{ color: "#111" }}>{p2.name}</strong>
                {p2.link && <a href={p2.link} style={{ color: accentColor, fontSize: "10px" }}>{p2.link}</a>}
              </div>
              {p2.description && <p style={{ color: "#555", margin: "1px 0 3px", fontSize: "10px" }}>{p2.description}</p>}
              <ul style={{ margin: 0, paddingLeft: "16px" }}>
                {p2.bullets.filter(Boolean).map((b, j) => (
                  <li key={j} style={{ color: "#444", marginBottom: "2px" }}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </Section>
      )}

      {/* Education */}
      {state.education.length > 0 && state.education.some(e => e.school || e.degree) && (
        <Section title="Education" accent={accentColor}>
          {state.education.filter(e => e.school || e.degree).map((e, i) => (
            <div key={i} style={{ marginBottom: "7px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong style={{ color: "#111" }}>{e.degree}</strong>
                <span style={{ color: "#666", fontSize: "10px" }}>{e.start} – {e.end}</span>
              </div>
              <p style={{ color: "#555", margin: "1px 0", fontSize: "10px" }}>{e.school}{e.details ? ` · ${e.details}` : ""}</p>
            </div>
          ))}
        </Section>
      )}

      {/* Skills */}
      {state.skills.length > 0 && (
        <Section title="Skills" accent={accentColor}>
          <p style={{ color: "#444", margin: 0 }}>{state.skills.join("  ·  ")}</p>
        </Section>
      )}
    </div>
  );
}

function Section({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <h2 style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: accent, margin: "0 0 6px", borderBottom: `1px solid #e5e7eb`, paddingBottom: "3px" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

/* ─── Field component ──────────────────────────────────────────── */

function Field({ label, value, onChange, multiline, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean; placeholder?: string;
}) {
  const cls = "mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-violet-500";
  return (
    <label className="block">
      <span className="text-xs text-slate-500 font-medium">{label}</span>
      {multiline
        ? <textarea className={cls} rows={3} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
        : <input className={cls} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />}
    </label>
  );
}

/* ─── Props ──────────────────────────────────────────────────────── */

interface Props {
  state: BuilderState;
  setState: (next: BuilderState) => void;
  templateKey: string;
  onTemplateChange: (key: string) => void;
  onSaveDraft: (text: string) => Promise<void>;
  onAnalyze: (text: string) => Promise<void>;
  onSaveVersion: (text: string) => Promise<void>;
  atsFeedback?: ATSReport | null;
  saving: boolean;
  analyzing: boolean;
}

type Step = "personal" | "skills" | "experience" | "education" | "projects";
const STEPS: Step[] = ["personal", "skills", "experience", "education", "projects"];

/* ─── Main Component ──────────────────────────────────────────────── */

export function ResumeBuilder({ state, setState, templateKey, onTemplateChange, onSaveDraft, onAnalyze, onSaveVersion, atsFeedback, saving, analyzing }: Props) {
  const [step, setStep] = useState<Step>("personal");
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  const builderText = useMemo(() => builderToText(state), [state]);

  const setP = (key: keyof BuilderState["personal"], val: string) =>
    setState({ ...state, personal: { ...state.personal, [key]: val } });

  const updateExp = (i: number, patch: Partial<ExperienceItem>) => {
    const arr = [...state.experience];
    arr[i] = { ...arr[i], ...patch };
    setState({ ...state, experience: arr });
  };
  const removeExp = (i: number) => setState({ ...state, experience: state.experience.filter((_, j) => j !== i) });

  const updateEdu = (i: number, patch: Partial<EducationItem>) => {
    const arr = [...state.education];
    arr[i] = { ...arr[i], ...patch };
    setState({ ...state, education: arr });
  };
  const removeEdu = (i: number) => setState({ ...state, education: state.education.filter((_, j) => j !== i) });

  const updateProj = (i: number, patch: Partial<ProjectItem>) => {
    const arr = [...state.projects];
    arr[i] = { ...arr[i], ...patch };
    setState({ ...state, projects: arr });
  };
  const removeProj = (i: number) => setState({ ...state, projects: state.projects.filter((_, j) => j !== i) });

  const generateSummary = async () => {
    setGeneratingSummary(true);
    setSummaryError("");
    try {
      const res = await API.post("/api/resume/generate-summary", {
        experience: state.experience,
        skills: state.skills,
        targetRole: state.personal.headline || TEMPLATES.find(t => t.key === templateKey)?.name,
      });
      setP("summary", res.data.summary);
    } catch (err: any) {
      setSummaryError(err?.response?.data?.error || "Failed to generate summary.");
    } finally {
      setGeneratingSummary(false);
    }
  };

  const exportPDF = () => {
    const preview = document.getElementById("resume-preview");
    if (!preview) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Resume</title><style>
      body { margin: 0; font-family: Georgia, serif; font-size: 11px; line-height: 1.5; }
      @page { margin: 18mm 18mm; }
    </style></head><body>${preview.innerHTML}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-100">Resume Builder</h3>
          <p className="text-xs text-slate-500 mt-0.5">Real-time preview · ATS-safe templates</p>
        </div>
        {/* Template pills */}
        <div className="flex flex-wrap gap-1.5">
          {TEMPLATES.map(t => (
            <button
              key={t.key}
              onClick={() => onTemplateChange(t.key)}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${templateKey === t.key ? "bg-violet-600 border-violet-600 text-white" : "border-slate-700 text-slate-400 hover:border-violet-600 hover:text-violet-300"}`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Step tabs */}
      <div className="px-5 py-2.5 border-b border-slate-800 flex gap-1 overflow-x-auto">
        {STEPS.map(s => (
          <button
            key={s}
            onClick={() => setStep(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${step === s ? "bg-slate-700 text-slate-100" : "text-slate-500 hover:text-slate-300"}`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Split pane */}
      <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
        {/* Form */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[640px]">

          {step === "personal" && (
            <div className="space-y-3">
              <Field label="Full Name" value={state.personal.name} onChange={v => setP("name", v)} placeholder="Jane Smith" />
              <Field label="Headline" value={state.personal.headline} onChange={v => setP("headline", v)} placeholder={TEMPLATES.find(t => t.key === templateKey)?.headline} />
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500 font-medium">Professional Summary</span>
                  <button
                    onClick={generateSummary}
                    disabled={generatingSummary}
                    className="text-xs px-2.5 py-1 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 border border-violet-700/50 text-violet-300 font-medium transition-colors disabled:opacity-50"
                  >
                    {generatingSummary ? "Generating…" : "✦ AI Generate"}
                  </button>
                </div>
                <textarea
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  rows={3}
                  value={state.personal.summary}
                  onChange={e => setP("summary", e.target.value)}
                  placeholder="Results-driven engineer with…"
                />
                {summaryError && <p className="text-xs text-red-400 mt-1">{summaryError}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Email" value={state.personal.email} onChange={v => setP("email", v)} placeholder="jane@email.com" />
                <Field label="Phone" value={state.personal.phone} onChange={v => setP("phone", v)} placeholder="+1 555 0100" />
                <Field label="Location" value={state.personal.location} onChange={v => setP("location", v)} placeholder="San Francisco, CA" />
                <Field label="LinkedIn" value={state.personal.linkedin} onChange={v => setP("linkedin", v)} placeholder="linkedin.com/in/jane" />
                <Field label="GitHub" value={state.personal.github} onChange={v => setP("github", v)} placeholder="github.com/jane" />
              </div>
            </div>
          )}

          {step === "skills" && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">One skill per line or comma-separated.</p>
              <textarea
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                rows={5}
                value={state.skills.join(", ")}
                onChange={e => setState({ ...state, skills: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
              />
              <p className="text-xs text-slate-600">Suggested for {TEMPLATES.find(t => t.key === templateKey)?.name}:</p>
              <div className="flex flex-wrap gap-1.5">
                {TEMPLATES.find(t => t.key === templateKey)?.skills.map(sk => (
                  <button
                    key={sk}
                    onClick={() => { if (!state.skills.includes(sk)) setState({ ...state, skills: [...state.skills, sk] }); }}
                    className="px-2.5 py-1 rounded-md text-xs border border-slate-700 text-slate-400 hover:border-violet-600 hover:text-violet-300 transition-colors"
                  >
                    + {sk}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {state.skills.map(sk => (
                  <span
                    key={sk}
                    className="group flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-violet-900/30 text-violet-300 border border-violet-800/40"
                  >
                    {sk}
                    <button
                      onClick={() => setState({ ...state, skills: state.skills.filter(s => s !== sk) })}
                      className="text-violet-500 hover:text-red-400 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {step === "experience" && (
            <div className="space-y-4">
              {state.experience.map((exp, idx) => (
                <div key={idx} className="rounded-xl border border-slate-800 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">Position {idx + 1}</span>
                    <button onClick={() => removeExp(idx)} className="text-xs text-red-500/60 hover:text-red-400 transition-colors">Remove</button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Role" value={exp.role} onChange={v => updateExp(idx, { role: v })} placeholder="Software Engineer" />
                    <Field label="Company" value={exp.company} onChange={v => updateExp(idx, { company: v })} placeholder="Acme Corp" />
                    <Field label="Start" value={exp.start} onChange={v => updateExp(idx, { start: v })} placeholder="2022" />
                    <Field label="End" value={exp.end} onChange={v => updateExp(idx, { end: v })} placeholder="Present" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-2">Bullet Points</p>
                    <div className="space-y-2">
                      {(exp.bullets.length === 0 ? [""] : exp.bullets).map((bullet, bi) => (
                        <div key={bi} className="space-y-1.5">
                          <div className="flex gap-2">
                            <input
                              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                              value={bullet}
                              onChange={e => {
                                const bullets = [...exp.bullets];
                                bullets[bi] = e.target.value;
                                updateExp(idx, { bullets });
                              }}
                              placeholder={`Bullet ${bi + 1}…`}
                            />
                            <button
                              onClick={() => updateExp(idx, { bullets: exp.bullets.filter((_, j) => j !== bi) })}
                              className="text-slate-600 hover:text-red-400 text-xs px-2 transition-colors"
                            >
                              ×
                            </button>
                          </div>
                          {bullet.trim().length > 5 && (
                            <BulletRewriter
                              bullet={bullet}
                              context={`${exp.role} at ${exp.company}`}
                              onApply={rewritten => {
                                const bullets = [...exp.bullets];
                                bullets[bi] = rewritten;
                                updateExp(idx, { bullets });
                              }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => updateExp(idx, { bullets: [...exp.bullets, ""] })}
                      className="mt-2 text-xs text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      + Add bullet
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => setState({ ...state, experience: [...state.experience, { role: "", company: "", start: "", end: "Present", bullets: [""] }] })}
                className="w-full py-3 rounded-xl border border-dashed border-slate-700 text-slate-500 hover:border-violet-600 hover:text-violet-300 text-sm transition-colors"
              >
                + Add Position
              </button>
            </div>
          )}

          {step === "education" && (
            <div className="space-y-4">
              {state.education.map((edu, idx) => (
                <div key={idx} className="rounded-xl border border-slate-800 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">Education {idx + 1}</span>
                    <button onClick={() => removeEdu(idx)} className="text-xs text-red-500/60 hover:text-red-400 transition-colors">Remove</button>
                  </div>
                  <Field label="School / University" value={edu.school} onChange={v => updateEdu(idx, { school: v })} placeholder="MIT" />
                  <Field label="Degree" value={edu.degree} onChange={v => updateEdu(idx, { degree: v })} placeholder="B.S. Computer Science" />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Start" value={edu.start} onChange={v => updateEdu(idx, { start: v })} placeholder="2018" />
                    <Field label="End" value={edu.end} onChange={v => updateEdu(idx, { end: v })} placeholder="2022" />
                  </div>
                  <Field label="Details (GPA, honors…)" value={edu.details} onChange={v => updateEdu(idx, { details: v })} placeholder="GPA 3.9/4.0" />
                </div>
              ))}
              <button
                onClick={() => setState({ ...state, education: [...state.education, { school: "", degree: "", start: "", end: "", details: "" }] })}
                className="w-full py-3 rounded-xl border border-dashed border-slate-700 text-slate-500 hover:border-violet-600 hover:text-violet-300 text-sm transition-colors"
              >
                + Add Education
              </button>
            </div>
          )}

          {step === "projects" && (
            <div className="space-y-4">
              {state.projects.map((proj, idx) => (
                <div key={idx} className="rounded-xl border border-slate-800 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">Project {idx + 1}</span>
                    <button onClick={() => removeProj(idx)} className="text-xs text-red-500/60 hover:text-red-400 transition-colors">Remove</button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Project Name" value={proj.name} onChange={v => updateProj(idx, { name: v })} placeholder="Open-source API" />
                    <Field label="Link (optional)" value={proj.link} onChange={v => updateProj(idx, { link: v })} placeholder="github.com/jane/project" />
                  </div>
                  <Field label="Description" value={proj.description} onChange={v => updateProj(idx, { description: v })} multiline placeholder="One-line description of the project…" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-2">Bullet Points</p>
                    <div className="space-y-1.5">
                      {(proj.bullets.length === 0 ? [""] : proj.bullets).map((bullet, bi) => (
                        <div key={bi} className="flex gap-2">
                          <input
                            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                            value={bullet}
                            onChange={e => {
                              const bullets = [...proj.bullets];
                              bullets[bi] = e.target.value;
                              updateProj(idx, { bullets });
                            }}
                            placeholder="Tech stack, outcome…"
                          />
                          <button
                            onClick={() => updateProj(idx, { bullets: proj.bullets.filter((_, j) => j !== bi) })}
                            className="text-slate-600 hover:text-red-400 text-xs px-2 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => updateProj(idx, { bullets: [...proj.bullets, ""] })}
                      className="mt-2 text-xs text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      + Add bullet
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => setState({ ...state, projects: [...state.projects, { name: "", link: "", description: "", bullets: [""] }] })}
                className="w-full py-3 rounded-xl border border-dashed border-slate-700 text-slate-500 hover:border-violet-600 hover:text-violet-300 text-sm transition-colors"
              >
                + Add Project
              </button>
            </div>
          )}
        </div>

        {/* Preview pane */}
        <div className="flex flex-col divide-y divide-slate-800">
          {/* Action bar */}
          <div className="px-4 py-3 flex flex-wrap gap-2">
            <button
              onClick={() => onSaveDraft(builderText)}
              disabled={saving}
              className="flex-1 min-w-[100px] py-2 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors"
            >
              {saving ? "Saving…" : "Save Draft"}
            </button>
            <button
              onClick={() => onSaveVersion(builderText)}
              className="flex-1 min-w-[100px] py-2 rounded-lg border border-slate-700 text-slate-400 hover:border-violet-600 hover:text-violet-300 text-xs font-medium transition-colors"
            >
              + Version
            </button>
            <button
              onClick={() => onAnalyze(builderText)}
              disabled={analyzing}
              className="flex-1 min-w-[100px] py-2 rounded-lg border border-slate-700 text-slate-400 hover:border-emerald-600 hover:text-emerald-300 text-xs font-medium transition-colors disabled:opacity-50"
            >
              {analyzing ? "Analyzing…" : "ATS Check"}
            </button>
            <button
              onClick={exportPDF}
              className="flex-1 min-w-[100px] py-2 rounded-lg border border-slate-700 text-slate-400 hover:border-sky-600 hover:text-sky-300 text-xs font-medium transition-colors"
            >
              Export PDF
            </button>
          </div>

          {/* Preview */}
          <div className="p-4 flex-1 overflow-auto bg-slate-950/40">
            <p className="text-xs text-slate-600 mb-2 text-center">Live Preview</p>
            <ResumePreviewPanel state={state} templateKey={templateKey} />
          </div>

          {/* ATS mini result */}
          {atsFeedback && (
            <div className="px-4 py-3 border-t border-slate-800">
              <div className="flex items-center gap-3">
                <div
                  className="text-2xl font-bold"
                  style={{ color: atsFeedback.atsScore >= 70 ? "#10b981" : atsFeedback.atsScore >= 50 ? "#f59e0b" : "#ef4444" }}
                >
                  {Math.round(atsFeedback.atsScore)}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-300">ATS Score</p>
                  <p className="text-xs text-slate-500">{atsFeedback.suggestions?.[0] ?? "Looking good!"}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
