import { GameStore } from "@/components/types/Game";
import { BonusType } from "@/components/types/Game";

export class ScoringSystem {
  private store: GameStore;
  private lastBCoinScore = 0;  // Track the last score threshold when B-coin was spawned
  private lastECoinThreshold = 0;  // Track the last threshold when E-coin was spawned

  constructor(store: GameStore) {
    this.store = store;
  }

  // Basic movement scoring
  public scoreJump(): number {
    return this.calculateScore(10);
  }

  public scoreWallHit(): number {
    return this.calculateScore(10);
  }

  public scoreFall(): number {
    return this.calculateScore(10);
  }

  // Bomb scoring
  public scoreNormalBomb(): number {
    return this.calculateScore(100);
  }

  public scoreFireBomb(): number {
    return this.calculateScore(200);
  }

  // Special coin scoring
  public scorePCoin(colorIndex: number): number {
    const baseScores = [100, 200, 300, 500, 800, 1200, 2000];
    return this.calculateScore(baseScores[colorIndex]);
  }

  public scoreBCoin(): number {
    return this.calculateScore(1000);
  }

  public scoreECoin(): number {
    return this.calculateScore(1000);
  }

  public scoreSCoin(): number {
    return this.calculateScore(1000);
  }

  // Monster scoring during power mode
  public scoreMonsterKill(colorIndex: number): number {
    const baseScores = [100, 200, 300, 500, 800, 1200, 2000];
    return this.calculateScore(baseScores[colorIndex]);
  }

  // End of level bonus
  public calculateEndLevelBonus(correctOrderCount: number): number {
    if (correctOrderCount === 24) {
      return BonusType.BIG;
    } else if (correctOrderCount === 23) {
      return BonusType.MEDIUM;
    } else if (correctOrderCount === 22) {
      return BonusType.SMALL;
    } else if (correctOrderCount === 21) {
      return BonusType.TINY;
    }
    return BonusType.NONE;
  }

  // Helper method to calculate score with bonus multiplier
  private calculateScore(baseScore: number): number {
    const state = this.store.getState();
    return baseScore * state.efficiencyMultiplier;
  }

  // Special coin spawn conditions
  public shouldSpawnPCoin(fireBombsCollected: number): boolean {
    return fireBombsCollected >= 9;
  }

  public shouldSpawnBCoin(score: number): boolean {
    // Spawn B-coin every 5000 points (excluding bonus)
    const currentThreshold = Math.floor(score / 5000);
    const shouldSpawn = currentThreshold > this.lastBCoinScore;
    
    if (shouldSpawn) {
      this.lastBCoinScore = currentThreshold;
    }
    
    return shouldSpawn;
  }

  public shouldSpawnECoin(bCoinsCollected: number, lives: number): boolean {
    const eCoinsNeeded = Math.max(1, 8 - (3 - lives));
    const shouldSpawn = bCoinsCollected >= eCoinsNeeded && bCoinsCollected > this.lastECoinThreshold;
    
    if (shouldSpawn) {
      this.lastECoinThreshold = bCoinsCollected;
    }
    
    return shouldSpawn;
  }
}
