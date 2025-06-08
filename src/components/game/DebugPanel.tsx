import React, { useState } from "react";
import { useGameStore } from "@/components/stores/useGameStore";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ChevronDown, ChevronUp } from "lucide-react";
import { GameStatus } from "@/components/types/Game";

export const DebugPanel = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const gameState = useGameStore();

  const handleDebugToggle = (checked: boolean) => {
    gameState.setIsPlayGround(checked);
    setIsExpanded(checked);
    
    if (!checked) {
      // Reset game state when debug mode is turned off
      gameState.setGameStatus(GameStatus.MENU);
      gameState.resetAll(); // Use complete reset when exiting debug mode
    } else {
      // Start playground mode when debug is turned on
      gameState.startPlayGround();
    }
  };

  return (
    <div className="absolute right-2 top-0 z-50">
      <div className="flex items-center gap-2">
        <Button
          onClick={() => handleDebugToggle(!gameState.isPlayGround)}
          variant="outline"
          size="sm"
          className={`bg-background/80 backdrop-blur-sm ${
            gameState.isPlayGround 
              ? "border-green-500 text-green-500 hover:bg-green-500/20" 
              : "border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          }`}
        >
          {gameState.isPlayGround ? (
            <ChevronUp className="w-4 h-4 mr-2" />
          ) : (
            <ChevronDown className="w-4 h-4 mr-2" />
          )}
          Debug {gameState.isPlayGround ? "ON" : "OFF"}
        </Button>
      </div>

      {isExpanded && (
        <div className="mt-2 bg-background/95 backdrop-blur-sm rounded-lg p-3 text-sm border border-green-500">
          <div className="flex flex-col gap-4 text-center">
            <div>
              <div className="text-yellow-400 font-bold">
                {gameState.bombsCollected.length}/24
              </div>
              <div>Bombs Collected</div>
            </div>
            <div>
              <div className="text-green-400 font-bold">
                {gameState.correctOrderCount}/24
              </div>
              <div>Correct Order</div>
            </div>
            <div>
              <div className="text-orange-400 font-bold">
                {gameState.currentActiveGroup || "None"}
              </div>
              <div>Active Group</div>
            </div>
            <div>
              <div className="text-cyan-400 font-bold">
                {gameState.completedGroups.length}/6
              </div>
              <div>Groups Done</div>
            </div>
            <div>
              <div className="text-blue-400 font-bold">
                {gameState.efficiencyMultiplier}x
              </div>
              <div>Efficiency</div>
            </div>
            <div>
              <div className="text-purple-400 font-bold">
                {gameState.bCoinsCollected}/5
              </div>
              <div>B Coins</div>
            </div>
            <div>
              <div className="text-pink-400 font-bold">
                {gameState.eCoinsCollected}
              </div>
              <div>E Coins</div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 mt-2 text-center">
            <div>
              <div
                className={`font-bold ${
                  gameState.pCoinActive ? "text-orange-400" : "text-gray-400"
                }`}
              >
                {gameState.pCoinActive
                  ? Math.ceil(gameState.pCoinTimeLeft / 1000)
                  : "OFF"}
              </div>
              <div>Power Mode</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
