import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { API } from "../api";
import { useAuth } from "../contexts/AuthContext";
import { normalizeAuthUser } from "../lib/avatar";
import AuthBackground from "../components/auth/AuthBackground";
import AuthCard from "../components/auth/AuthCard";
import AuthBrandLogo from "../components/auth/AuthBrandLogo";
import AuthInput from "../components/auth/AuthInput";
import AuthButton from "../components/auth/AuthButton";
import AuthSocialButton from "../components/auth/AuthSocialButton";
import AuthDivider from "../components/auth/AuthDivider";
import {
  authTitle,
  authSubtitle,
  authFooter,
  authFooterSmall,
  authLink,
  authErrorBox,
} from "../components/auth/authTheme";

const API_URL = import.meta.env.VITE_API_URL?.trim() || "http://localhost:4000";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
      <path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z" />
      <path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 0 0 0 10.76l3.98-3.09z" />
      <path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function PasswordStrength({ value }: { value: string }) {
  const checks = [
    value.length >= 8,
    /[A-Z]/.test(value),
    /[0-9]/.test(value),
    /[^a-zA-Z0-9]/.test(value),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ["Weak", "Fair", "Good", "Strong"];
  const colors = ["#EF4444", "#F59E0B", "#60A5FA", "#34D399"];

  if (!value) {
    return null;
  }

  return (
    <div className="mt-2">
      <div className="mb-1 flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full"
            style={{ background: i < score ? colors[Math.max(0, score - 1)] : "color-mix(in srgb, var(--theme-text) 12%, transparent)" }}
          />
        ))}
      </div>
      <p className="text-[11px] font-medium" style={{ color: colors[Math.max(0, score - 1)] }}>
        {labels[Math.max(0, score - 1)]}
      </p>
    </div>
  );
}

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const emailValid = useMemo(() => /^\S+@\S+\.\S+$/.test(email), [email]);
  const nameValid = useMemo(() => name.trim().length >= 2, [name]);

  const handleGoogleSignup = () => {
    setGoogleLoading(true);
    window.location.href = `${API_URL}/api/auth/signin/google`;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/api/auth/register", { name, email, password });
      login(res.data.token, normalizeAuthUser(res.data.user) ?? res.data.user);
      setSuccess(true);
      setTimeout(() => navigate("/onboarding", { replace: true }), 900);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthBackground>
      <AuthCard>
        <div className="mb-7 flex justify-center">
          <AuthBrandLogo showWordmark={false} size={52} idPrefix="registerCard" />
        </div>

        <h1 className={`mb-1 ${authTitle}`}>Create your account</h1>
        <p className={`mb-6 ${authSubtitle}`}>Build your interview edge with OfferPilot AI</p>

        <div className="mb-5 flex flex-col gap-2.5">
          <AuthSocialButton icon={<GoogleIcon />} label="Sign up with Google" onClick={handleGoogleSignup} loading={googleLoading} disabled={googleLoading || loading} />
          <AuthSocialButton
  icon={<GitHubIcon />}
  label="Sign up with GitHub"
  onClick={() => {
    setGoogleLoading(true);
    window.location.href = `${API_URL}/api/auth/github`;
  }}
  loading={googleLoading}
  disabled={googleLoading || loading}
/>
        </div>

        <AuthDivider />

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

        <form onSubmit={handleRegister} className="space-y-3.5">
          <AuthInput
            label="Full Name"
            type="text"
            value={name}
            onChange={setName}
            placeholder="Alex Johnson"
            autoComplete="name"
            success={name.length > 0 && nameValid}
            error={name.length > 0 && !nameValid ? "Name is too short" : ""}
            disabled={loading || googleLoading || success}
          />

          <AuthInput
            label="Email Address"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            autoComplete="email"
            success={email.length > 0 && emailValid}
            error={email.length > 0 && !emailValid ? "Enter a valid email" : ""}
            disabled={loading || googleLoading || success}
          />

          <div>
            <AuthInput
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              success={password.length >= 8}
              disabled={loading || googleLoading || success}
            />
            <PasswordStrength value={password} />
          </div>

          <AuthButton type="submit" loading={loading} disabled={success || googleLoading} withArrow>
            {success ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} />
                Account created
              </span>
            ) : (
              "Create Account"
            )}
          </AuthButton>
        </form>

        <p className={`mt-5 ${authFooterSmall}`}>
          By creating an account, you agree to our{" "}
          <Link to="/terms" className={authLink}>
            Terms
          </Link>
          {" "}and{" "}
          <Link to="/privacy" className={authLink}>
            Privacy Policy
          </Link>
          .
        </p>

        <p className={`mt-3 ${authFooter}`}>
          Already have an account?{" "}
          <Link to="/login" className={authLink}>
            Sign in
          </Link>
        </p>
      </AuthCard>
    </AuthBackground>
  );
}
