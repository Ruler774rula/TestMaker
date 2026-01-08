# Documento de Requisitos - TestMaker App

## 1. Introducción
Desarrollo de una aplicación web completa para la realización de tests de autoevaluación, con soporte para múltiples asignaturas, configuración flexible y persistencia local.

## 2. Funcionalidades Principales

### 2.1 Gestión de Tests
- **Selección de Asignatura**: El usuario debe poder elegir entre diferentes asignaturas disponibles.
- **Selección de Test**: Dentro de una asignatura, el usuario puede seleccionar tests específicos.
- **Configuración de Test**:
  - Número de preguntas: Fijo (1-50) o Modo Infinito.
  - Modo de respuesta: Feedback inmediato o al finalizar.

### 2.2 Realización del Test
- **Visualización**: Pantalla completa para minimizar distracciones.
- **Tipos de Pregunta**:
  - Selección única (Radio buttons).
  - Selección múltiple (Checkboxes).
- **Temporizador**: Opcional (visible durante el test).

### 2.3 Resultados y Estadísticas
- **Feedback Inmediato**: (Opcional) Mostrar si la respuesta es correcta/incorrecta al momento.
- **Resumen Final**:
  - Puntuación total.
  - Listado de respuestas incorrectas con la solución correcta.
  - Estadísticas básicas.

### 2.4 Gestión de Datos
- **Persistencia**: Guardado local de progreso y resultados (LocalStorage/IndexedDB).
- **Importación/Exportación**: Capacidad de importar y exportar tests en formato JSON.

## 3. Requisitos No Funcionales
- **Interfaz**: Diseño responsive (Mobile-first).
- **Accesibilidad**: Cumplimiento WCAG AA.
- **Rendimiento**: Carga rápida y transiciones fluidas.
- **Tecnología**: React + TypeScript.
