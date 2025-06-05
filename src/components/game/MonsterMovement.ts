// MonsterAI.ts - Main AI system

import { Player, Platform } from "../types/GameEngine";
import {
  Monster,
  MovementPattern,
  MovementConfig,
  MonsterAIState,
} from "../types/Monster";

export class MonsterAI {
  private movementHandlers: Map<MovementPattern, MovementHandler>;

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

// Base interface for movement handlers
abstract class MovementHandler {
  abstract update(
    monster: Monster & { aiState: MonsterAIState; config: MovementConfig },
    player: Player,
    platforms: Platform[],
    canvasBounds: { width: number; height: number },
    deltaTime: number
  ): void;

  /**
   * Calculate distance between two points
   */
  protected getDistance(
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): number {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }

  /**
   * Normalize a vector
   */
  protected normalize(x: number, y: number): { x: number; y: number } {
    const length = Math.sqrt(x * x + y * y);
    return length > 0 ? { x: x / length, y: y / length } : { x: 0, y: 0 };
  }
}

// Horizontal Patrol - Back and forth movement
class HorizontalPatrolHandler extends MovementHandler {
  update(
    monster: Monster & { aiState: MonsterAIState; config: MovementConfig }
  ): void {
    const patrolDistance = monster.config.patrolDistance || 100;
    const speed = monster.config.speed || 1;

    // Calculate patrol bounds
    const leftBound = monster.aiState.patrolStartX;
    const rightBound = leftBound + patrolDistance;

    // Move horizontally
    monster.x += monster.velocityX;

    // Reverse direction at patrol boundaries
    if (monster.x <= leftBound || monster.x >= rightBound - monster.width) {
      monster.velocityX *= -1;
    }

    // Ensure speed consistency
    monster.velocityX = monster.velocityX > 0 ? speed : -speed;
  }
}

// Vertical Bounce - Up and down movement
class VerticalBounceHandler extends MovementHandler {
  update(
    monster: Monster & { aiState: MonsterAIState; config: MovementConfig }
  ): void {
    const bounceHeight = monster.config.patrolDistance || 80;
    const speed = monster.config.speed || 1;

    // Calculate bounce bounds
    const topBound = monster.aiState.patrolStartY;
    const bottomBound = topBound + bounceHeight;

    // Move vertically
    monster.y += monster.velocityY;

    // Reverse direction at bounce boundaries
    if (monster.y <= topBound || monster.y >= bottomBound - monster.height) {
      monster.velocityY *= -1;
    }

    // Ensure speed consistency
    monster.velocityY = monster.velocityY > 0 ? speed : -speed;
  }
}

// Circular Movement
class CircularMovementHandler extends MovementHandler {
  update(
    monster: Monster & { aiState: MonsterAIState; config: MovementConfig },
    player: Player,
    platforms: Platform[],
    canvasBounds: { width: number; height: number },
    deltaTime: number
  ): void {
    const radius = monster.config.patrolDistance || 50;
    const speed = monster.config.speed || 1;
    const frequency = monster.config.frequency || 0.02;

    // Calculate circular position
    const angle =
      monster.aiState.timeAlive * frequency +
      (monster.aiState.phaseOffset || 0);

    monster.x = monster.aiState.patrolStartX + Math.cos(angle) * radius;
    monster.y = monster.aiState.patrolStartY + Math.sin(angle) * radius;

    // Update velocity for physics consistency
    monster.velocityX = -Math.sin(angle) * radius * frequency * speed;
    monster.velocityY = Math.cos(angle) * radius * frequency * speed;
  }
}

// Sine Wave Movement
class SineWaveHandler extends MovementHandler {
  update(
    monster: Monster & { aiState: MonsterAIState; config: MovementConfig },
    player: Player,
    platforms: Platform[],
    canvasBounds: { width: number; height: number },
    deltaTime: number
  ): void {
    const amplitude = monster.config.amplitude || 30;
    const frequency = monster.config.frequency || 0.03;
    const horizontalSpeed = monster.config.speed || 1;

    // Move horizontally
    monster.x += horizontalSpeed * monster.aiState.currentDirection.x;

    // Sine wave vertical movement
    const sineValue = Math.sin(
      monster.aiState.timeAlive * frequency + (monster.aiState.phaseOffset || 0)
    );
    monster.y = monster.aiState.patrolStartY + sineValue * amplitude;

    // Reverse horizontal direction at bounds
    if (monster.x <= 0 || monster.x >= canvasBounds.width - monster.width) {
      monster.aiState.currentDirection.x *= -1;
    }

    monster.velocityX = horizontalSpeed * monster.aiState.currentDirection.x;
    monster.velocityY =
      Math.cos(monster.aiState.timeAlive * frequency) * amplitude * frequency;
  }
}

// Follow Player - Simple AI pursuit
class FollowPlayerHandler extends MovementHandler {
  update(
    monster: Monster & { aiState: MonsterAIState; config: MovementConfig },
    player: Player
  ): void {
    const speed = monster.config.speed || 0.5;
    const detectionRange = monster.config.detectionRange || 150;

    // Calculate distance to player
    const distance = this.getDistance(
      monster.x + monster.width / 2,
      monster.y + monster.height / 2,
      player.x + player.width / 2,
      player.y + player.height / 2
    );

    // Only follow if player is within detection range
    if (distance < detectionRange && distance > 5) {
      // Calculate direction to player
      const dirX = player.x - monster.x;
      const dirY = player.y - monster.y;

      const normalized = this.normalize(dirX, dirY);

      // Move toward player
      monster.velocityX = normalized.x * speed;
      monster.velocityY = normalized.y * speed;

      monster.x += monster.velocityX;
      monster.y += monster.velocityY;

      monster.aiState.isChasing = true;
    } else {
      // Return to patrol behavior when player is out of range
      monster.aiState.isChasing = false;
      monster.velocityX *= 0.9; // Gradual stop
      monster.velocityY *= 0.9;
    }
  }
}

// Random Walk - Unpredictable movement
class RandomWalkHandler extends MovementHandler {
  update(
    monster: Monster & { aiState: MonsterAIState; config: MovementConfig },
    player: Player,
    platforms: Platform[],
    canvasBounds: { width: number; height: number },
    deltaTime: number
  ): void {
    const speed = monster.config.speed || 1;
    const turnDelay = monster.config.turnDelay || 1000; // ms between direction changes

    // Change direction periodically or at boundaries
    if (
      monster.aiState.timeAlive - monster.aiState.lastDirectionChange >
        turnDelay ||
      monster.x <= 0 ||
      monster.x >= canvasBounds.width - monster.width ||
      monster.y <= 0 ||
      monster.y >= canvasBounds.height - monster.height
    ) {
      // Random new direction
      const angle = Math.random() * Math.PI * 2;
      monster.aiState.currentDirection.x = Math.cos(angle);
      monster.aiState.currentDirection.y = Math.sin(angle);
      monster.aiState.lastDirectionChange = monster.aiState.timeAlive;
    }

    // Apply movement
    monster.velocityX = monster.aiState.currentDirection.x * speed;
    monster.velocityY = monster.aiState.currentDirection.y * speed;

    monster.x += monster.velocityX;
    monster.y += monster.velocityY;
  }
}

// Figure Eight - Complex pattern
class FigureEightHandler extends MovementHandler {
  update(
    monster: Monster & { aiState: MonsterAIState; config: MovementConfig },
    player: Player,
    platforms: Platform[],
    canvasBounds: { width: number; height: number },
    deltaTime: number
  ): void {
    const size = monster.config.patrolDistance || 40;
    const speed = monster.config.speed || 1;
    const frequency = monster.config.frequency || 0.02;

    const t =
      monster.aiState.timeAlive * frequency +
      (monster.aiState.phaseOffset || 0);

    // Figure-8 parametric equations
    monster.x = monster.aiState.patrolStartX + size * Math.sin(t);
    monster.y = monster.aiState.patrolStartY + size * Math.sin(t) * Math.cos(t);

    // Update velocities for physics
    monster.velocityX = size * Math.cos(t) * frequency * speed;
    monster.velocityY =
      size *
      (Math.cos(t) * Math.cos(t) - Math.sin(t) * Math.sin(t)) *
      frequency *
      speed;
  }
}

// Guard Area - Patrol specific area with alertness
class GuardAreaHandler extends MovementHandler {
  update(
    monster: Monster & { aiState: MonsterAIState; config: MovementConfig },
    player: Player,
    platforms: Platform[],
    canvasBounds: { width: number; height: number },
    deltaTime: number
  ): void {
    const patrolSize = monster.config.patrolDistance || 80;
    const speed = monster.config.speed || 1;
    const detectionRange = monster.config.detectionRange || 100;

    // Check if player is in guard area
    const playerDistance = this.getDistance(
      monster.x,
      monster.y,
      player.x,
      player.y
    );

    if (playerDistance < detectionRange) {
      // Alert behavior - move toward player more aggressively
      const dirX = player.x - monster.x;
      const dirY = player.y - monster.y;
      const normalized = this.normalize(dirX, dirY);

      monster.velocityX = normalized.x * speed * 1.5; // Faster when alert
      monster.velocityY = normalized.y * speed * 1.5;
      monster.aiState.isChasing = true;
    } else {
      // Normal patrol within designated area
      monster.aiState.isChasing = false;

      // Simple area patrol
      const centerX = monster.aiState.patrolStartX;
      const centerY = monster.aiState.patrolStartY;

      // If too far from center, move back
      const distanceFromCenter = this.getDistance(
        monster.x,
        monster.y,
        centerX,
        centerY
      );

      if (distanceFromCenter > patrolSize) {
        const dirX = centerX - monster.x;
        const dirY = centerY - monster.y;
        const normalized = this.normalize(dirX, dirY);

        monster.velocityX = normalized.x * speed;
        monster.velocityY = normalized.y * speed;
      } else {
        // Random movement within area
        if (Math.random() < 0.02) {
          // 2% chance per frame to change direction
          const angle = Math.random() * Math.PI * 2;
          monster.aiState.currentDirection.x = Math.cos(angle);
          monster.aiState.currentDirection.y = Math.sin(angle);
        }

        monster.velocityX = monster.aiState.currentDirection.x * speed * 0.5;
        monster.velocityY = monster.aiState.currentDirection.y * speed * 0.5;
      }
    }

    monster.x += monster.velocityX;
    monster.y += monster.velocityY;
  }
}
