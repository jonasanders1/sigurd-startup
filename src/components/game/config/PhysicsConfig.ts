export interface IPhysicsConfig {
  player: {
    jumpForce: number;
    horizontalSpeed: number;

    floatSpeed: number;
    gravity: number;
    maxFallSpeed: number;
    friction: number;
    // airResistance: number;
    groundTolerance: number;
  };
  collision: {
    bounceFactor: number;
    minBounceVelocity: number;
    platformFriction: number;
  };
  monster: {
    baseSpeed: number;
    maxSpeed: number;
    acceleration: number;
    deceleration: number;
    moveSpeed: number;
    gravity: number;
    maxFallSpeed: number;
    friction: number;
    // airResistance: number;
  };
}

export class PhysicsConfig {
  private static defaultConfig: IPhysicsConfig = {
    player: {
      jumpForce: 16.5,
      horizontalSpeed: 4,
      gravity: 0.25,
      maxFallSpeed: 10,
      friction: 0.0,
      floatSpeed: 0.000001,
      // airResistance: 0.95,
      groundTolerance: 2,
    },
    collision: {
      bounceFactor: 0.5,
      minBounceVelocity: 2,
      platformFriction: 0.9,
    },
    monster: {
      baseSpeed: 1,
      maxSpeed: 5,
      acceleration: 0.2,
      deceleration: 0.1,
      moveSpeed: 3,
      gravity: 0.15,
      maxFallSpeed: 8,
      friction: 0.8,
      // airResistance: 0.95,
    },
  };

  /**
   * Get the default physics configuration
   */
  static getDefaultConfig(): IPhysicsConfig {
    return { ...this.defaultConfig };
  }

  /**
   * Get physics configuration for a specific level
   */
  static getConfigForLevel(level: number): Partial<IPhysicsConfig> {
    const difficultyMultiplier = 1 + (level - 1) * 0.1;

    return {
      monster: {
        ...this.defaultConfig.monster,
        baseSpeed: this.defaultConfig.monster.baseSpeed * difficultyMultiplier,
        maxSpeed: this.defaultConfig.monster.maxSpeed * difficultyMultiplier,
      },
    };
  }
}
