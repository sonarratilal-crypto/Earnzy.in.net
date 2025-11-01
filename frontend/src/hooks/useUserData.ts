import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuthStore } from '../stores/authStore';

interface UserData {
  uid: string;
  phone: string;
  name: string | null;
  plan: "free" | "silver" | "gold" | "platinum";
  coins: number;
  withdrawable_coins: number;
  pending_referral_coins: number;
  tasks_completed: number;
  sponsored_tasks_completed: number;
  referrals: {
    total: number;
    validated: number;
    pending: number;
  };
  flagged: boolean;
  last_withdraw_time: any;
  created_at: any;
}

export const useUserData = () => {
  const { user } = useAuthStore();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setUserData(null);
      setLoading(false);
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(
      userRef,
      (doc) => {
        if (doc.exists()) {
          setUserData(doc.data() as UserData);
        } else {
          setError('User data not found');
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return { userData, loading, error };
};
