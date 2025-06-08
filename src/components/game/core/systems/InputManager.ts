export class InputManager {
  private keys: { [key: string]: boolean } = {};

  constructor() {
    this.setupControls();
  }

  /**
   * Setup keyboard event listeners
   */
  private setupControls(): void {
    const validKeys = [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "Space",
      "KeyW",
      "KeyA",
      "KeyS",
      "KeyD",
    ];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (validKeys.includes(e.code)) {
        e.preventDefault();
        this.keys[e.code] = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (validKeys.includes(e.code)) {
        e.preventDefault();
        this.keys[e.code] = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
  }

  /**
   * Get current key states
   */
  public getKeys(): { [key: string]: boolean } {
    return this.keys;
  }

  /**
   * Check if a specific key is pressed
   */
  public isKeyPressed(key: string): boolean {
    return this.keys[key] || false;
  }
} 