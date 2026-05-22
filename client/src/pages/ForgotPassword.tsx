import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import AuthBackground from "../components/auth/AuthBackground";
import AuthCard from "../components/auth/AuthCard";
import AuthBrandLogo from "../components/auth/AuthBrandLogo";
import AuthInput from "../components/auth/AuthInput";
import AuthButton from "../components/auth/AuthButton";
import {
  authTitle,
  authSubtitle,
  authFooter,
  authLink,
  authErrorBox,
  authSuccessBox,
} from "../components/auth/authTheme";

const RESEND_SECONDS = 30;

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  const emailValid = useMemo(() => /^\S+@\S+\.\S+$/.test(email), [email]);

  useEffect(() => {
    if (!sent || secondsLeft <= 0) {
      return;
    }
    const t = window.setTimeout(() => setSecondsLeft((prev) => prev - 1), 1000);
    return () => window.clearTimeout(t);
  }, [secondsLeft, sent]);

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    if (!emailValid) {
      setError("Please enter a valid email.");
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 950));
    setLoading(false);
    setSent(true);
    setSecondsLeft(RESEND_SECONDS);
  };

  const resend = async () => {
    if (secondsLeft > 0 || loading) {
      return;
    }
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setLoading(false);
    setSecondsLeft(RESEND_SECONDS);
  };

  return (
    <AuthBackground>
      <AuthCard>
        <div className="mb-7 flex justify-center">
          <AuthBrandLogo showWordmark={false} size={52} idPrefix="forgotCard" />
        </div>

        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center"
            >
              <motion.div
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-300/60 bg-emerald-50 text-emerald-600 dark:border-emerald-300/40 dark:bg-emerald-500/15 dark:text-emerald-200"
                style={{ animation: "authSuccessPulse 1.8s ease-in-out infinite" }}
              >
                <CheckCircle2 size={30} />
              </motion.div>
              <h1 className={`mb-1 ${authTitle}`}>Email sent</h1>
              <p className={`mb-4 ${authSubtitle}`}>
                Password reset instructions were sent to
                <span className="ml-1 font-semibold text-zinc-800 dark:text-white/80">{email}</span>.
              </p>

              <div className={`mb-4 ${authSuccessBox}`}>
                Check spam/promotions if you do not see it in inbox.
              </div>

              <AuthButton
                type="button"
                variant="secondary"
                onClick={resend}
                disabled={secondsLeft > 0 || loading}
              >
                {secondsLeft > 0 ? `Resend in ${secondsLeft}s` : loading ? "Resending..." : "Resend email"}
              </AuthButton>

              <div className="mt-5">
                <Link to="/login" className={authLink}>
                  Back to Sign In
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h1 className={`mb-1 ${authTitle}`}>Forgot password?</h1>
              <p className={`mb-6 ${authSubtitle}`}>Enter your email and we will send a secure reset link</p>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    className={`mb-4 ${authErrorBox}`}
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={submitRequest} className="space-y-3.5">
                <AuthInput
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="you@example.com"
                  autoComplete="email"
                  success={email.length > 0 && emailValid}
                  error={email.length > 0 && !emailValid ? "Enter a valid email" : ""}
                  disabled={loading}
                />

                <AuthButton type="submit" loading={loading} withArrow>
                  Send Reset Link
                </AuthButton>
              </form>

              <p className={`mt-6 ${authFooter}`}>
                Remember your password?{" "}
                <Link to="/login" className={authLink}>
                  Sign in
                </Link>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </AuthCard>
    </AuthBackground>
  );
}
