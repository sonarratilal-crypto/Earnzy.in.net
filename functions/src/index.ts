import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

// Export all handlers
export { onSponsoredTaskCallback } from "./handlers/onSponsoredTaskCallback";
export { requestWithdraw } from "./handlers/requestWithdraw";
export { adminApproveWithdraw } from "./handlers/adminApproveWithdraw";
export { purchasePlan } from "./handlers/purchasePlan";
export { validateReferral } from "./handlers/validateReferral";
export { adminFlagUser } from "./handlers/adminFlagUser";
export { syncAdRevenue } from "./handlers/syncAdRevenue";

// Scheduled function for referral validation
export const scheduledReferralValidation = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async (context) => {
    const validateReferral = (await import("./handlers/validateReferral")).validateReferral;
    return validateReferral({}, context);
  });
