import { motion, useMotionValue, useTransform } from "framer-motion";

type AuthCardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function AuthCard({ children, className = "" }: AuthCardProps) {
  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const rotateX = useTransform(my, [0, 100], [6, -6]);
  const rotateY = useTransform(mx, [0, 100], [-6, 6]);

  return (
    <motion.div
      onMouseMove={(e) => {
        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        mx.set(x);
        my.set(y);
      }}
      className={`op-auth-card relative w-full max-w-[30rem] overflow-hidden rounded-[32px] border p-6 backdrop-blur-2xl transition-all duration-500 sm:p-8 bg-white/85 border-zinc-200/70 shadow-[0_20px_80px_rgba(0,0,0,0.08)] dark:bg-[#050816]/80 dark:border-white/10 dark:shadow-[0_20px_100px_rgba(124,58,237,0.25)] ${className}`}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      initial={{ opacity: 0, y: 22, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-100"
        style={{
          background:
            "radial-gradient(220px circle at var(--mx,50%) var(--my,50%), rgba(129,140,248,0.12), transparent 62%)",
        }}
        animate={{ opacity: [0.45, 0.85, 0.45] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div
        className="pointer-events-none absolute inset-0 rounded-[32px] border border-violet-200/40 dark:border-transparent"
        style={{
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.65)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 hidden rounded-[32px] dark:block"
        style={{
          border: "1px solid rgba(139,92,246,0.35)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
          maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.95), rgba(0,0,0,0.25))",
        }}
      />

      <div
        className="pointer-events-none absolute left-[12%] right-[12%] top-0 h-px bg-gradient-to-r from-transparent via-violet-400/70 to-transparent dark:via-[rgba(139,92,246,0.82)]"
      />

      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
