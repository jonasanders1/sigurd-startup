export interface IScoringConfig {
  bomb: {
    baseValue: number;
    correctOrderBonus: number;
    groupCompletionBonus: number;
  };
  coins: {
    bCoinValue: number;
    eCoinValue: number;
    pCoinMultiplier: number;
  };
  movement: {
    jumpBonus: number;
    wallJumpBonus: number;
    comboMultiplier: number;
  };
  level: {
    completionBonus: number;
    timeBonus: number;
    perfectBonus: number;
  };
}

export class ScoringConfig {
  private static defaultConfig: IScoringConfig = {
    bomb: {
      baseValue: 100,
      correctOrderBonus: 50,
      groupCompletionBonus: 200,
    },
    coins: {
      bCoinValue: 200,
      eCoinValue: 300,
      pCoinMultiplier: 2,
    },
    movement: {
      jumpBonus: 10,
      wallJumpBonus: 15,
      comboMultiplier: 1.5,
    },
    level: {
      completionBonus: 1000,
      timeBonus: 500,
      perfectBonus: 2000,
    },
  };

  /**
   * Get the default scoring configuration
   */
  static getDefaultConfig(): IScoringConfig {
    return { ...this.defaultConfig };
  }

  /**
   * Get scoring configuration for a specific level
   */
  static getConfigForLevel(level: number): Partial<IScoringConfig> {
    const difficultyMultiplier = 1 + (level - 1) * 0.1;

    return {
      bomb: {
        ...this.defaultConfig.bomb,
        baseValue: Math.floor(this.defaultConfig.bomb.baseValue * difficultyMultiplier),
        correctOrderBonus: Math.floor(this.defaultConfig.bomb.correctOrderBonus * difficultyMultiplier),
        groupCompletionBonus: Math.floor(this.defaultConfig.bomb.groupCompletionBonus * difficultyMultiplier),
      },
      level: {
        ...this.defaultConfig.level,
        completionBonus: Math.floor(this.defaultConfig.level.completionBonus * difficultyMultiplier),
        timeBonus: Math.floor(this.defaultConfig.level.timeBonus * difficultyMultiplier),
        perfectBonus: Math.floor(this.defaultConfig.level.perfectBonus * difficultyMultiplier),
      },
    };
  }

  /**
   * Get scoring configuration for a specific game status
   */
  static getConfigForStatus(status: string): Partial<IScoringConfig> {
    switch (status) {
      case "powerMode":
        return {
          coins: {
            ...this.defaultConfig.coins,
            pCoinMultiplier: this.defaultConfig.coins.pCoinMultiplier * 1.5,
          },
          movement: {
            ...this.defaultConfig.movement,
            comboMultiplier: this.defaultConfig.movement.comboMultiplier * 1.2,
          },
        };
      default:
        return {};
    }
  }
} 