import { useGameStore } from "@/components/stores/useGameStore";
import StartMenu from "./ui-screens/StartMenu";
import ResumeMenu from "./ui-screens/ResumeMenu";
import GameOver from "./ui-screens/GameOver";

export const GameMenu = ({
  canvasContainerRef,
}: {
  canvasContainerRef: React.RefObject<HTMLDivElement>;
}) => {
  const { gameStatus } = useGameStore();

  return (
    <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center">
      <div className="text-center text-foreground font-mono">
        {gameStatus === "menu" && (
          <StartMenu canvasContainerRef={canvasContainerRef} />
        )}
        {gameStatus === "paused" && <ResumeMenu />}
        {gameStatus === "gameOver" && <GameOver />}
      </div>
    </div>
  );
};
