import { Platform, Player } from "./GameEngine";

export interface PhysicsConfig {
  gravity: number;
  fastFallGravity: number;
  friction: number;
  moveSpeed: number;
  jumpForce: number;
  maxJumpTime: number;
  floatForce: number;
  maxFloatSpeed: number;
  groundTolerance: number;
}

export interface MovementState {
  isJumping: boolean;
  jumpStartTime: number;
  wasFloatPressed: boolean;
  lastGroundedTime: number;
}

export interface PhysicsResult {
  hitWall: boolean;
  fell: boolean;
  onGround: boolean;
  justLanded: boolean;
  justLeftGround: boolean;
}

export class Physics {
  private config: PhysicsConfig = {
    gravity: 0.15,
    fastFallGravity: 0.8,
    friction: 0.8,
    moveSpeed: 5,
    jumpForce: -13,
    maxJumpTime: 300, // milliseconds
    floatForce: -4, // Upward force per float input
    maxFloatSpeed: -4, // Maximum upward speed when floating
    groundTolerance: 2,
  };

  private movementState: MovementState = {
    isJumping: false,
    jumpStartTime: 0,
    wasFloatPressed: false,
    lastGroundedTime: 0,
  };

  /**
   * Handle all player input and apply movement forces
   */
  public updatePlayerMovement(
    player: Player,
    keys: { [key: string]: boolean }
  ): void {
    this.handleHorizontalMovement(player, keys);
    this.handleVerticalMovement(player, keys);
  }

  /**
   * Apply physics forces and update player position
   */
  public updatePlayerPhysics(
    player: Player,
    platforms: Platform[],
    canvasWidth: number,
    canvasHeight: number
  ): PhysicsResult {
    const wasOnGround = player.onGround;

    // Apply gravity if not grounded
    this.applyGravity(player);

    // Update position based on velocity
    this.updatePosition(player);

    // Handle boundary collisions
    const hitWall = this.handleBoundaryCollisions(
      player,
      canvasWidth,
      canvasHeight
    );

    // Handle platform collisions
    const platformCollisions = this.handlePlatformCollisions(player, platforms);

    // Update ground state
    const groundState = this.updateGroundState(
      player,
      platformCollisions,
      canvasHeight,
      wasOnGround
    );

    return {
      hitWall,
      fell: groundState.fell,
      onGround: groundState.onGround,
      justLanded: groundState.justLanded,
      justLeftGround: groundState.justLeftGround,
    };
  }

  /**
   * Handle horizontal movement (left/right)
   */
  private handleHorizontalMovement(
    player: Player,
    keys: { [key: string]: boolean }
  ): void {
    const leftPressed = keys["ArrowLeft"] || keys["KeyA"];
    const rightPressed = keys["ArrowRight"] || keys["KeyD"];

    if (leftPressed) {
      player.velocityX = -this.config.moveSpeed;
    } else if (rightPressed) {
      player.velocityX = this.config.moveSpeed;
    } else {
      // Apply friction when no input
      player.velocityX *= this.config.friction;

      // Stop very small movements to prevent jitter
      if (Math.abs(player.velocityX) < 0.1) {
        player.velocityX = 0;
      }
    }
  }

  /**
   * Handle vertical movement (jump, float, fast fall)
   */
  private handleVerticalMovement(
    player: Player,
    keys: { [key: string]: boolean }
  ): void {
    const jumpPressed = keys["ArrowUp"] || keys["KeyW"];
    const floatPressed = keys["Space"];
    const fastFallPressed = keys["ArrowDown"];

    this.handleJumping(player, jumpPressed);
    this.handleFloating(player, floatPressed);
    this.handleFastFall(player, fastFallPressed);
  }

  /**
   * Handle jump mechanics with variable height
   */
  private handleJumping(player: Player, jumpPressed: boolean): void {
    const currentTime = Date.now();

    if (jumpPressed && player.onGround && !this.movementState.isJumping) {
      // Start new jump
      player.velocityY = this.config.jumpForce;
      player.onGround = false;
      this.movementState.isJumping = true;
      this.movementState.jumpStartTime = currentTime;
    } else if (
      jumpPressed &&
      this.movementState.isJumping &&
      !player.onGround
    ) {
      // Continue jump if within max time and moving upward
      const jumpDuration = currentTime - this.movementState.jumpStartTime;

      if (jumpDuration < this.config.maxJumpTime && player.velocityY < 0) {
        // Reduce upward velocity gradually for variable jump height
        const jumpMultiplier = Math.max(
          0.3,
          1 - jumpDuration / this.config.maxJumpTime
        );
        player.velocityY = Math.min(
          player.velocityY,
          this.config.jumpForce * jumpMultiplier
        );
      }
    } else if (
      !jumpPressed &&
      this.movementState.isJumping &&
      player.velocityY < 0
    ) {
      // Jump button released - reduce upward velocity faster
      player.velocityY *= 0.7;
    }

    // Reset jumping state when grounded
    if (player.onGround) {
      this.movementState.isJumping = false;
    }
  }

  /**
   * Handle authentic Bomb Jack floating mechanism
   */
  private handleFloating(player: Player, floatPressed: boolean): void {
    if (
      floatPressed &&
      !this.movementState.wasFloatPressed &&
      !player.onGround &&
      player.velocityY > 0 // Only allow floating when falling
    ) {
      // Reduce falling speed by applying a small upward force
      // but never enough to make the player go up
      player.velocityY = Math.min(player.velocityY, 0.5); // Cap falling speed to 2.0
    }

    this.movementState.wasFloatPressed = floatPressed;
  }

  /**
   * Handle fast falling
   */
  private handleFastFall(player: Player, fastFallPressed: boolean): void {
    if (fastFallPressed && !player.onGround) {
      player.velocityY += this.config.fastFallGravity;
    }
  }

  /**
   * Apply gravity force to player
   */
  private applyGravity(player: Player): void {
    if (!player.onGround) {
      player.velocityY += this.config.gravity;
    }
  }

  /**
   * Update player position based on velocity
   */
  private updatePosition(player: Player): void {
    player.x += player.velocityX;
    player.y += player.velocityY;
  }

  /**
   * Handle collisions with screen boundaries
   */
  private handleBoundaryCollisions(
    player: Player,
    canvasWidth: number,
    canvasHeight: number
  ): boolean {
    let hitWall = false;

    // Horizontal boundaries
    if (player.x <= 0) {
      player.x = 0;
      player.velocityX = 0;
      hitWall = true;
    } else if (player.x >= canvasWidth - player.width) {
      player.x = canvasWidth - player.width;
      player.velocityX = 0;
      hitWall = true;
    }

    // Vertical boundaries
    if (player.y <= 0) {
      player.y = 0;
      player.velocityY = 0;
    } else if (player.y >= canvasHeight - player.height) {
      player.y = canvasHeight - player.height;
      player.velocityY = 0;
    }

    return hitWall;
  }

  /**
   * Handle collisions with platforms
   */
  private handlePlatformCollisions(
    player: Player,
    platforms: Platform[]
  ): { isOnAnyPlatform: boolean; hitWall: boolean } {
    let isOnAnyPlatform = false;
    let hitWall = false;

    platforms.forEach((platform) => {
      const collision = this.checkPlatformCollision(player, platform);

      if (collision.colliding) {
        const resolution = this.resolvePlatformCollision(
          player,
          platform,
          collision
        );

        if (resolution.landedOnTop) {
          isOnAnyPlatform = true;
        }

        if (resolution.hitSide) {
          hitWall = true;
        }
      }
    });

    return { isOnAnyPlatform, hitWall };
  }

  /**
   * Check if player is colliding with a platform
   */
  private checkPlatformCollision(
    player: Player,
    platform: Platform
  ): {
    colliding: boolean;
    overlapLeft: number;
    overlapRight: number;
    overlapTop: number;
    overlapBottom: number;
  } {
    const colliding =
      player.x < platform.x + platform.width &&
      player.x + player.width > platform.x &&
      player.y < platform.y + platform.height &&
      player.y + player.height > platform.y;

    if (!colliding) {
      return {
        colliding: false,
        overlapLeft: 0,
        overlapRight: 0,
        overlapTop: 0,
        overlapBottom: 0,
      };
    }

    return {
      colliding: true,
      overlapLeft: player.x + player.width - platform.x,
      overlapRight: platform.x + platform.width - player.x,
      overlapTop: player.y + player.height - platform.y,
      overlapBottom: platform.y + platform.height - player.y,
    };
  }

  /**
   * Resolve platform collision and update player position
   */
  private resolvePlatformCollision(
    player: Player,
    platform: Platform,
    collision: ReturnType<typeof this.checkPlatformCollision>
  ): { landedOnTop: boolean; hitSide: boolean } {
    const minOverlap = Math.min(
      collision.overlapLeft,
      collision.overlapRight,
      collision.overlapTop,
      collision.overlapBottom
    );

    if (minOverlap === collision.overlapTop && player.velocityY > 0) {
      // Landing on top of platform
      player.y = platform.y - player.height;
      player.velocityY = 0;
      return { landedOnTop: true, hitSide: false };
    } else if (minOverlap === collision.overlapBottom && player.velocityY < 0) {
      // Hitting platform from below
      player.y = platform.y + platform.height;
      player.velocityY = 0;
      return { landedOnTop: false, hitSide: false };
    } else if (minOverlap === collision.overlapLeft && player.velocityX > 0) {
      // Hitting platform from left
      player.x = platform.x - player.width;
      player.velocityX = 0;
      return { landedOnTop: false, hitSide: true };
    } else if (minOverlap === collision.overlapRight && player.velocityX < 0) {
      // Hitting platform from right
      player.x = platform.x + platform.width;
      player.velocityX = 0;
      return { landedOnTop: false, hitSide: true };
    }

    return { landedOnTop: false, hitSide: false };
  }

  /**
   * Update ground state and detect state changes
   */
  private updateGroundState(
    player: Player,
    platformCollisions: { isOnAnyPlatform: boolean },
    canvasHeight: number,
    wasOnGround: boolean
  ): {
    onGround: boolean;
    fell: boolean;
    justLanded: boolean;
    justLeftGround: boolean;
  } {
    const currentTime = Date.now();
    const nearGround =
      player.y >= canvasHeight - player.height - this.config.groundTolerance;
    const isOnGround = platformCollisions.isOnAnyPlatform || nearGround;

    // Update player ground state
    player.onGround = isOnGround;

    // Track ground state changes
    const justLanded = !wasOnGround && isOnGround;
    const justLeftGround = wasOnGround && !isOnGround && player.velocityY > 0;

    // Update last grounded time
    if (isOnGround) {
      this.movementState.lastGroundedTime = currentTime;
    }

    return {
      onGround: isOnGround,
      fell: justLeftGround,
      justLanded,
      justLeftGround,
    };
  }

  /**
   * Reset physics state (for level restart, etc.)
   */
  public reset(): void {
    this.movementState = {
      isJumping: false,
      jumpStartTime: 0,
      wasFloatPressed: false,
      lastGroundedTime: 0,
    };
  }

  /**
   * Get current movement state (for debugging)
   */
  public getMovementState(): MovementState {
    return { ...this.movementState };
  }

  /**
   * Update physics configuration
   */
  public updateConfig(newConfig: Partial<PhysicsConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}
