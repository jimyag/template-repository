import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Account } from "@/api/auth";

type AuthStore = {
  token: string | null;
  account: Account | null;
  setSession: (token: string, account: Account) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      account: null,
      setSession: (token, account) => set({ token, account }),
      clear: () => set({ token: null, account: null }),
    }),
    { name: "auth" },
  ),
);
