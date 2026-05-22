import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function TermsOfService() {
  return (
    <div className="min-h-screen py-24 px-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Link to="/" className="text-sm text-[#818CF8] hover:text-white transition mb-8 inline-block">← Back to home</Link>
        <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Terms of Service</h1>
        <p className="text-sm text-white/30 mb-8">Last updated: January 2025</p>
        <div className="space-y-6 text-white/60 text-sm leading-relaxed">
          <p>By accessing OfferPilot, you agree to these Terms of Service. Please read them carefully.</p>
          <h2 className="text-white font-bold text-lg">Acceptable Use</h2>
          <p>You may use OfferPilot for lawful purposes only. You agree not to misuse our AI systems, scrape data, or attempt to reverse-engineer our platform.</p>
          <h2 className="text-white font-bold text-lg">Subscriptions & Billing</h2>
          <p>Paid subscriptions are billed in advance. Cancellations take effect at the end of the current billing period. No refunds are issued for partial periods.</p>
          <h2 className="text-white font-bold text-lg">Intellectual Property</h2>
          <p>All content, models, and interfaces on OfferPilot are proprietary. Your resume and interview data remain yours at all times.</p>
          <h2 className="text-white font-bold text-lg">Limitation of Liability</h2>
          <p>OfferPilot is provided "as is". We do not guarantee specific employment outcomes and are not liable for indirect or consequential damages.</p>
          <h2 className="text-white font-bold text-lg">Contact</h2>
          <p>Questions? Email <a href="mailto:legal@offerpilot.ai" className="text-[#818CF8] hover:text-white transition">legal@offerpilot.ai</a></p>
        </div>
      </motion.div>
    </div>
  );
}
