import { BaseMovementHandler } from "./BaseMovementHandler";
import { Monster, MonsterAIState, MovementConfig } from "../../../types/Monster";
import { Player, Platform } from "../../../types/GameEngine";

export class FollowPlayerHandler extends BaseMovementHandler {
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