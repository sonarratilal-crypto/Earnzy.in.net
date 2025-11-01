import { create } from 'zustand';

interface UserStore {
  withdrawHistory: any[];
  setWithdrawHistory: (history: any[]) => void;
  tasks: any[];
  setTasks: (tasks: any[]) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  withdrawHistory: [],
  setWithdrawHistory: (history) => set({ withdrawHistory: history }),
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
}));
