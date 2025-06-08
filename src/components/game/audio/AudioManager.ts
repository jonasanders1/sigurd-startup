import { GameStatus } from "../../types/Game";
import { AudioConfig, AudioAssets } from "../../types/Audio";

export class AudioManager {
  private config: AudioConfig;
  private assets: Map<string, HTMLAudioElement> = new Map();
  private currentMusic: HTMLAudioElement | null = null;
  private currentGameState: GameStatus | null = null;
  private bonusCountInterval: NodeJS.Timeout | null = null;

  // Audio file paths - customize these to your asset locations
  private readonly audioAssets: AudioAssets = {
    // Background Music
    menuMusic: "/audio/music/menu.mp3",
    gameplayMusic: "/audio/music/gameplay.mp3",
    bonusMusic: "/audio/music/bonus.mp3",
    gameOverMusic: "/audio/music/gameover.mp3",

    // Sound Effects
    jump: "/audio/sfx/jump.wav", // DONE
    bombCollect: "/audio/sfx/bomb-collect.wav",
    lifeLost: "/audio/sfx/life-lost.wav",
    bCoin: "/audio/sfx/b-coin.wav",
    eCoin: "/audio/sfx/e-coin.wav",
    pCoin: "/audio/sfx/p-coin.wav",
    powerMode: "/audio/sfx/power-mode.wav",
    levelComplete: "/audio/sfx/level-complete.wav",
    bonusCount: "/audio/sfx/bonus-tick.wav",
  };

  constructor(config: AudioConfig) {
    this.config = config;
    this.preloadAudio();
  }

  /**
   * Preload all audio assets
   */
  private async preloadAudio(): Promise<void> {
    const loadPromises = Object.entries(this.audioAssets).map(([key, path]) => {
      return this.loadAudioAsset(key, path);
    });

    try {
      await Promise.all(loadPromises);
      console.log("All audio assets loaded successfully");
    } catch (error) {
      console.warn("Some audio assets failed to load:", error);
    }
  }

  /**
   * Load individual audio asset
   */
  private loadAudioAsset(key: string, path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(path);

      audio.addEventListener("canplaythrough", () => {
        this.assets.set(key, audio);
        resolve();
      });

      audio.addEventListener("error", () => {
        console.warn(`Failed to load audio: ${path}`);
        // Create silent audio element as fallback
        const silentAudio = new Audio();
        this.assets.set(key, silentAudio);
        resolve(); // Don't reject - game should work without audio
      });

      audio.preload = "auto";
      audio.load();
    });
  }

  /**
   * Handle game state changes and play appropriate music
   */
  public onGameStateChange(newState: GameStatus): void {
    if (newState === this.currentGameState) return;

    this.currentGameState = newState;

    switch (newState) {
      case GameStatus.MENU:
        this.playMusic("menuMusic", true);
        break;

      case GameStatus.PLAYING:
        this.playMusic("gameplayMusic", true);
        break;

      case GameStatus.BONUS_SCREEN:
        this.playMusic("bonusMusic", false);
        break;

      case GameStatus.GAME_OVER:
        this.playMusic("gameOverMusic", false);
        break;

      case GameStatus.PAUSED:
        this.pauseMusic();
        break;

      default:
        // Keep current music playing
        break;
    }
  }

  /**
   * Play background music
   */
  private playMusic(trackName: string, loop: boolean = true): void {
    // Stop current music
    if (this.currentMusic) {
      this.currentMusic.pause();
      this.currentMusic.currentTime = 0;
    }

    // Start new music
    const music = this.assets.get(trackName);
    if (music && !this.config.musicMuted) {
      music.volume = this.config.musicVolume * this.config.masterVolume;
      music.loop = loop;
      music.play().catch(console.warn);
      this.currentMusic = music;
    }
  }

  /**
   * Pause current music
   */
  private pauseMusic(): void {
    if (this.currentMusic) {
      this.currentMusic.pause();
    }
  }

  /**
   * Resume current music
   */
  public resumeMusic(): void {
    if (this.currentMusic) {
      this.currentMusic.play().catch(console.warn);
    }
  }

  /**
   * Play sound effect
   */
  public playSFX(soundName: keyof AudioAssets): void {
    if (this.config.sfxMuted) return;

    const sound = this.assets.get(soundName);
    if (sound) {
      // Clone the audio for overlapping sounds
      const soundClone = sound.cloneNode() as HTMLAudioElement;
      soundClone.volume = this.config.sfxVolume * this.config.masterVolume;
      soundClone.play().catch(console.warn);
    }
  }

  /**
   * Play bonus counting sound effect (rapid ticking)
   */
  public startBonusCountSFX(duration: number = 2000): void {
    this.stopBonusCountSFX(); // Stop any existing bonus counting

    const tickInterval = 50; // Play tick sound every 50ms
    let elapsed = 0;

    this.bonusCountInterval = setInterval(() => {
      this.playSFX("bonusCount");
      elapsed += tickInterval;

      if (elapsed >= duration) {
        this.stopBonusCountSFX();
      }
    }, tickInterval);
  }

  /**
   * Stop bonus counting sound effect
   */
  public stopBonusCountSFX(): void {
    if (this.bonusCountInterval) {
      clearInterval(this.bonusCountInterval);
      this.bonusCountInterval = null;
    }
  }

  /**
   * Update audio configuration
   */
  public updateConfig(newConfig: Partial<AudioConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Update current music volume
    if (this.currentMusic) {
      this.currentMusic.volume =
        this.config.musicVolume * this.config.masterVolume;

      if (this.config.musicMuted) {
        this.currentMusic.pause();
      } else if (
        this.currentGameState === GameStatus.PLAYING ||
        this.currentGameState === GameStatus.MENU
      ) {
        this.currentMusic.play().catch(console.warn);
      }
    }
  }

  /**
   * Convenient methods for common game events
   */

  // Movement sounds
  public playJumpSound(): void {
    this.playSFX("jump");
  }
  // public playWallHitSound(): void {
  //   this.playSFX("wallHit");
  // }

  // // Bomb collection sounds
  // public playBombCollectSound(isCorrect: boolean): void {
  //   this.playSFX(isCorrect ? "bombCorrect" : "bombWrong");
  // }

  // // Monster interaction sounds
  // public playMonsterHitSound(): void {
  //   this.playSFX("monsterHit");
  // }

  // // Life management sounds
  // public playLifeGainedSound(): void {
  //   this.playSFX("lifeGained");
  // }
  public playLifeLostSound(): void {
    this.playSFX("lifeLost");
  }

  // Special coin sounds
  public playBCoinSound(): void {
    this.playSFX("bCoin");
  }
  public playECoinSound(): void {
    this.playSFX("eCoin");
  }
  public playPCoinSound(): void {
    this.playSFX("pCoin");
  }

  // Power mode sounds
  public playPowerModeSound(): void {
    this.playSFX("powerMode");
  }

  // Level progression sounds
  public playLevelCompleteSound(): void {
    this.playSFX("levelComplete");
  }

  /**
   * Get current audio status for debugging
   */
  public getStatus(): {
    currentTrack: string | null;
    assetsLoaded: number;
    totalAssets: number;
    config: AudioConfig;
  } {
    let currentTrack = null;
    if (this.currentMusic) {
      // Find which track is currently playing
      for (const [key, audio] of this.assets.entries()) {
        if (audio === this.currentMusic) {
          currentTrack = key;
          break;
        }
      }
    }

    return {
      currentTrack,
      assetsLoaded: this.assets.size,
      totalAssets: Object.keys(this.audioAssets).length,
      config: this.config,
    };
  }

  /**
   * Clean up audio resources
   */
  public dispose(): void {
    this.stopBonusCountSFX();

    if (this.currentMusic) {
      this.currentMusic.pause();
      this.currentMusic = null;
    }

    this.assets.clear();
  }
}
