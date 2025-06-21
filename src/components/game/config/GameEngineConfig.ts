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
  };
  bomb: {
    size: {
      width: number;
      height: number;
    };
  };
  monster: {
    size: {
      width: number;
      height: number;
    };
    baseSpeed: number;
  };
  game: {
    initialLevel: number;
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
      color: "#00FF00", // Green
      initialLives: 3,
      jumpForce: 300,
      horizontalSpeed: 200,
    },
    bomb: {
      size: {
        width: 20,
        height: 20,
      },
    },
    monster: {
      size: {
        width: 28,
        height: 28,
      },
      baseSpeed: 100,
    },
    game: {
      initialLevel: 1,
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
    return {};
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
        width: Math.floor(this.defaultConfig.canvas.width * scale),
        height: Math.floor(this.defaultConfig.canvas.height * scale),
      },
      player: {
        ...this.defaultConfig.player,
        size: {
          width: Math.floor(this.defaultConfig.player.size.width * scale),
          height: Math.floor(this.defaultConfig.player.size.height * scale),
        },
      },
      bomb: {
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
    };
  }
}
