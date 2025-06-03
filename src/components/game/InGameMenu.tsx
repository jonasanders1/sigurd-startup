import React from 'react';
import { Button } from '@/components/ui/button';
import { Pause, RotateCcw, Heart } from 'lucide-react';

interface InGameMenuProps {
  score: number;
  level: number;
  lives: number;
  onPause: () => void;
  onReset: () => void;
}

export const InGameMenu: React.FC<InGameMenuProps> = ({
  score,
  level,
  lives,
  onPause,
  onReset
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top Bar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-background/95 text-foreground px-4 py-2 rounded-lg border border-border backdrop-blur-sm pointer-events-auto">
        <div className="flex items-center gap-4 text-sm font-mono">
          <div className="text-center">
            <div className="text-primary font-bold">
              {score.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">SCORE</div>
          </div>
          <div className="w-px h-8 bg-border"></div>
          <div className="text-center">
            <div className="text-accent font-bold">{level}</div>
            <div className="text-xs text-muted-foreground">LEVEL</div>
          </div>
          <div className="w-px h-8 bg-border"></div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              {Array.from({ length: lives }, (_, i) => (
                <Heart key={i} className="w-4 h-4 text-destructive fill-current" />
              ))}
            </div>
            <div className="text-xs text-muted-foreground">LIVES</div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="absolute top-4 right-4 z-10 flex gap-2 pointer-events-auto">
        <Button onClick={onPause} variant="outline" size="sm" className="bg-background/90 hover:bg-muted border border-border font-bold">
          <Pause className="w-4 h-4 mr-2" />
          PAUSE
        </Button>
        <Button onClick={onReset} variant="outline" size="sm" className="bg-background/90 hover:bg-muted border border-border font-bold">
          <RotateCcw className="w-4 h-4 mr-2" />
          RESET
        </Button>
      </div>
    </div>
  );
}; 