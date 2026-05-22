import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Briefcase, Code, FileText, Target } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const GOALS = [
  { icon: Briefcase, label: "Land a FAANG offer",     value: "faang" },
  { icon: Code,      label: "Ace coding interviews",  value: "coding" },
  { icon: FileText,  label: "Optimize my resume",     value: "resume" },
  { icon: Target,    label: "Switch career fields",   value: "switch" },
];

const EXPERIENCE = [
  { label: "0–1 years",  value: "junior" },
  { label: "2–4 years",  value: "mid" },
  { label: "5–9 years",  value: "senior" },
  { label: "10+ years",  value: "staff" },
];

export default function Onboarding() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [step,   setStep]   = useState(0);
  const [goal,   setGoal]   = useState("");
  const [exp,    setExp]    = useState("");

  const finish = () => {
    const profile = JSON.parse(localStorage.getItem("op-profile") || "{}");
    localStorage.setItem("op-profile", JSON.stringify({ ...profile, goal, experience: exp, onboarded: true }));
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        {/* Progress bar */}
        <div className="flex gap-2 mb-10">
          {[0, 1].map(i => (
            <div key={i} className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
              <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg,#6366F1,#8B5CF6)" }}
                initial={{ width: 0 }} animate={{ width: step > i ? "100%" : step === i ? "50%" : "0%" }}
                transition={{ duration: 0.4 }} />
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -32 }}>
              <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
                Welcome{user?.name ? `, ${user.name.split(" ")[0]}` : ""}! 👋
              </h1>
              <p className="text-white/45 mb-8 text-sm">What's your main goal right now?</p>
              <div className="grid grid-cols-2 gap-3">
                {GOALS.map(({ icon: Icon, label, value }) => (
                  <motion.button key={value} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setGoal(value)}
                    className="flex flex-col items-start gap-3 p-5 rounded-2xl text-left transition-all"
                    style={{
                      background: goal === value ? "rgba(99,102,241,0.18)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${goal === value ? "rgba(99,102,241,0.6)" : "rgba(255,255,255,0.08)"}`,
                      boxShadow: goal === value ? "0 0 0 1px rgba(99,102,241,0.2)" : "none",
                    }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: goal === value ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.06)" }}>
                      <Icon size={16} className={goal === value ? "text-indigo-400" : "text-white/40"} />
                    </div>
                    <span className={`text-sm font-semibold ${goal === value ? "text-white" : "text-white/60"}`}>{label}</span>
                  </motion.button>
                ))}
              </div>
              <motion.button disabled={!goal} onClick={() => setStep(1)}
                whileHover={{ scale: goal ? 1.02 : 1 }} whileTap={{ scale: goal ? 0.98 : 1 }}
                className="mt-6 w-full py-3.5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", boxShadow: goal ? "0 8px 24px rgba(99,102,241,0.3)" : "none" }}>
                Continue <ArrowRight size={15} />
              </motion.button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -32 }}>
              <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Years of experience?</h1>
              <p className="text-white/45 mb-8 text-sm">We'll personalize your interview difficulty.</p>
              <div className="grid grid-cols-2 gap-3">
                {EXPERIENCE.map(({ label, value }) => (
                  <motion.button key={value} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setExp(value)}
                    className="py-5 rounded-2xl font-semibold text-sm transition-all"
                    style={{
                      background: exp === value ? "rgba(99,102,241,0.18)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${exp === value ? "rgba(99,102,241,0.6)" : "rgba(255,255,255,0.08)"}`,
                      color: exp === value ? "white" : "rgba(255,255,255,0.55)",
                    }}>
                    {label}
                  </motion.button>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(0)}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-sm transition-all"
                  style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  Back
                </button>
                <motion.button disabled={!exp} onClick={finish}
                  whileHover={{ scale: exp ? 1.02 : 1 }} whileTap={{ scale: exp ? 0.98 : 1 }}
                  className="flex-2 py-3.5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", boxShadow: exp ? "0 8px 24px rgba(99,102,241,0.3)" : "none" }}>
                  Let's go! 🚀
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
