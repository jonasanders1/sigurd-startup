import { create } from "zustand";
import { GameStore, BombCollected } from "@/components/types/Game";

const INITIAL_STATE = {
  score: 0,
  lives: 3,
  level: 1,
  gameStatus: "menu" as const,
  currentMapId: "training",
  efficiencyMultiplier: 1,
  bombsCollected: [] as BombCollected[],
  correctOrderCount: 0,
  bCoinsCollected: 0,
  eCoinsCollected: 0,
  pCoinActive: false,
  pCoinTimeLeft: 0,
  currentActiveGroup: null as number | null,
  completedGroups: [] as number[],
  isFullscreen: false,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...INITIAL_STATE,

  // Game status actions
  setGameStatus: (status) => set({ gameStatus: status }),
  startGame: () => set({ gameStatus: "playing" }),
  pauseGame: () =>
    set((state) => ({
      gameStatus: state.gameStatus === "paused" ? "playing" : "paused",
    })),
  continueGame: () => set({ gameStatus: "playing" }),

  // Player state actions
  updateScore: (points) => set((state) => ({ score: state.score + points })),
  loseLife: () => set((state) => ({ lives: Math.max(0, state.lives - 1) })),
  gainLife: () => set((state) => ({ lives: state.lives + 1 })),
  setLevel: (level) => set({ level }),

  // Bomb collection actions
  addBombCollected: (bomb: BombCollected) => 
    set((state) => ({ 
      bombsCollected: [...state.bombsCollected, bomb] 
    })),
  incrementCorrectOrder: () => 
    set((state) => ({ 
      correctOrderCount: state.correctOrderCount + 1 
    })),
  setActiveGroup: (group: number | null) => 
    set({ currentActiveGroup: group }),
  addCompletedGroup: (group: number) => 
    set((state) => ({ 
      completedGroups: [...state.completedGroups, group] 
    })),

  // Special coin actions
  activatePCoin: (duration) =>
    set({ pCoinActive: true, pCoinTimeLeft: duration }),
  deactivatePCoin: () => set({ pCoinActive: false, pCoinTimeLeft: 0 }),
  collectSpecialCoin: (type) =>
    set((state) => {
      switch (type) {
        case "B":
          return {
            efficiencyMultiplier: Math.min(5, state.efficiencyMultiplier + 1),
            bCoinsCollected: state.bCoinsCollected + 1,
          };
        case "E":
          return {
            lives: state.lives + 1,
            eCoinsCollected: state.eCoinsCollected + 1,
          };
        case "P":
          return {
            pCoinActive: true,
            pCoinTimeLeft: 5000,
            score: state.score + 100,
          };
        case "S":
          return {
            level: state.level + 1,
          };
      }
    }),

  // Game state management
  resetGame: () => set((state) => ({
    ...INITIAL_STATE,
    level: state.level,
    currentMapId: state.currentMapId,
    gameStatus: "playing"
  })),
  updateSpecialCoins: () =>
    set((state) => {
      if (state.pCoinActive && state.pCoinTimeLeft > 0) {
        const newPCoinTimeLeft = state.pCoinTimeLeft - 16; // Roughly 60fps
        return newPCoinTimeLeft <= 0
          ? { pCoinActive: false, pCoinTimeLeft: 0 }
          : { pCoinTimeLeft: newPCoinTimeLeft };
      }
      return state;
    }),
  updateBombHighlighting: () => set((state) => state),
  setIsFullscreen: (value) => set({ isFullscreen: value }),
  getState: () => get(),
}));
