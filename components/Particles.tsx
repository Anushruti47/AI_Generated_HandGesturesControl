import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ParticleConfig, HandData } from '../types';
import { generatePositions } from '../utils/math';

interface ParticlesProps {
  config: ParticleConfig;
  handData: HandData;
}

export const Particles: React.FC<ParticlesProps> = ({ config, handData }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const { size, viewport } = useThree();
  
  // Buffers for animation
  // targetPositions: Where particles want to be based on shape
  // currentPositions: Where they actually are (physics)
  // velocities: For momentum
  
  const count = config.particleCount || 5000;
  
  // Generate target geometry based on shape
  const targetPositions = useMemo(() => {
    return generatePositions(config.shape, count, 5);
  }, [config.shape, count]);

  // Initial buffers
  // We initialize positions randomly to avoid everything starting at 0,0,0 which looks weird
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for(let i=0; i<arr.length; i++) {
      arr[i] = (Math.random() - 0.5) * 10;
    }
    return arr;
  }, [count]);

  const colors = useMemo(() => new Float32Array(count * 3), [count]);
  const velocities = useMemo(() => new Float32Array(count * 3), [count]);
  
  // Initialize colors based on config
  useEffect(() => {
    const c1 = new THREE.Color(config.colorPrimary);
    const c2 = new THREE.Color(config.colorSecondary);
    
    // We can update the colors buffer directly without re-allocating if count hasn't changed
    // But since this effect depends on count/colors, it runs when they change.
    // If count changes, 'colors' is a new array, so we fill it.
    
    for (let i = 0; i < count; i++) {
      const mix = Math.random();
      const c = mix > 0.5 ? c1 : c2;
      colors[i * 3] = c.r + (Math.random() - 0.5) * 0.2;
      colors[i * 3 + 1] = c.g + (Math.random() - 0.5) * 0.2;
      colors[i * 3 + 2] = c.b + (Math.random() - 0.5) * 0.2;
    }
    
    // If the points reference exists, we need to mark colors as needing update
    // This is vital for color changes that DON'T change particle count
    if (pointsRef.current) {
      pointsRef.current.geometry.attributes.color.needsUpdate = true;
    }
  }, [config.colorPrimary, config.colorSecondary, count, colors]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    
    const positionsAttr = pointsRef.current.geometry.attributes.position;
    const currentPos = positionsAttr.array as Float32Array;
    
    // Hand interaction params
    // Map hand -1..1 to viewport coords
    const handX = handData.x * (viewport.width / 2);
    const handY = handData.y * (viewport.height / 2);
    const isPinching = handData.pinched;
    const isDetected = handData.detected;

    const repulsionStrength = isDetected ? (isPinching ? -15 : 8) : 0; // Pinch attracts (neg repulsion), Open repels
    
    // Speed damping
    const damping = 0.95;
    const returnForce = 0.5 * config.speed; // How fast they seek shape
    
    // Time variable for noise
    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      
      // Target Position (Shape)
      const tx = targetPositions[idx];
      const ty = targetPositions[idx + 1];
      const tz = targetPositions[idx + 2];

      const cx = currentPos[idx];
      const cy = currentPos[idx + 1];
      const cz = currentPos[idx + 2];

      // Physics: Force towards target
      let fx = (tx - cx) * returnForce;
      let fy = (ty - cy) * returnForce;
      let fz = (tz - cz) * returnForce;

      // Chaos factor
      if (config.chaos > 0) {
        fx += Math.sin(time * 2 + i) * config.chaos * 2;
        fy += Math.cos(time * 1.5 + i) * config.chaos * 2;
        fz += Math.sin(time * 0.5 + i) * config.chaos * 2;
      }

      // Hand Interaction
      if (isDetected) {
        const dx = cx - handX;
        const dy = cy - handY;
        const dz = cz - 0; // Hand roughly at z=0
        const distSq = dx*dx + dy*dy + dz*dz;
        const dist = Math.sqrt(distSq);

        // Interaction Radius
        if (dist < 4) {
          const force = repulsionStrength / (dist + 0.1);
          fx += (dx / dist) * force * 10;
          fy += (dy / dist) * force * 10;
          fz += (dz / dist) * force * 10;
        }
      }

      // Integration
      velocities[idx] += fx * delta;
      velocities[idx + 1] += fy * delta;
      velocities[idx + 2] += fz * delta;

      velocities[idx] *= damping;
      velocities[idx + 1] *= damping;
      velocities[idx + 2] *= damping;

      currentPos[idx] += velocities[idx] * delta;
      currentPos[idx + 1] += velocities[idx + 1] * delta;
      currentPos[idx + 2] += velocities[idx + 2] * delta;
    }

    positionsAttr.needsUpdate = true;
    
    // Rotation
    pointsRef.current.rotation.y += delta * 0.05 * (1 + config.chaos);
  });

  return (
    // Key is crucial here: It forces React to destroy and recreate the Points instance
    // whenever the particle count changes. Three.js does not support resizing BufferAttributes
    // dynamically without complex memory management. Remounting is the safest cleaner way for R3F.
    <points ref={pointsRef} key={`particles-${count}`}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={config.particleSize}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
