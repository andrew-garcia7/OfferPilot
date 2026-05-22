import { motion } from "framer-motion";

type AuthSocialButtonProps = {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export default function AuthSocialButton({
  icon,
  label,
  onClick,
  loading,
  disabled,
}: AuthSocialButtonProps) {
  const isDisabled = !!disabled || !!loading;

  return (
    <motion.button
      type="button"
      whileHover={{ y: isDisabled ? 0 : -2, scale: isDisabled ? 1 : 1.02 }}
      whileTap={{ scale: isDisabled ? 1 : 0.985 }}
      onClick={onClick}
      disabled={isDisabled}
      className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl border px-4 py-3 text-sm font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-70 bg-white/95 border-zinc-200/90 text-zinc-800 shadow-[0_8px_24px_rgba(15,23,42,0.06)] hover:border-violet-300/60 hover:shadow-[0_12px_32px_rgba(124,58,237,0.12)] dark:bg-white/[0.06] dark:border-white/15 dark:text-white/90 dark:shadow-none dark:hover:border-white/30 dark:hover:bg-white/[0.11] dark:hover:shadow-[0_8px_28px_rgba(124,58,237,0.2)]"
    >
      <span
        className="pointer-events-none absolute inset-y-0 left-[-40%] w-2/5 -skew-x-12 opacity-0 transition group-hover:opacity-100 dark:opacity-0 dark:group-hover:opacity-100"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.38), transparent)",
          animation: isDisabled ? "none" : "authShine 1.2s ease",
        }}
      />
      <span className="relative z-10 flex items-center gap-2.5">
        {icon}
        {loading ? "Redirecting..." : label}
      </span>
    </motion.button>
  );
}
