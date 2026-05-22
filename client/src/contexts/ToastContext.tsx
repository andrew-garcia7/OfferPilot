import { createContext, useContext, useState, useCallback, useRef } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastCtx {
  toast: (message: string, type?: ToastType) => void;
}

const Ctx = createContext<ToastCtx>({ toast: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = ++nextId.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  }, []);

  const iconFor = (type: ToastType) =>
    type === "success" ? (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
    ) : type === "error" ? (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    ) : (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    );

  const colorsFor = (type: ToastType) => ({
    background:   type === "success" ? "rgba(16,185,129,0.15)"  : type === "error" ? "rgba(239,68,68,0.15)"   : "rgba(99,102,241,0.15)",
    border:       type === "success" ? "rgba(16,185,129,0.35)"  : type === "error" ? "rgba(239,68,68,0.35)"   : "rgba(99,102,241,0.35)",
    color:        type === "success" ? "#6EE7B7"                : type === "error" ? "#FCA5A5"                : "#A5B4FC",
    iconBg:       type === "success" ? "rgba(16,185,129,0.2)"   : type === "error" ? "rgba(239,68,68,0.2)"   : "rgba(99,102,241,0.2)",
  });

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="fixed top-5 right-5 z-9999 flex flex-col gap-2.5 pointer-events-none max-w-sm w-full">
        <AnimatePresence mode="popLayout">
          {toasts.map(t => {
            const c = colorsFor(t.type);
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, x: 80, scale: 0.88 }}
                animate={{ opacity: 1, x: 0,  scale: 1 }}
                exit={{ opacity: 0,   x: 80,  scale: 0.88 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold pointer-events-auto shadow-2xl shadow-black/50"
                style={{
                  background:    c.background,
                  border:        `1px solid ${c.border}`,
                  backdropFilter: "blur(24px)",
                  color:          c.color,
                }}
              >
                <span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-current"
                  style={{ background: c.iconBg }}>
                  {iconFor(t.type)}
                </span>
                <span className="leading-snug">{t.message}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
