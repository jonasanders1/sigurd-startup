import { useEffect, useState } from "react";
import { useGameStore } from "@/components/stores/useGameStore";
import { GameStatus } from "@/components/types/Game";
import { useAudioStore, SoundEvent } from "@/components/stores/useAudioStore";
import { useCurrentMapName } from "@/components/stores/useGameStore";

const Countdown = () => {
  const [count, setCount] = useState(3);
  const setGameStatus = useGameStore((state) => state.setGameStatus);
  const audioStore = useAudioStore();
  const mapName = useCurrentMapName();

  const state = useGameStore((state) => state);

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

  // Calculate opacity based on count
  const blurOpacity = count / 3; // This will go from 1 to 0.33

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-4 transition-all duration-1000"
      style={{
        backgroundColor: `rgba(var(--background), ${blurOpacity * 0.6})`,
        backdropFilter: `blur(${blurOpacity * 4}px)`,
      }}
    >
      <div className="text-7xl font-bold text-primary">
        {count}
        <div className="text-2xl">{mapName}</div>
      </div>
    </div>
  );
};

export default Countdown;
