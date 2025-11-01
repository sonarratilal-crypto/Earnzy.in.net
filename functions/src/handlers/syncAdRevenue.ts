import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

interface SyncAdRevenueRequest {
  month: string; // YYYY-MM
  amount_inr: number;
  source: string;
}

export const syncAdRevenue = functions.https.onCall(async (data: SyncAdRevenueRequest, context) => {
  if (!context.auth || !context.auth.token.isAdmin) {
    throw new functions.https.HttpsError("permission-denied", "Admin access required");
  }

  const { month, amount_inr, source } = data;

  if (!month || !amount_inr || !source) {
    throw new functions.https.HttpsError("invalid-argument", "Month, amount and source are required");
  }

  try {
    const revenueRef = db.collection("admin_revenue");

    const revenueEntry = {
      entry_id: `ad_revenue_${month}_${Date.now()}`,
      source: "ad" as const,
      amount_inr,
      meta: { month, source, synced_by: context.auth.uid },
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    await revenueRef.doc(revenueEntry.entry_id).set(revenueEntry);

    return { success: true, entry_id: revenueEntry.entry_id };
  } catch (error: any) {
    console.error("Sync ad revenue error:", error);
    throw new functions.https.HttpsError("internal", "Failed to sync ad revenue");
  }
});
