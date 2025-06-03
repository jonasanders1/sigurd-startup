import { Player, Bomb, Monster, GameState } from './GameEngine';
import { MapDefinition } from './MapDefinitions';

export class CollisionDetection {
  public checkBombCollisions(
    player: Player, 
    bombs: Bomb[], 
    setGameState: React.Dispatch<React.SetStateAction<GameState>>
  ): void {
    bombs.forEach(bomb => {
      if (!bomb.collected && this.isColliding(player, bomb)) {
        bomb.collected = true;
        
        setGameState(prev => {
          // Group-based collection logic with strict order within groups
          let newActiveGroup = prev.currentActiveGroup;
          const newCompletedGroups = [...prev.completedGroups];
          let newCorrectOrderCount = prev.correctOrderCount;
          
          // If no active group, set this bomb's group as active
          if (newActiveGroup === null) {
            newActiveGroup = bomb.group;
            console.log(`Started group ${bomb.group} with bomb ${bomb.order}`);
          }
          
          // Check if bomb is in the current active group
          const isInActiveGroup = bomb.group === newActiveGroup;
          
          // Find bombs in the same group
          const groupBombs = bombs.filter(b => b.group === bomb.group);
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
              console.log(`Correct group order! Bomb ${bomb.order} in group ${bomb.group}. +${baseScore * multiplier * prev.efficiencyMultiplier} kr`);
            } else {
              // Wrong order within the active group - penalty
              multiplier = 0.3;
              console.log(`Wrong order in group ${bomb.group}! Expected bomb ${expectedNextOrder}, got ${bomb.order}. +${baseScore * multiplier * prev.efficiencyMultiplier} kr`);
            }
          } else {
            // Penalty for collecting bomb outside active group
            multiplier = 0.5;
            console.log(`Wrong group! Bomb ${bomb.order} (group ${bomb.group}) while working on group ${newActiveGroup}. +${baseScore * multiplier * prev.efficiencyMultiplier} kr`);
          }
          
          const scoreToAdd = baseScore * multiplier * prev.efficiencyMultiplier;
          
          // Check if group is completed
          if (collectedInGroup === groupBombs.length) {
            newCompletedGroups.push(bomb.group);
            newActiveGroup = null; // Reset active group so player can choose next
            console.log(`Group ${bomb.group} completed! Choose your next group.`);
          }
          
          return {
            ...prev,
            score: prev.score + scoreToAdd,
            bombsCollected: [...prev.bombsCollected, bomb.order],
            correctOrderCount: newCorrectOrderCount,
            currentActiveGroup: newActiveGroup,
            completedGroups: newCompletedGroups
          };
        });
      }
    });
  }

  public checkMonsterCollisions(
    player: Player, 
    monsters: Monster[], 
    currentMap: MapDefinition,
    setGameState: React.Dispatch<React.SetStateAction<GameState>>
  ): void {
    monsters.forEach(monster => {
      if (this.isColliding(player, monster)) {
        setGameState(prev => {
          // If P coin power mode is active, convert monster to points instead of damage
          if (prev.pCoinActive) {
            const pointValue = 500 * prev.efficiencyMultiplier;
            console.log(`Monster converted to ${pointValue} kr during power mode!`);
            return {
              ...prev,
              score: prev.score + pointValue
            };
          } else {
            // Normal collision - lose life
            console.log(`Hit by ${monster.type}! Lives remaining: ${Math.max(0, prev.lives - 1)}`);
            
            // Reset player position to start
            player.x = currentMap.playerStartX;
            player.y = currentMap.playerStartY;
            player.velocityX = 0;
            player.velocityY = 0;
            
            return {
              ...prev,
              lives: prev.lives - 1,
              gameStatus: prev.lives <= 1 ? 'gameOver' : prev.gameStatus
            };
          }
        });
      }
    });
  }

  private isColliding(rect1: { x: number; y: number; width: number; height: number }, rect2: { x: number; y: number; width: number; height: number }): boolean {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  }
}
