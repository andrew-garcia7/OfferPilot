import { Router, Request, Response } from "express";
import crypto from "crypto";

const router = Router();

// Lazily load Razorpay so the server still starts if razorpay isn't installed yet
let Razorpay: any = null;
try {
  Razorpay = require("razorpay");
} catch {
  console.warn("[payment] razorpay package not installed — payment routes will return 503");
}

function getRazorpay() {
  if (!Razorpay) return null;
  const keyId     = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

/**
 * POST /api/payment/create-order
 * Body: { amount: number (INR paise), currency?: string, receipt?: string }
 */
router.post("/create-order", async (req: Request, res: Response) => {
  const rzp = getRazorpay();
  if (!rzp) {
    return res.status(503).json({ error: "Payment gateway not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET." });
  }

  const { amount, currency = "INR", receipt = `rcpt_${Date.now()}` } = req.body;

  if (!amount || typeof amount !== "number" || amount < 100) {
    return res.status(400).json({ error: "amount must be a number >= 100 (paise)" });
  }

  try {
    const order = await rzp.orders.create({ amount, currency, receipt });
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err: any) {
    console.error("[payment] create-order error", err);
    res.status(500).json({ error: "Failed to create payment order" });
  }
});

/**
 * POST /api/payment/verify
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
router.post("/verify", (req: Request, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: "Missing payment verification fields" });
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return res.status(503).json({ error: "Payment gateway not configured" });
  }

  const expectedSig = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSig !== razorpay_signature) {
    return res.status(400).json({ verified: false, error: "Signature mismatch" });
  }

  // TODO: Mark user subscription as active in DB
  res.json({ verified: true, paymentId: razorpay_payment_id });
});

export default router;
