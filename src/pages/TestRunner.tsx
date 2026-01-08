import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { QuestionCard } from '../components/QuestionCard';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

export const TestRunner: React.FC = () => {
  const { currentTest, testConfig, userAnswers, submitAnswer, finishTest } = useApp();
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [activeQuestions, setActiveQuestions] = useState<typeof currentTest.preguntas>([]);

  useEffect(() => {
    if (!currentTest) {
      navigate('/');
      return;
    }

    // Prepare questions based on config
    let questions: typeof currentTest.preguntas = [];

    if (testConfig.modoBloques) {
        // Filter by selected blocks
        // Assuming questions are ordered 1-60 and blocks are 1-6 (10 qs each)
        testConfig.bloquesSeleccionados.forEach(blockIdx => {
            const start = (blockIdx - 1) * 10;
            const end = start + 10;
            const blockQuestions = currentTest.preguntas.slice(start, end);
            questions = [...questions, ...blockQuestions];
        });
        // Do not shuffle in block mode? Or shuffle selected blocks content?
        // User asked "seleccionar los bloques que quiero que se me pregunten"
        // Usually block mode implies order, but maybe we want to shuffle within blocks?
        // Let's keep them ordered for now as per "blocks" implication, unless shuffle is enabled globally (which is hidden in UI for block mode but check logic)
        
        // Actually I hid shuffle option in Block Mode in UI. So defaults to false.
        
    } else {
        // Question Mode (Random)
        questions = [...currentTest.preguntas];
        // Always shuffle for "random mode" as requested: "preguntadas con orden aleatorio"
        questions = questions.sort(() => Math.random() - 0.5);
        
        if (!testConfig.modoInfinito) {
            questions = questions.slice(0, testConfig.numPreguntas);
        }
    }
    
    setActiveQuestions(questions);
  }, [currentTest, testConfig, navigate]);

  if (!currentTest || activeQuestions.length === 0) return null;

  const currentQuestion = activeQuestions[currentQuestionIndex];
  const currentAnswer = userAnswers[currentQuestion.id] || [];
  
  // Calculate progress
  const progress = ((currentQuestionIndex + 1) / activeQuestions.length) * 100;

  const handleNext = () => {
    if (currentQuestionIndex < activeQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    // If infinite mode, we only show questions up to the current one
    const questionsToShow = testConfig.modoInfinito 
      ? activeQuestions.slice(0, currentQuestionIndex + 1)
      : activeQuestions;
    
    finishTest(questionsToShow);
    navigate('/results');
  };

  const hasAnswered = currentAnswer.length > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="font-bold text-gray-700">
            Pregunta {currentQuestionIndex + 1} / {activeQuestions.length}
          </span>
        </div>
        <button 
          onClick={handleFinish}
          disabled={!hasAnswered && activeQuestions.length === 1} // Only disable if it's the only question and unanswered? Or always allow finish early?
          // User asked to prevent advancing without answer. Finish is "advancing" to results.
          // But maybe they want to quit early.
          // Let's stick to "impida avanzar" for Next button. For Finish, usually you can submit whatever you have.
          // But if it's the last question (which replaces Next with Finish), it should probably be disabled too.
          className="text-sm font-medium text-red-600 hover:text-red-700 px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
        >
          Finalizar Test
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Question */}
      <QuestionCard 
        question={currentQuestion}
        selectedAnswers={currentAnswer}
        onAnswerChange={(answers) => submitAnswer(currentQuestion.id, answers)}
        showFeedback={testConfig.mostrarResultadosInmediatos && currentAnswer.length > 0}
      />

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          onClick={handlePrev}
          disabled={currentQuestionIndex === 0}
          className="flex items-center px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm font-medium transition-all"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Anterior
        </button>

        {currentQuestionIndex === activeQuestions.length - 1 ? (
          <button
            onClick={handleFinish}
            disabled={!hasAnswered}
            className="flex items-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow-md shadow-green-200 font-bold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            Finalizar
            <CheckCircle className="w-5 h-5 ml-2" />
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!hasAnswered}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md shadow-blue-200 font-bold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            Siguiente
            <ChevronRight className="w-5 h-5 ml-2" />
          </button>
        )}
      </div>
    </div>
  );
};
