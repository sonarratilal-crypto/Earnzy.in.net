import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();
const COIN_RATIO = 1000;
const MIN_WITHDRAW_INR = 100;
const WITHDRAW_FEE_PCT = 10;

interface WithdrawRequest {
  uid: string;
  requested_coins: number;
}

export const requestWithdraw = functions.https.onCall(async (data: WithdrawRequest, context) => {
  // Authentication check
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
  }

  const { uid, requested_coins } = data;

  // Input validation
  if (!uid || !requested_coins) {
    throw new functions.https.HttpsError("invalid-argument", "Missing required fields");
  }

  if (uid !== context.auth.uid) {
    throw new functions.https.HttpsError("permission-denied", "Can only withdraw for own account");
  }

  try {
    const userRef = db.collection("users").doc(uid);
    const withdrawRequestsRef = db.collection("withdraw_requests");

    return await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new functions.https.HttpsError("not-found", "User not found");
      }

      const user = userDoc.data()!;

      // Check if user is flagged
      if (user.flagged) {
        throw new functions.https.HttpsError("permission-denied", "Account is flagged for review");
      }

      // Convert coins to INR
      const requested_inr = requested_coins / COIN_RATIO;

      // Check minimum withdraw amount
      if (requested_inr < MIN_WITHDRAW_INR) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Minimum withdraw amount is ₹${MIN_WITHDRAW_INR}`
        );
      }

      // Check sufficient withdrawable coins
      if (user.withdrawable_coins < requested_coins) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "Insufficient withdrawable coins"
        );
      }

      // Check 1 withdraw per day
      const now = admin.firestore.Timestamp.now();
      const oneDayAgo = new Date(now.toDate().getTime() - 24 * 60 * 60 * 1000);
      
      if (user.last_withdraw_time && user.last_withdraw_time.toDate() > oneDayAgo) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "Only one withdraw allowed per day"
        );
      }

      // Check sponsored tasks requirement
      const requiredTasks = Math.floor(requested_inr / 100);
      if (user.sponsored_tasks_completed < requiredTasks) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Need ${requiredTasks} sponsored tasks completed (currently: ${user.sponsored_tasks_completed})`
        );
      }

      // Calculate fee and final amount
      const fee_pct = WITHDRAW_FEE_PCT;
      const final_amount_inr = requested_inr * (1 - fee_pct / 100);

      // Check if first withdrawal
      const userWithdrawals = await transaction.get(
        withdrawRequestsRef.where("uid", "==", uid).where("status", "in", ["approved", "pending"])
      );
      const isFirstWithdrawal = userWithdrawals.empty;

      // Check if KYC required for large amount
      const kyc_required = isFirstWithdrawal || requested_inr >= 2000;

      // Create withdraw request
      const requestId = `withdraw_${uid}_${Date.now()}`;
      const withdrawRequest = {
        request_id: requestId,
        uid,
        requested_coins,
        requested_inr,
        fee_pct,
        final_amount_inr,
        status: "pending" as const,
        created_at: now,
        reviewed_by: null,
        reviewed_at: null,
        kyc_required,
      };

      // Update user coins and last withdraw time
      transaction.update(userRef, {
        withdrawable_coins: admin.firestore.FieldValue.increment(-requested_coins),
        last_withdraw_time: now,
      });

      // Create withdraw request document
      transaction.set(withdrawRequestsRef.doc(requestId), withdrawRequest);

      return {
        success: true,
        request_id: requestId,
        final_amount_inr,
        kyc_required,
      };
    });
  } catch (error) {
    console.error("Withdraw request error:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "Withdrawal request failed");
  }
});
