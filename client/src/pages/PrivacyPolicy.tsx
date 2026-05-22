import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen py-24 px-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Link to="/" className="text-sm text-[#818CF8] hover:text-white transition mb-8 inline-block">← Back to home</Link>
        <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-white/30 mb-8">Last updated: January 2025</p>
        <div className="space-y-6 text-white/60 text-sm leading-relaxed">
          <p>OfferPilot ("we", "us", "our") is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your information.</p>
          <h2 className="text-white font-bold text-lg">Information We Collect</h2>
          <p>We collect information you provide directly (name, email, resume content) and usage data (interview sessions, performance metrics) to improve our AI coaching services.</p>
          <h2 className="text-white font-bold text-lg">How We Use Your Data</h2>
          <p>Your data is used exclusively to personalize your interview coaching experience. We never sell your personal information to third parties.</p>
          <h2 className="text-white font-bold text-lg">Data Security</h2>
          <p>We use industry-standard encryption (AES-256 at rest, TLS 1.3 in transit) and follow SOC 2 Type II controls to protect your data.</p>
          <h2 className="text-white font-bold text-lg">Contact</h2>
          <p>Questions? Email <a href="mailto:privacy@offerpilot.ai" className="text-[#818CF8] hover:text-white transition">privacy@offerpilot.ai</a></p>
        </div>
      </motion.div>
    </div>
  );
}
