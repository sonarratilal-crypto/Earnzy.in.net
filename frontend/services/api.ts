import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

// Withdraw API
export const requestWithdraw = async (uid: string, requestedCoins: number) => {
  const withdrawFunction = httpsCallable(functions, 'requestWithdraw');
  const result = await withdrawFunction({ uid, requested_coins: requestedCoins });
  return result.data;
};

// Plan purchase API
export const purchasePlan = async (uid: string, planId: string, paymentId: string) => {
  const purchaseFunction = httpsCallable(functions, 'purchasePlan');
  const result = await purchaseFunction({ uid, planId, razorpayPaymentId: paymentId });
  return result.data;
};
