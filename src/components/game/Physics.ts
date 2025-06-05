import { Platform } from "./GameEngine";
import { Player } from "./GameEngine";

export class Physics {
  private gravity = 0.15;
  private fastFallGravity = 0.8;
  private friction = 0.8;
  private moveSpeed = 5;
  private jumpForce = -13;
  private maxJumpTime = 10;
  private floatDuration = 1;
  private floatCooldown = 10;

  public updatePlayerMovement(
    player: Player,
    keys: { [key: string]: boolean },
    jumpHoldTime: number
  ): { newJumpHoldTime: number } {
    let newJumpHoldTime = jumpHoldTime;

    // Horizontal movement
    if (keys["ArrowLeft"] || keys["KeyA"]) {
      player.velocityX = -this.moveSpeed;
    } else if (keys["ArrowRight"] || keys["KeyD"]) {
      player.velocityX = this.moveSpeed;
    } else {
      player.velocityX *= this.friction;
    }

    // Jump and Float system
    const jumpKey = keys["ArrowUp"] || keys["KeyW"];
    const floatKey = keys["Space"];
    const fastFallKey = keys["ArrowDown"];

    // Variable jump height system
    if (jumpKey && player.onGround) {
      // Start jump
      player.velocityY = this.jumpForce;
      player.onGround = false;
      newJumpHoldTime = Date.now();
    } else if (jumpKey && !player.onGround) {
      // Continue jump if still holding and within max time
      const currentTime = Date.now();
      if (currentTime - newJumpHoldTime < this.maxJumpTime) {
        // Gradually reduce upward velocity
        player.velocityY = Math.max(player.velocityY, this.jumpForce * 0.5);
      }
    }

    // Float system - temporarily cancel gravity
    if (floatKey && !player.onGround) {
      const currentTime = Date.now();

      // Check if we can use float
      if (currentTime - newJumpHoldTime > this.floatCooldown) {
        // Cancel vertical velocity to create float effect
        player.velocityY = 0;
        newJumpHoldTime = currentTime;
      }
    }

    // Fast fall
    if (fastFallKey && !player.onGround) {
      player.velocityY += this.fastFallGravity;
    }

    return { newJumpHoldTime };
  }

  public updatePlayerPhysics(
    player: Player,
    platforms: Platform[],
    canvasWidth: number,
    canvasHeight: number
  ): { hitWall: boolean; fell: boolean; onGround: boolean } {
    let hitWall = false;
    let fell = false;
    const wasOnGround = player.onGround;

    // Apply gravity (if not fast falling)
    if (!player.onGround) {
      player.velocityY += this.gravity;
    }

    // Update position
    player.x += player.velocityX;
    player.y += player.velocityY;

    // Check horizontal boundaries and detect wall hits
    if (player.x <= 0) {
      player.x = 0;
      player.velocityX = 0;
      hitWall = true;
    }
    if (player.x >= canvasWidth - player.width) {
      player.x = canvasWidth - player.width;
      player.velocityX = 0;
      hitWall = true;
    }

    // Check vertical boundaries
    if (player.y <= 0) {
      player.y = 0;
      player.velocityY = 0;
    }
    if (player.y >= canvasHeight - player.height) {
      player.y = canvasHeight - player.height;
      player.velocityY = 0;
    }

    // Platform collision detection
    let isOnAnyPlatform = false;
    const GROUND_TOLERANCE = 2;

    platforms.forEach((platform) => {
      // Check if player is colliding with platform
      if (
        player.x < platform.x + platform.width &&
        player.x + player.width > platform.x &&
        player.y < platform.y + platform.height &&
        player.y + player.height > platform.y
      ) {
        // Determine collision direction and resolve
        const overlapLeft = player.x + player.width - platform.x;
        const overlapRight = platform.x + platform.width - player.x;
        const overlapTop = player.y + player.height - platform.y;
        const overlapBottom = platform.y + platform.height - player.y;

        const minOverlap = Math.min(
          overlapLeft,
          overlapRight,
          overlapTop,
          overlapBottom
        );

        if (minOverlap === overlapTop && player.velocityY > 0) {
          // Landing on top of platform
          player.y = platform.y - player.height;
          player.velocityY = 0;
          isOnAnyPlatform = true;
        } else if (minOverlap === overlapBottom && player.velocityY < 0) {
          // Hitting platform from below
          player.y = platform.y + platform.height;
          player.velocityY = 0;
        } else if (minOverlap === overlapLeft && player.velocityX > 0) {
          // Hitting platform from left
          player.x = platform.x - player.width;
          player.velocityX = 0;
          hitWall = true;
        } else if (minOverlap === overlapRight && player.velocityX < 0) {
          // Hitting platform from right
          player.x = platform.x + platform.width;
          player.velocityX = 0;
          hitWall = true;
        }
      }
    });

    // Update ground state with tolerance
    const nearGround =
      player.y >= canvasHeight - player.height - GROUND_TOLERANCE;
    player.onGround = isOnAnyPlatform || nearGround;

    // Only register "fell" if there's a significant change
    if (wasOnGround && !player.onGround && player.velocityY > 0) {
      fell = true;
    }

    return { hitWall, fell, onGround: player.onGround };
  }
}
