export enum MonsterType {
  BUREAUCRAT = "bureaucrat",
  TAXMAN = "taxman",
  REGULATOR = "regulator",
  TAX_GHOST = "tax-ghost",
  REGULATION_ROBOT = "regulation-robot",
  BUREAUCRAT_CLONE = "bureaucrat-clone",
  FEE_ALIEN = "fee-alien",
  CONTROL_CRAB = "control-crab",
}

export enum MovementPattern {
  HORIZONTAL_PATROL = "HORIZONTAL_PATROL",
  VERTICAL_BOUNCE = "VERTICAL_BOUNCE",
  CIRCULAR = "CIRCULAR",
  SINE_WAVE = "SINE_WAVE",
  FOLLOW_PLAYER = "FOLLOW_PLAYER",
  RANDOM_WALK = "RANDOM_WALK",
  FIGURE_EIGHT = "FIGURE_EIGHT",
  GUARD_AREA = "GUARD_AREA",
}

export interface MovementConfig {
  pattern: MovementPattern;
  speed: number;
  patrolDistance?: number;
  amplitude?: number;
  frequency?: number;
  detectionRange?: number;
  turnDelay?: number;
  [key: string]: unknown; // For pattern-specific config
}

export interface MonsterAIState {
  currentDirection: { x: number; y: number };
  timeAlive: number;
  lastDirectionChange: number;
  patrolStartX: number;
  patrolStartY: number;
  targetX?: number;
  targetY?: number;
  isChasing?: boolean;
  phaseOffset?: number; // For sine waves, circular movement
}

export interface Monster {
  x: number;
  y: number;
  width: number;
  height: number;
  type: MonsterType;
  velocityX: number;
  velocityY: number;
  patrolStartX: number;
  patrolEndX: number;
  speed: number;
  color: string;
  aiState: MonsterAIState;
  config: MovementConfig;
}
