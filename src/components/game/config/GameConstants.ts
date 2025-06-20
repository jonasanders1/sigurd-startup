export const GAME_CONSTANTS = {
  TIMING: {
    COUNTDOWN_DURATION: 3000,
    BONUS_SCREEN_DURATION: 3000,
    TRANSITION_DELAY: 1000,
    POWER_MODE_DURATION: 10000,
    SPAWN_INTERVAL: 10000,
  },
  COLLISION: {
    PLAYER_MONSTER: "player-monster",
    PLAYER_BOMB: "player-bomb",
    PLAYER_COIN: "player-coin",
    PLAYER_PLATFORM: "player-platform",
  },
  MONSTER_TYPES: {
    BUREAUCRAT: "bureaucrat",
    TAXMAN: "taxman",
    REGULATOR: "regulator",
    TAX_GHOST: "tax-ghost",
    REGULATION_ROBOT: "regulation-robot",
    BUREAUCRAT_CLONE: "bureaucrat-clone",
    FEE_ALIEN: "fee-alien",
    CONTROL_CRAB: "control-crab",
  },
  COIN_TYPES: {
    B_COIN: "B",
    E_COIN: "E",
    P_COIN: "P",
    S_COIN: "S",
  },
  COLORS: {
    PLAYER: "#3B82F6",
    MONSTERS: {
      BUREAUCRAT: "#00ff89",
      TAXMAN: "#ff4b36",
      REGULATOR: "#ffcf39",
      TAX_GHOST: "#d3d3d3",
      REGULATION_ROBOT: "#d3d3d3",
      BUREAUCRAT_CLONE: "#477777",
      FEE_ALIEN: "#66a6a6",
      CONTROL_CRAB: "#808000",
    },
    P_COIN: ["#FFD700", "#FFA500", "#FF4500"],
  },
  MOVEMENT_PATTERNS: {
    HORIZONTAL_PATROL: "horizontal-patrol",
    VERTICAL_BOUNCE: "vertical-bounce",
    CIRCULAR: "circular",
    SINE_WAVE: "sine-wave",
    FOLLOW_PLAYER: "follow-player",
    RANDOM_WALK: "random-walk",
    FIGURE_EIGHT: "figure-eight",
    GUARD_AREA: "guard-area",
  },
  AUDIO: {
    JUMP: "jump",
    COLLECT: "collect",
    POWER_UP: "power-up",
    LEVEL_COMPLETE: "level-complete",
    GAME_OVER: "game-over",
    BACKGROUND: "background",
  },
} as const;

export const GameConstants = GAME_CONSTANTS;
