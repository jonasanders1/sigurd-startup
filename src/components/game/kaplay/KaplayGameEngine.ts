import kaplay, { GameObj, KAPLAYCtx, PosComp, AreaComp, BodyComp, RectComp, ColorComp } from "kaplay";
import { GameStore } from "../../types/Game";
import { mapDefinitions, getMapById, MapDefinition } from "../config/MapDefinitions";
import { GameStatus, MonsterType } from "../../types/Game";
import { useGameStore } from "@/components/stores/useGameStore";
import { useAudioStore } from "@/components/stores/useAudioStore";
import { AudioManager } from "../audio/AudioManager";
import { GameEngineConfig, IGameEngineConfig } from "../config/GameEngineConfig";

// Define component types for game objects
type Player = GameObj<PosComp & AreaComp & BodyComp & RectComp & ColorComp & { speed: number }>;
type Monster = GameObj<PosComp & AreaComp & BodyComp & RectComp & ColorComp & { 
  monsterType: MonsterType;
  speed: number;
  patrolStartX: number;
  patrolEndX: number;
  direction: number;
}>;
type Platform = GameObj<PosComp & AreaComp & RectComp & ColorComp>;
type Bomb = GameObj<PosComp & AreaComp & RectComp & ColorComp & { 
  group: number;
  order: number;
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
  
  // Systems
  private audioManager: AudioManager;
  
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
    
    // Set gravity for the scene
    this.k.setGravity(180);
    
    // Initialize systems
    const audioState = useAudioStore.getState();
    this.audioManager = new AudioManager(audioState.getAudioConfig());
    
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
    
    // Load sounds
    this.k.loadSound("jump", "/src/assets/sounds/power-up.mp3");
    this.k.loadSound("gameover", "/src/assets/sounds/game-over.mp3");
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
    
    this.monsters = [];
    this.platforms = [];
    this.bombs = [];
    
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
      this.k.color(0, 255, 0),
      "player",
      { speed: 3 }
    ]);
    
    // Handle jump events
    this.player.onGround(() => {
      // Player landed
    });
    
    // Handle collisions with monsters
    this.player.onCollide("monster", (monster: Monster) => {
      // Lose life when touching monster
      this.handlePlayerDeath();
    });
    
    // Handle bomb collection
    this.player.onCollide("bomb", (bomb: Bomb) => {
      if (!bomb.collected) {
        bomb.collected = true;
        this.k.destroy(bomb);
        this.handleBombCollection(bomb);
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
      "platform"
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
      this.k.rect(this.config.bomb.size.width, this.config.bomb.size.height),
      this.k.area(),
      this.k.color(255, 0, 0),
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
    const scoreToAdd = 100; // Fixed score per bomb
    
    this.store.updateScore(scoreToAdd);
    
    // Check if all bombs collected
    const allCollected = this.bombs.every(b => b.collected);
    if (allCollected && !this.isPlayGround) {
      this.handleLevelComplete();
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
    
    // Simple level completion - just move to next level
    setTimeout(() => {
      const currentIndex = mapDefinitions.findIndex(m => m.id === this.currentMap.id);
      if (currentIndex < mapDefinitions.length - 1) {
        this.nextMap();
      } else {
        this.store.setGameStatus(GameStatus.GAME_OVER);
      }
    }, 1000);
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
  }
  
  private handleJump(): void {
    const scoreToAdd = 10; // Fixed score per jump
    this.store.updateScore(scoreToAdd);
    this.audioManager.playJumpSound();
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