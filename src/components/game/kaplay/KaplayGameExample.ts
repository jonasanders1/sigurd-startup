import kaplay from "kaplay";

// Simple Kaplay game example
export function createKaplayGame(canvas: HTMLCanvasElement) {
  // Initialize Kaplay
  const k = kaplay({
    canvas: canvas,
    width: 800,
    height: 600,
    background: [0, 0, 0],
    crisp: true,
  });

  // Load assets
//   k.loadRoot("/src/assets/");
//   k.loadSprite("player", "sigurd.png");
//   k.loadSprite("coffee", "coffee.png");
//   k.loadSound("jump", "sounds/power-up.mp3");
//   k.loadSound("gameover", "sounds/game-over.mp3");

  // Game constants
  const JUMP_FORCE = 400;
  const PLAYER_SPEED = 200;
  const GRAVITY = 980;

  // Create game scene
  k.scene("game", () => {
    // Set gravity
    k.setGravity(GRAVITY);

    // Create player (green rectangle instead of sprite)
    const player = k.add([
      k.rect(32, 32),
      k.pos(100, 300),
      k.area(),
      k.body(),
      k.color(0, 255, 0), // Green
      "player",
    ]);

    // Create platforms
    const platforms = [
      k.add([
        k.rect(200, 20),
        k.pos(300, 400),
        k.area(),
        k.body({ isStatic: true }),
        k.color(0.5, 0.5, 0.5),
        "platform",
      ]),
      k.add([
        k.rect(150, 20),
        k.pos(500, 300),
        k.area(),
        k.body({ isStatic: true }),
        k.color(0.5, 0.5, 0.5),
        "platform",
      ]),
      k.add([
        k.rect(800, 40),
        k.pos(0, 560),
        k.area(),
        k.body({ isStatic: true }),
        k.color(0.3, 0.3, 0.3),
        "ground",
      ]),
    ];

    // Create collectible bombs (red rectangles)
    const bombs = [
      k.add([
        k.rect(20, 20),
        k.pos(350, 370),
        k.area(),
        k.color(1, 0, 0), // Red
        "bomb",
        { collected: false },
      ]),
      k.add([
        k.rect(20, 20),
        k.pos(550, 270),
        k.area(),
        k.color(1, 0, 0), // Red
        "bomb",
        { collected: false },
      ]),
    ];

    // Create enemy (blue rectangle)
    const enemy = k.add([
      k.rect(30, 30),
      k.pos(400, 200),
      k.area(),
      k.body(),
      k.color(0, 0, 1), // Blue
      "enemy",
      { dir: 1, speed: 100 },
    ]);

    // Score display
    let score = 0;
    const scoreLabel = k.add([
      k.text(`Score: ${score}`, { size: 24 }),
      k.pos(10, 10),
      k.color(1, 1, 1),
    ]);

    // Player movement
    k.onKeyDown("left", () => {
      player.move(-PLAYER_SPEED, 0);
    });

    k.onKeyDown("right", () => {
      player.move(PLAYER_SPEED, 0);
    });

    k.onKeyPress("space", () => {
      if (player.isGrounded()) {
        player.jump(JUMP_FORCE);
      }
    });

    // Enemy patrol movement
    k.onUpdate(() => {
      enemy.move(enemy.speed * enemy.dir, 0);
      
      // Reverse direction at boundaries
      if (enemy.pos.x > 600 || enemy.pos.x < 200) {
        enemy.dir *= -1;
      }
    });

    // Collision handling
    player.onCollide("bomb", (bomb) => {
      if (!bomb.collected) {
        bomb.collected = true;
        k.destroy(bomb);
        score += 100;
        scoreLabel.text = `Score: ${score}`;
        
        // Check win condition
        const remainingBombs = k.get("bomb").filter(b => !b.collected);
        if (remainingBombs.length === 0) {
          k.add([
            k.text("Level Complete!", { size: 48 }),
            k.pos(k.width() / 2, k.height() / 2),
            k.anchor("center"),
            k.color(0, 1, 0),
          ]);
        }
      }
    });

    player.onCollide("enemy", () => {
      k.go("gameover", score);
    });

    // Keep player in bounds
    player.onUpdate(() => {
      if (player.pos.x < 0) player.pos.x = 0;
      if (player.pos.x > k.width()) player.pos.x = k.width();
    });
  });

  // Game over scene
  k.scene("gameover", (score) => {
    k.add([
      k.text(`Game Over!\nScore: ${score}`, { size: 48 }),
      k.pos(k.width() / 2, k.height() / 2),
      k.anchor("center"),
      k.color(1, 0, 0),
    ]);

    k.add([
      k.text("Press SPACE to restart", { size: 24 }),
      k.pos(k.width() / 2, k.height() / 2 + 100),
      k.anchor("center"),
      k.color(1, 1, 1),
    ]);

    k.onKeyPress("space", () => {
      k.go("game");
    });
  });

  // Start the game
  k.go("game");

  return k;
}