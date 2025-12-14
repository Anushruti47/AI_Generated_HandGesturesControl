export enum ParticleShape {
  SPHERE = 'SPHERE',
  CUBE = 'CUBE',
  HEART = 'HEART',
  FLOWER = 'FLOWER',
  SATURN = 'SATURN',
  DNA = 'DNA',
  VORTEX = 'VORTEX'
}

export interface ParticleConfig {
  shape: ParticleShape;
  colorPrimary: string;
  colorSecondary: string;
  particleCount: number;
  particleSize: number;
  chaos: number; // 0 to 1
  speed: number;
  expansion: number;
}

export interface HandData {
  x: number; // -1 to 1
  y: number; // -1 to 1
  z: number; // depth/presence
  pinched: boolean; // thumb and index touching
  detected: boolean;
}

// Gemini Response Schema
export interface SystemAnomaly {
  name: string;
  description: string;
  config: Partial<ParticleConfig>;
}

// Fix for React Three Fiber intrinsic elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      points: any;
      bufferGeometry: any;
      bufferAttribute: any;
      pointsMaterial: any;
      ambientLight: any;
      pointLight: any;
      color: any;
      fog: any;
    }
  }
}