import { SpecialCoin } from "../../../types/GameEngine";
import { useGameStore } from "@/components/stores/useGameStore";
import { ScoringSystem } from "./ScoringSystem";
import { AudioManager } from "../../audio/AudioManager";

export class SpecialCoinManager {
  private specialCoins: SpecialCoin[] = [];
  private readonly pCoinColors = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#C0C0C0",
  ];
  private pCoinColorIndex: number = 0;
  private store: ReturnType<typeof useGameStore.getState>;
  private scoringSystem: ScoringSystem;
  private audioManager: AudioManager;
  private config: {
    specialCoinSize: { width: number; height: number };
    canvasWidth: number;
    canvasHeight: number;
  };

  constructor(
    store: ReturnType<typeof useGameStore.getState>,
    scoringSystem: ScoringSystem,
    audioManager: AudioManager,
    config: {
      specialCoinSize: { width: number; height: number };
      canvasWidth: number;
      canvasHeight: number;
    }
  ) {
    this.store = store;
    this.scoringSystem = scoringSystem;
    this.audioManager = audioManager;
    this.config = config;
  }

  /**
   * Update special coins (P coin timer, etc.)
   */
  public update(): void {
    const state = this.store.getState();

    if (state.pCoinActive && state.pCoinTimeLeft > 0) {
      this.store.updateSpecialCoins();
    }
  }

  /**
   * Update special coin spawning logic
   */
  public updateSpawning(): void {
    const state = this.store.getState();

    // Check if coins already exist to prevent duplicates
    const existingCoins = this.getExistingCoinTypes();

    // Spawn B coin
    if (
      !existingCoins.has("B") &&
      this.scoringSystem.shouldSpawnBCoin(state.score)
    ) {
      this.spawnSpecialCoin("B");
    }

    // Spawn E coin
    if (
      !existingCoins.has("E") &&
      this.scoringSystem.shouldSpawnECoin(state.bCoinsCollected, state.lives)
    ) {
      this.spawnSpecialCoin("E");
    }

    // Spawn P coin
    if (
      !existingCoins.has("P") &&
      this.scoringSystem.shouldSpawnPCoin(state.correctOrderCount)
    ) {
      this.spawnSpecialCoin("P");
    }
  }

  /**
   * Get set of existing coin types that haven't been collected
   */
  private getExistingCoinTypes(): Set<string> {
    return new Set(
      this.specialCoins
        .filter((coin) => !coin.collected)
        .map((coin) => coin.type)
    );
  }

  /**
   * Spawn a special coin at a safe location
   */
  private spawnSpecialCoin(type: "B" | "E" | "P" | "S"): void {
    const coin = this.createSpecialCoin(type);
    this.specialCoins.push(coin);
    console.log(`${type} coin spawned!`);
  }

  /**
   * Create a special coin object
   */
  private createSpecialCoin(type: "B" | "E" | "P" | "S"): SpecialCoin {
    const coinColors = {
      B: "#FFD700", // Gold
      E: "#FF69B4", // Pink
      P: this.pCoinColors[this.pCoinColorIndex],
      S: "#9400D3", // Violet
    };

    const spawnPosition = this.findSafeSpawnPosition();

    return {
      x: spawnPosition.x,
      y: spawnPosition.y,
      width: this.config.specialCoinSize.width,
      height: this.config.specialCoinSize.height,
      type,
      collected: false,
      color: coinColors[type],
      value: type === "P" ? this.calculatePCoinValue() : undefined,
    };
  }

  /**
   * Find a safe spawn position for special coins
   */
  private findSafeSpawnPosition(): { x: number; y: number } {
    // Simple random spawn - could be improved with collision checking
    return {
      x: Math.random() * (this.config.canvasWidth - 30) + 15,
      y: Math.random() * (this.config.canvasHeight - 100) + 50,
    };
  }

  /**
   * Calculate P coin value based on color
   */
  private calculatePCoinValue(): number {
    return this.pCoinColorIndex === 4 ? 2000 : 100 + this.pCoinColorIndex * 475;
  }

  /**
   * Update P coin color when actions occur
   */
  public updatePCoinColor(): void {
    this.pCoinColorIndex = (this.pCoinColorIndex + 1) % this.pCoinColors.length;

    // Update existing P coins
    this.specialCoins.forEach((coin) => {
      if (coin.type === "P" && !coin.collected) {
        coin.color = this.pCoinColors[this.pCoinColorIndex];
        coin.value = this.calculatePCoinValue();
      }
    });
  }

  /**
   * Handle special coin collection
   */
  public handleCoinCollection(coin: SpecialCoin): void {
    coin.collected = true;

    // Update game state through store
    this.store.collectSpecialCoin(coin.type);

    // Handle audio
    switch (coin.type) {
      case "B":
        this.audioManager.playBCoinSound();
        break;
      case "E":
        this.audioManager.playECoinSound();
        break;
      case "P":
        this.audioManager.playPCoinSound();
        this.audioManager.playPowerModeSound();
        break;
    }
  }

  /**
   * Get all special coins
   */
  public getCoins(): SpecialCoin[] {
    return this.specialCoins;
  }

  /**
   * Reset special coins
   */
  public reset(): void {
    this.specialCoins = [];
    this.pCoinColorIndex = 0;
  }
} 