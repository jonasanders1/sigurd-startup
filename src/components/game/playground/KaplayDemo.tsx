import React, { useRef, useEffect } from "react";
import { createKaplayGame } from "../kaplay/KaplayGameExample";
import { KAPLAYCtx } from "kaplay";

export const KaplayDemo: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const kaplayRef = useRef<KAPLAYCtx | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Kaplay game
    kaplayRef.current = createKaplayGame(canvasRef.current);

    // Cleanup
    return () => {
      if (kaplayRef.current) {
        kaplayRef.current.quit();
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <h1 className="text-3xl font-bold text-white">Kaplay Demo</h1>
      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-xl text-white mb-2">Controls:</h2>
        <ul className="text-gray-300 space-y-1">
          <li>← → Arrow Keys - Move</li>
          <li>Space - Jump</li>
          <li>Collect orange bombs to score points</li>
          <li>Avoid the red enemy!</li>
        </ul>
      </div>
      <div className="border-4 border-gray-700 rounded-lg overflow-hidden">
        <canvas 
          ref={canvasRef}
          style={{ display: "block", imageRendering: "crisp-edges" }}
        />
      </div>
    </div>
  );
};