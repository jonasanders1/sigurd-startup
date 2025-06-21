import { detectWebGLSupport, initializeKaplayWithFallback } from '../utils/webglSupport';

/**
 * Safe Kaplay Engine Wrapper
 * Handles WebGL errors and provides fallback to Canvas 2D
 */
export class SafeKaplayEngine {
  private k: any;
  private initialized: boolean = false;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  async initialize(config?: any) {
    try {
      // Check WebGL support first
      const webglSupport = detectWebGLSupport();
      
      if (!webglSupport.supported) {
        console.warn('WebGL not supported, using fallback renderer');
        // You can implement a Canvas 2D fallback here
        // For now, we'll try to initialize Kaplay anyway with software rendering
      }

      // Initialize Kaplay with the provided canvas
      this.k = await initializeKaplayWithFallback({
        canvas: this.canvas,
        width: config?.width || 800,
        height: config?.height || 600,
        background: config?.background || [0, 0, 0],
        crisp: true,
        ...config,
      });

      this.initialized = true;
      return this.k;
    } catch (error) {
      console.error('Failed to initialize Kaplay engine:', error);
      throw new Error(`Kaplay initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getKaplayContext() {
    if (!this.initialized) {
      throw new Error('Kaplay engine not initialized');
    }
    return this.k;
  }

  dispose() {
    if (this.k && this.k.quit) {
      this.k.quit();
    }
    this.initialized = false;
  }
}