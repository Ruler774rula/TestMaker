import { Pregunta, Asignatura } from '../types';

const API_URL = '/api';

export const ApiService = {
  async getSubjects(): Promise<Asignatura[]> {
    try {
      const response = await fetch(`${API_URL}/subjects`);
      if (!response.ok) throw new Error('Failed to fetch subjects');
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  async saveSubjects(subjects: Asignatura[]): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/subjects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subjects),
      });
      return response.ok;
    } catch (error) {
      console.error(error);
      return false;
    }
  },

  async getQuestions(): Promise<Pregunta[]> {
    try {
      const response = await fetch(`${API_URL}/questions`);
      if (!response.ok) throw new Error('Failed to fetch questions');
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  async saveQuestions(questions: Pregunta[]): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questions),
      });
      return response.ok;
    } catch (error) {
      console.error(error);
      return false;
    }
  },

  async uploadImage(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to upload image');
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
};
