import { useEffect, useState } from "react";
import { useGameStore } from "@/components/stores/useGameStore";
import { GameStatus } from "@/components/types/Game";
import { useAudioStore, SoundEvent } from "@/components/stores/useAudioStore";

const Countdown = () => {
  const [count, setCount] = useState(3);
  const setGameStatus = useGameStore((state) => state.setGameStatus);
  const audioStore = useAudioStore();

  useEffect(() => {
    if (count === 0) {
      audioStore.playSound(SoundEvent.GAME_MUSIC, useGameStore.getState());
      setGameStatus(GameStatus.PLAYING);
      return;
    }

    const timer = setTimeout(() => {
      setCount(count - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, setGameStatus, audioStore]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="text-9xl font-bold text-primary animate-bounce">
        {count}
      </div>
    </div>
  );
};

export default Countdown;
