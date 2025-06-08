import {
  MapDefinition,
  getMapById,
  mapDefinitions,
} from "../config/MapDefinitions";
import { Physics } from "./physics/Physics";
import { PhysicsResult } from "../../types/Physics";
import { CollisionDetection } from "./physics/CollisionDetection";
import { Renderer } from "../Renderer";
import { AudioManager } from "../audio/AudioManager";
import { useGameStore } from "@/components/stores/useGameStore";
import { useAudioStore } from "@/components/stores/useAudioStore";
import { GameStatus } from "../../types/Game";
import { ScoringSystem } from "./systems/ScoringSystem";
import { Player, Platform } from "../../types/GameEngine";
import { Monster } from "../../types/Monster";
import { AudioConfig } from "../../types/Audio";
import { MonsterAI } from "./monster/MonsterAI";
import { MonsterAIConfig } from "../config/MonsterAIConfig";
import { GameStateManager } from "./GameStateManager";
import { InputManager } from "./systems/InputManager";
import { SpecialCoinManager } from "./systems/SpecialCoinManager";
import { BombManager } from "./systems/BombManager";
import { MonsterType, MovementPattern } from "../../types/Monster";
import {
  GameEngineConfig,
  IGameEngineConfig,
} from "../config/GameEngineConfig";
import { playgroundMap } from "../config/MapDefinitions";

export class GameEngine {
  private config: IGameEngineConfig;
  private store: ReturnType<typeof useGameStore.getState>;
  private playGround: boolean;
  public isPlayGround: boolean;

  // Game objects
  private currentMap: MapDefinition;
  private player: Player;
  private platforms: Platform[];
  private monsters: Monster[];

  // Module instances
  private physics: Physics;
  private collisionDetection: CollisionDetection;
  private renderer: Renderer;
  private scoringSystem: ScoringSystem;
  private audioManager: AudioManager;
  private monsterAI: MonsterAI;

  // System managers
  private stateManager: GameStateManager;
  private inputManager: InputManager;
  private specialCoinManager: SpecialCoinManager;
  private bombManager: BombManager;

  constructor(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    store: ReturnType<typeof useGameStore.getState>
  ) {
    this.store = store;
    this.playGround = store.isPlayGround;
    this.isPlayGround = store.isPlayGround;

    // Initialize with default config and screen size
    this.config = {
      ...GameEngineConfig.getDefaultConfig(),
      ...GameEngineConfig.getConfigForScreenSize(width, height),
    };

    this.monsterAI = new MonsterAI();

    this.initializeModules(ctx);
    this.initializeGame();
  }

  /**
   * Initialize all game modules
   */
  private initializeModules(ctx: CanvasRenderingContext2D): void {
    this.physics = new Physics();
    this.collisionDetection = new CollisionDetection(this.store);
    this.renderer = new Renderer(
      ctx,
      this.config.canvas.width,
      this.config.canvas.height
    );
    this.scoringSystem = new ScoringSystem(this.store);

    // Initialize audio manager with current audio settings
    const audioState = useAudioStore.getState();
    this.audioManager = new AudioManager(audioState.getAudioConfig());

    // Initialize system managers
    this.stateManager = new GameStateManager(
      this.store,
      this.audioManager,
      this.config
    );
    this.inputManager = new InputManager();
    this.specialCoinManager = new SpecialCoinManager(
      this.store,
      this.scoringSystem,
      this.audioManager,
      {
        specialCoinSize: this.config.specialCoin.size,
        canvasWidth: this.config.canvas.width,
        canvasHeight: this.config.canvas.height,
      }
    );
    this.bombManager = new BombManager(this.store, {
      bombSize: this.config.bomb.size,
    });
  }

  /**
   * Initialize game state and load initial map
   */
  private initializeGame(): void {
    let initialMap =
      getMapById(this.stateManager.getState().currentMapId) ||
      mapDefinitions[0];
    if (this.playGround) {
      initialMap = playgroundMap;
      this.loadMap(playgroundMap);
      return;
    } else {
      this.currentMap = initialMap;
      this.loadMap(this.currentMap);
    }

    // Set initial game status in audio manager
    this.audioManager.onGameStateChange(
      this.stateManager.getState().currentGameStatus
    );
  }

  /**
   * Load a specific map and initialize all game objects
   */
  public loadMap(mapDef: MapDefinition): void {
    this.currentMap = mapDef;
    this.stateManager.updateState({ currentMapId: mapDef.id });

    this.initializePlayer(mapDef);
    this.initializePlatforms(mapDef);
    this.bombManager.initializeFromMap(mapDef);
    this.monsters = this.generateMonstersFromMap(mapDef);
    this.specialCoinManager.reset();

    console.log(
      `Loaded map: ${mapDef.name} with ${
        this.bombManager.getBombs().length
      } bombs`
    );
  }

  /**
   * Initialize player at map start position
   */
  private initializePlayer(mapDef: MapDefinition): void {
    this.player = {
      x: mapDef.playerStartX,
      y: mapDef.playerStartY,
      width: this.config.player.size.width,
      height: this.config.player.size.height,
      velocityX: 0,
      velocityY: 0,
      onGround: false,
      color: this.config.player.color,
    };
  }

  /**
   * Initialize platforms from map definition
   */
  private initializePlatforms(mapDef: MapDefinition): void {
    this.platforms = mapDef.platforms.map((p) => ({ ...p }));
  }

  private generateMonstersFromMap(mapDef: MapDefinition): Monster[] {
    const monsterColors = {
      [MonsterType.BUREAUCRAT]: "#00ff89",
      [MonsterType.TAXMAN]: "#ff4b36",
      [MonsterType.REGULATOR]: "#ffcf39",
      [MonsterType.TAX_GHOST]: "#d3d3d3",
      [MonsterType.REGULATION_ROBOT]: "#d3d3d3",
      [MonsterType.BUREAUCRAT_CLONE]: "#477777",
      [MonsterType.FEE_ALIEN]: "#66a6a6",
      [MonsterType.CONTROL_CRAB]: "#808000",
    };

    return mapDef.monsters.map((m, index) => {
      // Create base monster
      const baseMonster: Monster = {
        x: m.x,
        y: m.y,
        width: this.config.monster.size.width,
        height: this.config.monster.size.height,
        type: m.type,
        velocityX: m.speed || 1,
        velocityY: 0,
        patrolStartX: m.patrolStartX || m.x,
        patrolEndX: m.patrolEndX || m.x + 100,
        speed: m.speed || 1,
        color: monsterColors[m.type],
        aiState: {
          currentDirection: { x: 0, y: 0 },
          timeAlive: 0,
          lastDirectionChange: 0,
          patrolStartX: m.x,
          patrolStartY: m.y,
        },
        config: {
          pattern: MovementPattern.HORIZONTAL_PATROL,
          speed: m.speed || 1,
        },
      };

      // Assign AI pattern based on monster type and level
      const config = MonsterAIConfig.getMonsterAIConfig(
        m.type,
        baseMonster,
        index
      );

      // Initialize with AI
      return this.monsterAI.initializeMonster(baseMonster, config);
    });
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

    // Update configuration based on current state
    this.updateGameConfig();

    // Update player movement and physics
    this.updatePlayerPhysics();

    // Update game objects
    this.updateGameObjects();

    // Handle collisions
    this.handleCollisions();

    // Update game systems
    this.updateGameSystems();

    if (!this.playGround) {
      // Check win condition
      this.checkWinCondition();
    }
  }

  /**
   * Update player physics and handle scoring for movement
   */
  private updatePlayerPhysics(): void {
    // Update player movement
    this.physics.updatePlayerMovement(this.player, this.inputManager.getKeys());

    // Update player physics
    const physicsResult = this.physics.updatePlayerPhysics(
      this.player,
      this.platforms,
      this.config.canvas.width,
      this.config.canvas.height
    );

    // Handle physics-based scoring and audio
    this.handlePhysicsEvents(physicsResult);
  }

  /**
   * Handle physics events for scoring and audio
   */
  private handlePhysicsEvents(physicsResult: PhysicsResult): void {
    // Jump scoring and audio
    if (physicsResult.justLeftGround) {
      this.handleJump();
    }

    // Update state tracking
    this.stateManager.updateState({ wasTouchingWall: physicsResult.hitWall });
  }

  /**
   * Handle jump event
   */
  private handleJump(): void {
    const scoreToAdd = this.scoringSystem.scoreJump();
    this.store.updateScore(scoreToAdd, this.store.getState().score);
    this.specialCoinManager.updatePCoinColor();

    // Handle sound
    this.audioManager.playJumpSound();
  }

  /**
   * Update all game objects
   */
  private updateGameObjects(): void {
    this.updateMonsters();
    this.specialCoinManager.update();
    this.bombManager.updateHighlighting();
  }

  /**
   * Update monster positions and AI
   */
  private updateMonsters(): void {
    this.monsters.forEach((monster) => {
      this.monsterAI.updateMonster(monster, this.player, this.platforms, {
        width: this.config.canvas.width,
        height: this.config.canvas.height,
      });
    });
  }

  /**
   * Handle all collision detection
   */
  private handleCollisions(): void {
    this.collisionDetection.checkBombCollisions(
      this.player,
      this.bombManager.getBombs(),
      this.store,
      this.currentMap
    );

    this.collisionDetection.checkMonsterCollisions(
      this.player,
      this.monsters,
      this.currentMap,
      this.store,
      this.stateManager.getState().pCoinColorIndex
    );

    this.checkSpecialCoinCollisions();
  }

  /**
   * Check collisions between player and special coins
   */
  private checkSpecialCoinCollisions(): void {
    this.specialCoinManager.getCoins().forEach((coin) => {
      if (!coin.collected && this.isColliding(this.player, coin)) {
        this.specialCoinManager.handleCoinCollection(coin);
      }
    });
  }

  /**
   * Update game systems
   */
  private updateGameSystems(): void {
    this.specialCoinManager.update();
    this.specialCoinManager.updateSpawning();
  }

  /**
   * Check if all bombs are collected and handle level completion
   */
  private checkWinCondition(): void {
    if (this.bombManager.areAllBombsCollected()) {
      this.handleLevelComplete();
    }
  }

  /**
   * Handle level completion
   */
  private handleLevelComplete(): void {
    console.log("All bombs collected, calculating bonus...");

    // Handle sound
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
    console.log("Bonus:", bonus);

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

    // First update the store with the next map ID
    if (currentIndex < mapDefinitions.length - 1) {
      const nextMap = mapDefinitions[currentIndex + 1];
      this.store.setLevel(this.store.getState().level + 1);
      this.store.getState().currentMapId = nextMap.id;
    }

    // Then show bonus screen
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
      // Update store first
      this.store.getState().currentMapId = mapId;
      // Then load the map
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
    this.stateManager.updateState({
      pCoinColorIndex: 0,
      wasTouchingWall: false,
    });
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
      this.bombManager.getBombs(),
      this.monsters,
      this.player,
      this.specialCoinManager.getCoins()
    );
  }

  /**
   * Get current game state for debugging
   */
  public getDebugInfo(): {
    config: IGameEngineConfig;
    state: ReturnType<typeof this.stateManager.getState>;
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
      state: this.stateManager.getState(),
      playerPosition: { x: this.player.x, y: this.player.y },
      bombsRemaining: this.bombManager.getBombs().filter((b) => !b.collected)
        .length,
      monstersCount: this.monsters.length,
      audioStatus: this.audioManager.getStatus(),
    };
  }

  /**
   * Update game configuration
   */
  public updateConfig(newConfig: Partial<IGameEngineConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Cleanup resources
   */
  public dispose(): void {
    this.audioManager.dispose();
    this.stateManager.dispose();
  }

  /**
   * Update game configuration based on current state
   */
  private updateGameConfig(): void {
    const gameState = this.store.getState();

    // Update config based on game status
    this.config = {
      ...this.config,
      ...GameEngineConfig.getConfigForStatus(gameState.gameStatus),
    };

    // Update config based on level
    this.config = {
      ...this.config,
      ...GameEngineConfig.getConfigForLevel(gameState.level),
    };
  }
}
