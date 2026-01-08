import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Asignatura, Test, TestConfig, ResultadoTest } from '../types';

interface AppState {
  asignaturas: Asignatura[];
  currentSubject: Asignatura | null;
  currentTest: Test | null;
  testConfig: TestConfig;
  userAnswers: Record<string, string[]>;
  resultados: ResultadoTest[];
}

interface AppContextType extends AppState {
  setAsignaturas: (asignaturas: Asignatura[]) => void;
  selectSubject: (subjectId: string) => void;
  selectTest: (testId: string) => void;
  updateTestConfig: (config: Partial<TestConfig>) => void;
  startTest: () => void;
  submitAnswer: (questionId: string, answerIds: string[]) => void;
  finishTest: (activeQuestions: { id: string, respuestaCorrecta: string[] }[]) => void;
  resetTest: () => void;
  loadResultados: (resultados: ResultadoTest[]) => void;
}

const defaultConfig: TestConfig = {
  numPreguntas: 20,
  modoInfinito: false,
  mostrarResultadosInmediatos: false,
  shuffleQuestions: false,
  modoBloques: false,
  bloquesSeleccionados: [],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [currentSubject, setCurrentSubject] = useState<Asignatura | null>(null);
  const [currentTest, setCurrentTest] = useState<Test | null>(null);
  const [testConfig, setTestConfig] = useState<TestConfig>(defaultConfig);
  const [userAnswers, setUserAnswers] = useState<Record<string, string[]>>({});
  const [resultados, setResultados] = useState<ResultadoTest[]>([]);

  const selectSubject = (subjectId: string) => {
    const subject = asignaturas.find(a => a.id === subjectId) || null;
    setCurrentSubject(subject);
    setCurrentTest(null); // Reset test selection when changing subject
  };

  const selectTest = (testId: string) => {
    if (!currentSubject) return;
    const test = currentSubject.tests.find(t => t.id === testId) || null;
    setCurrentTest(test);
    setUserAnswers({}); // Reset answers
  };

  const updateTestConfig = (config: Partial<TestConfig>) => {
    setTestConfig(prev => ({ ...prev, ...config }));
  };

  const startTest = () => {
    // Logic to prepare test (shuffle, limit questions) could be here or in the runner
    setUserAnswers({});
  };

  const submitAnswer = (questionId: string, answerIds: string[]) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answerIds
    }));
  };

  const finishTest = (activeQuestions: { id: string, respuestaCorrecta: string[] }[]) => {
    if (!currentTest || !currentSubject) return;

    // Calculate score based on active questions
    let correctCount = 0;
    activeQuestions.forEach(q => {
      const userAnswer = userAnswers[q.id];
      // If unanswered, it's incorrect (or 0 points)
      if (!userAnswer) return;
      
      // Simple equality check for arrays
      const isCorrect = 
        userAnswer.length === q.respuestaCorrecta.length &&
        userAnswer.every(id => q.respuestaCorrecta.includes(id));
      
      if (isCorrect) correctCount++;
    });

    // Initial values (will be overwritten if infinite mode)
    const newResult: ResultadoTest = {
      id: Date.now().toString(),
      testId: currentTest.id,
      testTitulo: currentTest.titulo,
      asignaturaId: currentSubject.id,
      fecha: Date.now(),
      aciertos: correctCount,
      totalPreguntas: activeQuestions.length,
      preguntasIds: activeQuestions.map(q => q.id),
      respuestasUsuario: { ...userAnswers }
    };
    
    // Fix total for infinite mode
    if (testConfig.modoInfinito) {
        // Count how many questions user actually interacted with
        const answeredIds = Object.keys(userAnswers).filter(id => activeQuestions.some(q => q.id === id));
        newResult.totalPreguntas = answeredIds.length > 0 ? answeredIds.length : 1; // Avoid 0 division
        
        // Update preguntasIds to only include relevant ones for display
        newResult.preguntasIds = answeredIds;
        // Filter answers to only include relevant ones
        const filteredAnswers: Record<string, string[]> = {};
        answeredIds.forEach(id => {
            if (userAnswers[id]) {
                filteredAnswers[id] = userAnswers[id];
            }
        });
        newResult.respuestasUsuario = filteredAnswers;

        // Re-calculate for infinite
        correctCount = 0;
        answeredIds.forEach(id => {
            const q = activeQuestions.find(q => q.id === id);
            if (q) {
                const userAnswer = userAnswers[id];
                const isCorrect = userAnswer.length === q.respuestaCorrecta.length &&
                                userAnswer.every(optId => q.respuestaCorrecta.includes(optId));
                if (isCorrect) correctCount++;
            }
        });
        newResult.aciertos = correctCount;
    }

    setResultados(prev => [newResult, ...prev]);
    // Ideally save to persistence here
  };

  const resetTest = () => {
    setUserAnswers({});
  };

  const loadResultados = (results: ResultadoTest[]) => {
    setResultados(results);
  };

  return (
    <AppContext.Provider
      value={{
        asignaturas,
        currentSubject,
        currentTest,
        testConfig,
        userAnswers,
        resultados,
        setAsignaturas,
        selectSubject,
        selectTest,
        updateTestConfig,
        startTest,
        submitAnswer,
        finishTest,
        resetTest,
        loadResultados
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
