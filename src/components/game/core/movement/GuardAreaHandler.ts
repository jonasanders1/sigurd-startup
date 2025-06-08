import { BaseMovementHandler } from "./BaseMovementHandler";
import { Monster, MonsterAIState, MovementConfig } from "../../../types/Monster";
import { Player, Platform } from "../../../types/GameEngine";

export class GuardAreaHandler extends BaseMovementHandler {
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