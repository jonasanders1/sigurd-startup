import { useEffect, useRef } from "react";
import { KaplayGameEngine } from "../kaplay/KaplayGameEngine";
import { MapDefinition } from "../config/MapDefinitions";
import { MonsterType } from "../../types/Game";
import { GameStatus, BonusType, GameStore } from "../../types/Game";
import { create } from "zustand";

// Simple test map for the playground
const playgroundMap: MapDefinition = {
  id: "playground",
  name: "Playground",
  width: 800,
  height: 600,
  playerStartX: 100,
  playerStartY: 500,
  backgroundColor: "#000000",
  theme: "default",
  groupSequence: [],
  platforms: [
    // Ground
    { x: 0, y: 550, width: 800, height: 50 },
    // Some test platforms
    { x: 300, y: 400, width: 200, height: 20 },
    { x: 100, y: 300, width: 200, height: 20 },
    { x: 500, y: 200, width: 200, height: 20 },
  ],
  monsters: [
    {
      x: 400,
      y: 300,
      type: MonsterType.BUREAUCRAT,
      patrolStartX: 300,
      patrolEndX: 500,
      speed: 1,
    },
    {
      x: 200,
      y: 200,
      type: MonsterType.TAXMAN,
      patrolStartX: 100,
      patrolEndX: 300,
      speed: 1.5,
    },
  ],
  bombs: [],
};

// Create a mock game store for the playground
const useMockGameStore = create<GameStore>()((set, get) => ({
  // Core game state
  lives: Infinity, // Unlimited lives
  score: 0,
  bonus: BonusType.NONE,
  level: 1,
  gameStatus: GameStatus.PLAYING, // Always in playing state
  currentMapId: "playground",
  efficiencyMultiplier: 1,
  bombsCollected: [],
  correctOrderCount: 0,
  bCoinsCollected: 0,
  eCoinsCollected: 0,
  pCoinActive: false,
  pCoinTimeLeft: 0,
  currentActiveGroup: null,
  completedGroups: [],
  isFullscreen: false,
  lastEarnedBonus: 0,
  lastPreBonusScore: 0,

  // Required actions (no-ops for playground)
  setGameStatus: () => {}, // Prevent status changes
  updateScore: () => {},
  loseLife: () => {},
  gainLife: () => {},
  setLevel: () => {},
  activatePCoin: () => {},
  deactivatePCoin: () => {},
  resetGame: () => {},
  collectSpecialCoin: () => {},
  updateBombHighlighting: () => {},
  updateSpecialCoins: () => {},
  setIsFullscreen: () => {},
  startGame: () => {}, // Prevent game start/stop
  pauseGame: () => {},
  continueGame: () => {},
  getState: () => get(),
  updateBonus: () => {},
  resetBonus: () => {},
  resetCorrectOrderCount: () => {},
  resetCompletedGroups: () => {},
  setCorrectOrderCount: () => {},
  setLastBonusAndScore: () => {},
  addBombCollected: () => {},
  incrementCorrectOrder: () => {},
  setActiveGroup: () => {},
  addCompletedGroup: () => {},
  isPlayGround: true,
  startPlayGround: () => {},
  setIsPlayGround: () => {},
  togglePlayGround: () => {},
  resetAll: () => {},
}));

export const PlaygroundGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<KaplayGameEngine | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;

    // Initialize Kaplay game engine with playground settings
    const gameEngine = new KaplayGameEngine(
      canvas,
      canvas.width,
      canvas.height,
      useMockGameStore.getState()
    );

    gameEngineRef.current = gameEngine;

    // Force load the playground map
    gameEngine.loadMap(playgroundMap);

    // Kaplay handles its own game loop, but we can update manually for playground
    const updateInterval = setInterval(() => {
      if (gameEngineRef.current) {
        gameEngineRef.current.update();
      }
    }, 1000 / 60); // 60 FPS

    return () => {
      clearInterval(updateInterval);
      if (gameEngineRef.current) {
        gameEngineRef.current.dispose();
      }
    };
  }, []);

  return (
    <div className="w-full h-full">
      <div className="flex flex-row gap-4 border w-full h-full">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="border rounded-lg"
        />
        <div className="bg-black/50 text-white p-2 flex-1 rounded-lg">
          <p>Playground Mode (Kaplay)</p>
          <p>Using Kaplay game engine with simplified physics</p>
        </div>
      </div>
    </div>
  );
};
