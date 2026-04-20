import { create } from "zustand";

export const useAlertStore = create((set) => ({
  alerts: [],

  showAlert: (alert) =>
    set((state) => ({
      alerts: [
        ...state.alerts,
        {
          id: Date.now(),
          message: alert.message,
          type: alert.type || "info",
          duration: alert.duration || 3000,
        },
      ],
    })),

  removeAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.filter((a) => a.id !== id),
    })),
}));