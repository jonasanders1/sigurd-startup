import { Play } from "lucide-react";
import React from "react";
import { useGameStore } from "@/components/stores/useGameStore";
import { Button } from "@/components/ui/button";

const ResumeMenu = () => {
  const { startGame } = useGameStore();
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <h2 className="text-3xl font-bold text-primary">GAME PAUSED</h2>
      <p className="text-lg text-muted-foreground">
        Press Resume to continue Sigurd's journey
      </p>
      <Button
        onClick={startGame}
        className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
      >
        <Play className="w-4 h-4 mr-2" />
        RESUME
      </Button>
    </div>
  );
};

export default ResumeMenu;
