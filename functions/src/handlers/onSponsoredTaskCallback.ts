import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as cors from "cors";

const db = admin.firestore();
const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

interface TaskCallback {
  userUid: string;
  taskId: string;
  externalId: string;
  payout_inr: number;
}

// Anti-fraud: track completions per user
const recentCompletions = new Map<string, number>();

app.post("/", async (req, res) => {
  try {
    const { userUid, taskId, externalId, payout_inr }: TaskCallback = req.body;

    // Validate required fields
    if (!userUid || !taskId || !externalId || !payout_inr) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Basic anti-fraud: rate limiting
    const userKey = `${userUid}_${Date.now() / (60 * 1000)}`; // Per minute
    const userCompletions = recentCompletions.get(userKey) || 0;
    if (userCompletions > 5) {
      return res.status(429).json({ error: "Too many completions" });
    }
    recentCompletions.set(userKey, userCompletions + 1);

    const userRef = db.collection("users").doc(userUid);
    const taskRef = db.collection("sponsored_tasks").doc(taskId);
    const revenueRef = db.collection("admin_revenue");

    await db.runTransaction(async (transaction) => {
      // Get user and task data
      const [userDoc, taskDoc] = await Promise.all([
        transaction.get(userRef),
        transaction.get(taskRef),
      ]);

      if (!userDoc.exists) {
        throw new Error("User not found");
      }

      if (!taskDoc.exists || taskDoc.data()?.status !== "active") {
        throw new Error("Invalid or inactive task");
      }

      const user = userDoc.data()!;
      const task = taskDoc.data()!;

      // Check if user is flagged
      if (user.flagged) {
        throw new Error("User account is flagged");
      }

      // Check for duplicate completion using externalId
      const existingCompletion = await db.collection("task_completions")
        .where("externalId", "==", externalId)
        .limit(1)
        .get();

      if (!existingCompletion.empty) {
        throw new Error("Duplicate task completion");
      }

      // Calculate coins (80% platform, 20% user)
      const platformShare = payout_inr * (task.platform_share_pct / 100);
      const userShare = payout_inr * (task.user_share_pct / 100);
      const userCoins = Math.round(userShare * 1000); // 1000 coins per ₹1

      // Update user
      transaction.update(userRef, {
        coins: admin.firestore.FieldValue.increment(userCoins),
        withdrawable_coins: admin.firestore.FieldValue.increment(userCoins),
        tasks_completed: admin.firestore.FieldValue.increment(1),
        sponsored_tasks_completed: admin.firestore.FieldValue.increment(1),
      });

      // Record platform revenue
      const revenueEntry = {
        entry_id: `task_${taskId}_${externalId}`,
        source: "sponsored_task" as const,
        amount_inr: platformShare,
        meta: { taskId, userUid, externalId, payout_inr },
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      };
      transaction.set(revenueRef.doc(), revenueEntry);

      // Record task completion
      const completionDoc = {
        userUid,
        taskId,
        externalId,
        payout_inr,
        user_coins: userCoins,
        platform_revenue: platformShare,
        completed_at: admin.firestore.FieldValue.serverTimestamp(),
      };
      transaction.set(db.collection("task_completions").doc(), completionDoc);
    });

    res.json({ success: true, message: "Task completed and coins credited" });
  } catch (error: any) {
    console.error("Task callback error:", error);
    res.status(400).json({ error: error.message });
  }
});

export const onSponsoredTaskCallback = functions.https.onRequest(app);
