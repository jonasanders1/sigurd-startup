import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

interface GameMenuProps {
  gameState: {
    gameStatus: "menu" | "paused" | "gameOver";
    score: number;
    level: number;
    correctOrderCount: number;
    completedGroups: string[];
    efficiencyMultiplier: number;
    bCoinsCollected: number;
    eCoinsCollected: number;
  };
  onStart: () => void;
}

export const GameMenu: React.FC<GameMenuProps> = ({ gameState, onStart }) => {
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

  return (
    <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center">
      <div className="text-center text-foreground font-mono">
        {gameState.gameStatus === "menu" && (
          <div className="flex flex-col items-center justify-center gap-4">
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
              onClick={onStart} 
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
            >
              <Play className="w-4 h-4 mr-2" />
              START GAME
            </Button>
          </div>
        )}
        {gameState.gameStatus === "paused" && (
          <div className="flex flex-col items-center justify-center gap-4">
            <h2 className="text-3xl font-bold text-primary">
              GAME PAUSED
            </h2>
            <p className="text-lg text-muted-foreground">
              Press Resume to continue Sigurd's journey
            </p>
            <Button 
              onClick={onStart} 
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
            >
              <Play className="w-4 h-4 mr-2" />
              RESUME
            </Button>
          </div>
        )}
        {gameState.gameStatus === "gameOver" && (
          <div className="flex flex-col items-center justify-center gap-4">
            <h2 className="text-3xl font-bold text-destructive">
              GAME OVER
            </h2>
            <p className="text-lg mb-2 text-primary">
              Final Score: {gameState.score.toLocaleString()} kr
            </p>
            <p className="text-sm mb-2 text-muted-foreground">
              Correct Order: {gameState.correctOrderCount}/24
            </p>
            <p className="text-sm mb-2 text-muted-foreground">
              Groups Completed: {gameState.completedGroups.length}/6
            </p>
            <p className="text-sm mb-2 text-muted-foreground">
              Efficiency: {gameState.efficiencyMultiplier}x
            </p>
            <p className="text-sm mb-2 text-muted-foreground">
              Special Coins: B:{gameState.bCoinsCollected} E:
              {gameState.eCoinsCollected}
            </p>
            <Button 
              onClick={onStart} 
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
            >
              <Play className="w-4 h-4 mr-2" />
              PLAY AGAIN
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
