import React from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Heart } from "lucide-react";

interface GameUIProps {
  score: number;
  lives: number;
  level: number;
  gameStatus: "menu" | "playing" | "paused" | "gameOver";
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export const GameUI: React.FC<GameUIProps> = ({
  score,
  lives,
  level,
  gameStatus,
  onStart,
  onPause,
  onReset,
}) => {
  return (
    <div className="w-full max-w-4xl bg-background/95 rounded-lg p-4 shadow-lg border border-border backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Game Stats */}
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary font-mono">
              {score.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground font-mono">SCORE</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              {Array.from({ length: lives }, (_, i) => (
                <Heart
                  key={i}
                  className="w-5 h-5 text-destructive fill-current"
                />
              ))}
            </div>
            <div className="text-sm text-muted-foreground font-mono">LIVES</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-accent font-mono">
              {level}
            </div>
            <div className="text-sm text-muted-foreground font-mono">LEVEL</div>
          </div>
        </div>

        {/* Game Controls */}
        <div className="flex items-center gap-2">
          {gameStatus === "menu" && (
            <Button
              onClick={onStart}
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
            >
              <Play className="w-4 h-4 mr-2" />
            </Button>
          )}

          {gameStatus === "playing" && (
            <Button onClick={onPause} variant="outline" className="font-bold">
              <Pause className="w-4 h-4 mr-2" />
            </Button>
          )}

          {gameStatus === "paused" && (
            <Button
              onClick={onPause}
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
            >
              <Play className="w-4 h-4 mr-2" />
              RESUME
            </Button>
          )}

          <Button onClick={onReset} variant="outline" className="font-bold">
            <RotateCcw className="w-4 h-4 mr-2" />
            RESET
          </Button>
        </div>
      </div>
    </div>
  );
};
