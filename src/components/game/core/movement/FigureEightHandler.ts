import { BaseMovementHandler } from "./BaseMovementHandler";
import { Monster, MonsterAIState, MovementConfig } from "../../../types/Monster";
import { Player, Platform } from "../../../types/GameEngine";

export class FigureEightHandler extends BaseMovementHandler {
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