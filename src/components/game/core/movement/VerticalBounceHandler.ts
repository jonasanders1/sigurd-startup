import { BaseMovementHandler } from "./BaseMovementHandler";
import { Monster, MonsterAIState, MovementConfig } from "../../../types/Monster";
import { Player, Platform } from "../../../types/GameEngine";

export class VerticalBounceHandler extends BaseMovementHandler {
  update(
    monster: Monster & { aiState: MonsterAIState; config: MovementConfig }
  ): void {
    const bounceHeight = monster.config.patrolDistance || 180;
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