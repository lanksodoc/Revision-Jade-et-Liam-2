
import React, { useState, useEffect } from 'react';
import { MatchingPair } from '../types';

interface MatchingExerciseProps {
  pairs: MatchingPair[];
  onComplete: (isCorrect: boolean) => void;
}

export const MatchingExercise: React.FC<MatchingExerciseProps> = ({ pairs, onComplete }) => {
  const [leftItems, setLeftItems] = useState<string[]>([]);
  const [rightItems, setRightItems] = useState<string[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [wrongMatch, setWrongMatch] = useState<string | null>(null);

  useEffect(() => {
    setLeftItems(pairs.map(p => p.left).sort(() => Math.random() - 0.5));
    setRightItems(pairs.map(p => p.right).sort(() => Math.random() - 0.5));
  }, [pairs]);

  const handleLeftClick = (item: string) => {
    if (matches[item]) return;
    setSelectedLeft(item);
  };

  const handleRightClick = (item: string) => {
    if (!selectedLeft) return;

    const correctPair = pairs.find(p => p.left === selectedLeft);
    if (correctPair && correctPair.right === item) {
      const newMatches = { ...matches, [selectedLeft]: item };
      setMatches(newMatches);
      setSelectedLeft(null);
      
      if (Object.keys(newMatches).length === pairs.length) {
        onComplete(true);
      }
    } else {
      setWrongMatch(item);
      setTimeout(() => setWrongMatch(null), 500);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-8 my-6">
      <div className="space-y-3">
        {leftItems.map(item => (
          <button
            key={item}
            onClick={() => handleLeftClick(item)}
            className={`w-full p-4 rounded-xl border-2 transition-all text-sm font-medium ${
              matches[item] 
                ? 'bg-green-500/20 border-green-500 opacity-50 cursor-default text-green-200' 
                : selectedLeft === item 
                ? 'bg-yellow-500 border-yellow-400 text-indigo-900 scale-105 shadow-lg' 
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {rightItems.map(item => {
          const isMatched = Object.values(matches).includes(item);
          return (
            <button
              key={item}
              onClick={() => handleRightClick(item)}
              className={`w-full p-4 rounded-xl border-2 transition-all text-sm font-medium ${
                isMatched 
                  ? 'bg-green-500/20 border-green-500 opacity-50 cursor-default text-green-200' 
                  : wrongMatch === item
                  ? 'bg-red-500 border-red-400 animate-shake'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
};
