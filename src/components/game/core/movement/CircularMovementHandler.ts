import { BaseMovementHandler } from "./BaseMovementHandler";
import { Monster, MonsterAIState, MovementConfig } from "../../../types/Monster";
import { Player, Platform } from "../../../types/GameEngine";

export class CircularMovementHandler extends BaseMovementHandler {
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