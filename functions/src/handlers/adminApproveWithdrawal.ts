import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

interface ApproveWithdrawRequest {
  requestId: string;
  approve: boolean;
  note: string;
}

export const adminApproveWithdraw = functions.https.onCall(async (data: ApproveWithdrawRequest, context) => {
  // Admin authentication check
  if (!context.auth || !context.auth.token.isAdmin) {
    throw new functions.https.HttpsError("permission-denied", "Admin access required");
  }

  const { requestId, approve, note } = data;

  if (!requestId) {
    throw new functions.https.HttpsError("invalid-argument", "Request ID is required");
  }

  try {
    const requestRef = db.collection("withdraw_requests").doc(requestId);
    const adminRevenueRef = db.collection("admin_revenue");

    return await db.runTransaction(async (transaction) => {
      const requestDoc = await transaction.get(requestRef);
      if (!requestDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Withdraw request not found");
      }

      const withdrawRequest = requestDoc.data()!;

      if (withdrawRequest.status !== "pending") {
        throw new functions.https.HttpsError("failed-precondition", "Request already processed");
      }

      const userRef = db.collection("users").doc(withdrawRequest.uid);

      if (approve) {
        // Approve the withdrawal
        transaction.update(requestRef, {
          status: "approved",
          reviewed_by: context.auth!.uid,
          reviewed_at: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Record withdrawal fee as platform revenue
        const feeAmount = withdrawRequest.requested_inr - withdrawRequest.final_amount_inr;
        const revenueEntry = {
          entry_id: `withdraw_fee_${requestId}`,
          source: "withdraw_fee" as const,
          amount_inr: feeAmount,
          meta: { requestId, userId: withdrawRequest.uid, fee_pct: withdrawRequest.fee_pct },
          created_at: admin.firestore.FieldValue.serverTimestamp(),
        };
        transaction.set(adminRevenueRef.doc(), revenueEntry);

        // TODO: Integrate with actual Razorpay payout API
        console.log(`Processing payout: ₹${withdrawRequest.final_amount_inr} to user ${withdrawRequest.uid}`);
        
      } else {
        // Reject the withdrawal - refund coins to user
        transaction.update(requestRef, {
          status: "rejected",
          reviewed_by: context.auth!.uid,
          reviewed_at: admin.firestore.FieldValue.serverTimestamp(),
        });

        transaction.update(userRef, {
          withdrawable_coins: admin.firestore.FieldValue.increment(withdrawRequest.requested_coins),
        });
      }

      return { success: true, status: approve ? "approved" : "rejected" };
    });
  } catch (error: any) {
    console.error("Admin approve withdraw error:", error);
    throw new functions.https.HttpsError("internal", "Withdrawal approval failed: " + error.message);
  }
});
