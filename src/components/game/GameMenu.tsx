import { useGameStore } from "@/components/stores/useGameStore";
import StartMenu from "./ui-screens/StartMenu";
import ResumeMenu from "./ui-screens/ResumeMenu";
import GameOver from "./ui-screens/GameOver";
import { GameStatus } from "../types/Game";
import BonusScreen from "./ui-screens/BonusScreen";
import Countdown from "./ui-screens/Countdown";
import { InGameMenu } from "./ui-screens/InGameMenu";

export const GameMenu = ({
  canvasContainerRef,
}: {
  canvasContainerRef: React.RefObject<HTMLDivElement>;
}) => {
  const { gameStatus, correctOrderCount } = useGameStore();

  return (
    <div
      className={`absolute inset-0 ${
        gameStatus !== GameStatus.COUNTDOWN
          ? "bg-background/60 backdrop-blur-sm"
          : ""
      } flex items-center justify-center`}
    >
      {(gameStatus === GameStatus.COUNTDOWN ||
        gameStatus === GameStatus.PLAYING) && (
        <InGameMenu canvasContainerRef={canvasContainerRef} />
      )}

      <div className="text-center text-foreground font-mono">
        {gameStatus === GameStatus.MENU && (
          <StartMenu canvasContainerRef={canvasContainerRef} />
        )}
        {gameStatus === GameStatus.PAUSED && <ResumeMenu />}
        {gameStatus === GameStatus.GAME_OVER && <GameOver />}
        {gameStatus === GameStatus.BONUS_SCREEN && (
          <BonusScreen correctOrderCount={correctOrderCount} />
        )}
        {gameStatus === GameStatus.COUNTDOWN && <Countdown />}
      </div>
    </div>
  );
};
