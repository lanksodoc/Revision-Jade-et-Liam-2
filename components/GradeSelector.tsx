
import React from 'react';
import { Grade } from '../types';

interface GradeSelectorProps {
  onSelect: (grade: Grade) => void;
}

export const GradeSelector: React.FC<GradeSelectorProps> = ({ onSelect }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 animate-fadeIn">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Bienvenue, jeune Champion !</h2>
      <p className="text-lg text-blue-200 text-center max-w-lg">Choisis ta classe pour commencer l'aventure et tester tes connaissances.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        <button
          onClick={() => onSelect(Grade.CE1)}
          className="group relative overflow-hidden p-8 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-yellow-500/20 flex flex-col items-center gap-4"
        >
          <span className="text-6xl group-hover:animate-bounce">🎒</span>
          <span className="text-3xl font-black text-indigo-900 uppercase">Niveau CE1</span>
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        <button
          onClick={() => onSelect(Grade.CM2)}
          className="group relative overflow-hidden p-8 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-blue-500/20 flex flex-col items-center gap-4"
        >
          <span className="text-6xl group-hover:animate-bounce">🎓</span>
          <span className="text-3xl font-black text-white uppercase">Niveau CM2</span>
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </div>
  );
};
