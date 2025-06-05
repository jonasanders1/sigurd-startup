import { MapDefinition, getMapById, mapDefinitions } from "./MapDefinitions";
import { Physics } from "./Physics";
import { CollisionDetection } from "./CollisionDetection";
import { Renderer } from "./Renderer";
import { useGameStore } from "@/components/stores/useGameStore";
import { SoundEvent, useAudioStore } from "@/components/stores/useAudioStore";
import { BonusType, GameStatus } from "../types/Game";
import { ScoringSystem } from "./ScoringSystem";

export interface GameState {
  score: number;
  lives: number;
  level: number;
  gameStatus: GameStatus;
  currentMapId: string;
  efficiencyMultiplier: number;
  bombsCollected: number[];
  correctOrderCount: number;
  bCoinsCollected: number;
  eCoinsCollected: number;
  pCoinActive: boolean;
  pCoinTimeLeft: number;
  currentActiveGroup: number | null; // Track which group the player is currently working on
  completedGroups: number[]; // Track which groups have been completed
}

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
  velocityY: number;
  onGround: boolean;
  color: string;
}

export interface Bomb {
  x: number;
  y: number;
  width: number;
  height: number;
  order: number;
  group: number; // Add group property
  collected: boolean;
  isCorrectNext: boolean;
  isInActiveGroup: boolean; // Add flag for group highlighting
}

export interface Monster {
  x: number;
  y: number;
  width: number;
  height: number;
  type: "bureaucrat" | "taxman" | "regulator";
  velocityX: number;
  patrolStartX: number;
  patrolEndX: number;
  speed: number;
  color: string;
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SpecialCoin {
  x: number;
  y: number;
  width: number;
  height: number;
  type: "B" | "E" | "P" | "S";
  collected: boolean;
  color: string;
  value?: number;
}

export class GameEngine {
  private width: number;
  private height: number;
  private store: ReturnType<typeof useGameStore.getState>;
  private audioStore: ReturnType<typeof useAudioStore.getState>;

  private currentMap: MapDefinition;
  private player: Player;
  private bombs: Bomb[];
  private monsters: Monster[];
  private platforms: Platform[];
  private specialCoins: SpecialCoin[];
  private keys: { [key: string]: boolean } = {};
  private pCoinColors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#C0C0C0"]; // Blue to Silver
  private pCoinColorIndex = 0;

  // Module instances
  private physics: Physics;
  private collisionDetection: CollisionDetection;
  private renderer: Renderer;
  private scoringSystem: ScoringSystem;

  private wasTouchingWall = false;

  constructor(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    store: ReturnType<typeof useGameStore.getState>
  ) {
    this.width = width;
    this.height = height;
    this.store = store;
    this.audioStore = useAudioStore.getState();

    // Initialize modules
    this.physics = new Physics();
    this.collisionDetection = new CollisionDetection(store);
    this.renderer = new Renderer(ctx, width, height);
    this.scoringSystem = new ScoringSystem(store);

    // Load the map from store
    const currentMapId = store.currentMapId;
    const initialMap = getMapById(currentMapId) || mapDefinitions[0];
    this.currentMap = initialMap;
    this.loadMap(this.currentMap);

    // Setup controls
    this.setupControls();
  }

  private loadMap(mapDef: MapDefinition) {
    this.currentMap = mapDef;

    // Initialize player at map start position
    this.player = {
      x: mapDef.playerStartX,
      y: mapDef.playerStartY,
      width: 32,
      height: 32,
      velocityX: 0,
      velocityY: 0,
      onGround: false,
      color: "#3B82F6",
    };

    // Load platforms from map
    this.platforms = mapDef.platforms.map((p) => ({ ...p }));

    // Load bombs from map
    this.bombs = this.generateBombsFromMap(mapDef);

    // Load monsters from map
    this.monsters = this.generateMonstersFromMap(mapDef);

    // Initialize special coins
    this.specialCoins = [];

    console.log(`Loaded map: ${mapDef.name} with ${this.bombs.length} bombs`);
  }

  public switchToMap(mapId: string) {
    console.log(
      "switchToMap - Current map:",
      this.currentMap.id,
      "Target map:",
      mapId
    );
    const newMap = getMapById(mapId);

    if (newMap) {
      this.loadMap(newMap);
      this.store.setGameStatus(GameStatus.COUNTDOWN);
      // Reset group-related state, etc. (as before)
      this.store.resetCorrectOrderCount();
      this.store.setActiveGroup(null);
      this.store.resetCompletedGroups();
      // ... any other state resets needed ...
      console.log("New map loaded:", newMap.id);
    } else {
      console.error("Failed to find map:", mapId);
    }
  }

  public nextMap() {
    const currentIndex = mapDefinitions.findIndex(
      (m) => m.id === this.currentMap.id
    );
    console.log(
      "nextMap - Current index:",
      currentIndex,
      "Current map:",
      this.currentMap.id
    );

    if (currentIndex < mapDefinitions.length - 1) {
      const nextMap = mapDefinitions[currentIndex + 1];
      console.log("Found next map:", nextMap.id);

      // Increment level first
      this.store.setLevel(this.store.getState().level + 1);
      console.log("Level incremented to:", this.store.getState().level);

      // Then switch maps
      this.switchToMap(nextMap.id);
    } else {
      console.log("No more maps available");
      this.store.setGameStatus(GameStatus.BONUS_SCREEN);
      setTimeout(() => {
        this.store.setGameStatus(GameStatus.GAME_OVER);
      }, 3000);
    }
  }

  private generateBombsFromMap(mapDef: MapDefinition): Bomb[] {
    return mapDef.bombs.map((b) => ({
      x: b.x,
      y: b.y,
      width: 20,
      height: 20,
      order: b.order,
      group: b.group,
      collected: false,
      isCorrectNext: false,
      isInActiveGroup: false,
    }));
  }

  private generateMonstersFromMap(mapDef: MapDefinition): Monster[] {
    const colors = {
      bureaucrat: "#DC2626",
      taxman: "#7C2D12",
      regulator: "#991B1B",
    };

    return mapDef.monsters.map((m) => ({
      x: m.x,
      y: m.y,
      width: 28,
      height: 28,
      type: m.type,
      velocityX: m.speed || 1,
      patrolStartX: m.patrolStartX || m.x,
      patrolEndX: m.patrolEndX || m.x + 100,
      speed: m.speed || 1,
      color: colors[m.type],
    }));
  }

  private setupControls() {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        [
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          "Space",
          "KeyW",
          "KeyA",
          "KeyS",
          "KeyD",
        ].includes(e.code)
      ) {
        e.preventDefault();
      }
      this.keys[e.code] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (
        [
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          "Space",
          "KeyW",
          "KeyA",
          "KeyS",
          "KeyD",
        ].includes(e.code)
      ) {
        e.preventDefault();
      }
      this.keys[e.code] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
  }

  public start() {
    console.log("Game started!");
  }

  public reset() {
    this.loadMap(this.currentMap);
    this.pCoinColorIndex = 0;
    this.wasTouchingWall = false;
    this.store.resetGame();
  }

  public update() {
    // Handle input and update player movement
    this.physics.updatePlayerMovement(this.player, this.keys);

    // Update player physics
    const playerPhysicsResult = this.physics.updatePlayerPhysics(
      this.player,
      this.platforms,
      this.width,
      this.height
    );

    // State change detection for scoring
    const isTouchingWall = playerPhysicsResult.hitWall;
    const isOnGround = playerPhysicsResult.onGround;

    // Score on state changes - BUT CHECK PREVIOUS STATES FIRST
    if (isTouchingWall && !this.wasTouchingWall) {
      const scoreToAdd = this.scoringSystem.scoreWallHit();
      this.store.updateScore(scoreToAdd, this.store.getState().score);
      this.updatePCoinColor();
    }

    this.wasTouchingWall = isTouchingWall;

    // Update monsters
    this.updateMonsters();

    // Check collisions
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
      this.pCoinColorIndex
    );
    this.checkSpecialCoinCollisions();

    // Update bomb highlighting
    this.updateBombHighlighting();

    // Update special coins
    this.updateSpecialCoins();

    // Check win condition
    this.checkWinCondition();
  }

  private updatePCoinColor() {
    this.pCoinColorIndex = (this.pCoinColorIndex + 1) % this.pCoinColors.length;
    this.specialCoins.forEach((coin) => {
      if (coin.type === "P" && !coin.collected) {
        coin.color = this.pCoinColors[this.pCoinColorIndex];
        coin.value =
          this.pCoinColorIndex === 4 ? 2000 : 100 + this.pCoinColorIndex * 475; // Silver = 2000, others scale up
      }
    });
  }

  private updateSpecialCoins() {
    const state = this.store.getState();

    if (state.pCoinActive && state.pCoinTimeLeft > 0) {
      this.store.updateSpecialCoins();
    }

    // Check if any coins of each type already exist
    const hasBCoin = this.specialCoins.some(
      (coin) => coin.type === "B" && !coin.collected
    );
    const hasECoin = this.specialCoins.some(
      (coin) => coin.type === "E" && !coin.collected
    );
    const hasPCoin = this.specialCoins.some(
      (coin) => coin.type === "P" && !coin.collected
    );

    // Only spawn if no coin of that type exists
    if (!hasBCoin && this.scoringSystem.shouldSpawnBCoin(state.score)) {
      this.spawnSpecialCoin("B");
    }

    if (
      !hasECoin &&
      this.scoringSystem.shouldSpawnECoin(state.bCoinsCollected, state.lives)
    ) {
      this.spawnSpecialCoin("E");
    }

    if (
      !hasPCoin &&
      this.scoringSystem.shouldSpawnPCoin(state.correctOrderCount)
    ) {
      console.log("Spawning P coin");
      this.spawnSpecialCoin("P");
    }
  }

  private spawnSpecialCoin(type: "B" | "E" | "P" | "S") {
    const colors = {
      B: "#FFD700", // Gold
      E: "#FF69B4", // Pink
      P: this.pCoinColors[this.pCoinColorIndex],
      S: "#9400D3", // Violet
    };

    // Find a safe spawn position
    const spawnX = Math.random() * (this.width - 30) + 15;
    const spawnY = Math.random() * (this.height - 100) + 50;

    const coin: SpecialCoin = {
      x: spawnX,
      y: spawnY,
      width: 25,
      height: 25,
      type,
      collected: false,
      color: colors[type],
      value:
        type === "P"
          ? this.pCoinColorIndex === 4
            ? 2000
            : 100 + this.pCoinColorIndex * 475
          : undefined,
    };

    this.specialCoins.push(coin);
    console.log(`${type} coin spawned!`);
  }

  private checkSpecialCoinCollisions() {
    this.specialCoins.forEach((coin) => {
      if (!coin.collected && this.isColliding(this.player, coin)) {
        coin.collected = true;
        this.store.collectSpecialCoin(coin.type);
      }
    });
  }

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

  private updateMonsters() {
    this.monsters.forEach((monster) => {
      monster.x += monster.velocityX;

      if (
        monster.x <= monster.patrolStartX ||
        monster.x >= monster.patrolEndX - monster.width
      ) {
        monster.velocityX *= -1;
      }

      if (monster.x < monster.patrolStartX) {
        monster.x = monster.patrolStartX;
      }
      if (monster.x > monster.patrolEndX - monster.width) {
        monster.x = monster.patrolEndX - monster.width;
      }
    });
  }

  private updateBombHighlighting() {
    const state = this.store.getState();
    const activeGroup = state.currentActiveGroup;
    const completedGroups = state.completedGroups;

    // Get the next group in sequence that should be active
    const nextGroupInSequence = this.currentMap.groupSequence.find(
      (group) => !completedGroups.includes(group)
    );

    // Reset all bomb highlighting first
    this.bombs.forEach((bomb) => {
      bomb.isCorrectNext = false;
      bomb.isInActiveGroup = false;
    });

    // If no active group, only highlight the first bomb of the next group in sequence
    if (activeGroup === null && nextGroupInSequence) {
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
      return;
    }

    // If there's an active group, highlight all bombs in that group
    // and mark the next correct bomb
    if (activeGroup !== null) {
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
  }

  private checkWinCondition() {
    const allCollected = this.bombs.every((b) => b.collected);
    if (allCollected) {
      console.log("All bombs collected, calculating bonus...");
      this.calculateFinalBonus();

      // Add bonus to score and reset bonus before showing bonus screen
      const state = this.store.getState();
      this.store.setLastBonusAndScore(state.bonus, state.score);
      this.store.updateScore(state.bonus, state.score);
      this.store.resetBonus();

      const currentIndex = mapDefinitions.findIndex(
        (m) => m.id === this.currentMap.id
      );

      this.store.setGameStatus(GameStatus.BONUS_SCREEN);

      setTimeout(() => {
        if (currentIndex < mapDefinitions.length - 1) {
          // Not last map: go to countdown for next map
          this.switchToMap(mapDefinitions[currentIndex + 1].id);
        } else {
          // Last map: go to game over
          this.store.setGameStatus(GameStatus.GAME_OVER);
        }
      }, 3000);
    }
  }

  private calculateFinalBonus() {
    const correctOrderCount = this.store.getState().correctOrderCount;
    const bonus = this.scoringSystem.calculateEndLevelBonus(correctOrderCount);
    this.store.updateBonus(bonus);
  }

  public render() {
    this.renderer.render(
      this.currentMap,
      this.platforms,
      this.bombs,
      this.monsters,
      this.player,
      this.specialCoins
    );
  }
}
