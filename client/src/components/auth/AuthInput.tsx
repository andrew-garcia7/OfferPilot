import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

type AuthInputProps = {
  label: string;
  type?: "text" | "email" | "password";
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
  error?: string;
  success?: boolean;
};

export default function AuthInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  disabled,
  error,
  success,
}: AuthInputProps) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const asPassword = type === "password";
  const renderedType = asPassword ? (showPassword ? "text" : "password") : type;

  const borderClass = error
    ? "border-red-400 dark:border-red-400/65"
    : success
      ? "border-emerald-400 dark:border-emerald-400/65"
      : focused
        ? "border-violet-500 dark:border-indigo-400/75"
        : "border-zinc-300 dark:border-white/10";

  const ringClass = error
    ? "focus:ring-red-500/20"
    : success
      ? "focus:ring-emerald-500/20"
      : "focus:ring-violet-500/20";

  return (
    <div>
      {label ? (
        <label className="mb-1.5 block text-xs font-semibold text-zinc-600 transition-colors duration-500 dark:text-zinc-400">
          {label}
        </label>
      ) : null}

      <div className="relative">
        <input
          type={renderedType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full rounded-2xl border px-5 py-4 text-base outline-none transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-70 bg-white/90 text-zinc-900 placeholder:text-zinc-400 focus:border-violet-500 focus:ring-4 dark:bg-white/10 dark:text-white dark:placeholder:text-zinc-500 ${borderClass} ${ringClass}`}
        />

        {asPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-zinc-700 dark:text-white/45 dark:hover:text-white/80"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}

        <motion.span
          className="pointer-events-none absolute bottom-0 left-4 h-[1.5px] rounded-full"
          animate={{ width: focused ? "40%" : "0%", opacity: focused ? 1 : 0 }}
          transition={{ duration: 0.22 }}
          style={{ background: "linear-gradient(90deg, #818CF8, #C084FC)" }}
        />
      </div>

      {error && (
        <p className="mt-1.5 text-[11px] font-medium text-red-600 dark:text-red-300">{error}</p>
      )}
      {!error && success && (
        <p className="mt-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-300">Looks good</p>
      )}
    </div>
  );
}
