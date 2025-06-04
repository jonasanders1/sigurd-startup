import React from "react";
import Navigation from "@/components/Navigation";
import { GameContainer } from "@/components/game/GameContainer";
import Rules from "@/components/game/Rules";
import PageTitle from "@/components/PageTitle";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const Index = () => {
  return (
    <div className="flex flex-col gap-8">
      <div className="hidden md:block">
        <GameContainer />
      </div>

      <div className="md:hidden">
        <PageTitle
          title="Sigurd Startup"
          subtitle="Desktop-eksklusiv gründer-simulator (sorry, mobil-brukere!)"
        />
        <div className="flex flex-col gap-5">
          <blockquote className="pl-3 border-l-4 border-primary/50 italic text-primary/80">
            Sigurd trenger en skikkelig arbeidsstasjon! Som enhver respektabel
            norsk gründer jobber han bare på laptop. Finn deg en desktop, så kan
            eventyret begynne!
          </blockquote>

          <Button className="mx-auto mt-3 flex items-center gap-3 w-[fit-content] opacity-70 cursor-not-allowed">
            <Download className="w-10 h-10" />
            <div className="flex flex-col">
              <span className="text-md font-bold">Last ned Mobil-versjon</span>
              <span className="text-xs opacity-75">Kommer i 2087</span>
            </div>
          </Button>
        </div>
      </div>

      <Rules />
    </div>
  );
};

export default Index;
