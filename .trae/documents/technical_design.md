# Diseño Técnico - TestMaker App

## 1. Arquitectura
- **Frontend**: React 18+ con TypeScript.
- **Build Tool**: Vite.
- **Estilos**: Tailwind CSS.
- **Estado Global**: React Context API (o Zustand si se prefiere simplicidad, pero el requisito pide Context).
- **Enrutamiento**: React Router v6.
- **Persistencia**: LocalStorage Wrapper / Servicio de Persistencia.

## 2. Modelos de Datos (TypeScript Interfaces)

```typescript
export interface Opcion {
  id: string;
  texto: string;
}

export interface Pregunta {
  id: string;
  enunciado: string;
  tipo: 'unica' | 'multiple';
  opciones: Opcion[];
  respuestaCorrecta: string[]; // IDs de las opciones correctas
  explicacion?: string; // Opcional para feedback
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
  testId: string;
  fecha: number;
  aciertos: number;
  totalPreguntas: number;
  respuestasUsuario: Record<string, string[]>; // preguntaId -> opcionesSeleccionadas
}
```

## 3. Estructura de Componentes
- `App`: Provider global y Router.
- `Layout`: Estructura base (Header, Main, Footer).
- `pages/`:
  - `Home`: Selector de Asignaturas.
  - `SubjectDetails`: Lista de tests de la asignatura.
  - `TestConfig`: Configuración antes de iniciar.
  - `TestRunner`: La pantalla del test activo.
  - `Results`: Pantalla de resultados.
- `components/`:
  - `QuestionCard`: Renderiza una pregunta (Single/Multiple).
  - `Timer`: Componente de temporizador.
  - `ProgressBar`: Progreso del test.
  - `SubjectCard`: Tarjeta de asignatura.

## 4. Servicios
- `TestService`:
  - `getSubjects()`
  - `getTestById(id)`
  - `saveTestResult(result)`
  - `importTests(json)`
- `StorageService`: Abstracción sobre LocalStorage.

## 5. Estado Global (Context)
- `AppContext`:
  - `currentSubject`: Asignatura seleccionada.
  - `currentTest`: Test en curso.
  - `testConfig`: Configuración actual (modo, número de preguntas).
  - `userAnswers`: Respuestas temporales durante el test.
