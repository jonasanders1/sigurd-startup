import { create } from "zustand";

interface AudioStore {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  isMasterMuted: boolean;
  isMusicMuted: boolean;
  isSfxMuted: boolean;
  setMasterVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
  toggleMasterMute: () => void;
  toggleMusicMute: () => void;
  toggleSfxMute: () => void;
  playSound: (sound: string) => void;
}

export const useAudioStore = create<AudioStore>((set, get) => ({
  masterVolume: 75,
  musicVolume: 60,
  sfxVolume: 80,
  isMasterMuted: false,
  isMusicMuted: false,
  isSfxMuted: false,

  setMasterVolume: (volume) => set({ masterVolume: volume }),
  setMusicVolume: (volume) => set({ musicVolume: volume }),
  setSfxVolume: (volume) => set({ sfxVolume: volume }),

  toggleMasterMute: () => set((state) => ({ isMasterMuted: !state.isMasterMuted })),
  toggleMusicMute: () => set((state) => ({ isMusicMuted: !state.isMusicMuted })),
  toggleSfxMute: () => set((state) => ({ isSfxMuted: !state.isSfxMuted })),

  playSound: (sound) => {
    const { isMasterMuted, isSfxMuted, masterVolume, sfxVolume } = get();
    if (isMasterMuted || isSfxMuted) return;
    
    const audio = new Audio(sound);
    audio.volume = (masterVolume / 100) * (sfxVolume / 100);
    audio.play();
  },
}));
