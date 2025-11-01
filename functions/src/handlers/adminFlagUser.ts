import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

interface FlagUserRequest {
  uid: string;
  reason: string;
}

export const adminFlagUser = functions.https.onCall(async (data: FlagUserRequest, context) => {
  if (!context.auth || !context.auth.token.isAdmin) {
    throw new functions.https.HttpsError("permission-denied", "Admin access required");
  }

  const { uid, reason } = data;

  if (!uid || !reason) {
    throw new functions.https.HttpsError("invalid-argument", "User ID and reason are required");
  }

  try {
    const userRef = db.collection("users").doc(uid);
    
    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new functions.https.HttpsError("not-found", "User not found");
      }

      // Flag the user
      transaction.update(userRef, {
        flagged: true,
      });

      // Create audit log
      const auditLog = {
        action: "user_flagged",
        target_uid: uid,
        admin_uid: context.auth!.uid,
        reason,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      };
      transaction.set(db.collection("admin_audit_logs").doc(), auditLog);
    });

    return { success: true, message: "User flagged successfully" };
  } catch (error: any) {
    console.error("Admin flag user error:", error);
    throw new functions.https.HttpsError("internal", "Failed to flag user");
  }
});
