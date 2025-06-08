import { Player, Bomb } from "@/components/types/GameEngine";
import { Monster } from "@/components/types/Monster";
import { MapDefinition } from "../../config/MapDefinitions";
import { GameStatus, GameStore } from "@/components/types/Game";
import { ScoringSystem } from "../systems/ScoringSystem";

export class CollisionDetection {
  private scoringSystem: ScoringSystem;

  // Constants for scoring multipliers
  private readonly WRONG_GROUP_PENALTY = 0.2; // 20% of normal bomb score
  private readonly WRONG_ORDER_PENALTY = 0.3; // 30% of normal bomb score
  private readonly OUTSIDE_GROUP_PENALTY = 0.5; // 50% of normal bomb score

  constructor(store: GameStore) {
    this.scoringSystem = new ScoringSystem(store);
  }

  // Collision detection methods
  public checkBombCollisions(
    player: Player,
    bombs: Bomb[],
    store: GameStore,
    currentMap: MapDefinition
  ) {
    bombs.forEach((bomb) => {
      if (!bomb.collected && this.isColliding(player, bomb)) {
        this.handleBombCollection(bomb, bombs, store, currentMap);
      }
    });
  }

  public checkMonsterCollisions(
    player: Player,
    monsters: Monster[],
    map: MapDefinition,
    store: GameStore,
    pCoinColorIndex: number
  ) {
    monsters.forEach((monster) => {
      if (this.isColliding(player, monster)) {
        this.handleMonsterCollision(
          player,
          monster,
          map,
          store,
          pCoinColorIndex
        );
      }
    });
  }

  // Helper methods
  private handleBombCollection(
    bomb: Bomb,
    allBombs: Bomb[],
    store: GameStore,
    currentMap: MapDefinition
  ) {
    const state = store.getState();
    bomb.collected = true;

    // Get the next group in sequence that should be active
    const nextGroupInSequence = currentMap.groupSequence.find(
      (group) => !state.completedGroups.includes(group)
    );

    // Group-based collection logic with strict order within groups
    let newActiveGroup = state.currentActiveGroup;
    const newCompletedGroups = [...state.completedGroups];
    let newCorrectOrderCount = state.correctOrderCount;

    // If no active group, only allow collection from the next group in sequence
    if (newActiveGroup === null) {
      if (bomb.group === nextGroupInSequence) {
        newActiveGroup = bomb.group;
        store.setActiveGroup(bomb.group);
        console.log(`Started group ${bomb.group} with bomb ${bomb.order}`);
      } else {
        // Penalty for trying to collect from wrong group
        const scoreToAdd =
          this.scoringSystem.scoreNormalBomb() * this.WRONG_GROUP_PENALTY;
        store.updateScore(scoreToAdd, state.score);
        console.log(
          `Wrong group! Must complete group ${nextGroupInSequence} first. +${scoreToAdd} kr`
        );
        return;
      }
    }

    // Check if bomb is in the current active group
    const isInActiveGroup = bomb.group === newActiveGroup;

    // Find bombs in the same group
    const groupBombs = allBombs.filter((b) => b.group === bomb.group);
    const collectedInGroup = groupBombs.filter((b) => b.collected).length;

    let scoreToAdd: number;

    if (isInActiveGroup) {
      // Find the expected next bomb in the group sequence
      const uncollectedGroupBombs = groupBombs.filter(
        (b) => !b.collected && b !== bomb
      );
      const collectedGroupBombs = groupBombs.filter(
        (b) => b.collected && b !== bomb
      );

      // The next expected bomb should be the lowest order number among uncollected bombs
      // OR if this is the first bomb, it can be any bomb in the group
      const isFirstBombInGroup = collectedGroupBombs.length === 0;
      const expectedNextOrder = isFirstBombInGroup
        ? bomb.order // Any bomb can be first
        : Math.min(...uncollectedGroupBombs.map((b) => b.order), bomb.order);

      if (bomb.order === expectedNextOrder || isFirstBombInGroup) {
        scoreToAdd = this.scoringSystem.scoreFireBomb(); // Double points for correct order
        newCorrectOrderCount++;
        store.incrementCorrectOrder();
        console.log(
          `Correct group order! Bomb ${bomb.order} in group ${bomb.group}. +${scoreToAdd} kr`
        );
      } else {
        // Wrong order within the active group - penalty
        scoreToAdd =
          this.scoringSystem.scoreNormalBomb() * this.WRONG_ORDER_PENALTY;
        console.log(
          `Wrong order in group ${bomb.group}! Expected bomb ${expectedNextOrder}, got ${bomb.order}. +${scoreToAdd} kr`
        );
      }
    } else {
      // Penalty for collecting bomb outside active group
      scoreToAdd =
        this.scoringSystem.scoreNormalBomb() * this.OUTSIDE_GROUP_PENALTY;
      console.log(
        `Wrong group! Bomb ${bomb.order} (group ${bomb.group}) while working on group ${newActiveGroup}. +${scoreToAdd} kr`
      );
    }

    // Add bomb to collected list
    store.addBombCollected({
      order: bomb.order,
      group: bomb.group,
      score: scoreToAdd,
    });

    // Check if group is completed
    if (collectedInGroup === groupBombs.length) {
      newCompletedGroups.push(bomb.group);
      store.addCompletedGroup(bomb.group);
      store.setActiveGroup(null); // Reset active group so next group in sequence becomes available
      console.log(
        `Group ${bomb.group} completed! Moving to next group in sequence.`
      );
    }

    // Update store with new state
    store.updateScore(scoreToAdd, state.score);
    store.updateBombHighlighting();
  }

  private handleMonsterCollision(
    player: Player,
    monster: Monster,
    map: MapDefinition,
    store: GameStore,
    pCoinColorIndex: number
  ) {
    const state = store.getState();

    // If P coin power mode is active, convert monster to points instead of damage
    if (state.pCoinActive) {
      const scoreToAdd = this.scoringSystem.scoreMonsterKill(pCoinColorIndex);
      console.log(`Monster converted to ${scoreToAdd} kr during power mode!`);
      store.updateScore(scoreToAdd, state.score);
    } else {
      // Normal collision - lose life
      console.log(
        `Hit by ${monster.type}! Lives remaining: ${Math.max(
          0,
          state.lives - 1
        )}`
      );

      // Reset player position to start
      player.x = map.playerStartX;
      player.y = map.playerStartY;
      player.velocityX = 0;
      player.velocityY = 0;

      // Reset correct order count and lose life
      store.setCorrectOrderCount(state.correctOrderCount - 1);
      store.loseLife();

      if (state.lives <= 1) {
        store.setGameStatus(GameStatus.GAME_OVER);
      }
    }
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
}
