import { create } from 'zustand'

export const useVideoStore = create((set) => ({
  activeVideoId: 1, // Start with first video active
  setActiveVideo: (id) => set({ activeVideoId: id }),
  clearActiveVideo: () => set({ activeVideoId: 1 }),
}))

