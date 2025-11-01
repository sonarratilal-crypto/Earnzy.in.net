import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

interface PlanPurchase {
  uid: string;
  planId: "silver" | "gold" | "platinum";
  razorpayPaymentId: string;
}

const PLAN_PRICES = {
  silver: 99,
  gold: 249,
  platinum: 499,
};

export const purchasePlan = functions.https.onCall(async (data: PlanPurchase, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
  }

  const { uid, planId, razorpayPaymentId } = data;

  if (uid !== context.auth.uid) {
    throw new functions.https.HttpsError("permission-denied", "Can only purchase for own account");
  }

  if (!PLAN_PRICES[planId]) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid plan ID");
  }

  try {
    // Verify payment with Razorpay
    const payment = await razorpay.payments.fetch(razorpayPaymentId);
    
    if (payment.status !== "captured") {
      throw new functions.https.HttpsError("failed-precondition", "Payment not captured");
    }

    const expectedAmount = PLAN_PRICES[planId] * 100; // Razorpay uses paise
    if (payment.amount !== expectedAmount) {
      throw new functions.https.HttpsError("invalid-argument", "Payment amount mismatch");
    }

    const userRef = db.collection("users").doc(uid);
    const revenueRef = db.collection("admin_revenue");

    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new functions.https.HttpsError("not-found", "User not found");
      }

      // Calculate plan expiry (30 days from now)
      const now = admin.firestore.Timestamp.now();
      const expiryDate = new Date(now.toDate());
      expiryDate.setDate(expiryDate.getDate() + 30);

      // Update user plan
      transaction.update(userRef, {
        plan: planId,
        plan_expires_at: admin.firestore.Timestamp.fromDate(expiryDate),
      });

      // Record revenue
      const revenueEntry = {
        entry_id: `plan_${planId}_${razorpayPaymentId}`,
        source: "plan_purchase" as const,
        amount_inr: PLAN_PRICES[planId],
        meta: { planId, userId: uid, razorpayPaymentId },
        created_at: now,
      };
      transaction.set(revenueRef.doc(), revenueEntry);
    });

    return { success: true, plan: planId, expires_at: new Date().setDate(new Date().getDate() + 30) };
  } catch (error: any) {
    console.error("Plan purchase error:", error);
    throw new functions.https.HttpsError("internal", "Plan purchase failed: " + error.message);
  }
});
