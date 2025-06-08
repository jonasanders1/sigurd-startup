import { GameStatus } from "../../types/Game";

export interface IGameEngineConfig {
  canvas: {
    width: number;
    height: number;
  };
  player: {
    size: {
      width: number;
      height: number;
    };
    color: string;
    initialLives: number;
    jumpForce: number;
    horizontalSpeed: number;

    gravity: number;
  };
  bomb: {
    size: {
      width: number;
      height: number;
    };
    groupSize: number;
    highlightDuration: number;
  };
  monster: {
    size: {
      width: number;
      height: number;
    };
    baseSpeed: number;
    detectionRange: number;
  };
  specialCoin: {
    size: {
      width: number;
      height: number;
    };
    spawnInterval: number;
    pCoinDuration: number;
    pCoinColors: string[];
  };
  scoring: {
    bombBaseValue: number;
    correctOrderBonus: number;
    jumpBonus: number;
    bCoinValue: number;
    eCoinValue: number;
    pCoinMultiplier: number;
  };
  game: {
    initialLevel: number;
    countdownDuration: number;
    bonusScreenDuration: number;
    transitionDelay: number;
  };
}

export class GameEngineConfig {
  private static defaultConfig: IGameEngineConfig = {
    canvas: {
      width: 800,
      height: 600,
    },
    player: {
      size: {
        width: 32,
        height: 32,
      },
      color: "#3B82F6",
      initialLives: 3,
      jumpForce: 12,
      horizontalSpeed: 5,
      gravity: 0.5,
    },
    bomb: {
      size: {
        width: 20,
        height: 20,
      },
      groupSize: 3,
      highlightDuration: 2000,
    },
    monster: {
      size: {
        width: 28,
        height: 28,
      },
      baseSpeed: 1,
      detectionRange: 150,
    },
    specialCoin: {
      size: {
        width: 25,
        height: 25,
      },
      spawnInterval: 10000,
      pCoinDuration: 10000,
      pCoinColors: ["#FFD700", "#FFA500", "#FF4500"],
    },
    scoring: {
      bombBaseValue: 100,
      correctOrderBonus: 50,
      jumpBonus: 10,
      bCoinValue: 200,
      eCoinValue: 300,
      pCoinMultiplier: 2,
    },
    game: {
      initialLevel: 1,
      countdownDuration: 3000,
      bonusScreenDuration: 3000,
      transitionDelay: 1000,
    },
  };

  /**
   * Get the default game engine configuration
   */
  static getDefaultConfig(): IGameEngineConfig {
    return { ...this.defaultConfig };
  }

  /**
   * Get configuration for a specific game status
   */
  static getConfigForStatus(status: GameStatus): Partial<IGameEngineConfig> {
    switch (status) {
      case GameStatus.PLAYING:
        return {
          game: {
            ...this.defaultConfig.game,
            transitionDelay: 0,
          },
        };
      case GameStatus.COUNTDOWN:
        return {
          game: {
            ...this.defaultConfig.game,
            transitionDelay: this.defaultConfig.game.countdownDuration,
          },
        };
      case GameStatus.BONUS_SCREEN:
        return {
          game: {
            ...this.defaultConfig.game,
            transitionDelay: this.defaultConfig.game.bonusScreenDuration,
          },
        };
      default:
        return {};
    }
  }

  /**
   * Get configuration for a specific level
   */
  static getConfigForLevel(level: number): Partial<IGameEngineConfig> {
    // Adjust difficulty based on level
    const difficultyMultiplier = 1 + (level - 1) * 0.1;

    return {
      monster: {
        ...this.defaultConfig.monster,
        baseSpeed: this.defaultConfig.monster.baseSpeed * difficultyMultiplier,
        detectionRange:
          this.defaultConfig.monster.detectionRange * difficultyMultiplier,
      },
      specialCoin: {
        ...this.defaultConfig.specialCoin,
        spawnInterval: Math.max(
          this.defaultConfig.specialCoin.spawnInterval *
            (1 - (level - 1) * 0.05),
          5000
        ),
      },
      scoring: {
        ...this.defaultConfig.scoring,
        bombBaseValue: Math.floor(
          this.defaultConfig.scoring.bombBaseValue * difficultyMultiplier
        ),
        correctOrderBonus: Math.floor(
          this.defaultConfig.scoring.correctOrderBonus * difficultyMultiplier
        ),
      },
    };
  }

  /**
   * Get configuration for a specific screen size
   */
  static getConfigForScreenSize(
    width: number,
    height: number
  ): Partial<IGameEngineConfig> {
    const scale = Math.min(
      width / this.defaultConfig.canvas.width,
      height / this.defaultConfig.canvas.height
    );

    return {
      canvas: {
        width,
        height,
      },
      player: {
        ...this.defaultConfig.player,
        size: {
          width: Math.floor(this.defaultConfig.player.size.width * scale),
          height: Math.floor(this.defaultConfig.player.size.height * scale),
        },
      },
      bomb: {
        ...this.defaultConfig.bomb,
        size: {
          width: Math.floor(this.defaultConfig.bomb.size.width * scale),
          height: Math.floor(this.defaultConfig.bomb.size.height * scale),
        },
      },
      monster: {
        ...this.defaultConfig.monster,
        size: {
          width: Math.floor(this.defaultConfig.monster.size.width * scale),
          height: Math.floor(this.defaultConfig.monster.size.height * scale),
        },
      },
      specialCoin: {
        ...this.defaultConfig.specialCoin,
        size: {
          width: Math.floor(this.defaultConfig.specialCoin.size.width * scale),
          height: Math.floor(
            this.defaultConfig.specialCoin.size.height * scale
          ),
        },
      },
    };
  }
}
