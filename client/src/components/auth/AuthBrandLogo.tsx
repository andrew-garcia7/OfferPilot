import { motion } from "framer-motion";

type AuthBrandLogoProps = {
  size?: number;
  showWordmark?: boolean;
  idPrefix?: string;
  animate?: boolean;
};

export default function AuthBrandLogo({
  size = 36,
  showWordmark = true,
  idPrefix = "auth",
  animate = true,
}: AuthBrandLogoProps) {
  const icon = (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={`${idPrefix}LogoGrad`} x1="0" y1="36" x2="36" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <filter id={`${idPrefix}Glow`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="36" height="36" rx="9" fill={`url(#${idPrefix}LogoGrad)`} />
      <ellipse cx="18" cy="5" rx="12" ry="5" fill="white" fillOpacity="0.1" />
      <line x1="18" y1="20" x2="18" y2="10" stroke="white" strokeWidth="2.6" strokeLinecap="round" filter={`url(#${idPrefix}Glow)`} />
      <polyline points="15.2,13 18,10 20.8,13" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="18" y1="20" x2="26.5" y2="25.5" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeOpacity="0.55" />
      <line x1="18" y1="20" x2="9.5" y2="25.5" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeOpacity="0.55" />
      <circle cx="18" cy="20" r="3" fill="white" fillOpacity="0.97" />
      <circle cx="18" cy="20" r="1.3" fill={`url(#${idPrefix}LogoGrad)`} />
    </svg>
  );

  return (
    <div className="flex items-center gap-3">
      {animate ? (
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          className="drop-shadow-[0_0_20px_rgba(129,140,248,0.3)]"
        >
          {icon}
        </motion.div>
      ) : (
        <div className="drop-shadow-[0_0_20px_rgba(129,140,248,0.3)]">{icon}</div>
      )}

      {showWordmark && (
        <span className="select-none text-[17px] font-extrabold tracking-[-0.02em] text-zinc-900 transition-colors duration-500 dark:text-white">
          Offer
          <span
            style={{
              background: "linear-gradient(135deg,#818CF8,#A78BFA)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Pilot
          </span>
        </span>
      )}
    </div>
  );
}
