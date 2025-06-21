import React, { useRef, useEffect, useState } from "react";
import { KaplayGameEngine } from "./kaplay/KaplayGameEngine";
import { DebugPanel } from "./DebugPanel";
import { GameMenu } from "./GameMenu";
import { InGameMenu } from "./ui-screens/InGameMenu";
import { useGameStore } from "@/components/stores/useGameStore";
import { GameEngineConfig } from "./config/GameEngineConfig";

// Check WebGL support
const checkWebGLSupport = (): boolean => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch (e) {
    return false;
  }
};

export const GameContainer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const gameEngineRef = useRef<KaplayGameEngine | null>(null);
  const [engineError, setEngineError] = useState<string | null>(null);

  const {
    gameStatus,
    isFullscreen,
    startPlayGround,
    isPlayGround,
  } = useGameStore();

  // Initialize game engine only once
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    
    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Clean up old game engine if it exists
    if (gameEngineRef.current) {
      gameEngineRef.current.dispose();
      gameEngineRef.current = null;
    }

    // Reset error state
    setEngineError(null);

    try {
      // Initialize Kaplay game engine
      if (!checkWebGLSupport()) {
        throw new Error("WebGL is not supported in this browser");
      }
      
      gameEngineRef.current = new KaplayGameEngine(
        canvas,
        canvas.width,
        canvas.height,
        useGameStore.getState()
      );
    } catch (error) {
      console.error("Game engine initialization failed:", error);
      setEngineError(error instanceof Error ? error.message : "Unknown error");
    }

    // Cleanup function
    return () => {
      if (gameEngineRef.current) {
        gameEngineRef.current.dispose();
        gameEngineRef.current = null;
      }
    };
  }, [GameEngineConfig, isPlayGround]);

  // Game loop - Kaplay handles its own game loop
  useEffect(() => {
    const updateInterval = setInterval(() => {
      if (gameEngineRef.current && (gameStatus === "playing" || isPlayGround)) {
        gameEngineRef.current.update();
      }
    }, 1000 / 60); // 60 FPS

    return () => clearInterval(updateInterval);
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
        {engineError ? (
          <div className="flex items-center justify-center w-[800px] h-[600px] text-white">
            <div className="text-center p-8">
              <h2 className="text-2xl font-bold mb-4">Game Engine Error</h2>
              <p className="mb-4 text-red-400">{engineError}</p>
              <p className="text-sm opacity-75">
                Please ensure your browser supports WebGL.
              </p>
            </div>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
};
