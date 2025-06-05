import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Key, Volume2 } from "lucide-react";
import { useState } from "react";
import PageTitle from "@/components/PageTitle";
import { useAudioStore } from "@/components/stores/useAudioStore";
import SigurdMelody from "@/assets/sounds/sigurd-melody.mp3";

const Settings = () => {
  const {
    masterVolume,
    musicVolume,
    sfxVolume,
    isMasterMuted,
    isMusicMuted,
    isSfxMuted,
    setMasterVolume,
    setMusicVolume,
    setSfxVolume,
    toggleMasterMute,
    toggleMusicMute,
    toggleSfxMute,
    playSound
  } = useAudioStore();

  const keyBinds = [
    {
      action: "Beveg Venstre",
      key: "A eller ←",
      description: "Beveg Sigurd til venstre",
    },
    {
      action: "Beveg Høyre",
      key: "D eller →",
      description: "Beveg Sigurd til høyre",
    },
    {
      action: "Hopp",
      key: "W eller ↑",
      description: "Få Sigurd til å hoppe oppover",
    },
    {
      action: "Flyte",
      key: "Mellomrom",
      description: "Hold inne for å flyte sakte nedover i lufta",
    },
  ];

  return (
    <div>
      <PageTitle
        title="Innstillinger"
        subtitle="Konfigurer spillet - akkurat som norske skjemaer, bare enklere"
      />
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="bg-card/40 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center space-x-2">
              <Key className="w-5 h-5" />
              <span>Tastaturbindinger</span>
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Nåværende kontrollsystem for spillet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {keyBinds.map((bind, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <div className="text-foreground font-medium">
                      {bind.action}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {bind.description}
                    </div>
                  </div>
                  <div className="bg-secondary px-3 py-1 rounded text-secondary-foreground font-mono text-sm">
                    {bind.key}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center space-x-2">
              <Volume2 className="w-5 h-5" />
              <span>Lydinnstillinger</span>
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Kontroller musikk, lydeffekter og generelle lydnivåer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Master Volume */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="master-volume"
                    className="text-foreground font-medium"
                  >
                    Hovedvolum
                  </Label>
                  <div className="flex items-center space-x-3">
                    <span className="text-muted-foreground text-sm min-w-[3ch]">
                      {isMasterMuted ? "0" : masterVolume}%
                    </span>
                    <Switch
                      checked={!isMasterMuted}
                      onCheckedChange={toggleMasterMute}
                      aria-label="Skru av/på hovedlyd"
                    />
                  </div>
                </div>
                <Slider
                  id="master-volume"
                  min={0}
                  max={100}
                  step={1}
                  value={[isMasterMuted ? 0 : masterVolume]}
                  onValueChange={(value) => setMasterVolume(value[0])}
                  disabled={isMasterMuted}
                  className="w-full"
                />
              </div>

              {/* Music Volume */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="music-volume"
                    className="text-foreground font-medium"
                  >
                    Musikkvolum
                  </Label>
                  <div className="flex items-center space-x-3">
                    <span className="text-muted-foreground text-sm min-w-[3ch]">
                      {isMusicMuted ? "0" : musicVolume}%
                    </span>
                    <Switch
                      checked={!isMusicMuted}
                      onCheckedChange={(checked) => {
                        toggleMusicMute();
                        if (checked) playSound(SigurdMelody);
                      }}
                      aria-label="Skru av/på musikk"
                    />
                  </div>
                </div>
                <Slider
                  id="music-volume"
                  min={0}
                  max={100}
                  step={1}
                  value={[isMusicMuted ? 0 : musicVolume]}
                  onValueChange={(value) => setMusicVolume(value[0])}
                  disabled={isMusicMuted}
                  className="w-full"
                />
              </div>

              {/* SFX Volume */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="sfx-volume"
                    className="text-foreground font-medium"
                  >
                    Lydeffektvolum
                  </Label>
                  <div className="flex items-center space-x-3">
                    <span className="text-muted-foreground text-sm min-w-[3ch]">
                      {isSfxMuted ? "0" : sfxVolume}%
                    </span>
                    <Switch
                      checked={!isSfxMuted}
                      onCheckedChange={toggleSfxMute}
                      aria-label="Skru av/på lydeffekter"
                    />
                  </div>
                </div>
                <Slider
                  id="sfx-volume"
                  min={0}
                  max={100}
                  step={1}
                  value={[isSfxMuted ? 0 : sfxVolume]}
                  onValueChange={(value) => setSfxVolume(value[0])}
                  disabled={isSfxMuted}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/40 backdrop-blur-sm border-border mt-8">
        <CardHeader>
          <CardTitle className="text-foreground">
            Forhåndsvisning av Spillkontroller
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Visuell guide til å spille Startup Sigurd
          </CardDescription>
        </CardHeader>
        <CardContent>
          <img
            src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop"
            alt="Visualisering av spillkontroller"
            className="w-full h-64 rounded-lg object-cover border border-border"
          />
          <p className="text-muted-foreground text-sm mt-3 text-center">
            Mester disse kontrollene for å hjelpe Sigurd navigere det
            byråkratiske landskapet
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
