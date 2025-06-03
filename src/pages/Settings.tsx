
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Key, Volume2 } from 'lucide-react';
import { useState } from 'react';

const Settings = () => {
  const [masterVolume, setMasterVolume] = useState([75]);
  const [musicVolume, setMusicVolume] = useState([60]);
  const [sfxVolume, setSfxVolume] = useState([80]);
  const [isMasterMuted, setIsMasterMuted] = useState(false);
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  const [isSfxMuted, setIsSfxMuted] = useState(false);
  const keyBinds = [
    { action: 'Move Left', key: 'A or ←', description: 'Move Sigurd to the left' },
    { action: 'Move Right', key: 'D or →', description: 'Move Sigurd to the right' },
    { action: 'Jump', key: 'W or ↑', description: 'Make Sigurd jump upward' },
    { action: 'Float', key: 'Space', description: 'Hold to float slowly down when in air' },
  ];

 

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              Game Settings
            </h1>
            <p className="text-xl text-muted-foreground">Customize your Bomb Jack Norge experience</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-card/50 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center space-x-2">
                  <Key className="w-5 h-5" />
                  <span>Key Bindings</span>
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Current control scheme for the game
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {keyBinds.map((bind, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="text-foreground font-medium">{bind.action}</div>
                        <div className="text-muted-foreground text-sm">{bind.description}</div>
                      </div>
                      <div className="bg-secondary px-3 py-1 rounded text-secondary-foreground font-mono text-sm">
                        {bind.key}
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Customize Key Bindings (Coming Soon)
                </Button>
              </CardContent>
            </Card>

          
          </div>

          <Card className="bg-card/50 backdrop-blur-sm border-border mt-8">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center space-x-2">
                <Volume2 className="w-5 h-5" />
                <span>Audio Settings</span>
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Control music, sound effects, and overall audio levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Master Volume */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="master-volume" className="text-foreground font-medium">
                      Master Volume
                    </Label>
                    <div className="flex items-center space-x-3">
                      <span className="text-muted-foreground text-sm min-w-[3ch]">
                        {isMasterMuted ? '0' : masterVolume[0]}%
                      </span>
                      <Switch
                        checked={!isMasterMuted}
                        onCheckedChange={(checked) => setIsMasterMuted(!checked)}
                        aria-label="Toggle master audio"
                      />
                    </div>
                  </div>
                  <Slider
                    id="master-volume"
                    min={0}
                    max={100}
                    step={1}
                    value={isMasterMuted ? [0] : masterVolume}
                    onValueChange={setMasterVolume}
                    disabled={isMasterMuted}
                    className="w-full"
                  />
                </div>

                {/* Music Volume */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="music-volume" className="text-foreground font-medium">
                      Music Volume
                    </Label>
                    <div className="flex items-center space-x-3">
                      <span className="text-muted-foreground text-sm min-w-[3ch]">
                        {isMusicMuted ? '0' : musicVolume[0]}%
                      </span>
                      <Switch
                        checked={!isMusicMuted}
                        onCheckedChange={(checked) => setIsMusicMuted(!checked)}
                        aria-label="Toggle music"
                      />
                    </div>
                  </div>
                  <Slider
                    id="music-volume"
                    min={0}
                    max={100}
                    step={1}
                    value={isMusicMuted ? [0] : musicVolume}
                    onValueChange={setMusicVolume}
                    disabled={isMusicMuted}
                    className="w-full"
                  />
                </div>

                {/* SFX Volume */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sfx-volume" className="text-foreground font-medium">
                      Sound Effects Volume
                    </Label>
                    <div className="flex items-center space-x-3">
                      <span className="text-muted-foreground text-sm min-w-[3ch]">
                        {isSfxMuted ? '0' : sfxVolume[0]}%
                      </span>
                      <Switch
                        checked={!isSfxMuted}
                        onCheckedChange={(checked) => setIsSfxMuted(!checked)}
                        aria-label="Toggle sound effects"
                      />
                    </div>
                  </div>
                  <Slider
                    id="sfx-volume"
                    min={0}
                    max={100}
                    step={1}
                    value={isSfxMuted ? [0] : sfxVolume}
                    onValueChange={setSfxVolume}
                    disabled={isSfxMuted}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border mt-8">
            <CardHeader>
              <CardTitle className="text-foreground">Game Controls Preview</CardTitle>
              <CardDescription className="text-muted-foreground">
                Visual guide to playing Bomb Jack Norge
              </CardDescription>
            </CardHeader>
            <CardContent>
              <img 
                src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop" 
                alt="Game controls visualization" 
                className="w-full h-64 rounded-lg object-cover border border-border"
              />
              <p className="text-muted-foreground text-sm mt-3 text-center">
                Master these controls to help Sigurd navigate the bureaucratic landscape
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
