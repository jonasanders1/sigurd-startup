export interface BombCollected {
  order: number;
  group: number;
  score: number;
}

export enum BonusType {
  BIG = 50000,
  MEDIUM = 30000,
  SMALL = 20000,
  TINY = 10000,
  NONE = 0,
}

export enum GameStatus {
  MENU = "menu",
  COUNTDOWN = "countdown",
  PLAYING = "playing",
  PAUSED = "paused",
  BONUS_SCREEN = "bonus_screen",
  GAME_OVER = "game_over",
}

// Simple monster types for the simplified game
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

// Simple audio types for the simplified game
export interface AudioConfig {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  enabled: boolean;
  musicMuted: boolean;
  sfxMuted: boolean;
}

export interface AudioAssets {
  [key: string]: string;
}

export interface GameStore {
  // Core game state
  lives: number;
  score: number;
  bonus: BonusType;
  level: number;
  gameStatus: GameStatus;
  currentMapId: string;
  efficiencyMultiplier: number;
  bombsCollected: BombCollected[];
  correctOrderCount: number;
  bCoinsCollected: number;
  eCoinsCollected: number;
  pCoinActive: boolean;
  pCoinTimeLeft: number;
  currentActiveGroup: number | null;
  completedGroups: number[];
  isFullscreen: boolean;
  lastEarnedBonus: number;
  lastPreBonusScore: number;
  isPlayGround: boolean;

  // Actions
  setGameStatus: (status: GameStatus) => void;
  updateScore: (points: number) => void;
  loseLife: () => void;
  gainLife: () => void;
  setLevel: (level: number) => void;
  activatePCoin: (duration: number) => void;
  deactivatePCoin: () => void;
  resetGame: () => void;
  collectSpecialCoin: (type: "B" | "E" | "P" | "S") => void;
  updateBombHighlighting: () => void;
  updateSpecialCoins: () => void;
  setIsFullscreen: (value: boolean) => void;
  startGame: () => void;
  pauseGame: () => void;
  continueGame: () => void;
  getState: () => any;
  updateBonus: (points: number) => void;
  resetBonus: () => void;
  resetCorrectOrderCount: () => void;
  resetCompletedGroups: () => void;
  setCorrectOrderCount: (count: number) => void;
  setLastBonusAndScore: (bonus: number, score: number) => void;
  addBombCollected: (bomb: BombCollected) => void;
  incrementCorrectOrder: () => void;
  setActiveGroup: (group: number | null) => void;
  addCompletedGroup: (group: number) => void;
  setIsPlayGround: (value: boolean) => void;
  togglePlayGround: () => void;
  startPlayGround: () => void;
  resetAll: () => void;
}
