import { Button } from "@/components/ui/button";
import { Maximize, Minimize, Play } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useGameStore } from "@/components/stores/useGameStore";
import { useToggleFullScreen } from "@/components/hooks/useToggleFullScreen";

const StartMenu = ({
  canvasContainerRef,
}: {
  canvasContainerRef: React.RefObject<HTMLDivElement>;
}) => {
  const [currentTip, setCurrentTip] = useState(0);
  const [isTipVisible, setIsTipVisible] = useState(true);

  const entrepreneurTips = [
    "Kaffekoppene = liv. Ikke la dem gå tomme!",
    "Samle funding i grupper for maksimal profitt!",
    "Unngå byråkrat-robotene - de har endeløse skjemaer!",
    "B-mynter = effektivitet. Flere B = mer penger!",
    "E-mynter = ekstra kaffe = ekstra sjanse!",
    "P-mynter = superkrefter mot byråkratiet!",
    "Dette spillet er basert på sanne hendelser. Navnene er endret for å beskytte de traumatiserte!",
    "Visste du at? Det er lettere å starte selskap på Mars enn å få Innovasjon Norge-støtte!",
    "Pro-tip: Hvis du sammenligner timene brukt på skjemaer vs produktutvikling, så driver du egentlig et skjemafirma!",
    "Fun fact: Norske gründere bruker 40% av tiden sin på å forklare andre hvorfor de ikke bare flytter til Silicon Valley!",
    "MVA på MVA på arbeidsgiveravgift - norsk matematikk på sitt beste!",
    "Å overleve nivå 3 kvalifiserer deg til psykologisk støtte!",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTipVisible(false);
      setTimeout(() => {
        setCurrentTip((prev) => (prev + 1) % entrepreneurTips.length);
        setIsTipVisible(true);
      }, 1000);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const { startGame, isFullscreen, setIsFullscreen } = useGameStore();

  const toggleFullscreen = useToggleFullScreen(
    canvasContainerRef,
    setIsFullscreen
  );

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Fullscreen Toggle Button */}
      <Button
        onClick={toggleFullscreen}
        variant="secondary"
        size="sm"
        className="absolute top-4 right-4 z-10 bg-background/90 hover:bg-muted border border-border font-bold"
      >
        {isFullscreen ? (
          <Minimize className="w-4 h-4" />
        ) : (
          <Maximize className="w-4 h-4" />
        )}
      </Button>
      <h2 className="text-3xl font-bold text-primary">
        SIGURD'S STARTUP ADVENTURE
      </h2>
      <div className="flex items-center justify-center min-h-[90px]">
        <p
          className={`max-w-[400px] text-sm text-muted-foreground transition-all duration-2000 ${
            isTipVisible
              ? "opacity-100 transform translate-y-0"
              : "opacity-0 transform -translate-y-2"
          }`}
        >
          {entrepreneurTips[currentTip]}
        </p>
      </div>
      <Button
        onClick={startGame}
        className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
      >
        <Play className="w-4 h-4 mr-2" />
        START GAME
      </Button>
    </div>
  );
};

export default StartMenu;
