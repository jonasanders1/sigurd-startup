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