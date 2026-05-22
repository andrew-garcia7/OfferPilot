import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";

type AuthButtonProps = {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
  variant?: "primary" | "secondary";
  withArrow?: boolean;
};

export default function AuthButton({
  children,
  loading,
  disabled,
  type = "button",
  onClick,
  variant = "primary",
  withArrow = false,
}: AuthButtonProps) {
  const isDisabled = !!loading || !!disabled;

  if (variant === "secondary") {
    return (
      <motion.button
        type={type}
        onClick={onClick}
        disabled={isDisabled}
        whileHover={{ y: isDisabled ? 0 : -1, scale: isDisabled ? 1 : 1.01 }}
        whileTap={{ scale: isDisabled ? 1 : 0.985 }}
        className="w-full rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60 border-zinc-200 bg-zinc-50 text-zinc-800 hover:bg-white dark:border-white/20 dark:bg-white/8 dark:text-white/90 dark:hover:bg-white/12"
      >
        {children}
      </motion.button>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      whileHover={{ y: isDisabled ? 0 : -1, scale: isDisabled ? 1 : 1.02 }}
      whileTap={{ scale: isDisabled ? 1 : 0.985 }}
      className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-3.5 text-sm font-bold text-white shadow-[0_10px_28px_rgba(124,58,237,0.35)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_10px_40px_rgba(124,58,237,0.45)] disabled:cursor-not-allowed disabled:opacity-80"
    >
      <span
        className="pointer-events-none absolute inset-y-0 left-[-35%] w-[35%] -skew-x-12 opacity-0 transition group-hover:opacity-100"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.42), transparent)",
          animation: isDisabled ? "none" : "authShine 1.2s ease",
        }}
      />

      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
        {children}
        {withArrow && !loading ? (
          <motion.span initial={{ x: 0 }} whileHover={{ x: 3 }} transition={{ duration: 0.2 }}>
            <ArrowRight size={15} />
          </motion.span>
        ) : null}
      </span>
    </motion.button>
  );
}
