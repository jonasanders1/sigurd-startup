import { BaseMovementHandler } from "./BaseMovementHandler";
import { Monster, MonsterAIState, MovementConfig } from "../../../types/Monster";
import { Player, Platform } from "../../../types/GameEngine";

export class SineWaveHandler extends BaseMovementHandler {
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