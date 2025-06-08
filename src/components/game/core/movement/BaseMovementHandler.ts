import { Monster, MonsterAIState, MovementConfig } from "../../../types/Monster";
import { Player, Platform } from "../../../types/GameEngine";

export abstract class BaseMovementHandler {
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