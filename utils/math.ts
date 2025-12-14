import { Vector3 } from 'three';
import { ParticleShape } from '../types';

export const generatePositions = (shape: ParticleShape, count: number, radius: number = 5): Float32Array => {
  const positions = new Float32Array(count * 3);
  const vec = new Vector3();

  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.sqrt(count * Math.PI) * phi;
    
    // Default randomization
    let x = 0, y = 0, z = 0;

    switch (shape) {
      case ParticleShape.SPHERE: {
        x = radius * Math.sin(phi) * Math.cos(theta);
        y = radius * Math.sin(phi) * Math.sin(theta);
        z = radius * Math.cos(phi);
        break;
      }
      case ParticleShape.CUBE: {
        x = (Math.random() - 0.5) * radius * 2;
        y = (Math.random() - 0.5) * radius * 2;
        z = (Math.random() - 0.5) * radius * 2;
        break;
      }
      case ParticleShape.HEART: {
        // 3D Heart approximation
        const hPhi = Math.random() * Math.PI * 2;
        const hTheta = Math.random() * Math.PI;
        // x = 16sin^3(t)
        // y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
        // We'll distribute randomly inside a heart volume or surface
        // Simplified parametric surface
        const u = Math.random() * Math.PI * 2;
        const v = Math.random() * Math.PI;
        x = radius * 0.1 * 16 * Math.pow(Math.sin(u), 3) * Math.sin(v);
        y = radius * 0.1 * (13 * Math.cos(u) - 5 * Math.cos(2 * u) - 2 * Math.cos(3 * u) - Math.cos(4 * u)) * Math.sin(v);
        z = radius * 0.1 * Math.cos(v) * 8; // Flatten slightly
        break;
      }
      case ParticleShape.FLOWER: {
        const fU = (Math.random() * Math.PI * 2);
        const fV = (Math.random() * Math.PI);
        const petal = Math.cos(3 * fU);
        const r = radius * (1 + 0.5 * petal);
        x = r * Math.sin(fV) * Math.cos(fU);
        y = r * Math.sin(fV) * Math.sin(fU);
        z = r * Math.cos(fV) * 0.2; // Flat flower
        break;
      }
      case ParticleShape.SATURN: {
        // Mix of sphere and ring
        const isRing = Math.random() > 0.3;
        if (isRing) {
          const angle = Math.random() * Math.PI * 2;
          const dist = radius * (1.5 + Math.random() * 0.8);
          x = Math.cos(angle) * dist;
          z = Math.sin(angle) * dist;
          y = (Math.random() - 0.5) * 0.5; // Thin ring
        } else {
          x = radius * 0.6 * Math.sin(phi) * Math.cos(theta);
          y = radius * 0.6 * Math.sin(phi) * Math.sin(theta);
          z = radius * 0.6 * Math.cos(phi);
        }
        break;
      }
      case ParticleShape.DNA: {
        const dnaT = (i / count) * Math.PI * 10; // 5 turns
        const dnaR = radius * 0.5;
        const strand = i % 2 === 0 ? 1 : -1; // Two strands
        x = dnaR * Math.cos(dnaT + (strand * Math.PI));
        z = dnaR * Math.sin(dnaT + (strand * Math.PI));
        y = (i / count - 0.5) * radius * 3;
        break;
      }
      case ParticleShape.VORTEX: {
        const vT = (i / count) * Math.PI * 8;
        const vR = (i / count) * radius * 2;
        x = vR * Math.cos(vT);
        z = vR * Math.sin(vT);
        y = (i / count - 0.5) * radius * 2;
        break;
      }
      default: {
        x = (Math.random() - 0.5) * radius;
        y = (Math.random() - 0.5) * radius;
        z = (Math.random() - 0.5) * radius;
      }
    }

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }

  return positions;
};
