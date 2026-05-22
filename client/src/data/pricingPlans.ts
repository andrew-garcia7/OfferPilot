export type PlanId = "free" | "pro" | "team";

export interface PricingFeature {
  text: string;
  included: boolean;
}

export interface PricingPlan {
  id: PlanId;
  name: string;
  description: string;
  badge?: string;
  monthly: number;
  yearly: number;
  cta: string;
  features: PricingFeature[];
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "Everything you need to get started.",
    monthly: 0,
    yearly: 0,
    cta: "Start Free",
    features: [
      { text: "5 mock interviews / month", included: true },
      { text: "Resume ATS scanner", included: true },
      { text: "Basic coding simulator", included: true },
      { text: "JD match score", included: true },
      { text: "Community support", included: true },
      { text: "AI Resume Builder", included: false },
      { text: "Company question banks", included: false },
      { text: "Priority support", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    description: "For serious job seekers in active search.",
    badge: "Most Popular",
    monthly: 19,
    yearly: 11,
    cta: "Start Pro Trial",
    features: [
      { text: "Unlimited mock interviews", included: true },
      { text: "AI Resume Builder + 40 templates", included: true },
      { text: "Full coding simulator (800+ problems)", included: true },
      { text: "Company-specific question banks", included: true },
      { text: "Interview session replay", included: true },
      { text: "AI Career Roadmap", included: true },
      { text: "Priority support", included: true },
      { text: "Team dashboard", included: false },
    ],
  },
  {
    id: "team",
    name: "Team",
    description: "For bootcamps, universities, and squads.",
    badge: "Best Value",
    monthly: 49,
    yearly: 29,
    cta: "Contact Sales",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Team dashboard + analytics", included: true },
      { text: "Bulk seat management", included: true },
      { text: "Dedicated customer success", included: true },
      { text: "Custom question banks", included: true },
      { text: "SOC 2 Type II compliance", included: true },
      { text: "Priority 24/7 support", included: true },
      { text: "Custom integrations", included: true },
    ],
  },
];

export const PLAN_BY_ID = Object.fromEntries(PRICING_PLANS.map((plan) => [plan.id, plan])) as Record<PlanId, PricingPlan>;
