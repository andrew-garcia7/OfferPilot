import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { normalizeAuthUser } from "../lib/avatar";
import { useToast } from "../contexts/ToastContext";
import { API } from "../api";

const ERROR_MESSAGES: Record<string, string> = {
  google_failed: "Google sign-in was declined or failed. Please try again.",
  github_failed: "GitHub sign-in failed. Please try again.",
  no_user: "Could not retrieve your account. Please try again.",
  session_failed: "Session setup failed. Please sign in again.",
  oauth_failed: "OAuth flow failed. Please try again.",
  popup_blocked: "Pop-up was blocked. Please allow pop-ups and try again.",
  access_denied: "Access was denied. You may have cancelled the sign-in.",
};

export default function OAuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const { login } = useAuth();
  const { toast } = useToast();

  const processed = useRef(false);

  const [phase, setPhase] = useState<"loading" | "success" | "error">(
    "loading"
  );

  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const token = params.get("token");
    const isNew = params.get("new") === "1";
    const error = params.get("error");

    if (error || !token) {
      const msg =
        ERROR_MESSAGES[error ?? ""] ||
        "Authentication failed. Please try again.";

      setErrMsg(msg);
      setPhase("error");

      toast(msg, "error");

      setTimeout(() => {
        navigate(`/login?error=${error || "oauth_failed"}`, {
          replace: true,
        });
      }, 2800);

      return;
    }

    API.get("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        localStorage.setItem("op-token", token);

        localStorage.setItem(
          "user",
          JSON.stringify(res.data.user)
        );

        login(
          token,
          normalizeAuthUser(res.data.user) ?? res.data.user
        );

        setPhase("success");

        toast(
          isNew
            ? "Welcome to OfferPilot! 🎉 Account created."
            : `Welcome back, ${
                res.data.user.name?.split(" ")[0] || "there"
              }!`,
          "success"
        );

        setTimeout(() => {
          navigate(
            isNew ? "/onboarding" : "/dashboard",
            { replace: true }
          );
        }, 1200);
      })
      .catch((err) => {
        const status = err.response?.status;

        const msg =
          status === 401
            ? ERROR_MESSAGES.session_failed
            : "Could not connect to server. Please check your connection.";

        setErrMsg(msg);
        setPhase("error");

        toast(msg, "error");

        setTimeout(() => {
          navigate("/login?error=session_failed", {
            replace: true,
          });
        }, 2800);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 relative overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(99,102,241,0.07), transparent)",
          }}
        />
      </div>

      <AnimatePresence mode="wait">
        {phase === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex flex-col items-center gap-5"
          >
            {/* Animated ring */}
            <div className="relative w-16 h-16">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1.1,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute inset-0 rounded-full border-[3px] border-transparent"
                style={{
                  borderTopColor: "#6366F1",
                  borderRightColor: "rgba(99,102,241,0.25)",
                }}
              />

              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
                  />
                  <path
                    fill="#34A853"
                    d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 0 0 0 10.76l3.98-3.09z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
                  />
                </svg>
              </div>
            </div>

            <div className="text-center">
              <p className="text-white font-semibold text-base">
                Completing sign in…
              </p>

              <p className="text-white/35 text-sm mt-1">
                Setting up your account
              </p>
            </div>

            {/* Animated dots */}
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    opacity: [0.2, 1, 0.2],
                    scale: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="w-1.5 h-1.5 rounded-full bg-[#6366F1]"
                />
              ))}
            </div>
          </motion.div>
        )}

        {phase === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 350,
              damping: 22,
            }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 20,
                delay: 0.1,
              }}
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg,#10B981,#059669)",
                boxShadow:
                  "0 0 40px rgba(16,185,129,0.4)",
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </motion.div>

            <div className="text-center">
              <p className="text-white font-bold text-lg">
                Signed in!
              </p>

              <p className="text-white/40 text-sm mt-1">
                Redirecting…
              </p>
            </div>
          </motion.div>
        )}

        {phase === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-5 max-w-sm text-center px-4"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.3)",
              }}
            >
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FCA5A5"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line
                  x1="12"
                  y1="16"
                  x2="12.01"
                  y2="16"
                />
              </svg>
            </div>

            <div>
              <p className="text-white font-bold text-base">
                Sign-in failed
              </p>

              <p className="text-white/45 text-sm mt-1.5 leading-relaxed">
                {errMsg}
              </p>

              <p className="text-white/25 text-xs mt-3">
                Redirecting back to login…
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}