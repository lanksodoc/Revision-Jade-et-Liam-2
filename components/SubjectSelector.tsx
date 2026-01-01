
import React from 'react';
import { Subject } from '../types';
import { SUBJECT_ICONS } from '../constants';

interface SubjectSelectorProps {
  onSelect: (subject: Subject) => void;
  onBack: () => void;
}

export const SubjectSelector: React.FC<SubjectSelectorProps> = ({ onSelect, onBack }) => {
  const subjects = [Subject.SVT, Subject.HISTORY, Subject.GEOGRAPHY, Subject.MATH];

  return (
    <div className="animate-slideUp">
      <button 
        onClick={onBack}
        className="mb-8 text-blue-300 hover:text-white flex items-center gap-2 transition-colors"
      >
        ← Changer de classe
      </button>

      <h2 className="text-3xl font-bold text-center mb-10">Quelle matière veux-tu réviser ?</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {subjects.map((subj) => (
          <button
            key={subj}
            onClick={() => onSelect(subj)}
            className="flex items-center gap-6 p-6 rounded-xl bg-white/10 border border-white/5 hover:bg-white/20 hover:border-white/20 transition-all group"
          >
            <div className="p-4 rounded-lg bg-indigo-500/30 group-hover:scale-110 transition-transform">
              {SUBJECT_ICONS[subj]}
            </div>
            <span className="text-2xl font-semibold">{subj}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
