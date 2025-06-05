import { useGameStore } from "@/components/stores/useGameStore";
import { Heart } from "lucide-react";

const BonusScreen = ({ correctOrderCount }: { correctOrderCount: number }) => {
  const { lastEarnedBonus, lastPreBonusScore, lives, level } = useGameStore();
  console.log("Bonus at bonus screen: ", lastEarnedBonus);
  console.log("Score at bonus screen: ", lastPreBonusScore);
  return (
    <div className="absolute inset-0 border rounded-lg border-white/10">
      <div className="flex flex-col items-center gap-4 absolute top-6 right-4 min-w-[110px]">
        <div className="text-center">
          <div className="text-primary font-bold">
            {lastPreBonusScore.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">SCORE</div>
        </div>
        <div className="text-center">
          <div className="text-primary font-bold">{level}</div>
          <div className="text-xs text-muted-foreground">Level</div>
        </div>
        <div className="text-center flex flex-col items-center gap-1">
          <div className="text-primary font-bold flex items-center justify-center gap-1">
            {Array.from({ length: lives }, (_, i) => (
              <Heart
                key={i}
                className="w-5 h-5 text-destructive fill-current"
              />
            ))}
          </div>
          <div className="text-xs text-muted-foreground">Lives</div>
        </div>
      </div>
      <div className="flex flex-col items-center gap-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <h1 className="text-2xl font-bold text-white/60">
          You gotten{" "}
          <span className="text-primary font-bold">{correctOrderCount}</span>{" "}
          funds in the correct order!
        </h1>
        <p className="text-white/50">
          You are basically the Norwegian Elon Musk now!
        </p>
        <h3 className="text-2xl">
          Your score is{" "}
          <span className="text-primary font-bold animate-pulse">
            {lastEarnedBonus}
          </span>
        </h3>
      </div>
    </div>
  );
};

export default BonusScreen;
