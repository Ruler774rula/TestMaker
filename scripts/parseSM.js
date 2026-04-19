import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const txtPath = path.resolve(__dirname, '../preguntasSM.txt');
const subjectsPath = path.resolve(__dirname, '../src/data/subjects.json');

const content = fs.readFileSync(txtPath, 'utf8').replace(/\r\n/g, '\n');

const tests = [];
let currentTest = null;
let currentQuestions = [];
let globalQId = 1;

const lines = content.split('\n');
let i = 0;

while (i < lines.length) {
  let line = lines[i].trim();
  
  if (!line) {
    i++;
    continue;
  }
  
  // Check for test title
  const titleMatch = line.match(/^===\s*(.*?)\s*===$/) || line.toUpperCase().startsWith('EXAMEN');
  if (titleMatch) {
    if (currentTest) {
      currentTest.preguntas = currentQuestions;
      tests.push(currentTest);
    }
    const testTitle = Array.isArray(titleMatch) ? `EXAMEN ${titleMatch[1]}` : line;
    currentTest = {
      id: `test-sm-${tests.length + 1}`,
      titulo: testTitle,
      descripcion: `Preguntas de ${testTitle}`,
      preguntas: []
    };
    currentQuestions = [];
    i++;
    continue;
  }
  
  // Check for question start
  const qMatch = line.match(/^(\d+)\.\s+(.*)/);
  if (qMatch) {
    let enunciado = qMatch[2];
    i++;
    
    // Read multiline enunciado if any, until options start
    while (i < lines.length && !lines[i].trim().match(/^[a-e]\)/i) && !lines[i].trim().startsWith('Respuesta correcta:')) {
      if (lines[i].trim()) {
        enunciado += ' ' + lines[i].trim();
      }
      i++;
    }
    
    // Read options
    const opciones = [];
    while (i < lines.length && lines[i].trim().match(/^[a-e]\)/i)) {
      const optMatch = lines[i].trim().match(/^([a-e])\)\s+(.*)/i);
      if (optMatch) {
        opciones.push({
          id: optMatch[1].toLowerCase(),
          texto: optMatch[2]
        });
      }
      i++;
    }
    
    // Read answer
    let respuestaCorrecta = [];
    if (i < lines.length && lines[i].trim().startsWith('Respuesta correcta:')) {
      const ansMatch = lines[i].trim().match(/Respuesta correcta:\s*([a-e])/i);
      if (ansMatch) {
        respuestaCorrecta = [ansMatch[1].toLowerCase()];
      }
      i++;
    }
    
    currentQuestions.push({
      id: `q-sm-${globalQId++}`,
      enunciado,
      tipo: 'unica',
      opciones,
      respuestaCorrecta
    });
    continue;
  }
  
  i++;
}

if (currentTest) {
  currentTest.preguntas = currentQuestions;
  tests.push(currentTest);
}

const newSubject = {
  id: "sub-sm",
  nombre: "Sistemas Multimedia",
  tests: tests
};

const subjectsData = JSON.parse(fs.readFileSync(subjectsPath, 'utf8'));

// Check if SM already exists
const existingIdx = subjectsData.findIndex(s => s.id === 'sub-sm' || s.nombre === 'Sistemas Multimedia');
if (existingIdx >= 0) {
  subjectsData[existingIdx] = newSubject;
} else {
  subjectsData.push(newSubject);
}

fs.writeFileSync(subjectsPath, JSON.stringify(subjectsData, null, 2));
console.log(`Parsed ${tests.length} tests and ${globalQId - 1} questions for Sistemas Multimedia.`);
