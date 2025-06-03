import React from "react";

interface PowerModeOverlayProps {
  timeLeft: number;
}

export const PowerModeOverlay: React.FC<PowerModeOverlayProps> = ({ timeLeft }) => {
  return (
    <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-lg font-bold font-mono animate-pulse border border-border">
      POWER MODE: {Math.ceil(timeLeft / 1000)}s
    </div>
  );
}; 