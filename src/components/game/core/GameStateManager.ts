import { GameStatus } from "../../types/Game";
import { useGameStore } from "@/components/stores/useGameStore";
import { useAudioStore } from "@/components/stores/useAudioStore";
import { AudioManager } from "../audio/AudioManager";
import { IGameEngineConfig } from "../config/GameEngineConfig";

export interface GameState {
  currentMapId: string;
  pCoinColorIndex: number;
  wasTouchingWall: boolean;
  lastStateCheck: number;
  currentGameStatus: GameStatus;
}

export class GameStateManager {
  private state: GameState;
  private store: ReturnType<typeof useGameStore.getState>;
  private audioManager: AudioManager;
  private cleanupSubscriptions: (() => void) | null = null;
  private config: IGameEngineConfig;
  private playGround: boolean;

  constructor(
    store: ReturnType<typeof useGameStore.getState>,
    audioManager: AudioManager,
    config: IGameEngineConfig,
  ) {
    this.store = store;
    this.audioManager = audioManager;
    this.config = config;
    this.playGround = store.getState().isPlayGround;
    this.state = {
      currentMapId: store.currentMapId,
      pCoinColorIndex: 0,
      wasTouchingWall: false,
      lastStateCheck: Date.now(),
      currentGameStatus: store.gameStatus,
    };

    this.setupStoreSubscriptions();
  }

  /**
   * Setup subscriptions to store changes for real-time updates
   */
  private setupStoreSubscriptions(): void {
    // Subscribe to game state changes
    const unsubscribeGame = useGameStore.subscribe((state) => {
      const gameStatus = state.gameStatus;
      if (gameStatus !== this.state.currentGameStatus) {
        if (this.playGround) {
          this.handleGameStatusChange(gameStatus);
          this.state.currentGameStatus = gameStatus;
        }
      }
    });

    // Subscribe to audio settings changes
    const unsubscribeAudio = useAudioStore.subscribe((state) => {
      const audioConfig = state.getAudioConfig();
      this.audioManager.updateConfig(audioConfig);
    });

    // Store unsubscribe functions for cleanup
    this.cleanupSubscriptions = () => {
      unsubscribeGame();
      unsubscribeAudio();
    };
  }

  /**
   * Handle game status changes and coordinate between systems
   */
  private handleGameStatusChange(newStatus: GameStatus): void {
    console.log(
      `Game status changed: ${this.state.currentGameStatus} -> ${newStatus}`
    );

    // Notify audio manager
    this.audioManager.onGameStateChange(newStatus);

    // Handle specific state changes
    switch (newStatus) {
      case GameStatus.PLAYING:
        this.onGameStart();
        break;
      case GameStatus.PAUSED:
        this.onGamePause();
        break;
      case GameStatus.BONUS_SCREEN:
        this.onBonusScreen();
        break;
      case GameStatus.GAME_OVER:
        this.onGameOver();
        break;
      case GameStatus.COUNTDOWN:
        this.onCountdown();
        break;
    }
  }

  /**
   * Handle game start
   */
  private onGameStart(): void {
    console.log("Game started - all systems active");
  }

  /**
   * Handle game pause
   */
  private onGamePause(): void {
    console.log("Game paused - maintaining state");
  }

  /**
   * Handle bonus screen
   */
  private onBonusScreen(): void {
    console.log("Bonus screen - starting bonus count sound");
    const gameState = this.store.getState();
    if (gameState.lastEarnedBonus > 0) {
      // Calculate duration based on bonus amount (more bonus = longer counting)
      const countDuration = Math.min(
        3000,
        Math.max(1000, gameState.lastEarnedBonus / 20)
      );
      this.audioManager.startBonusCountSFX(countDuration);
    }
  }

  /**
   * Handle game over
   */
  private onGameOver(): void {
    console.log("Game over - cleaning up");
    this.audioManager.stopBonusCountSFX();
  }

  /**
   * Handle countdown
   */
  private onCountdown(): void {
    console.log("Countdown started - preparing for gameplay");
    this.audioManager.stopBonusCountSFX();
  }

  /**
   * Get current game state
   */
  public getState(): GameState {
    return this.state;
  }

  /**
   * Update game state
   */
  public updateState(newState: Partial<GameState>): void {
    this.state = { ...this.state, ...newState };
  }

  /**
   * Cleanup resources
   */
  public dispose(): void {
    if (this.cleanupSubscriptions) {
      this.cleanupSubscriptions();
    }
  }
}
