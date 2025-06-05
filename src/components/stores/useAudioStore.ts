import { create } from "zustand";
import { GameStatus, BonusType } from "../types/Game";
import { BombCollected } from "@/components/types/Game";
import SigurdMelody from "@/assets/sounds/sigurd-melody.mp3";
import GameOver from "@/assets/sounds/game-over.mp3";
import PowerUp from "@/assets/sounds/power-up.mp3";

// Define all possible sound events
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

// Define game state interface for sound conditions
interface GameState {
  correctOrderCount: number;
  lives: number;
  score: number;
  level: number;
  gameStatus: GameStatus;
  currentMapId: string;
  efficiencyMultiplier: number;
  bombsCollected: BombCollected[];
  bCoinsCollected: number;
  eCoinsCollected: number;
  pCoinActive: boolean;
  pCoinTimeLeft: number;
  currentActiveGroup: number | null;
  completedGroups: number[];
  isFullscreen: boolean;
  bonus: BonusType;
  [key: string]: unknown;
}

// Sound configuration interface
interface SoundConfig {
  src: string;
  volume?: number;
  loop?: boolean;
  isMusic?: boolean;
  condition?: (state: GameState) => boolean;
}

// Map of all available sounds
const SOUNDS: Record<SoundEvent, SoundConfig> = {
  // Game state sounds
  [SoundEvent.MENU_MUSIC]: {
    src: SigurdMelody,
    isMusic: true,
    loop: true,
    volume: 0.6,
  },
  [SoundEvent.GAME_MUSIC]: {
    src: SigurdMelody,
    isMusic: true,
    loop: true,
    volume: 0.6,
  },
  [SoundEvent.GAME_OVER]: {
    src: GameOver,
    volume: 0.8,
  },
  [SoundEvent.BONUS_SCREEN]: {
    src: PowerUp,
    volume: 0.7,
    condition: (state) => state.correctOrderCount >= 20,
  },

  // Game action sounds
  [SoundEvent.BOMB_COLLECT]: {
    src: PowerUp,
    volume: 0.5,
  },
  [SoundEvent.POWER_UP]: {
    src: PowerUp,
    volume: 0.7,
  },
  [SoundEvent.LIFE_LOST]: {
    src: GameOver,
    volume: 0.6,
  },
  [SoundEvent.LIFE_GAINED]: {
    src: PowerUp,
    volume: 0.6,
  },
  [SoundEvent.WALL_HIT]: {
    src: PowerUp,
    volume: 0.4,
  },
  [SoundEvent.JUMP]: {
    src: PowerUp,
    volume: 0.3,
  },
};

interface AudioStore {
  // Volume controls
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  isMasterMuted: boolean;
  isMusicMuted: boolean;
  isSfxMuted: boolean;

  // Current playing sounds
  currentMusic: HTMLAudioElement | null;
  currentSfx: HTMLAudioElement | null;

  // Volume controls
  setMasterVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
  toggleMasterMute: () => void;
  toggleMusicMute: () => void;
  toggleSfxMute: () => void;

  // Sound controls
  playSound: (event: SoundEvent, gameState?: GameState) => void;
  stopMusic: () => void;
  stopAllSounds: () => void;
}

export const useAudioStore = create<AudioStore>((set, get) => ({
  // Initial state
  masterVolume: 75,
  musicVolume: 60,
  sfxVolume: 80,
  isMasterMuted: false,
  isMusicMuted: false,
  isSfxMuted: false,
  currentMusic: null,
  currentSfx: null,

  // Volume controls
  setMasterVolume: (volume) => set({ masterVolume: volume }),
  setMusicVolume: (volume) => set({ musicVolume: volume }),
  setSfxVolume: (volume) => set({ sfxVolume: volume }),
  toggleMasterMute: () =>
    set((state) => ({ isMasterMuted: !state.isMasterMuted })),
  toggleMusicMute: () =>
    set((state) => ({ isMusicMuted: !state.isMusicMuted })),
  toggleSfxMute: () => set((state) => ({ isSfxMuted: !state.isSfxMuted })),

  // Sound controls
  playSound: (event, gameState) => {
    const {
      isMasterMuted,
      isMusicMuted,
      isSfxMuted,
      masterVolume,
      musicVolume,
      sfxVolume,
      currentMusic,
      currentSfx,
    } = get();

    const soundConfig = SOUNDS[event];
    if (!soundConfig) {
      console.warn(`No sound configuration found for event: ${event}`);
      return;
    }

    // Check conditions
    if (soundConfig.condition && !soundConfig.condition(gameState)) {
      console.log(`Sound condition not met for event: ${event}`);
      return;
    }

    // Check if sound should be muted
    if (isMasterMuted || (soundConfig.isMusic ? isMusicMuted : isSfxMuted)) {
      console.log(`Sound muted for event: ${event}`);
      return;
    }

    // Calculate volume
    const baseVolume = soundConfig.volume || 1;
    const volumeMultiplier = soundConfig.isMusic ? musicVolume : sfxVolume;
    const finalVolume =
      (masterVolume / 100) * (volumeMultiplier / 100) * baseVolume;

    // Create and play sound
    const audio = new Audio(soundConfig.src);
    audio.volume = finalVolume;
    if (soundConfig.loop) {
      audio.loop = true;
    }

    // Handle sound completion
    audio.addEventListener("ended", () => {
      if (soundConfig.isMusic) {
        set({ currentMusic: null });
      } else {
        set({ currentSfx: null });
      }
    });

    // Stop previous sound if it's the same type (music or sfx)
    if (soundConfig.isMusic) {
      if (currentMusic) {
        currentMusic.pause();
        currentMusic.currentTime = 0;
      }
      set({ currentMusic: audio });
    } else {
      if (currentSfx) {
        currentSfx.pause();
        currentSfx.currentTime = 0;
      }
      set({ currentSfx: audio });
    }

    // Play the sound
    audio.play().catch((error) => {
      console.error(`Failed to play sound for event ${event}:`, error);
    });
  },

  stopMusic: () => {
    const { currentMusic } = get();
    if (currentMusic) {
      currentMusic.pause();
      currentMusic.currentTime = 0;
      set({ currentMusic: null });
    }
  },

  stopAllSounds: () => {
    const { currentMusic, currentSfx } = get();
    if (currentMusic) {
      currentMusic.pause();
      currentMusic.currentTime = 0;
    }
    if (currentSfx) {
      currentSfx.pause();
      currentSfx.currentTime = 0;
    }
    set({ currentMusic: null, currentSfx: null });
  },
}));
