import kaplay, { GameObj, KAPLAYCtx, PosComp, AreaComp, BodyComp, SpriteComp, ScaleComp, ColorComp, RectComp } from "kaplay";
import { GameStore } from "../../types/Game";
import { mapDefinitions, getMapById, MapDefinition } from "../config/MapDefinitions";
import { GameStatus } from "../../types/Game";
import { useGameStore } from "@/components/stores/useGameStore";
import { useAudioStore } from "@/components/stores/useAudioStore";
import { AudioManager } from "../audio/AudioManager";
import { ScoringSystem } from "../core/systems/ScoringSystem";
import { GameEngineConfig, IGameEngineConfig } from "../config/GameEngineConfig";
import { MonsterType } from "../../types/Monster";

// Define component types for game objects
type Player = GameObj<PosComp & AreaComp & BodyComp & RectComp & ColorComp & { speed: number }>;
type Monster = GameObj<PosComp & AreaComp & BodyComp & RectComp & ColorComp & { 
  monsterType: MonsterType;
  speed: number;
  patrolStartX: number;
  patrolEndX: number;
  direction: number;
}>;
type Platform = GameObj<PosComp & AreaComp & RectComp & ColorComp & { isStatic: true }>;
type Bomb = GameObj<PosComp & AreaComp & RectComp & ColorComp & { 
  group: number;
  order: number;
  collected: boolean;
}>;
type SpecialCoin = GameObj<PosComp & AreaComp & RectComp & ColorComp & {
  coinType: "B" | "E" | "P" | "S";
  collected: boolean;
}>;

export class KaplayGameEngine {
  private k: KAPLAYCtx;
  private store: GameStore;
  private currentMap: MapDefinition;
  private isPlayGround: boolean;
  private config: IGameEngineConfig;
  
  // Game objects
  private player: Player | null = null;
  private monsters: Monster[] = [];
  private platforms: Platform[] = [];
  private bombs: Bomb[] = [];
  private specialCoins: SpecialCoin[] = [];
  
  // Systems
  private audioManager: AudioManager;
  private scoringSystem: ScoringSystem;
  
  // Keybindings
  private keysPressed: Set<string> = new Set();

  constructor(
    canvas: HTMLCanvasElement,
    width: number,
    height: number,
    store: ReturnType<typeof useGameStore.getState>
  ) {
    this.store = store;
    this.isPlayGround = store.isPlayGround;
    
    // Initialize config
    this.config = {
      ...GameEngineConfig.getDefaultConfig(),
      ...GameEngineConfig.getConfigForScreenSize(width, height),
    };
    
    // Initialize Kaplay with the provided canvas
    this.k = kaplay({
      canvas: canvas,
      width: width,
      height: height,
      scale: 1,
      background: [0, 0, 0],
      crisp: true,
    });
    
    // Initialize systems
    const audioState = useAudioStore.getState();
    this.audioManager = new AudioManager(audioState.getAudioConfig());
    this.scoringSystem = new ScoringSystem(this.store);
    
    // Load assets
    this.loadAssets();
    
    // Initialize game
    this.initializeGame();
    
    // Set up input handling
    this.setupInputHandling();
  }
  
  private loadAssets(): void {
    // Load sprites
    this.k.loadSprite("player", "/src/assets/sigurd.png");
    this.k.loadSprite("coffee", "/src/assets/coffee.png");
    
    // Load sounds
    this.k.loadSound("jump", "/src/assets/sounds/power-up.mp3");
    this.k.loadSound("gameover", "/src/assets/sounds/game-over.mp3");
    this.k.loadSound("powerup", "/src/assets/sounds/power-up.mp3");
    this.k.loadSound("bgmusic", "/src/assets/sounds/sigurd-melody.mp3");
  }
  
  private initializeGame(): void {
    const initialMap = this.isPlayGround 
      ? getMapById("playground") 
      : getMapById(this.store.currentMapId) || mapDefinitions[0];
    
    if (initialMap) {
      this.loadMap(initialMap);
    }
  }
  
  private setupInputHandling(): void {
    // Arrow keys and WASD for movement
    this.k.onKeyDown("left", () => this.keysPressed.add("left"));
    this.k.onKeyDown("right", () => this.keysPressed.add("right"));
    this.k.onKeyDown("up", () => this.keysPressed.add("up"));
    this.k.onKeyDown("space", () => this.keysPressed.add("jump"));
    this.k.onKeyDown("a", () => this.keysPressed.add("left"));
    this.k.onKeyDown("d", () => this.keysPressed.add("right"));
    this.k.onKeyDown("w", () => this.keysPressed.add("up"));
    
    this.k.onKeyRelease("left", () => this.keysPressed.delete("left"));
    this.k.onKeyRelease("right", () => this.keysPressed.delete("right"));
    this.k.onKeyRelease("up", () => this.keysPressed.delete("up"));
    this.k.onKeyRelease("space", () => this.keysPressed.delete("jump"));
    this.k.onKeyRelease("a", () => this.keysPressed.delete("left"));
    this.k.onKeyRelease("d", () => this.keysPressed.delete("right"));
    this.k.onKeyRelease("w", () => this.keysPressed.delete("up"));
  }
  
  public loadMap(mapDef: MapDefinition): void {
    this.currentMap = mapDef;
    this.store.getState().currentMapId = mapDef.id;
    
    // Clear existing objects by tag
    this.k.destroyAll("player");
    this.k.destroyAll("monster");
    this.k.destroyAll("platform");
    this.k.destroyAll("bomb");
    this.k.destroyAll("specialcoin");
    
    this.monsters = [];
    this.platforms = [];
    this.bombs = [];
    this.specialCoins = [];
    
    // Create player
    this.createPlayer(mapDef.playerStartX, mapDef.playerStartY);
    
    // Create platforms
    mapDef.platforms.forEach(p => {
      this.createPlatform(p.x, p.y, p.width, p.height);
    });
    
    // Create monsters
    mapDef.monsters.forEach(m => {
      this.createMonster(m);
    });
    
    // Create bombs
    mapDef.bombs.forEach(b => {
      this.createBomb(b);
    });
    
    console.log(`Loaded map: ${mapDef.name}`);
  }
  
  private createPlayer(x: number, y: number): void {
    this.player = this.k.add([
      this.k.pos(x, y),
      this.k.rect(this.config.player.size.width, this.config.player.size.height),
      this.k.area(),
      this.k.body({ jumpForce: 300 }),
      this.k.color(255, 0, 0),
      "player",
      { speed: 3 }
    ]);
    
    // Handle jump events
    this.player.onGround(() => {
      // Player landed
    });
    
    // Handle collisions with monsters
    this.player.onCollide("monster", (monster: Monster) => {
      if (this.store.pCoinActive) {
        // Destroy monster in power mode
        this.k.destroy(monster);
        const index = this.monsters.indexOf(monster);
        if (index > -1) this.monsters.splice(index, 1);
        
        const scoreToAdd = this.scoringSystem.scoreMonsterKill(0); // Using color index 0 for now
        this.store.updateScore(scoreToAdd, this.store.score);
      } else {
        // Lose life
        this.handlePlayerDeath();
      }
    });
    
    // Handle bomb collection
    this.player.onCollide("bomb", (bomb: Bomb) => {
      if (!bomb.collected) {
        bomb.collected = true;
        this.k.destroy(bomb);
        this.handleBombCollection(bomb);
      }
    });
    
    // Handle special coin collection
    this.player.onCollide("specialcoin", (coin: SpecialCoin) => {
      if (!coin.collected) {
        coin.collected = true;
        this.k.destroy(coin);
        this.handleSpecialCoinCollection(coin);
      }
    });
  }
  
  private createPlatform(x: number, y: number, width: number, height: number): void {
    const platform = this.k.add([
      this.k.pos(x, y),
      this.k.rect(width, height),
      this.k.area(),
      this.k.body({ isStatic: true }),
      this.k.color(128, 128, 128),
      "platform",
      { isStatic: true }
    ]) as Platform;
    
    this.platforms.push(platform);
  }
  
  private createMonster(monsterDef: any): void {
    const monsterColors = {
      [MonsterType.BUREAUCRAT]: [0, 1, 0.54],
      [MonsterType.TAXMAN]: [1, 0.29, 0.21],
      [MonsterType.REGULATOR]: [1, 0.81, 0.22],
      [MonsterType.TAX_GHOST]: [0.83, 0.83, 0.83],
      [MonsterType.REGULATION_ROBOT]: [0.83, 0.83, 0.83],
      [MonsterType.BUREAUCRAT_CLONE]: [0.28, 0.47, 0.47],
      [MonsterType.FEE_ALIEN]: [0.4, 0.65, 0.65],
      [MonsterType.CONTROL_CRAB]: [0.5, 0.5, 0],
    };
    
    const color = monsterColors[monsterDef.type] || [1, 1, 1];
    
    const monster = this.k.add([
      this.k.pos(monsterDef.x, monsterDef.y),
      this.k.rect(this.config.monster.size.width, this.config.monster.size.height),
      this.k.area(),
      this.k.body(),
      this.k.color(color[0], color[1], color[2]),
      "monster",
      {
        monsterType: monsterDef.type,
        speed: monsterDef.speed || 1,
        patrolStartX: monsterDef.patrolStartX || monsterDef.x,
        patrolEndX: monsterDef.patrolEndX || monsterDef.x + 100,
        direction: 1
      }
    ]) as Monster;
    
    this.monsters.push(monster);
  }
  
  private createBomb(bombDef: any): void {
    const bomb = this.k.add([
      this.k.pos(bombDef.x, bombDef.y),
      this.k.rect(this.config.bomb.size, this.config.bomb.size),
      this.k.area(),
      this.k.color(1, 0.65, 0),
      "bomb",
      {
        group: bombDef.group,
        order: bombDef.order,
        collected: false
      }
    ]) as Bomb;
    
    this.bombs.push(bomb);
  }
  
  private handleBombCollection(bomb: Bomb): void {
    // Simple scoring for bomb collection
    const scoreToAdd = this.scoringSystem.scoreNormalBomb();
    
    this.store.updateScore(scoreToAdd, this.store.score);
    this.store.addBombCollected({
      order: bomb.order,
      group: bomb.group,
      score: scoreToAdd
    });
    
    // Check if all bombs collected
    const allCollected = this.bombs.every(b => b.collected);
    if (allCollected && !this.isPlayGround) {
      this.handleLevelComplete();
    }
  }
  
  private handleSpecialCoinCollection(coin: SpecialCoin): void {
    this.store.collectSpecialCoin(coin.coinType);
    
    switch(coin.coinType) {
      case "P":
        this.store.activatePCoin(5); // 5 seconds of power mode
        this.audioManager.playPowerModeSound();
        break;
      case "B":
        const bScore = this.scoringSystem.scoreBCoin();
        this.store.updateScore(bScore, this.store.score);
        this.audioManager.playBCoinSound();
        break;
      case "E":
        const eScore = this.scoringSystem.scoreECoin();
        this.store.updateScore(eScore, this.store.score);
        this.audioManager.playECoinSound();
        break;
      case "S":
        const sScore = this.scoringSystem.scoreSCoin();
        this.store.updateScore(sScore, this.store.score);
        this.audioManager.playPCoinSound(); // Using P coin sound for S coin
        break;
    }
  }
  
  private handlePlayerDeath(): void {
    this.store.loseLife();
    this.audioManager.playLifeLostSound();
    
    if (this.store.lives <= 0) {
      this.store.setGameStatus(GameStatus.GAME_OVER);
    } else {
      // Respawn player
      if (this.player) {
        this.player.pos = this.k.vec2(
          this.currentMap.playerStartX,
          this.currentMap.playerStartY
        );
      }
    }
  }
  
  private handleLevelComplete(): void {
    this.audioManager.playLevelCompleteSound();
    
    const correctOrderCount = this.store.correctOrderCount;
    const bonus = this.scoringSystem.calculateEndLevelBonus(correctOrderCount);
    
    this.store.setLastBonusAndScore(bonus, this.store.score);
    this.store.updateScore(bonus, this.store.score);
    this.store.resetBonus();
    
    this.store.setGameStatus(GameStatus.BONUS_SCREEN);
    
    setTimeout(() => {
      const currentIndex = mapDefinitions.findIndex(m => m.id === this.currentMap.id);
      if (currentIndex < mapDefinitions.length - 1) {
        this.nextMap();
      } else {
        this.store.setGameStatus(GameStatus.GAME_OVER);
      }
    }, 3000);
  }
  
  public update(): void {
    // Only update if playing
    if (this.store.gameStatus !== GameStatus.PLAYING && !this.isPlayGround) {
      return;
    }
    
    // Update player movement
    if (this.player) {
      const speed = this.player.speed * 60;
      
      if (this.keysPressed.has("left")) {
        this.player.move(-speed, 0);
      }
      if (this.keysPressed.has("right")) {
        this.player.move(speed, 0);
      }
      if ((this.keysPressed.has("up") || this.keysPressed.has("jump")) && this.player.isGrounded()) {
        this.player.jump();
        this.handleJump();
      }
    }
    
    // Update monsters
    this.monsters.forEach(monster => {
      // Simple patrol movement
      const speed = monster.speed * 60;
      monster.move(speed * monster.direction, 0);
      
      if (monster.pos.x >= monster.patrolEndX) {
        monster.direction = -1;
      } else if (monster.pos.x <= monster.patrolStartX) {
        monster.direction = 1;
      }
    });
    
    // Spawn special coins randomly
    if (Math.random() < 0.001) {
      this.spawnSpecialCoin();
    }
  }
  
  private handleJump(): void {
    const scoreToAdd = this.scoringSystem.scoreJump();
    this.store.updateScore(scoreToAdd, this.store.score);
    this.audioManager.playJumpSound();
  }
  
  private spawnSpecialCoin(): void {
    const coinTypes = ["B", "E", "P", "S"] as const;
    const coinType = coinTypes[Math.floor(Math.random() * coinTypes.length)];
    
    const x = Math.random() * (this.config.canvas.width - 30);
    const y = Math.random() * (this.config.canvas.height - 30);
    
    const coinColors = {
      "B": [1, 0.84, 0],     // Gold
      "E": [0, 1, 0],        // Green
      "P": [1, 0, 1],        // Magenta
      "S": [0, 1, 1],        // Cyan
    };
    
    const color = coinColors[coinType];
    const coin = this.k.add([
      this.k.pos(x, y),
      this.k.rect(20, 20),
      this.k.area(),
      this.k.color(color[0], color[1], color[2]),
      "specialcoin",
      {
        coinType: coinType,
        collected: false
      }
    ]) as SpecialCoin;
    
    this.specialCoins.push(coin);
    
    // Remove coin after 5 seconds
    this.k.wait(5, () => {
      if (!coin.collected) {
        this.k.destroy(coin);
        const index = this.specialCoins.indexOf(coin);
        if (index > -1) this.specialCoins.splice(index, 1);
      }
    });
  }
  
  public render(): void {
    // Kaplay handles rendering automatically
    // This method exists for compatibility with the old engine interface
  }
  
  public nextMap(): void {
    const currentIndex = mapDefinitions.findIndex(m => m.id === this.currentMap.id);
    
    if (currentIndex < mapDefinitions.length - 1) {
      const nextMap = mapDefinitions[currentIndex + 1];
      this.store.setLevel(this.store.level + 1);
      this.loadMap(nextMap);
      this.store.setGameStatus(GameStatus.COUNTDOWN);
    }
  }
  
  public reset(): void {
    this.loadMap(this.currentMap);
  }
  
  public dispose(): void {
    // Clean up Kaplay instance
    this.k.quit();
  }
}