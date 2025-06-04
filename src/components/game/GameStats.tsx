import React, { useState } from "react";
import { useGameStore } from "@/components/stores/useGameStore";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

export const DebugPanel = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const gameState = useGameStore();

  return (
    <div className="absolute right-[-150px] top-0 z-50">
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        variant="outline"
        size="sm"
        className="bg-background/80 backdrop-blur-sm border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
      >
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 mr-2" />
        ) : (
          <ChevronDown className="w-4 h-4 mr-2" />
        )}
        Debug Panel
      </Button>

      {isExpanded && (
        <div className="mt-2 bg-background/95 backdrop-blur-sm rounded-lg p-3 text-sm border border-destructive">
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
