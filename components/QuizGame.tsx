
import React, { useState, useEffect, useCallback } from 'react';
import { Question, UserResult } from '../types';
import { MatchingExercise } from './MatchingExercise';

interface QuizGameProps {
  questions: Question[];
  onFinish: (score: number, results: UserResult[]) => void;
  onQuit: () => void;
}

export const QuizGame: React.FC<QuizGameProps> = ({ questions, onFinish, onQuit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [lastBonus, setLastBonus] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [qrocValue, setQrocValue] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleNext = useCallback(() => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setQrocValue("");
      setIsCorrect(null);
      setTimeLeft(30);
      setShowExplanation(false);
      setLastBonus(0);
    } else {
      onFinish(score, userResults);
    }
  }, [currentIndex, questions.length, score, userResults, onFinish]);

  useEffect(() => {
    if (timeLeft <= 0 && !showExplanation) {
      handleValidate(false, "Temps écoulé"); 
    }

    if (timeLeft > 0 && !showExplanation) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, showExplanation]);

  const normalizeString = (str: string) => {
    let s = str.trim().toLowerCase();
    s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    s = s.replace(/^(le|la|les|un|une|des|du|de)\s+/g, "");
    s = s.replace(/^(l'|d')/g, "");
    return s.trim();
  };

  const handleValidate = (correct: boolean, userAnswer: string) => {
    setIsCorrect(correct);
    if (correct) {
      const speedBonus = timeLeft * 10;
      const points = 100 + speedBonus;
      setScore(prev => prev + points);
      setLastBonus(speedBonus);
    }
    
    setUserResults(prev => [...prev, {
      question: currentQuestion,
      userAnswer: userAnswer,
      isCorrect: correct
    }]);
    
    setShowExplanation(true);
  };

  const handleQcmSelect = (option: string) => {
    if (showExplanation) return;
    setSelectedAnswer(option);
    handleValidate(option === currentQuestion.correctAnswer, option);
  };

  const handleQrocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showExplanation || !qrocValue.trim()) return;
    
    const normalizedInput = normalizeString(qrocValue);
    const isOk = currentQuestion.acceptedAnswers?.some(ans => 
      normalizeString(ans) === normalizedInput
    );
    handleValidate(!!isOk, qrocValue);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-fadeIn">
      <div className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
        <button 
          onClick={onQuit}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors group flex items-center gap-2"
          title="Retourner à l'accueil"
        >
          <span className="text-xl">🏠</span>
          <span className="hidden md:inline text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Quitter</span>
        </button>
        
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase text-blue-300 font-black tracking-widest">Question</span>
          <span className="text-lg font-black text-white">{currentIndex + 1} / {questions.length}</span>
        </div>

        <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-full border-4 shadow-lg transition-colors ${timeLeft < 7 ? 'text-red-500 border-red-500 animate-pulse' : 'text-yellow-400 border-yellow-400'}`}>
          <span className="text-xl font-black">{timeLeft}</span>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase text-green-400 font-black tracking-widest">Points</span>
          <div className="text-xl font-black text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]">{score}</div>
        </div>
      </div>

      <div className="bg-white/10 rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl relative overflow-hidden min-h-[380px] flex flex-col justify-center backdrop-blur-sm">
        <div className="absolute top-0 left-0 w-full h-1 bg-white/5 overflow-hidden">
           <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${(timeLeft/30)*100}%` }} />
        </div>

        <h3 className="text-xl md:text-2xl font-bold leading-relaxed mb-8 text-center drop-shadow-sm">
          {currentQuestion.text}
        </h3>

        {currentQuestion.type === 'QCM' && (
          <div className="grid grid-cols-1 gap-3">
            {currentQuestion.options?.map((option, idx) => {
              let stateClass = "bg-white/5 border-white/10 hover:bg-white/20 hover:scale-[1.02]";
              if (showExplanation) {
                if (option === currentQuestion.correctAnswer) stateClass = "bg-green-500 border-green-400 text-indigo-900 font-bold scale-[1.02] shadow-lg shadow-green-500/20";
                else if (option === selectedAnswer) stateClass = "bg-red-500 border-red-400 text-white font-bold opacity-100";
                else stateClass = "opacity-40 grayscale pointer-events-none";
              }
              return (
                <button
                  key={idx}
                  disabled={showExplanation}
                  onClick={() => handleQcmSelect(option)}
                  className={`flex items-center p-4 rounded-2xl border-2 transition-all text-left ${stateClass}`}
                >
                  <span className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center mr-4 font-black shrink-0">{String.fromCharCode(65 + idx)}</span>
                  <span className="text-base md:text-lg">{option}</span>
                </button>
              );
            })}
          </div>
        )}

        {currentQuestion.type === 'QROC' && (
          <form onSubmit={handleQrocSubmit} className="space-y-4">
            <input
              type="text"
              autoFocus
              disabled={showExplanation}
              value={qrocValue}
              onChange={(e) => setQrocValue(e.target.value)}
              placeholder="Tape ta réponse ici..."
              className="w-full bg-black/30 border-2 border-white/20 rounded-2xl p-5 text-xl text-center focus:border-yellow-500 outline-none transition-all placeholder:text-white/20 shadow-inner"
            />
            {!showExplanation && (
              <button 
                type="submit"
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-500/30"
              >
                Valider ma réponse
              </button>
            )}
            {showExplanation && (
              <div className={`p-4 rounded-2xl text-center font-bold text-lg ${isCorrect ? 'bg-green-500 text-indigo-900' : 'bg-red-500 text-white'}`}>
                {isCorrect ? "Bravo !" : `La réponse était : ${currentQuestion.acceptedAnswers?.[0]}`}
              </div>
            )}
          </form>
        )}

        {currentQuestion.type === 'MATCHING' && currentQuestion.pairs && (
          <MatchingExercise 
            pairs={currentQuestion.pairs} 
            onComplete={() => handleValidate(true, "Exercice réussi")} 
          />
        )}
      </div>

      {showExplanation && (
        <div className="animate-slideUp bg-indigo-900/90 backdrop-blur-xl p-6 rounded-2xl border border-blue-400/30 shadow-2xl space-y-4">
          {isCorrect && lastBonus > 0 && (
            <div className="flex justify-center">
              <span className="bg-yellow-500 text-indigo-900 text-xs font-black px-4 py-1 rounded-full uppercase animate-bounce shadow-lg">
                🚀 Bonus Vitesse : +{lastBonus} pts
              </span>
            </div>
          )}
          
          <div className="flex items-start gap-4">
            <div className="text-4xl animate-pulse">👨‍🏫</div>
            <div>
              <p className="font-black text-yellow-400 mb-1 uppercase text-xs tracking-widest">Le Saviez-vous ?</p>
              <p className="text-white/90 leading-relaxed text-sm md:text-base italic">{currentQuestion.explanation}</p>
            </div>
          </div>
          
          <button
            onClick={handleNext}
            className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-indigo-900 font-black rounded-xl uppercase transition-transform active:scale-95 shadow-xl shadow-yellow-500/40 text-lg"
          >
            {currentIndex + 1 === questions.length ? "Voir mon score final" : "Question Suivante →"}
          </button>
        </div>
      )}
    </div>
  );
};
