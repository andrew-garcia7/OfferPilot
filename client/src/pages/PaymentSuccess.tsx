import { useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Download, Home, Sparkles } from "lucide-react";
import { downloadInvoicePdf } from "../lib/invoicePdf";

const PLAN_PRICING: Record<string, { monthly: number; yearly: number }> = {
  PRO: { monthly: 19, yearly: 11 },
  TEAM: { monthly: 49, yearly: 29 },
};

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const paymentId = params.get("payment_id") || "";
  const orderId = params.get("order_id") || "";
  const plan = (params.get("plan") || "PRO").toUpperCase();
  const cycle = params.get("cycle") || "monthly";

  const issuedAt = useMemo(() => new Date(), []);
  const amountPaid = useMemo(() => {
    const selected = PLAN_PRICING[plan] || PLAN_PRICING.PRO;
    return cycle === "yearly" ? selected.yearly : selected.monthly;
  }, [plan, cycle]);

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    localStorage.setItem("user", JSON.stringify({ ...user, plan, paymentId, orderId }));
    window.dispatchEvent(new Event("auth-change"));
  }, [plan, paymentId, orderId]);

  const downloadReceipt = () => {
    downloadInvoicePdf({
      paymentId,
      orderId,
      billingCycle: cycle,
      amountPaid,
      currency: "INR",
      userEmail: currentUser?.email || "",
      plan,
      createdAt: issuedAt,
    });
  };

  return (
    <div className="op-dark-page op-payment-success-page relative min-h-screen overflow-hidden px-4 pb-16 pt-32 md:pt-36" style={{ backgroundColor: "#090b1a", color: "#F1F5F9" }}>
      <div className="pointer-events-none fixed inset-0">
        <motion.div
          className="absolute left-1/2 top-30 h-90 w-90 -translate-x-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.24), transparent 68%)" }}
          animate={{ scale: [0.95, 1.08, 0.95], opacity: [0.25, 0.45, 0.25] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute left-1/2 top-8 h-100 w-100 -translate-x-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.16), transparent 72%)" }}
          animate={{ y: [0, -16, 0], opacity: [0.22, 0.32, 0.22] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        {Array.from({ length: 14 }).map((_, i) => (
          <motion.span
            key={`particle-${i}`}
            className="absolute h-1.5 w-1.5 rounded-full bg-emerald-300/70"
            initial={{ x: `${6 + i * 6}vw`, y: `${18 + (i % 4) * 14}vh`, opacity: 0.15 }}
            animate={{
              y: [`${20 + (i % 4) * 14}vh`, `${17 + (i % 4) * 13}vh`, `${20 + (i % 4) * 14}vh`],
              opacity: [0.1, 0.45, 0.1],
              scale: [0.9, 1.2, 0.9],
            }}
            transition={{ duration: 3 + i * 0.15, repeat: Infinity, ease: "easeInOut", delay: i * 0.05 }}
          />
        ))}
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-2xl items-start justify-center md:min-h-[calc(100vh-9rem)] md:items-center">
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.975 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full overflow-hidden rounded-[30px] border border-emerald-400/20 bg-[#090b1a]/90 p-7 text-center md:p-10"
          style={{ boxShadow: "0 16px 44px rgba(0,0,0,0.42)" }}
        >
          <div className="absolute inset-0 pointer-events-none bg-linear-to-b from-emerald-500/6 via-transparent to-transparent" />
          <div className="absolute left-[18%] right-[18%] top-0 h-px bg-linear-to-r from-transparent via-emerald-300/70 to-transparent" />

          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="mb-6 flex justify-center"
          >
            <motion.div
              animate={{ boxShadow: ["0 0 0 rgba(16,185,129,0)", "0 0 0 9px rgba(16,185,129,0.16)", "0 0 0 rgba(16,185,129,0)"] }}
              transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.2 }}
              className="grid h-24 w-24 place-items-center rounded-[26px] border border-emerald-300/25 bg-emerald-500/10"
            >
              <svg width="46" height="46" viewBox="0 0 46 46" fill="none" aria-hidden="true">
                <circle cx="23" cy="23" r="19" stroke="rgba(52,211,153,0.45)" strokeWidth="2" />
                <motion.path
                  d="M15.5 23.5l5 5.2 10-10.7"
                  stroke="#34D399"
                  strokeWidth="3.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0.4 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 0.35, duration: 0.55, ease: "easeOut" }}
                />
              </svg>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-300/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-300">
              <Sparkles size={10} /> Payment Successful
            </div>
            <h1 className="mb-3 text-5xl font-black tracking-[-0.04em] text-white">
              You're all set! <span aria-hidden="true">🎉</span>
            </h1>
            <p className="mb-6 text-lg text-white/55">
              Welcome to <span className="font-bold text-white">{plan}</span> — your AI interview coach is ready.
            </p>

            <div className="mb-7 rounded-2xl border border-white/12 bg-white/4 p-5 text-left text-sm text-white/45">
              <div className="mb-1 flex justify-between gap-4">
                <span>Plan</span>
                <span className="font-semibold text-white/80">{plan}</span>
              </div>
              <div className="mb-1 flex justify-between gap-4">
                <span>Billing</span>
                <span className="font-semibold text-white/80">{cycle}</span>
              </div>
              <div className="mb-1 flex justify-between gap-4">
                <span>Amount Paid</span>
                <span className="font-semibold text-white/80">INR {amountPaid.toFixed(2)}</span>
              </div>
              {paymentId && (
                <div className="mb-1 flex justify-between gap-3">
                  <span>Payment ID</span>
                  <span className="truncate font-semibold text-white/80">{paymentId}</span>
                </div>
              )}
              {orderId && (
                <div className="mb-1 flex justify-between gap-3">
                  <span>Order ID</span>
                  <span className="truncate font-semibold text-white/80">{orderId}</span>
                </div>
              )}
              <div className="mb-1 flex justify-between gap-4">
                <span>Email</span>
                <span className="truncate font-semibold text-white/80">{currentUser?.email || "N/A"}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Date</span>
                <span className="font-semibold text-white/80">{issuedAt.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <motion.button
                onClick={downloadReceipt}
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ y: 0, scale: 0.99 }}
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/8 py-3 text-sm font-semibold text-white/85 transition-colors hover:bg-white/12"
              >
                <Download size={14} /> Download receipt
              </motion.button>

              <motion.div whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Link
                  to="/dashboard"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-emerald-500 to-emerald-600 py-3.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(16,185,129,0.28)]"
                >
                  Go to Dashboard <ArrowRight size={15} />
                </Link>
              </motion.div>

              <motion.div whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Link
                  to="/new"
                  className="block rounded-2xl border border-white/12 bg-white/6 py-3 text-sm font-semibold text-white/75 transition-colors hover:bg-white/10"
                >
                  Start a Mock Interview
                </Link>
              </motion.div>

              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.99 }}>
                <Link to="/" className="flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white/65 transition-colors hover:text-white">
                  <Home size={14} /> Back home
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
