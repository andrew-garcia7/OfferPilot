import { motion, useMotionValue, useSpring } from "framer-motion";
import { useMemo } from "react";

type AuthBackgroundProps = {
  children: React.ReactNode;
};

export default function AuthBackground({ children }: AuthBackgroundProps) {
  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const sx = useSpring(mx, { stiffness: 90, damping: 20, mass: 0.2 });
  const sy = useSpring(my, { stiffness: 90, damping: 20, mass: 0.2 });

  const particles = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        id: i,
        left: `${8 + ((i * 7.1) % 82)}%`,
        top: `${6 + ((i * 9.3) % 84)}%`,
        delay: i * 0.23,
        duration: 7 + (i % 5),
      })),
    []
  );

  return (
    <div
      className="op-auth-page relative min-h-screen overflow-hidden bg-[var(--theme-bg)] px-4 py-8 transition-colors duration-500 sm:py-12"
      onMouseMove={(e) => {
        const w = window.innerWidth || 1;
        const h = window.innerHeight || 1;
        mx.set((e.clientX / w) * 100);
        my.set((e.clientY / h) * 100);
      }}
    >
      <div className="pointer-events-none absolute inset-0 transition-opacity duration-500">
        {/* Light mode background */}
        <div
          className="absolute inset-0 opacity-100 transition-opacity duration-500 dark:opacity-0"
          style={{
            background:
              "linear-gradient(180deg, #f8fafc 0%, #eef2ff 40%, #ffffff 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-100 transition-opacity duration-500 dark:opacity-0"
          style={{
            background:
              "radial-gradient(900px 500px at 8% -5%, rgba(139,92,246,0.14), transparent 55%), radial-gradient(700px 480px at 92% 5%, rgba(99,102,241,0.1), transparent 52%), radial-gradient(600px 400px at 50% 100%, rgba(59,130,246,0.06), transparent 60%)",
          }}
        />

        {/* Dark mode background */}
        <div
          className="absolute inset-0 opacity-0 transition-opacity duration-500 dark:opacity-100"
          style={{
            background:
              "radial-gradient(1200px 600px at 10% -10%, rgba(99,102,241,0.26), transparent 55%), radial-gradient(900px 700px at 95% 0%, rgba(217,70,239,0.16), transparent 52%), linear-gradient(180deg, rgba(13,17,30,0.82), rgba(4,7,17,0.98))",
          }}
        />

        <div
          className="absolute inset-0 opacity-30 transition-opacity duration-500 dark:opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
            maskImage: "radial-gradient(circle at 50% 30%, rgba(0,0,0,0.75), transparent 82%)",
          }}
        />

        <motion.div
          className="absolute -left-28 top-10 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl dark:hidden"
          animate={{ x: [0, 24, -12, 0], y: [0, -20, 18, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -left-28 top-10 hidden h-72 w-72 rounded-full dark:block"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.2), transparent 70%)" }}
          animate={{ x: [0, 24, -12, 0], y: [0, -20, 18, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-16 bottom-8 h-80 w-80 rounded-full bg-violet-400/15 blur-3xl dark:hidden"
          animate={{ x: [0, -30, 20, 0], y: [0, 18, -14, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-16 bottom-8 hidden h-80 w-80 rounded-full dark:block"
          style={{ background: "radial-gradient(circle, rgba(168,85,247,0.16), transparent 70%)" }}
          animate={{ x: [0, -30, 20, 0], y: [0, 18, -14, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="absolute h-80 w-80 rounded-full blur-[18px] transition-opacity duration-500"
          style={{
            left: sx,
            top: sy,
            transform: "translate(-50%, -50%)",
            background:
              "radial-gradient(circle, rgba(167,139,250,0.12), rgba(139,92,246,0.05) 30%, transparent 70%)",
          }}
        />
        <motion.div
          className="absolute hidden h-80 w-80 rounded-full dark:block"
          style={{
            left: sx,
            top: sy,
            transform: "translate(-50%, -50%)",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.11), rgba(139,92,246,0.06) 30%, transparent 70%)",
            filter: "blur(18px)",
          }}
        />

        {particles.map((p) => (
          <motion.span
            key={p.id}
            className="absolute block h-1.5 w-1.5 rounded-full bg-violet-400/20 shadow-[0_0_12px_rgba(139,92,246,0.35)] dark:bg-violet-500/40 dark:shadow-[0_0_14px_rgba(139,92,246,0.5)]"
            style={{ left: p.left, top: p.top }}
            animate={{ y: [0, -12, 0], opacity: [0.25, 0.9, 0.25], scale: [1, 1.3, 1] }}
            transition={{ duration: p.duration, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
          />
        ))}
      </div>

      <motion.div
        className="relative z-10 flex min-h-[calc(100vh-5rem)] items-center justify-center py-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}
