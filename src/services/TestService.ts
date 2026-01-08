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

    // Fallback: Use bundled data from subjects.json
    // This allows the CMS to update this file and the changes to be reflected after a rebuild
    // The data is wrapped in an object { asignaturas: [...] } for CMS compatibility
    const initialData = (subjectsData as any).asignaturas as Asignatura[];
    
    // If subjects.json is empty or invalid, we could have a failsafe here, 
    // but assuming the CMS writes valid JSON, this is fine.
    
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
