import { motion } from "framer-motion";

type AuthDividerProps = {
  label?: string;
};

export default function AuthDivider({ label = "or with email" }: AuthDividerProps) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <motion.div
        className="h-px flex-1 bg-zinc-300 transition-colors duration-500 dark:bg-white/10"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.35 }}
      />
      <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500 transition-colors duration-500 dark:text-zinc-500">
        {label}
      </span>
      <motion.div
        className="h-px flex-1 bg-zinc-300 transition-colors duration-500 dark:bg-white/10"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.35 }}
      />
    </div>
  );
}
