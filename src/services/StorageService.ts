import { Asignatura, ResultadoTest } from '../types';

const STORAGE_KEYS = {
  ASIGNATURAS: 'testmaker_asignaturas',
  RESULTADOS: 'testmaker_resultados',
};

export const StorageService = {
  saveAsignaturas: (asignaturas: Asignatura[]) => {
    localStorage.setItem(STORAGE_KEYS.ASIGNATURAS, JSON.stringify(asignaturas));
  },

  loadAsignaturas: (): Asignatura[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ASIGNATURAS);
    return data ? JSON.parse(data) : [];
  },

  saveResultados: (resultados: ResultadoTest[]) => {
    localStorage.setItem(STORAGE_KEYS.RESULTADOS, JSON.stringify(resultados));
  },

  loadResultados: (): ResultadoTest[] => {
    const data = localStorage.getItem(STORAGE_KEYS.RESULTADOS);
    return data ? JSON.parse(data) : [];
  },

  clearAll: () => {
    localStorage.removeItem(STORAGE_KEYS.ASIGNATURAS);
    localStorage.removeItem(STORAGE_KEYS.RESULTADOS);
  }
};
