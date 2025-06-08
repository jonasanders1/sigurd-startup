import { BaseMovementHandler } from "./BaseMovementHandler";
import {
  Monster,
  MonsterAIState,
  MovementConfig,
} from "../../../types/Monster";
import { PhysicsConfig } from "../../config/PhysicsConfig";

export class HorizontalPatrolHandler extends BaseMovementHandler {
  private patrolCycles: number = 0;
  private isFalling: boolean = false;
  private physicsConfig = PhysicsConfig.getDefaultConfig();

  update(
    monster: Monster & { aiState: MonsterAIState; config: MovementConfig }
  ): void {
    const patrolDistance = monster.config.patrolDistance || 100;
    const speed = monster.config.speed || 1;

    // Calculate patrol bounds
    const leftBound = monster.aiState.patrolStartX;
    const rightBound = leftBound + patrolDistance;

    if (this.isFalling) {
      // Apply monster gravity when falling
      monster.velocityY += this.physicsConfig.monster.gravity;
      
      // Cap the maximum fall speed
      if (monster.velocityY > this.physicsConfig.monster.maxFallSpeed) {
        monster.velocityY = this.physicsConfig.monster.maxFallSpeed;
      }
      
      monster.y += monster.velocityY;
      // Keep moving horizontally while falling
      monster.x += monster.velocityX;
      return;
    }

    // Move horizontally
    monster.x += monster.velocityX;

    // Reverse direction at patrol boundaries
    if (monster.x <= leftBound || monster.x >= rightBound - monster.width) {
      monster.velocityX *= -1;
      
      // Increment cycle counter when reaching left bound
      if (monster.x <= leftBound) {
        this.patrolCycles++;
        
        // Start falling after two complete cycles
        if (this.patrolCycles >= 2) {
          this.isFalling = true;
          monster.velocityY = 0; // Initial vertical velocity
          return;
        }
      }
    }

    // Ensure speed consistency
    monster.velocityX = monster.velocityX > 0 ? speed : -speed;
  }
}
