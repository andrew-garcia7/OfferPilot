import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../api";
import {
  ATSReport,
  BuilderState,
  JDAnalysis,
  MatchResult,
  ResumeVersion,
} from "../types/resume";
import { ATSScoreGauge }      from "../components/resume/ATSScoreGauge";
import { InsightPanel }        from "../components/resume/InsightPanel";
import { JDUploader }          from "../components/resume/JDUploader";
import { SkillsGapTable }      from "../components/resume/SkillsGapTable";
import { ScoreImpactRoadmap }  from "../components/resume/ScoreImpactRoadmap";
import { ResumeBuilder, builderToText } from "../components/resume/ResumeBuilder";
import { VersionHistory }      from "../components/resume/VersionHistory";
import Footer                  from "../components/landing/Footer";

const EMPTY_BUILDER: BuilderState = {
  personal: { name: "", email: "", phone: "", location: "", headline: "", summary: "", linkedin: "", github: "" },
  skills: [],
  experience: [{ role: "", company: "", start: "", end: "Present", bullets: [""] }],
  education:  [{ school: "", degree: "", start: "", end: "", details: "" }],
  projects:   [{ name: "", link: "", description: "", bullets: [""] }],
};

type TabKey = "analyzer" | "builder" | "versions";

export default function Resume() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>("analyzer");

  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<ATSReport | null>(null);
  const [uploading, setUploading] = useState(false);

  const [jd, setJd] = useState<JDAnalysis | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [matching, setMatching] = useState(false);

  const [builderState, setBuilderState] = useState<BuilderState>(EMPTY_BUILDER);
  const [templateKey, setTemplateKey] = useState("software_engineer");
  const [savingDraft, setSavingDraft] = useState(false);
  const [analyzingBuilder, setAnalyzingBuilder] = useState(false);
  const [draftId, setDraftId] = useState<number | null>(null);
  const [builderReport, setBuilderReport] = useState<ATSReport | null>(null);

  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [savingVersion, setSavingVersion] = useState(false);

  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved   = localStorage.getItem("resume_builder_v2");
      const savedTpl = localStorage.getItem("resume_builder_template");
      const savedId  = localStorage.getItem("resume_draft_id");
      if (saved)    setBuilderState(JSON.parse(saved));
      if (savedTpl) setTemplateKey(savedTpl);
      if (savedId)  setDraftId(Number(savedId));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("resume_builder_v2", JSON.stringify(builderState));
      localStorage.setItem("resume_builder_template", templateKey);
    } catch { /* ignore */ }
  }, [builderState, templateKey]);

  useEffect(() => {
    if (draftId) localStorage.setItem("resume_draft_id", String(draftId));
  }, [draftId]);

  useEffect(() => {
    if (tab === "versions" && draftId) loadVersions();
  }, [tab, draftId]);

  const uploadResume = async () => {
    if (!file) { setError("Select a PDF, DOCX, or TXT file."); return; }
    setUploading(true); setError(""); setReport(null); setMatchResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (jd) fd.append("jdSkills", JSON.stringify(jd.requiredSkills));
      const res = await API.post("/api/resume/upload", fd);
      setReport(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleJDAnalyzed = async (analyzed: JDAnalysis) => {
    setJd(analyzed); setMatchResult(null);
    if (report?.text) await runMatch(report.text, analyzed.requiredSkills);
  };

  const runMatch = async (resumeText: string, skills: string[]) => {
    setMatching(true);
    try {
      const res = await API.post("/api/resume/match", { resumeText, jdSkills: skills });
      setMatchResult(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Match analysis failed.");
    } finally {
      setMatching(false);
    }
  };

  const saveDraft = async (text: string) => {
    setSavingDraft(true);
    try {
      const res = await API.post("/api/resume-builder/draft", {
        id: draftId,
        title: builderState.personal.headline || builderState.personal.name || "Untitled Resume",
        payload: builderState,
        templateKey,
        atsScore: builderReport?.atsScore,
        userId: null,
      });
      const newId = res.data?.draft?.id;
      if (newId) setDraftId(newId);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Could not save draft.");
    } finally {
      setSavingDraft(false);
    }
  };

  const saveVersion = async (text: string) => {
    if (!draftId) { await saveDraft(text); return; }
    setSavingVersion(true);
    try {
      await API.post("/api/resume-builder/version", {
        draftId,
        label: new Date().toLocaleString(),
        payload: builderState,
        atsScore: builderReport?.atsScore,
      });
      if (tab === "versions") loadVersions();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Version save failed.");
    } finally {
      setSavingVersion(false);
    }
  };

  const analyzeBuilder = async (text: string) => {
    setAnalyzingBuilder(true); setError("");
    try {
      const res = await API.post("/api/resume/analyze-text", { text, jdSkills: jd?.requiredSkills ?? [] });
      setBuilderReport(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Analysis failed.");
    } finally {
      setAnalyzingBuilder(false);
    }
  };

  const loadVersions = async () => {
    if (!draftId) return;
    setLoadingVersions(true);
    try {
      const res = await API.get(`/api/resume-builder/versions/${draftId}`);
      setVersions(res.data.versions ?? []);
    } catch { /* ignore */ } finally {
      setLoadingVersions(false);
    }
  };

  const restoreVersion = async (versionId: number) => {
    try {
      const res = await API.get(`/api/resume-builder/version/${versionId}`);
      setBuilderState(JSON.parse(res.data.version.payload));
      setTab("builder");
    } catch { setError("Failed to restore version."); }
  };

  const activeDisplay = matchResult ?? report;

  const headerStyle = {
    borderBottom: "1px solid var(--theme-border)",
    backgroundColor: "var(--theme-surface)",
  };

  const cardStyle = {
    backgroundColor: "var(--theme-surface)",
    border: "1px solid var(--theme-border)",
    borderRadius: "16px",
    padding: "20px",
  };

  return (
    <div className="op-dark-page op-resume-page min-h-screen text-white" style={{ backgroundColor: "#0F0F14", paddingTop: "64px" }}>
      {/* Page header */}
      <div className="px-6 py-5 shadow-sm" style={headerStyle}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex items-center gap-4">
            {/* ← Back / ✕ Close */}
            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm font-medium transition-colors" style={{ color: "rgba(255,255,255,0.35)" }} onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
              Back
            </button>
            <div>
              <h1 className="text-xl font-semibold text-white tracking-tight">Resume Studio</h1>
              <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                ATS analysis · JD matching · AI rewrites · Builder · Export
              </p>
            </div>
          </div>

          {/* Tab bar */}
          <div
            className="flex p-1 rounded-xl gap-1"
            style={{ backgroundColor: "color-mix(in srgb, var(--theme-text) 6%, var(--theme-surface))", border: "1px solid var(--theme-border)" }}
          >
            {(["analyzer", "builder", "versions"] as TabKey[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={
                  tab === t
                    ? { background: "linear-gradient(135deg, #6366F1, #8B5CF6)", color: "white" }
                    : { color: "var(--theme-muted)", backgroundColor: "transparent" }
                }
              >
                {t === "analyzer" ? "Analyze" : t === "builder" ? "Build" : "History"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {error && (
          <div
            className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}
          >
            <span className="text-red-400 text-sm">{error}</span>
            <button onClick={() => setError("")} className="ml-auto text-red-400 hover:text-red-300 text-xs">✕</button>
          </div>
        )}

        {/* ─── ANALYZER TAB ─── */}
        {tab === "analyzer" && (
          <div className="grid lg:grid-cols-3 gap-5">
            <div className="space-y-4">
              {/* Upload card */}
              <div style={cardStyle}>
                <div className="mb-4">
                  <h2 className="text-sm font-semibold text-white">Upload Resume</h2>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>PDF, DOCX, or TXT · max 10 MB</p>
                </div>

                <div
                  onClick={() => fileRef.current?.click()}
                  className="relative rounded-xl border-2 border-dashed cursor-pointer py-8 text-center transition-colors"
                  style={{ borderColor: "rgba(99,102,241,0.25)" }}
                  onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.borderColor = "rgba(99,102,241,0.5)")}
                  onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.borderColor = "rgba(99,102,241,0.25)")}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,.docx,.txt"
                    className="hidden"
                    onChange={e => { setFile(e.target.files?.[0] || null); setError(""); }}
                  />
                  {file ? (
                    <div className="space-y-1">
                      <p className="text-sm font-medium" style={{ color: "#818CF8" }}>{file.name}</p>
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{(file.size / 1024).toFixed(0)} KB · Click to change</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-3xl">📄</div>
                      <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Click to select resume</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={uploadResume}
                  disabled={uploading || !file}
                  className="w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-all mt-4"
                  style={
                    uploading || !file
                      ? { background: "rgba(99,102,241,0.3)", cursor: "not-allowed" }
                      : { background: "linear-gradient(135deg, #6366F1, #8B5CF6)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }
                  }
                >
                  {uploading ? "Analyzing…" : "Analyze Resume"}
                </button>
              </div>

              <JDUploader
                jd={jd}
                onAnalyzed={handleJDAnalyzed}
                onClear={() => { setJd(null); setMatchResult(null); }}
              />

              {jd && report && !matchResult && (
                <button
                  onClick={() => runMatch(report.text, jd.requiredSkills)}
                  disabled={matching}
                  className="w-full py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                  style={{ backgroundColor: "#16161F", border: "1px solid rgba(99,102,241,0.3)", color: "#818CF8" }}
                >
                  {matching ? "Matching…" : "Run JD Match Analysis"}
                </button>
              )}

              {report && (
                <div style={cardStyle}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>Detected Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {report.detectedSkills.length > 0
                      ? report.detectedSkills.map(s => (
                          <span
                            key={s}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium"
                            style={{ backgroundColor: "rgba(99,102,241,0.12)", color: "#818CF8", border: "1px solid rgba(99,102,241,0.25)" }}
                          >
                            {s}
                          </span>
                        ))
                      : <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>None detected — check your Skills section</span>
                    }
                  </div>
                </div>
              )}
            </div>

            {/* Center + Right */}
            <div className="lg:col-span-2 space-y-4">
              {!report && !matchResult && (
                <div
                  className="rounded-2xl py-20 flex flex-col items-center gap-3 text-center border-2 border-dashed"
                  style={{ borderColor: "rgba(99,102,241,0.2)", backgroundColor: "rgba(99,102,241,0.04)" }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                    style={{ backgroundColor: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)" }}
                  >
                    📊
                  </div>
                  <p className="font-medium text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>Upload your resume to see your ATS score</p>
                  <p className="text-xs max-w-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Add a job description for exact keyword matching and gap analysis</p>
                </div>
              )}

              {activeDisplay && (
                <>
                  <ATSScoreGauge score={activeDisplay.atsScore ?? 0} breakdown={activeDisplay.breakdown} breakdownDetail={activeDisplay.breakdownDetail} />

                  {activeDisplay.improvements?.length > 0 && (
                    <ScoreImpactRoadmap improvements={activeDisplay.improvements} currentScore={activeDisplay.atsScore ?? 0} />
                  )}

                  {jd && (
                    <SkillsGapTable required={jd.requiredSkills} detected={report?.detectedSkills ?? []} matchPercent={matchResult?.matchPercent} />
                  )}

                  {report?.missingSections?.length > 0 && (
                    <div
                      className="rounded-2xl p-4"
                      style={{ backgroundColor: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}
                    >
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#FCD34D" }}>Missing Sections</p>
                      <div className="flex flex-wrap gap-1.5">
                        {report.missingSections.map(s => (
                          <span
                            key={s}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium"
                            style={{ backgroundColor: "rgba(245,158,11,0.12)", color: "#FCD34D", border: "1px solid rgba(245,158,11,0.3)" }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-semibold text-white mb-3">Improvement Insights</h3>
                    <InsightPanel insights={activeDisplay.insights ?? []} suggestions={report?.suggestions} />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ─── BUILDER TAB ─── */}
        {tab === "builder" && (
          <ResumeBuilder
            state={builderState}
            setState={setBuilderState}
            templateKey={templateKey}
            onTemplateChange={key => setTemplateKey(key)}
            onSaveDraft={saveDraft}
            onAnalyze={analyzeBuilder}
            onSaveVersion={saveVersion}
            atsFeedback={builderReport}
            saving={savingDraft}
            analyzing={analyzingBuilder}
          />
        )}

        {/* ─── VERSIONS TAB ─── */}
        {tab === "versions" && (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">Version History</h2>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {draftId ? `Draft #${draftId}` : "Save a draft first to enable versioning"}
                </p>
              </div>
              {draftId && (
                <button
                  onClick={() => saveVersion(builderToText(builderState))}
                  disabled={savingVersion}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white transition-colors disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
                >
                  {savingVersion ? "Saving…" : "Save Version Now"}
                </button>
              )}
            </div>
            <VersionHistory versions={versions} onRestore={restoreVersion} loading={loadingVersions} />
            {!draftId && (
              <div className="text-center">
                <button
                  onClick={() => setTab("builder")}
                  className="text-sm transition-colors hover:text-white"
                  style={{ color: "#8B5CF6" }}
                >
                  → Go to Builder to start
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
