export interface Opcion {
  id: string;
  texto: string;
}

export interface Pregunta {
  id: string;
  enunciado: string;
  tipo: 'unica' | 'multiple';
  opciones: Opcion[];
  respuestaCorrecta: string[]; // IDs of the correct options
  explicacion?: string; // Optional feedback explanation
  imagenUrl?: string; // Optional image URL
  bloque?: string; // Optional block identifier
}

export interface Test {
  id: string;
  titulo: string;
  descripcion?: string;
  preguntas: Pregunta[];
}

export interface Asignatura {
  id: string;
  nombre: string;
  tests: Test[];
}

export interface ResultadoTest {
  id: string;
  testId: string;
  testTitulo: string;
  asignaturaId: string;
  fecha: number;
  aciertos: number;
  totalPreguntas: number;
  preguntasIds: string[]; // IDs of the questions used in this session
  respuestasUsuario: Record<string, string[]>; // questionId -> selectedOptionIds
  tiempoEmpleado?: number; // seconds
}

export interface TestConfig {
  numPreguntas: number; // 0 for infinite/all
  modoInfinito: boolean;
  mostrarResultadosInmediatos: boolean;
  shuffleQuestions: boolean;
  modoBloques: boolean; // New mode for blocks
  bloquesSeleccionados: number[]; // Indices of selected blocks (0-5)
}
