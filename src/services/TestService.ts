import { Asignatura, Test, Pregunta } from '../types';
import { StorageService } from './StorageService';
import subjectsData from '../data/subjects.json';
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

    // Fallback: Use bundled data from split json files
    // This combines data from multiple source files
    const initialData: Asignatura[] = Array.isArray(subjectsData) 
      ? (subjectsData as unknown as Asignatura[]) 
      : ((subjectsData as any).asignaturas as Asignatura[]) || [];
    
    if (initialData && initialData.length > 0) {
        StorageService.saveAsignaturas(initialData); 
        return initialData;
    }

    return [];
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
