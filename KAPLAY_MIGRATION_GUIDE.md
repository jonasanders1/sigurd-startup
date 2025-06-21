# Kaplay Migration Guide

## Overview

Kaplay (formerly Kaboom.js) is a JavaScript game library that makes game development fun and easy. This guide will help you migrate your vanilla game engine to Kaplay.

## Key Differences

### 1. **Entity Component System**
- **Vanilla**: Manual object management with classes
- **Kaplay**: Component-based entities with built-in behaviors

```javascript
// Vanilla
this.player = {
  x: 100, y: 200,
  width: 32, height: 32,
  velocityX: 0, velocityY: 0
};

// Kaplay
const player = k.add([
  k.pos(100, 200),
  k.rect(32, 32),
  k.area(),
  k.body(),
  "player"
]);
```

### 2. **Physics**
- **Vanilla**: Custom physics implementation
- **Kaplay**: Built-in physics with gravity, collision detection

```javascript
// Kaplay automatically handles:
k.setGravity(980); // Set global gravity
player.jump(400); // Built-in jump with physics
player.isGrounded(); // Check if on ground
```

### 3. **Collision Detection**
- **Vanilla**: Manual AABB collision checks
- **Kaplay**: Event-based collision system

```javascript
// Kaplay collision handling
player.onCollide("enemy", (enemy) => {
  // Handle collision
});
```

### 4. **Input Handling**
- **Vanilla**: Manual keyboard event listeners
- **Kaplay**: Simplified input API

```javascript
k.onKeyDown("left", () => player.move(-200, 0));
k.onKeyPress("space", () => player.jump());
```

## Migration Steps

### Step 1: Initialize Kaplay

```javascript
const k = kaplay({
  canvas: canvasElement,
  width: 800,
  height: 600,
  background: [0, 0, 0],
});
```

### Step 2: Load Assets

```javascript
k.loadSprite("player", "/path/to/player.png");
k.loadSound("jump", "/path/to/jump.mp3");
```

### Step 3: Create Game Objects

Transform your existing objects into Kaplay entities:

```javascript
// Player
const player = k.add([
  k.sprite("player"), // or k.rect(width, height) for colored rectangles
  k.pos(x, y),
  k.area(), // Collision detection
  k.body(), // Physics
  k.scale(1),
  "player", // Tag for identification
  { 
    // Custom properties
    speed: 200,
    lives: 3
  }
]);

// Platform
const platform = k.add([
  k.rect(200, 20),
  k.pos(300, 400),
  k.area(),
  k.body({ isStatic: true }), // Static body doesn't move
  k.color(0.5, 0.5, 0.5),
  "platform"
]);
```

### Step 4: Implement Game Logic

```javascript
// Update loop
k.onUpdate(() => {
  // Game logic that runs every frame
});

// Collision handling
player.onCollide("bomb", (bomb) => {
  k.destroy(bomb);
  score += 100;
});

// Input handling
k.onKeyDown("left", () => {
  player.move(-playerSpeed, 0);
});
```

## Component Reference

### Core Components

1. **pos(x, y)** - Position
2. **rect(width, height)** - Rectangle shape
3. **sprite(name)** - Sprite graphics
4. **area()** - Collision detection
5. **body()** - Physics body
6. **color(r, g, b)** - Color (values 0-1)
7. **scale(x, y)** - Scale factor
8. **rotate(angle)** - Rotation

### Physics Options

```javascript
k.body({
  jumpForce: 400,    // Jump strength
  isStatic: true,    // Doesn't move
  gravityScale: 0.5, // Gravity multiplier
});
```

## Tips for Migration

1. **Start Simple**: Create a basic prototype with Kaplay first
2. **Incremental Migration**: Migrate one system at a time
3. **Keep Game State**: Your existing store/state management can stay
4. **Reuse Logic**: Core game logic (scoring, level progression) can be reused
5. **Test Often**: Test each migrated feature before moving to the next

## Common Patterns

### Enemy Movement
```javascript
const enemy = k.add([/* components */]);
enemy.onUpdate(() => {
  enemy.move(enemy.speed * enemy.direction, 0);
  if (enemy.pos.x > rightBound || enemy.pos.x < leftBound) {
    enemy.direction *= -1;
  }
});
```

### Collectibles
```javascript
player.onCollide("coin", (coin) => {
  k.destroy(coin);
  score += coin.value;
  k.play("coinSound");
});
```

### Scene Management
```javascript
k.scene("game", () => {
  // Game scene setup
});

k.scene("menu", () => {
  // Menu scene setup
});

k.go("menu"); // Switch scenes
```

## Next Steps

1. Run the example game to see Kaplay in action
2. Start migrating your player and basic platforms
3. Add collision detection and physics
4. Implement your scoring and game state
5. Add special effects and polish

The provided `KaplayGameExample.ts` shows a working example with all basic features implemented.