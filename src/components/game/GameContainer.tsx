import React, { useRef, useEffect, useState } from "react";
import { GameEngine } from "./GameEngine";
import { DebugPanel } from "./DebugPanel";
import { PowerModeOverlay } from "./PowerModeOverlay";
import { GameMenu } from "./GameMenu";
import { InGameMenu } from "./ui-screens/InGameMenu";
import { useGameStore } from "@/components/stores/useGameStore";

export const GameContainer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);

  const { gameStatus, pCoinActive, isFullscreen } = useGameStore();

  // Initialize game engine only once
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Initialize game engine only if it doesn't exist
    if (!gameEngineRef.current) {
      gameEngineRef.current = new GameEngine(
        ctx,
        canvas.width,
        canvas.height,
        useGameStore.getState()
      );
    }
  }, []); // Empty dependency array - only run once

  // Game loop in separate effect
  useEffect(() => {
    let animationId: number;
    const gameLoop = () => {
      if (gameEngineRef.current && gameStatus === "playing") {
        gameEngineRef.current.update();
        gameEngineRef.current.render();
      }
      animationId = requestAnimationFrame(gameLoop);
    };

    if (gameStatus === "playing") {
      gameLoop();
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [gameStatus]);

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
          style={{ imageRendering: "pixelated" }}
        />

        {/* In-game UI */}
        {gameStatus === "playing" && (
          <InGameMenu canvasContainerRef={canvasContainerRef} />
        )}

        {/* Menu Screens */}
        {gameStatus !== "playing" && (
          <GameMenu canvasContainerRef={canvasContainerRef} />
        )}

        {pCoinActive && <PowerModeOverlay />}
      </div>
    </div>
  );
};
