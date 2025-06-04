export interface BombCollected {
  order: number;
  group: number;
  score: number;
}

export interface GameStore {
  // State
  score: number;
  lives: number;
  level: number;
  gameStatus: 'menu' | 'playing' | 'paused' | 'gameOver';
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
  setGameStatus: (status: 'menu' | 'playing' | 'paused' | 'gameOver') => void;
  updateScore: (points: number) => void;
  loseLife: () => void;
  gainLife: () => void;
  setLevel: (level: number) => void;
  activatePCoin: (duration: number) => void;
  deactivatePCoin: () => void;
  resetGame: () => void;
  collectSpecialCoin: (type: 'B' | 'E' | 'P' | 'S') => void;
  updateBombHighlighting: () => void;
  updateSpecialCoins: () => void;
  setIsFullscreen: (value: boolean) => void;
  startGame: () => void;
  pauseGame: () => void;
  continueGame: () => void;
  getState: () => GameStore;

  // Bomb collection actions
  addBombCollected: (bomb: BombCollected) => void;
  incrementCorrectOrder: () => void;
  setActiveGroup: (group: number | null) => void;
  addCompletedGroup: (group: number) => void;
}


