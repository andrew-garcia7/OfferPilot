import { API } from "../api";
import type { PlanId } from "../data/pricingPlans";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const PLAN_PRICE: Record<Exclude<PlanId, "free">, { monthly: number; yearly: number }> = {
  pro: { monthly: 19, yearly: 11 },
  team: { monthly: 49, yearly: 29 },
};

export async function ensureRazorpayLoaded(): Promise<void> {
  if (window.Razorpay) return;

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load Razorpay SDK"));
    document.head.appendChild(script);
  });
}

export async function openPlanCheckout(
  planId: Exclude<PlanId, "free">,
  yearly: boolean,
  opts: {
    onSuccess: (payload: { paymentId: string; orderId: string; planId: Exclude<PlanId, "free">; yearly: boolean }) => void;
    onFailure: () => void;
  }
): Promise<void> {
  await ensureRazorpayLoaded();

  const pricing = PLAN_PRICE[planId];
  const amount = (yearly ? pricing.yearly : pricing.monthly) * 100;

  const { data } = await API.post("/api/payment/create-order", {
    amount,
    currency: "INR",
    receipt: `${planId}_${Date.now()}`,
  });

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const rzp = new window.Razorpay!({
    key: data.keyId,
    amount: data.amount,
    currency: data.currency,
    order_id: data.orderId,
    name: "OfferPilot",
    description: `${planId.toUpperCase()} plan (${yearly ? "yearly" : "monthly"})`,
    prefill: {
      name: currentUser?.name || "",
      email: currentUser?.email || "",
    },
    theme: { color: "#6366F1" },
    handler: async (response: any) => {
      try {
        const verify = await API.post("/api/payment/verify", {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });

        if (verify.data?.verified) {
          opts.onSuccess({
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            planId,
            yearly,
          });
          return;
        }
      } catch {
        // fallthrough
      }

      opts.onFailure();
    },
    modal: {
      ondismiss: opts.onFailure,
    },
  });

  rzp.open();
}
