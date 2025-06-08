import { Player, Platform } from "../../../types/GameEngine";
import {
  Monster,
  MovementPattern,
  MovementConfig,
  MonsterAIState,
} from "../../../types/Monster";
import { BaseMovementHandler } from "../movement/BaseMovementHandler";
import { HorizontalPatrolHandler } from "../movement/HorizontalPatrolHandler";
import { VerticalBounceHandler } from "../movement/VerticalBounceHandler";
import { CircularMovementHandler } from "../movement/CircularMovementHandler";
import { SineWaveHandler } from "../movement/SineWaveHandler";
import { FollowPlayerHandler } from "../movement/FollowPlayerHandler";
import { RandomWalkHandler } from "../movement/RandomWalkHandler";
import { FigureEightHandler } from "../movement/FigureEightHandler";
import { GuardAreaHandler } from "../movement/GuardAreaHandler";

export class MonsterAI {
  private movementHandlers: Map<MovementPattern, BaseMovementHandler>;

  constructor() {
    this.movementHandlers = new Map([
      [MovementPattern.HORIZONTAL_PATROL, new HorizontalPatrolHandler()],
      [MovementPattern.VERTICAL_BOUNCE, new VerticalBounceHandler()],
      [MovementPattern.CIRCULAR, new CircularMovementHandler()],
      [MovementPattern.SINE_WAVE, new SineWaveHandler()],
      [MovementPattern.FOLLOW_PLAYER, new FollowPlayerHandler()],
      [MovementPattern.RANDOM_WALK, new RandomWalkHandler()],
      [MovementPattern.FIGURE_EIGHT, new FigureEightHandler()],
      [MovementPattern.GUARD_AREA, new GuardAreaHandler()],
    ]);
  }

  /**
   * Update monster movement based on its AI pattern
   */
  public updateMonster(
    monster: Monster & { aiState: MonsterAIState; config: MovementConfig },
    player: Player,
    platforms: Platform[],
    canvasBounds: { width: number; height: number },
    deltaTime: number = 16
  ): void {
    const handler = this.movementHandlers.get(monster.config.pattern);

    if (!handler) {
      console.warn(`No handler found for pattern: ${monster.config.pattern}`);
      return;
    }

    // Update AI state timing
    monster.aiState.timeAlive += deltaTime;

    // Apply movement pattern
    handler.update(monster, player, platforms, canvasBounds, deltaTime);

    // Apply boundary constraints
    this.constrainToBounds(monster, canvasBounds);
  }

  /**
   * Initialize AI state for a monster
   */
  public initializeMonster(
    monster: Monster,
    config: MovementConfig
  ): Monster & { aiState: MonsterAIState; config: MovementConfig } {
    const aiState: MonsterAIState = {
      currentDirection: { x: 1, y: 0 },
      timeAlive: 0,
      lastDirectionChange: 0,
      patrolStartX: monster.x,
      patrolStartY: monster.y,
      phaseOffset: Math.random() * Math.PI * 2, // Random phase for variety
    };

    return {
      ...monster,
      aiState,
      config,
    };
  }

  /**
   * Ensure monster stays within canvas bounds
   */
  private constrainToBounds(
    monster: Monster,
    bounds: { width: number; height: number }
  ): void {
    if (monster.x < 0) {
      monster.x = 0;
      monster.velocityX = Math.abs(monster.velocityX);
    }
    if (monster.x > bounds.width - monster.width) {
      monster.x = bounds.width - monster.width;
      monster.velocityX = -Math.abs(monster.velocityX);
    }
    if (monster.y < 0) {
      monster.y = 0;
      monster.velocityY = Math.abs(monster.velocityY);
    }
    if (monster.y > bounds.height - monster.height) {
      monster.y = bounds.height - monster.height;
      monster.velocityY = -Math.abs(monster.velocityY);
    }
  }
} 