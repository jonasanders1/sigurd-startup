import { MapDefinition, getMapById, mapDefinitions } from "./MapDefinitions";
import { Physics } from "./Physics";
import { CollisionDetection } from "./CollisionDetection";
import { Renderer } from "./Renderer";
import { useGameStore } from "@/components/stores/useGameStore";
import { BonusType, GameStatus } from "../types/Game";

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

  private currentMap: MapDefinition;
  private player: Player;
  private bombs: Bomb[];
  private monsters: Monster[];
  private platforms: Platform[];
  private specialCoins: SpecialCoin[];
  private keys: { [key: string]: boolean } = {};
  private jumpHoldTime = 0;
  private isJumpPressed = false;
  private pCoinColors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#C0C0C0"]; // Blue to Silver
  private pCoinColorIndex = 0;

  // Module instances
  private physics: Physics;
  private collisionDetection: CollisionDetection;
  private renderer: Renderer;

  constructor(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    store: ReturnType<typeof useGameStore.getState>
  ) {
    this.width = width;
    this.height = height;
    this.store = store;

    // Initialize modules
    this.physics = new Physics();
    this.collisionDetection = new CollisionDetection();
    this.renderer = new Renderer(ctx, width, height);

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
    console.log("switchToMap - Current map:", this.currentMap.id, "Target map:", mapId);
    const newMap = getMapById(mapId);
    
    if (newMap) {
      console.log("Found new map, showing bonus screen");
      this.store.setGameStatus(GameStatus.BONUS_SCREEN);
      
      setTimeout(() => {
        console.log("Bonus screen timeout complete, loading new map");
        this.store.setGameStatus(GameStatus.PLAYING);
        this.store.updateScore(this.store.bonus, this.store.score);
        this.store.resetBonus();
        this.store.resetCorrectOrderCount();
        this.loadMap(newMap);
        console.log("New map loaded:", newMap.id);
      }, 3000);
    } else {
      console.error("Failed to find map:", mapId);
    }
  }

  public nextMap() {
    const currentIndex = mapDefinitions.findIndex(
      (m) => m.id === this.currentMap.id
    );
    console.log("nextMap - Current index:", currentIndex, "Current map:", this.currentMap.id);
    
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
      this.store.setGameStatus(GameStatus.GAME_OVER);
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
    this.isJumpPressed = false;
    this.jumpHoldTime = 0;
    this.pCoinColorIndex = 0;
    this.store.resetGame();
  }

  public update() {
    // Handle input and update player movement
    const jumpResult = this.physics.updatePlayerMovement(
      this.player,
      this.keys,
      this.jumpHoldTime
    );
    this.jumpHoldTime = jumpResult.newJumpHoldTime;
    const wasJumpPressed = this.isJumpPressed;
    this.isJumpPressed = this.keys["ArrowUp"] || this.keys["KeyW"];

    // Update P coin color when jumping or hitting walls
    if (this.isJumpPressed && !wasJumpPressed) {
      this.updatePCoinColor();
    }

    // Update player physics
    const playerPhysicsResult = this.physics.updatePlayerPhysics(
      this.player,
      this.platforms,
      this.width,
      this.height
    );
    if (playerPhysicsResult.hitWall) {
      this.updatePCoinColor();
    }

    // Update monsters
    this.updateMonsters();

    // Check collisions
    this.collisionDetection.checkBombCollisions(
      this.player,
      this.bombs,
      this.store
    );
    this.collisionDetection.checkMonsterCollisions(
      this.player,
      this.monsters,
      this.currentMap,
      this.store
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

    // Check for B coin spawning (every 5000 points)
    const shouldSpawnBCoin =
      Math.floor(state.score / 5000) > state.bCoinsCollected &&
      state.bCoinsCollected < 5 &&
      !this.specialCoins.some((c) => c.type === "B" && !c.collected);

    if (shouldSpawnBCoin) {
      this.spawnSpecialCoin("B");
    }

    // Check for E coin spawning (after 8 B coins, or earlier if player lost lives)
    const eCoinsNeeded = Math.max(1, 8 - (3 - state.lives));
    const shouldSpawnECoin =
      state.bCoinsCollected >= eCoinsNeeded &&
      !this.specialCoins.some((c) => c.type === "E" && !c.collected);

    if (shouldSpawnECoin) {
      this.spawnSpecialCoin("E");
    }

    // Check for P coin spawning (10 lit bombs OR 20 total bombs)
    const litBombs = this.bombs.filter((b) => b.collected && b.isCorrectNext)
      .length;
    const shouldSpawnPCoin =
      (litBombs >= 10 || state.bombsCollected.length >= 20) &&
      !this.specialCoins.some((c) => c.type === "P" && !c.collected);

    if (shouldSpawnPCoin) {
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

    this.bombs.forEach((bomb) => {
      // Reset highlighting
      bomb.isCorrectNext = false;
      bomb.isInActiveGroup = false;

      if (bomb.collected) return;

      // If no active group, player can start with any bomb from available groups
      if (activeGroup === null) {
        if (!completedGroups.includes(bomb.group)) {
          const groupBombs = this.bombs.filter(
            (b) => b.group === bomb.group && !b.collected
          );
          // Only highlight the first available bomb in each group
          const firstBombInGroup = groupBombs.reduce((min, current) =>
            current.order < min.order ? current : min
          );
          bomb.isCorrectNext = bomb.order === firstBombInGroup.order;
          bomb.isInActiveGroup = true;
        }
      }
      // If there's an active group, enforce strict sequential order within that group
      else if (
        bomb.group === activeGroup &&
        !completedGroups.includes(bomb.group)
      ) {
        bomb.isInActiveGroup = true;

        // Find the next bomb in strict sequence within this group
        const groupBombs = this.bombs.filter(
          (b) => b.group === activeGroup && !b.collected
        );
        if (groupBombs.length > 0) {
          const nextBomb = groupBombs.reduce((min, current) =>
            current.order < min.order ? current : min
          );
          bomb.isCorrectNext = bomb.order === nextBomb.order;
        }
      }
    });
  }

  private checkWinCondition() {
    const allCollected = this.bombs.every((b) => b.collected);
    if (allCollected) {
      console.log("All bombs collected, calculating bonus...");
      this.calculateFinalBonus();

      const currentIndex = mapDefinitions.findIndex(
        (m) => m.id === this.currentMap.id
      );
      console.log("Current map index:", currentIndex, "Current map:", this.currentMap.id);
      
      if (currentIndex < mapDefinitions.length - 1) {
        console.log("Moving to next map...");
        this.nextMap();
      } else {
        console.log("All maps completed!");
        this.store.setGameStatus(GameStatus.GAME_OVER);
      }
    }
  }

  private calculateFinalBonus() {
    const correctOrderCount = this.store.getState().correctOrderCount;

    if (correctOrderCount === 24) {
      this.store.updateBonus(BonusType.BIG);
    } else if (correctOrderCount === 23) {
      this.store.updateBonus(BonusType.MEDIUM);
    } else if (correctOrderCount === 22) {
      this.store.updateBonus(BonusType.SMALL);
    } else {
      this.store.updateBonus(0);
    }
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
