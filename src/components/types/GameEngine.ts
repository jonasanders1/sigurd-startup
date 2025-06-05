
import { GameStatus } from "./Game";

export interface GameState {
  score: number;
  lives: number;
  level: number;
  gameStatus: GameStatus;
  currentMapId: string;
  efficiencyMultiplier: number;
  bombsCollected: number[];
  correctOrderCount: number;
  bCoinsCollected: number;
  eCoinsCollected: number;
  pCoinActive: boolean; 
  pCoinTimeLeft: number;
  currentActiveGroup: number | null; // Track which group the player is currently working on
  completedGroups: number[]; // Track which groups have been completed
}

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
  velocityY: number;
  onGround: boolean;
  color: string;
}

export interface Bomb {
  x: number;
  y: number;
  width: number;
  height: number;
  order: number;
  group: number; // Add group property
  collected: boolean;
  isCorrectNext: boolean;
  isInActiveGroup: boolean; // Add flag for group highlighting
}



export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SpecialCoin {
  x: number;
  y: number;
  width: number;
  height: number;
  type: "B" | "E" | "P" | "S";
  collected: boolean;
  color: string;
  value?: number;
}
