export const CONSTANTS = {
  COIN_RATIO: 1000, // 1000 coins = ₹1
  MIN_WITHDRAW_INR: 100,
  WITHDRAW_FEE_PCT: 10,
  PLANS: {
    FREE: 'free',
    SILVER: 'silver', 
    GOLD: 'gold',
    PLATINUM: 'platinum'
  }
} as const;
