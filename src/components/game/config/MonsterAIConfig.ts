import {
  Monster,
  MovementConfig,
  MonsterType,
  MovementPattern,
} from "../../types/Monster";

export class MonsterAIConfig {
  /**
   * Get AI configuration based on monster type
   */
  static getMonsterAIConfig(
    type: MonsterType,
    monster: Monster,
    index: number
  ): MovementConfig {
    switch (type) {
      case MonsterType.BUREAUCRAT:
        return {
          pattern: MovementPattern.HORIZONTAL_PATROL,
          speed: monster.speed || 1,
          patrolDistance: monster.patrolEndX - monster.patrolStartX,
        };
      case MonsterType.TAXMAN:
        return {
          pattern: MovementPattern.VERTICAL_BOUNCE,
          speed: monster.speed || 1.2,
          detectionRange: 150,
        };
      case MonsterType.REGULATOR:
        return {
          pattern: MovementPattern.CIRCULAR,
          speed: monster.speed || 1.5,
          patrolDistance: 80,
          detectionRange: 100,
        };
      case MonsterType.TAX_GHOST:
        return {
          pattern: MovementPattern.SINE_WAVE,
          speed: monster.speed || 1.2,
          detectionRange: 150,
        };
      case MonsterType.REGULATION_ROBOT:
        return {
          pattern: MovementPattern.FOLLOW_PLAYER,
          speed: monster.speed || 1.5,
          patrolDistance: 80,
          detectionRange: 100,
        };
      case MonsterType.BUREAUCRAT_CLONE:
        return {
          pattern: MovementPattern.RANDOM_WALK,
          speed: monster.speed || 1.5,
        };
      case MonsterType.FEE_ALIEN:
        return {
          pattern: MovementPattern.FIGURE_EIGHT,
          speed: monster.speed || 1.2,
          detectionRange: 150,
        };
      case MonsterType.CONTROL_CRAB:
        return {
          pattern: MovementPattern.GUARD_AREA,
          speed: monster.speed || 1.5,
          patrolDistance: 80,
          detectionRange: 100,
        };
    }
  }
}
