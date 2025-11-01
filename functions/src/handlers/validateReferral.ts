import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

export const validateReferral = functions.https.onCall(async (data, context) => {
  // This can be called manually or by scheduled function
  if (context.auth && !context.auth.token.isAdmin) {
    throw new functions.https.HttpsError("permission-denied", "Admin access required");
  }

  try {
    const now = admin.firestore.Timestamp.now();
    const thirtyDaysAgo = new Date(now.toDate().getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get pending referrals
    const pendingRefs = await db.collection("referral_events")
      .where("validated", "==", false)
      .get();

    let validatedCount = 0;

    for (const refDoc of pendingRefs.docs) {
      const refData = refDoc.data();
      
      // Check if referral is older than 30 days and referee is inactive
      if (refData.created_at.toDate() < thirtyDaysAgo) {
        // Mark as expired
        await refDoc.ref.update({ validated: false }); // Keep false but could add expired flag
        continue;
      }

      // Get referee data
      const refereeDoc = await db.collection("users").doc(refData.referee_uid).get();
      if (!refereeDoc.exists) continue;

      const referee = refereeDoc.data()!;
      
      let shouldValidate = false;
      
      // Check validation rules based on referral type
      switch (refData.type) {
        case "free_to_free":
        case "free_to_paid":
          shouldValidate = referee.sponsored_tasks_completed >= 3;
          break;
        case "paid_to_paid":
          const sevenDaysAgo = new Date(now.toDate().getTime() - 7 * 24 * 60 * 60 * 1000);
          const isOlderThan7Days = refData.created_at.toDate() < sevenDaysAgo;
          shouldValidate = isOlderThan7Days && referee.sponsored_tasks_completed >= 3;
          break;
      }

      if (shouldValidate) {
        const referrerRef = db.collection("users").doc(refData.referrer_uid);
        
        await db.runTransaction(async (transaction) => {
          // Move coins from pending to withdrawable
          transaction.update(referrerRef, {
            pending_referral_coins: admin.firestore.FieldValue.increment(-refData.amount_coins_pending),
            withdrawable_coins: admin.firestore.FieldValue.increment(refData.amount_coins_pending),
          });

          // Mark referral as validated
          transaction.update(refDoc.ref, {
            validated: true,
            validated_at: now,
          });
        });

        validatedCount++;
      }
    }

    return { success: true, validated_count: validatedCount };
  } catch (error) {
    console.error("Referral validation error:", error);
    throw new functions.https.HttpsError("internal", "Referral validation failed");
  }
});
