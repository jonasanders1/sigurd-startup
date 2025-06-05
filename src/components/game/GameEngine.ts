import { MapDefinition, getMapById, mapDefinitions } from "./MapDefinitions";
import { Physics } from "./Physics";
import { PhysicsResult } from "../types/Physics";
import { CollisionDetection } from "./CollisionDetection";
import { Renderer } from "./Renderer";
import { AudioManager } from "./AudioManager";
import { useGameStore } from "@/components/stores/useGameStore";
import { useAudioStore } from "@/components/stores/useAudioStore";
import { GameStatus } from "../types/Game";
import { ScoringSystem } from "./ScoringSystem";
import {
  Player,
  Bomb,
  Monster,
  Platform,
  SpecialCoin,
} from "../types/GameEngine";
import { AudioConfig } from "../types/Audio";

export interface GameEngineConfig {
  canvasWidth: number;
  canvasHeight: number;
  playerSize: { width: number; height: number };
  bombSize: { width: number; height: number };
  monsterSize: { width: number; height: number };
  specialCoinSize: { width: number; height: number };
}

export interface GameEngineState {
  currentMapId: string;
  pCoinColorIndex: number;
  wasTouchingWall: boolean;
  lastStateCheck: number;
  currentGameStatus: GameStatus;
}

export class GameEngine {
  private config: GameEngineConfig;
  private state: GameEngineState;
  private store: ReturnType<typeof useGameStore.getState>;

  // Game objects
  private currentMap: MapDefinition;
  private player: Player;
  private bombs: Bomb[];
  private monsters: Monster[];
  private platforms: Platform[];
  private specialCoins: SpecialCoin[];
  private keys: { [key: string]: boolean } = {};

  // Visual configuration
  private readonly pCoinColors = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#C0C0C0",
  ];

  // Module instances
  private physics: Physics;
  private collisionDetection: CollisionDetection;
  private renderer: Renderer;
  private scoringSystem: ScoringSystem;
  private audioManager: AudioManager;

  // Cleanup function
  private cleanupSubscriptions: (() => void) | null = null;

  constructor(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    store: ReturnType<typeof useGameStore.getState>
  ) {
    this.config = {
      canvasWidth: width,
      canvasHeight: height,
      playerSize: { width: 32, height: 32 },
      bombSize: { width: 20, height: 20 },
      monsterSize: { width: 28, height: 28 },
      specialCoinSize: { width: 25, height: 25 },
    };

    this.state = {
      currentMapId: store.currentMapId,
      pCoinColorIndex: 0,
      wasTouchingWall: false,
      lastStateCheck: Date.now(),
      currentGameStatus: store.gameStatus,
    };

    this.store = store;

    this.initializeModules(ctx);
    this.initializeGame();
    this.setupControls();
    this.setupStoreSubscriptions();
  }

  /**
   * Initialize all game modules
   */
  private initializeModules(ctx: CanvasRenderingContext2D): void {
    this.physics = new Physics();
    this.collisionDetection = new CollisionDetection(this.store);
    this.renderer = new Renderer(
      ctx,
      this.config.canvasWidth,
      this.config.canvasHeight
    );
    this.scoringSystem = new ScoringSystem(this.store);

    // Initialize audio manager with current audio settings
    const audioState = useAudioStore.getState();
    this.audioManager = new AudioManager(audioState.getAudioConfig());
  }

  /**
   * Setup subscriptions to store changes for real-time updates
   */
  private setupStoreSubscriptions(): void {
    // Subscribe to game state changes
    const unsubscribeGame = useGameStore.subscribe((state) => {
      const gameStatus = state.gameStatus;
      if (gameStatus !== this.state.currentGameStatus) {
        this.handleGameStatusChange(gameStatus);
        this.state.currentGameStatus = gameStatus;
      }
    });

    // Subscribe to audio settings changes
    const unsubscribeAudio = useAudioStore.subscribe((state) => {
      const audioConfig = state.getAudioConfig();
      this.audioManager.updateConfig(audioConfig);
    });

    // Store unsubscribe functions for cleanup
    this.cleanupSubscriptions = () => {
      unsubscribeGame();
      unsubscribeAudio();
    };
  }

  /**
   * Handle game status changes and coordinate between systems
   */
  private handleGameStatusChange(newStatus: GameStatus): void {
    console.log(
      `Game status changed: ${this.state.currentGameStatus} -> ${newStatus}`
    );

    // Notify audio manager
    this.audioManager.onGameStateChange(newStatus);

    // Handle specific state changes
    switch (newStatus) {
      case GameStatus.PLAYING:
        this.onGameStart();
        break;
      case GameStatus.PAUSED:
        this.onGamePause();
        break;
      case GameStatus.BONUS_SCREEN:
        this.onBonusScreen();
        break;
      case GameStatus.GAME_OVER:
        this.onGameOver();
        break;
      case GameStatus.COUNTDOWN:
        this.onCountdown();
        break;
    }
  }

  /**
   * Handle game start
   */
  private onGameStart(): void {
    console.log("Game started - all systems active");
    this.physics.reset();
  }

  /**
   * Handle game pause
   */
  private onGamePause(): void {
    console.log("Game paused - maintaining state");
    // Audio manager will automatically pause music
  }

  /**
   * Handle bonus screen
   */
  private onBonusScreen(): void {
    console.log("Bonus screen - starting bonus count sound");
    const gameState = this.store.getState();
    if (gameState.lastEarnedBonus > 0) {
      // Calculate duration based on bonus amount (more bonus = longer counting)
      const countDuration = Math.min(
        3000,
        Math.max(1000, gameState.lastEarnedBonus / 20)
      );
      this.audioManager.startBonusCountSFX(countDuration);
    }
  }

  /**
   * Handle game over
   */
  private onGameOver(): void {
    console.log("Game over - cleaning up");
    this.audioManager.stopBonusCountSFX();
  }

  /**
   * Handle countdown
   */
  private onCountdown(): void {
    console.log("Countdown started - preparing for gameplay");
    this.audioManager.stopBonusCountSFX();
  }

  /**
   * Initialize game state and load initial map
   */
  private initializeGame(): void {
    const initialMap = getMapById(this.state.currentMapId) || mapDefinitions[0];
    this.currentMap = initialMap;
    this.loadMap(this.currentMap);

    // Set initial game status in audio manager
    this.audioManager.onGameStateChange(this.state.currentGameStatus);
  }

  /**
   * Load a specific map and initialize all game objects
   */
  private loadMap(mapDef: MapDefinition): void {
    this.currentMap = mapDef;
    this.state.currentMapId = mapDef.id;

    this.initializePlayer(mapDef);
    this.initializePlatforms(mapDef);
    this.initializeBombs(mapDef);
    this.initializeMonsters(mapDef);
    this.initializeSpecialCoins();

    console.log(`Loaded map: ${mapDef.name} with ${this.bombs.length} bombs`);
  }

  /**
   * Initialize player at map start position
   */
  private initializePlayer(mapDef: MapDefinition): void {
    this.player = {
      x: mapDef.playerStartX,
      y: mapDef.playerStartY,
      width: this.config.playerSize.width,
      height: this.config.playerSize.height,
      velocityX: 0,
      velocityY: 0,
      onGround: false,
      color: "#3B82F6",
    };
  }

  /**
   * Initialize platforms from map definition
   */
  private initializePlatforms(mapDef: MapDefinition): void {
    this.platforms = mapDef.platforms.map((p) => ({ ...p }));
  }

  /**
   * Initialize bombs from map definition
   */
  private initializeBombs(mapDef: MapDefinition): void {
    this.bombs = mapDef.bombs.map((b) => ({
      x: b.x,
      y: b.y,
      width: this.config.bombSize.width,
      height: this.config.bombSize.height,
      order: b.order,
      group: b.group,
      collected: false,
      isCorrectNext: false,
      isInActiveGroup: false,
    }));
  }

  /**
   * Initialize monsters from map definition
   */
  private initializeMonsters(mapDef: MapDefinition): void {
    const monsterColors = {
      bureaucrat: "#DC2626",
      taxman: "#7C2D12",
      regulator: "#991B1B",
    };

    this.monsters = mapDef.monsters.map((m) => ({
      x: m.x,
      y: m.y,
      width: this.config.monsterSize.width,
      height: this.config.monsterSize.height,
      type: m.type,
      velocityX: m.speed || 1,
      patrolStartX: m.patrolStartX || m.x,
      patrolEndX: m.patrolEndX || m.x + 100,
      speed: m.speed || 1,
      color: monsterColors[m.type],
    }));
  }

  /**
   * Initialize special coins array (empty at start)
   */
  private initializeSpecialCoins(): void {
    this.specialCoins = [];
  }

  /**
   * Setup keyboard event listeners
   */
  private setupControls(): void {
    const validKeys = [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "Space",
      "KeyW",
      "KeyA",
      "KeyS",
      "KeyD",
    ];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (validKeys.includes(e.code)) {
        e.preventDefault();
        this.keys[e.code] = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (validKeys.includes(e.code)) {
        e.preventDefault();
        this.keys[e.code] = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
  }

  /**
   * Main game update loop
   */
  public update(): void {
    // Only update game logic if in playing state
    const currentGameState = this.store.getState().gameStatus;
    if (currentGameState !== GameStatus.PLAYING) {
      return;
    }

    // Update player movement and physics
    this.updatePlayerPhysics();

    // Update game objects
    this.updateGameObjects();

    // Handle collisions
    this.handleCollisions();

    // Update game systems
    this.updateGameSystems();

    // Check win condition
    this.checkWinCondition();
  }

  /**
   * Update player physics and handle scoring for movement
   */
  private updatePlayerPhysics(): void {
    // Update player movement
    this.physics.updatePlayerMovement(this.player, this.keys);

    // Update player physics
    const physicsResult = this.physics.updatePlayerPhysics(
      this.player,
      this.platforms,
      this.config.canvasWidth,
      this.config.canvasHeight
    );

    // Handle physics-based scoring and audio
    this.handlePhysicsEvents(physicsResult);
  }

  /**
   * Handle physics events for scoring and audio
   */
  private handlePhysicsEvents(physicsResult: PhysicsResult): void {
    // Wall hit scoring and audio
    if (physicsResult.hitWall && !this.state.wasTouchingWall) {
      this.handleWallHit();
    }

    // Jump scoring and audio
    if (physicsResult.justLeftGround) {
      this.handleJump();
    }

    // Update state tracking
    this.state.wasTouchingWall = physicsResult.hitWall;
  }

  /**
   * Handle wall hit event - ONLY AudioManager
   */
  private handleWallHit(): void {
    const scoreToAdd = this.scoringSystem.scoreWallHit();
    this.store.updateScore(scoreToAdd, this.store.getState().score);
    this.updatePCoinColor();

    // ONLY AudioManager handles sound
    this.audioManager.playWallHitSound();
  }

  /**
   * Handle jump event - ONLY AudioManager
   */
  private handleJump(): void {
    const scoreToAdd = this.scoringSystem.scoreJump();
    this.store.updateScore(scoreToAdd, this.store.getState().score);
    this.updatePCoinColor();

    // ONLY AudioManager handles sound
    this.audioManager.playJumpSound();
  }

  /**
   * Update all game objects
   */
  private updateGameObjects(): void {
    this.updateMonsters();
    this.updateSpecialCoins();
    this.updateBombHighlighting();
  }

  /**
   * Update monster positions and AI
   */
  private updateMonsters(): void {
    this.monsters.forEach((monster) => {
      this.updateMonsterMovement(monster);
      this.constrainMonsterToPatrolArea(monster);
    });
  }

  /**
   * Update individual monster movement
   */
  private updateMonsterMovement(monster: Monster): void {
    monster.x += monster.velocityX;

    // Reverse direction at patrol boundaries
    if (
      monster.x <= monster.patrolStartX ||
      monster.x >= monster.patrolEndX - monster.width
    ) {
      monster.velocityX *= -1;
    }
  }

  /**
   * Ensure monster stays within patrol area
   */
  private constrainMonsterToPatrolArea(monster: Monster): void {
    if (monster.x < monster.patrolStartX) {
      monster.x = monster.patrolStartX;
    }
    if (monster.x > monster.patrolEndX - monster.width) {
      monster.x = monster.patrolEndX - monster.width;
    }
  }

  /**
   * Handle all collision detection
   */
  private handleCollisions(): void {
    this.collisionDetection.checkBombCollisions(
      this.player,
      this.bombs,
      this.store,
      this.currentMap
    );

    this.collisionDetection.checkMonsterCollisions(
      this.player,
      this.monsters,
      this.currentMap,
      this.store,
      this.state.pCoinColorIndex
    );

    this.checkSpecialCoinCollisions();
  }

  /**
   * Check collisions between player and special coins
   */
  private checkSpecialCoinCollisions(): void {
    this.specialCoins.forEach((coin) => {
      if (!coin.collected && this.isColliding(this.player, coin)) {
        this.handleSpecialCoinCollection(coin);
      }
    });
  }

  /**
   * Handle special coin collection - ONLY AudioManager
   */
  private handleSpecialCoinCollection(coin: SpecialCoin): void {
    coin.collected = true;

    // Update game state through store
    this.store.collectSpecialCoin(coin.type);

    // ONLY AudioManager handles audio
    switch (coin.type) {
      case "B":
        this.audioManager.playBCoinSound();
        break;
      case "E":
        this.audioManager.playECoinSound();
        break;
      case "P":
        this.audioManager.playPCoinSound();
        this.audioManager.playPowerModeSound();
        break;
    }
  }

  /**
   * Update game systems (special coins, P-coin color, etc.)
   */
  private updateGameSystems(): void {
    this.updateSpecialCoins();
    this.updateSpecialCoinSpawning();
    this.updatePowerMode();
  }

  /**
   * Update special coins (P coin timer, etc.)
   */
  private updateSpecialCoins(): void {
    const state = this.store.getState();

    if (state.pCoinActive && state.pCoinTimeLeft > 0) {
      this.store.updateSpecialCoins();
    }
  }

  /**
   * Update special coin spawning logic
   */
  private updateSpecialCoinSpawning(): void {
    const state = this.store.getState();

    // Check if coins already exist to prevent duplicates
    const existingCoins = this.getExistingCoinTypes();

    // Spawn B coin
    if (
      !existingCoins.has("B") &&
      this.scoringSystem.shouldSpawnBCoin(state.score)
    ) {
      this.spawnSpecialCoin("B");
    }

    // Spawn E coin
    if (
      !existingCoins.has("E") &&
      this.scoringSystem.shouldSpawnECoin(state.bCoinsCollected, state.lives)
    ) {
      this.spawnSpecialCoin("E");
    }

    // Spawn P coin
    if (
      !existingCoins.has("P") &&
      this.scoringSystem.shouldSpawnPCoin(state.correctOrderCount)
    ) {
      this.spawnSpecialCoin("P");
    }
  }

  /**
   * Get set of existing coin types that haven't been collected
   */
  private getExistingCoinTypes(): Set<string> {
    return new Set(
      this.specialCoins
        .filter((coin) => !coin.collected)
        .map((coin) => coin.type)
    );
  }

  /**
   * Update power mode (P coin effects)
   */
  private updatePowerMode(): void {
    const state = this.store.getState();

    if (state.pCoinActive && state.pCoinTimeLeft > 0) {
      this.store.updateSpecialCoins();
    }
  }

  /**
   * Spawn a special coin at a safe location
   */
  private spawnSpecialCoin(type: "B" | "E" | "P" | "S"): void {
    const coin = this.createSpecialCoin(type);
    this.specialCoins.push(coin);
    console.log(`${type} coin spawned!`);
  }

  /**
   * Create a special coin object
   */
  private createSpecialCoin(type: "B" | "E" | "P" | "S"): SpecialCoin {
    const coinColors = {
      B: "#FFD700", // Gold
      E: "#FF69B4", // Pink
      P: this.pCoinColors[this.state.pCoinColorIndex],
      S: "#9400D3", // Violet
    };

    const spawnPosition = this.findSafeSpawnPosition();

    return {
      x: spawnPosition.x,
      y: spawnPosition.y,
      width: this.config.specialCoinSize.width,
      height: this.config.specialCoinSize.height,
      type,
      collected: false,
      color: coinColors[type],
      value: type === "P" ? this.calculatePCoinValue() : undefined,
    };
  }

  /**
   * Find a safe spawn position for special coins
   */
  private findSafeSpawnPosition(): { x: number; y: number } {
    // Simple random spawn - could be improved with collision checking
    return {
      x: Math.random() * (this.config.canvasWidth - 30) + 15,
      y: Math.random() * (this.config.canvasHeight - 100) + 50,
    };
  }

  /**
   * Calculate P coin value based on color
   */
  private calculatePCoinValue(): number {
    return this.state.pCoinColorIndex === 4
      ? 2000
      : 100 + this.state.pCoinColorIndex * 475;
  }

  /**
   * Update P coin color when actions occur
   */
  private updatePCoinColor(): void {
    this.state.pCoinColorIndex =
      (this.state.pCoinColorIndex + 1) % this.pCoinColors.length;

    // Update existing P coins
    this.specialCoins.forEach((coin) => {
      if (coin.type === "P" && !coin.collected) {
        coin.color = this.pCoinColors[this.state.pCoinColorIndex];
        coin.value = this.calculatePCoinValue();
      }
    });
  }

  /**
   * Update bomb highlighting based on game state
   */
  private updateBombHighlighting(): void {
    const state = this.store.getState();
    const activeGroup = state.currentActiveGroup;
    const completedGroups = state.completedGroups;

    // Reset all highlighting
    this.resetBombHighlighting();

    // Get next group in sequence
    const nextGroupInSequence = this.currentMap.groupSequence.find(
      (group) => !completedGroups.includes(group)
    );

    if (activeGroup === null) {
      this.highlightNextGroupStart(nextGroupInSequence);
    } else {
      this.highlightActiveGroup(activeGroup);
    }
  }

  /**
   * Reset all bomb highlighting
   */
  private resetBombHighlighting(): void {
    this.bombs.forEach((bomb) => {
      bomb.isCorrectNext = false;
      bomb.isInActiveGroup = false;
    });
  }

  /**
   * Highlight the first bomb of the next group in sequence
   */
  private highlightNextGroupStart(
    nextGroupInSequence: number | undefined
  ): void {
    if (!nextGroupInSequence) return;

    const nextGroupBombs = this.bombs.filter(
      (b) => b.group === nextGroupInSequence && !b.collected
    );

    if (nextGroupBombs.length > 0) {
      const firstBomb = nextGroupBombs.reduce((min, current) =>
        current.order < min.order ? current : min
      );
      firstBomb.isCorrectNext = true;
      firstBomb.isInActiveGroup = true;
    }
  }

  /**
   * Highlight all bombs in active group and mark next correct bomb
   */
  private highlightActiveGroup(activeGroup: number): void {
    const activeGroupBombs = this.bombs.filter(
      (b) => b.group === activeGroup && !b.collected
    );

    // Mark all bombs in active group
    activeGroupBombs.forEach((bomb) => {
      bomb.isInActiveGroup = true;
    });

    // Find and mark the next correct bomb
    if (activeGroupBombs.length > 0) {
      const nextBomb = activeGroupBombs.reduce((min, current) =>
        current.order < min.order ? current : min
      );
      nextBomb.isCorrectNext = true;
    }
  }

  /**
   * Check if all bombs are collected and handle level completion
   */
  private checkWinCondition(): void {
    const allCollected = this.bombs.every((b) => b.collected);

    if (allCollected) {
      this.handleLevelComplete();
    }
  }

  /**
   * Handle level completion - ONLY AudioManager
   */
  private handleLevelComplete(): void {
    console.log("All bombs collected, calculating bonus...");

    // ONLY AudioManager handles sound
    this.audioManager.playLevelCompleteSound();

    this.calculateAndApplyFinalBonus();
    this.transitionToNextLevel();
  }

  /**
   * Calculate and apply final level bonus
   */
  private calculateAndApplyFinalBonus(): void {
    const correctOrderCount = this.store.getState().correctOrderCount;
    const bonus = this.scoringSystem.calculateEndLevelBonus(correctOrderCount);

    // Store bonus and current score for bonus screen
    const currentScore = this.store.getState().score;
    this.store.setLastBonusAndScore(bonus, currentScore);
    this.store.updateScore(bonus, currentScore);
    this.store.resetBonus();
  }

  /**
   * Handle transition to next level or game completion
   */
  private transitionToNextLevel(): void {
    const currentIndex = mapDefinitions.findIndex(
      (m) => m.id === this.currentMap.id
    );

    this.store.setGameStatus(GameStatus.BONUS_SCREEN);

    setTimeout(() => {
      if (currentIndex < mapDefinitions.length - 1) {
        // Move to next map
        this.switchToMap(mapDefinitions[currentIndex + 1].id);
      } else {
        // Game completed
        this.store.setGameStatus(GameStatus.GAME_OVER);
      }
    }, 3000);
  }

  /**
   * Switch to a specific map
   */
  public switchToMap(mapId: string): void {
    console.log(
      "switchToMap - Current map:",
      this.currentMap.id,
      "Target map:",
      mapId
    );

    const newMap = getMapById(mapId);
    if (newMap) {
      this.loadMap(newMap);
      this.resetGameState();
      this.store.setGameStatus(GameStatus.COUNTDOWN);
      console.log("New map loaded:", newMap.id);
    } else {
      console.error("Failed to find map:", mapId);
    }
  }

  /**
   * Move to the next map in sequence
   */
  public nextMap(): void {
    const currentIndex = mapDefinitions.findIndex(
      (m) => m.id === this.currentMap.id
    );

    if (currentIndex < mapDefinitions.length - 1) {
      const nextMap = mapDefinitions[currentIndex + 1];
      this.store.setLevel(this.store.getState().level + 1);
      this.switchToMap(nextMap.id);
    } else {
      this.store.setGameStatus(GameStatus.GAME_OVER);
    }
  }

  /**
   * Reset game state for new level
   */
  private resetGameState(): void {
    this.store.resetCorrectOrderCount();
    this.store.setActiveGroup(null);
    this.store.resetCompletedGroups();
    this.state.pCoinColorIndex = 0;
    this.state.wasTouchingWall = false;
  }

  /**
   * Check collision between two rectangles
   */
  private isColliding(
    rect1: { x: number; y: number; width: number; height: number },
    rect2: { x: number; y: number; width: number; height: number }
  ): boolean {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  /**
   * Reset the entire game
   */
  public reset(): void {
    this.loadMap(this.currentMap);
    this.resetGameState();
    this.physics.reset();
    this.store.resetGame();
    this.audioManager.stopBonusCountSFX();
  }

  /**
   * Start the game
   */
  public start(): void {
    console.log("Game started!");
    this.store.startGame();
  }

  /**
   * Render the game
   */
  public render(): void {
    this.renderer.render(
      this.currentMap,
      this.platforms,
      this.bombs,
      this.monsters,
      this.player,
      this.specialCoins
    );
  }

  /**
   * Get current game state for debugging
   */
  public getDebugInfo(): {
    config: GameEngineConfig;
    state: GameEngineState;
    playerPosition: { x: number; y: number };
    bombsRemaining: number;
    monstersCount: number;
    audioStatus: {
      currentTrack: string | null;
      assetsLoaded: number;
      totalAssets: number;
      config: AudioConfig;
    };
  } {
    return {
      config: this.config,
      state: this.state,
      playerPosition: { x: this.player.x, y: this.player.y },
      bombsRemaining: this.bombs.filter((b) => !b.collected).length,
      monstersCount: this.monsters.length,
      audioStatus: this.audioManager.getStatus(),
    };
  }

  /**
   * Update game configuration
   */
  public updateConfig(newConfig: Partial<GameEngineConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Cleanup resources
   */
  public dispose(): void {
    this.audioManager.dispose();
    if (this.cleanupSubscriptions) {
      this.cleanupSubscriptions();
    }
  }
}
