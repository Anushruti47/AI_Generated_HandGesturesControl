import React, { useState, useCallback } from 'react';
import { Scene } from './components/Scene';
import { HandTracker } from './components/HandTracker';
import { ChatInterface } from './components/ChatInterface';
import { ParticleConfig, ParticleShape, HandData } from './types';

// Initial default state - Updated for Navy/Cyber aesthetic
const DEFAULT_CONFIG: ParticleConfig = {
  shape: ParticleShape.SPHERE,
  colorPrimary: '#3b82f6', // Bright Blue
  colorSecondary: '#2dd4bf', // Teal
  particleCount: 8000,
  particleSize: 0.15,
  chaos: 0.2,
  speed: 1,
  expansion: 1
};

export default function App() {
  const [config, setConfig] = useState<ParticleConfig>(DEFAULT_CONFIG);
  const [systemName, setSystemName] = useState('NAVY_CORE_V1');
  const [handData, setHandData] = useState<HandData>({
    x: 0,
    y: 0,
    z: 0,
    pinched: false,
    detected: false
  });

  const handleHandUpdate = useCallback((data: HandData) => {
    setHandData(data);
  }, []);

  const handleConfigChange = (newConfig: ParticleConfig, name: string) => {
    setConfig(newConfig);
    setSystemName(name);
  };

  return (
    <div className="relative w-full h-screen bg-[#020617] overflow-hidden select-none">
      
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-10">
        <Scene config={config} handData={handData} />
      </div>

      {/* UI Layer */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {/* Header */}
        <div className="absolute top-4 left-4 p-4 border-l-4 border-blue-500 bg-slate-900/60 backdrop-blur-md shadow-lg shadow-blue-900/20">
          <h1 className="text-3xl text-blue-400 font-bold font-['Press_Start_2P'] tracking-tighter drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]">
            NEURO_GLITCH
          </h1>
          <div className="text-slate-400 font-mono text-sm mt-2 flex flex-col gap-1">
            <span className="text-blue-200">SYSTEM: {systemName}</span>
            <span>PARTICLES: {config.particleCount}</span>
            <span>CHAOS_LEVEL: {(config.chaos * 100).toFixed(0)}%</span>
            <span>HAND_TRACKING: {handData.detected ? <span className="text-green-400">ONLINE</span> : <span className="animate-pulse text-yellow-500">SEARCHING...</span>}</span>
          </div>
        </div>

        {/* Hand Status Indicator */}
        {handData.detected && (
          <div 
            className="absolute w-8 h-8 border-2 border-blue-400 rounded-full transition-all duration-75 ease-linear pointer-events-none mix-blend-screen"
            style={{
              left: `${(handData.x / 2 + 0.5) * 100}%`,
              top: `${(handData.y / -2 + 0.5) * 100}%`,
              transform: `translate(-50%, -50%) scale(${handData.pinched ? 0.5 : 1.5})`,
              backgroundColor: handData.pinched ? '#3b82f6' : 'transparent',
              boxShadow: `0 0 ${handData.pinched ? '25px' : '10px'} #3b82f6`
            }}
          />
        )}
      </div>

      {/* Interactive Controls Layer */}
      <HandTracker onHandUpdate={handleHandUpdate} />
      <ChatInterface currentConfig={config} onConfigChange={handleConfigChange} />

      {/* Instructional Overlay (fades out) */}
      <div className="absolute bottom-8 right-8 text-right z-0 opacity-60 font-['VT323'] text-slate-500 pointer-events-none hidden md:block">
        <p className="text-blue-900/50 mb-2">/// COMMAND LIST ///</p>
        <p>1. SHOW HAND TO INTERACT</p>
        <p>2. PINCH TO ATTRACT</p>
        <p>3. OPEN PALM TO REPEL</p>
        <p>4. TYPE PROMPT TO MUTATE</p>
      </div>
    </div>
  );
}