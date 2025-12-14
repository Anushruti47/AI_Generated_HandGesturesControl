import React from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, Glitch, Noise, Vignette } from '@react-three/postprocessing';
import { Particles } from './Particles';
import { ParticleConfig, HandData } from '../types';
import { Vector2 } from 'three';

interface SceneProps {
  config: ParticleConfig;
  handData: HandData;
}

export const Scene: React.FC<SceneProps> = ({ config, handData }) => {
  return (
    <Canvas
      camera={{ position: [0, 0, 15], fov: 60 }}
      className="w-full h-full"
      gl={{ antialias: false, alpha: false }} // Performance tuning
    >
      {/* Deep Navy Background */}
      <color attach="background" args={['#020617']} />
      {/* Fog for depth and atmosphere */}
      <fog attach="fog" args={['#020617', 10, 35]} />
      
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#3b82f6" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#818cf8" />
      
      <Particles config={config} handData={handData} />

      {/* Post Processing for Glitch Aesthetics */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.2} 
          intensity={1.2} 
          radius={0.6} 
          mipmapBlur 
        />
        <Glitch 
          delay={new Vector2(3, 10)} // Min and max delay between glitches
          duration={new Vector2(0.1, 0.3)} // Duration of glitch
          strength={new Vector2(0.1, 0.2)} // Strength
          mode={1} // CONSTANT_MILD
          ratio={0.85}
          active // Toggle based on state if needed
        />
        <Noise opacity={0.05} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </Canvas>
  );
};