export interface AudioConfig {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  musicMuted: boolean;
  sfxMuted: boolean;
}

export interface AudioAssets {
  // Background Music
  menuMusic: string;
  gameplayMusic: string;
  bonusMusic: string;
  gameOverMusic: string;

  // Sound Effects
  jump: string;
  wallHit: string;
  bombCollect: string;
  bombCorrect: string;
  bombWrong: string;
  monsterHit: string;
  lifeGained: string;
  lifeLost: string;
  bCoin: string;
  eCoin: string;
  pCoin: string;
  powerMode: string;
  levelComplete: string;
  bonusCount: string;
}
