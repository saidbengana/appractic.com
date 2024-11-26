import { create } from 'zustand'

interface AppState {
  showAside: boolean
  setShowAside: (show: boolean) => void
}

export const useAppContext = create<AppState>((set) => ({
  showAside: false,
  setShowAside: (show) => set({ showAside: show })
}))
