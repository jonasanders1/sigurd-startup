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
  Coffee,
  Trophy,
  Heart,
  Joystick,
  Maximize,
} from "lucide-react";

import BurnRate from "../../assets/sprites/burn-rate/1.png";
import EmergencyFunding from "../../assets/sprites/extra/1.png";
import PowerNetworking from "../../assets/sprites/power/1.png";
import Super from "../../assets/sprites/super/1.png";

const Rules = () => {
  const specialItems = [
    {
      title: "B (Burn Rate) Coins",
      description:
        "Appear every 5,000 kr earned. Increase efficiency multiplier (2x, 3x, 4x, 5x maximum). Maximum 5 per level.",
      icon: (
        <img src={BurnRate} alt="B Coin" className="w-8 h-8 md:w-16 md:h-16" />
      ),
    },
    {
      title: "E (Emergency Funding) Coins",
      description:
        "Grant extra coffee cup. Appear after 8 Burn Rate coins. More likely if you've struggled.",
      icon: (
        <img
          src={EmergencyFunding}
          alt="E Coin"
          className="w-8 h-8 md:w-16 md:h-16"
        />
      ),
    },
    {
      title: "P (Power Networking) Coins",
      description:
        "Appear after 10 'hot' funding or 20 regular funding. Temporarily turns enemies into subsidies. Silver = 2000 kr!",
      icon: (
        <img
          src={PowerNetworking}
          alt="P Coin"
          className="w-8 h-8 md:w-16 md:h-16"
        />
      ),
    },
    {
      title: "S (Sellout) Coins",
      description:
        "Rare instant exit opportunity. Automatically advances to next level.",
      icon: (
        <img src={Super} alt="S Coin" className="w-8 h-8 md:w-16 md:h-16" />
      ),
    },
  ];

  const scoring = [
    { points: "50,000 kr", condition: "24 fundings in sequence" },
    { points: "30,000 kr", condition: "23 fundings in sequence" },
    { points: "20,000 kr", condition: "22 fundings in sequence" },
    { points: "10,000 kr", condition: "21 fundings in sequence" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-primary">Game Rules & Tips</h1>
        <p className="text-muted-foreground">
          Help Sigurd navigate the treacherous world of Norwegian
          entrepreneurship
        </p>
      </div>

      {/* Special Items Card */}
      <Card className="bg-card/40 backdrop-blur-sm border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Special Tokens
          </CardTitle>
          <CardDescription>Unique items that affect gameplay</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {specialItems.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-3 rounded-lg hover:bg-background/50 transition-colors"
              >
                {item.icon}
                <div>
                  <h3 className="font-medium text-primary">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lives Card */}
      <Card className="bg-card/40 backdrop-blur-sm border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-destructive" />
            Lives & Game Over
          </CardTitle>
          <CardDescription>How lives work in the game</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-center gap-2">
              <Coffee className="w-4 h-4 text-destructive" />
              Start with 3 lives (coffee cups)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 text-destructive">⚠️</span>
              Lose a life when touching bureaucratic obstacles
            </li>
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 text-destructive">🔄</span>
              Gain extra lives through E coins
            </li>
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 text-destructive">💀</span>
              Game over when all lives are lost
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Scoring Card */}
      <Card className="bg-card/40 backdrop-blur-sm border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Bonus Scoring
          </CardTitle>
          <CardDescription>How to maximize your points</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm mb-4">
            Collect all funding opportunities (24 per level) to advance. Bonus
            Strategy: Collect "lit" funding in sequence for massive point
            bonuses.
          </p>
          <div className="space-y-2">
            {scoring.map((score, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-2 border-b border-primary/50"
              >
                <span className="text-muted-foreground">{score.condition}</span>
                <span className="font-medium text-primary">{score.points}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Controls Card */}
      <Card className="bg-card/40 backdrop-blur-sm border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Joystick className="w-5 h-5 text-primary" />
            Game Controls
          </CardTitle>
          <CardDescription>How to play the game</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-background/50 px-2 py-1 rounded">
              <span className="text-sm text-muted-foreground">Move:</span>
              <div className="flex items-center gap-1 ">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-xs">And</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-center gap-2 bg-background/50 px-2 py-1 rounded">
              <span className="text-sm text-muted-foreground">Jump:</span>
              <div className="flex items-center gap-1 ">
                <ArrowUp className="w-4 h-4" />
                <span className="text-xs">And</span>
                <ArrowDown className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-center gap-2 bg-background/50 px-2 py-1 rounded">
              <span className="text-sm text-muted-foreground">Float:</span>
              <div className="flex items-center gap-1 ">
                <Space className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-center gap-2 bg-background/50 px-2 py-1 rounded">
              <span className="text-sm text-muted-foreground">Pause:</span>
              <div className="flex items-center gap-1 ">
                <Pause className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-center gap-2 bg-background/50 px-2 py-1 rounded">
              <span className="text-sm text-muted-foreground">Reset:</span>
              <div className="flex items-center gap-1 ">
                <RotateCcw className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-center gap-2 bg-background/50 px-2 py-1 rounded">
              <span className="text-sm text-muted-foreground">Fullscreen:</span>
              <div className="flex items-center gap-1">
                <Maximize className="w-4 h-4" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Rules;
