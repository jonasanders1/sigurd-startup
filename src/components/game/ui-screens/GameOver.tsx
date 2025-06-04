import { useGameStore } from "@/components/stores/useGameStore";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

const GameOver = () => {
  const {
    score,
    correctOrderCount,
    completedGroups,
    efficiencyMultiplier,
    bCoinsCollected,
    eCoinsCollected,
    startGame,
  } = useGameStore();
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <h2 className="text-3xl font-bold text-destructive">GAME OVER</h2>
      <p className="text-lg mb-2 text-primary">
        Final Score: {score.toLocaleString()} kr
      </p>
      <p className="text-sm mb-2 text-muted-foreground">
        Correct Order: {correctOrderCount}/24
      </p>
      <p className="text-sm mb-2 text-muted-foreground">
        Groups Completed: {completedGroups.length}/6
      </p>
      <p className="text-sm mb-2 text-muted-foreground">
        Efficiency: {efficiencyMultiplier}x
      </p>
      <p className="text-sm mb-2 text-muted-foreground">
        Special Coins: B:{bCoinsCollected} E:
        {eCoinsCollected}
      </p>
      <Button
        onClick={startGame}
        className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
      >
        <Play className="w-4 h-4 mr-2" />
        PLAY AGAIN
      </Button>
    </div>
  );
};

export default GameOver;
