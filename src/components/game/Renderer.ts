import { Player, Bomb, Monster, Platform, SpecialCoin } from "./GameEngine";
import { MapDefinition } from "./MapDefinitions";

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;

    // Set default text rendering settings
    this.ctx.textBaseline = "middle";
    this.ctx.textRendering = "geometricPrecision";
  }

  public render(
    currentMap: MapDefinition,
    platforms: Platform[],
    bombs: Bomb[],
    monsters: Monster[],
    player: Player,
    specialCoins: SpecialCoin[]
  ): void {
    // Clear canvas with map background color
    this.ctx.fillStyle = currentMap.backgroundColor;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw map title in background
    // this.renderMapTitle(currentMap.id);

    // Draw platforms
    this.renderPlatforms(platforms);

    // Draw bombs
    this.renderBombs(bombs);

    // Draw special coins
    this.renderSpecialCoins(specialCoins);

    // Draw monsters
    this.renderMonsters(monsters);

    // Draw player
    this.renderPlayer(player);
  }

  // private renderMapTitle(title: string): void {
  //   // Save current context state
  //   this.ctx.save();

  //   // Set up the title style
  //   this.ctx.fillStyle = "#1a2336"; // Light gray with 30% opacity
  //   this.ctx.font = "bold 48px Arial";
  //   this.ctx.textAlign = "left";
  //   this.ctx.textBaseline = "top";

  //   // Position in top left corner with some padding
  //   const x = 20;
  //   const y = 20;

  //   // Draw the title in uppercase
  //   this.ctx.fillText(title.toUpperCase(), x, y);

  //   // Restore context state
  //   this.ctx.restore();
  // }

  private renderPlatforms(platforms: Platform[]): void {
    this.ctx.fillStyle = "#475569";
    platforms.forEach((platform) => {
      this.ctx.fillRect(
        platform.x,
        platform.y,
        platform.width,
        platform.height
      );
    });
  }

  private renderBombs(bombs: Bomb[]): void {
    bombs.forEach((bomb) => {
      if (!bomb.collected) {
        // Set bomb color based on group status
        if (bomb.isCorrectNext) {
          this.ctx.fillStyle = "#FFD700"; // Gold for next correct bomb
          this.ctx.shadowColor = "#FFD700";
          this.ctx.shadowBlur = 15;
        } else if (bomb.isInActiveGroup) {
          this.ctx.fillStyle = "#FFA500"; // Orange for bombs in active group
          this.ctx.shadowColor = "#FFA500";
          this.ctx.shadowBlur = 10;
        } else {
          this.ctx.fillStyle = "#FF4444"; // Red for other bombs
          this.ctx.shadowColor = "#FF4444";
          this.ctx.shadowBlur = 5;
        }

        // Draw bomb body
        this.ctx.fillRect(bomb.x, bomb.y, bomb.width, bomb.height);

        // Draw bomb details (fuse)
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = "#8B4513"; // Brown fuse
        this.ctx.fillRect(bomb.x + bomb.width / 2 - 1, bomb.y - 4, 2, 6);

        // Draw order number on bomb
        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.font = "bold 10px Arial";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(
          bomb.order.toString(),
          bomb.x + bomb.width / 2,
          bomb.y + bomb.height / 2
        );

        // Draw group number below bomb
        this.ctx.fillStyle = "#CCCCCC";
        this.ctx.font = "bold 8px Arial";
        this.ctx.textBaseline = "top";
        this.ctx.fillText(
          `G${bomb.group}`,
          bomb.x + bomb.width / 2,
          bomb.y + bomb.height + 4
        );
      }
    });
    this.ctx.shadowBlur = 0;
  }

  private renderSpecialCoins(specialCoins: SpecialCoin[]): void {
    specialCoins.forEach((coin) => {
      if (!coin.collected) {
        // Add glow effect
        this.ctx.shadowColor = coin.color;
        this.ctx.shadowBlur = 10;

        // Draw coin
        this.ctx.fillStyle = coin.color;
        this.ctx.beginPath();
        this.ctx.arc(
          coin.x + coin.width / 2,
          coin.y + coin.height / 2,
          coin.width / 2,
          0,
          2 * Math.PI
        );
        this.ctx.fill();

        // Draw coin letter
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = "#000000";
        this.ctx.font = "bold 14px Arial";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(
          coin.type,
          coin.x + coin.width / 2,
          coin.y + coin.height / 2
        );

        // Show value for P coins
        if (coin.type === "P" && coin.value) {
          this.ctx.fillStyle = "#FFFFFF";
          this.ctx.font = "bold 8px Arial";
          this.ctx.textBaseline = "bottom";
          this.ctx.fillText(
            coin.value.toString(),
            coin.x + coin.width / 2,
            coin.y - 2
          );
        }
      }
    });
    this.ctx.shadowBlur = 0;
  }

  private renderMonsters(monsters: Monster[]): void {
    monsters.forEach((monster) => {
      this.ctx.fillStyle = monster.color;
      this.ctx.fillRect(monster.x, monster.y, monster.width, monster.height);

      // Add monster details based on type
      this.ctx.fillStyle = "#000000";
      if (monster.type === "bureaucrat") {
        // Draw briefcase
        this.ctx.fillRect(monster.x + 18, monster.y + 20, 8, 6);
      } else if (monster.type === "taxman") {
        // Draw calculator
        this.ctx.fillRect(monster.x + 16, monster.y + 18, 10, 8);
      } else if (monster.type === "regulator") {
        // Draw clipboard
        this.ctx.fillRect(monster.x + 17, monster.y + 16, 8, 10);
      }
    });
  }

  private renderPlayer(player: Player): void {
    this.ctx.fillStyle = player.color;
    this.ctx.fillRect(player.x, player.y, player.width, player.height);

    // Add player details (simple representation of Sigurd)
    this.ctx.fillStyle = "#FBBF24"; // Coffee cup
    this.ctx.fillRect(player.x + 22, player.y + 8, 6, 8);

    this.ctx.fillStyle = "#FFFFFF"; // Shirt
    this.ctx.fillRect(player.x + 8, player.y + 16, 16, 12);
  }
}
