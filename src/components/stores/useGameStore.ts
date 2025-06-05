import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BonusType, GameStatus } from "../types/Game";
import { GameStore, BombCollected } from "@/components/types/Game";
import { getMapById } from "../game/MapDefinitions";

const INITIAL_STATE = {
  score: 0,
  lives: 3,
  bonus: BonusType.NONE,
  level: 1,
  gameStatus: GameStatus.MENU,
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
  lastEarnedBonus: 0,
  lastPreBonusScore: 0,
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      // Game status actions - NO AUDIO CALLS
      setGameStatus: (status: GameStatus) => {
        set({ gameStatus: status });
        // AudioManager will handle game state changes via subscription
      },

      startGame: () => {
        set({ gameStatus: GameStatus.COUNTDOWN });
      },

      pauseGame: () =>
        set((state) => ({
          gameStatus:
            state.gameStatus === GameStatus.PAUSED
              ? GameStatus.PLAYING
              : GameStatus.PAUSED,
        })),

      continueGame: () => set({ gameStatus: GameStatus.PLAYING }),

      // Player state actions
      updateScore: (points: number) =>
        set((state) => ({
          score: state.score + points,
        })),

      updateBonus: (points: number) =>
        set((state) => ({
          bonus: state.bonus + points,
        })),

      // Reset actions
      resetCorrectOrderCount: () => set({ correctOrderCount: 0 }),

      setCorrectOrderCount: (count: number) =>
        set({ correctOrderCount: count }),

      resetBonus: () => set({ bonus: 0 }),

      resetCompletedGroups: () => set({ completedGroups: [] }),

      resetGame: () =>
        set((state) => ({
          ...INITIAL_STATE,
          level: state.level,
          score: state.score,
          currentMapId: state.currentMapId,
          gameStatus: GameStatus.COUNTDOWN,
        })),

      // Life management - NO AUDIO CALLS
      loseLife: () => {
        set((state) => ({ lives: Math.max(0, state.lives - 1) }));
        // AudioManager will handle life lost sound via GameEngine
      },

      gainLife: () => {
        set((state) => ({ lives: state.lives + 1 }));
        // AudioManager will handle life gained sound via GameEngine
      },

      setLevel: (level: number) => set({ level }),

      // Bomb collection actions
      addBombCollected: (bomb: BombCollected) =>
        set((state) => ({
          bombsCollected: [...state.bombsCollected, bomb],
        })),

      incrementCorrectOrder: () =>
        set((state) => ({
          correctOrderCount: state.correctOrderCount + 1,
        })),

      setActiveGroup: (group: number | null) =>
        set({ currentActiveGroup: group }),

      addCompletedGroup: (group: number) =>
        set((state) => ({
          completedGroups: [...state.completedGroups, group],
        })),

      // Special coin actions - NO AUDIO CALLS
      activatePCoin: (duration: number) =>
        set({ pCoinActive: true, pCoinTimeLeft: duration }),

      deactivatePCoin: () => set({ pCoinActive: false, pCoinTimeLeft: 0 }),

      collectSpecialCoin: (type: "B" | "E" | "P" | "S") =>
        set((state) => {
          // NO audio calls here - AudioManager handles this via GameEngine
          switch (type) {
            case "B":
              return {
                efficiencyMultiplier: Math.min(
                  5,
                  state.efficiencyMultiplier + 1
                ),
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
            default:
              return state;
          }
        }),

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

      setIsFullscreen: (value: boolean) => set({ isFullscreen: value }),

      getState: () => get(),

      setLastBonusAndScore: (bonus: number, score: number) =>
        set({ lastEarnedBonus: bonus, lastPreBonusScore: score }),
    }),
    {
      name: "sigurd-game-state", // localStorage key
      version: 1,
      // Only persist certain game state, not temporary state
      partialize: (state) => ({
        level: state.level,
        currentMapId: state.currentMapId,
        // Don't persist score, lives, etc. - those should reset
      }),
    }
  )
);

// Selector hooks for better performance
export const useGameStatus = () => useGameStore((state) => state.gameStatus);
export const useScore = () => useGameStore((state) => state.score);
export const useLives = () => useGameStore((state) => state.lives);
export const useLevel = () => useGameStore((state) => state.level);
export const useEfficiencyMultiplier = () =>
  useGameStore((state) => state.efficiencyMultiplier);
export const usePCoinActive = () => useGameStore((state) => state.pCoinActive);
export const usePCoinTimeLeft = () =>
  useGameStore((state) => state.pCoinTimeLeft);
export const useCurrentActiveGroup = () =>
  useGameStore((state) => state.currentActiveGroup);
export const useCompletedGroups = () =>
  useGameStore((state) => state.completedGroups);

// Add a selector to get the current map name
export const useCurrentMapName = () => {
  const currentMapId = useGameStore((state) => state.currentMapId);
  return getMapById(currentMapId)?.name;
};

// Combined selectors for related data
export const usePlayerStats = () =>
  useGameStore((state) => ({
    score: state.score,
    lives: state.lives,
    level: state.level,
    efficiencyMultiplier: state.efficiencyMultiplier,
  }));

export const useBombProgress = () =>
  useGameStore((state) => ({
    bombsCollected: state.bombsCollected,
    correctOrderCount: state.correctOrderCount,
    currentActiveGroup: state.currentActiveGroup,
    completedGroups: state.completedGroups,
  }));

export const usePowerMode = () =>
  useGameStore((state) => ({
    pCoinActive: state.pCoinActive,
    pCoinTimeLeft: state.pCoinTimeLeft,
  }));

// Type exports
export type { GameStore };
