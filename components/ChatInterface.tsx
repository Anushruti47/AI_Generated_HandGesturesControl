import React, { useState } from 'react';
import { generateAnomaly } from '../services/gemini';
import { ParticleConfig, SystemAnomaly } from '../types';

interface ChatInterfaceProps {
  currentConfig: ParticleConfig;
  onConfigChange: (config: ParticleConfig, name: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ currentConfig, onConfigChange }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>(['> SYSTEM_READY', '> WAITING_FOR_INPUT...']);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    setLoading(true);
    const userCmd = input;
    setLogs(prev => [...prev.slice(-4), `> USER: ${userCmd}`, '> PROCESSING_ANOMALY...']);
    setInput('');

    try {
      const anomaly: SystemAnomaly = await generateAnomaly(userCmd, currentConfig);
      
      setLogs(prev => [...prev, `> CORE: ${anomaly.name}`, `> "${anomaly.description}"`]);
      
      const newConfig = { ...currentConfig, ...anomaly.config };
      onConfigChange(newConfig, anomaly.name);
    } catch (err) {
      setLogs(prev => [...prev, '> ERROR: CORE_UNRESPONSIVE']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute bottom-4 left-4 z-40 w-full max-w-md font-['VT323']">
      <div className="bg-slate-900/80 border border-blue-500/50 p-4 shadow-[0_0_20px_rgba(37,99,235,0.2)] backdrop-blur-md rounded-sm">
        {/* Logs */}
        <div className="h-32 overflow-y-auto mb-2 text-sm space-y-1 font-mono text-blue-300">
          {logs.map((log, i) => (
            <div key={i} className="opacity-90 animate-pulse-slow">{log}</div>
          ))}
          {loading && <div className="text-cyan-400 animate-bounce">...CALCULATING_TRAJECTORIES...</div>}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <span className="text-blue-500 self-center">{'>'}</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe new chaos pattern..."
            className="flex-1 bg-transparent border-b border-blue-500/50 text-cyan-300 focus:outline-none focus:border-cyan-400 placeholder-blue-900/50 font-['Press_Start_2P'] text-[10px] py-2"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="px-3 py-1 bg-blue-900/30 border border-blue-500 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors text-[10px] disabled:opacity-50"
          >
            EXECUTE
          </button>
        </form>
      </div>
    </div>
  );
};