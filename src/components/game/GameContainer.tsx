import React, { useRef, useEffect, useState } from "react";
import { GameEngine } from "./GameEngine";
import { Button } from "@/components/ui/button";
import { Maximize, Minimize } from "lucide-react";
import { DebugPanel } from "./GameStats";
import { PowerModeOverlay } from "./PowerModeOverlay";
import { GameMenu } from "./GameMenu";
import { InGameMenu } from "./InGameMenu";

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
      <DebugPanel gameState={gameState} />

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

        <canvas
          ref={canvasRef}
          className={`block max-w-full ${
            isFullscreen ? "w-full h-full" : "max-w-4xl"
          }`}
          style={{ imageRendering: "pixelated" }}
        />

        {/* In-game UI */}
        {gameState.gameStatus === "playing" && (
          <InGameMenu
            score={gameState.score}
            level={gameState.level}
            lives={gameState.lives}
            onPause={pauseGame}
            onReset={resetGame}
          />
        )}

        {/* Menu Screens */}
        {gameState.gameStatus !== "playing" && (
          <GameMenu 
            gameState={gameState} 
            onStart={startGame}
          />
        )}

        {gameState.pCoinActive && (
          <PowerModeOverlay timeLeft={gameState.pCoinTimeLeft} />
        )}
      </div>
    </div>
  );
};
