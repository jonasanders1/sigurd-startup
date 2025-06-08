import React, { useRef, useEffect, useState } from "react";
import { GameEngine } from "./core/GameEngine";
import { DebugPanel } from "./DebugPanel";
import { PowerModeOverlay } from "./PowerModeOverlay";
import { GameMenu } from "./GameMenu";
import { InGameMenu } from "./ui-screens/InGameMenu";
import { useGameStore } from "@/components/stores/useGameStore";
import { GameEngineConfig } from "./config/GameEngineConfig";

export const GameContainer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  // const [isPlayGround, setIsPlayGround] = useState(true);

  const {
    gameStatus,
    pCoinActive,
    isFullscreen,
    startPlayGround,
    isPlayGround,
  } = useGameStore();

  // Initialize game engine only once
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Clean up old game engine if it exists
    if (gameEngineRef.current) {
      gameEngineRef.current.dispose();
      gameEngineRef.current = null;
    }

    // Initialize new game engine
    gameEngineRef.current = new GameEngine(
      ctx,
      canvas.width,
      canvas.height,
      useGameStore.getState()
    );

    // Cleanup function
    return () => {
      if (gameEngineRef.current) {
        gameEngineRef.current.dispose();
        gameEngineRef.current = null;
      }
    };
  }, [GameEngineConfig, isPlayGround]);

  // Game loop in separate effect - always run but only update game logic when playing
  useEffect(() => {
    let animationId: number;
    const gameLoop = () => {
      if (gameEngineRef.current) {
        // Always render the map
        gameEngineRef.current.render();

        // Update game logic if playing or in playground mode
        if (gameStatus === "playing" || isPlayGround) {
          gameEngineRef.current.update();
        }
      }
      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [gameStatus, isPlayGround]);

  // Start playground mode when isPlayGround is true
  useEffect(() => {
    if (isPlayGround) {
      startPlayGround();
    }
  }, [isPlayGround, startPlayGround]);

  return (
    <div className="flex flex-col items-center justify-center gap-6 relative">
      <DebugPanel />
      <div
        ref={canvasContainerRef}
        className={`relative bg-black ${
          isFullscreen ? "rounded-none" : "rounded-lg"
        } shadow-2xl overflow-hidden  ${
          isFullscreen ? "w-screen h-screen max-w-none" : ""
        }`}
      >
        <canvas
          ref={canvasRef}
          className={`block max-w-full ${isFullscreen ? "w-full h-full" : ""}`}
          style={{ imageRendering: "crisp-edges" }}
        />

        {gameStatus === "playing" && !isPlayGround && (
          <InGameMenu canvasContainerRef={canvasContainerRef} />
        )}

        {/* Menu Screens - show as overlay for all non-playing states */}
        {gameStatus !== "playing" && !isPlayGround && (
          <GameMenu canvasContainerRef={canvasContainerRef} />
        )}

        {pCoinActive && <PowerModeOverlay />}
      </div>
    </div>
  );
};
