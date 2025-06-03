import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Zap,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Space,
  Pause,
  RotateCcw,
} from "lucide-react";

import BurnRate from "../../assets/sprites/burn-rate/1.png";
import EmergencyFunding from "../../assets/sprites/extra/1.png";
import PowerNetworking from "../../assets/sprites/power/1.png";
import Super from "../../assets/sprites/super/1.png";
import Coffee from "../../assets/coffee.png";
const Rules = () => {
  const specialItems = [
    {
      title: "B (Burn Rate) Coins",
      description:
        "Appear every 5,000 kr earned. Increase efficiency multiplier (2x, 3x, 4x, 5x maximum). Maximum 5 per level.",
      icon: <img src={BurnRate} alt="B Coin" className="w-16 h-16" />,
    },
    {
      title: "E (Emergency Funding) Coins",
      description:
        "Grant extra coffee cup. Appear after 8 Burn Rate coins. More likely if you've struggled.",
      icon: <img src={EmergencyFunding} alt="E Coin" className="w-16 h-16" />,
    },
    {
      title: "P (Power Networking) Coins",
      description:
        "Appear after 10 'hot' funding or 20 regular funding. Temporarily turns enemies into subsidies. Silver = 2000 kr!",
      icon: <img src={PowerNetworking} alt="P Coin" className="w-16 h-16" />,
    },
    {
      title: "S (Sellout) Coins",
      description:
        "Rare instant exit opportunity. Automatically advances to next level.",
      icon: <img src={Super} alt="S Coin" className="w-16 h-16" />,
    },
  ];

  const scoring = [
    { points: "50,000 kr", condition: "24 fundings in sequence" },
    { points: "30,000 kr", condition: "23 fundings in sequence" },
    { points: "20,000 kr", condition: "22 fundings in sequence" },
    { points: "10,000 kr", condition: "21 fundings in sequence" },
  ];

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Game Rules & Tips</CardTitle>
        <CardDescription className="text-muted-foreground">
          Help Sigurd navigate the treacherous world of Norwegian
          entrepreneurship
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Special Items */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Special Tokens</h3>
          <div className="space-y-4 flex flex-col gap-4">
            {specialItems.map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                {item.icon}
                <div className="flex flex-col">
                  <h4 className="font-medium">{item.title}</h4>
                  <p className="text-muted-foreground text-sm">
                    {item.description}
                  </p>
                </div>
                {item.quote && (
                  <blockquote className="text-sm italic text-primary/80 pl-4 border-l-2 border-primary/30">
                    "{item.quote}"
                  </blockquote>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Scoring */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Bonus Scoring</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Collect all funding opportunities (24 per level) to advance. Bonus
            Strategy: Collect "lit" funding in sequence for massive point
            bonuses.
          </p>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-primary/10">
                  <th className="px-4 py-2 text-left text-lg font-medium text-muted-foreground">
                    Sequence
                  </th>
                  <th className="px-4 py-2 text-right text-lg font-medium text-muted-foreground">
                    Bonus
                  </th>
                </tr>
              </thead>
              <tbody>
                {scoring.map((score, index) => (
                  <tr key={index} className="border-t border-border/50">
                    <td className="px-4 py-2 text-lg text-muted-foreground">
                      {score.condition}
                    </td>
                    <td className="px-4 py-2 text-lg font-medium text-primary text-right">
                      {score.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lives */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Lives & Game Over</h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Start with 3 lives (coffee cups)</li>
            <li>Lose a life when touching bureaucratic obstacles</li>
            <li>Gain extra lives through E coins</li>
            <li>Game over when all lives are lost</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default Rules;
