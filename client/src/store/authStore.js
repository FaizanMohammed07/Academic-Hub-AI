import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user:            null,
      accessToken:     null,
      refreshToken:    null,
      isAuthenticated: false,

      login: ({ user, accessToken, refreshToken }) => set({
        user,
        accessToken,
        refreshToken,
        isAuthenticated: true,
      }),

      updateToken: ({ accessToken, refreshToken }) => set({
        accessToken,
        refreshToken,
      }),

      logout: () => set({
        user:            null,
        accessToken:     null,
        refreshToken:    null,
        isAuthenticated: false,
      }),

      updateUser: (updates) => set((state) => ({
        user: { ...state.user, ...updates },
      })),

      getAccessToken: () => get().accessToken,
      getRefreshToken: () => get().refreshToken,
    }),
    {
      name: 'vjit-auth',
      partialize: (s) => ({
        user:         s.user,
        accessToken:  s.accessToken,
        refreshToken: s.refreshToken,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
);
