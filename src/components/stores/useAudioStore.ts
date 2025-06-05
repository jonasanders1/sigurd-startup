import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AudioConfig } from "../types/Audio";

// Sound events enum for type safety (keep this for reference)
export enum SoundEvent {
  // Game state sounds
  MENU_MUSIC = "MENU_MUSIC",
  GAME_MUSIC = "GAME_MUSIC", 
  GAME_OVER = "GAME_OVER",
  BONUS_SCREEN = "BONUS_SCREEN",

  // Game action sounds
  BOMB_COLLECT = "BOMB_COLLECT",
  POWER_UP = "POWER_UP",
  LIFE_LOST = "LIFE_LOST",
  LIFE_GAINED = "LIFE_GAINED",
  WALL_HIT = "WALL_HIT",
  JUMP = "JUMP",
}

// Audio store interface - SETTINGS ONLY
interface AudioStore {
  // Volume settings (0-100 for UI friendliness)
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  
  // Mute states
  isMasterMuted: boolean;
  isMusicMuted: boolean;
  isSfxMuted: boolean;

  // Settings actions
  setMasterVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
  toggleMasterMute: () => void;
  toggleMusicMute: () => void;
  toggleSfxMute: () => void;

  // Utility methods
  getAudioConfig: () => AudioConfig;
  resetToDefaults: () => void;
}

// Default audio settings
const DEFAULT_SETTINGS = {
  masterVolume: 75,
  musicVolume: 60,
  sfxVolume: 80,
  isMasterMuted: false,
  isMusicMuted: false,
  isSfxMuted: false,
};

export const useAudioStore = create<AudioStore>()(
  persist(
    (set, get) => ({
      // Initial state from defaults
      ...DEFAULT_SETTINGS,

      // Volume control actions
      setMasterVolume: (volume: number) => {
        const clampedVolume = Math.max(0, Math.min(100, volume));
        set({ masterVolume: clampedVolume });
      },

      setMusicVolume: (volume: number) => {
        const clampedVolume = Math.max(0, Math.min(100, volume));
        set({ musicVolume: clampedVolume });
      },

      setSfxVolume: (volume: number) => {
        const clampedVolume = Math.max(0, Math.min(100, volume));
        set({ sfxVolume: clampedVolume });
      },

      // Mute toggle actions
      toggleMasterMute: () =>
        set((state) => ({ isMasterMuted: !state.isMasterMuted })),

      toggleMusicMute: () =>
        set((state) => ({ isMusicMuted: !state.isMusicMuted })),

      toggleSfxMute: () =>
        set((state) => ({ isSfxMuted: !state.isSfxMuted })),

      // Utility methods
      getAudioConfig: (): AudioConfig => {
        const state = get();
        return {
          masterVolume: state.masterVolume / 100, // Convert to 0-1 range
          musicVolume: state.musicVolume / 100,
          sfxVolume: state.sfxVolume / 100,
          musicMuted: state.isMasterMuted || state.isMusicMuted,
          sfxMuted: state.isMasterMuted || state.isSfxMuted,
        };
      },

      resetToDefaults: () => {
        set(DEFAULT_SETTINGS);
      },
    }),
    {
      name: "sigurd-audio-settings", // localStorage key
      version: 1,
    }
  )
);

// Selector hooks for specific settings (for performance)
export const useMasterVolume = () => useAudioStore((state) => state.masterVolume);
export const useMusicVolume = () => useAudioStore((state) => state.musicVolume);
export const useSfxVolume = () => useAudioStore((state) => state.sfxVolume);
export const useIsMasterMuted = () => useAudioStore((state) => state.isMasterMuted);
export const useIsMusicMuted = () => useAudioStore((state) => state.isMusicMuted);
export const useIsSfxMuted = () => useAudioStore((state) => state.isSfxMuted);

// Combined selector for audio config
export const useAudioConfig = () => useAudioStore((state) => state.getAudioConfig());

// Type exports for other files
export type { AudioStore };