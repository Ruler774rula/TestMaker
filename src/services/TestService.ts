import { Asignatura, Test, Pregunta } from '../types';
import { StorageService } from './StorageService';
import parsedQuestions from '../data/questions.json';
import { ApiService } from './apiService';

export const TestService = {
  getInitialData: async (): Promise<Asignatura[]> => {
    // Try to fetch updated questions from API (server)
    let questions: Pregunta[] = [];
    try {
        const apiQuestions = await ApiService.getQuestions();
        if (apiQuestions && apiQuestions.length > 0) {
            questions = apiQuestions;
        }
    } catch (e) {
        console.warn('Could not fetch from API, using bundled data', e);
    }

    if (questions.length === 0) {
        questions = parsedQuestions as Pregunta[];
    }
    
    // Check storage? 
    // If we want to enforce server data over local storage, we should prioritize server.
    // But user progress is in local storage? No, progress is in results.
    // Asignaturas structure is in storage.
    // If we change questions in editor, we want them to appear in the app.
    // So we should rebuild the "defaultSubject" with new questions.

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
    StorageService.saveAsignaturas(initialData); // Update storage
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
