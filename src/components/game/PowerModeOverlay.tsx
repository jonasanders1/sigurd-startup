import React from "react";
import { useGameStore } from "../stores/useGameStore";

interface PowerModeOverlayProps {
  timeLeft: number;
}

export const PowerModeOverlay: React.FC = () => {
  const { pCoinTimeLeft } = useGameStore();
  return (
    <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-lg font-bold font-mono animate-pulse border border-border">
      POWER MODE: {Math.ceil(pCoinTimeLeft / 1000)}s
    </div>
  );
}; 