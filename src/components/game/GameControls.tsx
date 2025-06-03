
import React from 'react';
import { Keyboard, ArrowUp, ArrowLeft, ArrowRight } from 'lucide-react';

export const GameControls: React.FC = () => {
  return (
    <div className="bg-slate-800 rounded-lg p-6 shadow-lg border border-slate-600 max-w-2xl">
      <div className="flex items-center gap-2 mb-4">
        <Keyboard className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Game Controls</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-700 rounded px-2 py-1">
            <ArrowLeft className="w-4 h-4 text-blue-400" />
            <span className="text-white ml-1">←</span>
          </div>
          <span className="text-slate-300">Move Left</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-700 rounded px-2 py-1">
            <ArrowRight className="w-4 h-4 text-blue-400" />
            <span className="text-white ml-1">→</span>
          </div>
          <span className="text-slate-300">Move Right</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-700 rounded px-2 py-1">
            <ArrowUp className="w-4 h-4 text-emerald-400" />
            <span className="text-white ml-1">↑ / SPACE</span>
          </div>
          <span className="text-slate-300">Jump</span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-600">
        <p className="text-slate-400 text-sm">
          <strong className="text-emerald-400">Objective:</strong> Collect all funding items while avoiding bureaucratic obstacles. 
          Each collectible gives you points - grab them all to complete the level!
        </p>
      </div>
    </div>
  );
};
