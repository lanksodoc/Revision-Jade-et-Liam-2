
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { GradeSelector } from './components/GradeSelector';
import { SubjectSelector } from './components/SubjectSelector';
import { QuizGame } from './components/QuizGame';
import { generateQuizQuestions } from './services/geminiService';
import { Grade, Subject, Question, UserResult } from './types';

const App: React.FC = () => {
  const [grade, setGrade] = useState<Grade | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [results, setResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [showReview, setShowReview] = useState(false);

  const handleSelectGrade = (selectedGrade: Grade) => {
    setGrade(selectedGrade);
  };

  const handleSelectSubject = async (selectedSubject: Subject) => {
    if (!grade) return;
    setSubject(selectedSubject);
    setLoading(true);
    setResults([]);
    setShowReview(false);
    
    try {
      const generatedQuestions = await generateQuizQuestions(grade, selectedSubject);
      setQuestions(generatedQuestions);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setGrade(null);
    setSubject(null);
    setQuestions([]);
    setScore(null);
    setResults([]);
    setShowReview(false);
  };

  const renderContent = () => {
    if (score !== null) {
      if (showReview) {
        return (
          <div className="space-y-8 animate-fadeIn max-w-2xl mx-auto">
            <div className="flex items-center justify-between sticky top-20 bg-indigo-900/80 backdrop-blur-md p-4 rounded-xl z-10 border border-white/10 shadow-lg">
              <h2 className="text-2xl font-black text-yellow-500 uppercase italic">Révision du Quiz</h2>
              <button 
                onClick={() => setShowReview(false)}
                className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-bold transition-all"
              >
                Retour au score
              </button>
            </div>

            <div className="space-y-6 pb-20">
              {results.map((res, index) => (
                <div key={res.question.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                  <div className={`p-4 font-black flex justify-between items-center ${res.isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    <span>Question {index + 1}</span>
                    <span>{res.isCorrect ? 'CORRECT' : 'INCORRECT'}</span>
                  </div>
                  <div className="p-6 space-y-4">
                    <p className="text-xl font-bold text-white">{res.question.text}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                        <span className="block text-white/40 uppercase font-black text-[10px] mb-1">Ta réponse</span>
                        <span className={`font-bold ${res.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                          {res.userAnswer || "Aucune réponse"}
                        </span>
                      </div>
                      {!res.isCorrect && (
                        <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                          <span className="block text-white/40 uppercase font-black text-[10px] mb-1">Réponse attendue</span>
                          <span className="font-bold text-green-400">
                            {res.question.type === 'QCM' ? res.question.correctAnswer : res.question.acceptedAnswers?.[0]}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="bg-indigo-500/10 p-4 rounded-xl border-l-4 border-indigo-500">
                      <p className="text-sm italic text-blue-100/90 leading-relaxed">
                        <span className="font-black text-indigo-400 block mb-1 uppercase text-[10px]">L'explication de Gemini :</span>
                        {res.question.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-full py-4 bg-yellow-500 text-indigo-900 font-black rounded-xl uppercase shadow-lg shadow-yellow-500/20 mb-8"
            >
              Remonter en haut ↑
            </button>
          </div>
        );
      }

      const maxPossibleCorrect = questions.length;
      const rankThreshold = questions.length * 100;
      
      let message = "Tu es en bonne voie, futur champion !";
      let rank = "Apprenti";
      let emoji = "🌟";

      if (score >= questions.length * 200) {
         message = "Performance exceptionnelle ! Tu as été foudroyant !";
         rank = "Grand Maître";
         emoji = "🏆";
      } else if (score >= questions.length * 100) {
         message = "Très bon score ! Tu maîtrises bien ton sujet.";
         rank = "Expert";
         emoji = "💎";
      }

      return (
        <div className="text-center space-y-8 animate-fadeIn max-w-lg mx-auto">
          <div className="relative inline-block">
             <div className="text-9xl mb-4 drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]">{emoji}</div>
             <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-indigo-900 text-sm font-black px-6 py-1 rounded-full uppercase tracking-widest shadow-lg">
                {rank}
             </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-yellow-500">
              Défi Terminé !
            </h2>
            <p className="text-xl text-blue-200">{message}</p>
          </div>

          <div className="bg-white/5 border border-white/10 p-8 rounded-3xl shadow-inner relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
               <span className="text-xs font-black text-green-400 bg-green-500/10 px-3 py-1 rounded-full">
                {results.filter(r => r.isCorrect).length} / {questions.length} Correctes
               </span>
            </div>
            <div className="text-sm uppercase font-black text-blue-300 tracking-[0.2em] mb-2">Score de Champion</div>
            <div className="text-7xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              {score}
            </div>
            <div className="mt-4 text-xs text-white/40 italic">
              Points cumulés (Justesse + Rapidité)
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-8">
            <button
              onClick={() => setShowReview(true)}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg border border-indigo-400/30"
            >
              📝 Revoir mes réponses & explications
            </button>
            <button
              onClick={() => { setScore(null); handleSelectSubject(subject!); }}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
            >
              🔄 Rejouer la matière
            </button>
            <button
              onClick={handleRestart}
              className="px-8 py-3 text-white/60 hover:text-white font-bold transition-all text-sm"
            >
              🏠 Retourner à l'accueil
            </button>
          </div>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
          <div className="relative">
            <div className="w-24 h-24 border-8 border-yellow-500 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(234,179,8,0.2)]"></div>
            <div className="absolute inset-0 flex items-center justify-center font-black text-yellow-500">AI</div>
          </div>
          <h2 className="text-2xl font-black text-yellow-500 mt-8 uppercase tracking-widest">Génération du Défi...</h2>
          <p className="text-blue-200 mt-2 font-medium">L'IA Gemini prépare ton quiz personnalisé.</p>
        </div>
      );
    }

    if (subject && questions.length > 0) {
      return (
        <QuizGame 
          questions={questions} 
          onFinish={(finalScore, finalResults) => {
            setScore(finalScore);
            setResults(finalResults);
          }} 
          onQuit={handleRestart} 
        />
      );
    }

    if (grade) {
      return (
        <SubjectSelector 
          onSelect={handleSelectSubject} 
          onBack={() => setGrade(null)} 
        />
      );
    }

    return <GradeSelector onSelect={handleSelectGrade} />;
  };

  return (
    <Layout>
      {renderContent()}
    </Layout>
  );
};

export default App;
