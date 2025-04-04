import { create } from "zustand";
import { persist } from "zustand/middleware";

// Interfaz de AuthUser importada de auth.ts
export interface User {
  id: string;
  clerkId?: string;
  username?: string;
  email?: string;
  fullName?: string;
  role?: string;
  initials?: string;
  name?: string; // Para compatibilidad con el sidebar
  imageUrl?: string;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      clearUser: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: "efectivio-user-storage",
    }
  )
);

interface AppState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist((set) => ({
    isSidebarOpen: true, // Por defecto, la barra lateral está abierta
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  }), {
    name: 'efectivio-sidebar-storage',
    // Para solucionar problemas de estado en localStorage, configuramos skipHydration
    skipHydration: true
  })
);

interface AccountingState {
  fiscalYearStart: Date;
  currentPeriod: {
    start: Date;
    end: Date;
  };
  setPeriod: (start: Date, end: Date) => void;
  setFiscalYearStart: (date: Date) => void;
}

export const useAccountingStore = create<AccountingState>()(
  persist(
    (set) => {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      return {
        fiscalYearStart: new Date(today.getFullYear(), 0, 1), // January 1st of current year
        currentPeriod: {
          start: startOfMonth,
          end: endOfMonth,
        },
        setPeriod: (start, end) => set({ currentPeriod: { start, end } }),
        setFiscalYearStart: (date) => set({ fiscalYearStart: date }),
      };
    },
    {
      name: "efectivio-accounting-storage",
    }
  )
);
