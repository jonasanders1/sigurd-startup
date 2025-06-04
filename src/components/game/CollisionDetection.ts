import { Player, Bomb, Monster } from './GameEngine';
import { MapDefinition } from './MapDefinitions';
import { GameStore } from '@/components/types/Game';

export class CollisionDetection {
  // Collision detection methods
  public checkBombCollisions(player: Player, bombs: Bomb[], store: GameStore) {
    bombs.forEach(bomb => {
      if (!bomb.collected && this.isColliding(player, bomb)) {
        this.handleBombCollection(bomb, bombs, store);
      }
    });
  }

  public checkMonsterCollisions(player: Player, monsters: Monster[], map: MapDefinition, store: GameStore) {
    monsters.forEach(monster => {
      if (this.isColliding(player, monster)) {
        this.handleMonsterCollision(player, monster, map, store);
      }
    });
  }

  // Helper methods
  private handleBombCollection(bomb: Bomb, allBombs: Bomb[], store: GameStore) {
    const state = store.getState();
    bomb.collected = true;

    // Group-based collection logic with strict order within groups
    let newActiveGroup = state.currentActiveGroup;
    const newCompletedGroups = [...state.completedGroups];
    let newCorrectOrderCount = state.correctOrderCount;
    
    // If no active group, set this bomb's group as active
    if (newActiveGroup === null) {
      newActiveGroup = bomb.group;
      store.setActiveGroup(bomb.group);
      console.log(`Started group ${bomb.group} with bomb ${bomb.order}`);
    }
    
    // Check if bomb is in the current active group
    const isInActiveGroup = bomb.group === newActiveGroup;
    
    // Find bombs in the same group
    const groupBombs = allBombs.filter(b => b.group === bomb.group);
    const collectedInGroup = groupBombs.filter(b => b.collected).length;
    
    // Base score for collecting a bomb
    const baseScore = 10;
    let multiplier = 1;
    
    if (isInActiveGroup) {
      // Find the expected next bomb in the group sequence
      const uncollectedGroupBombs = groupBombs.filter(b => !b.collected && b !== bomb);
      const collectedGroupBombs = groupBombs.filter(b => b.collected && b !== bomb);
      
      // The next expected bomb should be the lowest order number among uncollected bombs
      // OR if this is the first bomb, it can be any bomb in the group
      const isFirstBombInGroup = collectedGroupBombs.length === 0;
      const expectedNextOrder = isFirstBombInGroup ? 
        bomb.order : // Any bomb can be first
        Math.min(...uncollectedGroupBombs.map(b => b.order), bomb.order);
      
      if (bomb.order === expectedNextOrder || isFirstBombInGroup) {
        multiplier = 2; // Bonus for correct order within group
        newCorrectOrderCount++;
        store.incrementCorrectOrder();
        console.log(`Correct group order! Bomb ${bomb.order} in group ${bomb.group}. +${baseScore * multiplier * state.efficiencyMultiplier} kr`);
      } else {
        // Wrong order within the active group - penalty
        multiplier = 0.3;
        console.log(`Wrong order in group ${bomb.group}! Expected bomb ${expectedNextOrder}, got ${bomb.order}. +${baseScore * multiplier * state.efficiencyMultiplier} kr`);
      }
    } else {
      // Penalty for collecting bomb outside active group
      multiplier = 0.5;
      console.log(`Wrong group! Bomb ${bomb.order} (group ${bomb.group}) while working on group ${newActiveGroup}. +${baseScore * multiplier * state.efficiencyMultiplier} kr`);
    }
    
    const scoreToAdd = baseScore * multiplier * state.efficiencyMultiplier;
    
    // Add bomb to collected list
    store.addBombCollected({
      order: bomb.order,
      group: bomb.group,
      score: scoreToAdd
    });
    
    // Check if group is completed
    if (collectedInGroup === groupBombs.length) {
      newCompletedGroups.push(bomb.group);
      store.addCompletedGroup(bomb.group);
      store.setActiveGroup(null); // Reset active group so player can choose next
      console.log(`Group ${bomb.group} completed! Choose your next group.`);
    }

    // Update store with new state
    store.updateScore(scoreToAdd);
    store.updateBombHighlighting();
  }

  private handleMonsterCollision(player: Player, monster: Monster, map: MapDefinition, store: GameStore) {
    const state = store.getState();
    
    // If P coin power mode is active, convert monster to points instead of damage
    if (state.pCoinActive) {
      const pointValue = 500 * state.efficiencyMultiplier;
      console.log(`Monster converted to ${pointValue} kr during power mode!`);
      store.updateScore(pointValue);
    } else {
      // Normal collision - lose life
      console.log(`Hit by ${monster.type}! Lives remaining: ${Math.max(0, state.lives - 1)}`);
      
      // Reset player position to start
      player.x = map.playerStartX;
      player.y = map.playerStartY;
      player.velocityX = 0;
      player.velocityY = 0;
      
      store.loseLife();
      if (state.lives <= 1) {
        store.setGameStatus('gameOver');
      }
    }
  }

  private isColliding(rect1: { x: number; y: number; width: number; height: number }, rect2: { x: number; y: number; width: number; height: number }): boolean {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  }
}
