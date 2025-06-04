import { useGameStore } from "@/components/stores/useGameStore";

const BonusScreen = ({ correctOrderCount }: { correctOrderCount: number }) => {
  const { bonus } = useGameStore();
  return (
    <div className="flex flex-col gap-4">
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
        <span className="text-primary font-bold animate-pulse">{bonus}</span>
      </h3>
      {/* <Button
        onClick={() => {
          useGameStore.getState().setLevel(useGameStore.getState().level + 1);
          useGameStore.getState().setGameStatus(GameStatus.PLAYING);
        }}
        className="w-[fit-content] mx-auto"
      >
        Continue [Space]
      </Button> */}
    </div>
  );
};

export default BonusScreen;
