
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { GradeSelector } from './components/GradeSelector';
import { SubjectSelector } from './components/SubjectSelector';
import { QuizGame } from './components/QuizGame';
import { generateQuizQuestions } from './services/geminiService';
import { Grade, Subject, Question } from './types';

const App: React.FC = () => {
  const [grade, setGrade] = useState<Grade | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const handleSelectGrade = (selectedGrade: Grade) => {
    setGrade(selectedGrade);
  };

  const handleSelectSubject = async (selectedSubject: Subject) => {
    if (!grade) return;
    setSubject(selectedSubject);
    setLoading(true);
    
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
  };

  const renderContent = () => {
    if (score !== null) {
      // Numerical score logic
      const maxPossibleCorrect = questions.length;
      // We assume average correct response with some bonus is around 150 points.
      // 100 base + (average 15s bonus * 10) = 250 points max per question approx.
      const maxPossiblePoints = maxPossibleCorrect * 400; 
      const efficiency = (score / maxPossiblePoints) * 100;

      let message = "Tu es en bonne voie, futur champion !";
      let rank = "Apprenti";
      if (score >= questions.length * 200) {
         message = "Performance exceptionnelle ! Tu as été très rapide !";
         rank = "Grand Maître";
      } else if (score >= questions.length * 100) {
         message = "Très bon score ! Tu connais bien ton sujet.";
         rank = "Expert";
      }

      return (
        <div className="text-center space-y-8 animate-fadeIn max-w-lg mx-auto">
          <div className="relative inline-block">
             <div className="text-9xl mb-4 drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]">🏆</div>
             <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-indigo-900 text-sm font-black px-6 py-1 rounded-full uppercase tracking-widest shadow-lg">
                {rank}
             </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-yellow-500">
              Quiz Terminé !
            </h2>
            <p className="text-xl text-blue-200">{message}</p>
          </div>

          <div className="bg-white/5 border border-white/10 p-8 rounded-3xl shadow-inner">
            <div className="text-sm uppercase font-black text-blue-300 tracking-[0.2em] mb-2">Score Total</div>
            <div className="text-7xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              {score}
            </div>
            <div className="mt-4 text-xs text-white/40 italic">
              Points basés sur la justesse et la rapidité
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-8">
            <button
              onClick={() => { setScore(null); handleSelectSubject(subject!); }}
              className="px-8 py-5 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 active:scale-95"
            >
              🔄 Relever le défi à nouveau
            </button>
            <button
              onClick={handleRestart}
              className="px-8 py-4 text-white/60 hover:text-white font-bold transition-all"
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
          <p className="text-blue-200 mt-2 font-medium">Gemini prépare tes questions d'Histoire du Burkina.</p>
        </div>
      );
    }

    if (subject && questions.length > 0) {
      return <QuizGame questions={questions} onFinish={(finalScore) => setScore(finalScore)} onQuit={handleRestart} />;
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
