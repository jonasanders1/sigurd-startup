import React from "react";
import Navigation from "@/components/Navigation";
import { GameContainer } from "@/components/game/GameContainer";
import Rules from "@/components/game/Rules";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-10">
      <Navigation />
      <div className="container h-screen flex flex-col justify-center">
        <GameContainer />
      </div>
      <div className="container  flex flex-col justify-center">
        <Rules />
      </div>
    </div>
  );
};

export default Index;
