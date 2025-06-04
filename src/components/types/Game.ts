export interface BombCollected {
  order: number;
  group: number;
  score: number;
}

export enum BonusType {
  BIG = 50000,
  MEDIUM = 30000,
  SMALL = 10000,
  NONE = 0,
}

export enum GameStatus {
  MENU = "menu",
  PLAYING = "playing",
  PAUSED = "paused",
  GAME_OVER = "gameOver",
  BONUS_SCREEN = "bonusScreen",
}

export interface GameStore {
  // State
  score: number;
  lives: number;
  bonus: number;
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

  // Actions
  setGameStatus: (status: GameStatus) => void;
  updateScore: (bonus: number, score: number) => void;
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
  getState: () => GameStore;
  updateBonus: (points: number) => void;
  resetBonus: () => void;
  resetCorrectOrderCount: () => void;
  // Bomb collection actions
  addBombCollected: (bomb: BombCollected) => void;
  incrementCorrectOrder: () => void;
  setActiveGroup: (group: number | null) => void;
  addCompletedGroup: (group: number) => void;
}
