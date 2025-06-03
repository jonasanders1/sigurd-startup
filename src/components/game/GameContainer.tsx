import React, { useRef, useEffect, useState } from "react";
import { GameEngine } from "./GameEngine";
import { GameUI } from "./GameUI";
import { Button } from "@/components/ui/button";
import { Maximize, Minimize, Heart } from "lucide-react";

export const GameContainer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gameState, setGameState] = useState({
    score: 0,
    lives: 3,
    level: 1,
    gameStatus: "menu" as "menu" | "playing" | "paused" | "gameOver",
    currentMapId: "training",
    efficiencyMultiplier: 1,
    bombsCollected: [] as number[],
    correctOrderCount: 0,
    bCoinsCollected: 0,
    eCoinsCollected: 0,
    pCoinActive: false,
    pCoinTimeLeft: 0,
    currentActiveGroup: null,
    completedGroups: [],
  });

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Initialize game engine
    gameEngineRef.current = new GameEngine(
      ctx,
      canvas.width,
      canvas.height,
      setGameState
    );

    // Game loop
    let animationId: number;
    const gameLoop = () => {
      if (gameEngineRef.current && gameState.gameStatus === "playing") {
        gameEngineRef.current.update();
        gameEngineRef.current.render();
      }
      animationId = requestAnimationFrame(gameLoop);
    };

    if (gameState.gameStatus === "playing") {
      gameLoop();
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [gameState.gameStatus]);

  const startGame = () => {
    setGameState((prev) => ({ ...prev, gameStatus: "playing" }));
    if (gameEngineRef.current) {
      gameEngineRef.current.start();
    }
  };

  const pauseGame = () => {
    setGameState((prev) => ({
      ...prev,
      gameStatus: prev.gameStatus === "paused" ? "playing" : "paused",
    }));
  };

  const resetGame = () => {
    setGameState({
      score: 0,
      lives: 3,
      level: 1,
      gameStatus: "menu",
      currentMapId: "training",
      efficiencyMultiplier: 1,
      bombsCollected: [],
      correctOrderCount: 0,
      bCoinsCollected: 0,
      eCoinsCollected: 0,
      pCoinActive: false,
      pCoinTimeLeft: 0,
      currentActiveGroup: null,
      completedGroups: [],
    });
    if (gameEngineRef.current) {
      gameEngineRef.current.reset();
    }
  };

  const toggleFullscreen = async () => {
    if (!canvasContainerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await canvasContainerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      {/* Show GameUI only when not playing */}
      {gameState.gameStatus !== "playing" && (
        <GameUI
          score={gameState.score}
          lives={gameState.lives}
          level={gameState.level}
          gameStatus={gameState.gameStatus}
          onStart={startGame}
          onPause={pauseGame}
          onReset={resetGame}
        />
      )}

      {/* Game Stats Display - Hidden */}
      <div className="bg-slate-700 rounded-lg p-3 text-white text-sm hidden">
        <div className="grid grid-cols-2 md:grid-cols-7 gap-4 text-center">
          <div>
            <div className="text-yellow-400 font-bold">
              {gameState.bombsCollected.length}/24
            </div>
            <div>Bombs Collected</div>
          </div>
          <div>
            <div className="text-green-400 font-bold">
              {gameState.correctOrderCount}/24
            </div>
            <div>Correct Order</div>
          </div>
          <div>
            <div className="text-orange-400 font-bold">
              {gameState.currentActiveGroup || "None"}
            </div>
            <div>Active Group</div>
          </div>
          <div>
            <div className="text-cyan-400 font-bold">
              {gameState.completedGroups.length}/6
            </div>
            <div>Groups Done</div>
          </div>
          <div>
            <div className="text-blue-400 font-bold">
              {gameState.efficiencyMultiplier}x
            </div>
            <div>Efficiency</div>
          </div>
          <div>
            <div className="text-purple-400 font-bold">
              {gameState.bCoinsCollected}/5
            </div>
            <div>B Coins</div>
          </div>
          <div>
            <div className="text-pink-400 font-bold">
              {gameState.eCoinsCollected}
            </div>
            <div>E Coins</div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2 mt-2 text-center">
          <div>
            <div
              className={`font-bold ${
                gameState.pCoinActive ? "text-orange-400" : "text-gray-400"
              }`}
            >
              {gameState.pCoinActive
                ? Math.ceil(gameState.pCoinTimeLeft / 1000)
                : "OFF"}
            </div>
            <div>Power Mode</div>
          </div>
        </div>
      </div>

      <div
        ref={canvasContainerRef}
        className={`relative bg-black rounded-lg shadow-2xl overflow-hidden border-2 border-border max-w-4xl ${
          isFullscreen ? "w-screen h-screen max-w-none" : ""
        }`}
      >
        {/* Fullscreen Toggle Button */}
        <Button
          onClick={toggleFullscreen}
          variant="secondary"
          size="sm"
          className="absolute top-4 right-4 z-10 bg-background/90 hover:bg-muted border border-border font-bold"
        >
          {isFullscreen ? (
            <Minimize className="w-4 h-4" />
          ) : (
            <Maximize className="w-4 h-4" />
          )}
        </Button>

        {/* In-Game UI Overlay */}
        {gameState.gameStatus === "playing" && (
          <>
            {/* Score and Level - Top Center */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-background/95 text-foreground px-4 py-2 rounded-lg border border-border backdrop-blur-sm">
              <div className="flex items-center gap-4 text-sm font-mono">
                <div className="text-center">
                  <div className="text-primary font-bold">
                    {gameState.score.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">SCORE</div>
                </div>
                <div className="w-px h-8 bg-border"></div>
                <div className="text-center">
                  <div className="text-accent font-bold">{gameState.level}</div>
                  <div className="text-xs text-muted-foreground">LEVEL</div>
                </div>
              </div>
            </div>

            {/* Lives - Bottom Left */}
            <div className="absolute bottom-4 left-4 z-10 bg-background/95 text-foreground px-3 py-2 rounded-lg border border-border backdrop-blur-sm">
              <div className="flex items-center gap-1">
                {Array.from({ length: gameState.lives }, (_, i) => (
                  <Heart
                    key={i}
                    className="w-4 h-4 text-destructive fill-current"
                  />
                ))}
                <span className="text-xs text-muted-foreground ml-2 font-mono">
                  LIVES
                </span>
              </div>
            </div>
          </>
        )}

        <canvas
          ref={canvasRef}
          className={`block max-w-full ${
            isFullscreen ? "w-full h-full" : "max-w-4xl"
          }`}
          style={{ imageRendering: "pixelated" }}
        />

        {gameState.gameStatus !== "playing" && (
          <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center text-foreground font-mono">
              {gameState.gameStatus === "menu" && (
                <div>
                  <h2 className="text-3xl font-bold mb-4 text-primary">
                    SIGURD'S STARTUP ADVENTURE
                  </h2>
                  <p className="text-lg mb-2 text-accent">
                    COLLECT BOMBS IN GROUPS OF 4!
                  </p>
                  <p className="text-sm mb-2 text-primary">
                    GOLD: Next in sequence • ORANGE: Current group • RED: Other
                    groups
                  </p>
                  <p className="text-sm mb-2 text-accent">
                    Start with any bomb, then complete that group!
                  </p>
                  <p className="text-sm text-accent">
                    B: Efficiency • E: Extra Life • P: Power Mode • S: Skip
                    Level
                  </p>
                  <p className="text-sm text-muted-foreground mt-4">
                    MAP: {gameState.level}/3
                  </p>
                </div>
              )}
              {gameState.gameStatus === "paused" && (
                <div>
                  <h2 className="text-3xl font-bold mb-4 text-primary">
                    GAME PAUSED
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Press Resume to continue Sigurd's journey
                  </p>
                </div>
              )}
              {gameState.gameStatus === "gameOver" && (
                <div>
                  <h2 className="text-3xl font-bold mb-4 text-destructive">
                    GAME OVER
                  </h2>
                  <p className="text-lg mb-2 text-primary">
                    Final Score: {gameState.score.toLocaleString()} kr
                  </p>
                  <p className="text-sm mb-2 text-muted-foreground">
                    Correct Order: {gameState.correctOrderCount}/24
                  </p>
                  <p className="text-sm mb-2 text-muted-foreground">
                    Groups Completed: {gameState.completedGroups.length}/6
                  </p>
                  <p className="text-sm mb-2 text-muted-foreground">
                    Efficiency: {gameState.efficiencyMultiplier}x
                  </p>
                  <p className="text-sm mb-2 text-muted-foreground">
                    Special Coins: B:{gameState.bCoinsCollected} E:
                    {gameState.eCoinsCollected}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Click Reset to try again
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Power Mode Overlay */}
        {gameState.pCoinActive && (
          <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-lg font-bold font-mono animate-pulse border border-border">
            POWER MODE: {Math.ceil(gameState.pCoinTimeLeft / 1000)}s
          </div>
        )}
      </div>
    </div>
  );
};
