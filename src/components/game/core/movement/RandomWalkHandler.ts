import { BaseMovementHandler } from "./BaseMovementHandler";
import { Monster, MonsterAIState, MovementConfig } from "../../../types/Monster";
import { Player, Platform } from "../../../types/GameEngine";

export class RandomWalkHandler extends BaseMovementHandler {
  private checkPlatformCollision(monster: Monster, platform: Platform): boolean {
    return (
      monster.x < platform.x + platform.width &&
      monster.x + monster.width > platform.x &&
      monster.y < platform.y + platform.height &&
      monster.y + monster.height > platform.y
    );
  }

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

    // Move the monster
    monster.x += monster.velocityX;
    monster.y += monster.velocityY;

    // Check platform collisions
    for (const platform of platforms) {
      if (this.checkPlatformCollision(monster, platform)) {
        // Determine which side of the platform was hit
        const fromLeft = Math.abs(monster.x + monster.width - platform.x);
        const fromRight = Math.abs(monster.x - (platform.x + platform.width));
        const fromTop = Math.abs(monster.y + monster.height - platform.y);
        const fromBottom = Math.abs(monster.y - (platform.y + platform.height));

        // Find the minimum penetration
        const minPenetration = Math.min(fromLeft, fromRight, fromTop, fromBottom);

        // Bounce based on which side was hit
        if (minPenetration === fromLeft) {
          monster.x = platform.x - monster.width;
          monster.velocityX = -Math.abs(monster.velocityX);
          monster.aiState.currentDirection.x = -Math.abs(monster.aiState.currentDirection.x);
        } else if (minPenetration === fromRight) {
          monster.x = platform.x + platform.width;
          monster.velocityX = Math.abs(monster.velocityX);
          monster.aiState.currentDirection.x = Math.abs(monster.aiState.currentDirection.x);
        } else if (minPenetration === fromTop) {
          monster.y = platform.y - monster.height;
          monster.velocityY = -Math.abs(monster.velocityY);
          monster.aiState.currentDirection.y = -Math.abs(monster.aiState.currentDirection.y);
        } else if (minPenetration === fromBottom) {
          monster.y = platform.y + platform.height;
          monster.velocityY = Math.abs(monster.velocityY);
          monster.aiState.currentDirection.y = Math.abs(monster.aiState.currentDirection.y);
        }
      }
    }
  }
} 