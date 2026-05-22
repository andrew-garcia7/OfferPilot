import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { XCircle, RefreshCw, ArrowLeft, LifeBuoy } from "lucide-react";

export default function PaymentFailure() {
  return (
    <div className="op-dark-page op-payment-failure-page min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ backgroundColor: "#0F0F14", color: "#F1F5F9" }}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 rounded-full"
          style={{ background: "radial-gradient(circle,rgba(239,68,68,0.08),transparent 60%)" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md text-center"
        style={{
          background: "rgba(10,10,22,0.85)",
          border: "1px solid rgba(239,68,68,0.25)",
          borderRadius: "28px",
          backdropFilter: "blur(40px)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 60px rgba(239,68,68,0.06)",
        }}>
        <div className="absolute top-0 left-[15%] right-[15%] h-px rounded-full"
          style={{ background: "linear-gradient(90deg,transparent,rgba(239,68,68,0.45),transparent)" }} />

        <div className="p-10">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 280 }}
            className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
              style={{ background: "rgba(239,68,68,0.12)", border: "2px solid rgba(239,68,68,0.3)" }}>
              <XCircle size={38} className="text-red-400" />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h1 className="text-3xl font-black text-white mb-3 tracking-tight">Payment Failed</h1>
            <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.45)" }}>
              Something went wrong during checkout. No charges were made.
              You can try again or contact support if the issue persists.
            </p>

            <div className="flex flex-col gap-3">
              <Link to="/pricing"
                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm text-white transition-all"
                style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", boxShadow: "0 8px 24px rgba(99,102,241,0.3)" }}>
                <RefreshCw size={14} /> Try Again
              </Link>
              <a
                href="mailto:support@offerpilot.ai?subject=Payment%20Issue"
                className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <LifeBuoy size={14} /> Contact Support
              </a>
              <Link to="/dashboard"
                className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <ArrowLeft size={14} /> Back to Dashboard
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
