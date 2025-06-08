import { Bomb } from "../../../types/GameEngine";
import { MapDefinition } from "../../config/MapDefinitions";
import { useGameStore } from "@/components/stores/useGameStore";

export class BombManager {
  private bombs: Bomb[] = [];
  private store: ReturnType<typeof useGameStore.getState>;
  private config: {
    bombSize: { width: number; height: number };
  };

  constructor(
    store: ReturnType<typeof useGameStore.getState>,
    config: { bombSize: { width: number; height: number } }
  ) {
    this.store = store;
    this.config = config;
  }

  /**
   * Initialize bombs from map definition
   */
  public initializeFromMap(mapDef: MapDefinition): void {
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
   * Update bomb highlighting based on game state
   */
  public updateHighlighting(): void {
    const state = this.store.getState();
    const activeGroup = state.currentActiveGroup;
    const completedGroups = state.completedGroups;

    // Reset all highlighting
    this.resetHighlighting();

    // Get next group in sequence
    const nextGroupInSequence = this.getNextGroupInSequence(completedGroups);

    if (activeGroup === null) {
      this.highlightNextGroupStart(nextGroupInSequence);
    } else {
      this.highlightActiveGroup(activeGroup);
    }
  }

  /**
   * Get next group in sequence that hasn't been completed
   */
  private getNextGroupInSequence(completedGroups: number[]): number | undefined {
    return this.bombs[0]?.group
      ? this.bombs[0].group
      : undefined;
  }

  /**
   * Reset all bomb highlighting
   */
  private resetHighlighting(): void {
    this.bombs.forEach((bomb) => {
      bomb.isCorrectNext = false;
      bomb.isInActiveGroup = false;
    });
  }

  /**
   * Highlight the first bomb of the next group in sequence
   */
  private highlightNextGroupStart(nextGroupInSequence: number | undefined): void {
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
   * Check if all bombs are collected
   */
  public areAllBombsCollected(): boolean {
    return this.bombs.every((b) => b.collected);
  }

  /**
   * Get all bombs
   */
  public getBombs(): Bomb[] {
    return this.bombs;
  }

  /**
   * Reset bombs
   */
  public reset(): void {
    this.bombs = [];
  }
} 