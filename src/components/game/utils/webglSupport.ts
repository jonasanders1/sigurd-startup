/**
 * WebGL Support Detection and Fallback Utilities
 */

export interface WebGLSupportResult {
  supported: boolean;
  version: 'webgl2' | 'webgl' | 'none';
  error?: string;
}

/**
 * Detect WebGL support in the current browser
 */
export function detectWebGLSupport(): WebGLSupportResult {
  try {
    const canvas = document.createElement('canvas');
    
    // Try WebGL 2 first
    const gl2 = canvas.getContext('webgl2');
    if (gl2) {
      return { supported: true, version: 'webgl2' };
    }
    
    // Fall back to WebGL 1
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      return { supported: true, version: 'webgl' };
    }
    
    return { 
      supported: false, 
      version: 'none',
      error: 'WebGL is not supported in this browser'
    };
  } catch (e) {
    return { 
      supported: false, 
      version: 'none',
      error: `WebGL detection failed: ${e instanceof Error ? e.message : 'Unknown error'}`
    };
  }
}

/**
 * Check if the current environment supports WebGL
 * and log appropriate warnings
 */
export function ensureWebGLSupport(): boolean {
  const result = detectWebGLSupport();
  
  if (!result.supported) {
    console.warn('WebGL is not supported:', result.error);
    console.info('Falling back to Canvas 2D renderer');
    
    // Check if we're in a headless environment
    if (typeof window === 'undefined' || !window.navigator) {
      console.warn('Running in a headless environment');
    }
    
    // Check for specific browser issues
    const userAgent = window.navigator?.userAgent || '';
    if (userAgent.includes('SwiftShader')) {
      console.warn('SwiftShader detected - WebGL may have limited performance');
    }
  } else {
    console.info(`WebGL ${result.version} is supported`);
  }
  
  return result.supported;
}

/**
 * Safe Kaplay initialization with WebGL fallback
 */
export async function initializeKaplayWithFallback(config?: any) {
  try {
    // Dynamic import to prevent errors if Kaplay is not available
    const kaplayModule = await import('kaplay');
    const kaplay = kaplayModule.default;
    
    // Check WebGL support
    const webglSupport = detectWebGLSupport();
    
    // Initialize Kaplay with appropriate config
    const k = kaplay({
      ...config,
      // Force Canvas 2D if WebGL is not supported
      canvas: config?.canvas,
      crisp: true,
      // Disable WebGL features if not supported
      ...(webglSupport.supported ? {} : {
        gl: {
          // Disable WebGL-specific features
          preserveDrawingBuffer: false,
        }
      })
    });
    
    return k;
  } catch (error) {
    console.error('Failed to initialize Kaplay:', error);
    throw new Error('Kaplay initialization failed');
  }
}