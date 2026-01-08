import { Asignatura, Test, Pregunta } from '../types';
import { StorageService } from './StorageService';
import parsedQuestions from '../data/questions.json';
import { ApiService } from './apiService';

export const TestService = {
  getInitialData: async (): Promise<Asignatura[]> => {
    // Try to fetch subjects from API
    try {
        const subjects = await ApiService.getSubjects();
        if (subjects && subjects.length > 0) {
            StorageService.saveAsignaturas(subjects);
            return subjects;
        }
    } catch (e) {
        console.warn('Could not fetch subjects from API', e);
    }

    // Fallback: Legacy logic (construct from questions)
    let questions: Pregunta[] = [];
    try {
        const apiQuestions = await ApiService.getQuestions();
        if (apiQuestions && apiQuestions.length > 0) {
            questions = apiQuestions;
        }
    } catch (e) {
        console.warn('Could not fetch questions from API, using bundled data', e);
    }

    if (questions.length === 0) {
        questions = parsedQuestions as Pregunta[];
    }
    
    const defaultTest: Test = {
      id: 'test-1',
      titulo: 'Test de Enginyeria de Requisits',
      descripcion: 'Preguntas completas del examen',
      preguntas: questions
    };

    const defaultSubject: Asignatura = {
      id: 'sub-1',
      nombre: 'Enginyeria de Requisits',
      tests: [defaultTest]
    };

    const initialData = [defaultSubject];
    StorageService.saveAsignaturas(initialData); 
    return initialData;
  },

  getAsignaturas: (): Asignatura[] => {
    return StorageService.loadAsignaturas();
  },

  getTestById: (testId: string): Test | undefined => {
    const asignaturas = StorageService.loadAsignaturas();
    for (const sub of asignaturas) {
      const test = sub.tests.find(t => t.id === testId);
      if (test) return test;
    }
    return undefined;
  }
};
