# Diseño de Páginas - TestMaker App

## 1. Flujo de Usuario
`Home` -> `Selección Test` -> `Configuración` -> `Test Runner` -> `Resultados`

## 2. Detalle de Pantallas

### 2.1 Pantalla Inicial (Home)
- **Header**: Logo y Título "TestMaker".
- **Contenido**:
  - Grid de tarjetas de "Asignaturas".
  - Botón flotante o menú para "Importar JSON".
- **Interacción**: Click en asignatura navega a `Selección Test`.

### 2.2 Selección de Test & Configuración
- **Header**: Breadcrumb (Inicio > Asignatura).
- **Contenido**:
  - Lista de Tests disponibles.
  - Al seleccionar un test, despliega opciones (Modal o Acordeón):
    - Selector "Número de preguntas" (Slider o Input).
    - Toggle "Modo Infinito".
    - Toggle "Ver respuestas inmediatamente".
  - Botón "Comenzar Test".

### 2.3 Pantalla de Test (Runner)
- **Top Bar**:
  - Barra de progreso.
  - Temporizador (si activo).
  - Botón "Salir" (con confirmación).
- **Centro**:
  - Enunciado de la pregunta (Tipografía grande).
  - Lista de opciones (Radio/Checkbox).
  - Botón "Comprobar" (si feedback inmediato está activo).
- **Bottom Bar**:
  - Botones "Anterior" y "Siguiente".
  - Botón "Finalizar" (en la última pregunta).

### 2.4 Pantalla de Resultados
- **Resumen**:
  - Gráfico circular de puntuación.
  - Texto "X de Y correctas".
- **Detalle**:
  - Lista filtrable: "Todas", "Incorrectas".
  - Al expandir una incorrecta, muestra la respuesta marcada y la correcta.
- **Acciones**:
  - Botón "Repetir Test".
  - Botón "Volver al Inicio".
