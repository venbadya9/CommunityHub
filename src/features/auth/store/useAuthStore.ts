import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandMMKVStorage } from "../../../shared/services/storage";

interface User {
  id: string;
  email: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setSession: (token: string, user: User) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setSession: (token, user) => set({ token, user, isAuthenticated: true }),
      clearSession: () =>
        set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: "auth-session",
      storage: createJSONStorage(() => zustandMMKVStorage),
    },
  ),
);
